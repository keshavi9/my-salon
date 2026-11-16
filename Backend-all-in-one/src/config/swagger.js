const swaggerJsdoc = require('swagger-jsdoc')
const path = require('path')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SalonPro CRM API',
      version: '1.0.0',
      description:
        'REST API for the Hair Ahmedabad Salon CRM. ' +
        'All protected endpoints require a Bearer JWT obtained from `POST /api/auth/login`.',
      contact: { email: 'dev-team@hairahmedabad.com' },
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Local development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT issued by POST /api/auth/login. Include as: Authorization: Bearer <token>',
        },
      },
      schemas: {
        // ── Shared inline schemas ──────────────────────────────────────────
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Descriptive error message' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total: { type: 'integer', example: 42 },
            page:  { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
          },
        },
      },
    },
    // Applied globally — individual routes can override or omit as needed.
    security: [{ bearerAuth: [] }],
  },
  // Scan every route file for @openapi JSDoc blocks
  apis: [path.join(__dirname, '../routes/*.js')],
}

module.exports = swaggerJsdoc(options)
