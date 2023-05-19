//Configuração de rotas do admin
const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");
require("../models/categoria.js");
const Categoria = mongoose.model("categorias");
require("../models/postagem.js");
const Postagem = mongoose.model("postagens");

//Rotas
router.get('/', (req, res) => {
    res.render("admin/index");
});

//Rotas de categorias
    router.get('/categorias', (req, res) => {
        const { sort } = req.query; 

        let sortOption = { date: 'desc' }; 

        if (sort === 'name') {
            sortOption = { name: 'asc' }; // Ordena por nome em ordem ascendente
        } else if (sort === 'date') {
            sortOption = { date: 'desc' }; // Ordena por data em ordem descendente
        } else if (sort === 'slug') {
            sortOption = { slug: 'asc' }; // Ordena por data em ordem ascendente
        }
        Categoria.find().sort(sortOption).then((categorias) => {
            res.render("admin/categorias", {categorias: categorias.map(Categoria => Categoria.toJSON())})        
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar categorias");
            res.redirect("/admin");
        })
    });

    router.get("/categorias/edit/:id", (req,res) => {
        Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
            res.render('admin/editcategorias', {categoria: categoria}) 
        }).catch((err) => {
            req.flash('error_msg', "Categoria inexistente")
            res.redirect('/admin/categorias')
        })
    })

    router.post("/categorias/edit", (req, res) => {
        Categoria.findOne({_id: req.body.id}).then((categoria) => {
            var erros = [];
        
        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({texto: "Nome inválido"});
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: "Slug inválido"})
        }
        if(req.body.nome.length < 2){
            erros.push({texto: "Nome da categoria muito pequeno"})
        }
        if(req.body.nome == categoria.nome) {
            erros.push({texto: "Coloque um nome diferente do atual"})
        }
        if(req.body.slug == categoria.slug) {
            erros.push({texto: "Coloque um slug diferente do atual"})
        }
        if(erros.length > 0){
            res.render("admin/editcategorias", {erros: erros})
        }else{
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug
            categoria.save().then(() => {
                req.flash('success_msg', "Categoria editada com sucesso")
                res.redirect('/admin/categorias')
            }).catch((err) => {
                req.flash('error_msg', "Houve um erro ao salvar a edição da categoria")
                res.redirect('/admin/categorias')
            })
        }
        }).catch((err) => {
            req.flash('error_msg', "Houve um erro ao editar categoria")
            res.redirect('/admin/categorias')
        })
    })

    router.get('/categorias/add', (req, res) => {
        res.render('admin/addcategoria');
    });

    router.post('/categorias/nova', (req, res) => {

        var erros = [];
        
        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({texto: "Nome inválido"});
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: "Slug inválido"})
        }
        if(req.body.nome.length < 2){
            erros.push({texto: "Nome da categoria muito pequeno"})
        }
        if(erros.length > 0){
            res.render("admin/addcategoria", {erros: erros})
        }else{
                const novaCat = {
            nome: req.body.nome,
            slug: req.body.slug
            }

            new Categoria(novaCat).save().then(() => {
                req.flash("success_msg", "Categoria criada com sucesso")
                res.redirect("/admin/categorias")
            }).catch((err) => {
                req.flash("error_msg", "Erro ao criar categoria, tente novamente!")
                res.redirect("/admin")
            })
        }
    });

    router.post('/categorias/deletar', (req, res) => {
        Categoria.deleteOne({_id: req.body.id}).then(() => {
            req.flash("success_msg", "Categoria deletada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao deletar categoria")
            res.redirect("/admin/categorias")
        })
    })

//Rotas de postagens

    router.get('/postagens', (req, res) => {
        Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
            res.render("admin/postagens", {postagens: postagens})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as postagens")
            res.redirect("/admin")
        })
    })

    router.get('/postagens/add', (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render('admin/addpostagem', {categorias: categorias})  
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao renderizar o forms")
            req.redirect("/admin/postagens")
        })
    })

    router.post('/postagens/nova', (req, res) => {
        
        var erros = [];
        
        if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
            erros.push({texto: "Titulo inválido"});
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto: "Slug inválido"})
        }
        if(typeof req.body.descricao == undefined){
            erros.push({texto: "Descrição inválida"})
        }
        if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
            erros.push({texto: "Conteúdo inválido"})
        }
        if(req.body.categoria == "0"){
            erros.push({texto: "Categoria inválida, registre uma categoria"})
        }
        if (erros.length > 0){
            res.render("admin/addpostagens", {erros: erros})
        }else{
            const novoPost = {
                titulo: req.body.titulo,
                slug: req.body.slug,
                descricao: req.body.descricao,
                conteudo: req.body.conteudo,
                categoria: req.body.categoria,
            }

            new Postagem(novoPost).save().then(() => {
                req.flash("success_msg", "Post criado com sucesso")
                res.redirect("/admin/postagens")
            }).catch((err) => {
                req.flash("error_msg", "Erro ao postar, tente novamente!")
                res.redirect("/admin/postagens")
            })
        }
    })

    router.get("/postagens/edit/:id", (req, res) => {
        Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
            Categoria.find().lean().then((categorias) => {
                res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao listar as categorias")
                res.redirect("/admin/postagens")
            })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao carregar o formulário de edição de postagens")
            res.redirect("/admin/postagens")
        })
    })

    router.post("/postagens/edit", (req, res) => {
        var erros = [];
        Postagem.findOne({_id: req.body.id}).then((postagem) => {
            if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
                erros.push({texto: "Titulo inválido"});
            }
            if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
                erros.push({texto: "Slug inválido"})
            }
            if(typeof req.body.descricao == undefined){
                erros.push({texto: "Descrição inválida"})
            }
            if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
                erros.push({texto: "Conteúdo inválido"})
            }
            if(req.body.categoria == "0"){
                erros.push({texto: "Categoria inválida, registre uma categoria"})
            }
            if (erros.length > 0){
                res.render("admin/editpostagens", {erros: erros})
            }else{
                postagem.titulo = req.body.titulo
                postagem.slug = req.body.slug
                postagem.descricao = req.body.descricao
                postagem.conteudo = req.body.conteudo
                postagem.categoria = req.body.categoria

                postagem.save().then(() => {
                    req.flash("success_msg", "Postagem editada com sucesso")
                    res.redirect("/admin/postagens")
                }).catch((err) => {
                    req.flash("error_msg", "Erro ao editar postagem")
                    res.redirect("/admin/postagens")
                })
            }
        })
    })

    router.get("/postagens/deletar/:id", (req, res) => {
        Postagem.findByIdAndDelete({_id: req.params.id}).then(() => {
            res.redirect('/admin/postagens')
        })
    })

module.exports = router;