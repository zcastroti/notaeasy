import {
  db,
  doc,
  collection,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy
} from './script.js'

import { navegacao, gerarIdentificador, modal, alerta, loop, removeLoop, paginarTabela } from './script.js'

navegacao()
document.querySelector('.clientes')?.classList.add('destaque')

const USUARIO = localStorage.getItem('usuario')

// -- Elemento Botão Novo Cliente
let btnNovoCliente = document.querySelector('.btnNovoCliente')
btnNovoCliente.onclick = () => abrirModalCliente()

// -- Função para Abrir o Modal de Cadastro/Edição de Cliente
function abrirModalCliente(clienteId = null, dados = {}) {
  modal(clienteId ? 'Editar Cliente' : 'Novo Cliente', 650)

  let bodyModal = document.querySelector('.bodyModal')
  bodyModal.innerHTML = `
    <form class="grid10 dadosCliente">
        <div class="div-nome">
            <label for="nome">Nome / Razão Social</label>
            <input type="text" class="nome" value="${dados.nome || ''}">
        </div>
        <div class="div-cnpj">
            <label for="cnpj">CNPJ / CPF</label>
            <input type="text" class="cnpj" value="${dados.cnpj || ''}">
        </div>
        <div class="div-im">
            <label for="inscricaoMunicipal">Inscrição Municipal / RG</label>
            <input type="text" class="inscricaoMunicipal" value="${dados.inscricaoMunicipal || ''}">
        </div>
        <div class="div-email">
            <label for="email">e-Mail</label>
            <input type="text" class="email" value="${dados.email || ''}">
        </div>
        <div class="div-telefone">
            <label for="telefone">Telefone</label>
            <input type="text" class="telefone" value="${dados.telefone || ''}">
        </div>
        <div class="div-cep">
            <label for="cep">CEP</label>
            <input type="text" class="cep" value="${dados.cep || ''}">
        </div>
        <div class="div-logradouro">
            <label for="logradouro">Logradouro</label>
            <input type="text" class="logradouro" value="${dados.logradouro || ''}">
        </div>
        <div class="div-numero">
            <label for="numero">Número</label>
            <input type="text" class="numero" value="${dados.numero || ''}">
        </div>
        <div class="div-bairro">
            <label for="bairro">Bairro</label>
            <input type="text" class="bairro" value="${dados.bairro || ''}">
        </div>
    </form>

    <div style="margin-top: 10px; display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btnSalvarCliente">Salvar <i class="fa-solid fa-circle-check"></i></button>
    </div>

    <style>
        .div-nome { grid-column: span 10; }
        .div-cnpj { grid-column: span 5; }
        .div-im { grid-column: span 5; }
        .div-email { grid-column: span 5; }
        .div-telefone { grid-column: span 5; }
        .div-cep { grid-column: span 3; }
        .div-logradouro { grid-column: span 7; }
        .div-numero { grid-column: span 2; }
        .div-bairro { grid-column: span 8; }
    </style>
  `

  document.querySelector('.btnSalvarCliente').onclick = async () => {
    let dadosCliente = {
      nome: document.querySelector('.bodyModal .nome').value,
      cnpj: document.querySelector('.bodyModal .cnpj').value,
      inscricaoMunicipal: document.querySelector('.bodyModal .inscricaoMunicipal').value,
      email: document.querySelector('.bodyModal .email').value,
      telefone: document.querySelector('.bodyModal .telefone').value,
      cep: document.querySelector('.bodyModal .cep').value,
      logradouro: document.querySelector('.bodyModal .logradouro').value,
      numero: document.querySelector('.bodyModal .numero').value,
      bairro: document.querySelector('.bodyModal .bairro').value
    }

    if (!dadosCliente.nome) {
      alerta('O campo Nome / Razão Social é obrigatório!')
      return
    }

    let idFinal = clienteId || gerarIdentificador()
    let clienteRef = doc(db, 'usuarios', USUARIO, 'clientes', idFinal)

    loop()
    try {
      await setDoc(clienteRef, dadosCliente, { merge: true })
      alerta('Cliente salvo com sucesso!')
      document.querySelector('.overlay')?.remove()
      carregarClientes()
    } catch (error) {
      alerta('Erro ao salvar cliente.')
    } finally {
      removeLoop()
    }
  }
}

