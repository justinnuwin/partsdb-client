const path = require('path');
const express = require('express');
const port = 8000;

const database = require(path.join(__dirname, 'databaseAPI.js'));
const appPath = path.join(__dirname, '../app');
const events = require('events');

let tableNames = [];
class Server {
    constructor() {
        this.eventEmitter = new events.EventEmitter();
        this.db = new database(path.join(__dirname, 'login.json'));
        this.db.eventEmitter.on('ready', (e) => {
            console.log("Databse connected!");
            this.db.getTables().then(res => {
                tableNames = res
                console.log("Database tables loaded: ", tableNames);
                this.eventEmitter.emit('ready');
            });
        });
        this.db.connect();

        this.app = express();
        this.app.use(express.json());        // for parsing application/json
        this.app.use(express.urlencoded({ extended: true }));    // for parsing application/x-www-form-urlencoded
        this.app.use('/static', express.static(path.join(appPath, 'public')));
        this.app.use('/js', express.static(path.join(appPath, 'js')));
        this.app.get('/', (req, res) => res.sendFile(path.join(appPath, 'index.html')));
        this.app.get('/tables', (req, res) => {
            if (Object.keys(req.query).length === 0 && req.query.constructor === Object) {      // req.query is empty
                res.send(tableNames);   
            } else {
                Promise.all([this.db.getTableData(req.query.name), this.db.getTableSchema(req.query.name)]).then(results => {
                    res.send({
                        "parts": results[0],
                        "schema": results[1]
                    });
                });
            }
        });
        this.app.post('/parts', (req, res) => {
            this.db.updatePart(req.body.tableName, req.body.originalPartNumber, req.body.part);
            res.send("Success!");
        });
        this.app.listen(port, () => console.log(`Listening on port ${port}!`));
    }
}

module.exports = Server;
