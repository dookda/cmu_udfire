# udfire

docker build
```
docker build --tag pymodis .
```

docker run
```
docker run --rm -it --name pmodis -v $(pwd)/pyModis:/app/pyModis -v $(pwd)/flaskapi:/app/flaskapi -p 3200:3200 pymodis bash
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
