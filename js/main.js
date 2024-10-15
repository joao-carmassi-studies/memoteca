import ui from "./ui.js";
import api from "./api.js";

const pensamentosSet = new Set();

async function adicionaChaveAoPensamento() {
  try {
    const pensamentos = await api.buscarPensamentos();
    pensamentos.forEach((pensamento) => {
      const chaveNovoPensamento = `${pensamento.conteudo
        .trim()
        .toLowerCase()}-${pensamento.autoria.trim().toLowerCase()}`;
      pensamentosSet.add(chaveNovoPensamento);
    });
  } catch (error) {
    alert(error);
  }
}

const regexConteudo = /^[A-Za-z\s]{10,}$/;
const regexAutoria = /^[A-Za-z]{3,15}$/;

function validaConteudoComEspaco(conteudo) {
  const string = conteudo.replaceAll(" ", "");
  return string === "";
}

function validarConteudo(conteudo) {
  return regexConteudo.test(conteudo);
}

function validarAutoria(autoria) {
  return regexAutoria.test(autoria);
}

document.addEventListener("DOMContentLoaded", () => {
  ui.renderizarPensamentos();
  adicionaChaveAoPensamento();

  const formularioPensamento = document.getElementById("pensamento-form");
  const botaoCancelar = document.getElementById("botao-cancelar");
  const inputBusca = document.getElementById("campo-busca");

  formularioPensamento.addEventListener("submit", manipularSubmissaoFormulario);
  botaoCancelar.addEventListener("click", manipularCancelamento);
  inputBusca.addEventListener("input", (e) => {
    manipularBusca(e.target.value);
  });
});

async function manipularSubmissaoFormulario(event) {
  event.preventDefault();
  const id = document.getElementById("pensamento-id").value;
  const conteudo = document.getElementById("pensamento-conteudo").value;
  const autoria = document.getElementById("pensamento-autoria").value;
  const data = document.getElementById("pensamento-data").value;

  if (validaConteudoComEspaco(conteudo)) {
    alert("Não preencha o campo pensamento com espacos vazios");
    return;
  }

  if (!validarConteudo(conteudo)) {
    alert(
      "É permitido a inclusão de apenas de letras e espaços com no mínimo 10 caracteres"
    );
    return;
  }

  if (!validarAutoria(autoria)) {
    alert(
      "É permitido a inclusão de apenas de letras, sem espaços com no mínimo 3 caracteres e maximo de 10"
    );
    return;
  }

  if (!validarData(data)) {
    alert("Não é permitido o cadastro de datas futuras");
    return;
  }

  const chaveNovoPensamento = `${conteudo.trim().toLowerCase()}-${autoria
    .trim()
    .toLowerCase()}`;

  if (pensamentosSet.has(chaveNovoPensamento)) {
    alert("Este pesamento ja existe");
    return;
  }

  try {
    if (id) {
      await api.editarPensamento({ id, conteudo, autoria, data });
    } else {
      await api.salvarPensamento({ conteudo, autoria, data });
    }
    ui.renderizarPensamentos();
  } catch {
    alert("Erro ao salvar pensamento");
  }
}

function manipularCancelamento() {
  ui.limparFormulario();
}

async function manipularBusca(termo) {
  api.buscarPesamentosPorTermo(termo);
  try {
    const pensamentosFiltrados = await api.buscarPesamentosPorTermo(termo);
    ui.renderizarPensamentos(pensamentosFiltrados);
  } catch (error) {
    alert(`Erro ao realizar busca ${error}`);
  }
}

function validarData(data) {
  const dataAtua = new Date();
  const dataInserida = new Date(data);
  return dataInserida <= dataAtua;
}
