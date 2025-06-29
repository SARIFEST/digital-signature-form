

const path = require('path');
const fs = require('fs');
const libre = require('libreoffice-convert');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
require('dotenv').config();

const formsFilePath = path.join(__dirname, '..', 'data', 'forms.json');

function getForms() {
  if (!fs.existsSync(formsFilePath)) {
    fs.writeFileSync(formsFilePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(formsFilePath, 'utf-8');
  return JSON.parse(data);
}

function saveForms(forms) {
  fs.writeFileSync(formsFilePath, JSON.stringify(forms, null, 2), 'utf-8');
}

async function addForm({ name, email, fileName, senderEmail }) {
  const id = uuidv4();
  const forms = getForms();
  const newForm = {
    id,
    name,
    email,
    fileName,
    signedFileName: '',
    uploadedByEmail: senderEmail || process.env.EMAIL_USER, // ✅ מייל השולח
  };

  forms.push(newForm);
  saveForms(forms);
  return newForm;
}

function getFormById(id) {
  const forms = getForms();
  return forms.find(form => form.id === id) || null;
}

async function sendEmailWithFile(email, filePath, signerInfo = {}) {
  const { signerName, signerEmail } = signerInfo;
  const htmlMessage = `
    <p>מצורף המסמך החתום.</p>
    ${signerName && signerEmail ? `
      <p><strong>נחתם על ידי:</strong></p>
      <ul>
        <li>שם: ${signerName}</li>
        <li>אימייל: ${signerEmail}</li>
      </ul>
    ` : ''}
  `;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"חתימה דיגיטלית" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'המסמך החתום שלך',
    html: htmlMessage,
    attachments: [{ filename: path.basename(filePath), path: filePath }],
  });
}

async function sendEmailWithLink(email, link, senderEmail) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"חתימה דיגיטלית" <${process.env.EMAIL_USER}>`,
    to: email,
    replyTo: senderEmail, // 📨 מי שיקבל את המייל יוכל להשיב לשולח
    subject: 'קיבלת מסמך לחתימה',
    html: `
      <p>שלום,</p>
      <p>קיבלת מסמך לחתימה:</p>
      <a href="${link}">${link}</a>
      <br><br>
      <p style="color:gray">המסמך נשלח על ידי: ${senderEmail}</p>
    `,
  });
}


async function generateShareLink(id) {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  return `${baseUrl}/sign/${encodeURIComponent(id)}`;
}

module.exports = {
  getForms,
  saveForms,
  addForm,
  getFormById,
  sendEmailWithFile,
  sendEmailWithLink,
  generateShareLink,
};
