// Este arquivo roda no Navegador (Cliente)
// Ele não fala com o NEON: Chama as rotas /api do nosso server.js

const lista = document.getElementById('lista-categorias')
const formulario = document.getElementById('form-categoria')
const campoDescricao = document.getElementById('descricao')
const mensagem = document.getElementById('mensagem')

let categorias = []
let idEmEdicao = null

async function carregarCategorias() {
    lista.innerHTML = '<li class="lista-vazia">Carregando....</li>'
    try {
        const resposta = await fetch('/api/categorias')
        categorias = await resposta.json()

        if (!resposta.ok) throw new Error(categorias.error || 'Erro ao carregar')
        renderizarLista()
    }
    catch (error) {
        mensagem.textContent = `Erro: ${error.message}`
    }
}

function renderizarLista() {
    lista.innerHTML = ''
    if (categorias.length === 0) {
        lista.innerHTML = '<li class="lista-vazia">Nenhuma categoria cadastrada!</li>'
        return
    }
    for (const categoria of categorias) {
        lista.appendChild(
            categoria.id_categoria === idEmEdicao ? criarItemEdicao(categoria) : criarItemVisualizacao(categoria)
        )
    }
}

function criarItemVisualizacao(categoria) {
    const item = document.createElement('li')
    item.className = 'categoria-item'

    const info = document.createElement('span')
    info.className = 'categoria-info'
    info.innerHTML = `<span class="categoria-id">#${categoria.id_categoria}</span> ${categoria.descricao}`

    const btnEditar = document.createElement('button')
    btnEditar.textContent = 'Editar'
    btnEditar.className = 'btn btn-editar'
    btnEditar.addEventListener('click', () => {
        idEmEdicao = categoria.id_categoria
        renderizarLista()
    })

    const btnExcluir = document.createElement('button')
    btnExcluir.textContent = 'Excluir'
    btnExcluir.className = 'btn btn-excluir'
    btnExcluir.addEventListener('click', () => {
        excluirCategoria(categoria.id_categoria)
    })

    const acoes = document.createElement('div')
    acoes.className = 'categoria-acoes'

    acoes.append(btnEditar, btnExcluir)
    item.append(info, acoes)
    return item
}

async function excluirCategoria(id_excluirCategoria) {
    try {
        const resposta = await fetch('/api/excluirCategorias', {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({ id_categoria: id_excluirCategoria })
        })
        const dados = await resposta.json()

        if (resposta.ok) {
            mostrarMensagem(`Categoria "${dados.descricao}" Excluida!`)
            campoDescricao.value = ''
            carregarCategorias()
        }
        else {
            mostrarMensagem(`Erro: ${dados.erro}`, 'erro')
        }
    }
    catch (erro) {
        mostrarMensagem(`Erro de conexão: ${erro.message}`, 'erro')
    }
}

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault()

    try {
        const resposta = await fetch('/api/categorias', {
            method: 'POST',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify({ descricao: campoDescricao.value })
        })
        const dados = await resposta.json()

        if (resposta.ok) {
            mostrarMensagem(`Categoria "${dados.descricao}" cadastrada!`)
            campoDescricao.value = ''
            carregarCategorias()
        }
        else {
            mostrarMensagem(`Erro: ${dados.erro}`, 'erro')
        }
    } catch (erro) {
        mostrarMensagem(`Erro de conexão: ${erro.message}`, 'erro')
    }
})

function criarItemEdicao(categoria) {
    const item = document.createElement('li')
    item.className = 'categoria-item categoria-item-edicao'

    const input = document.createElement('input')
    input.type = 'text'
    input.value = categoria.descricao
    input.className = 'input-edicao'

    const btnSalvar = document.createElement('button')
    btnSalvar.textContent = 'Salvar'
    btnSalvar.className = 'btn btn-salvar'
    btnSalvar.addEventListener('click', () => salvarEdicao(categoria, input.value))

    const btnCancelar = document.createElement('button')
    btnCancelar.textContent = 'Cancelar'
    btnCancelar.className = 'btn btn-cancelar'
    btnCancelar.addEventListener('click', () => {
        idEmEdicao = null
        renderizarLista()
    })

    const acoes = document.createElement('div')
    acoes.className = 'categoria-acoes'
    acoes.append(btnSalvar, btnCancelar)
    item.append(input, acoes)
    input.focus()
    return item
}

async function salvarEdicao(categoria, novaDescricao) {
    if (!novaDescricao.trim()) {
        mostrarMensagem('A descrição não pode ficar vazia.', 'erro')
        return
    }

    try {
        const resposta = await fetch(`/api/categorias/${categoria.id_categoria}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descricao: novaDescricao })
        })
        const dados = await resposta.json()

        if (resposta.ok) {
            idEmEdicao = null
            mostrarMensagem(`Categoria atualizada para "${dados.descricao}"!`)
            carregarCategorias()
        } else {
            mostrarMensagem(`Erro: ${dados.erro}`, 'erro')
        }
    } catch (erro) {
        mostrarMensagem(`Erro ao salvar edição: ${erro.message}`, 'erro')
    }
}

function mostrarMensagem(texto, tipo = 'sucesso') {
    mensagem.textContent = texto
    mensagem.className = `mensagem mensagem-${tipo}`
}

carregarCategorias()
