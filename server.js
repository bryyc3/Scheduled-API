import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import  {getUsers, createUser, returningUser} from './database.js';


const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

app.post('/create-user', async (req, res) => {
    const user = req.body;
    user.password = await bcrypt.hash(user.password, 13);
    const alreadyUser = await returningUser(user.email);
    if (alreadyUser[0].email == null){
        const userCreated = await createUser(user);
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
    console.log(registeredUser[0].email);
    if(registeredUser[0].email == null){
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
