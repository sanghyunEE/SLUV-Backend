const jwtMiddleware = require("../../config/jwtMiddleware");
const adminProvider = require("./adminProvider");
const adminService = require("./adminService");
const baseResponse = require("../../config/baseResponseStatus");
const { response, errResponse } = require("../../config/response");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const secret_config = require("../../config/secret");


// req.params req.query req.body 의 데이터들을 가져오는 곳
// 형식적 validation 처리

// A1 관리자 로그인
exports.adminLogin = async function (req, res) {
  const { id, pwd } = req.body;
  if (!id || !pwd) {
    return res.send(errResponse(baseResponse.API_PARAMETER_EMPTY));
  }

  const loginResponse = await adminService.postLogin(id, pwd);

  return res.send(loginResponse);
}

// A2 관리자가 공지사항 목록 조회
exports.getNotices = async function (req, res) {
  const adminIdx = req.verifiedToken.adminIdx;

  const noticeListResult = await adminProvider.retrieveNoticeList();
  return res.send(response(baseResponse.SUCCESS, noticeListResult));
}

// A3 관리자가 특정 공지사항 추가
exports.postNotice = async function (req, res) {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.send(errResponse(baseResponse.API_PARAMETER_EMPTY));
  }

  const postNoticeResponse = await adminService.createNotice(title, content);
  return res.send(postNoticeResponse);
}

// A4 관리자가 특정 공지사항 삭제
exports.deleteNotice = async function (req, res) {
  const noticeIdx = req.params.noticeIdx;
  if (!noticeIdx) {
    return res.send(errResponse(baseResponse.NOTICE_IDX_EMPTY));
  }

  const deleteNoticeResponse = await adminService.deleteNotice(noticeIdx);
  return res.send(deleteNoticeResponse);
}

