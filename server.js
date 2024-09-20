import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import session from 'express-session';
import mysqlStore from 'express-mysql-session';
import  {getUsers, createUser, returningUser, getAppointments} from './database.js';


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

app.get('/appointments', async (req,res) => {
    const user = req.session.userID;
    const accountType = req.session.accountType;
    const appointments = await getAppointments(user, accountType);
    res.json(appointments);
})

app.listen(8000, () => {
    console.log('Server running on port 8080');
});
