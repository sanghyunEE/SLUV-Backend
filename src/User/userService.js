const { logger } = require("../../config/winston");
const { pool } = require("../../config/database");
const secret_config = require("../../config/secret");

// user 뿐만 아니라 다른 도메인의 Provider와 Dao도 아래처럼 require하여 사용할 수 있습니다.
const userProvider = require("./userProvider");
const userDao = require("./userDao");

const baseResponse = require("../../config/baseResponseStatus");
const { response } = require("../../config/response");
const { errResponse } = require("../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { connect } = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리
// POST PATCH DELETE 등의 행위 진행
// 의미적 validation 처리 - table에 닉네임 중복이 있는지, 비활성화 된 user 인지 


// User nickName 변경 
exports.editNickName = async function (userIdx, nickName) {
    const nickNameRows = await userProvider.retriveUserNickName(userIdx);
    // console.log(nickNameRows, "userProvider 결과")

    // 유저가 새롭게 입력한 닉네임과 원래 유저의 닉네임이 같으면 안되니까 해당 처리 진행
    if (nickNameRows.nickName === nickName)
        return errResponse(baseResponse.USER_REDUNDANT_NICKNAME);

    try {
        // console.log(userIdx)
        const connection = await pool.getConnection(async (conn) => conn);
        const editResult = await userDao.updateUserNickName(connection, userIdx, nickName)
        // console.log(editResult);
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


// User PWD 변경 
exports.editPwd = async function (userIdx, pwd) {

    const hashedPassword = await crypto
        .createHash("sha512")
        .update(pwd)
        .digest("hex");

    try {
        // console.log(userIdx)
        const connection = await pool.getConnection(async (conn) => conn);
        const editResult = await userDao.updateUserPwd(connection, userIdx, hashedPassword)
        // console.log(editResult);
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - editUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};


exports.reportUser = async function (reporterIdx, userIdx, category, content) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        const insertPrams = [reporterIdx, userIdx, category, content]
        const reportResult = await userDao.insertReportUser(connection, insertPrams);
        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - reportUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }

}


exports.followUser = async function (fromUserIdx, toUserIdx) {
    console.log(`${fromUserIdx}가 ${toUserIdx}를 팔로잉 합니다.`);
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        const insertPrams = [fromUserIdx, toUserIdx]
        const followResult = await userDao.insertFollow(connection, insertPrams);
        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - followUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}


exports.unfollowUser = async function (fromUserIdx, toUserIdx) {
    console.log(`${fromUserIdx}가 ${toUserIdx}를 언 팔로잉 합니다.`);
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        const deleteParams = [fromUserIdx, toUserIdx]
        const unfollowResult = await userDao.deleteFollow(connection, deleteParams);
        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - unfollowUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}