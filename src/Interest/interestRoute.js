module.exports = function (app) {
    const interest = require('./interestController');
    const jwtMiddleware = require('../../config/jwtMiddleware');

    // 3.0 셀럽 및 멤버 목록 조회
    app.get('/celebs/members', interest.getCelebsMembers);

    // 3.1 셀럽 목록 조회
    app.get('/celebs', interest.getCelebs);

    // 3.2 셀럽 추가 요청 하기
    app.post('/celebs/req', jwtMiddleware, interest.postCelebReq);

    // 3.3 멤버 목록 조회
    app.get('/members', interest.getMembers);


    // 3.4 다른 스러버들이 많이 선택한 셀럽
    app.get('/interest/top-choice', interest.getTopChoiceCelebs);


    // 3.5 해당 유저 관심 셀럽 + 멤버 조회
    app.get('/interest', jwtMiddleware, interest.getInterestCelebs);


    // 3.6 관심 셀럽 추가
    app.post('/interest', jwtMiddleware, interest.postInterestCelebs);

};
