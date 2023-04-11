docker run --name postgres-0 -e POSTGRES_PASSWORD=password -d -p 5432:5432 postgres:alpine

docker exec -it postgres-0 bash

psql -U postgres

pending tasks:
- map for transposed data, maybe rendering fixed on Santiago
- authentication 
- finish homepage 
- validate inputs
- call owner feature
- finish detail view modal
- request to take down feature
- android tested and trello tickets for things that aren’t easy to fix
- deploy k8/docker/aws
- finish transitions/styling

non MVP:
- distinguish quiltros/por la calle!!!!
- migrations
- relational db
- contact other users via app so don't have to give number
- add pictures to posting of existing animal
- validate/sanitize api
