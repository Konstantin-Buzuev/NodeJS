const express = require('express');
const router = express.Router();
const token = require('../middleware/token')
//
router.get('/', async (req, res) => {
    let currentUser = req.user
    await token.check(req, res).then(user => {
            if (user.username === currentUser.username) {
                res.clearCookie('token')
            }
        })
        .catch(err => {})
    req.logout()
    res.clearCookie('connect.sid')
    res.redirect('/auth')
})

module.exports = router;