const { logger } = require("../../config/winston");
const { pool } = require("../../config/database");
const secret_config = require("../../config/secret");

// user 뿐만 아니라 다른 도메인의 Provider와 Dao도 아래처럼 require하여 사용할 수 있습니다.
const binderProvider = require("./binderProvider");
const binderDao = require("./binderDao");

const baseResponse = require("../../config/baseResponseStatus");
const { response } = require("../../config/response");
const { errResponse } = require("../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");


exports.createBinder = async function (userIdx, isBasic, name, coverImgUrl) {
  const binderNameRows = await binderProvider.binderNameCheckCreate(userIdx, name);
  // console.log(binderNameRows)
  if (binderNameRows.length > 0) {
    return errResponse(baseResponse.BINDER_NAME_REDUNDANT);
  }


  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const insertParams = [userIdx, isBasic, name, coverImgUrl];
    const binderResult = await binderDao.insertBinder(connection, insertParams);

    const binderIdx = binderResult[0].insertId;

    return response(baseResponse.SUCCESS, { addedBinder: binderIdx });
  } catch (err) {
    console.log(`App - createBinder Service Error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
}

exports.createDib = async function (itemIdx, binderIdx) {
  const binderItemRows = await binderProvider.binderItemCheck(binderIdx, itemIdx);
  // console.log(binderNameRows)
  if (binderItemRows.length > 0) {
    return errResponse(baseResponse.BINDER_ITEM_REDUNDANT);
  }



  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const insertParams = [itemIdx, binderIdx];
    const dibResult = await binderDao.insertDib(connection, insertParams);

    const dibIdx = dibResult[0].insertId;
    return response(baseResponse.SUCCESS, { addedDib: dibIdx });
  } catch (err) {
    console.log(`App - createDib Service Error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }

}


exports.editDibsStatus = async function (binderIdx, itemIdxList) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    for (obj of itemIdxList) {
      const itemIdx = obj.itemIdx;
      console.log(binderIdx, itemIdx)
      // console.log(itemIdx)
      const dibStatusResult = await binderProvider.checkDibStatus(binderIdx, itemIdx);
      // console.log(dibStatusResult)
      if (dibStatusResult == 'DELETED') {
        return errResponse(baseResponse.DIB_STATUS_DELETED);
      }

      const updateParams = [binderIdx, itemIdx]
      const editDibsStatusResult = await binderDao.updatedDibStatus(connection, updateParams);
    }
    return response(baseResponse.SUCCESS);

  } catch (err) {
    console.log(`App - editDibStatus Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
}


exports.editDibsBinderIdx = async function (fromBinderIdx, toBinderIdx, itemIdxList) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    for (obj of itemIdxList) {
      const itemIdx = obj.itemIdx;
      const dibStatusResult = await binderProvider.checkDibStatus(fromBinderIdx, itemIdx);
      if (dibStatusResult == 'DELETED') {
        return errResponse(baseResponse.DIB_STATUS_DELETED);
      }

      const updateParams = [toBinderIdx, fromBinderIdx, itemIdx]
      const editDibsBinderIdxResult = await binderDao.updatedDibBinderIdx(connection, updateParams);
    }
    return response(baseResponse.SUCCESS);

  } catch (err) {
    console.log(`App - editDibBinderIdx Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
}

exports.editBinder = async function (binderIdx, coverImgUrl, name) {
  const binderNameRows = await binderProvider.binderNameCheck(binderIdx, name);
  if (binderNameRows.length > 0) {
    return errResponse(baseResponse.BINDER_NAME_REDUNDANT);
  }

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const updateParams = [coverImgUrl, name, binderIdx];
    const editBinderResult = await binderDao.updateBinder(connection, updateParams);

    return response(baseResponse.SUCCESS, editBinderResult[0]);

  } catch (err) {
    console.log(`App - editBinder Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
}


exports.editBinderStatus = async function (binderIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const binderStatusResult = await binderProvider.checkBinderStatus(binderIdx);
    if (binderStatusResult == 'DELETED') {
      return errResponse(baseResponse.BINDER_STATUS_DELETED);
    }

    const editBinderStatusResult = await binderDao.updateBinderStatus(connection, binderIdx);
    return response(baseResponse.SUCCESS);

  } catch (err) {
    console.log(`App - editBinderStatus Service error\n: ${err.message}`);

    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
}

exports.deleteDib = async function (userIdx, itemIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const binderIdxList = await binderDao.selectBinderIdx(connection, userIdx);
    // console.log(binderIdxList);
    for (binder of binderIdxList) {
      const deleteDibResult = await binderDao.deleteDib(connection, binder.binderIdx, itemIdx);
    }
    // const deleteDibResult = await binderDao.deleteDib(connection, userIdx, itemIdx);
    return response(baseResponse.SUCCESS);

  } catch (err) {
    console.log(`App - deleteDib Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
}

