const express = require('express');
const cors = require('cors');
const { sql, config } = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/contratos', async (req, res) => {
  try {
    await sql.connect(config);

    const request = new sql.Request();

    const result = await request.query(`
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

    console.log('Linhas:', result.recordset.length);
    res.json(result.recordset);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

/**
 * PESQUISA + FILTROS + ORDENAÇÃO
 */
app.get('/api/contratos/pesquisa', async (req, res) => {
  const {
    entidade = '',
    cpv = '',
    tipo = '',
    dataInicio = null,
    dataFim = null,
    precoMin = null,
    precoMax = null,
    ordemData = '',
    ordemPreco = ''
  } = req.query;

  try {
    await sql.connect(config);

    let orderBy = 'ORDER BY c.datapublicacao DESC';

    if (ordemPreco) {
      orderBy = `ORDER BY c.precobase ${ordemPreco === 'asc' ? 'ASC' : 'DESC'}`;
    }

    if (ordemData) {
      orderBy = `ORDER BY c.datapublicacao ${ordemData === 'asc' ? 'ASC' : 'DESC'}`;
    }

    const query = `
      SELECT 
        c.id,
        c.datapublicacao,
        c.designacaoentidade,
        c.descricaoanuncio,
        c.precobase,
        cpv.descricao AS cpv,
        t.descricaocontrato AS tipoContrato
      FROM contrato c
      LEFT JOIN cpv ON c.idcpv = cpv.idcpv
      LEFT JOIN tipocontrato t ON c.idtipocontrato = t.idtipocontrato
      WHERE
        (@entidade = '' OR c.designacaoentidade LIKE '%' + @entidade + '%')
        AND (@cpv = '' OR cpv.descricao LIKE '%' + @cpv + '%')
        AND (
          @tipo = '' OR 
          t.descricaocontrato COLLATE Latin1_General_CI_AI = @tipo
        )
        AND (@dataInicio IS NULL OR c.datapublicacao >= @dataInicio)
        AND (@dataFim IS NULL OR c.datapublicacao <= @dataFim)
        AND (@precoMin IS NULL OR c.precobase >= @precoMin)
        AND (@precoMax IS NULL OR c.precobase <= @precoMax)
      ${orderBy}
    `;

    const request = new sql.Request();
    request.input('entidade', sql.NVarChar, entidade);
    request.input('cpv', sql.NVarChar, cpv);
    request.input('tipo', sql.NVarChar, tipo);
    request.input('dataInicio', sql.Date, dataInicio || null);
    request.input('dataFim', sql.Date, dataFim || null);
    request.input('precoMin', sql.Decimal(18, 2), precoMin || null);
    request.input('precoMax', sql.Decimal(18, 2), precoMax || null);

    const result = await request.query(query);
    res.json(result.recordset);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

app.listen(3000, () => {
  console.log('API a correr em http://localhost:3000');
});
