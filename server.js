import express from 'express';
import cors from 'cors';
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
    const alreadyUser = await returningUser(user.email);
    if (alreadyUser[0] == null){
        const userCreated = await createUser(user);
        res.json({'created' : true})
    }
    else{ res.json({'created' : false}) }
});

app.listen(8000, () => {
    console.log('Server running on port 8080');
});
