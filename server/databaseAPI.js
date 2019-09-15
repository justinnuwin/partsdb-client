const mariadb = require('mariadb');
const events = require('events');

class Deferred {
    constructor () {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}

class Database {
    constructor(credentialsPath) {
        this.credentialsPath = credentialsPath;
        let fs = require('fs');
        let file = fs.readFileSync(this.credentialsPath); //'login.json'
        this.credentials = JSON.parse(file);
        this.pool = {};
        this.queue = [];
        this.eventEmitter = new events.EventEmitter();
    }

    connect() {
        this.pool = mariadb.createPool({
             host: this.credentials.hostname,
             user: this.credentials.username,
             password: this.credentials.password,
             connectionLimit: 5
        });
        this.eventEmitter.on('enqueue', this.checkQueue.bind(this));
        this.eventEmitter.emit('ready');
    }

    checkQueue() {
        if (this.queue.length >= 0) {
            this.pool.getConnection().then(conn => {
                let qObj = this.queue.shift();
                conn.query(qObj.queryString).then(res => {
                    qObj.deferred.resolve(qObj.postprocessing(res));
                });
                conn.end();
            });
        }
    }

    enqueue(queryString, postFunction) {
        let deferred = new Deferred();
        this.queue.push({
            "queryString": queryString,
            "deferred": deferred,
            "postprocessing": postFunction
        });
        this.eventEmitter.emit('enqueue');
        return deferred.promise;
    }

    getTables() {
        return this.enqueue(`SHOW TABLES FROM ${this.credentials.database}`, (result) => {
            let tables = [];
            for (let o of result) {
                tables.push(Object.values(o)[0]);
            }
            return tables;
        });
    }
    
    //TODO: It would be wise to implement some prepared statements or procedures
    getTableData(tableName) {
        return this.enqueue(`SELECT * FROM ${this.credentials.database}.${tableName}`, result => {return result});
    }

    getTableSchema(tableName) {
        return this.enqueue(`SHOW FULL COLUMNS FROM ${this.credentials.database}.${tableName}`, result => {return result});
    }

    updatePart(tableName, originalPartNumber, part) {
        let setString = "";
        // TODO: Add method to escape \' from all dynamic values
        for (let property in part) {
            let dirtyProperty = part[property];
            let cleanProperty;
            if (dirtyProperty.indexOf("'") > -1)
                cleanProperty = dirtyProperty.replace("\'", "\'\'");
            else
                cleanProperty = dirtyProperty;
            setString += `\`${property}\`='${cleanProperty}',`;
        }
        setString = setString.slice(0, -1);
        return this.enqueue(`UPDATE ${this.credentials.database}.${tableName}
                             SET ${setString}
                             WHERE \`Part Number\`='${originalPartNumber}'`,
                            result => {return result});
    }
}

module.exports = Database;
