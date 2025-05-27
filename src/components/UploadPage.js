import React, { useState } from 'react';

const UploadPage = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) {
      alert('Por favor, selecione um arquivo.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    console.log('Arquivo pronto para envio:', file);

    // Exemplo de envio para API
    // fetch('https://sua-api.com/upload', {
    //   method: 'POST',
    //   body: formData,
    // });

    alert('Upload simulado com sucesso!');
  };

  return (
    <div style={styles.container}>
      <h2>Upload de Arquivo Excel</h2>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
      <button onClick={handleUpload}>Enviar</button>
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
