const baseResponse = require("../../config/baseResponseStatus");
const { pool } = require("../../config/database");
const { response, errResponse } = require("../../config/response");
const { logger } = require("../../config/winston");

const mypageDao = require("./mypageDao");


exports.retrieveUserInfo = async function (userIdx, myIdx = 0) {
    const connection = await pool.getConnection(async (conn) => conn);

    let userInfoResult;
    if (myIdx == 0) {
        userInfoResult = await mypageDao.selectMypageUser(connection, userIdx);
    } else {
        userInfoResult = await mypageDao.selectOtherUser(connection, myIdx, userIdx);
    }

    const interestCelebListResult = await mypageDao.selectInterestCeleb(connection, userIdx);
    // console.log(interestCelebListResult);
    userInfoResult[0].interestCelebList = interestCelebListResult;

    connection.release();
    return userInfoResult[0];
}

exports.retrieveUploadInfo = async function (userIdx, myIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const uploadInfoResult = await mypageDao.selectUploadItem(connection, userIdx, myIdx);
    // console.log(uploadInfoResult);


    connection.release();
    return {
        uploadCnt: uploadInfoResult.length,
        uploadItemList: uploadInfoResult
    };
}


exports.retrieveRecentItemInfo = async function (userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const recentItemInfoResult = await mypageDao.selectRecentItem(connection, userIdx);
    connection.release();
    return {
        recentItemCnt: recentItemInfoResult.length,
        recentItemList: recentItemInfoResult
    };
}


exports.retrieveFollowerList = async function (myIdx, userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const followerListResult = await mypageDao.selectFollowers(connection, myIdx, userIdx);
    for (user of followerListResult) {
        if (myIdx == user.userIdx) {
            user.isMe = 'Y'
        } else {
            user.isMe = 'N'
        }
    }
    connection.release();

    return followerListResult;
}

exports.retrieveFollowingList = async function (myIdx, userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const followingListResult = await mypageDao.selectFollowings(connection, myIdx, userIdx);
    for (user of followingListResult) {
        if (myIdx == user.userIdx) {
            user.isMe = 'Y'
        } else {
            user.isMe = 'N'
        }
    }
    connection.release();

    return followingListResult;
}

exports.retrieveNoticeList = async function () {
    const connection = await pool.getConnection(async (conn) => conn);
    const noticeListResult = await mypageDao.selectNotices(connection);
    connection.release();

    return noticeListResult;
}

exports.retrieveNoticeInfo = async function (noticeIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const noticeInfoResult = await mypageDao.selectNoticeInfo(connection, noticeIdx);
    connection.release();

    return noticeInfoResult[0];
}

exports.checkNicknameRedundant = async function (userIdx, nickName) {
    const connection = await pool.getConnection(async (conn) => conn);
    const nicknameResult = await mypageDao.selectNickname(connection, [userIdx, nickName]);
    connection.release();
    if (nicknameResult.length > 0) {
        return baseResponse.SIGNUP_REDUNDANT_NICKNAME;
    } else {
        return baseResponse.SUCCESS;
    }


}