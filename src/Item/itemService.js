const { logger } = require("../../config/winston");
const { pool } = require("../../config/database");
const secret_config = require("../../config/secret");

const itemProvider = require("./itemProvider");
const itemDao = require("./itemDao");

const baseResponse = require("../../config/baseResponseStatus");
const { response } = require("../../config/response");
const { errResponse } = require("../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");


exports.createItem = async function (userIdx, celebIdx, memberIdx, parentCategory, subCategory, brandIdx, name, whenDiscovery, whereDiscovery, price, content, sellerSite) {
  try {
    const insertParams = [
      userIdx,
      celebIdx,
      memberIdx,
      parentCategory,
      subCategory,
      brandIdx,
      name,
      whenDiscovery,
      whereDiscovery,
      price,
      content,
      sellerSite
    ];

    const connection = await pool.getConnection(async (conn) => conn);
    const insertItemInfoResult = await itemDao.insertItemInfo(connection, insertParams);
    connection.release();

    return response(baseResponse.SUCCESS, { 'itemIdx': insertItemInfoResult[0].insertId });

  } catch (err) {
    logger.error(`App - createItem Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }

}


exports.createItemImgs = async function (itemIdx, itemImgUrlList) {
  let insertParamsList = []
  for (itemUrl of itemImgUrlList) {
    let temp_list = [];
    temp_list.push(itemIdx);
    temp_list.push(itemUrl.isRepresent);
    temp_list.push(itemUrl.itemImgUrl);
    insertParamsList.push(temp_list);
  }

  console.log(insertParamsList);

  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const insertItemImgsResult = await itemDao.insertItemImgs(connection, insertParamsList);
    connection.release();

    return response(baseResponse.SUCCESS);


  } catch (err) {
    logger.error(`App - createItemImgs Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }

}


exports.createItemLike = async function (userIdx, itemIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const itemLikeResult = await itemDao.insertItemLike(connection, userIdx, itemIdx);
    return response(baseResponse.SUCCESS);

  } catch (err) {
    logger.error(`App - createItemLike Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }

}


exports.deleteItemLike = async function (userIdx, itemIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const unLikeResult = await itemDao.deleteItemLike(connection, userIdx, itemIdx);
    return response(baseResponse.SUCCESS);

  } catch (err) {
    logger.error(`App - deleteItemLike Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
}


exports.editItem = async function (itemIdx, parentCategory, subCategory, brandIdx, name, whenDiscovery, whereDiscovery, price, content, sellerSite, itemImgUrlList) {
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    await connection.beginTransaction();

    const patchParams = [parentCategory, subCategory, brandIdx, name, whenDiscovery, whereDiscovery, price, content, sellerSite];
    const itemResult = await itemDao.patchItem(connection, itemIdx, patchParams);
    console.log(itemResult);

    const deleteResult = await itemDao.deleteItemImg(connection, itemIdx);




    await connection.commit();
    return response(baseResponse.SUCCESS)
  } catch (err) {
    logger.error(`App - editItem Service error\n: ${err.message}`);
    await connection.rollback();
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }


}

exports.deleteItem = async function (itemIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {

    const deleteItemResult = await itemDao.deleteItem(connection, itemIdx);

    return response(baseResponse.SUCCESS);
  } catch (err) {
    console.log(`App - deleteItem Service error\n: ${err.message}`);

    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
}

exports.reportItem = async function (reporterIdx, itemIdx, category, content) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const insertPrams = [reporterIdx, itemIdx, category, content]
    const reportResult = await itemDao.insertReportItem(connection, insertPrams);
    return response(baseResponse.SUCCESS);
  } catch (err) {
    logger.error(`App - reportItem Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
}


exports.requestItemEdit = async function (requesterIdx, itemIdx, category, content) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const insertPrams = [requesterIdx, itemIdx, category, content]
    const requestResult = await itemDao.insertItemEditReq(connection, insertPrams);
    return response(baseResponse.SUCCESS);
  } catch (err) {
    logger.error(`App - requestItemEdit Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
}


exports.createRecentItem = async function (userIdx, itemIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const checkRecentItem = await itemDao.checkRecentItem(connection, userIdx, itemIdx);
    // console.log(checkRecentItem);
    if (checkRecentItem.length > 0) {
      const recentIdx = checkRecentItem[0].recentIdx
      const deleteRecentItemResult = await itemDao.deleteRecentItem(connection, recentIdx)
    }
    const createRecentItemResult = await itemDao.insertRecentItem(connection, [userIdx, itemIdx]);


    return response(baseResponse.SUCCESS);
  } catch (err) {
    logger.error(`App - createRecentItem Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
}