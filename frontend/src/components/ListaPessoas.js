import React, { useEffect, useState } from 'react';
import Navbar from './NavBar';

const ListaPessoas = () => {
  const [pessoas, setPessoas] = useState([]);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [matricula, setMatricula] = useState('');
  const [situacao, setStatus] = useState('');
  const [filtroCpf, setFiltroCpf] = useState('');
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('');



  useEffect(() => {
    fetch('http://172.16.4.221:3001/api/assinaturas')
      .then(res => res.json())
      .then(data => {
        console.log('Dados recebidos:', data);
      })
      .catch(err => {
        console.error('Erro ao buscar assinaturas:', err);
      });
  }, []);

  const pessoasFiltradas = pessoas.filter(pessoa =>
    pessoa.CPF.toLowerCase().includes(filtroCpf.toLowerCase()) ||
    pessoa.Nome.toLowerCase().includes(filtroEmpresa.toLowerCase()) ||
    pessoa.empresa.toLowerCase().includes(filtroNome.toLowerCase())
  );

  const fetchPessoas = () => {
    fetch('http://172.16.4.221:3001/api/pessoas')
      .then(res => res.json())
      .then(data => setPessoas(data.data))
      .catch(err => console.error('Erro ao buscar pessoas:', err));
  };

  useEffect(() => {
    fetchPessoas();
  }, []);

  const excluirPessoa = (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta pessoa?')) return;

    fetch(`http://172.16.4.221:3001/api/pessoas/${id}`, { method: 'DELETE' })
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

    fetch('http://172.16.4.221:3001/api/pessoas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, cpf, empresa, matricula, situacao })
    })
      .then(res => {
        if (res.ok) {
          setNome('');
          setCpf('');
          setEmpresa('');
          setMatricula('');
          setStatus('');
          fetchPessoas();  // atualiza a lista corretamente
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

        <div>
          <input
            type="text"
            placeholder="Buscar por CPF..."
            value={filtroCpf}
            onChange={(e) => setFiltroCpf(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Buscar por empresa..."
            value={filtroEmpresa}
            onChange={(e) => setFiltroEmpresa(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            style={styles.input}
          />
        </div>

        <form onSubmit={adicionarPessoa} style={styles.form}>
          <div>
            <h2>Adicionar Pessoa</h2>

          </div>

          <div>
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
            <input
              type="text"
              placeholder="empresa"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="matricula"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="status"
              value={situacao}
              onChange={(e) => setStatus(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div> <button type="submit" style={styles.button}>Adicionar Pessoa</button></div>
        </form>

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nome</th>
                <th style={styles.th}>CPF</th>
                <th style={styles.th}>Empresa</th>
                <th style={styles.th}>Matricula</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pessoasFiltradas.map(pessoa => (
                <tr key={pessoa.Id}>
                  <td style={styles.td}>{pessoa.Nome}</td>
                  <td style={styles.td}>{pessoa.CPF}</td>
                  <td style={styles.td}>{pessoa.empresa}</td>
                  <td style={styles.td}>{pessoa.matricula}</td>
                  <td style={styles.td}>{pessoa.status}</td>
                  <td style={styles.td}>
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

  button: {
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    padding: '10px 20px',

  },
  excluir: {
    padding: '5px 10px',
    backgroundColor: 'red',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    minWidth: '500px',
    mostreOScroller: true

  },
  th: {
    padding: '8px',
    textAlign: 'left',
    border: '1px solid black',
  },
  td: {
    padding: '8px',
    textAlign: 'left',
    border: '1px solid black',
  },
  input: {
    width: '100%',
    maxWidth: '300px',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '16px',
    marginRight: '10px',
    marginBottom: '10px'
  },


};
