# udfire

docker build
```
docker build --tag pymodis .
```

docker run
```
docker run --rm -it --name py_modis -v $(pwd)/pyModis:/app/pyModis -v $(pwd)/flaskapi:/app/flaskapi -p 3200:3200 py_flask bash
```

docker login & logout
```
docker logout
docker login
```

tag & push
``` 
docker tag xxx sakdahomhuan/xxx
docker push sakdahomhuan/xxx:lates
```
