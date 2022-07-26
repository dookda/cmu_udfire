# udfire

docker compose run
```
docker-compose up -d
```

docker run
```
docker exec -it pymodis bash
```


docker build
```
docker build --tag pymodis .
```

docker run
```
docker run --rm -it --name pmodis -v $(pwd)/pymodis:/app/pymodis -v $(pwd)/flaskapi:/app/flaskapi -p 3200:3200 pymodis bash
```

docker login & logout
```
docker logout
docker login
```

tag & push
``` 
docker tag xxx sakdahomhuan/xxx
docker push sakdahomhuan/xxx:latestt
```
