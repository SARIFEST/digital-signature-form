// const formRepository = require('../Repositories/form.repository');
// const nodemailer = require('nodemailer');
// const path = require('path');
// const fs = require('fs');


//  async function sendSignedFileByEmail(email, signedFileName) {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'your@email.com',
//       pass: 'your-app-password',
//     },
//   });

//   const filePath = path.join('signed_documents', signedFileName); // נניח שכאן שמור הקובץ החתום

//   const mailOptions = {
//     from: 'your@email.com',
//     to: email,
//     subject: 'המסמך החתום ששלחת לחתימה',
//     text: 'הנה המסמך החתום כפי שביקשת.',
//     attachments: [
//       {
//         filename: signedFileName,
//         path: filePath,
//       },
//     ],
//   };

// try {
//   await transporter.sendMail(mailOptions);
//   console.log('✉️ מייל נשלח ל:', email);
// } catch (err) {
//   console.error('❌ שגיאה בשליחת מייל:', err);
//   throw err; // כדי שיעלה ל־sendFile
// }

// }


// async function sendFile(req, res) {
//   try {
//     const { name, email, fileName } = req.body;
//     console.log('📨 קיבלתי נתונים:', name, email, fileName);

//     const form = await formRepository.addForm({ name, email, fileName });
//     console.log('✅ נוצר טופס עם מזהה:', form.id);

//     const link = await formRepository.generateShareLink(form.id);
//     console.log('🔗 הלינק שנוצר:', link);

//     await formRepository.sendEmailWithLink(email, link);
//     console.log('✉️ המייל נשלח בהצלחה ל:', email);

//     res.status(200).json({
//       message: 'המסמך נשלח בהצלחה',
//       link,
//       form,
//     });
//   } catch (error) {
//     console.error('❌ שגיאה בשליחה:', error);
//     res.status(500).json({
//       error: 'שגיאה בשליחה',
//       details: error.message,
//     });
//   }
// }



// async function uploadForm(name, email, fileName) {
//   const newForm = {
//     name,
//     email,
//     fileName,
//     createdAt: new Date().toISOString(),
//   };
//   return addForm(newForm);
// }

// async function viewForm(req, res) {
//   try {
//     await formRepository.handlePdfConversion(req, res);
//   } catch (error) {
//     console.error('שגיאה בצפייה במסמך:', error);
//     res.status(500).send('שגיאה בצפייה במסמך');
//   }
// }

// module.exports = { sendFile,uploadForm,viewForm }
const formRepository = require('../Repositories/form.repository');

async function sendFile(req, res) {
  try {
    const { name, email, fileName, senderEmail } = req.body; // הוספנו senderEmail

    const form = await formRepository.addForm({ name, email, fileName, senderEmail }); // מעבירים את המייל

    const link = await formRepository.generateShareLink(form.id);

    await formRepository.sendEmailWithLink(email, link); // למקבל המייל המקורי

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