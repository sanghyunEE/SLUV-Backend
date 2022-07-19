//클라이언트의 요청을 '라우팅' 해주는 곳
const jwtMiddleware = require('../../config/jwtMiddleware');
const passport = require('../../config/passport') // google 테스트용 모듈 import
require('dotenv').config()

module.exports = function (app) {
  const auth = require('./authController');



  // 나중에 /auth랑 /auth/kakao 는 지우자.. 프론트에서 헷갈릴 수도 있음 
  app.get('/auth', (req, res) => {
    res.render('index.html');
  });

  // kakao test 용
  app.get('/auth/kakao', (req, res) => {
    // console.log(process.env.KAKAO_CLIENT_ID);
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${process.env.KAKAO_REDIRECT_URI}&response_type=code`;
    res.redirect(kakaoAuthURL);
  });

  // google test 용
  app.get('/auth/google', (req, res) => {
    // console.log(process.env.KAKAO_CLIENT_ID);
    const googleAuthURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&include_granted_scopes=true&scope=https://www.googleapis.com/auth/userinfo.email`;
    res.redirect(googleAuthURL);
  });

  // google one tap test 용
  app.post('/auth/g-login', auth.g_login);

  // -------------------------------------------------------


  // 1.1 카카오 로그인(사실상 회원가입이자 로그인)
  app.get('/auth/kakao-login', auth.kakao_login);

  // 1.2 구글 로그인
  app.get('/auth/google-login', auth.google_login);

  // 1.4 로컬 회원가입
  app.post('/auth/signup', auth.local_signup);

  // 1.5  로컬 로그인
  app.post('/auth/login', auth.local_login);

  // 1.6 자동 로그인
  app.get('/auth/auto-login', jwtMiddleware, auth.auto_login);

  // 1.7 인증번호 발송
  app.get('/auth/sms', auth.send_certnum);

  // 1.8 인증번호 인증
  app.get('/auth/sms/validation', auth.certify_certnum);

  // 1.9 비밀번호 변경 링크 요청
  app.post('/auth/forget-pwd', auth.send_editLink);

  // 1.10 이메일 찾기
  app.get('/auth/forget-email', auth.getEmail);



}