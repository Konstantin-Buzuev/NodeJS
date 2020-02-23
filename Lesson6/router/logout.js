const express = require('express');
const router = express.Router();
const passport = require('../middleware/passport')


router.get('/', (req, res) => {
    req.logout();
    res.redirect('/auth');
})

module.exports = router;