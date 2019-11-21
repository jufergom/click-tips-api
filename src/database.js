const mysql = require('mysql');
const { promisify } = require('util');

const pool = mysql.createPool({
    host: 'bfzkzkyq0abmhdbsc2ru-mysql.services.clever-cloud.com',
    user: 'ubhjonh4iskqwirm',
    password: 'CYc3hNVQBPe2tbFx1ZKB',
    database: 'bfzkzkyq0abmhdbsc2ru',
    multipleStatements: true
});

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.');
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has to many connections');
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused');
        }
    }
  
    if (connection) 
        connection.release();
    console.log('DB is Connected');
    return;
});
  
// Promisify Pool Querys
pool.query = promisify(pool.query);

module.exports = pool;