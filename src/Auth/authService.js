const { logger } = require("../../config/winston");
const { pool } = require("../../config/database");
const secret_config = require("../../config/secret");

const authProvider = require("./authProvider");
const authDao = require("./authDao");
const binderDao = require("../Binder/binderDao");

const baseResponse = require("../../config/baseResponseStatus");
const { response } = require("../../config/response");
const { errResponse } = require("../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");


// POST PATCH DELETE 등의 행위 진행
// 의미적 validation 처리

// 소셜 User 회원가입(=생성)
exports.createUserSocial = async function (email, registerType) {
  try {
    // 이메일 중복 확인
    // authProvider에서 해당 이메일과 같은 User 목록을 받아서 emailRows에 저장한 후, 배열의 길이를 검사한다.
    // -> 길이가 0 이상이면 이미 해당 이메일을 갖고 있는 User가 조회된다는 의미
    const snsEmailRows = await authProvider.snsEmailCheck([email, registerType]);
    console.log(snsEmailRows);
    if (snsEmailRows.length > 0) {
      let token = await jwt.sign(
        {
          userIdx: snsEmailRows.userIdx,
        }, // 토큰의 내용(payload)
        secret_config.jwtsecret, // 비밀키
        {
          expiresIn: "365d",
          subject: "User",
        } // 유효 기간 365일
      );
      return response(baseResponse.SIGNUP_REDUNDANT_EMAIL, { 'userIdx': snsEmailRows[0].userIdx, 'jwt': token, 'nickname': snsEmailRows[0].nickName });
    }

    // 쿼리문에 사용할 변수 값을 배열 형태로 전달
    const insertUserParams = [email, registerType];

    const connection = await pool.getConnection(async (conn) => conn);

    const userResult = await authDao.insertUserSocial(connection, insertUserParams);
    // console.log(userResult);
    console.log(`추가된 회원 idx: ${userResult[0].insertId}`) // .userIdx 
    connection.release();

    let token = await jwt.sign(
      {
        userIdx: userResult[0].insertId,
      }, // 토큰의 내용(payload)
      secret_config.jwtsecret, // 비밀키
      {
        expiresIn: "365d",
        subject: "User",
      } // 유효 기간 365일
    );
    const insertBinderParams = [userResult[0].insertId, 0, "기본 바인더", null];
    const binderResult = await binderDao.insertBinder(connection, insertBinderParams);

    return response(baseResponse.SUCCESS, { 'userIdx': userResult[0].insertId, 'jwt': token });

  } catch (err) {
    logger.error(`App - createUser Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};

// 로컬 User 회원가입(=생성)
exports.createUserLocal = async function (phoneNumber, email, pwd, nickName) {
  try {
    const hashedPassword = await crypto
      .createHash("sha512")
      .update(pwd)
      .digest("hex");

    // 쿼리문에 사용할 변수 값을 배열 형태로 전달
    const insertUserParams = [phoneNumber, email, hashedPassword, nickName, "LOCAL"];

    const connection = await pool.getConnection(async (conn) => conn);

    const userResult = await authDao.insertUserLocal(connection, insertUserParams);
    console.log(userResult);
    console.log(`추가된 회원 idx: ${userResult[0].insertId}`) // .userIdx 
    connection.release();

    let token = await jwt.sign(
      {
        userIdx: userResult[0].insertId,
      }, // 토큰의 내용(payload)
      secret_config.jwtsecret, // 비밀키
      {
        expiresIn: "365d",
        subject: "User",
      } // 유효 기간 365일
    );
    const insertBinderParams = [userResult[0].insertId, 0, "기본 바인더", null];
    const binderResult = await binderDao.insertBinder(connection, insertBinderParams);

    return response(baseResponse.SUCCESS, { 'userIdx': userResult[0].insertId, 'jwt': token });

  } catch (err) {
    logger.error(`App - createUser Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};


// 로컬 로그인
exports.postSignIn = async function (email, pwd) {
  try {
    // 이메일 여부 확인
    const emailRows = await authProvider.emailCheck(email);
    if (emailRows.length < 1) return errResponse(baseResponse.SIGNIN_EMAIL_WRONG);
    // console.log(emailRows, "emailRows!!")
    const selectEmail = emailRows[0].email;

    // 비밀번호 확인 (입력한 비밀번호를 암호화한 것과 DB에 저장된 비밀번호가 일치하는 지 확인함)
    const hashedPassword = await crypto
      .createHash("sha512")
      .update(pwd)
      .digest("hex");

    // console.log(hashedPassword);
    const selectUserPasswordParams = [selectEmail, hashedPassword];
    const passwordRows = await authProvider.pwdCheck(selectUserPasswordParams);
    // console.log(passwordRows, "pwdRows!!");

    // 올바르지 않게 입력 했을 때..
    if (passwordRows.length < 1 || passwordRows[0].pwd !== hashedPassword) {
      return errResponse(baseResponse.SIGNIN_PASSWORD_WRONG);
    }

    // 계정 상태 확인
    const userInfoRows = await authProvider.accountCheck(email);

    if (userInfoRows[0].status === "INACTIVE") {
      return errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT);
    } else if (userInfoRows[0].status === "DELETED") {
      return errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT);
    }

    console.log(userInfoRows[0].userIdx) // DB의 userIdx

    //토큰 생성 Service
    let token = await jwt.sign(
      {
        userIdx: userInfoRows[0].userIdx,
      }, // 토큰의 내용(payload)
      secret_config.jwtsecret, // 비밀키
      {
        expiresIn: "365d",
        subject: "User",
      } // 유효 기간 365일
    );

    return response(baseResponse.SUCCESS, { 'userIdx': userInfoRows[0].userIdx, 'jwt': token });

  } catch (err) {
    logger.error(`App - postSignIn Service error\n: ${err.message} \n${JSON.stringify(err)}`);
    return errResponse(baseResponse.DB_ERROR);
  }
};
