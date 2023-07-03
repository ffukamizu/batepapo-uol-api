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

// server port
const PORT = 5000;

// database address
const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
    await mongoClient.connect();
    console.log('MongoDB online');
} catch (err) {
    console.log(err.message);
}

const db = mongoClient.db();

// data validation (user)
const userSchema = Joi.object({
    name: Joi.string().required(),
});

// data validation (message content)
const messageSchema = Joi.object({
    to: Joi.string().min(1).required(),
    text: Joi.string().min(1).required(),
    type: Joi.any().valid('message', 'private_message').required(),
});

app.post('/participants', async (req, res) => {
    const { name } = req.body;

    const userValidation = userSchema.validate(req.body, { abortEarly: false });

    if (userValidation.error) {
        const error = userValidation.error.details.map((detail) => detail.message);

        return res.status(422).send(error);
    }

    try {
        const user = await db.collection('participants').findOne({ name: name });

        if (user) {
            return res.status(409).send('Username already in use');
        }

        await db.collection('participants').insertOne({
            name: name,
            lastStatus: Date.now(),
        });

        await db.collection('messages').insertOne({
            from: name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs(Date.now()).format('HH:mm:ss'),
        });

        return res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/participants', async (req, res) => {
    try {
        const participants = await db.collection('participants').find().toArray();

        res.send(participants);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/messages', async (req, res) => {
    const { to, text, type } = req.body;
    const from = req.headers.user;

    const messageValidation = messageSchema.validate(req.body, { abortEarly: false });

    if (messageValidation.error) {
        const error = messageValidation.error.details.map((detail) => detail.message);

        return res.status(422).send(error);
    }

    try {
        await db.collection('messages').insertOne({
            from: from,
            to: to,
            text: text,
            type: type,
            time: dayjs(Date.now()).format('HH:mm:ss'),
        });

        return res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(PORT, () => console.log(`Server is online, utilizing PORT: ${PORT}`));
