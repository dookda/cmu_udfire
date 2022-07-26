import os
import subprocess
from unicodedata import name
import psycopg2 as pg2
import requests
from auth import earth, token, conn
from datetime import date, timedelta, datetime
import urllib
import json

# db
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

path = 'lst_terra/'


def warp():
    dir = os.listdir(path)
    for f in dir:
        if f.endswith(".hdf"):
            a = f.split(".")
            # print(a)
            out = f"{a[0]}_{a[1]}_{a[2]}_{a[3]}_{a[4]}"
            cmd = f'modis_convert.py -s "( 1 0 0 0 1 0 0 0 0 0 0 0 )" -o {path}{out} -e 32647  {path}{f}'
            os.system(cmd)
            print("finish warp")


def download():
    print("downloading...")

    df = date.today() - timedelta(days=1)
    de = date.today()
    # print(df)
    # cmd = f"modis_download.py -U {username} -P {password} -I -r -t h18v03,h18v04 -f 2008-01-01 -e 2008-01-31 /mnt/lst_terra/"
    mod = f"modis_download.py -U {username} -P {password} -r -s MOLT -p MOD09A1.006 -t h27v07 -f 2022-07-01 -e 2022-07-31 {path}"
    # os.system(mod)
    myd = f"modis_download.py -U {username} -P {password} -r -s MOLA -p MYD09A1.006 -t h27v07 -f 2022-07-01 -e 2022-07-31 {path}"

    os.system(myd)
    print("finish download ", myd)

    # warp()


def download2():
    url = f'https://ladsweb.modaps.eosdis.nasa.gov/archive/allData/61/MOD02HKM/2022/001/'
    mod = f"wget -e robots=off -m -np -R .html,.tmp -nH --cut-dirs=3 '{url}' --header 'Authorization: Bearer {token}' -P ."
    os.system(mod)


def getJSON():
    doy = datetime.now().timetuple().tm_yday - 2
    if doy < 10:
        doy = "00" + str(doy)
    elif doy < 100:
        doy = "0" + str(doy)

    print(doy)

    url = f"https://ladsweb.modaps.eosdis.nasa.gov/archive/allData/61/MOD09GA/2022/{doy}.json"
    r = requests.get(url)
    arr = r.json()
    # print(doy)
    # print(date.today())
    for a in arr:
        name = a["name"].split(".")
        dd = name[1]
        if name[2] == 'h27v07':
            print(name)


def check_extent():
    dt = date.today()
    # dt = '2022-07-23'
    url = f'https://ladsweb.modaps.eosdis.nasa.gov/archive/geoMeta/61/TERRA/2022/MOD03_{dt}.txt'
    mod = f"wget -e robots=off -m -np -R .html,.tmp -nH --cut-dirs=3 '{url}' --header 'Authorization: Bearer {token}' -O ./txt/MOD03_{dt}.txt"
    os.system(mod)

    with open(f'./txt/MOD03_{dt}.txt', 'r') as f:
        next(f)
        next(f)
        next(f)
        for l in f:
            arr = l.split(',')
            arrsel = arr[9:]
            print(arr)

            sql = f"INSERT INTO pp (geom) VALUES (ST_GeomFromText('POLYGON(({arrsel[0]} {arrsel[4]}, {arrsel[1]} {arrsel[5]}, {arrsel[2]} {arrsel[6]}, {arrsel[3]} {arrsel[7]}, {arrsel[0]} {arrsel[4]}))', 4326))"
            # cursor.execute(sql)

            sql = f"SELECT ST_Contains(ST_GeomFromText('POLYGON(({arrsel[0]} {arrsel[4]}, {arrsel[1]} {arrsel[5]}, {arrsel[2]} {arrsel[6]}, {arrsel[3]} {arrsel[7]}, {arrsel[0]} {arrsel[4]}))', 4326), ST_GeomFromText('POINT(100.30079128722683 17.865554480237044)', 4326)) as contain"
            cursor.execute(sql)
            records = cursor.fetchall()
            for row in records:
                print(row)

            # for a in arr:
            #     a.strip("\n")
            #     print(a)

            # arrsel.rstrip()


if __name__ == '__main__':
    getJSON()
