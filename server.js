import express from 'express';
import cors from 'cors';
import  {getUsers, createUser} from './database.js';


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
app.post('/update-email', async (req, res) => {
    const {email, password} = req.body;
    const user = await createUser(email, password);
    res.send(user);
});

app.listen(8000, () => {
    console.log('Server running on port 8080');
});
