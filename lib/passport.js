const encriptar = require('./encription.js');
const pool = require('../database/dbpool.js');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy; // Estrategia para autenticarse con Google
const GOOGLE_CLIENT_ID = '756980045192-70tm1qffcbme0orci42iv3pl7o1tfah6.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'JykwEVVhN8wa84Ixtqw_QaEt';


passport.serializeUser((user, done) => {
    console.log('Passport Serialize OK');
    console.log(user);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    console.log('Passport Deserialize OK');
    const users = await pool.query(`SELECT * FROM users where id = ${id}`);
    done(null, users[0]);
});


// Signup
passport.use('signupLocal', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true 

}, async(req, username, password, done) => {
    const validUsername = await pool.query(`SELECT * FROM users where username = '${username}'`);

    if (validUsername.length > 0) {
        const myMessage = JSON.stringify({
            type: 'alert-danger',
            title: 'ERROR',
            info: `El nombre de usuario ${username} ya está en uso`
        });

        return done(null, false, {message: myMessage});

    } else {
        const {fullname} = req.body;

        const encPassword = await encriptar.encriptarPassword(password);

        const query = await pool.query(`INSERT INTO users (username, password, fullname) VALUES ('${username}', '${encPassword}', '${fullname}')`);
        console.log(query);

        const id = query.insertId;
        const newUser = {id, username, password, fullname};

        const myMessage = JSON.stringify({
            type: 'alert-success',
            title: '¡BIENVENID@!',
            info: 'Te has registrado correctamente'
        });

        return done(null, newUser, {message: myMessage});
    }
}));


// Signin
passport.use('signinLocal', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true

}, async(req, username, password, done) => {
    const user = await pool.query(`SELECT * FROM users WHERE username = '${username}'`);

    // AQUI HAY UN PROBLEMA

    if (password.length == 0) {
        return done(null, false, req.flash('loginMessage', 'Pas d\'utilisateur avec ce password vacia jajaj.'));
    }

    if (user.length > 0) {

        const isValidPassword = await encriptar.comparaPassword(password, user[0].password);

        if (isValidPassword) {
            req.session.loggedin = true;
            req.session.username = username;

            const {id, fullname, password} = user[0];
            const loggedUser = {id, username, password, fullname};

            const myMessage = JSON.stringify({
                type: 'alert-success',
                title: '¡BIENVENID@!',
                info: 'Te has logeado correctamente'
            });

            return done(null, loggedUser, {message: myMessage});

        } else {
            console.log('usuario inexistente');

            const myMessage = JSON.stringify({
                type: 'alert-danger',
                title: '¡ERROR!',
                info: 'Contraseña incorrecta'
            });

            return done(null, false, {message: myMessage});
        }

    } else {
        const myMessage = JSON.stringify({
            type: 'alert-danger',
            title: '¡ERROR!',
            info: `El usuario: ${username} no existe`
        });

        return done(null, false, {message: myMessage});
    }
}));


// Google Auth
passport.use('googleAuth', new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:8000/googleauth/callback',
    passReqToCallback: true // Importante para poder usar la variable de sesión

}, async(req, accessToken, refreshToken, profile, done) => {
    const user = await pool.query(`SELECT * FROM googleusers WHERE id = '${profile.id}'`);

    const googleUser = {
        id: profile.id,
        email: profile.emails[0].value,
        username: profile.username,
        name: profile.displayName
    };
    
    if (user.length == 0) {
        await pool.query(`INSERT INTO googleusers VALUES ('${googleUser.id}', '${googleUser.email}', '${googleUser.username}', '${googleUser.name}')`);
    }

    req.session.loggedin = true;
    req.session.username = googleUser.name;

    const myMessage = JSON.stringify({
        type: 'alert-success',
        title: '¡BIENVENID@!',
        info: 'Te has logeado correctamente'
    });

    return done(null, googleUser, {message: myMessage});
}));



module.exports = passport;