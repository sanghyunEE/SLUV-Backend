const jwtMiddleware = require("../../config/jwtMiddleware");
const userProvider = require("./userProvider");
const userService = require("./userService");
const baseResponse = require("../../config/baseResponseStatus");
const { response, errResponse } = require("../../config/response");
const regexEmail = require("regex-email");
const { emit } = require("nodemon");
require('dotenv').config()
const crypto = require("crypto");

// req.headers req.params req.query req.body 의 데이터들을 가져오는 곳
// 형식적 validation 처리 - 빈값, 길이, 닉네임 형식 


// 2.1 유저 닉네임 변경
exports.patchUsers = async function (req, res) {

  // jwt - userIdx, path variable - :userIdx

  const userIdxFromJWT = req.verifiedToken.userIdx

  const userIdx = req.params.userIdx;
  const nickName = req.body.nickName;
  // console.log(userIdxFromJWT, userIdx, nickName, "- 잘 나오는지 ")

  if (userIdxFromJWT != userIdx) {
    console.log(userIdxFromJWT, typeof (userIdxFromJWT));
    console.log(userIdx, typeof (userIdx));
    res.send(errResponse(baseResponse.USER_IDX_NOT_MATCH));
  } else {
    if (!nickName) return res.send(errResponse(baseResponse.USER_NICKNAME_EMPTY));

    const editUser = await userService.editNickName(userIdx, nickName)
    return res.send(editUser);
  }
};

// 2.2
exports.checkPhoneNum = async function (req, res) {
  const phone = req.query.phone;
  if (!phone) return res.send(errResponse(baseResponse.SIGNUP_PHONENUMBER_EMPTY));


  const checkPhone = await userProvider.readPhoneNum(phone);
  if (checkPhone.length > 0) {
    return res.send(response(baseResponse.SIGNUP_REDUNDANT_PHONENUMBER, checkPhone[0]));
  }
  return res.send(baseResponse.SUCCESS);

}

// 2.3
exports.checkEmail = async function (req, res) {
  const email = req.query.email;
  console.log(email);
  if (!email) return res.send(errResponse(baseResponse.USER_USEREMAIL_EMPTY));

  const checkEmail = await userProvider.readEmail(email);
  if (checkEmail.length > 0) {
    return res.send(response(baseResponse.SIGNUP_REDUNDANT_EMAIL, checkEmail[0]));
  }
  return res.send(baseResponse.SUCCESS);
}

// 2.4
exports.checkNickName = async function (req, res) {
  const nickName = req.query.nickname;
  if (!nickName) return res.send(errResponse(baseResponse.USER_NICKNAME_EMPTY));

  const checkNickName = await userProvider.readNickName(nickName);
  if (checkNickName.length > 0) {
    return res.send(response(baseResponse.SIGNUP_REDUNDANT_NICKNAME, checkNickName[0]));
  }
  return res.send(baseResponse.SUCCESS);
}

// 2.5 유저 패스워드 변경 및 재설정
exports.patchPwd = async function (req, res) {
  const userIdxFromJWT = req.verifiedToken.userIdx;
  const emailFromJWT = req.verifiedToken.email;
  const purpose = req.body.purpose;
  const pwd = req.body.pwd;

  // console.log(purpose, pwd);
  if (!pwd || !toString(purpose)) return res.send(errResponse(baseResponse.API_PARAMETER_EMPTY));


  if (purpose === 0) { // 비밀번호 변경일 때
    const pwdRows = await userProvider.retriveUserPwd(userIdxFromJWT);

    const hashedPassword = await crypto
      .createHash("sha512")
      .update(pwd)
      .digest("hex");

    console.log("해당 유저의 원래 비밀번호 : ", pwdRows.pwd);
    console.log("해당 유저의 변경할 비밀번호 : ", hashedPassword);
    if (pwdRows.pwd === hashedPassword) { // 변경할 비밀번호가 현재 비밀번호와 같을 때
      return res.send(errResponse(baseResponse.USER_REDUNDANT_PASSWORD));
    }
    const editUser = await userService.editPwd(userIdxFromJWT, pwd);
    return res.send(editUser);

  } else { // 비밀번호 재설정일 때
    const editUser = await userService.editPwd(userIdxFromJWT, pwd);
    return res.send(editUser);

  }
}

// 8.6 유저 신고하기
exports.reportUser = async function (req, res) {
  const reporterIdx = req.verifiedToken.userIdx; // 신고 하는 유저
  const userIdx = req.params.userIdx; // 신고 당하는 유저
  if (!userIdx) {
    return res.send(errResponse(baseResponse.USER_IDX_EMPTY));
  }
  const { category, content } = req.body;
  if (!category) {
    return res.send(errResponse(baseResponse.API_PARAMETER_EMPTY));
  }

  const reportUserResponse = await userService.reportUser(reporterIdx, userIdx, category, content);
  return res.send(reportUserResponse);
}


// 9.1 팔로우 하기
exports.followUser = async function (req, res) {
  const fromUserIdx = req.verifiedToken.userIdx;
  const toUserIdx = req.params.toUserIdx;
  if (!toUserIdx) {
    return res.send(errResponse(baseResponse.USER_IDX_EMPTY));
  }
  const followerCheck = await userProvider.followerCheck(fromUserIdx, toUserIdx);
  if (followerCheck.length > 0) {
    return res.send(errResponse(baseResponse.FOLLOW_REDUNDANT_ERROR));
  }
  const followUserResponse = await userService.followUser(fromUserIdx, toUserIdx);
  return res.send(followUserResponse);

}

// 9.2 언팔로우 하기
exports.unfollowUser = async function (req, res) {
  const fromUserIdx = req.verifiedToken.userIdx;
  const toUserIdx = req.params.toUserIdx;
  if (!toUserIdx) {
    return res.send(errResponse(baseResponse.USER_IDX_EMPTY));
  }

  const unfollowUserResponse = await userService.unfollowUser(fromUserIdx, toUserIdx);
  return res.send(unfollowUserResponse);

}