const express = require('express')
const router = express.Router()
const auth = require('./auth')
const tasks = require('./tasks')
const register = require('./register')
const logout = require('./logout')
const log = console.log

const mustBeAuthenticated = (req, res, next) => {
    if (req.user) next();
    else res.redirect('/auth')
};
router.use('/register', register)
router.use('/auth', auth)
router.use(mustBeAuthenticated)
router.use('/tasks', tasks)
router.use('/logout', logout)
router.all('/', (req, res, body) => {
    if (req.user) res.redirect('/tasks')
    else res.redirect('/auth')
})


module.exports = router;