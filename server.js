

const express = require('express');
const cors = require('cors');
const formRouter = require('./Routs/form.rout');
const app = express();
const path = require('path');

const host_name = process.env.HOST_NAME || '127.0.0.1';
const port = process.env.PORT;
app.use(cors());
app.use(express.json());
require('dotenv').config();

app.use(express.json({ limit: '10mb' }));
 // להגדיל אם צריך כדי לקבל חתימה גדולה


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/converted-pdfs', express.static(path.join(__dirname, 'converted-pdfs')));

app.use(express.static(path.join(__dirname, 'build')));



app.use('/api/form', formRouter);


app.use(express.static(path.join(__dirname, 'client/build')));

// כל נתיב שלא נמצא – מחזיר index.html של React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});


app.listen(port, host_name, () => {
        console.log(`server is up in address http://${host_name}:${port}`);

});

