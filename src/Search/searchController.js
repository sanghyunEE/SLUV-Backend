const jwtMiddleware = require("../../config/jwtMiddleware");
const searchProvider = require("./searchProvider");
const searchService = require("./searchService");
const baseResponse = require("../../config/baseResponseStatus");
const { response, errResponse } = require("../../config/response");
const { API_QUERYSTRING_EMPTY } = require("../../config/baseResponseStatus");
require('dotenv').config()


// 9.3 핫 랭킹 검색어 (일간)
exports.getDailyWord = async function (req, res) {
  const wordListResult = await searchProvider.retrieveDailyWord();

  return res.send(response(baseResponse.SUCCESS, wordListResult))
}

// 9.4 인기 검색어 (월간)
exports.getMonthlyWord = async function (req, res) {
  const wordListResult = await searchProvider.retrieveMonthlyWord();

  return res.send(response(baseResponse.SUCCESS, wordListResult))
}

// 9.5 유저의 최근 검색어 조회
exports.getRecent = async function (req, res) {
  const userIdx = req.verifiedToken.userIdx;

  const wordListResult = await searchProvider.retrieveRecentWord(userIdx);

  return res.send(response(baseResponse.SUCCESS, wordListResult))
}

// 9.6 검색창 검색 결과 조회
exports.getSearchItems = async function (req, res) {
  const userIdx = req.verifiedToken.userIdx;
  const searchWord = req.query.search_word;
  const page = parseInt(req.query.page);
  const pageSize = parseInt(req.query.pageSize);

  if (!searchWord) {
    return res.send(errResponse(baseResponse.SEARCH_WORD_EMPTY));
  }
  // console.log(searchWord, typeof (searchWord));

  const createSearchReponse = await searchService.createSearchWord(userIdx, searchWord);

  const itemListResult = await searchProvider.retrieveSearchItems(userIdx, searchWord, page, pageSize);

  return res.send(itemListResult)
}

// 9.7 필터링 검색 결과 조회
exports.getSearchItemsOnFilter = async function (req, res) {
  const userIdx = req.verifiedToken.userIdx;
  const searchWord = req.query.search_word;
  const page = parseInt(req.query.page);
  const pageSize = parseInt(req.query.pageSize);

  const { parent, sub, price, order } = req.query;
  console.log(req.query);
  if (!searchWord) {
    return res.send(errResponse(baseResponse.SEARCH_WORD_EMPTY));
  }
  const itemListResult = await searchProvider.retrieveSearchItemsOnFilter(userIdx, searchWord, page, pageSize, parent, sub, price, order);

  return res.send(itemListResult)

}



// 9.8 특정 최근 검색어 지우기
exports.deleteRecendWord = async function (req, res) {
  // const userIdx = req.verifiedToken.userIdx;
  const recentSearchIdx = req.params.recentSearchIdx;
  if (!recentSearchIdx) {
    return res.send(errResponse(baseResponse.SEARCH_IDX_EMPTY));
  }

  const deleteRecentResponse = await searchService.deleteRecentWord(recentSearchIdx);
  return res.send(deleteRecentResponse);
}

// 9.9 최근 검색어 모두 지우기
exports.deleteAllRecendWord = async function (req, res) {
  const userIdx = req.verifiedToken.userIdx;

  const deleteAllRecentResponse = await searchService.deleteAllRecentWord(userIdx);
  return res.send(deleteAllRecentResponse);
}