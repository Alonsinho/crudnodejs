const mysql = require('mysql');

// Permite convertir el código de callback a código de promesas
const {promisify} = require('util');


// Objeto con los datos de la base de datos
const {database} = require('./db.js');


// Se crea el pool de conexiones de la base de datos
const pool = mysql.createPool(database);


// Se obtiene la conexión a través del pool
    pool.getConnection((err, conn) => {
        if (err) {  
            switch (err.code) {
                case 'ER_CON_COUNT_ERROR':
                    console.log('Hay demasidadas conexiones a la base de datos!');
                    break;
                case 'PROTOCOL_CONNECTION_LOST':
                    console.log('La conexión está cerrada');
                    break;
                case 'ECONNREFUSED':
                    console.log('Conexión rechazada');
                    break;
                default: 
                    break;
            }
        } else {
            conn.release();
            console.log(`Database connection OK! Thread ID: ${conn.threadId}`);
            return;
        }
    });

// Cada vez que se quiera hacer una consulta se pueden usar promesas
pool.query = promisify(pool.query);


module.exports = pool;