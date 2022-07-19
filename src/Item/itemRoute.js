module.exports = function (app) {
    const item = require('./itemController');
    const jwtMiddleware = require('../../config/jwtMiddleware');

    // 브랜드 리스트 조회
    app.get('/brands', item.getBrands);

    // 4.1 정보공유하기 (아이템 정보 업로드)
    app.post('/items', jwtMiddleware, item.postItems);

    // 8.1 해당 아이템 상세보기
    app.get('/items/:itemIdx', item.getItemByIdx);

    // 8.2 해당 아이템 좋아요
    app.post('/items/:itemIdx/likes', jwtMiddleware, item.postItemLike);

    // 8.3 해당 아이템 좋아요 취소
    app.patch('/items/:itemIdx/likes', jwtMiddleware, item.deleteItemLike);

    // 8.4 해당아이템 수정하기
    app.patch('/items/:itemIdx', item.editItems);

    // 8.5 해당 아이템 삭제하기
    app.patch('/items/:itemIdx/status', item.deleteItems);

    // 8.7 게시글 신고하기
    app.post('/items/:itemIdx/report', jwtMiddleware, item.reportItems);

    // 8.8 게시글 수정 요청하기
    app.post('/items/:itemIdx/edit-req', jwtMiddleware, item.requestItemEdit);

};