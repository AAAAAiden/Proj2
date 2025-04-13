import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db'
import authRoutes from './route/authRoute.js';

dotenv.config();
connectDB();

const app: Application = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});