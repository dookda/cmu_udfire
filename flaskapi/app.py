from flask import Flask, redirect, url_for, request
from flask_cors import CORS, cross_origin
import json
import os

app = Flask(__name__)
CORS(app, support_credentials=True)


@app.route('/')
def hello_world():
    return 'Hello, World!'


@app.route('/getpixelvalue/<string:index>/<string:yyyymmdd>/<float:latitude>/<float:longitude>')
@cross_origin()
def getPixelValue(index, yyyymmdd, latitude, longitude):
    f = f'./{index}_clip/_{yyyymmdd}_500m_32647_{index}_clip.tif'
    res = os.popen(
        f'gdallocationinfo -valonly -wgs84 {f} {longitude} {latitude}').read()

    return json.dumps({'index': index, 'val': res})


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=3100, debug=True)
