/**
 * Ce fichier permet à un utilisateur de créer un compte et de se connecter à celui-ci 
 */


//importation du package bcrypt 
const bcrypt = require('bcrypt');

//importation du package jsonwebtoken 
const jwt = require('jsonwebtoken'); 

//utilisation du model user car on va enregistrer et lire des user dans ces middlewares
const User = require('../models/User'); 


//création de la fonction signup pour l'enregistrement de nouveaux utilisateurs
//fonction signup qui va crypter le mot de passe, va prendre ce mot de passe crypté et crée un nouveau user
//avec ce mot de passe crypté et l'adresse mail passé dans le corps de la requête
// et va enregistrer cet utilisateur dans la base de données
/**
 * Fonction signup : sert à créer un compte. Utilise la 
 * @param {*} req requete
 * @param {*} res reponse
 * @param {*} next pas utilisé
 */
exports.signup = (req, res, next) => {
    //hachage du mot de passe
    bcrypt.hash(req.body.password, 10 /*combien de fois on exécute l'algorithme
    de hachage; ici on fera 10 tours)*/)
        //récupération du hash du mots de passe 
        .then(hash => {
            //on enregistre ce hash dans la base de donnéesen créant un 
            //nouvel utilisateur 
            const user = new User({
                email: req.body.email, 
                password: hash //enregistrement du hachage (cryptage)
                //du mot de passe
            });
            //enregistrement du user dans la base de données 
            user.save()
                //état 201 pour création de ressources
                .then(() => res.status(201).json({message: 'Utilisateur créé !'}))
                .catch(error => res.status(400).json({error}));

        })
        //erreur 500 du serveur
        .catch(error => res.status(500).json({error})); 
};




//création fonction login pour connecter les utilisateurs existants 
exports.login = (req, res, next) => {
    /*trouver le user dans la base de données qui correspond à l'adresse email qui est rentrée par l'utilisateur
    dans l'application et si l'utilisateur n'existe pas en renvoie une erreur*/
    User.findOne( {email: req.body.email} )
    .then(user => {
        //vérification si on trouve un user ou non 
      if (!user) {//si on ne trouve pas d'utilisateur 
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      /*utilisateur bien trouvé et on utilise bcrypt pour comparer le mot de passe 
      envoyé par l'utilisateur qui essaie de se connecter avec le hash qui est enregistré avec le user qu'on a reçu*/
      bcrypt.compare(req.body.password, user.password)//fonction compare 
        .then(valid => {
            // si la comparaison est fausse, c-a-d que l'utilisateur a entré un mauvais mot de passe 
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          //comparaison juste
          //on renvoie un objet json qui contiendra l'identifiant de l'utilisateur dans la base de données et un token qui 
          //est une chaine de caractères (qui deviendra le token d'authentification par la suite)
          res.status(200).json({
            userId: user._id,
            //token: 'TOKEN'
            token: jwt.sign(//les données que l'on veut encoder dans ce token
                //premier argument vérification de l'id
                { userId: user._id },
                //deuxième argument : clé secrète de l'encodage, création d'une clé
                'RANDOM_TOKEN_SECRET',
                //troisième argument : configuration où on applique une expiration pour le token 
                { expiresIn:'24h'}// chaque token dure 24h, au-delà il ne sera plus valable
            )
          });
        })
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};
