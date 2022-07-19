module.exports = function (app) {
  const home = require('./homeController');
  const jwtMiddleware = require('../../config/jwtMiddleware');

  // 6.1 이벤트 배너 조회
  app.get('/homes/events', home.getEvents);

  // 6.2 해당 유저 관심 셀럽(멤버) 아이템 조회
  app.get('/homes/items', jwtMiddleware, home.getItems);

  // 6.3 인기 스러버 추천
  app.get('/homes/hot-users', jwtMiddleware, home.getHotUsers);

  // 6.4 핫 아이템 조회
  app.get('/homes/hot-items', jwtMiddleware, home.getHotItems);

  // 6.5 인기 키워드 조회
  app.get('/homes/hot-keywords', home.getHotKeywords);

  // 6.6 같은 셀럽을 좋아하는 스러버 조회
  app.get('/homes/similar-users', jwtMiddleware, home.getSimUsers);

  // 6.7 팔로워 중인 유저가 작성한 아이템 조회
  app.get('/homes/items/followers', jwtMiddleware, home.getFollowerItems);
}