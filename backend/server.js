const express = require('express');
const cors = require('cors');
const { sql, config } = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

/**
 * ROTA TESTE
 */
app.get('/', (req, res) => {
  res.send('API A FUNCIONAR');
});

/**
 * LISTAR TODOS OS CONTRATOS
 */
app.get('/api/contratos', async (req, res) => {
  try {
    await sql.connect(config);

    const result = await sql.query(`
      SELECT 
        c.id,
        c.datapublicacao,
        c.designacaoentidade,
        c.descricaoanuncio,
        c.precobase,
        cpv.descricao AS cpv,
        t.descricaocontrato AS tipoContrato
      FROM contrato c
      JOIN cpv ON c.idcpv = cpv.idcpv
      JOIN tipocontrato t ON c.idtipocontrato = t.idtipocontrato
      ORDER BY c.datapublicacao DESC
    `);

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

/**
 * PESQUISA DE CONTRATOS
 * /api/contratos/pesquisa?entidade=&cpv=&tipo=
 */
app.get('/api/contratos/pesquisa', async (req, res) => {
  const { entidade, cpv, tipo } = req.query;

  try {
    await sql.connect(config);

    const result = await sql.query`
      SELECT 
        c.id,
        c.datapublicacao,
        c.designacaoentidade,
        c.descricaoanuncio,
        c.precobase,
        cpv.descricao AS cpv,
        t.descricaocontrato AS tipoContrato
      FROM contrato c
      JOIN cpv ON c.idcpv = cpv.idcpv
      JOIN tipocontrato t ON c.idtipocontrato = t.idtipocontrato
      WHERE
        (${entidade} IS NULL OR c.designacaoentidade LIKE '%' + ${entidade} + '%')
        AND (${cpv} IS NULL OR cpv.descricao LIKE '%' + ${cpv} + '%')
        AND (${tipo} IS NULL OR t.descricaocontrato LIKE '%' + ${tipo} + '%')
      ORDER BY c.datapublicacao DESC
    `;

    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

/**
 * ARRANQUE DO SERVIDOR
 */
app.listen(3000, () => {
  console.log('API a correr em http://localhost:3000');
});