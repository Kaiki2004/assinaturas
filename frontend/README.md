# 📋 Sistema de Assinaturas para Entrega de Cestas Básicas

## 🎯 Objetivo

Este sistema tem como finalidade registrar, validar e acompanhar as **assinaturas de pessoas autorizadas a receber cestas básicas**, com controle por CPF, foto, assinatura digital e verificação de periodicidade de 20 dias entre assinaturas.

A aplicação foi pensada para funcionar em rede local, com backend em Node.js e frontend em React, além de integração com banco de dados SQL Server.

---

## ⚙️ Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/nome-do-repo.git
cd nome-do-repo
2. Instale as dependências
Backend (Node.js)
bash
Copiar
Editar
cd backend
npm install
Frontend (React)
bash
Copiar
Editar
cd frontend
npm install
3. Configure o banco de dados
Edite o arquivo server.js no backend com as credenciais corretas:

js
Copiar
Editar
const config = {
  user: 'seu_usuario',
  password: 'sua_senha',
  server: 'SEU_SERVIDOR\\SQLEXPRESS',
  database: 'app_assinaturas',
  options: {
    encrypt: false
  }
};
⚠️ Certifique-se de que as tabelas Pessoas e Assinaturas já existem no banco de dados.

4. Inicie os servidores
Backend:
bash
Copiar
Editar
node server.js --host 0.0.0.0
Frontend:
bash
Copiar
Editar
npm start -- --host 0.0.0.0
🛠️ Funcionalidades
✅ Upload de lista de autorizados via Excel (.xlsx)

✅ Validação automática de CPFs

✅ Cadastro, edição e exclusão de pessoas

✅ Assinatura com foto e imagem desenhada via dispositivo

✅ Bloqueio de nova assinatura em menos de 20 dias

✅ Filtro de assinaturas por CPF

✅ Exportação de lista com fotos e assinaturas para PDF

✅ Interface amigável com React e Tailwind CSS

✅ API em Node.js com Express

✅ Acesso pela rede local via IP

🚧 Futuras implementações
🔐 Autenticação de usuários (login/senha)

📲 Versão mobile responsiva

☁️ Armazenamento das fotos/assinaturas em nuvem (ex: Firebase)

📊 Relatórios gerenciais por período

🧑‍🤝‍🧑 Registro de quem realizou a entrega

📁 Histórico de alterações (auditoria)

🔄 Integração com outros sistemas públicos ou planilhas

📌 Observações
O sistema deve rodar em uma rede local (intranet).

Para testes em celular, ambos os dispositivos devem estar na mesma rede Wi-Fi.

A porta padrão usada no backend é 3001, e no frontend é 3000.

