const express = require('express');
const registrationRoutes = require('./routes/registrationRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.use('/api/registrations', registrationRoutes);

app.use(errorHandler);

module.exports = app;
