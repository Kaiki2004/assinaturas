const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API de Assinaturas',
    version: '1.0.0',
    description: 'Documentação da API de Assinaturas (Upload de Excel, CPF, Assinatura, etc)',
  },
  servers: [
    {
      url: 'https://assinaturas-3jpr.onrender.com', // 🔁 Mude conforme sua URL
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./server.js'], // arquivo com as rotas
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
