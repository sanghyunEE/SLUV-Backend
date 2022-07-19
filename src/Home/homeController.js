const jwtMiddleware = require("../../config/jwtMiddleware");
const homeProvider = require("./homeProvider");
const homeService = require("./homeService");
const baseResponse = require("../../config/baseResponseStatus");
const { response, errResponse } = require("../../config/response");
const regexEmail = require("regex-email");
const { emit } = require("nodemon");
require('dotenv').config()
const crypto = require("crypto");


// 6.1 이벤트 배너 조회
exports.getEvents = async function (req, res) {

  const eventListResult = await homeProvider.retrieveEventLists();
  if (eventListResult.length < 1) {
    return res.send(errResponse(baseResponse.EVENT_LIST_EMPTY));
  }

  return res.send(response(baseResponse.SUCCESS, eventListResult));
}


// 6.2 해당 유저 관심 셀럽(멤버) 아이템 조회
exports.getItems = async function (req, res) {
  const userIdxFromJWT = req.verifiedToken.userIdx;
  const { celebIdx, memberIdx, order, page, pageSize } = req.query;
  // console.log(userIdxFromJWT, celebIdx, memberIdx, order, page, pageSize);


  const itemListResult = await homeProvider.retrieveItemLists(userIdxFromJWT, req.query);
  if (itemListResult == 'range out') {
    return res.send(errResponse(baseResponse.CUR_PAGE_RANGE_OUT));
  }
  else if (itemListResult.code == 4000) {
    return res.send(itemListResult);
  }

  return res.send(response(baseResponse.SUCCESS, itemListResult));
}

// 6.3 인기 스러버 추천
exports.getHotUsers = async function (req, res) {
  const userIdxFromJWT = req.verifiedToken.userIdx;
  const { celebIdx } = req.query;

  const hotUserListResult = await homeProvider.retrieveHotUserLists(userIdxFromJWT, celebIdx);

  return res.send(response(baseResponse.SUCCESS, hotUserListResult));

}

// 6.4 인기 아이템 조회
exports.getHotItems = async function (req, res) {
  const userIdxFromJWT = req.verifiedToken.userIdx;
  const { period } = req.query;
  if (!period) {
    res.send(errResponse(baseResponse.API_QUERYSTRING_EMPTY));
  }

  const hotItemListResult = await homeProvider.retrieveHotItemLists(period, userIdxFromJWT);
  return res.send(response(baseResponse.SUCCESS, hotItemListResult));
}

// 6.5 인기 키워드 조회
exports.getHotKeywords = async function (req, res) {
  const hotKeywordListResult = await homeProvider.retrieveHotKeywordLists();
  return res.send(response(baseResponse.SUCCESS, hotKeywordListResult));
}

// 6.6 같은 셀럽을 좋아하는 스러버 조회
exports.getSimUsers = async function (req, res) {
  const userIdxFromJWT = req.verifiedToken.userIdx;
  const simUserListResult = await homeProvider.retrieveSimUserLists(userIdxFromJWT);
  return res.send(response(baseResponse.SUCCESS, simUserListResult));
}


// 6.7 팔로워 중인 유저가 작성한 아이템 조회
exports.getFollowerItems = async function (req, res) {
  const userIdxFromJWT = req.verifiedToken.userIdx;
  const page = parseInt(req.query.page);
  const pageSize = parseInt(req.query.pageSize);

  const followerItemListResult = await homeProvider.retrieveFollowerItemLists(
    userIdxFromJWT,
    page,
    pageSize
  )
  return res.send(followerItemListResult);
}