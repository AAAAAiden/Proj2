import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './route/authRoute.js';
import employeeRoutes from './route/employeeRoute.js';
import hrRoutes from './route/hrRoute.js';
import visaRoutes from './route/visaRoute.js';
import onboardingRoutes from './route/onboardingRoute.js';
import documentRoutes from './route/documentRoute.js';

import errorHandler from './middleware/errorHandler.js';

dotenv.config();
connectDB();

const app: Application = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/visa', visaRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/documents', documentRoutes); // optional for downloading previews

// GLOBAL ERROR HANDLER
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
