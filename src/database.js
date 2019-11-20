  const mysql = require('mysql');

const mysqlConnection = mysql.createConnection({
    host: 'bfzkzkyq0abmhdbsc2ru-mysql.services.clever-cloud.com',
    user: 'ubhjonh4iskqwirm',
    password: 'CYc3hNVQBPe2tbFx1ZKB',
    database: 'bfzkzkyq0abmhdbsc2ru',
    multipleStatements: true
});

mysqlConnection.connect((err) => {
    if(err) {
        console.log(err);
        return;
    }
    else {
        console.log('Connected succesfully to mysql');
    }
});

module.exports = mysqlConnection;