const { logger } = require("../../config/winston");
const { pool } = require("../../config/database");
const secret_config = require("../../config/secret");

const questionProvider = require("./questionProvider");
const questiontDao = require("./questionDao");

const baseResponse = require("../../config/baseResponseStatus");
const { response } = require("../../config/response");
const { errResponse } = require("../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");


exports.createQuestion = async function (userIdx, celebIdx, memberIdx, title, content) {
  try {
    const insertParams = [
      userIdx,
      celebIdx,
      memberIdx,
      title,
      content
    ];

    const connection = await pool.getConnection(async (conn) => conn);
    const insertQuestionInfoResult = await questiontDao.insertQuestionInfo(connection, insertParams);
    connection.release();

    return response(baseResponse.SUCCESS, { 'questionIdx': insertQuestionInfoResult[0].insertId });

  } catch (err) {
    logger.error(`App - createItem Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }

}


exports.createQuestionImgs = async function (questionIdx, questionImgUrlList) {
  let insertParamsList = []
  for (questionImgUrl of questionImgUrlList) {
    let temp_list = [];
    temp_list.push(questionIdx);
    temp_list.push(questionImgUrl.isRepresent);
    temp_list.push(questionImgUrl.questionImgUrl);
    insertParamsList.push(temp_list);
  }

  console.log(insertParamsList);

  try {
    const connection = await pool.getConnection(async (conn) => conn);
    const insertQuestionImgsResult = await questiontDao.insertQuestionImgs(connection, insertParamsList);
    connection.release();

    return response(baseResponse.SUCCESS);


  } catch (err) {
    logger.error(`App - createItemImgs Service error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  }

}