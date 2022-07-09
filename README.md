# udfire

run docker
```
docker build --tag py_flask .


docker run --rm -it --name py_modis -v $(pwd)/flaskapi:/app/flaskapi -p 3200:3200 py_flask bash

```

