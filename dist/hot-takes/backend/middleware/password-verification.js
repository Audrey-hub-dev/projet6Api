//récupération du model 
const passwordSchema = require('../models/password');

//exportation de la fonction password 
module.exports = (req, res, next) => {
    if (!passwordSchema.validate(req.body.password)) {
        let responseMessage = "Le mot de passe doit contenir";
            responseMessage += " au minimum 8 caract\u00e8res et contenir";
            responseMessage += " au moins une majuscule et une minuscule.";

        res.writeHead(400, 
            responseMessage, { 'content-type': 'application/json' });
        res.end('Format de mot de passe incorrect');
    } else {
        next();
    }
};