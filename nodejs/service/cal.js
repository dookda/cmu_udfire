const express = require('express');
const app = express.Router();

const axios = require('axios');
const moment = require('moment');
const fs = require('fs');
const db = require("./db").db;

const createTable = async () => {
    const sql = `CREATE TABLE IF NOT EXISTS ndvi_stat (
        id SERIAL PRIMARY KEY,
        dd DATE,
        sta VARCHAR(1),
        val FLOAT
    )`;
    await db.query(sql);
}

const insertData = async (dd, sta, val) => {
    const sql = `INSERT INTO ndvi_stat (dd, sta, val) VALUES ('${dd}', '${sta}', ${val})`;
    await db.query(sql);
}

const download = async () => {
    // createTable();
    let locationVill = [
        { div: 'a', sta: "บ้านปากทับ", lat: 17.748892, lng: 100.422899 },
        { div: 'b', sta: "บ้านงอมถ้ำ", lat: 17.972817, lng: 100.581703 },
        { div: 'c', sta: "ห้วยแมง", lat: 17.605355, lng: 100.558604 },
        { div: 'd', sta: "ป่าคาย", lat: 17.52914, lng: 100.339262 },
        { div: 'e', sta: "ปางวัว", lat: 17.83773, lng: 100.171323 },
        { div: 'f', sta: "หนองไผ่", lat: 17.599284, lng: 100.378302 },
        { div: 'g', sta: "บ้านคุ้งยาง", lat: 17.625081, lng: 100.291825 },
        { div: 'h', sta: "บ้านผาจักร", lat: 17.62646, lng: 100.269156 },
        { div: 'i', sta: "บ้ายห้วยปอบ", lat: 17.781632, lng: 100.245051 },
        { div: 'j', sta: "บ้านนาตารอด", lat: 17.681839, lng: 100.374567 }
    ]

    // moment minus 1 year from now
    var dateStart = moment().subtract(1, 'month').format('YYYYMMDD');
    const dateEnd = moment().format('YYYYMMDD');

    const filePath = './service/data.txt';

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error('File does not exist.');
            return;
        }

        // Delete the file
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            } else {
                console.log('File deleted successfully.');
            }
        });
    });

    while (dateStart <= dateEnd) {

        locationVill.map((v, i) => {
            const url = `http://udfire.com:3100/getpixelvalue/ndvi/${dateStart}/${v.lat}/${v.lng}`;

            console.log(i, dateStart);
            axios.get(url).then(async (res) => {
                const data = await res.data.val.replace(/\n/g, "");
                if (data != 'null' && data != '') {
                    // console.log(i, dateStart, data)
                    const response = `${v.sta},${dateStart},${data}\n`;
                    fs.appendFile(filePath, response, function (err) {
                        if (err) {
                            console.error('Error writing to file:', err);
                        }
                    });
                }
            }, (error) => {
                console.log(error);
            })
        });

        dateStart = moment(dateStart).add(1, 'days').format('YYYYMMDD');
    }
}

download();

module.exports = app;