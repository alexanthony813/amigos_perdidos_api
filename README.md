docker run --name postgres-0 -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres:alpine

docker exec -it postgres-0 bash

psql -U postgres

https://trello.com/b/IAaBUBzM/amigos
