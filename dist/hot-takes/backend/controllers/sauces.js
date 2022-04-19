/**
 * Ce fichier permet à un utilisateur de créer une sauce, de modifier sa sauce, de supprimer une sauce, et d'obtenir
 * toutes ces sauces. 
 */


const Sauce = require('../models/Sauce'); 

//pour pouvoir accéder au système de fichiers, on importe fs de node et avoir
// accès aux différentes opérations liées aux fichiers
const fs = require ('fs'); 
const { JsonWebTokenError } = require('jsonwebtoken');



//on exporte la logique de création d'une sauce 
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce); 
    //suppression de l'id généré automatiquement par mongodb
    delete sauceObject._id;
    const sauce = new Sauce({
        //opérateur spread (...) copie les champs de la requête et détaille les éléments
        ...sauceObject,
        //url de l'image: protocole, nom d'hôte, dossier, nom du fichier
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({message: 'Sauce enregistrée !'}))
        .catch(error => res.status(400).json({error}));
};



// on exporte la logique de modification d'une sauce
exports.modifySauce = (req, res, next) => {
    //accéder au fichier
    Sauce.findOne({_id: req.params.id})
    .then((sauce) => {      
        //si la sauce n'existe pas 
        if(!sauce) {
            return res.status(404).json({
                error: new Error('sauce non trouvée !')
            })
        }
        //contrôle du userId si autorisé à modifier l'objet en comparant l'userId qui a crée
        //la sauce et l'userId qui veut modifier la sauce
        if(sauce.userId !== req.auth.userId) {
            return res.status(403).json({
                error: new Error('requête non autorisée !')
            })       
        }
        
        const sauceObject = req.file ?
        //si le fichier req.file existe 
        {

            
            ...JSON.parse(req.body.sauce),//récupération des informations de l'objet sur cette partie de la requête
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`//on génère une nouvelle image
        
        } : 
        //si le fichier req.file n'existe pas 
        {...req.body};
        /*updateOne permet de mettre à jour la modification peu importe son format et on met à jour
            l'identifiant de la sauce correspondant aux paramètres des requêtes
        */

        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
                .catch(error => res.status(400).json({ error }));
            })

    .catch(error => res.status(400).json({error}));

}; 



//on exporte la logique de suppression d'une sauce
exports.deleteSauce = (req, res, next) => {
    //accéder au fichier
    Sauce.findOne({_id: req.params.id})//id qui correspond aux paramètres de la requête
        //récupérer le nom du fichier précisément
        .then((sauce) => {
        
            if (!sauce) {
                return res.status(404).json({
                    error: new Error('Sauce non trouvée !')
                });
            }

            if (sauce.userId !== req.auth.userId) {
                return res.status(403).json({
                    error: new Error('Requête non autorisée!')
                });
            }

            const filename = sauce.imageUrl.split('/images/')[1/*on récupère le nom du fichier ce qui 
            vient après le dossier images donc le deuxième élément. Le premier élément
            est ce qui vient avant le dossier images*/];
            //on appelle fs pour supprimer le fichier 
            fs.unlink(`images/${filename}`, () => {
                //ce qu'il faut faire une fois le fichier supprimé
                 /*la méthode deleteOne() fonctionne comme findOne() et updateOne() dans le sens
                    où nous lui passons un objet correspondant au document à supprimer. Suppression
                    dans la base de données. */
                Sauce.deleteOne({ _id: req.params.id })
                /*Nous envoyons une réponse de réussite ou d'échec au front-end*/
                    .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
                    .catch(error => res.status(400).json({ error }));
            })

        })
        .catch(error => res.status(400).json({error}));
}; 

        

//on exporte la logique de récupération d'une seule sauce
exports.getOneSauce = (req, res, next) => {
    //findOne pour trouver un seul objet et pas tous
    //trouver le Thing unique ayant le même id que le paramètre de la requête
    Sauce.findOne({ _id: req.params.id })
        //promise
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(400).json({ error }));
}; 

//on exporte la logique de récupération de toutes les sauces 
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
}; 


//On exporte la logique de création d'un like ou dislike 
exports.likeDislikeSauce = (req, res, next ) => {

    //aller chercher la sauce dans la base de données
    Sauce.findOne({_id : req.params.id})
        .then((sauce) => {
    
        //like = 1 (like = +1 (l'utilisateur aime la sauce))
        //utilisation de la méthode includes(), des opérateurs $inc, $push, $pull
        //empêche l'utilisateur de même id de liker ou disliker plusieurs fois 
        //le userId n'est pas dans la base de données (usersLiked) et like strictement égal à 1 
        if (!sauce.usersLiked.includes(req.body.userId) && req.body.like === 1) {
            Sauce.updateOne(
            { _id: req.params.id },
            {
                $inc: { likes: 1 },
                $push: { usersLiked: req.body.userId },
        
            }
            )
            .then(() => res.status(200).json({ message: "like ajouté !" }))
            .catch((error) => res.status(400).json({ error }));  
        };

        //like = 0 (like = 0 (annulation du like))
        //si userId présent dans usersLiked et si dans le req body il y a 0 like alors on enlève 1 au like
        if(sauce.usersLiked.includes(req.body.userId) && req.body.like === 0){
            //mise à jour de la sauce 
            Sauce.updateOne(
                {_id: req.params.id},
                {
                    $inc: { likes: -1 },// le like repasse à 0
                    $pull: { usersLiked: req.body.userId },//suppression avec pull
                }
            )
            .then(()=> res.status(200).json({message: 'like annulé !'}))
            .catch((error) => res.status(400).json({ error }));
        };

        //like = -1 (dislike = +1 (l'utilisateur n'aime pas la sauce))
        if (!sauce.usersDisliked.includes(req.body.userId) && req.body.like === -1) {
            Sauce.updateOne(
                { _id: req.params.id },
                {
                    $inc: { dislikes: 1 },
                    $push: { usersDisliked: req.body.userId },
        
                }
            )
            .then(() => res.status(200).json({ message: "dislike ajouté !" }))
            .catch((error) => res.status(400).json({ error }));  
        };

        //like = 0 (dislike = 0 (annulation du dislike))
        if(sauce.usersDisliked.includes(req.body.userId) && req.body.like === 0){
            //mise à jour de la sauce 
            Sauce.updateOne(
                {_id: req.params.id},
                {
                    $inc: { dislikes: -1 }, //le dislike repasse à 0
                    $pull: { usersDisliked: req.body.userId },//suppression avec pull
                }
            )
            .then(()=> res.status(200).json({message: 'dislike annulé !'}))
            .catch((error) => res.status(400).json({ error }));
        };
        })
        .catch((error) => res.status(404).json({error})); //sauce non trouvée 
}; 
   

