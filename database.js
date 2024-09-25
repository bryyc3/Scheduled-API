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
export async function getUsers(){
   
};

export  async function createUser(userInfo){
     await pool.query(
        `INSERT INTO users(email, password, account_type)
        VALUES (?,?,?)`, [userInfo.email, userInfo.password, userInfo.accountType]);
    const userCreated = returningUser(userInfo.email);
    return userCreated;
}

export async function getAppointments(account, accountType){
     if(accountType === 'scheduler'){
            const [appointments] = await pool.query(
            "SELECT * FROM appointments WHERE scheduler_email = ?",
            account);
            return appointments;
        }
    else if(accountType === 'booker'){
        const [appointments] = await pool.query(
            "SELECT * FROM appointments WHERE client_email = ?",
            account);
            return appointments;
    }
}

export async function storeBusiness(email, business){
    await pool.query(
        `INSERT INTO businesses(owner, business_name, location, description)
         VALUES (?,?,?,?)`, [email, business.businessName, business.address, business.businessDescription]
    )
}

export function addServices(email, services){
    services.map(async (service, index) => {
        await pool.query(
            `INSERT INTO services(provider, service, price, description)
             VALUES (?,?,?,?)`, [email, service.name, service.price, service.description]
        )
    })
    
}

export async function getBusinessInfo(email){
    const [business] = await pool.query(
        `SELECT * FROM businesses, services WHERE owner = ?`, [email]
    )
    return business;
    
}