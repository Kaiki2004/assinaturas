import React, { useState } from 'react';
import Navbar from './NavBar';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');

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

    fetch('http://localhost:3001/api/upload-excel', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        console.log('Resposta:', data);
        alert('Upload e processamento concluídos com sucesso!');
        setFile(null);
        setFileName('');
      })
      .catch(err => {
        console.error('Erro ao enviar:', err);
        alert('Erro ao enviar o arquivo.');
      });
  };

  return (
    <div >
      <Navbar/>
      <div style={styles.container}>
        <h2>Upload de Arquivo Excel</h2>
        
        <div><input type="file" accept=".xlsx,.xls" onChange={handleFileChange} /></div>
        
        {fileName && <p>Arquivo selecionado: <strong>{fileName}</strong></p>}
        
        <button onClick={handleUpload}>Enviar</button>
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
  },
 
};
