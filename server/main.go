package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

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

func GetBySearch(db *bun.DB, ctx context.Context, searchText string) (ListWithTotal[Data], error) {
	var data []Data
	total, err := db.NewSelect().TableExpr("sample_data as s").Where("s.name LIKE ?", "%"+searchText+"%").ScanAndCount(ctx, &data)
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

	resp, err := GetBySearch(db, r.Context(), searchText)
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
