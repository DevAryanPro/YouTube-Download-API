const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'YouTube API',
      version: '1.0.0',
      description: 'API for fetching YouTube video information and downloading content',
    },
    servers: [
      {
        url: 'https://you-tube-download-api.vercel.app',
        description: 'Production server',
      },
    ],
  },
  apis: ['./api/youtube/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = (req, res) => {
  const html = swaggerUi.generateHTML(specs);
  res.send(html);
};
