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


def calNdvi(dat, f):
    # https://lpdaac.usgs.gov/documents/306/MOD09_User_Guide_V6.pdf
    print("cal NDVI")

    target = f"./out/{f[:-4]}_500m_32647_ndvi.tif"
    exp = f'gdal_calc.py -A {dat} --A_band=2 -B {dat} --B_band=1 --calc="(1.0*A-B)/(1.0*A+B)" --outfile={target} --NoDataValue=0'
    os.system(exp)
    print("ndvi ok")


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

    calNdvi(out_file, f)


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
    doy = datetime.now().timetuple().tm_yday - 3
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
