import express, { request, response } from 'express';
const app = express();
app.use(express.json());

app.get('/', (request, response) => {
return response.json('OK');

});

app.listen(8888, () => console.log("Servidor iniciado!🚀"));

let listaUsuarios = []

//criação de conta
//○ Identificador
//○ Nome
//○ E-mail
//○ Senha
function verificarDados(request, response, next) {
    const dados = request.body
    
    if(!dados.nome){
        return response.status(400).json({
            sucesso: false,
            dados: null,
            mensagem: 'Não foi possível criar um usuário, é necessário um nome.'
        })
    }

    if(!dados.email || !dados.email.includes('@') || !dados.email.includes('.com')) {
        return response.status(400).json({
            sucesso: false,
            dados: null,
            mensagem: 'Não foi possível criar um usuário, é preciso conter um e-mail com @ e .com'
        })
    }

    if(!(dados.senha.length >= 6)){
        return response.status(400).json ({
            sucesso: false,
            dados: null,
            mensagem: 'Não foi possível criar um usuário, é necessário conter uma senha com 6 caracteres ou mais.'
        })

    }

    next()
}

app.post('/criarusuario', verificarDados, (request,response) => {
    const dados = request.body 

    //DADOS DO USUÁRIO
    const novoUsuario = {
        id: new Date().getTime(),
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha,
        recados: [],
        logado: false
    }

    const existe = listaUsuarios.some((usuario) => usuario.email == novoUsuario.email)
    
    if(existe) {
        return response.status(400).json({
            sucesso: false,
            dados: null,
            mensagem: "Outro usuário já estava cadastrado com este e-mail."
        })
    }

    listaUsuarios.push(novoUsuario)

    return response.status(201).json({
        sucesso: true,
        dados: novoUsuario,
        mensagem: "Novo usuário criado com sucesso!"
    })

})

//LOGIN
//email 
//senha
app.post('/logar', (request, response) => {
    const logar = request.body

    const verificarSenha = listaUsuarios.some((valor1) => valor1.senha == logar.senha)
    const verificarEmail = listaUsuarios.some((valor) => valor.email == logar.email)


    if(!verificarEmail || !verificarSenha) {
        return response.status(400).json({
            sucesso: false,
            mensagem: "Usuário não encontrado😓, email ou senha incorretos"
        })
    }

    listaUsuarios.forEach(usuario => usuario.logado = false)
    const user = listaUsuarios.find((valor) => valor.email == logar.email)

    user.logado = true


    return response.status(200).json({
        sucesso: true,
        mensagem: 'Login efetuado com sucesso!'
    })
})

//CRIAR RECADOS
app.post('/recados', (request, response) => {
    const dados = request.body

    const user = listaUsuarios.find(user => user.logado === true)
    const posicao = listaUsuarios.findIndex(user => user.logado === true)
    
    // verificar se o usuário está logado
    if(!user) {
        return response.status(400).json({
            sucesso: false,
            mensagem: 'Nenhum usuário logado, logue para criar um recado!'
        })
    }

    if (!dados.titulo || !dados.descricao) {
        return response.status(400).json({
            sucesso: false,
            mensagem:'É necessário preencher os campos "Título" e "Descrição" para criar um recado!'
        })
    }

    // DADOS DO RECADO
    const novoRecado = {
        id: new Date().getTime(),
        titulo: dados.titulo,
        descricao: dados.descricao

    }

    listaUsuarios[posicao].recados.push(novoRecado)

    return response.status(200).json({
        sucesso: true,
        dados: novoRecado,
        mensagem:"Recado criado com sucesso!"
    })
})

//DELETAR RECADO
app.delete('/recados/:id', (request, response) => {
    const params = request.params

    //const recadoExiste = listaUsuarios.recados.some((valor) => valor.id == params.id )
    const user = listaUsuarios.find(user => user.logado === true)
    const posicao = listaUsuarios.findIndex(user => user.logado === true)
    const recadoExiste = user.recados.findIndex(user => user.id == params.id)


    console.log(recadoExiste, user)

    if(!user) {
        return response.status(400).json({
            sucesso: false,
            mensagem: 'Nenhum usuário logado, logue para excluir um recado!'
        })
    }

    if(recadoExiste < 0 ){
        return response.status(400).json({
            sucesso: false,
            mensagem: "Recado não encontrado."
        })
    }

    listaUsuarios[posicao].recados.splice(recadoExiste, 1)

    return response.status(200).json({
        sucesso: true, 
        mensagem:"Recado deletado com sucesso!"
    })




})

//LER/APRESENTAR OS RECADOS

app.get('/recados/:id', (request, response)=> {
    const params = request.params

    const user = listaUsuarios.find(user => user.logado === true)
    const recadoExiste = user.recados.findIndex(user => user.id == params.id)


    if(!user) {
        return response.status(400).json({
            sucesso: false,
            mensagem: 'Nenhum usuário logado, logue para ver um recado!'
        })
    }

    if (recadoExiste < 0) {
        return response.status(404).json({
            sucesso: false, 
            dado: null,
            mensagem: "Recado não encontrado pelo ID informado!"
        })
    }

    return response.status(200).json({
        sucesso: true, 
        dado: user.recados,
        mensagem: "Recado encontrado!"
    })

})

//EDITAR RECADO
app.put('/recados/:id', (request, response) => {
    const params = request.params

    
    const user = listaUsuarios.find(user => user.logado === true)
    const recadoExiste = user.recados.findIndex(user => user.id == params.id)


    if(!user) {
        return response.status(400).json({
            sucesso: false,
            mensagem: 'Nenhum usuário logado, logue para ver um recado!'
        })
    }

    if (recadoExiste < 0) {
        return response.status(404).json({
            sucesso: false, 
            dado: null,
            mensagem: "Recado não encontrado pelo ID informado!"
        })
    }

    user.recados[recadoExiste].titulo = request.body.titulo
    user.recados[recadoExiste].descricao = request.body.descricao

    return response.status(200).json({
        sucesso: true, 
        dado: user.recados[recadoExiste],
        mensagem: "Recado editado com sucesso!"
    })

})

