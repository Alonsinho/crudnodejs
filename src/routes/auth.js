const express = require('express');
const router = express.Router();
const passport = require('../../lib/passport.js');



// Para comprobar si hay un usuario logeado
const isLogged = (req, res, next) => {
    if (req.session.loggedin) {
        res.redirect('/list');
    } else {
        return next();
    }
}


// Registro de usuario
router.get('/signup', isLogged, async(req, res) => {
    const flashMessage = req.flash();
    console.log(flashMessage);

    if(flashMessage.error != undefined){
        let myMessage = {};

        // Si faltase algún parámetro
        if(flashMessage.error[0] == 'Missing credentials'){
            myMessage = {
                type: 'alert-warning',
                title: 'CAMPO VACÍO',
                info: 'Rellena todos los campos'
            };

        }else{
            // Cogemos el pasado por parametro
            myMessage = JSON.parse((flashMessage.error));
            console.log(myMessage);
        }

        res.locals.myAlert = myMessage;
    }

    res.render(req.app.get('pathAuth')+'/signup');
});

router.post('/signup', passport.authenticate('signupLocal', {
    successRedirect: '/list',
    failureRedirect: '/signup',
    successFlash: true,
    failureFlash: true
}));



// Inicio de sesión de usuario
router.get('/signin', isLogged, async(req, res) => {
    const flashMessage = req.flash();
    console.log(flashMessage);

    if(flashMessage.error != undefined){
        let myMessage = {};

        // Si faltase algún parámetro
        if(flashMessage.error[0] == 'Missing credentials'){
            myMessage = {
                type: 'alert-warning',
                title: 'CAMPO VACÍO',
                info: 'Introduce tu usuario y contraseña'
            };

        }else{
            // Cogemos el pasado por parametro
            myMessage = JSON.parse((flashMessage.error));
            console.log(myMessage);
        }

        res.locals.myAlert = myMessage;
    }

    res.render(req.app.get('pathAuth')+'/signin', { message: req.flash('loginMessage')[0] });
});

router.post('/signin', passport.authenticate('signinLocal', {
    successRedirect: '/list',
    failureRedirect: '/signin',
    successFlash: true,
    failureFlash: true
}));



// Autenticación con cuenta de Google
router.get('/googleauth', isLogged, passport.authenticate('googleAuth', {
    scope: ['profile', 'email']
}));

router.get('/googleauth/callback', passport.authenticate('googleAuth', {
    successRedirect: '/list',
    failureRedirect: '/signin',
    successFlash: true,
    failureFlash: true
})); // URL a donde redirige tras logearse con Google



// Cierre de sesión de usuario
router.get('/logout', async(req, res) => {
    req.session.loggedin = false;
    
    res.redirect('/signin');
});



module.exports = router;