const express = require('express');
const app = express.Router();
const db = require("./db").db;

const axios = require('axios');

app.get("/api/getdata", (req, res) => {

    const sql = `SELECT * FROM ndvi ORDER BY dd DESC`;
    console.log(sql);
    db.query(sql).then(r => {
        res.status(200).json({
            data: r.rows
        })
    })
});

app.get("/api/getdata/:df/:dt", (req, res) => {
    const df = req.params.df;
    const dt = req.params.dt;
    const sql = `SELECT * FROM ndvi WHERE dd BETWEEN '${df}' AND '${dt}' ORDER BY dd DESC`;
    console.log(sql);
    db.query(sql).then(r => {
        res.status(200).json({
            data: r.rows
        })
    })
});

app.get("/api/listndvi", (req, res) => {
    const url = 'http://geoserver:8080/geoserver/rest/layers.json'
    const AUTH = {
        username: 'admin',
        password: 'geoserver'
    }

    axios.get(
        url, {
        auth: AUTH,
    }).then((response) => {
        res.status(200).json(response.data)
    }, (error) => {
        console.log(error);
    });

})

app.get('/api/getcommuforest', (req, res) => {
    const sql = "SELECT forest_name, lat, lon FROM commu_forest";
    console.log(sql);
    db.query(sql).then(r => {
        res.status(200).json({
            data: r.rows
        })
    })
})

app.get('/api/getupdate', (req, res) => {
    const sql = `SELECT * FROM imglist ORDER BY dt DESC LIMIT 1`
    db.query(sql).then(r => {
        res.status(200).json({
            data: r.rows
        })
    })
})

module.exports = app;