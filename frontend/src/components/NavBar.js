import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();  

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/pessoas" style={styles.link}>Lista de Cadastrados</Link> |
      <Link to="/uploadpage" style={styles.link}>Upload Arquivo</Link> |
      <Link to="/assinaturas" style={styles.link}>Assinaturas</Link> |
      <a onClick={handleLogout} style={styles.logoutButton}>Sair</a>
    </nav>
  );
}

const styles = {
  nav: {
    padding: '10px',
    backgroundColor: 'green',
    color: 'white',
    textAlign: 'center',
  },
  link: {
    margin: '0 10px',
    color: 'white',
    textDecoration: 'none',
  },
  logoutButton: {
    marginLeft: '10px',
    padding: '5px 10px',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  }
};

export default Navbar;
