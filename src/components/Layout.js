import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <nav style={styles.nav}>
          <Link to="/" style={styles.link}>Assinatura</Link>
          <Link to="/upload" style={styles.link}>Upload Excel</Link>
          <Link to="/camera" style={styles.link}>Câmera</Link>
        </nav>
      </header>

      <main style={styles.main}>
        <Outlet /> {/* Aqui renderiza a página atual */}
      </main>

      <footer style={styles.footer}>
        <p>&copy; 2025 - Sistema de Assinaturas</p>
      </footer>
    </div>
  );
};

export default Layout;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  header: {
    backgroundColor: '#eee',
    padding: '10px',
  },
  nav: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
  },
  link: {
    textDecoration: 'none',
    color: 'black',
    fontWeight: 'bold',
  },
  main: {
    flex: 1,
    padding: '20px',
  },
  footer: {
    backgroundColor: '#eee',
    padding: '10px',
    textAlign: 'center',
  },
};
