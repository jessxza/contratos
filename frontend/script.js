const tbody = document.querySelector('#tabela tbody');

let contratos = [];
let ordemPrecoAsc = true;
let ordemDataAsc = true;

async function carregarContratos() {
  const res = await fetch('http://localhost:3000/api/contratos');
  const dados = await res.json();
  contratos = dados;
  render(contratos);
}

async function pesquisar() {
  const entidade = document.getElementById('entidade').value;
  const cpv = document.getElementById('cpv').value;
  const tipo = document.getElementById('tipo').value;

  const url = `http://localhost:3000/api/contratos/pesquisa?entidade=${entidade}&cpv=${cpv}&tipo=${tipo}`;
  const res = await fetch(url);
  const dados = await res.json();

  contratos = dados;
  render(contratos);
}

function ordenarPorPreco() {
  contratos.sort((a, b) => {
    const pa = Number(a.precobase) || 0;
    const pb = Number(b.precobase) || 0;
    return ordemPrecoAsc ? pa - pb : pb - pa;
  });

  ordemPrecoAsc = !ordemPrecoAsc;
  render(contratos);
}

function ordenarPorData() {
  contratos.sort((a, b) => {
    const da = new Date(a.datapublicacao);
    const db = new Date(b.datapublicacao);
    return ordemDataAsc ? da - db : db - da;
  });

  ordemDataAsc = !ordemDataAsc;
  render(contratos);
}

function render(lista) {
  tbody.innerHTML = '';

  lista.forEach(c => {
    const data = new Date(c.datapublicacao).toLocaleDateString('pt-PT');
    const preco = c.precobase
      ? c.precobase.toLocaleString('pt-PT', { minimumFractionDigits: 2 }) + " €"
      : "-";

    tbody.innerHTML += `
      <tr>
        <td>${c.id}</td>
        <td>${data}</td>
        <td>${c.designacaoentidade}</td>
        <td>${c.descricaoanuncio}</td>
        <td>${c.cpv}</td>
        <td>${c.tipoContrato}</td>
        <td>${preco}</td>
      </tr>
    `;
  });
}

carregarContratos();