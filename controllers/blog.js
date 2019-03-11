const User = require('../models/user');
const bcrypt = require('bcrypt');
const Blog = require('../models/blog');
const { validationResult } = require('express-validator/check');

const ITEMS_PER_PAGE = 3;

exports.getindex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalBlogs;

  Blog.find()
    .countDocuments()
    .then(numBlogs => {
      totalBlogs = numBlogs;
      return Blog.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .sort({ createdAt: -1 })
        .then(blog => {
          res.render('index', {
            pageTitle: 'Index Page',
            isAuthenticated: req.session.isLoggedIn,
            blog: blog,
            validIndex: page !== 1 && page - 1 !== 1,
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalBlogs,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalBlogs / ITEMS_PER_PAGE),
            validLastPage:
              Math.ceil(totalBlogs / ITEMS_PER_PAGE) !== page &&
              page + 1 !== Math.ceil(totalBlogs / ITEMS_PER_PAGE)
          });
        });
    });
};

exports.getBlog = (req, res, next) => {
  const blogId = req.params.blogId;
  Blog.findById(blogId)
    .then(blog => {
      res.render('blog', {
        pageTitle: 'Blog Information',
        blog: blog,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getSignUp = (req, res, next) => {
  res.render('signup', {
    pageTitle: 'Sign Up'
  });
};

exports.postSignUp = (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  const error = validationResult(req);
  console.log(error.array());
  if (!error.isEmpty()) {
    return res.render('signup', {
      pageTitle: 'Sign Up',
      errorMessage: error.array()[0].msg,
      oldInput: {
        username: username,
        email: email
      }
    });
  }

  User.findOne({ email: email })
    .then(user => {
      if (user) {
        return res.render('signup', {
          pageTitle: 'Sign Up',
          errorMessage: 'E-Mail exists already, please pick a different one.',
          oldInput: {
            username: username,
            email: email
          }
        });
      }
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

  bcrypt
    .hash(password, 12)
    .then(hashedpassword => {
      const user = new User({
        username: username,
        email: email,
        password: hashedpassword
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getLogin = (req, res, next) => {
  res.render('login', {
    pageTitle: 'Login'
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.render('login', {
      pageTitle: 'Login',
      errorMessage: error.array()[0].msg,
      oldInput: {
        email: email
      }
    });
  }

  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        return res.render('login', {
          pageTitle: 'Login',
          errorMessage: 'Please enter Valid Email and Password',
          oldInput: {
            email: email
          }
        });
      }

      bcrypt.compare(password, user.password).then(match => {
        if (match) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(err => {
            res.redirect('/');
          });
        }
        return res.status(404).render('login', {
          pageTitle: 'Login',
          errorMessage: 'Please enter Valid Email and Password',
          oldInput: {
            email: email
          }
        });
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
