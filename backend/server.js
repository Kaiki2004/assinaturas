const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));
const upload = multer();
app.use(cors()); 
app.use(bodyParser.json());

const config = {
  user: 'sa',
  password: 'Rzt@2018',
  server: 'WKSR475\\SQLEXPRESS',
  database: 'app_asinaturas',
  options: { encrypt: false }
};

// ➡️ Validação de CPF
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

// ➡️ Upload e processamento de Excel
app.post('/api/upload-excel', upload.single('arquivo'), async (req, res) => {
  const arquivo = req.file;

  if (!arquivo) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

  try {
    const workbook = xlsx.read(arquivo.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    const normalizedData = jsonData.map(row => {
      const newRow = {};
      Object.keys(row).forEach(key => {
        newRow[key.toLowerCase()] = row[key];  // ↓ normaliza tudo para lowercase
      });
      return newRow;
    });

    const pool = await sql.connect(config);
    await pool.request().query('DELETE FROM Pessoas');
    await pool.request().query('DELETE FROM Assinaturas');

    const validRows = [];

    for (let row of normalizedData) {
      const nome = row.nome ? String(row.nome).toUpperCase().trim() : null;
      const cpf = row.cpf ? String(row.cpf).trim() : null;
      const empresa = row.emp ? String(row.emp).toUpperCase().trim() : null;
      const matricula = row.cod ? String(row.cod).toUpperCase().trim() : null;
      const status = row.cesta ? String(row.cesta).toUpperCase().trim() : null;

      if (!nome || !cpf || !validarCPF(cpf)) continue;

      validRows.push({ nome, cpf, empresa, matricula, status });
    }

    if (validRows.length === 0) {
      return res.status(400).json({ error: 'Nenhum dado válido para inserir.' });
    }

    const table = new sql.Table('Pessoas');
    table.columns.add('Nome', sql.NVarChar(100));
    table.columns.add('CPF', sql.NVarChar(20));
    table.columns.add('empresa', sql.NVarChar(100));
    table.columns.add('matricula', sql.NVarChar(100));
    table.columns.add('status', sql.NVarChar(100));

    validRows.forEach(row => {
      table.rows.add(row.nome, row.cpf, row.empresa, row.matricula, row.status);
    });

    await pool.request().bulk(table);

    res.status(200).json({ message: `${validRows.length} registros inseridos com sucesso!` });

  } catch (err) {
    console.error('Erro ao processar Excel:', err);
    res.status(500).json({ error: 'Erro ao processar o arquivo Excel.' });
  }
});



// ➡️ Listagem com busca e paginação
app.get('/api/pessoas', async (req, res) => {
  const { page = 1, limit = 5, search = '' } = req.query;
  const offset = (page - 1) * limit;

  try {
    const pool = await sql.connect(config);
    const whereClause = search ? `WHERE Nome LIKE @search OR CPF LIKE @search` : '';

    const total = await pool.request()
      .input('search', sql.NVarChar, `%${search}%`)
      .query(`SELECT COUNT(*) AS total FROM Pessoas ${whereClause}`);

    const result = await pool.request()
      .input('search', sql.NVarChar, `%${search}%`)
      .query(`
        SELECT * FROM Pessoas ${whereClause}
        ORDER BY Id OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
      `);

    res.json({ data: result.recordset, total: total.recordset[0].total });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

// ➡️ Adicionar pessoa
app.post('/api/pessoas', async (req, res) => {
  let { nome, cpf, empresa, matricula, situacao } = req.body;

  if (!validarCPF(cpf)) return res.status(400).json({ error: 'CPF inválido.' });

  try {
    const pool = await sql.connect(config);
    const existing = await pool.request()
      .input('cpf', sql.NVarChar, cpf)
      .query('SELECT Id FROM Pessoas WHERE CPF = @cpf');

    if (existing.recordset.length > 0) {
      return res.status(409).json({ error: 'CPF já cadastrado.' });
    }

    nome = nome.toUpperCase().trim();

    await pool.request()
      .input('nome', sql.NVarChar, nome)
      .input('cpf', sql.NVarChar, cpf)
      .input('empresa', sql.NVarChar, empresa)
      .input('matricula', sql.NVarChar, matricula)
      .input('status', sql.NVarChar, situacao)

      .query('INSERT INTO Pessoas (Nome, CPF, empresa, matricula, status) VALUES (@nome, @cpf, @empresa, @matricula, @status)');

    res.status(201).json({ message: 'Pessoa adicionada!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

// ➡️ Atualizar pessoa
app.put('/api/pessoas/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, cpf } = req.body;

  if (!validarCPF(cpf)) return res.status(400).json({ error: 'CPF inválido.' });

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('id', sql.Int, id)
      .input('nome', sql.NVarChar, nome)
      .input('cpf', sql.NVarChar, cpf)
      .query('UPDATE Pessoas SET Nome = @nome, CPF = @cpf WHERE Id = @id');

    res.json({ message: 'Pessoa atualizada!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

// ➡️ Deletar pessoa
app.delete('/api/pessoas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Pessoas WHERE Id = @id');

    res.json({ message: 'Pessoa deletada!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

// ➡️ Validar CPF (para fluxo de assinatura)
app.post('/api/validar-cpf', async (req, res) => {
  const { cpf } = req.body;

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('cpf', sql.NVarChar, cpf)
      .query('SELECT Nome FROM Pessoas WHERE CPF = @cpf');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'CPF não encontrado.' });
    }

    const nome = result.recordset[0].Nome;
    res.status(200).json({ nome });

  } catch (err) {
    console.error('Erro ao validar CPF:', err);
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

// ➡️ Registrar assinatura com bloqueio de 20 dias
app.post('/api/registrar-assinatura', async (req, res) => {
  const { cpf, foto, assinatura } = req.body;

  try {
    const pool = await sql.connect(config);

    // ➡️ Verifica se assinou nos últimos 20 dias
    const result = await pool.request()
      .input('cpf', sql.NVarChar, cpf)
      .query(`
        SELECT TOP 1 DataAssinatura 
        FROM Assinaturas 
        WHERE CPF = @cpf AND DataAssinatura >= DATEADD(DAY, -20, GETDATE())
      `);

    if (result.recordset.length > 0) {
      return res.status(400).json({ error: 'Você já assinou nos últimos 20 dias.' });
    }

    const nomeResult = await pool.request()
      .input('cpf', sql.NVarChar, cpf)
      .query('SELECT Nome FROM Pessoas WHERE CPF = @cpf');

    if (nomeResult.recordset.length === 0) {
      return res.status(404).json({ error: 'CPF não encontrado.' });
    }

    const nome = nomeResult.recordset[0].Nome;

    await pool.request()
      .input('nome', sql.NVarChar, nome)
      .input('cpf', sql.NVarChar, cpf)
      .input('foto', sql.VarChar(sql.MAX), foto)
      .input('assinatura', sql.VarChar(sql.MAX), assinatura)
      .input('data', sql.DateTime, new Date())
      .query(`
        INSERT INTO Assinaturas (Nome, CPF, Foto, Assinatura, DataAssinatura)
        VALUES (@nome, @cpf, @foto, @assinatura, @data)
      `);

    res.status(201).json({ message: 'Assinatura registrada com sucesso!' });

  } catch (err) {
    console.error('Erro ao registrar assinatura:', err);
    res.status(500).json({ error: 'Erro no servidor.' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor rodando em http://0.0.0.0:${PORT}`);
});

// ➡️ Listar assinaturas (Imagens em base64)
app.get('/api/assinaturas', async (req, res) => {
  try {
    const pool = await sql.connect(config);

    const result = await pool.request().query(`
      SELECT p.Id, a.Assinatura,a.Foto, a.DataAssinatura, p.Nome, p.CPF
      FROM Pessoas p LEFT JOIN Assinaturas a ON a.CPF = p.CPF
      ORDER BY p.Id DESC
    `);

    const assinaturas = result.recordset.map(assinatura => {
      let dataFormatada = 'Data não registrada';

      if (assinatura.DataAssinatura) {
        const data = new Date(assinatura.DataAssinatura);
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        const hora = String(data.getHours()).padStart(2, '0');
        const min = String(data.getMinutes()).padStart(2, '0');
        const seg = String(data.getSeconds()).padStart(2, '0');

        dataFormatada = `${dia}/${mes}/${ano} ${hora}:${min}:${seg}`;
      }

      const assinaturaStatus = assinatura.Assinatura ? assinatura.Assinatura : 'Não assinado';

      return {
        Id: assinatura.Id,
        Nome: assinatura.Nome,
        CPF: assinatura.CPF,
        Data: dataFormatada,
        Assinatura: assinaturaStatus,
        Foto: assinatura.Foto
      };
    });

    res.status(200).json({ data: assinaturas });

  } catch (err) {
    console.error('❌ Erro ao buscar assinaturas:', err);
    res.status(500).json({ error: 'Erro no servidor ao buscar assinaturas.' });
  }
});

