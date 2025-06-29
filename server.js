const express = require('express');
const cors = require('cors');
const formRouter = require('./Routs/form.rout');
const app = express();
const path = require('path');
require('dotenv').config();

const port = process.env.PORT || 10000;

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

// Catch-all route for React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
