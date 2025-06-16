import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  const nomeCorreto = 'admin';
  const senhaCorreta = 'Rzt@2025';

  const handleLogin = (e) => {
    e.preventDefault();

    if (nome === nomeCorreto && senha === senhaCorreta) {
      setErro('');
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/uploadpage');
    } else {
      setErro('Usuário ou senha inválidos!');
    }
  };

  return (
    <div id='container'>
      <div className='login-container'>
        <button  onClick={() => navigate('/')} id="voltar">Voltar</button>
        <h2 style={{ margin: '20px' }}>Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Nome de usuário"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="login-input"
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="login-input"
          />
          <button type="submit" className="login-button">Entrar</button>
        </form>
        {erro && <p className="login-erro">{erro}</p>}
      </div>
    </div>
  );
}

export default Login;
