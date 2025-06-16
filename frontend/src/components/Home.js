import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <h1 className="home-title">Bem-vindo ao Sistema</h1>
      <div className="home-button-container">
        <Link to="/assinar" className="home-link">
          Fluxo de Assinatura
        </Link>
        <Link to="/login" className="home-link">
          Administrativo
        </Link>
      </div>
    </div>
  );
}

export default Home;
