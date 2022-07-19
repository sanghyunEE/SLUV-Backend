const { logger } = require("../../config/winston");
const { pool } = require("../../config/database");
const secret_config = require("../../config/secret");

// user 뿐만 아니라 다른 도메인의 Provider와 Dao도 아래처럼 require하여 사용할 수 있습니다.
const mypageProvider = require("./mypageProvider");
const mypageDao = require("./mypageDao");

const baseResponse = require("../../config/baseResponseStatus");
const { response } = require("../../config/response");
const { errResponse } = require("../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");



exports.editUserProfile = async function (userIdx, nickName, profileImgUrl) {

    const connection = await pool.getConnection(async (conn) => conn);
    try {
        if (!profileImgUrl) {
            const editUserProfileResult = await mypageDao.updateUserOnlyNickName(connection, [nickName, userIdx]);
        } else {
            const editUserProfileResult = await mypageDao.updateUser(connection, [nickName, profileImgUrl, userIdx])
        }

        return response(baseResponse.SUCCESS);

    } catch (err) {
        console.log(`App - editUserProfile Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}