// -- Carregar Clientes na Tabela
async function carregarClientes() {
  loop()
  try {
    const clientesRef = collection(db, 'usuarios', USUARIO, 'clientes')
    const q = query(clientesRef, orderBy('nome', 'asc'))
    const querySnapshot = await getDocs(q)
    
    const tbody = document.querySelector('.tabelaClientes tbody')
    tbody.innerHTML = ''

    if (querySnapshot.empty) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Nenhum cliente cadastrado.</td></tr>`
      removeLoop()
      return
    }

    querySnapshot.forEach((docSnap) => {
      let cliente = docSnap.data()
      let tr = document.createElement('tr')
      tr.innerHTML = `
        <td>${cliente.nome || ''}</td>
        <td>${cliente.cnpj || ''}</td>
        <td style="text-align: center; display: flex; gap: 5px; justify-content: center;">
          <button class="btnEditar" title="Editar" style="padding: 5px 8px;"><i class="fa-solid fa-pen"></i></button>
          <button class="btnEnviar" title="Enviar Nota" style="padding: 5px 8px; background: #cee2f7;"><i class="fa-solid fa-paper-plane"></i></button>
        </td>
      `

      // Evento de Editar
      tr.querySelector('.btnEditar').onclick = () => {
        abrirModalCliente(docSnap.id, cliente)
      }

      // Evento de Enviar Nota (fluxo de notas)
      tr.querySelector('.btnEnviar').onclick = () => {
        abrirModalEnvioNota(docSnap.id, cliente)
      }

      tbody.appendChild(tr)
    })

    paginarTabela('.tabelaClientes', 10)
  } catch (error) {
    alerta('Erro ao carregar clientes.')
  } finally {
    removeLoop()
  }
}

// -- Função para o Modal e Envio de Nota integrado ao Back-end
function abrirModalEnvioNota(clienteId, cliente) {
  modal(`Enviar Nota`, 500)

  let bodyModal = document.querySelector('.bodyModal')
  bodyModal.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px;">
        <p><b>E-mail de destino:</b> ${cliente.email || 'Não informado'}</p>
        <div>
            <label>Valor do Serviço (R$)</label>
            <input type="text" class="valorNota" placeholder="0,00">
        </div>
        <div>
            <label>Descrição do Serviço / Histórico</label>
            <input type="text" class="descricaoNota" value="Serviços de Informática">
        </div>
        <button class="btnConfirmarEnvio" style="margin-top: 10px;">Emitir e Enviar Nota <i class="fa-solid fa-file-invoice-dollar"></i></button>
    </div>
  `

  document.querySelector('.btnConfirmarEnvio').onclick = async () => {
    let valor = document.querySelector('.valorNota').value
    let descricao = document.querySelector('.descricaoNota').value

    if (!valor || !descricao) {
      alerta('Preencha o valor e a descrição!')
      return
    }

    loop()
    try {
      // Faz a requisição POST para o seu servidor back-end em Node.js
      const resposta = await fetch('http://localhost:3000/api/emitir-nota', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usuarioId: USUARIO, // Identificador obtido do localStorage
          clienteId: clienteId, // ID do documento do cliente no Firestore
          valor: valor,
          descricao: descricao
        })
      })

      const resultado = await resposta.json()

      if (resultado.sucesso) {
        alerta(resultado.mensagem || 'Nota emitida e enviada com sucesso!')
        document.querySelector('.overlay')?.remove() // Fecha o modal
      } else {
        alerta(resultado.mensagem || 'Erro ao emitir nota.')
      }
    } catch (error) {
      console.error('Erro na requisição:', error)
      alerta('Erro de conexão com o servidor.')
    } finally {
      removeLoop()
    }
  }
}

carregarClientes()