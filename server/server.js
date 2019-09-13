const path = require('path');
const express = require('express');
const port = 8000;

const database = require(path.join(__dirname, 'databaseAPI.js'));
let db = new database(path.join(__dirname, 'login.json'));
let tableNames = [];
db.eventEmitter.on('ready', function (e) {
    db.getTables().then(res => tableNames = res);
});
db.connect();

const appPath = path.join(__dirname, '../app');

class Server {
    constructor() {
        this.app = express();

        this.app.use(express.json());        // for parsing application/json
        this.app.use(express.urlencoded({ extended: true }));    // for parsing application/x-www-form-urlencoded
        this.app.use('/static', express.static(path.join(appPath, 'public')));
        this.app.use('/js', express.static(path.join(appPath, 'js')));
        this.app.get('/', (req, res) => res.sendFile(path.join(appPath, 'index.html')));
        this.app.get('/tables', (req, res) => {
            if (Object.keys(req.query).length === 0 && req.query.constructor === Object) {
                res.send(tableNames);   // req.query is empty
            } else {
                Promise.all([db.getTableData(req.query.name), db.getTableSchema(req.query.name)]).then(results => {
                    res.send({
                        "parts": results[0],
                        "schema": results[1]
                    });
                });
            }
        });
        this.app.post('/parts', (req, res) => {
            console.log(req.body);
            db.updatePart(req.body.tableName, req.body.originalPartNumber, req.body.part);
            res.send("Success!");
        });
        this.app.listen(port, () => console.log(`Listening on port ${port}!`));
    }
}

module.exports = Server;
