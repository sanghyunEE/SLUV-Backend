const { pool } = require("../../config/database");
const { logger } = require("../../config/winston");
const secret_config = require("../../config/secret");

const alarmService = require("./alarmService");
const alarmDao = require("./alarmDao");

const baseResponse = require("../../config/baseResponseStatus");
const { response } = require("../../config/response");
const { errResponse } = require("../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// GET 행위 진행
// 의미적 validation 처리

exports.retrieveAlarms = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const alarmListResult = await alarmDao.selectAlarms(connection, userIdx);
  connection.release();
  return alarmListResult;
}
