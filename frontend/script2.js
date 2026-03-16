/* ===============================
   VARIÁVEIS GLOBAIS
=============================== */

let paginaAtual = 1;
let porPagina = 5;

let contratosOriginais = [];
let contratosFiltrados = [];

/* ===============================
   CARREGAR CONTRATOS DO SERVIDOR
=============================== */

async function carregarContratos() {
  try {
    const res = await fetch('https://contratos-backend-ywki.onrender.com/api/contratos');
    const dados = await res.json();
    console.log(dados);
    contratosOriginais = dados;
    contratosFiltrados = [...contratosOriginais];
    paginaAtual = 1;
    atualizar();
  } catch (err) {
    console.error('Erro ao buscar contratos:', err);
  }
}

/* ===============================
   FILTROS + ORDENAÇÃO
=============================== */

function aplicarFiltrosEOrdenacao() {
  let lista = [...contratosOriginais];

  const entidade = document.getElementById('entidade').value.toLowerCase();
  const cpv = document.getElementById('cpv').value.toLowerCase();
  const tipo = document.getElementById('tipo').value.toLowerCase();
  const dataInicio = document.getElementById('dataInicio').value;
  const dataFim = document.getElementById('dataFim').value;
  const precoMin = parseFloat(document.getElementById('precoMin').value);
  const precoMax = parseFloat(document.getElementById('precoMax').value);
  const ordemPreco = document.getElementById('ordemPreco').value;
  const ordemData = document.getElementById('ordemData').value;

  if (entidade) {
    lista = lista.filter(c =>
      (c.designacaoEntidade || '').toLowerCase().includes(entidade)
    );
  }

  if (cpv) {
    lista = lista.filter(c => {
      if (!c.CPVs) return false;
      return c.CPVs.toLowerCase().includes(cpv);
    });
  }

  if (tipo) {
    lista = lista.filter(c =>
      (c.tiposContrato || '').toLowerCase() === tipo
    );
  }

  if (dataInicio) {
    lista = lista.filter(c =>
      new Date(c.dataPublicacao) >= new Date(dataInicio)
    );
  }

  if (dataFim) {
    lista = lista.filter(c =>
      new Date(c.dataPublicacao) <= new Date(dataFim)
    );
  }

  if (!isNaN(precoMin)) {
    lista = lista.filter(c => c.PrecoBase >= precoMin);
  }

  if (!isNaN(precoMax)) {
    lista = lista.filter(c => c.PrecoBase <= precoMax);
  }

  if (ordemPreco) {
    lista.sort((a, b) =>
      ordemPreco === 'asc'
        ? a.PrecoBase - b.PrecoBase
        : b.PrecoBase - a.PrecoBase
    );
  }

  if (ordemData) {
    lista.sort((a, b) =>
      ordemData === 'asc'
        ? new Date(a.dataPublicacao) - new Date(b.dataPublicacao)
        : new Date(b.dataPublicacao) - new Date(a.dataPublicacao)
    );
  }

  contratosFiltrados = lista;
  paginaAtual = 1;
  atualizar();
}

/* ===============================
   RENDERIZAÇÃO (PAGINADA)
=============================== */

function renderPaginado() {
  const tbody = document.getElementById('tabela-contratos');
  tbody.innerHTML = '';

  const inicio = (paginaAtual - 1) * porPagina;
  const fim = inicio + porPagina;

  const pagina = contratosFiltrados.slice(inicio, fim);

  pagina.forEach(c => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${c._id || ''}</td>
      <td>${c.dataPublicacao?.substring(0, 10) || ''}</td>
      <td>${c.designacaoEntidade || ''}</td>
      <td>${c.descricaoAnuncio || ''}</td>
      <td>${formatarPreco(c.PrecoBase)}</td>
      <td>${c.CPVs || 'Outro'}</td>
      <td>${c.tiposContrato || 'Outro'}</td>
    `;

    tbody.appendChild(row);
  });
}

/* ===============================
   PAGINAÇÃO
=============================== */

function criarBotoes() {
  const div = document.getElementById('paginacao');
  div.innerHTML = '';

  const total = Math.ceil(contratosFiltrados.length / porPagina);

  if (paginaAtual > 1) {
    const prev = document.createElement('button');
    prev.textContent = '‹';
    prev.onclick = () => {
      paginaAtual--;
      atualizar();
    };
    div.appendChild(prev);
  }

  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= paginaAtual - 2 && i <= paginaAtual + 2)
    ) {
      const btn = document.createElement('button');
      btn.textContent = i;

      if (i === paginaAtual) btn.classList.add('active');

      btn.onclick = () => {
        paginaAtual = i;
        atualizar();
      };

      div.appendChild(btn);
    } else if (i === paginaAtual - 3 || i === paginaAtual + 3) {
      const span = document.createElement('span');
      span.textContent = '...';
      span.style.padding = '6px';
      div.appendChild(span);
    }
  }

  if (paginaAtual < total) {
    const next = document.createElement('button');
    next.textContent = '›';
    next.onclick = () => {
      paginaAtual++;
      atualizar();
    };
    div.appendChild(next);
  }
}

/* ===============================
   ATUALIZAR TABELA
=============================== */

function atualizar() {
  console.log('📊 Total filtrados:', contratosFiltrados.length);
  console.log('📄 Pagina atual:', paginaAtual);
  renderPaginado();
  criarBotoes();
}

/* ===============================
   UTIL
=============================== */

function formatarPreco(valor) {
  if (valor === null || valor === undefined) return '';
  return valor.toLocaleString('pt-PT', {
    style: 'currency',
    currency: 'EUR'
  });
}

function toggleFiltros() {
  const painel = document.getElementById('painelFiltros');
  const botao = document.querySelector('.btn-toggle');

  painel.classList.toggle('aberto');

  botao.textContent = painel.classList.contains('aberto')
    ? 'Esconder filtros'
    : 'Mostrar filtros';
}

/* ===============================
   DOMContentLoaded: ligar botões + carregar dados
=============================== */

document.addEventListener('DOMContentLoaded', () => {
  const popupExcel = document.getElementById('popupExcel');
  const btnImportar = document.getElementById('btnImportar');
  const btnEnviarExcel = document.getElementById('btnEnviarExcel');
  const btnFecharPopup = document.getElementById('btnFecharPopup');
  const inputExcel = document.getElementById('inputExcel');
  const statusUpload = document.getElementById('statusUpload');

  btnImportar.addEventListener('click', () => {
    statusUpload.textContent = '';
    inputExcel.value = '';
    popupExcel.style.display = 'flex';
  });

  btnFecharPopup.addEventListener('click', () => {
    popupExcel.style.display = 'none';
  });

  btnEnviarExcel.addEventListener('click', async () => {
    if (!inputExcel.files.length) {
      statusUpload.textContent = 'Escolhe um ficheiro Excel primeiro.';
      return;
    }

    const ficheiro = inputExcel.files[0];
    const formData = new FormData();
    formData.append('ficheiro', ficheiro);

    statusUpload.textContent = 'A enviar...';

    try {
      const res = await fetch('https://contratos-backend-ywki.onrender.com/api/upload-excel', {
        method: 'POST',
        body: formData
      });

      const dados = await res.json();

      if (!res.ok) {
        throw new Error(dados.erro || 'Erro no upload');
      }

      statusUpload.textContent = `✅ ${dados.inseridos} contratos inseridos.`;

      await carregarContratos();
    } catch (err) {
      console.error(err);
      statusUpload.textContent = '❌ Erro ao enviar ficheiro: ' + err.message;
    }
  });

  // carregar contratos depois de o DOM estar pronto
  carregarContratos();
});
