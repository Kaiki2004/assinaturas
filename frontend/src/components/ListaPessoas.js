import React, { useEffect, useState } from 'react';
import Navbar from './NavBar';
import './ListaPessoas.css';

const ListaPessoas = () => {
  const [pessoas, setPessoas] = useState([]);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [matricula, setMatricula] = useState('');
  const [situacao, setStatus] = useState('');
  const [filtroCpf, setFiltroCpf] = useState('');

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/assinaturas`)
      .then(res => res.json())
      .then(data => console.log('Dados recebidos:', data))
      .catch(err => console.error('Erro ao buscar assinaturas:', err));
  }, []);

  const fetchPessoas = () => {
    fetch(`${process.env.REACT_APP_API_URL}/pessoas`)
      .then(res => res.json())
      .then(data => setPessoas(data.data))
      .catch(err => console.error('Erro ao buscar pessoas:', err));
  };

  useEffect(() => {
    fetchPessoas();
  }, []);

  const pessoasFiltradas = pessoas.filter(p =>
    p.CPF.toLowerCase().includes(filtroCpf.toLowerCase())
  );

  const excluirPessoa = (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta pessoa?')) return;

    fetch(`${process.env.REACT_APP_API_URL}/pessoas/${id}`, { method: 'DELETE' })
      .then(res => {
        if (res.ok) fetchPessoas();
        else alert('Erro ao excluir pessoa');
      })
      .catch(err => console.error('Erro ao excluir pessoa:', err));
  };

  const adicionarPessoa = (e) => {
    e.preventDefault();

    fetch(`${process.env.REACT_APP_API_URL}/pessoas`, {
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
      <div className="lista-container">

        <div className='lista-busca'>
          <h2>Buscar pessoas:</h2>
          <input
            type="text"
            placeholder="Buscar por CPF..."
            value={filtroCpf}
            onChange={(e) => setFiltroCpf(e.target.value)}
            className="lista-input"
          />
        </div>

        <form onSubmit={adicionarPessoa} className="lista-form">
          <div>
            <h2>Adicionar Pessoa</h2>
          </div>
          <div className='lista-form'>
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="lista-input"
            />
            <input
              type="text"
              placeholder="CPF"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required
              className="lista-input"
            />
            <input
              type="text"
              placeholder="Empresa"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              required
              className="lista-input"
            />
            <input
              type="text"
              placeholder="Matrícula"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              required
              className="lista-input"
            />
            <input
              type="text"
              placeholder="Status"
              value={situacao}
              onChange={(e) => setStatus(e.target.value)}
              required
              className="lista-input"
            />
            <button type="submit" className="lista-button">Adicionar Pessoa</button>
          </div>

        </form>

        <div className="lista-table-container">
          <table className="lista-table">
            <thead>
              <tr>
                <th className="lista-th">Nome</th>
                <th className="lista-th">CPF</th>
                <th className="lista-th">Empresa</th>
                <th className="lista-th">Matrícula</th>
                <th className="lista-th">Status</th>
                <th className="lista-th">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pessoasFiltradas.map(pessoa => (
                <tr key={pessoa.Id}>
                  <td className="lista-td">{pessoa.Nome}</td>
                  <td className="lista-td">{pessoa.CPF}</td>
                  <td className="lista-td">{pessoa.empresa}</td>
                  <td className="lista-td">{pessoa.matricula}</td>
                  <td className="lista-td">{pessoa.status}</td>
                  <td className="lista-td">
                    <button
                      onClick={() => excluirPessoa(pessoa.Id)}
                      className="lista-excluir"
                    >
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
