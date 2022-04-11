/**
 * Ce fichier est la construction d'un schéma de type mongoose pour les utilisateurs qui 
 * apparaitra dans la base de données de mongodb. 
 */



//On importe mongoose
const mongoose = require('mongoose');

//ajout du validateur comme plugin de notre schéma après l'installation du package mongoose-unique-validator
const uniqueValidator = require('mongoose-unique-validator');


//création du schéma de l'utilisateur en utilisant la fonction schema de mongoose
const userSchema = mongoose.Schema({
    /*la valeur unique: true empêche les utilisateurs de s'inscrire plusieurs fois avec la même adresse mail*/
    email: { type: String, required: true, unique: true }, 
    password: { type: String, required: true }
});

//on applique le validateur au schéma avant d'en faire un model en utilisant la méthode plugin
//on passe uniqueValidator comme argument à cette méthode 
userSchema.plugin(uniqueValidator);


//exportation du shéma sous forme de modèle (utilisation de la fonction model de mongoose)
module.exports = mongoose.model('User'/*nom*/, userSchema /*shéma de données*/)