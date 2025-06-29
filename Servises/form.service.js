
const formRepository = require('../Repositories/form.repository');

async function sendFile(req, res) {
  try {
    const { name, email, fileName, senderEmail } = req.body; // הוספנו senderEmail

    const form = await formRepository.addForm({ name, email, fileName, senderEmail }); // מעבירים את המייל

    const link = await formRepository.generateShareLink(form.id);

  await formRepository.sendEmailWithLink(email, link, senderEmail);
// למקבל המייל המקורי

    res.status(200).json({
      message: 'המסמך נשלח בהצלחה',
      link,
      form,
    });
  } catch (error) {
    console.error('❌ שגיאה בשליחה:', error);
    res.status(500).json({
      error: 'שגיאה בשליחה',
      details: error.message,
    });
  }
}


async function uploadForm(name, email, fileName) {
  const newForm = {
    name,
    email,
    fileName,
    createdAt: new Date().toISOString(),
  };
  return formRepository.addForm(newForm);
}

async function viewForm(req, res) {
  const libre = require('libreoffice-convert');
  const path = require('path');
  const fs = require('fs');

  try {
    const fileName = req.params.fileName;
    const inputPath = path.join(__dirname, '..', 'uploads', fileName);
    const outputFileName = fileName.replace(/\.docx?$/, '.pdf');
    const outputPath = path.join(__dirname, '..', 'converted-pdfs', outputFileName);

    if (!fs.existsSync(inputPath)) return res.status(404).send('הקובץ לא קיים');
    if (fs.existsSync(outputPath)) return res.sendFile(outputPath);

    const fileBuffer = fs.readFileSync(inputPath);

    libre.convert(fileBuffer, '.pdf', undefined, (err, done) => {
      if (err) {
        console.error('שגיאה בהמרה:', err);
        return res.status(500).send('שגיאה בהמרה');
      }
      fs.writeFileSync(outputPath, done);
      res.sendFile(outputPath);
    });
  } catch (error) {
    console.error('שגיאה בצפייה במסמך:', error);
    res.status(500).send('שגיאה בצפייה במסמך');
  }
}

module.exports = { sendFile, uploadForm, viewForm };