//Definindo módulos
const express = require('express');
const handlebars = require('express-handlebars');
const mongoose = require('mongoose');
const app = express();
const rotaAdmin = require('./routes/rotaAdmin');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const rotaUsuario = require('./routes/rotaUsuario');
require("./models/postagem");
const Postagem = mongoose.model("postagens");
require("./models/categoria");
const Categoria = mongoose.model("categorias");
require("./models/usuario");
const Usuarios = mongoose.model("usuarios");
const passport = require('passport');
require("./config/auth")(passport);
//Configurações
    //Sessão
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true        
        }))

        app.use(passport.initialize())
        app.use(passport.session())

        app.use(flash());
    //Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg");
            res.locals.error_msg = req.flash("error_msg");
            res.locals.error = req.flash('error');
            res.locals.user = req.user || null;
            next();
        })
    //Config de processamento de dados HTTP
    app.use(express.urlencoded({extended: true}));
    app.use(express.json());
    //Handlebars
    app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}));
    app.set('view engine', 'handlebars');
    //Mongoose
    mongoose.Promise = global.Promise;
    mongoose.connect("mongodb://127.0.0.1:27017/blogapp").then(() => {
        console.log("Servidor do Mongo rodando");
    }).catch((err) => {
        console.log("Erro ao abrir servidor: " + err);
    })
    //Public
    app.use(express.static(path.join(__dirname,'public')));
//Rotas
    app.get('/', (req, res) => {
        Postagem.find().lean().populate('categoria').sort({data: "desc"}).then((postagens) => {
            res.render('index', {postagens: postagens})
        }).catch((err) => {
            req.flash("error_msg", "Erro Interno!")
            res.redirect('/404')
        })
    })
    app.get('/categorias', (req, res) => {
        if(!req.user){
            req.flash("error_msg", "Você precisa estar logado para acessar essa página!")
            res.redirect('/')
        }
        Categoria.find().lean().then((categorias) => {
            res.render('categorias/index', {categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg", "Erro Interno!")
            res.redirect('/')
        })
    })

    app.get('/categorias/:slug', (req, res) => {
        if(!req.user){
            req.flash("error_msg", "Você precisa estar logado para acessar essa página!")
            res.redirect('/')
        }
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                    res.render('categorias/postagens', {postagens: postagens, categoria: categoria})
                }).catch((err) => {
                    req.flash("error_msg", "Erro ao listar postagens!")
                    res.redirect('/')
                })
            } else {
                req.flash("error_msg", "Esta categoria não existe!")
                res.redirect('/')
            }
        }).catch((err) => {
            req.flash("error_msg", "Erro Interno!")
            res.redirect('/')
        })
    })

    app.get('/404', (req, res) => {
        res.send('Erro 404!')
    })

    app.get('/postagem/:slug', (req, res) => {
        if(!req.user){
            req.flash("error_msg", "Você precisa estar logado para acessar essa página!")
            res.redirect('/')
        }
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if(postagem){
                res.render('postagem/index', {postagem: postagem})
            } else {
                req.flash("error_msg", "Esta postagem não existe!")
                res.redirect('/')
            }
        }).catch((err) => {
            req.flash("error_msg", "Erro interno!")
            res.redirect('/')
        })
    })
    app.use('/admin', rotaAdmin);
    app.use('/usuarios', rotaUsuario);
//Outros
const PORT = 8081;
app.listen(PORT, () => {
    console.log('Servidor rodando');
});