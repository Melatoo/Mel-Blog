//Definindo módulos
const express = require('express');
const handlebars = require('express-handlebars');
const mongoose = require('mongoose');
const app = express();
const admin = require('./routes/admin');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
require("./models/postagem")
const Postagem = mongoose.model("postagens")
//Configurações
    //Sessão
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true        
        }))
        app.use(flash());
    //Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg");
            res.locals.error_msg = req.flash("error_msg");
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
    app.get('/404', (req, res) => {
        res.send('Erro 404!')
    })
    app.get('/postagem/:slug', (req, res) => {
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
    app.use('/admin', admin);
//Outros
const PORT = 8081;
app.listen(PORT, () => {
    console.log('Servidor rodando');
});