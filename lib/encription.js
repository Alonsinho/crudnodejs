const bcrypt = require('bcryptjs');
const encriptar = {};

/*
return await bcrypt.hash(password, 10, async (err, hash) => {    
    console.log(err);
    console.log(hash);
    // esta es la clave enriptada para poner en la bd
});
*/

/*
encriptar.comparaPassword= async (bcrypt.compare(myPassword, hash, (err, res) => {
    return res;
    // res == true or res == false
}));
*/


encriptar.comparaPassword = async (myPassword, hash) => {  
    const res = await bcrypt.compare(myPassword, hash);
    return res;
    // res == true or res == false
};


encriptar.encriptarPassword = async (password) => {
    console.log('password = ', password);
    const salt = await bcrypt.genSalt(10);
    //o pongo salt o pongo 10
    const hash = await bcrypt.hash(password, salt);
    return hash;
}


module.exports = encriptar;