const sql = require('mssql');

const config = {
  user: 'node_user',
  password: 'Node123!',        
  server: 'localhost',
  database: 'Contratos',

  options: {
    encrypt: false,             
    trustServerCertificate: true
  },

  port: 1433
};

module.exports = {
  sql,
  config
};