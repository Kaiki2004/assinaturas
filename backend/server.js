const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));
const upload = multer();
app.use(cors());

// Dados em memória
const pessoas = [];
const assinaturas = [];

// Validação de CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0, resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  return resto === parseInt(cpf.substring(10, 11));
}

// Upload e processamento de Excel
app.post('/api/upload-excel', upload.single('arquivo'), (req, res) => {
  const arquivo = req.file;
  if (!arquivo) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

  try {
    const workbook = xlsx.read(arquivo.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    pessoas.length = 0; // limpa os dados
    assinaturas.length = 0;

    jsonData.forEach(row => {
      const nome = row.NOME?.toUpperCase().trim();
      const cpf = String(row.CPF || '').trim();
      const empresa = row.EMP?.toUpperCase().trim() || '';
      const matricula = row.COD?.toUpperCase().trim() || '';
      const status = row.CESTA?.toUpperCase().trim() || '';

      if (nome && cpf && validarCPF(cpf)) {
        pessoas.push({ id: pessoas.length + 1, nome, cpf, empresa, matricula, status });
      }
    });

    res.json({ message: `${pessoas.length} registros inseridos com sucesso!` });

  } catch (err) {
    console.error('Erro:', err);
    res.status(500).json({ error: 'Erro ao processar o arquivo Excel.' });
  }
});

// Listar pessoas com busca e paginação
app.get('/api/pessoas', (req, res) => {
  const { page = 1, limit = 5, search = '' } = req.query;
  const filtro = pessoas.filter(p =>
    p.nome.includes(search.toUpperCase()) || p.cpf.includes(search)
  );
  const start = (page - 1) * limit;
  const paginado = filtro.slice(start, start + Number(limit));
  res.json({ data: paginado, total: filtro.length });
});

// Adicionar pessoa
app.post('/api/pessoas', (req, res) => {
  let { nome, cpf, empresa, matricula, situacao } = req.body;
  if (!validarCPF(cpf)) return res.status(400).json({ error: 'CPF inválido.' });

  if (pessoas.find(p => p.cpf === cpf)) {
    return res.status(409).json({ error: 'CPF já cadastrado.' });
  }

  pessoas.push({
    id: pessoas.length + 1,
    nome: nome.toUpperCase().trim(),
    cpf,
    empresa,
    matricula,
    status: situacao
  });

  res.status(201).json({ message: 'Pessoa adicionada!' });
});

// Atualizar pessoa
app.put('/api/pessoas/:id', (req, res) => {
  const { id } = req.params;
  const { nome, cpf } = req.body;

  if (!validarCPF(cpf)) return res.status(400).json({ error: 'CPF inválido.' });

  const pessoa = pessoas.find(p => p.id == id);
  if (!pessoa) return res.status(404).json({ error: 'Pessoa não encontrada.' });

  pessoa.nome = nome;
  pessoa.cpf = cpf;

  res.json({ message: 'Pessoa atualizada!' });
});

// Deletar pessoa
app.delete('/api/pessoas/:id', (req, res) => {
  const index = pessoas.findIndex(p => p.id == req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Pessoa não encontrada.' });
  pessoas.splice(index, 1);
  res.json({ message: 'Pessoa deletada!' });
});

// Validar CPF para assinatura
app.post('/api/validar-cpf', (req, res) => {
  const { cpf } = req.body;
  const pessoa = pessoas.find(p => p.cpf === cpf);
  if (!pessoa) return res.status(404).json({ error: 'CPF não encontrado.' });

  const ultimaAssinatura = assinaturas.find(a =>
    a.cpf === cpf &&
    new Date(a.data) >= new Date(Date.now() - 1000 * 60 * 60 * 24 * 20)
  );

  res.json({ nome: pessoa.nome, assinouRecentemente: !!ultimaAssinatura });
});

// Validar bloqueio
app.post('/api/validar-bloqueio-20', (req, res) => {
  const { cpf } = req.body;
  const pessoa = pessoas.find(p => p.cpf === cpf);
  if (!pessoa) return res.status(404).json({ error: 'CPF não encontrado.' });

  const bloqueio20 = pessoa.status === 'BLOQUEADO';
  res.json({ bloqueio20 });
});

// Registrar assinatura
app.post('/api/registrar-assinatura', (req, res) => {
  const { cpf, foto, assinatura } = req.body;
  const pessoa = pessoas.find(p => p.cpf === cpf);
  if (!pessoa) return res.status(404).json({ error: 'CPF não encontrado.' });

  const jaAssinou = assinaturas.find(a =>
    a.cpf === cpf &&
    new Date(a.data) >= new Date(Date.now() - 1000 * 60 * 60 * 24 * 20)
  );
  if (jaAssinou) return res.status(400).json({ error: 'Já assinou nos últimos 20 dias.' });

  assinaturas.push({
    nome: pessoa.nome,
    cpf,
    foto,
    assinatura,
    data: new Date()
  });

  res.status(201).json({ message: 'Assinatura registrada com sucesso!' });
});

// Listar assinaturas
app.get('/api/assinaturas', (req, res) => {
  const lista = pessoas.map(p => {
    const assinatura = assinaturas.find(a => a.cpf === p.cpf);
    const dataAssinatura = assinatura ? new Date(assinatura.data) : null;
    const dataFormatada = dataAssinatura
      ? dataAssinatura.toLocaleString('pt-BR')
      : 'Data não registrada';
    return {
      Id: p.id,
      Nome: p.nome,
      CPF: p.cpf,
      Matricula: p.matricula,
      Empresa: p.empresa,
      Status: p.status,
      Foto: assinatura?.foto || null,
      Assinatura: assinatura?.assinatura || 'Não assinado',
      Data: dataFormatada
    };
  });

  res.json({ data: lista });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor rodando em http://0.0.0.0:${PORT}`);
});
