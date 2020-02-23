const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('../middleware/passport')
const log = console.log
// Авторизация по паспорту
router.post('/', passport.authenticate)

router.get('/', async (req, res) => {
  const error = !!req.query.error
  res.render('auth', {
    error
  })

})

module.exports = router;

// Авторизация по токену
// router.post('/', async (req, res) => {
//   const {
//     username,
//     password
//   } = req.body;
//   const user = await User.findOne({
//     username
//   });

//   if (!user) {
//     return res.json({
//       message: 'Wrong user'
//     });
//   }

//   if (!user.comparePassword(password)) {
//     return res.json({
//       message: 'Wrong password'
//     });
//   }

//   const plainUser = JSON.parse(JSON.stringify(user));
//   delete plainUser.password;

//   //log(!!req.body.rememberMe)

//   res.json({
//     token: jwt.sign(plainUser, 'secret-user-phrase'),
//   });
// });