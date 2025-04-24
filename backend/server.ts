import express, { Application } from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import 'dotenv/config';
import authRoutes from './route/authRoute.js';
import employeeRoutes from './route/employeeRoute.js';
import hrRoutes from './route/hrRoute.js';
import visaRoutes from './route/visaRoute.js';
import onboardingRoutes from './route/onboardingRoute.js';
import documentRoutes from './route/documentRoute.js';
import path from 'path';
import errorHandler from './middleware/errorHandler.js';
import { fileURLToPath } from 'url';

const app: Application = express();
const PORT = process.env.PORT || 5001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api', visaRoutes);
// GLOBAL ERROR HANDLER
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
