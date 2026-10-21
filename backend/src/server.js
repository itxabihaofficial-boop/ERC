require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pino = require('pino');
const pinoHttp = require('pino-http');

const apiRoutes = require('./routes');
const { loginPage } = require('./modules/auth/auth.page');

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(pinoHttp({ logger }));

app.get('/', (req, res) => {
  res.type('html').send(loginPage());
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api', apiRoutes);

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  logger.info(`API listening on http://localhost:${port}`);
});
