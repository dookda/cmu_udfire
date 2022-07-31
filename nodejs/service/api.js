const express = require('express');
const app = express.Router();
const con = require("./db");
const db = con.db;

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

module.exports = app;