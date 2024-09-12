import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import session from 'express-session';
import mysqlStore from 'express-mysql-session';
import  {getUsers, createUser, returningUser} from './database.js';


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
        maxAge: 6000 * 70,
    }

}))

app.get('/loginStatus', (req,res) => {
    console.log(req.sessionID)
    if(req.session.logged_in){
        res.json({
            logged_in: req.session.logged_in,
            account_type: req.session.user.account_type
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
        req.session.logged_in = true;
        req.session.user = {
            id: userCreated[0].email,
            account_type: userCreated[0].account_type
        }
        res.json({'created' : true});
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
            req.session.logged_in = true;
            req.session.user = {
                id: registeredUser[0].email,
                account_type: registeredUser[0].account_type
            }
            res.json({'login' : true});
            return;
        }
    }
})//check if user is already registered with service
  //if user is already registered compare passwords, if not do not allow login
  //if passwords match, allow login

app.listen(8000, () => {
    console.log('Server running on port 8080');
});
