import logger from '#config/logger.js';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// import routes
import authRoutes from '#routes/auth.routes.js';

// Initialize express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// HTTP request logger middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));



// Sample route
app.get('/', (req, res) => {
    logger.info('Root endpoint accessed');
  res.status(200).send('Hello World from Acquisitions API!');
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() });
});
app.get('/api', (req, res) => {
    res.status(200).json({ message: 'API is running' });
});

// Use routes
app.use('/api/auth', authRoutes);


export default app;