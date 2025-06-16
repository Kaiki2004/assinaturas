import React, { useState } from 'react';
import Navbar from './NavBar';
import './UploadPage.css';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      setFile(null);
      setFileName('');
      return;
    }

    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!validTypes.includes(selectedFile.type)) {
      alert('Formato inválido. Apenas arquivos .xls ou .xlsx são permitidos.');
      setFile(null);
      setFileName('');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      alert('Arquivo muito grande. Máximo permitido é 5 MB.');
      setFile(null);
      setFileName('');
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  const handleUpload = () => {
    if (!file) {
      alert('Por favor, selecione um arquivo válido.');
      return;
    }

    const formData = new FormData();
    formData.append('arquivo', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${process.env.REACT_APP_API_URL}/upload-excel`, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        setProgress(percentComplete);
      }
    };

    xhr.onloadstart = () => {
      setUploading(true);
      setProgress(0);
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status === 200) {
        alert('Upload e processamento concluídos com sucesso!');
        setFile(null);
        setFileName('');
        setProgress(0);
        window.location.reload();
      } else {
        alert('Erro ao enviar o arquivo.');
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      alert('Erro de conexão ao enviar o arquivo.');
    };

    xhr.send(formData);
  };

  return (
    <div>
      <Navbar />
      <div className="upload-container">
        <h2>Upload de Arquivo Excel</h2>

        <input
          id="arquivo"
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
        />

        {fileName && (
          <p>
            Arquivo selecionado: <strong>{fileName}</strong>
          </p>
        )}

        {uploading && (
          <div className="upload-progress-container">
            <div
              className="upload-progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
            <span>{progress}%</span>
          </div>
        )}

        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
};

export default UploadPage;
