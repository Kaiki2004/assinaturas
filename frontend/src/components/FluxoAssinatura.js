import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function FluxoAssinatura() {
  const [cpf, setCpf] = useState('');
  const [nome, setNome] = useState('');
  const [autorizado, setAutorizado] = useState(false);
  const [fotoBase64, setFotoBase64] = useState('');
  const assinaturaCanvas = useRef(null);
  const videoRef = useRef(null);
  const fotoCanvas = useRef(null);
  const [desenhando, setDesenhando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (autorizado && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        })
        .catch((err) => {
          console.error('Erro ao acessar a câmera:', err);
          Swal.fire({
            icon: 'error',
            title: 'Erro na Câmera',
            text: 'Não foi possível acessar a câmera.',
          });
        });
    } else if (autorizado) {
      Swal.fire({
        icon: 'error',
        title: 'Navegador incompatível',
        text: 'Seu navegador não suporta acesso à câmera neste ambiente.',
      });
    }
  }, [autorizado]);


  useEffect(() => {
    const canvas = assinaturaCanvas.current;
    if (!canvas) return;

    const bloquearScroll = (e) => {
      e.preventDefault();
    };

    return () => {
      canvas.removeEventListener('touchstart', bloquearScroll);
      canvas.removeEventListener('touchmove', bloquearScroll);
      canvas.removeEventListener('touchend', bloquearScroll);
    };
  }, []);



  const capturarFoto = () => {
    const context = fotoCanvas.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 300, 200);
    const foto = fotoCanvas.current.toDataURL('image/png');
    setFotoBase64(foto);
    Swal.fire({
      icon: 'success',
      title: 'Foto capturada!',
      showConfirmButton: false,
      timer: 1500
    });

  };

  const validarCpf = async () => {
    try {
      const response = await fetch('http://172.16.4.221:3001/api/validar-cpf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf })
      });

      if (response.ok) {
        const data = await response.json();
        setNome(data.nome);
        setAutorizado(true);
        Swal.fire({
          icon: 'success',
          title: `CPF válido`,
          text: `Bem-vindo, ${data.nome}!`,
          confirmButtonColor: '#4CAF50'
        });

      } else {
        const erro = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'CPF Inválido',
          text: erro.error || 'CPF não autorizado',
          confirmButtonColor: '#d33'
        });

      }
    } catch (err) {
      console.error('Erro ao validar CPF:', err);
      alert('❌ Erro na validação do CPF.');
    }
  };

  const limparAssinatura = () => {
    const ctx = assinaturaCanvas.current.getContext('2d');
    ctx.clearRect(0, 0, assinaturaCanvas.current.width, assinaturaCanvas.current.height);
  };

  const registrarAssinatura = async () => {
    const assinaturaBase64 = assinaturaCanvas.current.toDataURL();

    try {
      const response = await fetch('http://172.16.4.221:3001/api/registrar-assinatura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf,
          assinatura: assinaturaBase64,
          foto: fotoBase64 // ← agora enviamos também a foto
        })
      });

      const responseText = await response.text();
      console.log('Resposta bruta:', responseText);

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Assinatura registrada com sucesso! 🎉',
          text: 'Cesta liberada!',
          confirmButtonColor: '#4CAF50'
        }).then(() => window.location.reload());
      } else {
        try {
          const erro = JSON.parse(responseText);
          alert(`❌ ${erro.error}`);
          window.location.reload();
        } catch {
          alert(`❌ Erro: ${responseText}`);
        }
      }
    } catch (err) {
      console.error('Erro ao registrar assinatura:', err);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao registrar assinatura.',
      });
    }
  };


  const iniciarDesenho = (e) => {
    e.preventDefault();
    setDesenhando(true);
    const ctx = assinaturaCanvas.current.getContext('2d');
    ctx.beginPath();

    // Bloqueia o scroll da tela durante o desenho
    document.body.style.overflow = 'hidden';

    // Bloqueia movimento de rolagem por touch no celular
    document.addEventListener('touchmove', impedirScroll, { passive: false });
  };

  const pararDesenho = (e) => {
    e.preventDefault();
    setDesenhando(false);

    // Libera o scroll da tela após o desenho
    document.body.style.overflow = '';

    // Remove o bloqueio de touchmove
    document.removeEventListener('touchmove', impedirScroll);
  };

  const impedirScroll = (e) => {
    e.preventDefault();
  };


  const desenhar = (e) => {
    if (!desenhando) return;

    const ctx = assinaturaCanvas.current.getContext('2d');
    const rect = assinaturaCanvas.current.getBoundingClientRect();

    let x, y;
    if (e.touches) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleSair = () => {
    navigate('/');
  };

  return (
    <div style={styles.container}>
      <a href='/' style={styles.voltar} onClick={handleSair}>Voltar</a>
      {!autorizado ? (
        <div style={styles.card}>
          <h2>Digite seu CPF:</h2>
          <input
            style={styles.input}
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="Digite seu CPF"
          />
          <button style={styles.button} onClick={validarCpf}>Validar CPF</button>
        </div>
      ) : (
        <div style={styles.card}>
          <h3 style={styles.titulo}>Bem-vindo, {nome}!</h3>

          <h4>Foto:</h4>
          <video
            ref={videoRef}
            width="500"
            height="400"
            autoPlay
            muted
            playsInline
            style={styles.video}
          />

          <canvas
            ref={fotoCanvas}
            width={300}
            height={200}
            style={{ display: 'none' }}
          />


          <div style={styles.buttonsRow}>
            <button style={styles.button} onClick={capturarFoto}>Capturar Foto</button>
          </div>

          {fotoBase64 && (
            <div style={styles.cameraContainer}>
              <img src={fotoBase64} alt="Foto Capturada" style={styles.fotoPreview} />
            </div>
          )}

          <h4>Assinatura:</h4>
          <canvas
            ref={assinaturaCanvas}
            width={600}
            height={250}
            style={styles.assinatura}
            onMouseDown={iniciarDesenho}
            onMouseUp={pararDesenho}
            onMouseMove={desenhar}
            onTouchStart={iniciarDesenho}
            onTouchEnd={pararDesenho}
            onTouchMove={desenhar}
          ></canvas>

          <div style={styles.buttonsRow}>
            <button style={styles.limpar} onClick={limparAssinatura}>Limpar</button>
            <button
              style={styles.button}
              onClick={registrarAssinatura}
              disabled={!fotoBase64}
            >
              Registrar Assinatura
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FluxoAssinatura;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    overflowY: 'auto',
    maxHeight: '100vh', 
  },
  card: {
    maxWidth: '600px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: '40px',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '16px',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  limpar: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'goldenrod',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  cameraContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
  },
  camera: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  video: {
    width: '500px',
    height: '250px',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },
  assinatura: {
    width: '100%',
    maxWidth: '700px',
    height: '250px',
    border: '1px dotted black',
    cursor: 'crosshair',
  },
  buttonsRow: {
    display: 'flex',
    gap: '10px',
    width: '100%',
  },
  titulo: {
    fontSize: '20px',
    marginBottom: '10px',
    backgroundColor: '#64d964',
    borderRadius: '5px',
    padding: '10px',
    textAlign: 'center',
  },
  voltar: {
    position: 'absolute',
    backgroundColor: 'none',
    color: 'black',
    textDecoration: 'none',
    top: '10px',
    left: '10px',
    padding: '10px',
    fontSize: '14px',
    cursor: 'pointer',
    border: 'none'
  },
  buttonCapitura: {
    with: '100%',
    margin: '10px',
    padding: '10px',
    backgroundColor: 'grey',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  fotoPreview: {
    with: '100%',
    margin: '10px',
    padding: '10px',
    backgroundColor: 'grey',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
  }
};
