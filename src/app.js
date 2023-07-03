import express, { json } from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';
import Joi from 'joi';
import dayjs from 'dayjs';

const app = express();
dotenv.config();
app.use(json());
app.use(cors());

//server port
const PORT = 5000;

//database adress
const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
    await mongoClient.connect();
    console.log('MongoDB online');
} catch (err) {
    console.log(err.message);
}

const db = mongoClient.db();

const userSchema = Joi.object({
    name: Joi.string().required(),
});

app.post('/participants', async (req, res) => {
    const { name } = req.body;

    const userValidation = userSchema.validate(req.body, { abortEarly: false });

    if (userValidation.error) {
        const error = userValidation.error.details.map((detail) => detail.message);

        return res.status(422).send(error);
    }

    try {
        const user = await db
            .collection('participants')
            .findOne({ name: name });
        
        if (user) {
            return res.status(409).send('Username already in use');
        }

        const insertUser = db
            .collection('participants')
            .insertOne({
                name: name,
                lastStatus: Date.now()
            });

        const insertMessage = db
            .collection('messages')
            .insertOne({
                from: name,
                to: 'Todos',
                text: 'entra na sala...',
                type: 'status',
                time: dayjs(date).format('HH:mm:ss')
            });

        await insertUser;
        await insertMessage;

        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(PORT, () => console.log(`Server is online, utilizing PORT: ${PORT}`));
