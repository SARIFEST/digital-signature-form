const path = require('path');
const fs = require('fs');
const libre = require('libreoffice-convert');

exports.convertToPdf = (req, res) => {
  const { id } = req.params;
  const form = require('../Repositories/form.repository').getFormById(id);
  if (!form) return res.status(404).send('Form not found');

  const filePath = path.join(__dirname, '../uploads', form.fileName);
  const file = fs.readFileSync(filePath);
  const ext = '.pdf';

  libre.convert(file, ext, undefined, (err, done) => {
    if (err) {
      console.error(`Error converting file: ${err}`);
      return res.status(500).send('Error converting file');
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.send(done);
  });
};
