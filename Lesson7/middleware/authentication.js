const token = require('./token')

const authenticate = async (req, res, next) => {
    if (req.user !== undefined) {
        next() // Сначала сессия
    } else {
        token.check(req, res).then(user => {
                req.user = user
                next() // Потом токен
            })
            .catch(err => {
                res.redirect('/auth')
            })
    }
};

module.exports = authenticate