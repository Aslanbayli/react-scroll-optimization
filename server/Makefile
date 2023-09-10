dir=./migrations/
driver=postgres
dbstring="host=localhost user=postgres password=postgres dbname=react_scroll_optimization sslmode=disable"

create-migration:
	goose -dir $(dir) create $(name) sql

migrate-up:
	goose -dir $(dir) $(driver) $(dbstring) up

migrate-up-to:
	goose -dir $(dir) $(driver) $(dbstring) up-to $(version)

migrate-down:
	goose -dir $(dir) $(driver) $(dbstring) down

migrate-down-to:
	goose -dir $(dir) $(driver) $(dbstring) down-to $(version)