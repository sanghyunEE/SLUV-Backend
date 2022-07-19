const baseResponse = require("../../config/baseResponseStatus");
const { pool } = require("../../config/database");
const { response, errResponse } = require("../../config/response");
const { logger } = require("../../config/winston");

const homeDao = require("./homeDao");

// 이벤트 리스트 가져오기
exports.retrieveEventLists = async function () {
  const connection = await pool.getConnection(async (conn) => conn);
  const eventListResult = await homeDao.selectEvents(connection);

  // if (eventListResult.length < 1) {
  //   return errResponse(baseResponse.EVENT_LIST_EMPTY);
  // }

  connection.release();
  return eventListResult;
}


// 아이템 리스트 가져오기
exports.retrieveItemLists = async function (userIdx, query) {
  const { celebIdx, memberIdx, order } = query;
  const page = parseInt(query.page);
  const pageSize = parseInt(query.pageSize);

  const connection = await pool.getConnection(async (conn) => conn);

  try {
    let start = 0;
    if (page <= 0) {
      page = 1;
    } else { // offset
      start = (page - 1) * pageSize
    }
    let itemListResult = [];

    // 특정 셀럽의 아이템 리스트를 가져오고 싶을 때
    // ex) /homes/items?celebIdx=&order=&page=&pageSize=
    if (!memberIdx) {
      console.log("특정 셀럽의 아이템 가져오기 API")
      const itemCount = await homeDao.selectCelebItemsCount(connection, celebIdx);
      // console.log(itemCount[0].count, typeof (itemCount[0].count));
      if (page > Math.ceil(itemCount[0].count / pageSize)) {
        console.log('특정 셀럽 page 범위 아웃!');
        return 'range out';
      }
      const seletParams = [userIdx, celebIdx, start, pageSize];
      if (order == 'latest') { // 최신순 일 떄
        itemListResult = await homeDao.selectCelebItemsLatest(connection, seletParams);
      } else if (order == 'hot') { // 인기순 일 때
        itemListResult = await homeDao.selectCelebItemsHot(connection, seletParams);
      }


    }

    // 특정 멤버의 아이템 리스트를 가져오고 싶을 때
    // ex) /homes/items?memberIdx=&order=&page=&pageSize=
    else if (!celebIdx) {
      console.log("특정 멤버의 아이템 가져오기 API")
      const itemCount = await homeDao.selectMemberItemsCount(connection, memberIdx);
      // console.log(itemCount[0].count, typeof (itemCount[0].count));
      if (page > Math.ceil(itemCount[0].count / pageSize)) {
        console.log('특정 멤버 page 범위 아웃!');
        return 'range out';
      }
      const seletParams = [userIdx, memberIdx, start, pageSize];
      if (order == 'latest') { // 최신순 일 떄
        itemListResult = await homeDao.selectMemberItemsLatest(connection, seletParams);
      } else if (order == 'hot') { // 인기순 일 때
        itemListResult = await homeDao.selectMemberItemsHot(connection, seletParams);
      }
    }
    return itemListResult;

  } catch (err) {
    console.log(`App - retrieveItemLists Provider error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }


}


// 인기 스러버 가져오기
exports.retrieveHotUserLists = async function (userIdx, celebIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  let hotUserListResult = [];
  if (!celebIdx) { // 전체 셀럽
    console.log('전체 셀럽에서 인기스러버 GET');
    const selcetParams = [userIdx]
    hotUserListResult = await homeDao.selectHotUsers(connection, userIdx);
  } else { // 특정 (관심) 셀럽
    console.log('특정 셀럽에서 인기스러버 GET');
    const selcetParams = [userIdx, celebIdx, userIdx]
    hotUserListResult = await homeDao.selectHotUsersCelebIdx(connection, selcetParams);
  }
  connection.release();
  return hotUserListResult;

}

// 인기 아이템 가져오기
exports.retrieveHotItemLists = async function (period, userIdx) {
  console.log("인기 아이템 가져오기 호출");
  const connection = await pool.getConnection(async (conn) => conn);
  let hotItemListResult = [];
  if (period == 'daily') {
    hotItemListResult = await homeDao.selectHotItemsDaily(connection, period, userIdx);
  } else {
    hotItemListResult = await homeDao.selectHotItemsWeekly(connection, period, userIdx);
  }
  connection.release();
  return hotItemListResult;
}

// 인기 키워드 가져오기
exports.retrieveHotKeywordLists = async function () {
  console.log("인기 키워드 가져오기 호출");
  const connection = await pool.getConnection(async (conn) => conn);
  const hotKeywordListResult = await homeDao.selectHowKeywords(connection);

  connection.release();
  return hotKeywordListResult;
}

// 같은 셀럽 좋아하는 스러버의 정보 및 아이템 리스트 가져오기
exports.retrieveSimUserLists = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const simUserListResult = await homeDao.selectSimUsers(connection, [userIdx, userIdx, userIdx]);

  for (user of simUserListResult) {
    const simUserIdx = user.userIdx;
    const itemResult = await homeDao.selectSimUserItems(connection, simUserIdx);
    user.itemList = itemResult;
  }



  connection.release();
  return simUserListResult;

}



exports.retrieveFollowerItemLists = async function (userIdx, page, pageSize) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    let start = 0;
    if (page <= 0) {
      page = 1;
    } else { // offset
      start = (page - 1) * pageSize
    }

    const itemCount = await homeDao.selectFollowerItemsCount(connection, [userIdx, userIdx]);
    console.log(itemCount[0].count, typeof (itemCount[0].count));
    if (page > Math.ceil(itemCount[0].count / pageSize)) {
      console.log('page 범위 아웃!');
      return errResponse(baseResponse.CUR_PAGE_RANGE_OUT);
    }
    const seletParams = [userIdx, userIdx, start, pageSize];
    const itemListResult = await homeDao.selectFollowerItems(connection, seletParams);

    return response(baseResponse.SUCCESS, itemListResult);

  } catch (err) {
    console.log(`App - retrieveFollowerItemLists Provider error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
}