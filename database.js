import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

export async function returningUser(userEmail){
    const [foundUser] = await pool.query("select * from users where email = ?", userEmail);
    return foundUser;
}
export  async function getUsers(){
   
};

export  async function createUser(userInfo){
     await pool.query(
        `INSERT INTO users(email, password, account_type)
        VALUES (?,?,?)`, [userInfo.email, userInfo.password, userInfo.accountType]);
    const userCreated = returningUser(userInfo.email);
    return userCreated;
}
