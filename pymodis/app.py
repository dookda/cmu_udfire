import os
# from unicodedata import name
import psycopg2 as pg2
import requests
from datetime import date, timedelta, datetime
import numpy as np
from osgeo import gdal
from osgeo import gdal_array as ga

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


def rmLyr():
    for f in dir:
        os.remove(f'./tmp/{f}')


def getPixelValue(ndvi, f):
    loc = [[17.9413, 100.3276],
           [17.9133, 100.3158],
           [17.8635, 100.3021],
           [17.8087, 100.3214],
           [17.7539, 100.3114]]
    for i in loc:
        res = os.popen(
            f'gdallocationinfo -valonly -wgs84 {ndvi} {i[1]} {i[0]}').read()
        print(res)


def calNdvi(red, nir, f):
    # https://lpdaac.usgs.gov/documents/306/MOD09_User_Guide_V6.pdf
    print("cal NDVI")

    target = f"./out/{f[:-4]}_500m_32647_ndvi.tif"
    # --NoDataValue=0
    exp = f'gdal_calc.py -A {nir} -B {red} --calc="((A-B)/(A+B))" --outfile={target} --type=Float32 --overwrite --NoDataValue=1.001'
    os.system(exp)
    print("ndvi ok")

    targetClip = f"./out/{f[:-4]}_500m_32647_ndvi_clip.tif"
    clip = f'gdalwarp -overwrite {target} {targetClip} -te 630822 1962565 646254 1989974'
    os.system(clip)
    print("clip ok")
    getPixelValue(targetClip, f)


def warpFile(f):
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
    print("Translate ok")

    calNdvi(f'{out_tmp}1.tif', f'{out_tmp}2.tif', f)


def getData(doy, dat):
    out = f"./data/{dat}"
    url = f'https://ladsweb.modaps.eosdis.nasa.gov/archive/allData/61/MOD09GA/2022/{doy}/{dat}'
    mod = f"wget -e robots=off -m -np -R .html,.tmp -nH --cut-dirs=3 '{url}' --header 'Authorization: Bearer {token}' -O {out}"
    # os.system(mod)
    warpFile(dat)


def merge():
    cmd = "rio merge ./tmp/M*.tif merged.tif"
    os.system(cmd)


def getJSON():
    doy = datetime.now().timetuple().tm_yday - 4
    if doy < 10:
        doy = "00" + str(doy)
    elif doy < 100:
        doy = "0" + str(doy)

    print(doy)

    url = f"https://ladsweb.modaps.eosdis.nasa.gov/archive/allData/61/MOD09GA/2022/{doy}.json"

    r = requests.get(url)
    arr = r.json()
    for a in arr:
        name = a["name"].split(".")
        if name[2] == 'h27v07':
            print(a["name"])
            getData(doy, a["name"])


if __name__ == '__main__':
    getJSON()
