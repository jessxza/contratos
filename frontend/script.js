let paginaAtual = 1;
let porPagina = 5;   // ← AQUI defines 5 por página
let contratosFiltrados = [];

// Array para armazenar todos os contratos carregados do servidor
let contratosOriginais = [];

// Função assíncrona para carregar os contratos do servidor
async function carregarContratos() {
    try {
        const res = await fetch('http://localhost:3000/api/contratos');
        contratosOriginais = await res.json();
        render(contratosOriginais); // Renderiza a tabela com todos os contratos
    } catch (err) {
        console.error('Erro ao buscar contratos:', err);
    }
}

// Função que aplica filtros e ordenações
function aplicarFiltrosEOrdenacao() {
    let lista = [...contratosOriginais];

    // Valores dos filtros
    const entidade = document.getElementById('entidade').value.toLowerCase();
    const cpv = document.getElementById('cpv').value.toLowerCase();
    const tipo = document.getElementById('tipo').value.toLowerCase();
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;
    const precoMin = parseFloat(document.getElementById('precoMin').value);
    const precoMax = parseFloat(document.getElementById('precoMax').value);
    const ordemPreco = document.getElementById('ordemPreco').value;
    const ordemData = document.getElementById('ordemData').value;

    contratosFiltrados = lista;
  paginaAtual = 1;
  atualizar();
    // ====================
    // FILTROS
    // ====================
    if (entidade) {
        lista = lista.filter(c => 
            c.designacaoentidade.toLowerCase().includes(entidade)
        );
    }

    if (cpv) {
        lista = lista.filter(c => {
            if (!c.cpv) return false;
            if (c.cpv === 'Sem CPV') return false;
            
            // Normaliza strings para ignorar acentos
            const cCpv = c.cpv.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const filtroCpv = cpv.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return cCpv.toLowerCase().includes(filtroCpv);
        });
    }

    if (tipo) {
        lista = lista.filter(c => (c.tipoContrato || '').toLowerCase() === tipo);
    }

    if (dataInicio) {
        lista = lista.filter(c => new Date(c.datapublicacao) >= new Date(dataInicio));
    }

    if (dataFim) {
        lista = lista.filter(c => new Date(c.datapublicacao) <= new Date(dataFim));
    }

    if (!isNaN(precoMin)) {
        lista = lista.filter(c => c.precobase >= precoMin);
    }

    if (!isNaN(precoMax)) {
        lista = lista.filter(c => c.precobase <= precoMax);
    }

    // ====================
    // ORDENAÇÃO
    // ====================
    if (ordemPreco) {
        lista.sort((a, b) => 
            ordemPreco === 'asc' ? a.precobase - b.precobase : b.precobase - a.precobase
        );
    }

    if (ordemData) {
        lista.sort((a, b) => 
            ordemData === 'asc' 
                ? new Date(a.datapublicacao) - new Date(b.datapublicacao) 
                : new Date(b.datapublicacao) - new Date(a.datapublicacao)
        );
    }

    // Renderiza a tabela com a lista filtrada e ordenada
    render(lista);
}

// Função para renderizar os contratos na tabela
function render(lista) {
    const tbody = document.getElementById('tabela-contratos');
    tbody.innerHTML = '';

    lista.forEach(c => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${c.id}</td>
            <td>${c.datapublicacao?.substring(0,10) || ''}</td>
            <td>${c.designacaoentidade}</td>
            <td>${c.descricaoanuncio}</td>
            <td>${c.precobase}</td>
            <td>${c.cpv || 'Outro'}</td>
            <td>${c.tipoContrato || 'Outro'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Carrega contratos ao abrir a página
carregarContratos();



/* ===============================
   PAGINAÇÃO
=============================== */

function atualizar() {

  render();

  criarBotoes();

}


function renderPaginado() {

  const tbody = document.getElementById('tabela-contratos');

  tbody.innerHTML = '';

  const inicio = (paginaAtual - 1) * porPagina;

  const fim = inicio + porPagina;

  const pagina = contratosFiltrados.slice(inicio, fim);


  pagina.forEach(c => {

    const row = document.createElement('tr');


    row.innerHTML = `

      <td>${c.id}</td>

      <td>${c.datapublicacao?.substring(0,10) || ''}</td>

      <td>${c.designacaoentidade || ''}</td>

      <td>${c.descricaoanuncio || ''}</td>

      <td>${formatarPreco(c.precobase)}</td>

      <td>${c.cpv || 'Outro'}</td>

      <td>
        <span class="tipo-badge">
          ${c.tipoContrato || 'Outro'}
        </span>
      </td>

    `;

    tbody.appendChild(row);

  });

}


/* ===============================
   BOTÕES
=============================== */

function criarBotoes() {

  const div = document.getElementById('paginacao');

  div.innerHTML = '';

  const total = Math.ceil(contratosFiltrados.length / porPagina);


  /* Anterior */

  if (paginaAtual > 1) {

    const prev = document.createElement('button');

    prev.textContent = '‹';

    prev.onclick = () => {

      paginaAtual--;

      atualizar();

    };

    div.appendChild(prev);

  }


  /* Números */

  for (let i = 1; i <= total; i++) {

    if (
      i === 1 ||
      i === total ||
      (i >= paginaAtual - 2 && i <= paginaAtual + 2)
    ) {

      const btn = document.createElement('button');

      btn.textContent = i;

      if (i === paginaAtual) {
        btn.classList.add('active');
      }

      btn.onclick = () => {

        paginaAtual = i;

        atualizar();

      };

      div.appendChild(btn);

    }

    else if (
      i === paginaAtual - 3 ||
      i === paginaAtual + 3
    ) {

      const span = document.createElement('span');

      span.textContent = '...';

      span.style.padding = '6px';

      div.appendChild(span);

    }

  }


  /* Seguinte */

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


  if (painel.classList.contains('aberto')) {
    botao.textContent = 'Esconder filtros';
  }
  else {
    botao.textContent = 'Mostrar filtros';
  }
}

/* ===============================
   POPUP EXCEL
=============================== */

const btnImportar = document.getElementById("btnImportar");
const popup = document.getElementById("popupExcel");
const btnFechar = document.getElementById("btnFecharPopup");
const btnEnviar = document.getElementById("btnEnviarExcel");
const inputExcel = document.getElementById("inputExcel");
const statusUpload = document.getElementById("statusUpload");


btnImportar.onclick = () => {
  popup.style.display = "flex";
};

btnFechar.onclick = () => {
  popup.style.display = "none";
  statusUpload.textContent = "";
};


btnEnviar.onclick = async () => {

  const file = inputExcel.files[0];

  if (!file) {
    statusUpload.textContent = "Seleciona um ficheiro.";
    return;
  }

  const formData = new FormData();
  formData.append("excel", file);

  statusUpload.textContent = "A enviar...";

  try {

    const res = await fetch("http://localhost:3000/api/importar-excel", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    statusUpload.textContent = data.mensagem;

    carregarContratos(); // atualizar tabela

  } catch (err) {
    statusUpload.textContent = "Erro ao enviar ficheiro.";
    console.error(err);
  }

};


/* ===============================
   INIT
=============================== */

carregarContratos();
