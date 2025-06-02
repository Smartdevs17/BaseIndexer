import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './controllers/api';
import aiRouter from './routes/airoute';
import listenForTransferEvents from './controllers/indexer';
import { error } from 'console';
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3000;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/api', apiRoutes);

app.use('/indexer', aiRouter)
app.get('/', (req, res) => {
  res.json({ message: 'ERC-20 Transfer Indexer API' });
  listenForTransferEvents().catch(error);
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



process.on('SIGINT', async () => {
  console.log('Shutting down API server...');
  process.exit(0);
});