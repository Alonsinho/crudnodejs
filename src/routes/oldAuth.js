const express = require('express');
const encriptar = require('../../lib/encription.js');
const router = express.Router();
const pool = require('../../database/dbpool.js');


// Variable que vamos a usar para comprobar si hay un usuario logeado
const isLogged = (req, res, next) => {
    if (req.session.loggedin) {
        res.redirect('/list');
    } else {
        return next();
    }
}


router.get('/signup', isLogged, async(req, res) => {
    res.render(req.app.get('pathAuth')+'/signup');
});

router.post('/signup', isLogged, async(req, res) => {
    const {fullname, username, password} = req.body;

    const validUsername = await pool.query(`SELECT * FROM users where username = '${username}'`);

    if (validUsername.length > 0) {
        res.redirect('/signup');
    } else {
        const encPassword = await encriptar.encriptarPassword(password);

        const newUser = await pool.query(`INSERT INTO users (username, password, fullname) VALUES ('${username}', '${encPassword}', '${fullname}')`);

        console.log(newUser);
        res.redirect('/signin');
    }
});


router.get('/signin', isLogged, async(req, res) => {
    res.render(req.app.get('pathAuth')+'/signin');
});

router.post('/signin', isLogged, async(req, res) => {
    const {username, password} = req.body;

    const user = await pool.query(`SELECT * FROM users WHERE username = '${username}'`);

    if (user.length > 0) {

        const isValidPassword = await encriptar.comparaPassword(password, user[0].password);

        if (isValidPassword) {
            req.session.loggedin = true;
            req.session.username = username;
            res.redirect('/list');
        } else {
            res.redirect('/signin');
        }

    } else {
        res.redirect('/signin');
    }
});


router.get('/logout', async(req, res) => {
    req.session.loggedin = false;
    
    res.redirect('/signin');
});



module.exports = router;