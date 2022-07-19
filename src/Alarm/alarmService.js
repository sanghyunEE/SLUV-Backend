const { logger } = require("../../config/winston");
const { pool } = require("../../config/database");
const secret_config = require("../../config/secret");

const alarmProvider = require("./alarmProvider");
const alarmDao = require("./alarmDao");

const baseResponse = require("../../config/baseResponseStatus");
const { response } = require("../../config/response");
const { errResponse } = require("../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");


// POST PATCH DELETE 등의 행위 진행
// 의미적 validation 처리

exports.editFcm = async function (userIdx, fcmToken, platform, type) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        const fcmUserResult = await alarmDao.selectFcmUser(connection, userIdx);
        if (fcmUserResult.length < 1) {
            const insertParams = [userIdx, fcmToken, platform, type];
            const insertFcmResult = await alarmDao.insertFcm(connection, insertParams);
        } else {
            const updateParams = [fcmToken, platform, type, userIdx];
            const updateFcmResult = await alarmDao.updateFcm(connection, updateParams);
        }

        return response(baseResponse.SUCCESS);

    } catch (err) {
        console.log(`App - createFcm Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}