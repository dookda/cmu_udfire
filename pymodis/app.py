import os
import subprocess

import requests
from auth import earth, token
from datetime import date, timedelta

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


def check_extent():
    # dt = date.today()
    dt = '2022-07-24'
    url = f'https://ladsweb.modaps.eosdis.nasa.gov/archive/geoMeta/61/TERRA/2022/MOD03_{dt}.txt'
    mod = f"wget -e robots=off -m -np -R .html,.tmp -nH --cut-dirs=3 '{url}' --header 'Authorization: Bearer {token}' -O ./txt/MOD03_{dt}.txt"
    # os.system(mod)

    lines = []
    with open(f'./txt/MOD03_{dt}.txt') as f:
        lines = f.readlines()

    for l in lines:
        arr = l.split(',')
        arrsel = arr[9:]
        for a in arrsel:
            a.strip("\n")
            print(a)


if __name__ == '__main__':
    download()
