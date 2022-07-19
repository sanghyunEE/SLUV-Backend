
// 새롭게 추가한 함수를 아래 부분에서 export 해줘야 외부의 Provider, Service 등에서 사용가능합니다.


// userIdx에 해당하는 닉네임 변경 
async function updateUserNickName(connection, userIdx, nickname) {
    const updateUserNickNameQuery = `
        UPDATE User 
        SET nickName = ?
        WHERE userIdx = ?;`;
    const updateRow = await connection.query(updateUserNickNameQuery, [nickname, userIdx]);
    // console.log(updateRow[0], 'udpateRow!!');
    return updateRow[0];
}


// userIdx로 닉네임 조회
async function selectUserNickName(connection, userIdx) {
    const selectUserNickNameQuery = `
                SELECT nickName 
                FROM User 
                WHERE userIdx = ?;
                `;
    // console.log(await connection.query(selectUserNickNameQuery, userIdx));
    const [nickNameRows] = await connection.query(selectUserNickNameQuery, userIdx);
    return nickNameRows;
}


// phoneNumber로 중복되는 유저가 있는 지 조회
async function selectUserPhoneNumber(connection, phoneNumber) {
    const selectUserPhoneNumberQuery = `
        SELECT userIdx, email
        FROM User
        WHERE phoneNumber = ?;
        `;

    const [userRows] = await connection.query(selectUserPhoneNumberQuery, phoneNumber);
    console.log('userRows', userRows);
    return userRows;

}

// email로 중복되는 유저가 있는 지 조회
async function selectUserEmail(connection, email) {
    const selectUserEmailQuery = `
        SELECT userIdx
        FROM User
        WHERE email = ?;
        `;

    const [userRows] = await connection.query(selectUserEmailQuery, email);
    console.log('userRows', userRows);
    return userRows;
}

// 닉네임으로 중복되는 유저가 있는 지 조회
async function selectUserByNickName(connection, nickName) {
    const selectUserByNickNameQuery = `
        SELECT userIdx
        FROM User
        WHERE nickName = ?;
        `;

    const [userRows] = await connection.query(selectUserByNickNameQuery, nickName);
    console.log('userRows', userRows);
    return userRows;
}

// userIdx로 비밀번호 변경
async function updateUserPwd(connection, userIdx, pwd) {
    const updateUserPwdQuery = `
        UPDATE User 
        SET pwd = ?
        WHERE userIdx = ?;`;
    const updateRow = await connection.query(updateUserPwdQuery, [pwd, userIdx]);
    // console.log(updateRow[0], 'udpateRow!!');
    return updateRow[0];
}

// userIdx로 Pwd 조회
async function selectUserPwd(connection, userIdx) {
    const selectUserPwdQuery = `
                SELECT pwd 
                FROM User 
                WHERE userIdx = ?;
                `;
    // console.log(await connection.query(selectUserNickNameQuery, userIdx));
    const [pwdRows] = await connection.query(selectUserPwdQuery, userIdx);
    return pwdRows;
}

async function insertReportUser(connection, insertPrams) {
    const insertReportUserQuery = `
        INSERT INTO UserReport (reporterIdx, userIdx, category, content)
        VALUES (?, ?, ?, ?);
    `;

    const reportRow = await connection.query(insertReportUserQuery, insertPrams);
    return reportRow;
}

async function insertFollow(connection, insertParams) {
    const insertFollowQuery = `
        insert into Follow (followerIdx, followeeIdx)
        values (?, ?);
    `;

    const followRow = await connection.query(insertFollowQuery, insertParams);
    return followRow;
}


async function deleteFollow(connection, deleteParams) {
    const deleteFollowQuery = `
        delete from Follow
        where followerIdx = ? and followeeIdx = ?;
    `;

    const unfollowRow = await connection.query(deleteFollowQuery, deleteParams);
    return unfollowRow;
}

async function selectFollower(connection, fromUserIdx, toUserIdx) {
    const selectFollowerQuery = `
        select followIdx
        from Follow as F
        where followerIdx = ${fromUserIdx} and followeeIdx = ${toUserIdx};
    `;

    const [isFollowRows] = await connection.query(selectFollowerQuery);
    return isFollowRows;
}

module.exports = {
    updateUserNickName,
    selectUserNickName,
    selectUserPhoneNumber,
    selectUserEmail,
    selectUserByNickName,
    updateUserPwd,
    selectUserPwd,
    insertReportUser,
    insertFollow,
    deleteFollow,
    selectFollower,

};
