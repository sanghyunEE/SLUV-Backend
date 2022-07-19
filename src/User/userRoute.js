module.exports = function (app) {
    const user = require('./userController');
    const jwtMiddleware = require('../../config/jwtMiddleware');


    // 2.1 유저 닉네임 변경
    app.patch('/users/:userIdx/nickname', jwtMiddleware, user.patchUsers);

    // 2.2 유저 전화번호 중복 체크
    app.get('/users/phone-check', user.checkPhoneNum);

    // 2.3 유저 이메일 중복 체크
    app.get('/users/email-check', user.checkEmail);

    // 2.4 유저 닉네임 중복 체크
    app.get('/users/nickname-check', user.checkNickName);

    // 2.5 유저 패스워드 변경(재설정 포함)
    app.patch('/users/pwd', jwtMiddleware, user.patchPwd);

    // 8.6 유저 신고하기
    app.post('/users/:userIdx/report', jwtMiddleware, user.reportUser);

    // 9.1 팔로우 하기
    app.post('/users/:toUserIdx/follow', jwtMiddleware, user.followUser);

    // 9.2 언팔로우 하기
    app.delete('/users/:toUserIdx/follow', jwtMiddleware, user.unfollowUser);

};
