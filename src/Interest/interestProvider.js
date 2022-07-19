const baseResponse = require("../../config/baseResponseStatus");
const { pool } = require("../../config/database");
const { response, errResponse } = require("../../config/response");
const { logger } = require("../../config/winston");

const interestDao = require("./interestDao");

// Provider: Read 비즈니스 로직 처리
// GET 행위 진행
// 의미적 validation 처리 - table에 닉네임 중복이 있는지, 비활성화 된 user 인지

// 셀럽 및 멤버 전체 목록 가져오기
exports.retrieveCelebMemberList = async function () {
  const connection = await pool.getConnection(async (conn) => conn);
  const celebMemberListResult = await interestDao.selectCelebsMembers(connection);
  connection.release();

  return celebMemberListResult
}


// 셀럽 목록 가져오기
exports.retrieveCelebList = async function () {
  const connection = await pool.getConnection(async (conn) => conn);
  const celebListResult = await interestDao.selectCelebs(connection);
  connection.release();

  return celebListResult
}

// 멤버 목록 가져오기
exports.retrieveMemberList = async function (celebIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const memberListResult = await interestDao.selectMembers(connection, celebIdx);
  connection.release();

  return memberListResult[0]
}

// 관심 셀럽 식별자 가져오기
exports.retrieveInterestCelebIdx = async function (userIdx, celebIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  // console.log(userIdx, celebIdx);
  const selectParams = [userIdx, celebIdx];
  const interestCelebIdxResult = await interestDao.selectInterestCelebIdx(connection, selectParams);

  connection.release();

  console.log(interestCelebIdxResult[0]);

  return interestCelebIdxResult[0]
}

// 관심 셀럽 테이블에서 userIdx로 셀럽 idx 리스트 가져오기
exports.retrieveCelebIdxList = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const celebIdxResult = await interestDao.selectCelebIdx(connection, userIdx);
  connection.release();
  // console.log(celebIdxResult[0]);

  return celebIdxResult[0]
}

exports.retrieveCelebInfo = async function (celebIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const celebInfoResult = await interestDao.selectCeleb(connection, celebIdx);
  connection.release();

  // console.log(celebInfoResult[0]);
  return celebInfoResult[0]
}

exports.retrieveTopChoiceCelebInfoList = async function () {
  const connection = await pool.getConnection(async (conn) => conn);
  const topChoiceCelebInfoResult = await interestDao.selectInterestCelebTopChoice(connection);
  connection.release();

  return topChoiceCelebInfoResult[0]
}

exports.retrieveInterestList = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const [interestCelebListResult] = await interestDao.selectCelebIdx(connection, userIdx);
  // console.log(interestCelebListResult)

  let interestListResult = []
  for (interestCeleb of interestCelebListResult) {
    const interestCelebIdx = interestCeleb.interestCelebIdx;
    const interestMemberListResult = await interestDao.selectInterestMembers(connection, interestCelebIdx);
    // console.log(interestMemberListResult)
    const celeb_obj = {
      celebIdx: interestCeleb.celebIdx,
      name: interestCeleb.name,
      celebImgUrl: interestCeleb.celebImgUrl
    }

    const member_obj = {
      memberList: interestMemberListResult
    }

    interestListResult.push({
      ...celeb_obj,
      ...member_obj
    })
  }
  connection.release();

  return interestListResult;
}


exports.retrieveInterestCelebIdxs = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);

  const interestCelebIdxsResult = await interestDao.selectInterestCelebIdxs(connection, userIdx);
  // console.log(3, interestCelebIdxsResult)
  connection.release();

  return interestCelebIdxsResult
}