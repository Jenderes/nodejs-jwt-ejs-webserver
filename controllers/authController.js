const User = require("../models/User");
const jwt = require('jsonwebtoken');
const doteenv = require('dotenv');

doteenv.config();
// проверка на ошибки
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  // Неверный Email
  if (err.message === 'incorrect email') {
    errors.email = 'That email is not registered';
  }

  // неверный пароль
  if (err.message === 'incorrect password') {
    errors.password = 'That password is incorrect';
  }

  // пользователь с таой почтой уже существует
  if (err.code === 11000) {
    errors.email = 'that email is already registered';
    return errors;
  }

  // ошибка валидации
  if (err.message.includes('user validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
}

// создание json web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.secretKey, {
    expiresIn: maxAge
  });
};

// рендер страниц
module.exports.getSignup = (req, res) => {
  res.render('signup');
}

module.exports.getLogin = (req, res) => {
  res.render('login');
}

module.exports.postSignup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.create({ email, password });
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  }
  catch(err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
 
}

module.exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } 
  catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
}

module.exports.getLogout = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
}