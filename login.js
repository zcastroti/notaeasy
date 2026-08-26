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
  where,
  orderBy
} from './script.js'

import { navegacao , gerarIdentificador , modal , alerta , loop , removeLoop } from './script.js'

document.querySelector('.inputUsuario').focus()

let btnLogin = document.querySelector('.btnLogin')
btnLogin.onclick = ()=> { login() }
window.addEventListener('keydown', (e) => { if (e.key === 'Enter') login() })

async function login() {
  let inputUsuario = document.querySelector('.inputUsuario').value.trim().toLowerCase()
  let inputSenha = document.querySelector('.inputSenha').value.trim().toLowerCase()

  if (!inputUsuario || !inputSenha){
    alerta('Preencha todos os campos!')
    return
  }

  let usuarios = collection(db, 'usuarios')
  let filtro = query(usuarios, where("login", "==", inputUsuario) , where("senha", "==", inputSenha))
  
  loop()
  let consulta = await getDocs(filtro)
  removeLoop()

  if (!consulta.empty) {
    let docSnap = consulta.docs[0]
    let usuario = docSnap.data()

    loop()
    const dataAtual = new Date();
    await updateDoc(docSnap.ref, { ultimoAcesso: dataAtual })
    removeLoop()

    localStorage.setItem('usuario', usuario.id)
    window.location.href = 'empresa.html'
  } else { alerta('Usuário não encontrado ou senha incorreta!') }

}