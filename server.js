import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import session from 'express-session';
import mysqlStore from 'express-mysql-session';
import  {createUser, returningUser, getAppointments, storeBusiness, addServices, getBusinessInfo, getServices, insertAvailability, getAvailability, getBusinesses} from './database.js';


const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
       
    }

}))

app.get('/loginStatus', (req,res) => {
    //console.log(req.session.loggedIn)
    //console.log(req.session.accountType)
    if(req.session.loggedIn){
        res.json({
            logged_in: req.session.loggedIn,
            account_type: req.session.accountType
        });
    }
    else{
        res.json({logged_in : false});
    }
})//Check if user is already logged by checking if there is a session associated with user
  //If session is found respond with user logged in and account type

app.post('/create-user', async (req, res) => {
    const user = req.body;
    user.password = await bcrypt.hash(user.password, 13);
    const alreadyUser = await returningUser(user.email);
    if (alreadyUser[0] == null){
        const userCreated = await createUser(user);
        req.session.loggedIn = true;
        req.session.accountType = userCreated[0].account_type;
        req.session.userID = userCreated[0].email;
        res.json({
            created: req.session.loggedIn,
            account_type: req.session.accountType
        });
        return;
    }
    else{ 
        res.json({'created' : false}) 
        return
    }
});//check if user email (from user data object received from form) already exists in database
   //if email already exists return created as false
   //if email does not yet exist store user information in database and return created as true

app.post('/login', async (req, res) => {
    //console.log(req.body);
    const user = req.body;
    const registeredUser = await returningUser(user.email);
    if(registeredUser[0] == null){
        res.json({'login' : false});
        return;
    }
    else{
        const correctPassword = await bcrypt.compare(user.password, registeredUser[0].password);
        if(!correctPassword){
            res.json({'login' : false});
            return;
        }
        else{
            req.session.loggedIn = true;
            req.session.accountType = registeredUser[0].account_type;
            req.session.userID = registeredUser[0].email;
            res.json({
                logged_in: req.session.loggedIn,
                account_type: req.session.accountType
            });
            //console.log(req.session.loggedIn);
            //console.log(req.session.accountType);
            return;
        }
    }
})//check if user is already registered with service
  //if user is already registered compare passwords, if not do not allow login
  //if passwords match, allow login

app.get('/appointments', async (req, res) => {
    const user = req.session.userID;
    const accountType = req.session.accountType;
    const appointments = await getAppointments(user, accountType);
    res.json(appointments);
})//Get all appointments associated with user

app.post('/create-business', async (req, res) => {
    const business = req.body;
    const user = req.session.userID;
    const createBusiness = await storeBusiness(user, business);
})//insert business info into database

app.post('/add-services', async (req, res) => {
    const services = req.body.services;
    const user = req.session.userID;
    const serviceAdded = await addServices(user, services);
})//insert services associated with business into database


app.post('/business-information', async (req, res) =>{
    const user = req.body.userSearch;
    const businessInfo = await getBusinessInfo(user);
    res.json(businessInfo);
})//search for a specific businesses information

app.get('/business-information', async (req, res) =>{
    const user = req.session.userID;
    const businessInfo = await getBusinessInfo(user);
    res.json(businessInfo);
})//get business information associated with user

app.post('/business-services', async (req, res) =>{
    const user = req.body.userSearch;
    const services = await getServices(user);
    res.json(services);
})//search services associated with business
app.get('/business-services', async (req, res) =>{
    const user = req.session.userID;
    const services = await getServices(user);
    res.json(services);
})//get services associated with users business

app.post('/insert-availability', async (req,res) =>{
    const availability = req.body;
    const user = req.session.userID;
    const availabilitySet = await insertAvailability(user, availability);
})//store scheduler availability in database
app.get('/business-availability', async (req, res) =>{
    const user = req.session.userID;
    const availability = await getAvailability(user);
    res.json(availability);
})//get scheduler's availability


app.get('/get-businesses', async (req, res) =>{
    const businesses = await getBusinesses();
    res.json(businesses);
})

app.listen(8000, () => {
    console.log('Server running on port 8080');
});
