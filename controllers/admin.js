const fileHelper = require('../util/file');
const Blog = require('../models/blog');
const { validationResult } = require('express-validator/check');

const ITEMS_PER_PAGE = 3;

exports.getAdminPage = (req, res, next) => {
  res.render('adminPage', {
    pageTitle: 'Admin Page'
  });
};

exports.getDashboard = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalBlogs;

  Blog.find({ userId: req.session.user._id })
    .countDocuments()
    .then(numBlogs => {
      totalBlogs = numBlogs;
      return Blog.find({ userId: req.session.user._id })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .sort({ createdAt: -1 })
        .then(blog => {
          res.render('dashboard', {
            pageTitle: 'Dashboard',
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
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getWritePost = (req, res, next) => {
  res.render('write-post', {
    pageTitle: 'Create Blog'
  });
};

exports.getEditPost = (req, res, next) => {
  const blogId = req.params.blogId;
  Blog.findById(blogId)
    .then(blog => {
      res.render('write-post', {
        pageTitle: 'Edit Post',
        blog: blog,
        editing: true
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditPost = (req, res, next) => {
  const blogId = req.body.blogId;
  const updatedtitle = req.body.title;
  const image = req.file;
  const updatedcontent = req.body.content;

  Blog.findById(blogId)
    .then(blog => {
      blog.title = updatedtitle;
      if (image) {
        fileHelper.deleteFile(blog.imageUrl);
        blog.imageUrl = image.path;
      }
      blog.content = updatedcontent;
      return blog.save();
    })
    .then(result => {
      res.redirect('/admin/dashboard');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postWritePost = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const content = req.body.content;

  // const error = validationResult(req);
  // if (!error.isEmpty()) {
  //   return res.render('write-post', {
  //     pageTitle: 'Create Blog',
  //     errorMessage: error.array()[0].msg,
  //     oldInput: {
  //       title: title,
  //       content: content
  //     }
  //   });
  // }

  imageUrl = image.path;

  blog = new Blog({
    title: title,
    imageUrl: imageUrl,
    content: content,
    creator: req.session.user.username,
    userId: req.session.user._id
  });

  blog
    .save()
    .then(result => {
      res.redirect('/admin/dashboard');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getBlog = (req, res, next) => {
  blogId = req.params.blogId;
  Blog.findById(blogId)
    .then(blog => {
      res.render('blog', {
        pageTitle: 'My Blog',
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

exports.getDelete = (req, res, next) => {
  blogId = req.params.blogId;
  Blog.findById(blogId)
    .then(blog => {
      fileHelper.deleteFile(blog.imageUrl);
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });

  Blog.findByIdAndRemove(blogId)
    .then(blog => {
      return res.redirect('/admin/dashboard');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getLogout = (req, res, next) => {
  req.session.destroy();
  res.redirect('/login');
};
