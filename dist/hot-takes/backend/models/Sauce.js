/**
 * Ce fichier est la construction d'un schéma de type mongoose pour les sauces qui apparaîtra dans la base de données
 * de mongodb.
 */

const mongoose = require('mongoose');

//création d'un schéma de données qui contient les chmaps souhaités pour chaque sauce
const sauceSchema = mongoose.Schema({
  //id du user : identifiant MongoDB unique de l'utilisateur qui a créé la sauce
  userId : { type: String, required: true },
  //nom de la sauce
  name: { type: String, required: true },
  //fabricant de la sauce 
  manufacturer : { type: String, required: true },
  //description de la sauce 
  description: { type: String, required: true },
  //le principal ingrédient épicé de la sauce 
  mainPepper : { type: String, required: true },
  //l'url de l'image de la sauce téléchargée par l'utilisateur 
  imageUrl : { type: String, required: true },
  //nombre entre 1 et 10 décrivant la sauce 
  heat : { type: Number, required: true },
  //nombre d'utilisateurs qui aiment la sauce 
  likes : { type: Number },
  //nombre d'utilisateurs qui n'aiment pas la sauce
  dislikes : { type: Number },
  //tableau des identifiants des utilisateurs qui ont aimé la sauce 
  usersLiked : { type: [String]},
  //tableau des identifiants des utilisateurs qui n'ont pas aimé la sauce 
  usersDisliked : { type: [String]}
  
  });


//on exporte le schéma de données en tant que modèle mongoose appelé Sauce , le rendant ainsi disponible
//pour notre application Express
module.exports = mongoose.model('Sauce', sauceSchema);