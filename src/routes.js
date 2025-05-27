import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import SignaturePad from './components/SignaturePad';
import UploadPage from './components/UploadPage';
import CameraCapture from './components/CameraCapture';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
      <Route path="camera" element={<CameraCapture />} />
        <Route index element={<SignaturePad />} />
        <Route path="upload" element={<UploadPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
