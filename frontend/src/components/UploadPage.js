import React, { useState } from 'react';
import Navbar from './NavBar';

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

    const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

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

    console.log('Arquivo pronto para envio:', file);

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
        console.log('Resposta:', xhr.responseText);
        alert('Upload e processamento concluídos com sucesso!');
        setFile(null);
        setFileName('');
        setProgress(0);
        window.location.reload();  // recarrega a página
      } else {
        console.error('Erro ao enviar:', xhr.responseText);
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
      <div style={styles.container}>
        <h2>Upload de Arquivo Excel</h2>

        <div>
          <input id='arquivo' type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
        </div>

        {fileName && <p>Arquivo selecionado: <strong>{fileName}</strong></p>}

        {uploading && (
          <div style={styles.progressContainer}>
            <div style={{ ...styles.progressBar, width: `${progress}%` }}></div>
            <span>{progress}%</span>
          </div>
        )}

        <button style={styles.enviar} onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
};

export default UploadPage;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'center',
    marginTop: '50px',
    width: '90%',
    maxWidth: '400px',
    margin: '50px auto'
  },
  progressContainer: {
    width: '100%',
    backgroundColor: '#f3f3f3',
    borderRadius: '4px',
    overflow: 'hidden',
    margin: '10px 0',
    height: '20px',
    position: 'relative'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    transition: 'width 0.3s ease'
  },
  enviar: {
    width: '100%',
    height: '40px',
    padding: '10px',
    backgroundColor: 'green',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};
