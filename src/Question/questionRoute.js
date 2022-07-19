module.exports = function (app) {
  const question = require('./questionController');
  const jwtMiddleware = require('../../config/jwtMiddleware');

  // 5.1 질문하기
  app.post('/questions', jwtMiddleware, question.postQuestion);


};