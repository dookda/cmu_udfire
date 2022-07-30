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

module.exports = app;