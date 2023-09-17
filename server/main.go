package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
)

type Data struct {
	ID   int    `bun:",pk" json:"id"`
	Name string `json:"name"`
}

type ListWithTotal[T any] struct {
	List  []T   `json:"data"`
	Total int64 `json:"total"`
}

func QueryParam(key string, r *http.Request) *string {
	if !r.URL.Query().Has(key) {
		return nil
	}
	param := r.URL.Query().Get(key)
	return &param
}

func ReadPaginationQueryParams(w http.ResponseWriter, r *http.Request) (limit int, offset int, ok bool) {
	errMap := make(map[string]string)

	limitRaw := QueryParam("limit", r)
	if limitRaw == nil {
		limit = 20
	} else if limitInt, err := strconv.Atoi(*limitRaw); err != nil {
		errMap["limit"] = "must be an integer between 1 and 100"
	} else {
		limit = limitInt
	}

	offsetRaw := QueryParam("offset", r)
	if offsetRaw == nil {
		offset = 0
	} else if offsetInt, err := strconv.Atoi(*offsetRaw); err != nil {
		errMap["offset"] = "must be an integer greater than 0"
	} else {
		offset = offsetInt
	}

	if len(errMap) > 0 {
		return 0, 0, false
	}

	return limit, offset, true
}

func GetBySearch(db *bun.DB, ctx context.Context, searchText string, limit, offset int) (ListWithTotal[Data], error) {
	var data []Data

	query := db.NewSelect().TableExpr("sample_data as s").Where("s.name LIKE ?", "%"+searchText+"%")
	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	total, err := query.ScanAndCount(ctx, &data)
	if err != nil {
		return ListWithTotal[Data]{}, fmt.Errorf("GetBySearch: %v", err)
	}

	return ListWithTotal[Data]{
		List:  data,
		Total: int64(total),
	}, nil
}

func Handler(db *bun.DB, w http.ResponseWriter, r *http.Request) {
	var searchText string
	searchTextParam := QueryParam("search_text", r)
	if searchTextParam != nil {
		searchText = *searchTextParam
	}

	limit, offset, ok := ReadPaginationQueryParams(w, r)
	if !ok {
		http.Error(w, "Couldn't read pagination params", http.StatusInternalServerError)
	}

	resp, err := GetBySearch(db, r.Context(), searchText, limit, offset)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}

func main() {
	sqlDB := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN("postgres://postgres:postgres@localhost:5432/react_scroll_optimization?sslmode=disable")))
	db := bun.NewDB(sqlDB, pgdialect.New(), bun.WithDiscardUnknownColumns())
	defer db.Close()

	r := chi.NewRouter()
	r.Use(cors.AllowAll().Handler)

	r.Get("/search", func(w http.ResponseWriter, r *http.Request) {
		Handler(db, w, r)
	})

	fmt.Println("Server started...")
	http.ListenAndServe(":8080", r)
}
