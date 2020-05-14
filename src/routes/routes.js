const express = require('express');
const router = express.Router();
const pool = require('../../database/dbpool.js');


// Variable que vamos a usar para comprobar si hay un usuario logeado
const isLogged = (req, res, next) => {
    if (req.session.loggedin) {
        return next();
    } else {
        res.redirect('/signin');
    }
};


router.get('/', (req, res) => {
    res.send('Hola BROOOOOOOOO');
});


// Lista de la tabla de la base de datos
router.get('/list', isLogged, async(req, res) => {
    const links = await pool.query(`SELECT * FROM employees`);

    links.username = req.session.username;

    console.log(links);
    res.render(req.app.get('pathLinks')+'/list', {links});
});


// Método get que muestra el formulario de inserción
router.get('/add', isLogged, async(req, res) => {
    const links = {
        username: req.session.username
    };

    res.render(req.app.get('pathLinks')+'/add', {links});
});

// Método post que recibe los datos de inserción a la base de datos
router.post('/add', isLogged, async(req, res) => {
    const {name, salary} = req.body;

    const links = await pool.query(`INSERT INTO employees (name, salary) VALUES ('${name}', ${salary})`);

    console.log(links);
    res.redirect('/list');
});


// Método get para eliminar el empleado cuyo id se pasa por parámetro
router.get('/delete/:id', isLogged, async(req, res) => {
    const {id} = req.params;

    const links = await pool.query(`DELETE FROM employees WHERE id = ${id}`);

    console.log(links);
    res.redirect('/list');
});


// Método get para mostrar el usuario seleccionado para editar
router.get('/edit/:id', isLogged, async(req, res) => {
    const {id} = req.params;

    const links = await pool.query(`SELECT * FROM employees WHERE id = ${id}`);

    links[0].username = req.session.username;

    console.log(links);
    res.render(req.app.get('pathLinks')+'/edit', {links: links[0]}); // En vez de pasar el array links entero, pasa su posición 0
});

// Método post para editar
router.post('/edit/:id', isLogged, async(req, res) => {
    const {id} = req.params;
    const {name, salary} = req.body;

    const links = await pool.query(`UPDATE employees SET name = '${name}', salary = ${salary} where id = ${id}`);

    console.log(links);
    res.redirect('/list');
});


module.exports = router;