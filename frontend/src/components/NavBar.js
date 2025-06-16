// Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();  

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/pessoas" className="nav-link">Lista de Cadastrados</Link> |
      <Link to="/uploadpage" className="nav-link">Upload Arquivo</Link> |
      <Link to="/assinaturas" className="nav-link">Assinaturas</Link> |
      <a onClick={handleLogout} className="logout-button">Sair</a>
    </nav>
  );
}

export default Navbar;
