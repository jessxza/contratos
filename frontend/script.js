// Função principal para pesquisar contratos
async function pesquisar() {
  const entidade = document.getElementById('entidade').value;
  const cpv = document.getElementById('cpv').value;
  const tipo = document.getElementById('tipo').value;
  const dataInicio = document.getElementById('dataInicio').value;
  const dataFim = document.getElementById('dataFim').value;
  const precoMin = document.getElementById('precoMin').value;
  const precoMax = document.getElementById('precoMax').value;
  const ordemData = document.getElementById('ordemData').value;
  const ordemPreco = document.getElementById('ordemPreco').value;

  const params = new URLSearchParams({
    entidade,
    cpv,
    tipo,
    dataInicio,
    dataFim,
    precoMin,
    precoMax,
    ordemData,
    ordemPreco
  });

  try {
    const url = `http://localhost:3000/api/contratos/pesquisa?${params.toString()}`;
    const res = await fetch(url);
    const contratos = await res.json();
    
    // Chama a função que renderiza a tabela
    render(contratos);
  } catch (err) {
    console.error('Erro ao buscar contratos:', err);
  }
}

// Função para renderizar os contratos na tabela
function render(contratos) {
  const tabela = document.getElementById('tabela-contratos');
  tabela.innerHTML = ''; // limpa a tabela antes de preencher

  if (contratos.length === 0) {
    tabela.innerHTML = `<tr><td colspan="7" style="text-align:center;">Nenhum contrato encontrado</td></tr>`;
    return;
  }

  contratos.forEach(contrato => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${contrato.id}</td>
      <td>${contrato.datapublicacao?.substring(0,10) || ''}</td>
      <td>${contrato.designacaoentidade}</td>
      <td>${contrato.descricaoanuncio}</td>
      <td>${contrato.precobase}</td>
      <td>${contrato.cpv}</td>
      <td>${contrato.tipoContrato}</td>
    `;
    tabela.appendChild(row);
  });
}

// Opcional: pesquisar ao carregar a página
document.addEventListener('DOMContentLoaded', pesquisar);
