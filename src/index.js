const express = require('express');
const app = express();
const exphandle = require('express-handlebars');
const {database} = require('../database/db.js');
const session = require('express-session');
const MySQLStore = require('express-mysql-session');
const passport = require('passport');
const flash = require('connect-flash');

// Busca la variable de entorno, si no la encuentra usa por defecto el puerto 8000
app.set('port', process.env.port || 3000);


// Paths
app.set('pathLinks', `${__dirname}/views/links`);
app.set('pathAuth', `${__dirname}/views/auth`);


// Para aceptar los datos que vienen de un formulario
app.use(express.urlencoded({extended:false}));
//app.use(express.urlencoded());


// Para usar nuestro motor
app.engine('.hbs', exphandle({
    defaultLayout: 'main',
    layoutsDir: ('./src/views/main'),
    partialsDir: ('./src/views/main/partials'),
    extname: '.hbs'
}));

app.set('view engine', '.hbs');


// Connect Flash
app.use(flash());


// Passport
app.use(passport.initialize());
app.use(passport.session());


// Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    store:new MySQLStore(database)
}));


// Se recibe un archivo json por parte del cliente
app.use(express.json());


// Se accede al archivo de rutas
app.use(require('./routes/routes.js'));
app.use(require('./routes/auth.js'));



app.listen(app.get('port'), () => {
    console.log('Escuchando a través del puerto', app.get('port'));
});