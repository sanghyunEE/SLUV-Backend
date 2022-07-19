


async function insertQuestionInfo(connection, insertPrams) {
  const insertQuestionInfoQuery = `
    INSERT INTO Question(userIdx, celebIdx, memberIdx, title, content)
    VALUES (?, ?, ?, ?, ?);
  `;

  const insertQuestionInfoRow = await connection.query(
    insertQuestionInfoQuery,
    insertPrams
  );

  return insertQuestionInfoRow;

}

async function insertQuestionImgs(connection, insertParamsList) {
  const insertQuestionImgsQuery = `
    INSERT INTO QuestionImg (questionIdx, isRepresent, questionImgUrl)
    VALUES ?
  `
  const insertQuestionImgsRow = await connection.query(
    insertQuestionImgsQuery,
    [insertParamsList]
  );

  return insertQuestionImgsRow;


}

module.exports = {
  insertQuestionInfo,
  insertQuestionImgs,

};