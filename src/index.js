import express, { json } from 'express';
import cors from 'cors';
const PORT = 5000;
const app = express();

app.use(json());
app.use(cors());

app.listen(PORT, () => console.log(`Server is online, utilizing PORT: ${PORT}`));