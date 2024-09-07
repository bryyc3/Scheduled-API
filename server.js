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

app.get("/users", async (req, res) => {
    const users = await getUsers();
    res.send(users);
});
app.post('/create-user', async (req, res) => {
    const user = req.body;
    user.password = await bcrypt.hash(user.password, 13);
    const alreadyUser = await returningUser(user.email);
    if (alreadyUser[0] == null){
        const userCreated = await createUser(user);
        res.json({'created' : true})
    }
    else{ res.json({'created' : false}) }
});//check if user email (from user data object received from form) already exists in database
   //if email already exists return created as false
   //if email does not yet exist store user information in database and return created as true

app.listen(8000, () => {
    console.log('Server running on port 8080');
});
