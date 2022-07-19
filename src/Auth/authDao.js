// [소셜 로그인] snsEmail 과 registerType 에 모두 부합하는 유저가 있는지 반환 
async function selectUserRegisterType(connection, selectUserParams) {
  const selectUserQuery = `
        SELECT userIdx, nickName
        FROM User 
        WHERE snsEmail = ? AND registerType = ?;`;
  const selectUserRow = await connection.query(
    selectUserQuery,
    selectUserParams
  );

  return selectUserRow;
}

// [로컬 로그인] email에 부합하는 유저가 있는지 반환 
async function selectUserEmail(connection, email) {
  const selectUserQuery = `
        SELECT userIdx, email
        FROM User 
        WHERE email = ?`;
  const [selectUserRow] = await connection.query(
    selectUserQuery,
    email
  );

  return selectUserRow;
}

// [소셜 로그인] snsEmail 과 registerType 삽입 
async function insertUserSocial(connection, insertUserParams) {
  const insertUserQuery = `
        INSERT INTO User(snsEmail, registerType)
        VALUES (?, ?);
    `;
  const insertUserRow = await connection.query(
    insertUserQuery,
    insertUserParams
  );

  return insertUserRow;
}

// [로컬 회원가입] 이메일, 패스워드, ..., registerType 삽입
async function insertUserLocal(connection, insertUserParams) {
  const insertUserQuery = `
        INSERT INTO User(phoneNumber, email, pwd, nickName, registerType)
        VALUES (?, ?, ?, ?, ?);
    `;
  const insertUserRow = await connection.query(
    insertUserQuery,
    insertUserParams
  );

  return insertUserRow;
}

// [로컬 로그인] 패스워드 체크
async function selectUserPwd(connection, selectUserPasswordParams) {
  const selectUserPasswordQuery = `
        SELECT email, pwd, nickName
        FROM User
        WHERE email = ? AND pwd = ?;`;
  const selectUserPasswordRow = await connection.query(
    selectUserPasswordQuery,
    selectUserPasswordParams
  );

  return selectUserPasswordRow;
}

// 유저 상태 체크 
async function selectUserAccount(connection, email) {
  const selectUserAccountQuery = `
        SELECT status, userIdx
        FROM User
        WHERE email = ?;`;
  const selectUserAccountRow = await connection.query(
    selectUserAccountQuery,
    email
  );
  return selectUserAccountRow[0];
}

async function selectUserStatus(connection, userIdx) {
  const selectUserAccountQuery = `
        SELECT status, userIdx
        FROM User
        WHERE userIdx = ?;`;
  const selectUserAccountRow = await connection.query(
    selectUserAccountQuery,
    userIdx
  );
  return selectUserAccountRow[0];
}

async function selectUserEmailByPhone(connection, phoneNumber) {
  const selectUserEmailByPhoneQuery = `
    select email
    from User as U
    where phoneNumber = ?
  `;

  const [emailRow] = await connection.query(selectUserEmailByPhoneQuery, phoneNumber);
  return emailRow;
}


module.exports = {
  selectUserRegisterType,
  insertUserSocial,
  insertUserLocal,
  selectUserEmail,
  selectUserPwd,
  selectUserAccount,
  selectUserStatus,
  selectUserEmailByPhone

};
