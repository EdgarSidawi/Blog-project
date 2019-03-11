const express = require('express');
const { check, body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/dashboard', isAuth, adminController.getDashboard);
router.get('/write-post', isAuth, adminController.getWritePost);
router.get('/edit-post/:blogId', isAuth, adminController.getEditPost);
router.get('/', isAuth, adminController.getAdminPage);
router.get('/blog/:blogId', isAuth, adminController.getBlog);
router.post(
  '/write-post',
  body('title')
    .isString()
    .trim(),
  body('content')
    .isString()
    .trim(),
  isAuth,
  adminController.postWritePost
);
router.post(
  '/edit-post',
  body('title')
    .isString()
    .trim(),
  body('content')
    .isString()
    .trim(),
  isAuth,
  adminController.postEditPost
);
router.get('/delete/:blogId', isAuth, adminController.getDelete);
router.get('/logout', isAuth, adminController.getLogout);

module.exports = router;
