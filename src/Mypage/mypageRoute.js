module.exports = function (app) {
    const mypage = require('./mypageController');
    const jwtMiddleware = require('../../config/jwtMiddleware');

    // 10.1 마이페이지 조회
    app.get('/my-page', jwtMiddleware, mypage.getMypage);

    // 10.2 해당 유저의 페이지 조회
    app.get('/users/:userIdx/page', jwtMiddleware, mypage.getUserPage);

    // 10.3 내가 업로드한 아이템 조회
    app.get('/my-page/uploads', jwtMiddleware, mypage.getMyUpload);

    // 10.4 최근 본 게시글 조회
    app.get('/my-page/recents', jwtMiddleware, mypage.getRecentItem);

    // 10.5 해당 유저의 팔로워 목록 조회
    app.get('/users/:userIdx/followers', jwtMiddleware, mypage.getFollowers);

    // 10.6 해당 유저의 팔로잉 목록 조회
    app.get('/users/:userIdx/followings', jwtMiddleware, mypage.getFollowings);

    // 10.7 공지사항 목록 조회
    app.get('/notices', mypage.getNotices);

    // 10.8 해당 공지사항 상세보기
    app.get('/notices/:noticeIdx', mypage.getNoticeInfo);

    // 10.9 닉네임 수정 시 중복체크(수정할 때)
    app.get('/users/profiles/nickname-check', jwtMiddleware, mypage.checkNickname);

    // 10.10 마이페이지에서 프로필 수정
    app.patch('/users/profiles', jwtMiddleware, mypage.patchUsers);
}