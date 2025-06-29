import axios from 'axios';
export async function uploadDocument(name: string, email: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  // שלב 1: העלאת הקובץ
  const uploadRes = await axios.post('http://localhost:2000/api/form/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  const fileName = uploadRes.data.fileName;

  // שלב 2: שליחת נתוני הטופס ושמירה
  const sendRes = await axios.post('http://localhost:2000/api/form/send', {
    name,
    email,
    fileName
  });

  return sendRes.data; // מחזיר גם את ה־link עם מזהה ה־UUID
}


export function getFileNameById(id: string) {
  return axios.get(`http://localhost:2000/api/form/get-file-name/${id}`);
}

export function downloadFile(id: string) {
  window.open(`http://localhost:2000/api/form/view/${id}`, '_blank');
}




export function sendSignedForm(email: string, signedFileName: string) {
  return axios.post('http://localhost:2000/api/form/send-signed', {
    email,
    signedFileName,
  });
}
export function GetFormById(formId: string) {
  return axios.get(`http://localhost:2000/api/form/${formId}`);
}
//משתמשת
//העלת קובץ חתום
export function submitSignature(id: string, signature: string) {
  return axios.post(`http://localhost:2000/sign/${id}`, { signature });
}

export async function uploadSignedDocument(id: string, signedFile: File) {
  const formData = new FormData();
  formData.append('signedFile', signedFile);
  formData.append('id', id);

  return axios.post('http://localhost:2000/api/form/upload-signed', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}
