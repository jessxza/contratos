const tbody = document.querySelector('#tabela tbody');

async function carregarContratos() {
  const res = await fetch('http://localhost:3000/api/contratos');
  const dados = await res.json();
  render(dados);
}

async function pesquisar() {
  const entidade = document.getElementById('entidade').value;
  const cpv = document.getElementById('cpv').value;
  const tipo = document.getElementById('tipo').value;

  const url = `http://localhost:3000/api/contratos/pesquisa?entidade=${entidade}&cpv=${cpv}&tipo=${tipo}`;
  const res = await fetch(url);
  const dados = await res.json();
  render(dados);
}

function render(lista) {
  tbody.innerHTML = '';

  lista.forEach(c => {
    const data = new Date(c.datapublicacao).toLocaleDateString('pt-PT');
    const preco = c.precobase ? c.precobase.toLocaleString('pt-PT', { minimumFractionDigits: 2 }) + " €" : "-";

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