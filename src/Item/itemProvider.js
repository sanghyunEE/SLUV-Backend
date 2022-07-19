const baseResponse = require("../../config/baseResponseStatus");
const { pool } = require("../../config/database");
const { response, errResponse } = require("../../config/response");
const { logger } = require("../../config/winston");
const itemDao = require("./itemDao");

exports.retrieveBrandList = async function () {
  const connection = await pool.getConnection(async (conn) => conn);
  const brandListResult = await itemDao.selectBrandInfo(connection);
  connection.release();

  return brandListResult[0]
}

exports.retrieveItemInfo = async function (userIdx, itemIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const itemInfoResult = await itemDao.selectItemInfo(connection, userIdx, itemIdx);
  const itemImgResult = await itemDao.selectItemImgs(connection, itemIdx);
  itemInfoResult[0].itemImgList = itemImgResult;

  connection.release();

  return itemInfoResult[0]
}


exports.retrieveSameCelebItems = async function (userIdx, itemIdx, celebIdx, memberIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  console.log(userIdx, celebIdx);
  if (memberIdx == null) { // 솔로 셀럽이라면
    console.log("해당 솔로셀럽의 다른 아이템");
    const sameCelebItemList = await itemDao.selectSameCelebItems(connection, userIdx, celebIdx, itemIdx);
    connection.release();
    return sameCelebItemList;
  } else { // 그룹에 포함된 멤버라면
    console.log("해당 멤버의 다른 아이템");
    const sameMemberItemList = await itemDao.selectSameMemberItems(connection, userIdx, memberIdx, itemIdx);
    connection.release();
    return sameMemberItemList;
  }
}

exports.retrieveOtherUserDibItems = async function (userIdx, itemIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const otherUserDibItemList = await itemDao.selectOhterUserDibItems(connection, userIdx, itemIdx);
  // const otherUserResult = await itemDao.selectOtherUser(connection, itemIdx);
  // let resultList = [];
  // for (user of otherUserResult) {
  //     const otherUserIdx = user.userIdx;
  //     const otherUserDibItems = await itemDao.selectOtherUserDibItems(connection, userIdx, otherUserIdx)
  //     resultList.push(...otherUserDibItems);
  // }
  connection.release();
  return otherUserDibItemList;

}

exports.retrieveSameBrandItems = async function (userIdx, itemIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const sameBrandItemResult = await itemDao.selectSameBrandItems(connection, userIdx, itemIdx);
  connection.release();
  return sameBrandItemResult;
}