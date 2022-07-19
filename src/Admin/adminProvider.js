const { pool } = require("../../config/database");
const { logger } = require("../../config/winston");
const secret_config = require("../../config/secret");

const adminService = require("./adminService");
const adminDao = require("./adminDao");

const baseResponse = require("../../config/baseResponseStatus");
const { response } = require("../../config/response");
const { errResponse } = require("../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// GET 행위 진행
// 의미적 validation 처리


exports.idCheck = async function (id) {
  const connection = await pool.getConnection(async (conn) => conn);
  const adminCheckResult = await adminDao.selectUserId(
    connection,
    id
  );
  connection.release();
  return adminCheckResult;
}

exports.pwdCheck = async function (selectParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const passwordCheckResult = await adminDao.selectAdminPwd(
    connection,
    selectParams
  );
  connection.release();
  return passwordCheckResult;
}


exports.retrieveNoticeList = async function () {
  const connection = await pool.getConnection(async (conn) => conn);
  const noticeListResult = await adminDao.selectNotices(connection);
  connection.release();
  return noticeListResult;
}



