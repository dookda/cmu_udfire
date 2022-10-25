from math import log
import os
# from unicodedata import name
import psycopg2 as pg2
import requests
from datetime import date, timedelta, datetime
import numpy as np
from osgeo import gdal
from osgeo import gdal_array as ga
import schedule
import time

# db
from auth import earth, token, conn

host = conn["dbHost"]
db = conn["dbName"]
username = conn["dbUser"]
password = conn["dbPass"]
port = conn["dbPort"]
pg = pg2.connect(database=db, user=username,
                 password=password, host=host, port=port)
pg.autocommit = True
cursor = pg.cursor()

# earth explorer
username = earth["user"]
password = earth["pass"]

bbox = {"minx": 594799, "miny": 1895154, "maxx": 731907, "maxy": 2033687}


def removeFile(folder):
    dir = os.listdir(folder)
    for f in dir:
        os.remove(f'./{folder}/{f}')

    print(f'delete files from {folder}')


def addStore(file, indx, dd):
    try:
        cmd = f"curl -u admin:geoserver -v -XPOST -H 'Content-type: text/xml' -d '<coverageStore> <name>{indx}_{dd}</name> <workspace>indx</workspace> <enabled>true</enabled> <type>GeoTIFF</type> <url>{file}</url> </coverageStore>' 'http://geoserver:8080/geoserver/rest/workspaces/indx/coveragestores?configure=all' "
        print(cmd, "add store")
        os.system(cmd)

        cmd = f"curl -u admin:geoserver -v -XPOST -H 'Content-type: text/xml' -d '<coverage> <name>{indx}_{dd}</name> <title>{indx}_{dd}</title> <nativeCRS>GEOGCS['WGS84',DATUM['WGS_1984',SPHEROID['WGS84',6378137,298.257223563]],PRIMEM['Greenwich',0],UNIT['degree',0.0174532925199433,AUTHORITY['EPSG','9122']],AUTHORITY['EPSG','4326']],PROJECTION['Transverse_Mercator'],PARAMETER['latitude_of_origin',0],PARAMETER['central_meridian',99],PARAMETER['scale_factor',0.9996],PARAMETER['false_easting',500000],PARAMETER['false_northing',0],UNIT['metre',1],AXIS['Easting',EAST],AXIS['Northing',NORTH],AUTHORITY['EPSG','32647']]</nativeCRS> <srs>EPSG:32647</srs> <latLonBoundingBox><minx>{bbox['minx']}</minx><maxx>{bbox['maxx']}</maxx><miny>{bbox['miny']}</miny><maxy>{bbox['maxy']}</maxy><crs>EPSG:32647</crs></latLonBoundingBox></coverage>'  'http://geoserver:8080/geoserver/rest/workspaces/indx/coveragestores/{indx}_{dd}/coverages'"
        print(cmd, "publish layer")
        os.system(cmd)

    except requests.exceptions.HTTPError as err:
        raise SystemExit(err)


def insertZstat(lat, lon, ndvi, f, dd):
    sql = f"INSERT INTO ndvi(ndvi,fname,dd, geom)VALUES({ndvi},'{f}','{dd}', ST_GeomFromText('POINT({lon} {lat})', 4326))"
    # print(sql)
    cursor.execute(sql)
    print("insert NDVI to database success")
    # records = cursor.fetchall()
    # for row in records:
    #     print(row)


def getPixelValue(ndvi, f, dd):
    loc = [[17.9413, 100.3276],
           [17.9133, 100.3158],
           [17.8635, 100.3021],
           [17.8087, 100.3214],
           [17.7539, 100.3114]]
    for i in loc:
        res = os.popen(
            f'gdallocationinfo -valonly -wgs84 {ndvi} {i[1]} {i[0]}').read()
        print('get pixel value from point')
        insertZstat(i[0], i[1], res, f, dd)


def calNdmi(nir, swir, f, dd):
    # https://lpdaac.usgs.gov/documents/306/MOD09_User_Guide_V6.pdf

    target = f"./ndmi/{f[:-4]}_500m_32647_ndmi.tif"
    # --NoDataValue=0
    exp = f'gdal_calc.py -A {nir} -B {swir} --calc="((A-B)/(A+B))" --outfile={target} --type=Float32 --overwrite --NoDataValue=1.001'
    os.system(exp)
    print("generate NDMI")
    targetClip = f'./ndmi_clip/_{dd}_500m_32647_ndmi_clip.tif'
    clip = f'gdalwarp -overwrite {target} {targetClip} -te {bbox["minx"]} {bbox["miny"]} {bbox["maxx"]} {bbox["maxy"]}'
    os.system(clip)
    print("clip NDMI")

    # getPixelValue(targetClip, f, dd)
    addStore(targetClip, 'ndmi', dd)


def calNdwi(green, nir, f, dd):
    # https://lpdaac.usgs.gov/documents/306/MOD09_User_Guide_V6.pdf

    target = f"./ndwi/{f[:-4]}_500m_32647_ndwi.tif"
    # --NoDataValue=0
    exp = f'gdal_calc.py -A {green} -B {nir} --calc="((A-B)/(A+B))" --outfile={target} --type=Float32 --overwrite --NoDataValue=1.001'
    os.system(exp)
    print("generate NDWI")
    targetClip = f'./ndwi_clip/_{dd}_500m_32647_ndwi_clip.tif'
    clip = f'gdalwarp -overwrite {target} {targetClip} -te {bbox["minx"]} {bbox["miny"]} {bbox["maxx"]} {bbox["maxy"]}'
    os.system(clip)
    print("clip NDWI")

    # getPixelValue(targetClip, f, dd)
    addStore(targetClip, 'ndwi', dd)


