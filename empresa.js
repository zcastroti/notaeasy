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

import { navegacao , gerarIdentificador , modal , alerta , loop, removeLoop, paginarTabela } from './script.js'

navegacao()
document.querySelector('.empresa')?.classList.add('destaque')

const USUARIO = localStorage.getItem('usuario')

// -- Salvar Dados da Empresa
let btnSalvar = document.querySelector('.btnSalvar')
btnSalvar.onclick = async ()=> {
  try {
    let dadosEmpresa = {
      razaoSocial : document.querySelector('.razaoSocial')?.value,
      nomeFantasia : document.querySelector('.nomeFantasia')?.value,
      cnpj : document.querySelector('.cnpj')?.value,
      inscricaoMunicipal : document.querySelector('.inscricaoMunicipal')?.value,
      email : document.querySelector('.email')?.value,
      telefone : document.querySelector('.telefone')?.value,
      cep : document.querySelector('.cep')?.value,
      logradouro : document.querySelector('.logradouro')?.value,
      numero : document.querySelector('.numero')?.value,
      bairro : document.querySelector('.bairro')?.value,
      codigoMunicipio : document.querySelector('.codigoMunicipio')?.value,
      uf : document.querySelector('.uf')?.value
    }

    let empresaREF = doc(db, 'usuarios', USUARIO , 'dadosEmpresa', '1')

    loop()
    await setDoc(empresaREF, dadosEmpresa, { merge: true })
    
    alerta(`Dados da empresa salvo com sucesso!`)
  
  } 
  catch (error) { alerta(`Erro ao salvar dados da empresa <br> ${error}`) }
  finally { removeLoop() }
}

// -- Carregar Dados da Empresa
carregarDadosEmpresa()
async function carregarDadosEmpresa() {
  try {
    loop()
    let empresaREF = doc(db, 'usuarios', USUARIO, 'dadosEmpresa', '1')

    let docSnap = await getDoc(empresaREF)

    if (docSnap.exists()) {
      let dados = docSnap.data()

      document.querySelector('.razaoSocial').value = dados.razaoSocial || '';
      document.querySelector('.nomeFantasia').value = dados.nomeFantasia || '';
      document.querySelector('.cnpj').value = dados.cnpj || '';
      document.querySelector('.inscricaoMunicipal').value = dados.inscricaoMunicipal || '';
      document.querySelector('.email').value = dados.email || '';
      document.querySelector('.telefone').value = dados.telefone || '';
      document.querySelector('.cep').value = dados.cep || '';
      document.querySelector('.logradouro').value = dados.logradouro || '';
      document.querySelector('.numero').value = dados.numero || '';
      document.querySelector('.bairro').value = dados.bairro || '';
      document.querySelector('.codigoMunicipio').value = dados.codigoMunicipio || '';
      document.querySelector('.uf').value = dados.uf || '';
    }
  }
  catch (error) { alerta(`Erro ao carregar dados da empresa <br> ${error}`) }
  finally { removeLoop() }
}