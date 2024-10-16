import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

export async function findUser(userEmail){
    const [foundUser] = await pool.query(`select * from users where email = ?`, userEmail);
    return foundUser;
}

export  async function createUser(userInfo){
     await pool.query(
        `INSERT INTO users(email, password, account_type, first_name)
        VALUES (?,?,?,?)`, [userInfo.email, userInfo.password, userInfo.accountType, userInfo.firstName]);
    const userCreated = findUser(userInfo.email);
    return userCreated;
}

export async function getAppointments(account, accountType){
     if(accountType === 'scheduler'){
            const [appointments] = await pool.query(
            `SELECT * FROM appointments WHERE scheduler_email = ?`,
            account);
            return appointments;
        }
    else if(accountType === 'booker'){
        const [appointments] = await pool.query(
            `SELECT * FROM appointments WHERE booker_email = ?`,
            account);
            return appointments;
    }
}

export async function getDaySpecificAppointments(email, date){
    const [appointments] = await pool.query(
        `SELECT * FROM appointments WHERE scheduler_email = ? AND date = ?`,
        [email, date]);
        return appointments;
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
            `INSERT INTO services(provider, service, price, description, time)
             VALUES (?,?,?,?,?)`, [email, service.name, service.price, service.description, service.time]
        )
    })
    
}

export async function getBusinessInfo(email){
    const [business] = await pool.query(
        `SELECT * FROM businesses WHERE owner = ?`, [email]
    )
    return business;
}

export async function getServices(email){
    const [services] = await pool.query(
        `SELECT * FROM services WHERE provider = ?`, [email]
    )
    return services;
}

export async function insertAvailability(email, availability){
    availability.map(async (day, index) => {
        await pool.query(
            `INSERT INTO availability(owner, day, start_time, end_time, unavailable, day_id)
             VALUES (?,?,?,?,?,?)`,[email, day.name, day.start_time, day.end_time, day.unavailable, day.id]
        )
    })
}

export async function insertSlotDivision(slotDivision, email){
    await pool.query(
        `UPDATE businesses
            SET divide_slots = ?
            WHERE owner = ?`,[slotDivision, email]
    )
}

export async function getAvailability(email){
    const [availability] = await pool.query(
        `SELECT * FROM availability WHERE owner = ?`, [email]
    )
    return availability;
}

export async function getBusinesses(){
    const [businesses] = await pool.query(
        `SELECT * FROM businesses`
    )
    return businesses;
}

export async function scheduleAppt(scheduler, booker, service, date, startTime, endTime, displayTime, schedulerName, bookerName){
    await pool.query(
        `INSERT INTO appointments(scheduler_email, booker_email, service, date,
                                  start_time, end_time, display_time, scheduler_name, booker_name)
         VALUES (?,?,?,?,?,?,?,?,?)`,[scheduler, booker, service, date,  
                                      startTime, endTime, displayTime, schedulerName, bookerName]
    );
}