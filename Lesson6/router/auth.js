const express = require('express');
const router = express.Router();
const passport = require('../middleware/passport')
const token = require('../middleware/token')
// Установка куки по "Запомнить меня!"
router.post('/', async (req, res, next) => {
  if (!!req.body.rememberMe) token.save(req, res);
  next()
})
// Авторизация по паспорту
router.post('/', passport.authenticate)
router.get('/', async (req, res) => {
  const error = !!req.query.error
  res.render('auth', {
    error
  })
})

module.exports = router;