import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/database';
import apiRoutes from './routes/api';
import errorHandler from './middlewares/error.middleware';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Start server
const startServer = async () => {
  await connectDB();
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
};

startServer();

export default app;
