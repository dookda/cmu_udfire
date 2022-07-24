import os
import subprocess
from auth import earth
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
    print("finish download ", myd)
    os.system(myd)

    # warp()


def download2():
    mod = f"wget -e robots=off -m -np -R .html,.tmp -nH --cut-dirs=3 'https://ladsweb.modaps.eosdis.nasa.gov/archive/allData/61/MOD02HKM/2022/001/' --header 'Authorization: Bearer c2FrZGE6YzJGclpHRXVhRzl0YUhWaGJrQm5iV0ZwYkM1amIyMD06MTY1ODY1MDA3NzozYWJiNmE4NjliNWNkYjNlNjJmYmIwOTcwYjdhOTYwZDExM2U4OGNm' -P ."
    os.system(mod)


if __name__ == '__main__':
    download()
