import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(compression());
app.use(express.json());

// API Routes
app.use('/api/v1/map', apiRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error Handler
app.use(errorHandler);

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${port}`);
});
