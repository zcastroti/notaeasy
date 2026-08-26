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
document.querySelector('.config')?.classList.add('destaque')

const USUARIO = localStorage.getItem('usuarioNotaEasy')

let usuarioREF = doc(db, "usuarios", USUARIO)
let docSnap = await getDoc(usuarioREF)
let dados = docSnap.data()

document.querySelector('.nomeUsuario').innerHTML += `${dados.login}`

// Função - Encerrar Sessão
let btnEncerrarSessao = document.querySelector('.btnEncerrarSessao')
btnEncerrarSessao.onclick = ()=> {
    window.location.href = 'index.html'
    localStorage.removeItem('usuario')
}

// Função - Atualização Cadastral
let btnAtualizarDados = document.querySelector('.btnAtualizarDados')
btnAtualizarDados.onclick = ()=> {
  modal('Atualização Cadastral')
  document.querySelector('.bodyModal').innerHTML =
  `
  <label for="login">Login</label>
  <input type="text" class="login" value="${dados.login}">
  <label for="senha">Senha</label>
  <input type="password" class="senha" value="">

  <div style=" display: flex; gap: 10px; ">
    <button class="btnCancelar">Cancelar <i class="fa-regular fa-circle-xmark"></i></button>
    <button class="btnConfirmar">Confirmar <i class="fa-regular fa-circle-check"></i></button>
  </div>
  `

  // Cancelar
  document.querySelector('.btnCancelar').onclick = ()=> {
    document.querySelector('.modal')?.remove()
    document.querySelector('.overlay')?.remove() }

  // Confirmar
  document.querySelector('.btnConfirmar').onclick = async ()=> {
    try {
        loop()

        let login = document.querySelector('.login').value.trim()
        let senha = document.querySelector('.senha').value.trim()

        if (!login || !senha) { 
            alerta('Login e senha não podem ficar em branco!')
            return
        }

        await updateDoc(usuarioREF, { 
        login: login,
        senha: senha
        })

        document.querySelector('.modal')?.remove()
        document.querySelector('.overlay')?.remove()

        alerta('Dados alterados com sucesso!')
    }
    catch (error) { alerta(`Erro ao atualizar dados <br> ${error}`) }
    finally { removeLoop() }
  }
}

