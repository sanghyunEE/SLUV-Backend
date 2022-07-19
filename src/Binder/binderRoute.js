module.exports = function (app) {
  const binder = require('./binderController');
  const jwtMiddleware = require('../../config/jwtMiddleware');

  // 7.1 바인더 생성 API
  app.post('/binders', jwtMiddleware, binder.postBinders);

  // 7.2 해당 아이템 특정 바인더에 찜 추가 API
  app.post('/dibs', binder.postDibs);

  // 7.3 바인더 목록 조회 API
  app.get('/binders', jwtMiddleware, binder.getBinders);

  // 7.4 해당 바인더의 찜 아이템 목록 조회
  app.get('/dibs/:binderIdx', binder.getDibs);

  // 7.5 해당 바인더의 찜 아이템 목록 삭제(=수정)
  app.patch('/dibs/:binderIdx', binder.patchDibsStatus);

  // 7.6 찜 아이템 다른 바인더로 이동시키기
  app.patch('/dibs/:fromBinderIdx/:toBinderIdx', binder.patchDibsBinderIdx);

  // 7.7 바인더 수정
  app.patch('/binders/:binderIdx', binder.patchBinders);

  // 7.8 바인더 삭제
  app.patch('/binders/:binderIdx/status', binder.patchBinderStatus);

  // 7.9 아이템 찜 취소
  app.delete('/dibs/:itemIdx', jwtMiddleware, binder.deleteDib);

}