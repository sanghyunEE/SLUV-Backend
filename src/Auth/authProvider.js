const { pool } = require("../../config/database");
const { logger } = require("../../config/winston");
const secret_config = require("../../config/secret");

const authService = require("./authService");
const authDao = require("./authDao");

const baseResponse = require("../../config/baseResponseStatus");
const { response } = require("../../config/response");
const { errResponse } = require("../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// GET 행위 진행
// 의미적 validation 처리

// snsEmail과 registerType 넘겼을 때 기존 유저인지 판단 
exports.snsEmailCheck = async function (selectUserParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  // 쿼리문에 여러개의 인자를 전달할 때 selectUserProviderParams와 같이 사용합니다.
  const userCheckResult = await authDao.selectUserRegisterType(
    connection,
    selectUserParams
  );
  connection.release();
  return userCheckResult[0];
};

// 로컬 email 체크 - 기존 로컬 유저인지 판단
exports.emailCheck = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userCheckResult = await authDao.selectUserEmail(
    connection,
    email
  );
  connection.release();
  return userCheckResult;
}

// 로컬 pwd 체크
exports.pwdCheck = async function (selectUserPasswordParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  // 쿼리문에 여러개의 인자를 전달할 때 selectUserPasswordParams와 같이 사용합니다.
  const passwordCheckResult = await authDao.selectUserPwd(
    connection,
    selectUserPasswordParams
  );
  connection.release();
  // console.log(passwordCheckResult);
  // console.log(passwordCheckResult[0]);
  return passwordCheckResult[0];
};

// 로컬 회원 상태 체크 
exports.accountCheck = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccountResult = await authDao.selectUserAccount(connection, email);
  connection.release();

  return userAccountResult;
};

exports.allAccountCheck = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccountResult = await authDao.selectUserStatus(connection, userIdx);
  connection.release();

  return userAccountResult;
}

exports.retriveUserEmail = async function (phone) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userEmailResult = await authDao.selectUserEmailByPhone(connection, phone);
  connection.release();
  if (userEmailResult.length < 1) {
    return errResponse(baseResponse.CHECK_EMAIL_EMPTY)
  }
  return response(baseResponse.SUCCESS, userEmailResult[0]);
}