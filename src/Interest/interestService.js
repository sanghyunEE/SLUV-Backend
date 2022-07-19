const { logger } = require("../../config/winston");
const { pool } = require("../../config/database");
const secret_config = require("../../config/secret");

// user 뿐만 아니라 다른 도메인의 Provider와 Dao도 아래처럼 require하여 사용할 수 있습니다.
const interestProvider = require("./interestProvider");
const interestDao = require("./interestDao");

const baseResponse = require("../../config/baseResponseStatus");
const { response } = require("../../config/response");
const { errResponse } = require("../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { connect } = require("http2");

// Service: Create, Update, Delete 비즈니스 로직 처리
// POST PATCH DELETE 등의 행위 진행
// 의미적 validation 처리 - table에 닉네임 중복이 있는지, 비활성화 된 user 인지

// 셀럽 추가 요청
exports.createCelebReq = async function (userIdxFromJWT, name, reason) {
    const connection = await pool.getConnection(async (conn) => conn);

    const insertParams = [userIdxFromJWT, name, reason];

    const celebReqResult = await interestDao.insertCelebReq(connection, insertParams);
    connection.release();
    console.log(celebReqResult)

    return celebReqResult;
}

// 관심 셀럽 추가 
exports.createInterestCeleb = async function (userIdx, celebIdx) {
    const connection = await pool.getConnection(async (conn) => conn);

    const insertParams = [userIdx, celebIdx];

    const interestCelebResult = await interestDao.insertInterestCeleb(connection, insertParams);
    connection.release();

    return interestCelebResult
}

// 관심 멤버 추가
exports.createInterestMember = async function (userIdx, celebIdx, memberIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const interestCelebIdx = await interestProvider.retrieveInterestCelebIdx(userIdx, celebIdx);

    const insertParams = [interestCelebIdx.interestCelebIdx, memberIdx];

    const interestMemberResult = await interestDao.insertInterestMember(connection, insertParams);
    connection.release();

    return interestMemberResult
}


// 관심 셀럽 추가(수정) 시 기존 관심셀럽 전부 제거
exports.deleteInterestCelebs = async function (userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();
        console.log("userIdx: ", userIdx);
        const interestCelebIdxResult = await interestProvider.retrieveInterestCelebIdxs(userIdx);
        // console.log(1, interestCelebIdxResult);
        for (interestCelebIdx of interestCelebIdxResult) {
            const deleteInterestMemberResult = await interestDao.deleteInterestMember(connection, interestCelebIdx.interestCelebIdx);
        }

        const deleteInterestCelebResult = await interestDao.deleteInterestCeleb(connection, userIdx);



        await connection.commit();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        console.log(`App - editInterestCelebs Service error\n: ${err.message}`);
        await connection.rollback();
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}