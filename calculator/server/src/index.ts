import chatRouter from './routes/chat.js';
import cors from 'cors';
import dotenv from 'dotenv';
import 'dotenv/config';
import express from 'express';

dotenv.config({ path: '.env.local', override: true });

const app = express();
const PORT = process.env.PORT ?? 3002;

app.use(cors());
app.use(express.json());

app.use('/api/chat', chatRouter);

app.listen(PORT, () => {
    console.log(`\n✅ Server running on http://localhost:${PORT}`);
});
