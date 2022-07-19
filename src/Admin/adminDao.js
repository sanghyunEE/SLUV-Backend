
async function selectUserId(connection, id) {
  const selectAdminQuery = `
        SELECT adminIdx, id
        FROM Admin 
        WHERE id = ?
        `;
  const [selectUserRow] = await connection.query(
    selectAdminQuery,
    id
  );

  return selectUserRow;
}

async function selectAdminPwd(connection, selectParams) {
  const selectAdminPwdQuery = `
    select *
    from Admin as A
    where id = ? and pwd = ?;
  `;

  const [adminPwdRow] = await connection.query(
    selectAdminPwdQuery,
    selectParams
  );

  return adminPwdRow;

}

async function selectNotices(connection) {
  const selectNoticesQuery = `
    select N.noticeIdx, N.title, N.content
    from Notice as N
  `;

  const [noiceRows] = await connection.query(selectNoticesQuery);
  return noiceRows;
}

async function insertNotice(connection, insertParams) {
  const insertNoticeQuery = `
    insert into Notice(title, content)
    values(?, ?);
  `;
  const insertResult = await connection.query(insertNoticeQuery, insertParams);
  return insertResult;
}

async function deleteNotice(connection, noticeIdx) {
  const deleteNoticeQuery = `
    delete from Notice
    where noticeIdx = ${noticeIdx};
  `;
  const deleteResult = await connection.query(deleteNoticeQuery);
  return deleteResult;
}

async function selectUserIdx(connection) {
  const selectUserIdxQuery = `
    select *
    from User as U
  `;
  const [userRows] = await connection.query(selectUserIdxQuery);
  return userRows;
}

async function insertAlarm(connection, insertParams) {
  const insertAlarmQuery = `
    insert into Alarm(alarmType, userIdx, noticeIdx, alarmMessage)
    values (?, ?, ?, ?);
  `;
  const insertResult = await connection.query(insertAlarmQuery, insertParams);
  return insertResult;
}

module.exports = {
  selectUserId,
  selectAdminPwd,
  selectNotices,
  insertNotice,
  deleteNotice,
  selectUserIdx,
  insertAlarm,
};
