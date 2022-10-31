const Pool = require('pg').Pool
const { Client } = require('pg')

// docker in localhost
const db = new Pool({
    user: 'postgres',
    host: 'postgis',
    database: 'geodb',
    password: '1234',
    port: 5432,
});


exports.db = db;