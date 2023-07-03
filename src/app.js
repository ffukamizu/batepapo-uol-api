import express, { json } from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';
const PORT = 5000;
const app = express();

dotenv.config();
app.use(json());
app.use(cors());

const mongoClient = new MongoClient(process.env.DATABASE_URL);

try {
    await mongoClient.connect();
    console.log('MongoDB online');
} catch (err) {
    console.log(err.message);
}
const db = mongoClient.db();

app.listen(PORT, () => console.log(`Server is online, utilizing PORT: ${PORT}`));
