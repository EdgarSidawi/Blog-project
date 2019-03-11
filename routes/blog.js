const express = require('express');
const { check, body } = require('express-validator/check');

const blogController = require('../controllers/blog');
const User = require('../models/user');

const router = express.Router();

router.get('/', blogController.getindex);
router.get('/signup', blogController.getSignUp);
router.get('/login', blogController.getLogin);
router.post(
  '/signup',
  body('username')
    .isString()
    .trim(),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email!')
    .custom((value, req) => {
      return User.findOne({ email: value }).then(userDoc => {
        if (userDoc) {
          return Promise.reject(
            'E-Mail exists already, please pick a different one.'
          );
        }
      });
    })
    // .withMessage('Email is not available!!!!')
    .normalizeEmail(),
  body(
    'password',
    'Please enter a valid password with altleast five characters'
  )
    .isLength({ min: 5 })
    .trim(),
  blogController.postSignUp
);
router.post(
  '/login',
  body('email')
    .isEmail()
    .withMessage('Please enter Valid Email and Password')
    .normalizeEmail(),
  body('password', 'Please enter Valid Email and Password')
    .isLength({ min: 5 })
    .trim(),
  blogController.postLogin
);
router.get('/blog/:blogId', blogController.getBlog);

module.exports = router;
