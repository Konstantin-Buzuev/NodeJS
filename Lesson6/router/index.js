const express = require('express')
const router = express.Router()
const auth = require('./auth')
const tasks = require('./tasks')
const register = require('./register')
const logout = require('./logout')
const authenticate = require('../middleware/authentication')
// Проверка аутентификации
router.use('/register', register)
router.use('/auth', auth)
router.use(authenticate)
router.use('/tasks', tasks)
router.use('/logout', logout)
router.all('/', (req, res) => {
    if (req.user) res.redirect('/tasks')
    else res.redirect('/auth')
})

module.exports = router;