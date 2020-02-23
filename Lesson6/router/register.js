const express = require('express');
const router = express.Router();
const User = require('../models/user');
const log = console.log
const passport = require('../middleware/passport')


router.get('/', async (req, res) => {
    res.render('register')
})

router.post('/', async (req, res) => {
    const user = new User(req.body)
    await user.save()
    res.redirect('/')
});

module.exports = router;