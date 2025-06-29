import React, { FC, useState } from 'react';
import './UploudForm.scss';
import { uploadDocument } from '../../services/formService';

interface UploudFormProps {}

const UploudForm: FC<UploudFormProps> = () => {

      const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      if (!file) {
        setMessage('נא לבחור קובץ');
        return;
      }
  
      try {
        const data = await uploadDocument(name, email, file);
        setMessage('המסמך הועלה בהצלחה!');
       
      } catch (err) {
        console.error(err);
        setMessage('אירעה שגיאה בשליחה');
      }
    };
    
    return (
      <div className="UploudForm">
    <h2>העלאת מסמך לחתימה דיגיטלית</h2>
      
      <form className="UploudForm" onSubmit={handleSubmit}>
        <label>שם </label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
  
        <label>אימייל</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
  
        <label>העלאת מסמך</label>
        <input type="file" accept=".doc,.docx" onChange={(e) => setFile(e.target.files?.[0] || null)} />
  
        <button type="submit">שלח לחתימה</button>
  
        {message && <p>{message}</p>}
      </form>
       </div>
    );
  };
  

 

export default UploudForm;
