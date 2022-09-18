# udfire

ระบบติดตามเชื้อเพลิงจากข้อมูล  NDVI

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
docker run --rm -it --name pmodis -v $(pwd)/pymodis:/app/pymodis cmu_udfire-pymodis bash
docker run --rm -it --name pmodis -v $(pwd)/flaskapi:/app/flaskapi -p 3100:3100 cmu_udfire-pymodis bash

docker run --rm -it --name pmodis -v $(pwd)/flaskapi:/app/flaskapi -v $(pwd)/pymodis/ndvi_clip/:/app/flaskapi/ndvi_clip -v $(pwd)/pymodis/ndwi_clip/:/app/flaskapi/ndwi_clip/ -v $(pwd)/pymodis/ndmi_clip/:/app/flaskapi/ndmi_clip/  -p 3200:3200 cmu_udfire-pymodis bash
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

geoserver
```
https://gis.stackexchange.com/questions/6479/programming-geoserver-2-0-2-to-add-a-raster-data-store-and-layer-without-the-ui
```
Create the workspace.
```
curl -u admin:geoserver -v -XPOST -H 'Content-type: text/xml' \
     -d '<workspace><name>wsgeotiff</name></workspace>' \
     http://localhost:8080/geoserver/rest/workspaces
```

Then create the datastore
```
curl -u admin:geoserver -v -XPOST -H 'Content-type: text/xml' \
     -d '<coverageStore>
         <name>wsgeotiff_imageGeoTiffWGS84_1298678792699</name>
         <workspace>wsgeotiff</workspace>
         <enabled>true</enabled>
         <type>GeoTIFF</type>
         <url>/home/gis/image_wgs84.tif</url>
         </coverageStore>' \
     "http://localhost:8080/geoserver/rest/workspaces/wsgeotiff/coveragestores?configure=all"
```
Then create the Layer.
```
curl -u admin:geoserver -v -XPOST -H 'Content-type: text/xml' \
      -d '<coverage>
          <name>imageGeoTiffWGS84</name>
          <title>imageGeoTiffWGS84</title>
          <nativeCRS>GEOGCS[&quot;WGS 84&quot;,DATUM[&quot;World Geodetic System 1984&quot;,SPHEROID[&quot;WGS 84&quot;,6378137.0, 298.257223563, AUTHORITY[&quot;EPSG&quot;,&quot;7030&quot;]],AUTHORITY[&quot;EPSG&quot;,&quot;6326&quot;]],PRIMEM[&quot;Greenwich&quot;, 0.0, AUTHORITY[&quot;EPSG&quot;,&quot;8901&quot;]],UNIT[&quot;degree&quot;, 0.017453292519943295],AXIS[&quot;Geodetic longitude&quot;, EAST],AXIS[&quot;Geodetic latitude&quot;, NORTH],AUTHORITY[&quot;EPSG&quot;,&quot;4326&quot;]]</nativeCRS>
          <srs>EPSG:4326</srs>
          <latLonBoundingBox><minx>-179.958</minx><maxx>-105.002</maxx><miny>-65.007</miny><maxy>65.007</maxy><crs>EPSG:4326</crs></latLonBoundingBox>
          </coverage>' \
      "http://localhost:8080/geoserver/rest/workspaces/wsgeotiff/coveragestores/wsgeotiff_imageGeoTiffWGS84_1298678792699/coverages"
```