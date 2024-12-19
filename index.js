const { readFileSync } = require("fs");

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR",
    { style: "currency", currency: "BRL",
      minimumFractionDigits: 2 }).format(valor/100);
}

function getPeca(pecas, apresentacao) {
  return pecas[apresentacao.id];
}

function calcularCredito(pecas, apre) {
  let creditos = 0;
  creditos += Math.max(apre.audiencia - 30, 0);
  if (getPeca(pecas, apre).tipo === "comedia") 
     creditos += Math.floor(apre.audiencia / 5);
  return creditos;   
}

function calcularTotalCreditos(pecas, fatura){
  let creditos=0;
  for (let apre of fatura.apresentacoes) {
      creditos = calcularCredito(pecas, apre);
  }
  
  return creditos;
}

function calcularTotalApresentacao(pecas, apre) {
  let total = 0;

  switch (getPeca(pecas, apre).tipo) {
    case "tragedia":
      total = 40000;
      if (apre.audiencia > 30) {
        total += 1000 * (apre.audiencia - 30);
      }
      break;
    case "comedia":
      total = 30000;
      if (apre.audiencia > 20) {
        total += 10000 + 500 * (apre.audiencia - 20);
      }
      total += 300 * apre.audiencia;
      break;
    default:
      throw new Error(`Peça desconhecia: ${getPeca(pecas, apre).tipo}`);
  }
  return total;
}

function calcularTotalFatura(pecas, fatura){
  let total=0;
  for (let apre of fatura.apresentacoes) {
      total += calcularTotalApresentacao(pecas, apre);
  }
  
  return total;
} 

function gerarFaturaStr(fatura, pecas) {
  // corpo principal (após funções aninhadas)
  let faturaStr = `Fatura ${fatura.cliente}\n`;
  for (let apre of fatura.apresentacoes) {
      faturaStr += `  ${getPeca(pecas, apre).nome}: ${formatarMoeda(calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos)\n`;
  }

  faturaStr += `Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura))}\n`;
  faturaStr += `Créditos acumulados: ${calcularTotalCreditos(pecas, fatura)} \n`;
  return faturaStr;
}

function gerarFaturaHTML(fatura, pecas) {
  let faturaHTML = `<html>\n<p>Fatura ${fatura.cliente}</p>\n<ul>\n`;

  for (let apre of fatura.apresentacoes) {
    let peca = getPeca(pecas, apre);
    let totalApresentacao = calcularTotalApresentacao(pecas, apre);
    faturaHTML += `  <li>${peca.nome}: ${formatarMoeda(totalApresentacao)} (${apre.audiencia} assentos)</li>\n`;
  }

  let totalFatura = calcularTotalFatura(pecas, fatura);
  let totalCreditos = calcularTotalCreditos(pecas, fatura);

  faturaHTML += `</ul>\n<p>Valor total: ${formatarMoeda(totalFatura)}</p>\n`;
  faturaHTML += `<p>Créditos acumulados: ${totalCreditos}</p>\n`;

  faturaHTML += `</html>\n`;

  return faturaHTML;
}


const faturas = JSON.parse(readFileSync("./faturas.json"));
const pecas = JSON.parse(readFileSync("./pecas.json"));
const faturaStr = gerarFaturaStr(faturas, pecas);
const faturaHTML = gerarFaturaHTML(faturas, pecas)
console.log(faturaStr);
console.log(faturaHTML);
