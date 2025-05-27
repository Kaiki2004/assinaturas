import React, { useEffect, useState } from 'react';
import Navbar from './NavBar';

const ListaPessoas = () => {
  const [pessoas, setPessoas] = useState([]);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');

  const fetchPessoas = () => {
    fetch('http://localhost:3001/api/pessoas')
      .then(res => res.json())
      .then(data => setPessoas(data.data))
      .catch(err => console.error('Erro ao buscar pessoas:', err));
  };

  useEffect(() => {
    fetchPessoas();
  }, []);

  const excluirPessoa = (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta pessoa?')) return;

    fetch(`http://localhost:3001/api/pessoas/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) {
          fetchPessoas();
        } else {
          alert('Erro ao excluir pessoa');
        }
      })
      .catch(err => console.error('Erro ao excluir pessoa:', err));
  };

  const adicionarPessoa = (e) => {
    e.preventDefault();

    fetch('http://localhost:3001/api/pessoas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, cpf })
    })
      .then(res => {
        if (res.ok) {
          setNome('');
          setCpf('');
          fetchPessoas();
        } else {
          res.json().then(data => alert(data.error || 'Erro ao adicionar pessoa'));
        }
      })
      .catch(err => console.error('Erro ao adicionar pessoa:', err));
  };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <h2>Lista de Pessoas</h2>
        <form onSubmit={adicionarPessoa} style={styles.form}>
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="text"
            placeholder="CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Adicionar Pessoa</button>
        </form>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pessoas.map(pessoa => (
                <tr key={pessoa.Id}>
                  <td>{pessoa.Id}</td>
                  <td>{pessoa.Nome}</td>
                  <td>{pessoa.CPF}</td>
                  <td>
                    <button onClick={() => excluirPessoa(pessoa.Id)} style={styles.excluir}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListaPessoas;

const styles = {
  container: {
    padding: '20px',
    maxWidth: '900px',
    margin: '0 auto'
  },
  form: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '20px',
  },
  input: {
    flex: '1 1 150px',
    padding: '10px',
    fontSize: '14px',
    width: '100%',
    minWidth: '120px',
    boxSizing: 'border-box'
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    flex: '1 1 150px',
    minWidth: '120px'
  },
  excluir: {
    padding: '5px 10px',
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    minWidth: '500px'
  }
};
