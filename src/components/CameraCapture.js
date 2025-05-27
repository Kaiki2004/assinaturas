import React, { useRef, useState, useEffect } from 'react';

const CameraCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/png');
    setCapturedImage(imageData);
  };

  const handleSave = () => {
    if (!capturedImage) return;
    console.log('Imagem capturada Base64:', capturedImage);

    // Exemplo de envio para backend:
    // fetch('https://sua-api.com/upload', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ imagem: capturedImage }),
    // });

    alert('Imagem salva!');
  };

  return (
    <div style={styles.container}>
      <video ref={videoRef} autoPlay style={styles.video}></video>

      <button onClick={capturePhoto} style={styles.button}>Capturar Foto</button>

      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      {capturedImage && (
        <div style={styles.preview}>
          <h3>Pré-visualização:</h3>
          <img src={capturedImage} alt="Captura" style={styles.image} />
          <button onClick={handleSave} style={styles.button}>Salvar</button>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    marginTop: '20px',
  },
  video: {
    width: '100%',
    maxWidth: '500px',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px 20px',
    cursor: 'pointer',
  },
  preview: {
    marginTop: '20px',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    maxWidth: '500px',
    borderRadius: '8px',
  },
};
