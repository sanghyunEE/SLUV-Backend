const baseResponse = require("../../config/baseResponseStatus");
const { pool } = require("../../config/database");
const { response, errResponse } = require("../../config/response");
const { logger } = require("../../config/winston");

const userDao = require("./userDao");
// Provider: Read 비즈니스 로직 처리
// GET 행위 진행
// 의미적 validation 처리 - table에 닉네임 중복이 있는지, 비활성화 된 user 인지 


// userIdx을 넘겼을 때 해당 유저의 닉네임 반환 
exports.retriveUserNickName = async function (userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);

    const nickNameResult = await userDao.selectUserNickName(
        connection,
        userIdx
    );
    connection.release();

    // console.log(nickNameResult)
    // nickNameResult의 제일 첫번 째 값을 택해야 nickname을 반환하죠 
    return nickNameResult[0];

};

// phoneNumber를 넘겼을 때 중복되는 유저가 있는지 반환
exports.readPhoneNum = async function (phoneNum) {
    const connection = await pool.getConnection(async (conn) => conn);

    const phoneResult = await userDao.selectUserPhoneNumber(
        connection,
        phoneNum
    );
    connection.release();

    // console.log(nickNameResult)
    // nickNameResult의 제일 첫번 째 값을 택해야 nickname을 반환하죠 
    return phoneResult;
}

// 로컬 이메일을 넘겼을 때 중복되는 유저가 있는지 반환
exports.readEmail = async function (email) {
    const connection = await pool.getConnection(async (conn) => conn);

    const emailResult = await userDao.selectUserEmail(
        connection,
        email
    );
    connection.release();

    // console.log(nickNameResult)
    // nickNameResult의 제일 첫번 째 값을 택해야 nickname을 반환하죠 
    return emailResult;
}

// 닉네임을 넘겼을 때 중복되는 유저가 있는지 반환
exports.readNickName = async function (nickName) {
    const connection = await pool.getConnection(async (conn) => conn);

    const nickNameResult = await userDao.selectUserByNickName(
        connection,
        nickName
    );
    connection.release();

    // console.log(nickNameResult)
    // nickNameResult의 제일 첫번 째 값을 택해야 nickname을 반환하죠 
    return nickNameResult;
}

// userIdx 넘겼을 때 Pwd 반환
exports.retriveUserPwd = async function (userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);

    const pwdRows = await userDao.selectUserPwd(
        connection,
        userIdx
    );
    connection.release();


    // console.log("해당 유저의 비밀번호", pwdRows);
    // nickNameResult의 제일 첫번 째 값을 택해야 nickname을 반환하죠 
    return pwdRows[0];

};

exports.followerCheck = async function (fromUserIdx, toUserIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const isFollowResult = await userDao.selectFollower(connection, fromUserIdx, toUserIdx);

    connection.release();
    return isFollowResult;
}