const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    try {
        if (sauceObject.userId == req.token.userId) {
            sauce.save()
                .then(() => res.status(201).json({ message: 'Sauce ajoutée !'}))
                .catch(error => res.status(400).json({ error }));
        } else {
            throw 'Invalid user ID';
        }
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(`images/${req.file.filename}`);
        }
        res.status(403).json({ error });
    }
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
    try {
        if (sauceObject.userId == req.token.userId) {

            if (req.file) {
                Sauce.findOne({ _id: req.params.id })
                    .then(oldSauce => {
                        const filename = oldSauce.imageUrl.split('/images/')[1];
                        fs.unlinkSync(`images/${filename}`);
                    })
                    .catch (error => res.status(400).json({ error }));
            }

            Sauce.updateOne({_id: req.params.id}, { ...sauceObject, _id: req.params.id})
                .then(() => res.status(201).json({ message: 'Sauce mise à jour !'}))
                .catch(error => res.status(400).json({ error }));
        } else {
            throw 'Invalid user ID';
        }
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(`images/${req.file.filename}`);
        }
        res.status(403).json({ error });
    }
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            try {
                if (sauce.userId == req.token.userId) {
                    const filename = sauce.imageUrl.split('/images/')[1];
                    fs.unlink(`images/${filename}`, () => {
                        Sauce.deleteOne({ _id: req.params.id})
                            .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
                            .catch(error => res.status(400).json({ error }));
                    })
                } else {
                    throw 'Invalid user ID';
                }
            } catch (error) {
                res.status(403).json({ error });
            }
        })
        .catch(error => res.status(400).json({ error }));
};

exports.manageRating = (req, res, next) => {
    const userId = req.body.userId;
    const like = req.body.like;

    Sauce.findOne({ _id: req.params.id})
        .then(sauce => {

            if (userId) {
                let userLike = sauce.usersLiked.includes(userId);
                let userDislike = sauce.usersDisliked.includes(userId);
            
                switch (like) {
                    case 1:
                        if (!userLike) {
                            sauce.usersLiked.push(userId);
                            sauce.likes = sauce.usersLiked.length;
                        } else {
                            throw "Like déjà ajouté !";
                        }
                        if (userDislike) {
                            sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(userId), 1);
                            sauce.dislikes = sauce.usersDisliked.length;
                        }
                        break;

                    case 0:
                        if (userLike) {
                            sauce.usersLiked.splice(sauce.usersLiked.indexOf(userId), 1);
                            sauce.likes = sauce.usersLiked.length;
                        }
                        if (userDislike) {
                            sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(userId), 1);
                            sauce.dislikes = sauce.usersDisliked.length;
                        }
                        break;

                    case -1:
                        if (!userDislike) {
                            sauce.usersDisliked.push(userId);
                            sauce.dislikes = sauce.usersDisliked.length;
                        } else {
                            throw 'Dislike déjà ajouté';
                        }

                        if (userLike) {
                            sauce.usersLiked.splice(sauce.usersLiked.indexOf(userId), 1);
                            sauce.likes = sauce.usersLiked.length;
                        }
                        break;
                }
                sauce.save()
                .then(() => res.status(201).json({ message: 'Évaluation mise à jour !'}))
                .catch(error => res.status(400).json({ error }));

            } else {
                throw 'Évaluation impossible !';
            }

        })
        .catch(error => res.status(400).json({ error }));
}

exports.getAllSauce = (req, res, next) => {
    Sauce.find()
        .then(things => res.status(200).json(things))
        .catch(error => res.status(404).json({ error })); 
};