def calNdvi(red, nir, f, dd):
    # https://lpdaac.usgs.gov/documents/306/MOD09_User_Guide_V6.pdf

    target = f"./ndvi/{f[:-4]}_500m_32647_ndvi.tif"
    # --NoDataValue=0
    exp = f'gdal_calc.py -A {nir} -B {red} --calc="((A-B)/(A+B))" --outfile={target} --type=Float32 --overwrite --NoDataValue=1.001'
    os.system(exp)
    print("generate NDVI")
    targetClip = f'./ndvi_clip/_{dd}_500m_32647_ndvi_clip.tif'

    # old exten 630822 1962565 646254 1989974
    clip = f'gdalwarp -overwrite {target} {targetClip} -te {bbox["minx"]} {bbox["miny"]} {bbox["maxx"]} {bbox["maxy"]}'
    os.system(clip)
    print("clip NDVI")

    # getPixelValue(targetClip, f, dd)
    addStore(targetClip, 'ndvi', dd)


def warpFile(f, dd):
    in_file = f"./data/{f}"
    out_tmp = f"./tmp/{f[:-4]}_500m_32647_b"
    out_file = f"./out/{f[:-4]}_500m_32647.tif"
    dataset = gdal.Open(in_file, gdal.GA_ReadOnly)
    j = 1
    for i in range(11, 18, 1):
        subdataset = gdal.Open(dataset.GetSubDatasets()
                               [i][0], gdal.GA_ReadOnly)
        kwargs = {'format': 'GTiff', 'dstSRS': 'EPSG:32647'}
        ds = gdal.Warp(destNameOrDestDS=f'{out_tmp}{j}.tif',
                       srcDSOrSrcDSTab=subdataset, **kwargs)
        # del ds
        j += 1
        print(dataset.GetSubDatasets()[i][0])

    dir = os.listdir("tmp")
    imageList = []
    for d in dir:
        imageList.append(f'./tmp/{d}')
    print(imageList)
    VRT = 'OutputImage.vrt'
    gdal.BuildVRT(VRT, imageList, separate=True,
                  callback=gdal.TermProgress_nocb)

    inputImage = gdal.Open(VRT, 0)
    gdal.Translate(f'{out_file}', inputImage, format='GTiff',
                   creationOptions=['COMPRESS:DEFLATE', 'TILED:YES'],
                   callback=gdal.TermProgress_nocb)
    del inputImage
    os.remove(VRT)
    print("translate HDF")

    calNdvi(f'{out_tmp}1.tif', f'{out_tmp}2.tif', f, dd)
    calNdmi(f'{out_tmp}2.tif', f'{out_tmp}6.tif', f, dd)
    calNdwi(f'{out_tmp}4.tif', f'{out_tmp}2.tif', f, dd)

    removeFile("tmp")
    removeFile("out")
    removeFile("data")
    removeFile("ndvi")
    removeFile("ndwi")
    removeFile("ndmi")
    print("delete file")


def getData(doy, dat, dd, year):
    out = f"./data/{dat}"
    url = f'https://ladsweb.modaps.eosdis.nasa.gov/archive/allData/61/MOD09GA/{year}/{doy}/{dat}'
    mod = f"wget -e robots=off -m -np -R .html,.tmp -nH --cut-dirs=3 '{url}' --header 'Authorization: Bearer {token}' -O {out}"
    os.system(mod)
    print('download MODIS HDF')
    warpFile(dat, dd)


def recordDoy(doy, dd, year):
    sql = f"INSERT INTO imglist(doy, dd, yy, dt)VALUES({doy},'{dd}','{year}', now())"
    # print(sql)
    cursor.execute(sql)


def checkDoyExist(dd):
    sql = f"SELECT * FROM imglist WHERE dd='{dd}'"
    cursor.execute(sql)
    record = cursor.fetchone()
    return record


def getJSON(doy, dd, year):
    url = f"https://ladsweb.modaps.eosdis.nasa.gov/archive/allData/61/MOD09GA/{year}/{doy}.json"
    try:
        r = requests.get(url)
        if r.status_code == 200:
            print(r.status_code)
            arr = r.json()
            for a in arr:
                name = a["name"].split(".")
                if name[2] == 'h27v07':
                    print(f'get HDF name: {a["name"]}')
                    getData(doy, a["name"], dd, year)
                    recordDoy(doy, dd, year)
        else:
            print("Not Found")
    except requests.exceptions.HTTPError as err:
        raise SystemExit(err)


def initLoop():
    dt = datetime.now()
    doyEnd = dt.timetuple().tm_yday
    year = date.today().year
    # year = 2022

    print(doyEnd)

    for doy in range(1, doyEnd + 1):
        if doy < 10:
            doy = "00" + str(doy)
        elif doy < 100:
            doy = "0" + str(doy)
        else:
            doy = str(doy)

        doy.rjust(3 + len(doy), '0')
        dd = datetime.strptime(str(year) + "-" + doy,
                               "%Y-%j").strftime("%Y%m%d")

        doyDB = checkDoyExist(dd)

        if doyDB == None:
            # print(dd)
            getJSON(doy, dd, year)
            print(doy, dd, year)


def initNow():
    dt = datetime.now()
    doy = dt.timetuple().tm_yday
    doy -= 8
    year = date.today().year
    if doy < 10:
        doy = "00" + str(doy)
    elif doy < 100:
        doy = "0" + str(doy)
    else:
        doy = str(doy)

    dd = datetime.strptime(str(year) + "-" + doy, "%Y-%j").strftime("%Y%m%d")

    getJSON(doy, dd, year)
    print(doy, dd, year)


if __name__ == '__main__':
    # initNow()
    initLoop()
    # schedule.every(24).hours.do(initNow)
    # schedule.every().day.at("07:30").do(initNow)
    # while True:
    #     schedule.run_pending()
    #     time.sleep(1)
