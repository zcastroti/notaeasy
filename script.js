import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"

import { 
  getFirestore, 
  doc,
  collection,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"

const firebaseConfig = {
  apiKey: "AIzaSyAM7hB7OemqpbekhNJiLvNR1STpOPnwo-o",
  authDomain: "projeto-333bd.firebaseapp.com",
  projectId: "projeto-333bd",
  storageBucket: "projeto-333bd.firebasestorage.app",
  messagingSenderId: "700477125458",
  appId: "1:700477125458:web:644a698445d4c3cf38c08b"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export {
  db,
  doc,
  collection,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy
}

// --------------------------------------------------------------------------

// Função - Criar Barra de Navegação
export function navegacao() {
  let nav = document.createElement('nav')
  document.body.prepend(nav)

  nav.innerHTML =
  `
  <a href="empresa.html" class="empresa">Empresa</a>
  <a href="clientes.html" class="clientes">Clientes</a>
  <a href="config.html" class="config">Config.</a>
  `
}

// Função - Gerar Identificador Aleatório
export function gerarIdentificador() { 
  return Math.random().toString(36).substring(2, 6) 
}

// Função - Modal
export function modal(titulo, tamMax ) {
  document.querySelector('.modal')?.remove()
  document.querySelector('.overlay')?.remove()
  
  let overlay = document.createElement('div')
  overlay.classList.add('overlay')
  document.body.prepend(overlay)

  let modal = document.createElement('div')
  modal.classList.add('modal')
  modal.style.maxWidth = `${tamMax}px`
  overlay.prepend(modal)

  modal.innerHTML = 
  `
  <div class="headModal">
    <h1>${titulo}</h1>
    <button class="fecharModal">Fechar <i class="fa-regular fa-circle-xmark"></i></button>
  </div>
  <div class="bodyModal"></div>
  `

  document.querySelector('.fecharModal').onclick = ()=> {
      document.querySelector('.modal')?.remove()
      document.querySelector('.overlay')?.remove() }
}

// Função - Alerta
export function alerta(texto , tempo) {
  document.querySelector('.alerta')?.remove()
  let alerta = document.createElement('div')
  alerta.classList.add('alerta')
  document.body.prepend(alerta)

  alerta.innerHTML = `<i class="fa-solid fa-info"></i> ${texto}`
  setTimeout(() => { document.querySelector('.alerta').remove() }, tempo || 1500)
}

// Função - Loop de Carregamento
export function loop() {
  let loop = document.createElement('div')
  loop.classList.add('loop')
  loop.innerHTML = '<img src="carregando.gif" class="gif" width="120px">'
  document.body.prepend(loop)
}

// Função - Remover Loop de Carregamento
export function removeLoop() { 
  document.querySelector('.loop')?.remove() 
}

// Função - Paginar Tabela
export function paginarTabela(seletorTabela, itensPorPagina = 10) {
    const tabela = document.querySelector(seletorTabela);
    if (!tabela) return;

    const tbody = tabela.querySelector('tbody');
    if (!tbody) return;

    const linhas = Array.from(tbody.querySelectorAll('tr'));
    let paginaAtual = 1;
    const totalPaginas = Math.ceil(linhas.length / itensPorPagina) || 1;

    // Encontra os botões e o texto dentro do mesmo container da tabela
    const container = tabela.closest('.tabela-container') || tabela.parentElement;
    const btnVoltar = container.querySelector('.btnVoltar');
    const btnAvancar = container.querySelector('.btnAvancar');
    const nomePagina = container.querySelector('.nomePagina');

    function atualizarExibicao() {
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;

        // Mostra apenas as linhas da página atual e oculta o restante
        linhas.forEach((linha, indice) => {
            linha.style.display = (indice >= inicio && indice < fim) ? '' : 'none';
        });

        // Atualiza o texto da página
        if (nomePagina) {
            nomePagina.textContent = `Página ${paginaAtual} de ${totalPaginas}`;
        }

        // Controla o estado visual dos botões (opcional: desativa nos limites)
        if (btnVoltar) btnVoltar.disabled = (paginaAtual === 1);
        if (btnAvancar) btnAvancar.disabled = (paginaAtual === totalPaginas);
    }

    // Evento de Voltar
    if (btnVoltar) {
      btnVoltar.addEventListener('click', () => {
          if (paginaAtual > 1) {
              paginaAtual--;
              atualizarExibicao();
          }
      });
    }

    // Evento de Avançar
    if (btnAvancar) {
      btnAvancar.addEventListener('click', () => {
          if (paginaAtual < totalPaginas) {
              paginaAtual++;
              atualizarExibicao();
          }
      });
    }

    // Executa a primeira vez para aplicar a paginação inicial
    atualizarExibicao();
}