import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import './SignDocument.scss';
const SignDocument = () => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<any>(null);
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);

  const sigCanvas = useRef<SignatureCanvas>(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await axios.get(`http://localhost:2000/api/form/${id}`);
        setFormData(res.data);
      } catch (err) {
        console.error('שגיאה בטעינת הטופס', err);
        setMessage('שגיאה בטעינת הטופס');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      setMessage('אנא חתום לפני השליחה');
      return;
    }

    const signatureDataUrl = sigCanvas.current.getCanvas().toDataURL('image/png');

    try {
      setSending(true);
      setMessage('שולח את המסמך...');
      await axios.post(`http://localhost:2000/api/form/sign/${id}`, { signature: signatureDataUrl });

      setSigned(true);
      setMessage('החתימה נשמרה והמסמך נשלח אל השולח.');
      setShowCheckmark(true);

      // העלמת האייקון לאחר 3 שניות
      setTimeout(() => {
        setShowCheckmark(false);
      }, 3000);
    } catch (err: any) {
      console.error('שגיאה בשליחת החתימה:', err.response?.data || err.message);
      setMessage('שגיאה בשליחת החתימה');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p>טוען...</p>;
  if (!formData) return <p>לא נמצא טופס</p>;

  return (
  <div className="SignDocument">
    <h2>חתימה על מסמך</h2>

    {!pdfLoaded && <p style={{ color: 'gray' }}>טוען את המסמך...</p>}

    <iframe
      src={`http://localhost:2000/api/form/view-pdf/${formData.fileName}`}
      width="100%"
      height="800px"
      style={{ border: '3px solid #50a7f9', borderRadius: '8px', display: pdfLoaded ? 'block' : 'none' }}
      title="Document Viewer"
      onLoad={() => setPdfLoaded(true)}
    />

    {!signed && (
      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>חתום כאן (גרפית):</label>
        <div
          style={{
            border: '2px solid #50a7f9',
            width: '400px',
            height: '180px',
            margin: '0 auto 1rem',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f8ff',
          }}
        >
          <SignatureCanvas
            ref={sigCanvas}
            penColor="#50a7f9"
            canvasProps={{ width: 400, height: 180, className: 'sigCanvas' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button type="button" onClick={clearSignature} style={{ padding: '10px 20px' }}>
            נקה חתימה
          </button>
          <button type="submit" disabled={sending} style={{ padding: '10px 20px' }}>
            {sending ? 'שולח...' : 'חתום ושלח'}
          </button>
        </div>
      </form>
    )}

    {message && <p style={{ marginTop: '1rem', textAlign: 'center' }}>{message}</p>}

    {showCheckmark && (
      <div
        style={{
          fontSize: '4rem',
          color: 'green',
          animation: 'pop 0.6s ease-out',
          marginTop: '1rem',
          textAlign: 'center',
        }}
      >
        ✅
        <style>
          {`
            @keyframes pop {
              0% { transform: scale(0); opacity: 0; }
              60% { transform: scale(1.2); opacity: 1; }
              100% { transform: scale(1); }
            }
          `}
        </style>
      </div>
    )}
  </div>
);

};

export default SignDocument;
