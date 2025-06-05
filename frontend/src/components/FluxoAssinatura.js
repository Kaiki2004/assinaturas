import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function FluxoAssinatura() {

  const API_URL = process.env.REACT_APP_API_URL;
  if (!API_URL) {
    throw new Error('❌ ERRO: A variável de ambiente REACT_APP_API_URL não está definida.');
  }

  const [cpf, setCpf] = useState('');
  const [nome, setNome] = useState('');
  const [autorizado, setAutorizado] = useState(false);
  const [fotoBase64, setFotoBase64] = useState('');
  const assinaturaCanvas = useRef(null);
  const videoRef = useRef(null);
  const fotoCanvas = useRef(null);
  const [desenhando, setDesenhando] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const [assinaturas, setAssinaturas] = useState(false);

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
      const response = await fetch(`${API_URL}/validar-cpf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.assinouRecentemente) {
          Swal.fire({
            icon: 'info',
            title: 'Assinatura recente detectada',
            text: `Já assinado`,
            confirmButtonColor: '#3085d6',
          });
          return;
        }

        setNome(data.nome);
        setAutorizado(true);

        Swal.fire({
          icon: 'success',
          title: `CPF válido`,
          text: `Bem-vindo, ${data.nome}!`,
          confirmButtonColor: '#4CAF50'
        });

      } else {
        Swal.fire({
          icon: 'error',
          title: 'CPF Inválido',
          text: data.error || 'CPF não autorizado',
          confirmButtonColor: '#d33'
        });
      }
    } catch (err) {
      console.error('Erro ao validar CPF:', err);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro na validação do CPF.',
      });
    }
  };

  const bloqueio20 = async () => {
    try {
      const response = await fetch(`${API_URL}/validar-bloqueio-20`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf })
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        const text = await response.text();
        console.error('Resposta não é JSON. Conteúdo recebido:', text);
        throw new Error('Resposta inválida do servidor.');
      }

      if (response.ok && data.bloqueio20) {
        Swal.fire({
          icon: 'info',
          title: 'Problema detectado',
          text: `Procure o RH`,
          confirmButtonColor: '#3085d6',
        });
        return true;
      }

      return false;

    } catch (error) {
      console.error('Erro ao verificar bloqueio de 20 dias:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Erro ao verificar bloqueio. Tente novamente.',
      });
      return true;
    }
  };





  const limparAssinatura = () => {
    const ctx = assinaturaCanvas.current.getContext('2d');
    ctx.clearRect(0, 0, assinaturaCanvas.current.width, assinaturaCanvas.current.height);
  };

  const registrarAssinatura = async () => {
    if (!assinaturaCanvas.current) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: 'Área de assinatura não carregada. Tente novamente.',
      });
      return;
    }

    const assinaturaBase64 = assinaturaCanvas.current.toDataURL();

    try {
      const response = await fetch(`${API_URL}/registrar-assinatura`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf,
          assinatura: assinaturaBase64,
          foto: fotoBase64
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


  const impedirScroll = (e) => {
    e.preventDefault();
  };
  const iniciarDesenho = (e) => {
    e.preventDefault();
    setDesenhando(true);
    const ctx = assinaturaCanvas.current.getContext('2d');
    ctx.beginPath();

    // Bloqueia o scroll da tela durante o desenho
    //document.body.style.overflow = 'hidden';

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
          <button
            style={styles.button}
            onClick={async () => {
              const bloqueado = await bloqueio20();
              if (!bloqueado) {
                validarCpf();
              }
            }}
          >
            Validar CPF
          </button>

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
            <button style={styles.button} onClick={() => { capturarFoto(); setAssinaturas(true); }}>Capturar Foto</button>
          </div>

          {fotoBase64 && (
            <div style={styles.cameraContainer}>
              <img src={fotoBase64} alt="Foto Capturada" style={styles.fotoPreview} />
            </div>
          )}
          {showModal && (
            <>
              <div style={styles.showModal}>

                <div>
                  <div  >
                    <h4 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>ASSINATURA:</h4>
                    <div >
                      <canvas
                        ref={assinaturaCanvas}
                        style={styles.canvas}
                        onMouseDown={iniciarDesenho}
                        onMouseUp={pararDesenho}
                        onMouseMove={desenhar}
                        onTouchStart={iniciarDesenho}
                        onTouchEnd={pararDesenho}
                        onTouchMove={desenhar}
                      ></canvas>
                    </div>
                  </div>
                  <div style={styles.buttonsRow}>
                    <button style={styles.limpar} onClick={limparAssinatura}>Limpar</button>
                    <button
                      style={styles.button}
                      onClick={() => { registrarAssinatura(); setShowModal(false) }}
                    >
                      Registrar
                    </button>

                  </div>
                </div>
              </div>
            </>
          )}

          {assinaturas && <button id='assinar' style={styles.button} onClick={() => setShowModal(true)}>Assinar</button>}


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
    height: '40px',
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
    height: '250px',
    width: '100%',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },

  canvas: {
    width: '100%',
    height: '100%',
    border: '1px solid black',
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
  },
  showModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  }
};
