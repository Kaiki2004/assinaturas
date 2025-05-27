import React, { useEffect, useState } from 'react';
import Navbar from './NavBar';

function ListaAssinaturas() {
  const [assinaturas, setAssinaturas] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/assinaturas')
      .then(res => res.json())
      .then(data => {
        console.log('Dados recebidos:', data);
        setAssinaturas(data.data || []);
      })
      .catch(err => {
        console.error('Erro ao buscar assinaturas:', err);
        setAssinaturas([]);  // Evita erro no map
      });
  }, []);

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2>Lista de Assinaturas</h2>

        {assinaturas && assinaturas.length > 0 ? (
          <div style={styles.grid}>
            {assinaturas.map((assinatura) => (
              <div key={assinatura.Id} style={styles.card}>
                <h3>{assinatura.Nome}</h3>
                <p><strong>CPF:</strong> {assinatura.CPF}</p>
                <div style={styles.imgContainer}>
                  <p>📸 Foto:</p>
                  <img
                    src={assinatura.Foto}
                    alt="Foto"
                    style={styles.img}
                  />
                </div>
                <div style={styles.imgContainer}>
                  <p>🖊️ Assinatura:</p>
                  <img
                    src={assinatura.Assinatura}
                    alt="Assinatura"
                    style={styles.img}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Nenhuma assinatura encontrada.</p>
        )}
      </div>
    </div>
  );
}

export default ListaAssinaturas;

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center'
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    width: '250px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  imgContainer: {
    marginTop: '10px'
  },
  img: {
    width: '100%',
    height: 'auto',
    borderRadius: '4px'
  }
};
