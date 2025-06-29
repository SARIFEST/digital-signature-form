

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const libre = require('libreoffice-convert');
const { PDFDocument } = require('pdf-lib');
require('dotenv').config();

const formService = require('../Servises/form.service');
const formRepository = require('../Repositories/form.repository');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// העלאת קובץ Word
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  res.json({ fileName: req.file.filename });
});

// יצירת טופס ושמירת נתוני משתמש ושליחת מייל עם לינק לחתימה
router.post('/send', formService.sendFile);

// הצגת טופס לפי מזהה
router.get('/:id', (req, res) => {
  const form = formRepository.getFormById(req.params.id);
  if (!form) return res.status(404).json({ error: 'Form not found' });
  res.json(form);
});

// הצגת PDF מומר (Word -> PDF)
router.get('/view-pdf/:fileName', formService.viewForm);

// הצגת קובץ Word ישירות
router.get('/view/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, '..', 'uploads', fileName);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
  res.sendFile(filePath);
});

// טיפול בחתימה - המרת Word ל-PDF, הוספת חתימה ושליחת מיילים
router.post('/sign/:id', async (req, res) => {
  try {
    const { signature } = req.body;
    const forms = formRepository.getForms();
    const index = forms.findIndex(f => f.id === req.params.id);
    if (index === -1) return res.status(404).send('Form not found');

    const form = forms[index];
    form.signature = signature;
    form.signed = true;

    const originalPath = path.join(__dirname, '../uploads', form.fileName);

    // בדיקה אם הקובץ קיים לפני ההמרה
    if (!fs.existsSync(originalPath)) {
      console.error('File not found:', originalPath);
      return res.status(404).send('Original file not found');
    }

    const outputFileName = form.fileName.replace('.docx', `-signed-${Date.now()}.pdf`);
    const outputPath = path.join(__dirname, '../signed_documents', outputFileName);

    const fileBuffer = fs.readFileSync(originalPath);

    libre.convert(fileBuffer, '.pdf', undefined, async (err, done) => {
      if (err) {
        console.error('Libre conversion error:', err);
        return res.status(500).send('Error converting file');
      }

      try {
        const pdfDoc = await PDFDocument.load(done);
        const pngImage = await pdfDoc.embedPng(
          Buffer.from(signature.replace(/^data:image\/\w+;base64,/, ''), 'base64')
        );

        const pages = pdfDoc.getPages();
        // את המיקום של החתימה תוכל לשנות לפי הצורך
        pages[0].drawImage(pngImage, { x: 50, y: 50, width: 200, height: 100 });

        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(outputPath, pdfBytes);

        form.signedFileName = outputFileName;
        formRepository.saveForms(forms);

        await formRepository.sendEmailWithFile(form.email, outputPath);
        if (form.uploadedByEmail) {
          await formRepository.sendEmailWithFile(form.uploadedByEmail, outputPath, {
            signerName: form.name,
            signerEmail: form.email
          });
        }

        res.json({ message: 'המסמך נחתם ונשלח לשני הצדדים' });

      } catch (pdfErr) {
        console.error('PDF-lib error:', pdfErr);
        return res.status(500).send('Error processing PDF');
      }
    });
  } catch (err) {
    console.error('Unexpected error in /sign/:id:', err);
    res.status(500).send('שגיאה בחתימה');
  }
});

module.exports = router;
