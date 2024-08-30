import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

export  async function getUsers(){
    const [rows] = await pool.query("select * from user_login_info");
    return rows;
};

export  async function createUser(email, password){
    const [result] = await pool.query(
        `INSERT INTO user_login_info(email, password)
        VALUES (?,?)`, [email, password])
    return result
}
