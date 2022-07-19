async function selectAlarms(connection, userIdx) {
    const selectAlarmsQuery = `
    select alarmIdx,
          alarmType,
          userIdx,
          targetUserIdx,
          itemIdx,
          noticeIdx,
          eventIdx,
          alarmMessage,
          case
                when timestampdiff(second, A.createdAt, current_timestamp) < 60
                    then concat(timestampdiff(second, A.createdAt, current_timestamp), '초 전')
                when timestampdiff(minute , A.createdAt, current_timestamp) < 60
                      then concat(timestampdiff(minute, A.createdAt, current_timestamp), '분 전')
                when timestampdiff(hour , A.createdAt, current_timestamp) < 24
                    then concat(timestampdiff(hour, A.createdAt, current_timestamp), '시간 전')
                when timestampdiff(day , A.createdAt, current_timestamp) < 365
                    then concat(timestampdiff(day, A.createdAt, current_timestamp), '일 전')
                else timestampdiff(year , A.createdAt, current_timestamp)
            end as alarmTime
    from Alarm as A
    where A.userIdx = ${userIdx}
    order by A.createdAt desc
  `;
    const [alarmRows] = await connection.query(selectAlarmsQuery);
    return alarmRows;
}

async function selectFcmUser(connection, userIdx) {
    const selectFcmUserQuery = `
        select *
        from Fcm
        where userIdx = ${userIdx};
    `;
    const [userRow] = await connection.query(selectFcmUserQuery);
    return userRow;
}

async function insertFcm(connection, insertParams) {
    const insertFcmQuery = `
        insert into Fcm(userIdx, fcmToken, platform, type)
        values (?, ?, ?, ?);
    `;

    const insertRow = await connection.query(insertFcmQuery, insertParams);
    return insertRow;
}

async function updateFcm(connection, updateParams) {
    const updateFcmQuery = `
        update Fcm
        set fcmToken = ?, platform = ?, type = ?
        where userIdx = ?;
    `;
    const updateRow = await connection.query(updateFcmQuery, updateParams);
    return updateRow;
}

module.exports = {
    selectAlarms,
    selectFcmUser,
    insertFcm,
    updateFcm,


};
