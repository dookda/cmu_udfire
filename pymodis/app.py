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
day = ''


def removeFile():
    dir = os.listdir("tmp")
    for f in dir:
        os.remove(f'./tmp/{f}')
    print('delete files from tmp')


def insertZstat(lat, lon, ndvi, f, dd):
    sql = f"INSERT INTO ndvi(ndvi,fname,dd, geom)VALUES({ndvi},'{f}','{dd}', ST_GeomFromText('POINT({lon} {lat})', 4326))"
    # print(sql)
    cursor.execute(sql)
    print("insert NDVI to database success")
    # records = cursor.fetchall()
    # for row in records:
    #     print(row)
    removeFile()


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


def calNdvi(red, nir, f, dd):
    # https://lpdaac.usgs.gov/documents/306/MOD09_User_Guide_V6.pdf

    target = f"./ndvi/{f[:-4]}_500m_32647_ndvi.tif"
    # --NoDataValue=0
    exp = f'gdal_calc.py -A {nir} -B {red} --calc="((A-B)/(A+B))" --outfile={target} --type=Float32 --overwrite --NoDataValue=1.001'
    os.system(exp)
    print("generate NDVI")

    targetClip = f"./ndvi_clip/{f[:-4]}_500m_32647_ndvi_clip.tif"
    clip = f'gdalwarp -overwrite {target} {targetClip} -te 630822 1962565 646254 1989974'
    os.system(clip)
    print("clip NDVI")
    getPixelValue(targetClip, f, dd)


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
        del ds
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


def getData(doy, dat, dd):
    out = f"./data/{dat}"
    url = f'https://ladsweb.modaps.eosdis.nasa.gov/archive/allData/61/MOD09GA/2022/{doy}/{dat}'
    mod = f"wget -e robots=off -m -np -R .html,.tmp -nH --cut-dirs=3 '{url}' --header 'Authorization: Bearer {token}' -O {out}"
    os.system(mod)
    print('download MODIS HDF')
    warpFile(dat, dd)


def merge():
    cmd = "rio merge ./tmp/M*.tif merged.tif"
    os.system(cmd)


def getJSON():
    d = 5
    dt = datetime.now()
    doy = dt.timetuple().tm_yday - d
    dd = datetime.today() - timedelta(days=d)

    print(doy)

    if doy < 10:
        doy = "00" + str(doy)
    elif doy < 100:
        doy = "0" + str(doy)

    url = f"https://ladsweb.modaps.eosdis.nasa.gov/archive/allData/61/MOD09GA/2022/{doy}.json"

    r = requests.get(url)
    arr = r.json()
    for a in arr:
        name = a["name"].split(".")
        if name[2] == 'h27v07':
            print(f'get HDF name: {a["name"]}')
            getData(doy, a["name"], dd)


if __name__ == '__main__':
    getJSON()
    schedule.every(120).seconds.do(getJSON)
    # schedule.every().day.at("07:30").do(getJSON)
    while True:
        schedule.run_pending()
        time.sleep(1)
