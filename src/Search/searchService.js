const { logger } = require("../../config/winston");
const { pool } = require("../../config/database");
const secret_config = require("../../config/secret");

// user 뿐만 아니라 다른 도메인의 Provider와 Dao도 아래처럼 require하여 사용할 수 있습니다.
const searchProvider = require("./searchProvider");
const searchDao = require("./searchDao");

const baseResponse = require("../../config/baseResponseStatus");
const { response } = require("../../config/response");
const { errResponse } = require("../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.deleteRecentWord = async function (recentSearchIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        const deleteRecentWordResult = await searchDao.deleteRecentWord(connection, recentSearchIdx);
        return response(baseResponse.SUCCESS);
    } catch (err) {
        console.log(`App - deleteRecentWord Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}

exports.deleteAllRecentWord = async function (userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        const deleteAllRecentWordResult = await searchDao.deleteAllRecentWord(connection, userIdx);
        return response(baseResponse.SUCCESS);
    } catch (err) {
        console.log(`App - deleteAllRecentWord Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}

exports.createSearchWord = async function (userIdx, searchWord) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        const searchWordCheck = await searchDao.searchWordCheck(connection, [userIdx, searchWord]);
        if (searchWordCheck.length < 1) {
            const createSearchWordResult = await searchDao.insertSearchWord(connection, [userIdx, searchWord]);
        }


        const recentWordCheck = await searchDao.recentWordCheck(connection, [userIdx, searchWord]);
        console.log(recentWordCheck.length);
        if (recentWordCheck.length > 0) {
            const deleteRecentWord = await searchDao.deleteRecentWord(connection, recentWordCheck[0].recentSearchIdx);
        }


        const createRecentWordResult = await searchDao.insertRecentWord(connection, [userIdx, searchWord])
        await connection.commit();
        return response(baseResponse.SUCCESS);
    } catch (err) {
        console.log(`App - createSearchWord Service error\n: ${err.message}`);
        await connection.rollback();
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}


