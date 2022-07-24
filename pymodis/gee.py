from osgeo import gdal
import os

path = f"./lst_terra"

for x in os.listdir(path):
    if x.endswith(".hdf"):
        # raw MODIS HDF in sinusoid projection
        # in_file = f"./lst_terra/MOD02HKM.A2022204.2315.006.2022205072947.hdf"
        name = x.split(".")
        in_file = f"./lst_terra/{x}"
        out_file = f"./lst_terra/modis_{name[4]}.tif"
        print(x)
        # open dataset
        dataset = gdal.Open(in_file, gdal.GA_ReadOnly)
        subdataset = gdal.Open(dataset.GetSubDatasets()
                               [0][0], gdal.GA_ReadOnly)

        # gdalwarp
        kwargs = {'format': 'GTiff', 'dstSRS': 'EPSG:4326'}
        ds = gdal.Warp(destNameOrDestDS=out_file,
                       srcDSOrSrcDSTab=subdataset, **kwargs)
        del ds
