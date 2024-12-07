/*jshint esversion: 6 */
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const taskRouter = require('./routes/task');

const app = express();

// Configuración para servir archivos estáticos desde una ruta absoluta
app.use(express.static('/home/est/e9298889/public_html'));

// Vista de motor de plantillas (views) y configuración general
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/task', taskRouter);

// Manejador de errores 404
app.use(function(req, res, next) {
  next(createError(404));
});

// Manejador de errores generales
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Servidor que escucha en el puerto 3017
const server = app.listen(3017, () => {
    console.log('Server is running on http://ubiwan.epsevg.upc.edu:3017');
});

module.exports = app;
