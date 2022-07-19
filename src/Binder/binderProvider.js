const baseResponse = require("../../config/baseResponseStatus");
const { pool } = require("../../config/database");
const { response, errResponse } = require("../../config/response");
const { logger } = require("../../config/winston");

const binderDao = require("./binderDao");

exports.binderNameCheckCreate = async function (userIdx, name) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectParams = [userIdx, name]
  const nameCheckResult = await binderDao.selectBinderNameCreate(connection, selectParams);
  connection.release();

  return nameCheckResult;
}


exports.binderNameCheck = async function (binderIdx, name) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectParams = [binderIdx, name]
  const nameCheckResult = await binderDao.selectBinderName(connection, selectParams);
  connection.release();

  return nameCheckResult;
}

exports.binderItemCheck = async function (binderIdx, itemIdx) {
  const connection = await pool.getConnection(async (conn) => conn);

  const selectParams = [binderIdx, itemIdx];
  const itemCheckResult = await binderDao.selectDibItem(connection, selectParams);
  connection.release();

  return itemCheckResult;
}

exports.retrieveBinderList = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const binderListResult = await binderDao.selectBinders(connection, userIdx);

  // console.log(binderListResult)
  for (binder of binderListResult) {
    const binderIdx = binder.binderIdx;
    const dibItemResult = await binderDao.selectDibs(connection, binderIdx);
    console.log(dibItemResult.length)
    binder.dibCount = dibItemResult.length;
  }

  connection.release();
  return binderListResult;
}

exports.retrieveDibList = async function (binderIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const dibListResult = await binderDao.selectDibs(connection, binderIdx);

  connection.release();
  return dibListResult;
}

exports.checkDibStatus = async function (binderIdx, itemIdx) {
  console.log("checkDibStatus 함수 프로바이더 실행");
  const connection = await pool.getConnection(async (conn) => conn);
  const selectParams = [binderIdx, itemIdx];
  const dibStatusResult = await binderDao.selectDibStatus(connection, selectParams);
  // console.log(selectParams, dibStatusResult)
  connection.release();
  return dibStatusResult[0].status;
}

exports.checkBinderStatus = async function (binderIdx) {
  console.log("checkBinderStatus 함수 프로바이더 실행");
  const connection = await pool.getConnection(async (conn) => conn);
  const binderStatusResult = await binderDao.selectBinderStatus(connection, binderIdx);
  connection.release();
  return binderStatusResult[0].status;
}