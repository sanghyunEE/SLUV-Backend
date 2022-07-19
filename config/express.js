const express = require('express');
const compression = require('compression');
const methodOverride = require('method-override');
const nunjucks = require('nunjucks');
const passport = require('passport');
const session = require('express-session');

const cors = require('cors');
module.exports = function () {
  const app = express();

  // html 로그인 테스트용 
  nunjucks.configure('views', {
    express: app,
  });
  // html 로그인 테스트용
  app.set('view engine', 'html');

  // Express session setting
  app.use(session({ secret: 'MySecret', resave: false, saveUninitialized: true }));
  // Passport setting
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(compression());

  app.use(express.json());

  app.use(express.urlencoded({ extended: true }));

  app.use(methodOverride());

  app.use(cors());
  // app.use(express.static(process.cwd() + '/public'));

  /* App (Android, iOS) */
  // TODO: 도메인을 추가할 경우 이곳에 Route를 추가하세요.
  require('../src/User/userRoute')(app);
  require('../src/Auth/authRoute')(app);
  require('../src/Interest/interestRoute')(app);
  require('../src/Item/itemRoute')(app);
  require('../src/Question/questionRoute')(app);
  require('../src/Home/homeRoute')(app);
  require('../src/Binder/binderRoute')(app);
  require('../src/Mypage/mypageRoute')(app);
  require('../src/Search/searchRoute')(app);
  require('../src/Admin/adminRoute')(app);
  require('../src/Alarm/alarmRoute')(app);


  return app;
};