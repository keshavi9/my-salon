const { sequelize } = require('../src/config/db');
require('../src/models/associations');

beforeAll(async () => {
  // Sync all models (create tables)
  // For testing, we might want to use a separate database, but for now we sync the existing one
  // In a real scenario we'd swap out the dialect to sqlite or use a separate DB.
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Close connection
  await sequelize.close();
});
