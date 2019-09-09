"use strict";


const database = require('./server/databaseAPI.js');
let db = new database('./server/login.json');
let tableNames = [];
db.eventEmitter.on('ready', function (e) {
    db.getTables().then(res => tableNames = res);
});
db.connect();


const express = require('express');
const app = express();
const port = 8000;
app.use('/static', express.static('app/public'));
app.use('/js', express.static('app/js'));
app.get('/', (req, res) => res.sendFile(__dirname + '/app/index.html'));
app.get('/tables', (req, res) => {
    if (Object.keys(req.query).length === 0 && req.query.constructor === Object) {
        res.send(tableNames);   // req.query is empty
    } else {
        Promise.all([db.getTableData(req.query.name), db.getTableSchema(req.query.name)]).then((results) => {
            console.log(results);
            res.send({
                "parts": results[0],
                "schema": results[1]
            });
        });
    }
});
app.listen(port, () => console.log(`Listening on port ${port}!`))
