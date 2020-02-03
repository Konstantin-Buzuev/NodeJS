const mysql = require('mysql');
const config = require('../config.json');

// const connection = mysql.createConnection(config); // sync

const pool = mysql.createPool(config);
// pool.getConnection((err, connection) => {
//     // ......
//     connection.release();
// });

class Task {
    static getAll() {
        return new Promise(((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    connection.release();
                    reject(err);
                }

                connection.query('SELECT * FROM `tasks`', (err, rows) => {
                    if (err) {
                        connection.release();
                        reject(err);
                    }

                    const clearRows = JSON.parse(JSON.stringify(rows));
                    // const clearRows = {...rows};

                    connection.release();
                    resolve(clearRows);
                });
            });
        }));
    }

    static getById(id) {

    }

    static update(id, task) {

    }

    static add(task) {
        return new Promise(((resolve, reject) => {
            pool.getConnection((err, connection) => {
                if (err) {
                    connection.release();
                    reject(err);
                }

                connection.query('INSERT INTO `tasks` ?', task, (err, result) => {
                    if (err) {
                        connection.release();
                        reject(err);
                    }

                    connection.release();
                    resolve(result.insertId);
                });
            });
        }));
    }

    static delete(id) {

    }
}
