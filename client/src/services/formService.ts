import axios from 'axios';
export async function uploadDocument(name: string, email: string, file: File, senderEmail: string) {
  const formData = new FormData();
  formData.append('file', file);

  const uploadRes = await axios.post('/api/form/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  const fileName = uploadRes.data.fileName;

  // שליחת כל הנתונים לשרת
  const sendRes = await axios.post('/api/form/send', {
    name,
    email,
    fileName,
    senderEmail
  });

  return sendRes.data;
}



export function getFileNameById(id: string) {
  return axios.get(`/api/form/get-file-name/${id}`);
}

export function downloadFile(id: string) {
  window.open(`/api/form/view/${id}`, '_blank');
}




export function sendSignedForm(email: string, signedFileName: string) {
  return axios.post('/api/form/send-signed', {
    email,
    signedFileName,
  });
}
export function GetFormById(formId: string) {
  return axios.get(`/api/form/${formId}`);
}
//משתמשת
//העלת קובץ חתום
export function submitSignature(id: string, signature: string) {
  return axios.post(`/sign/${id}`, { signature });
}

export async function uploadSignedDocument(id: string, signedFile: File) {
  const formData = new FormData();
  formData.append('signedFile', signedFile);
  formData.append('id', id);

  return axios.post('/api/form/upload-signed', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}
