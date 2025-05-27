import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Bem-vindo ao Sistema</h1>
      <div style={styles.buttonContainer}>
        <Link to="/assinar" style={styles.link}>
          Fluxo de Assinatura
        </Link>
        <Link to="/login" style={styles.link}>
          Administrativo
        </Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '20px',
    textAlign: 'center',
  },
  title: {
    fontSize: '24px',
    marginBottom: '40px',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
    maxWidth: '300px',
  },
  link: {
    display: 'block',
    padding: '15px',
    fontSize: '16px',
    borderRadius: '8px',
    textDecoration: 'none',
    textAlign: 'center',
    backgroundColor: '#4CAF50',
    color: 'white',
    transition: 'background-color 0.3s ease',
  }
};

export default Home;
