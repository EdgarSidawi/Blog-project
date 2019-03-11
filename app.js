const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');
const mongoose = require('mongoose');
const session = require('express-session');
const mongodbStore = require('connect-mongodb-session')(session);
const multer = require('multer');

const MONGODB_URI =
  'mongodb+srv://romantibuai:edgarjunior@cluster0-rw3fu.mongodb.net/blog';

const app = express();

const store = new mongodbStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

app.engine(
  'hbs',
  expressHbs({
    // layoutsDir: 'views/layouts',
    // defaultLayout: 'main-layout',
    // extname: 'hbs'
  })
);
app.set('view engine', 'hbs');
app.set('views', 'views');

let time = Date.now();
// console.log(time);

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    // cb(null, new Date().toDateString + file.originalname);
    cb(null, time + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const blogRoutes = require('./routes/blog');
const adminRoutes = require('./routes/admin');
const errorController = require('./controllers/error');

app.use(bodyParser.urlencoded({ extended: false }));
// app.use(
//   multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
// );
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(
  session({
    secret: 'my name is lord emperor',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

// app.use((req, res, next) => {
//   res.locals.isAuthenticated = req.session.isAuthenticated;
//   next();
// });

app.use('/admin', adminRoutes);
app.use(blogRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Error'
    // isAuthenticated: req.session.isLoggedIn ? 'true' : ''
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(result => {
    app.listen(3000);
  })
  .catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
