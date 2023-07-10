const {Pool} = require('pg');
require('dotenv').config();

// console.log(process.env.DB_NAME);

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const createTableQuery =`
    CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        bookTitle VARCHAR(500) NOT NULL,
        author VARCHAR(500) NOT NULL,
        genre VARCHAR(100) NOT NULL,
        quantity INTEGER NOT NULL
    )
`;

const createTable = async () => {
    try{
        await pool.query(createTableQuery);
        console.log('Table created successfully');
    }catch(error) {
        console.error(error);
    }
}

// createTable();

module.exports = {
    query: (text, params, callback) => {
        console.log("QUERY: ", text, params || "");
        return pool.query(text, params, callback);
    },
};
