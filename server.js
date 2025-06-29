const express = require('express');
const cors = require('cors');
const formRouter = require('./Routs/form.rout');
const app = express();
const path = require('path');
require('dotenv').config();

const host_name = process.env.HOST_NAME || '127.0.0.1';
const port = process.env.PORT;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files (uploads + PDFs)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/converted-pdfs', express.static(path.join(__dirname, 'converted-pdfs')));

// API routes
app.use('/api/form', formRouter);

// React build
app.use(express.static(path.join(__dirname, 'client/build')));

// Catch-all route (must be LAST!)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// Start server
app.listen(port, host_name, () => {
  console.log(`Server is up at http://${host_name}:${port}`);
});
