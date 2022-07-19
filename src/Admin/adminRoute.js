//클라이언트의 요청을 '라우팅' 해주는 곳
module.exports = function (app) {
  const admin = require('./adminController');
  const jwtMiddleware = require('../../config/jwtMiddleware');


  // A1 관리자 로그인
  app.post('/admin/login', admin.adminLogin);

  // A2 관리자가 공지사항 목록 조회
  app.get('/admin/notices', jwtMiddleware, admin.getNotices);

  // A3 관리자가 특정 공지사항 추가
  app.post('/admin/notices', jwtMiddleware, admin.postNotice);

  // A4 관리자가 특정 공지사항 삭제
  app.delete('/admin/notices/:noticeIdx', jwtMiddleware, admin.deleteNotice);

}