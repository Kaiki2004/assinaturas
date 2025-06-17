import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Alterna a visibilidade do menu
  };

  return (
    <nav className="navbar">
      <button className="menu-toggle" aria-label="Toggle navigation" onClick={toggleMenu}>
        &#9776; {/* Ícone de hambúrguer */}
      </button>
      <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        <Link to="/pessoas" className="nav-link">Lista de Cadastrados |</Link>
        <Link to="/uploadpage" className="nav-link">Upload Arquivo |</Link>
        <Link to="/assinaturas" className="nav-link">Assinaturas |</Link>
        <a onClick={handleLogout} className="logout-button">Sair</a>
      </div>
    </nav>
  );
}

export default Navbar;
