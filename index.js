"use strict";

const database = require('./database.js');

const express = require('express');
const app = express();
const port = 8000;


let db = new database('./login.json');
let tableNames = [];
db.eventEmitter.on('ready', function (e) {
    db.getTables().then(res => tableNames = res);
});
db.connect();


app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));
app.get('/tables', (req, res) => {
    if (Object.keys(req.query).length === 0 && req.query.constructor === Object) {  // Check req.query is empty
        res.send(tableNames);
    } else {
        db.getTableData(req.query.name).then(result => res.send(result));
    }
});
app.use('/static', express.static('public'));
app.use('/components', express.static('components'));
app.listen(port, () => console.log(`Listening on port ${port}!`))
