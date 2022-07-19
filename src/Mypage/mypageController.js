const jwtMiddleware = require("../../config/jwtMiddleware");
const mypageProvider = require("./mypageProvider");
const mypageService = require("./mypageService");
const baseResponse = require("../../config/baseResponseStatus");
const { response, errResponse } = require("../../config/response");
const { API_QUERYSTRING_EMPTY } = require("../../config/baseResponseStatus");
require('dotenv').config()

// 10.1 마이페이지 조회
exports.getMypage = async function (req, res) {
    const userIdx = req.verifiedToken.userIdx;

    const userInfo = await mypageProvider.retrieveUserInfo(userIdx);
    const uploadInfo = await mypageProvider.retrieveUploadInfo(userIdx);
    return res.send(response(baseResponse.SUCCESS, {
        isMyPage: 'Y',
        userInfo: userInfo,
        uploadInfo: uploadInfo
    }));

}

// 10.2 해당 유저의 페이지  조회
exports.getUserPage = async function (req, res) {
    const myIdx = req.verifiedToken.userIdx; // 현재 유저 식별자
    const userIdx = req.params.userIdx; // 조회할 유저 페이지
    if (!userIdx) {
        return res.send(errResponse(baseResponse.USER_IDX_EMPTY));
    }

    let isMyPage;
    if (myIdx == userIdx) {
        isMyPage = 'Y';
    } else {
        isMyPage = 'N';
    }

    const userInfo = await mypageProvider.retrieveUserInfo(userIdx, myIdx);
    const uploadInfo = await mypageProvider.retrieveUploadInfo(userIdx, myIdx);
    return res.send(response(baseResponse.SUCCESS, {
        isMyPage: isMyPage,
        userInfo: userInfo,
        uploadInfo: uploadInfo
    }));
}


// 10.3 내가 업로드한 아이템 조회
exports.getMyUpload = async function (req, res) {
    const userIdx = req.verifiedToken.userIdx;
    const uploadInfo = await mypageProvider.retrieveUploadInfo(userIdx);
    return res.send(response(baseResponse.SUCCESS, uploadInfo));
}

// 10.4 최근 본 게시글 조회
exports.getRecentItem = async function (req, res) {
    const userIdx = req.verifiedToken.userIdx;
    const recentItemInfo = await mypageProvider.retrieveRecentItemInfo(userIdx);
    return res.send(response(baseResponse.SUCCESS, recentItemInfo));
}


// 10.5 해당 유저의 팔로워 목록 조회
exports.getFollowers = async function (req, res) {
    const myIdx = req.verifiedToken.userIdx;
    const userIdx = req.params.userIdx;
    if (!userIdx) {
        return res.send(errResponse(baseResponse.USER_IDX_EMPTY));
    }

    const followersList = await mypageProvider.retrieveFollowerList(myIdx, userIdx);
    return res.send(response(baseResponse.SUCCESS, followersList));
}

// 10.6 해당 유저의 팔로잉 목록 조회
exports.getFollowings = async function (req, res) {
    const myIdx = req.verifiedToken.userIdx;
    const userIdx = req.params.userIdx;
    if (!userIdx) {
        return res.send(errResponse(baseResponse.USER_IDX_EMPTY));
    }

    const followingsList = await mypageProvider.retrieveFollowingList(myIdx, userIdx);
    return res.send(response(baseResponse.SUCCESS, followingsList));
}

// 10.7 공지사항 목록 조회
exports.getNotices = async function (req, res) {
    const noticeList = await mypageProvider.retrieveNoticeList();
    return res.send(response(baseResponse.SUCCESS, noticeList));
}

// 10.8 해당 공지사항 상세보기
exports.getNoticeInfo = async function (req, res) {
    const noticeIdx = req.params.noticeIdx;
    if (!noticeIdx) {
        return res.send(errResponse(baseResponse.NOTICE_IDX_EMPTY));
    }
    const noticeInfo = await mypageProvider.retrieveNoticeInfo(noticeIdx);
    return res.send(response(baseResponse.SUCCESS, noticeInfo));
}

// 10.9 닉네임 수정 시 중복 체크
exports.checkNickname = async function (req, res) {
    // console.log(req.query);
    const userIdx = req.verifiedToken.userIdx;
    const nickName = req.query.nickname;
    if (!nickName) {
        return res.send(errResponse(baseResponse.SIGNUP_NICKNAME_EMPTY));
    }
    const checkNicknameResponse = await mypageProvider.checkNicknameRedundant(userIdx, nickName);
    return res.send(checkNicknameResponse)
}

// 10.10 마이페이지에서 프로필 수정
exports.patchUsers = async function (req, res) {
    const userIdx = req.verifiedToken.userIdx;
    const { nickName, profileImgUrl } = req.body;
    if (!nickName) {
        return res.send(errResponse(baseResponse.API_PARAMETER_EMPTY));
    }

    const editUserProfileResponse = await mypageService.editUserProfile(userIdx, nickName, profileImgUrl);
    return res.send(editUserProfileResponse);

}