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

const USUARIO = localStorage.getItem('usuarioNotaEasy')


// -- Importar Excel
let btnImportar = document.querySelector('.btnImportar')
let inputArquivoExcel = document.querySelector('.inputArquivoExcel')

btnImportar.onclick = () => { inputArquivoExcel.click() }

inputArquivoExcel.onchange = (evento) => {
  let arquivo = evento.target.files[0]
  if (!arquivo) return

  let leitor = new FileReader()

  leitor.onload = async function (e) {
    try {
      let dadosBinarios = e.target.result
      let workbook = XLSX.read(dadosBinarios, { type: 'binary' })
      
      // Pega a primeira aba da planilha
      let nomeAba = workbook.SheetNames[0]
      let planilha = workbook.Sheets[nomeAba]
      
      // Converte a planilha em uma matriz (linhas e colunas)
      let linhas = XLSX.utils.sheet_to_json(planilha, { header: 1 })

      if (linhas.length <= 1) {
        alerta('A planilha está vazia ou com formato inválido.')
        return
      }

      loop()
      let importadosCount = 0

      // Começa do índice 1 para ignorar a linha 0 (cabeçalho)
      for (let i = 1; i < linhas.length; i++) {
        let colunas = linhas[i]
        
        // Se a linha estiver totalmente vazia, pula
        if (!colunas || colunas.length === 0) continue

        let dadosCliente = {
          nome: colunas[0] ? String(colunas[0]).trim() : '',
          cnpj: colunas[1] ? String(colunas[1]).trim() : '',
          inscricaoMunicipal: colunas[2] ? String(colunas[2]).trim() : '',
          email: colunas[3] ? String(colunas[3]).trim() : '',
          telefone: colunas[4] ? String(colunas[4]).trim() : '',
          cep: colunas[5] ? String(colunas[5]).trim() : '',
          logradouro: colunas[6] ? String(colunas[6]).trim() : '',
          numero: colunas[7] ? String(colunas[7]).trim() : '',
          bairro: colunas[8] ? String(colunas[8]).trim() : ''
        }

        // Se tiver nome, salva no Firebase
        if (dadosCliente.nome) {
          let idFinal = gerarIdentificador()
          let clienteRef = doc(db, 'usuarios', USUARIO, 'clientes', idFinal)
          await setDoc(clienteRef, dadosCliente)
          importadosCount++
        }
      }

      alerta(`${importadosCount} clientes importados com sucesso!`)
      carregarClientes() // Atualiza a tabela na tela
    } catch (error) {
      console.error('Erro na importação do Excel:', error)
      alerta('Erro ao ler o arquivo do Excel.')
    } finally {
      removeLoop()
      inputArquivoExcel.value = '' // Limpa o input
    }
  }

  // Lê o arquivo como binário para o SheetJS processar
  leitor.readAsBinaryString(arquivo)
}


// -- Elemento Botão Novo Cliente
let btnNovoCliente = document.querySelector('.btnNovoCliente')
btnNovoCliente.onclick = ()=> abrirModalCliente()

// -- Função para Abrir o Modal de Cadastro/Edição de Cliente
function abrirModalCliente(clienteId = null, dados = {}) {
  modal(clienteId ? 'Editar Cliente' : 'Novo Cliente', 650)

  let bodyModal = document.querySelector('.bodyModal')
  bodyModal.innerHTML = 
  `
  <form class="grid10 dadosCliente">
      <div class="div-nome">
          <label for="nome">Nome/Razão Social</label>
          <input type="text" class="nome" value="${dados.nome || ''}">
      </div>
      <div class="div-cnpj">
          <label for="cnpj">CPF/CNPJ</label>
          <input type="text" class="cnpj" value="${dados.cnpj || ''}">
      </div>
      <div class="div-im">
          <label for="inscricaoMunicipal">RG/Inscrição Municipal</label>
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

  <div style="margin-top: 10px; display: flex; gap: 10px;">
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
    } catch (error) { alerta('Erro ao salvar cliente.')
    } finally { removeLoop() }
  }
}

// -- Carregar Clientes na Tabela
carregarClientes()
async function carregarClientes() {
  loop()
  try {
    const ClientesREF = collection(db, 'usuarios', USUARIO, 'clientes')
    const filtro = query(ClientesREF, orderBy('nome', 'asc'))
    const querySnapshot = await getDocs(filtro)
    
    let tbody = document.querySelector('.tabelaClientes tbody')
    tbody.innerHTML = ''

    if (querySnapshot.empty) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Nenhum cliente cadastrado.</td></tr>`
      removeLoop()
      return
    }

    querySnapshot.forEach((docSnap) => {
      let dados = docSnap.data()
      let tr = document.createElement('tr')
      tr.innerHTML = `
        <td class="col-nome">${dados.nome || ''}</td>
        <td class="col-documento" style=" color: #6980ab; font-size: 14px; ">${dados.cnpj || ''}</td>
        <td style="text-align: center; display: flex; gap: 10px; justify-content: center;">
          <button class="btnEditar" title="Editar" style="padding: 5px 8px;"><i class="fa-solid fa-pen"></i></button>
          <button class="btnEnviar" title="Enviar Nota" style="padding: 5px 8px; background: #cee2f7;"><i class="fa-solid fa-paper-plane"></i></button>
        </td>
      `

      // Evento de Editar
      tr.querySelector('.btnEditar').onclick = () => {
        abrirModalCliente(docSnap.id, dados)
      }

      // Evento de Enviar Nota (fluxo de notas)
      tr.querySelector('.btnEnviar').onclick = () => {
        abrirModalEnvioNota(docSnap.id, dados)
      }

      tbody.appendChild(tr)
    })

    paginarTabela('.tabelaClientes', 7)
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
        <p><b>e-Mail de destino:</b> ${cliente.email || 'Não informado'}</p>
        <div>
            <label>Valor do Serviço</label>
            <input type="text" class="valorNota" placeholder="0,00">
        </div>
        <div>
            <label>Descrição do Serviço</label>
            <input type="text" class="descricaoNota" value="Serviços de Informática">
        </div>
        <div style=" display: flex; gap: 10px; ">
          <button class="btnConfirmarEnvio" style="margin-top: 10px;">Emitir e Enviar Nota <i class="fa-solid fa-file-invoice-dollar"></i></button>
        </div>
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

