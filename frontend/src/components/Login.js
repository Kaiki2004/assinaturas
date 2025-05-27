import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div style={styles.container}>
      <a onClick={() => navigate('/')} style={styles.voltar} >Voltar</a>
      <h2>Login</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <input
          type="text"
          placeholder="Nome de usuário"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={styles.input}
        />
          <button type="submit" style={styles.button}>Entrar</button>
          
      </form>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
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
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '250px',
  },
  input: {
    padding: '10px',
    fontSize: '14px',
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  voltar: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    padding: '10px',
    fontSize: '14px',
    cursor: 'pointer',
  },
};

export default Login;
