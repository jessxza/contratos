const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

require('dotenv').config();

const multer = require('multer');
const xlsx = require('xlsx');

// Config multer (ficheiro em memória)
const upload = multer({ storage: multer.memoryStorage() });

console.log("MONGO_URI EM RUNTIME:", process.env.MONGO_URI);

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("ERRO: MONGO_URI não está definida!");
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000,
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

/* ============================================================
   FUNÇÃO PARA CONVERTER DATA DO EXCEL → ISO (MongoDB)
============================================================ */
function excelDateToJSDate(excelDate) {
  if (!excelDate) return null;

  // Se já for string (ex: "2024-01-15"), devolve como está
  if (typeof excelDate === "string") return excelDate;

  // Se for número do Excel, converte
  if (typeof excelDate === "number") {
    const jsDate = new Date((excelDate - 25569) * 86400 * 1000);
    return jsDate.toISOString(); // formato ideal para MongoDB
  }

  return null;
}

/* ============================================================
   LIGAR AO MONGO
============================================================ */
async function connectDB() {
  try {
    await client.connect();
    db = client.db("contratos");
    console.log("✅ Ligado ao MongoDB Atlas");
  } catch (error) {
    console.error("Erro ao ligar ao MongoDB:", error);
    process.exit(1);
  }
}

/* ============================================================
   ROTAS
============================================================ */

// Rota home
app.get('/', (req, res) => {
  res.send('API de contratos está a correr. Usa /api/contratos');
});

// Listar contratos
app.get('/api/contratos', async (req, res) => {
  try {
    const contratos = await db
      .collection("contratos")
      .find({})
      .sort({ dataPublicacao: -1 })
      .toArray();

    res.json(contratos);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// Upload Excel → insere na coleção "contratos"
app.post('/api/upload-excel', upload.single('ficheiro'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhum ficheiro enviado' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const linhas = xlsx.utils.sheet_to_json(worksheet, { defval: null });

    if (!linhas.length) {
      return res.status(400).json({ erro: 'Ficheiro Excel sem dados' });
    }

    // Converter cada linha do Excel num documento MongoDB
    const documentos = linhas.map(l => ({
      dataPublicacao: excelDateToJSDate(l.dataPublicacao || l.DataPublicacao),
      designacaoEntidade: l.designacaoEntidade || l.Entidade || null,
      descricaoAnuncio: l.descricaoAnuncio || l.Descricao || null,
      PrecoBase: Number(l.PrecoBase || l.Preco || 0),
      CPVs: l.CPVs || l.CPV || null,
      tiposContrato: l.tiposContrato || l.Tipo || null
    }));

    const resultado = await db.collection('contratos').insertMany(documentos);

    res.send({
      sucesso: true,
      inseridos: resultado.insertedCount
    });

  } catch (err) {
    console.error('Erro ao processar Excel:', err);
    res.status(500).send({ erro: err.message });
  }
});

/* ============================================================
   INICIAR SERVIDOR
============================================================ */
async function startServer() {
  await connectDB();
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 API MongoDB a correr na porta ${PORT}`);
  });
}

startServer();