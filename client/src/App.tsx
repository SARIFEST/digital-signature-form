import React from 'react';
import logo from './logo.svg';
import './App.css';

import { Route, Routes } from 'react-router';


import UploudForm from './components/UploudForm/UploudForm';
import SignDocument from './components/SignDocument/SignDocument';




function App() {
  return (
    <div className="App">
  
       <Routes>
        <Route path="/" element={<UploudForm></UploudForm>} />
        <Route path="/form" element={<UploudForm></UploudForm>} />
        <Route path="/sign/:id" element={<SignDocument></SignDocument>} />
         </Routes>
      
        {/* <Route path="/" element={<UploadForm />} />
        <Route path="/sign/:documentId" element={<SignDocument />} /> */}
      
    

     
    </div>
  
  );
}

export default App;
