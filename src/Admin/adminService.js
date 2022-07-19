const { logger } = require("../../config/winston");
const { pool } = require("../../config/database");
const secret_config = require("../../config/secret");

const adminProvider = require("./adminProvider");
const adminDao = require("./adminDao");

const baseResponse = require("../../config/baseResponseStatus");
const { response } = require("../../config/response");
const { errResponse } = require("../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// const fcm_admin = require('../../config/fcm_admin');
const admin = require("firebase-admin");
const serviceAccount = require("../../config/firebase-admin.json");

const fcm_admin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// POST PATCH DELETE 등의 행위 진행
// 의미적 validation 처리


exports.postLogin = async function (id, pwd) {
    try {

        // 이메일 여부 확인
        const idRows = await adminProvider.idCheck(id);
        if (idRows.length < 1) return errResponse(baseResponse.SIGNIN_EMAIL_WRONG);
        const selectId = idRows[0].id;
        console.log("이메일 여부 확인 완료", selectId);
        // 패스워드 체크
        const selectAdminPasswordParams = [selectId, pwd];
        const passwordRows = await adminProvider.pwdCheck(selectAdminPasswordParams);

        console.log(passwordRows);
        // 올바르지 않게 입력 했을 때..
        if (passwordRows.length < 1 || passwordRows[0].pwd !== pwd) {
            return errResponse(baseResponse.SIGNIN_PASSWORD_WRONG);
        }
        console.log("패스워드 체크 완료");
        //토큰 생성 Service
        let token = await jwt.sign(
            {
                adminIdx: idRows[0].adminIdx,
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
                expiresIn: "365d",
                subject: "Admin",
            } // 유효 기간 365일
        );

        return response(baseResponse.SUCCESS, { 'adminIdx': idRows[0].adminIdx, 'jwt': token });

    } catch (err) {
        logger.error(`App - postLogin Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}


exports.createNotice = async function (title, content) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();

        const insertParams = [title, content];
        const insertNoticeResponse = await adminDao.insertNotice(connection, insertParams);

        // 모든 유저 가져와서 ...
        const userIdxListResult = await adminDao.selectUserIdx(connection);

        // push 알람 보낼 기기 토큰 및 메시지 
        //디바이스의 토큰 값
        const deviceToken = `dCnIrXMGQAOp0_L1srlVaP:APA91bH_p_ot3sii_yKmMtCj8BreKxkdTTu-cDzsUbFmNIY8kqFEKeFb4ZxS2MQlzMGJfLeYRwedw4a8I_4R07_6wIstQ3xTneeKjWfHDPzjIl0nJUCDFTcaYi5K3y19IywEmzUxM9uE`

        const message = {
            notification: {
                title: 'notification title💛',
                body: 'notification body💚',
            },
            data: {
                title: 'data title💛',
                body: 'data body💚',
            },
            token: deviceToken,
        }
        fcm_admin
            .messaging()
            .send(message)
            .then(function (response) {
                console.log('Successfully sent message: : ', response)
            })
            .catch(function (err) {
                console.log('Error Sending message!!! : ', err)
            });

        // 해당 유저 각각에 대해 알람 테이블에 0.userIdx 1.알람타입 2.noticeIdx 랑 3.알림내용 넣기..
        for (user of userIdxListResult) {
            const insertParams = ["notice", user.userIdx, insertNoticeResponse[0].insertId, title];
            const insertAlarmResponse = await adminDao.insertAlarm(connection, insertParams);
            //여기다가 각 유저별 fcm-push 알림 로직 작성
        }



        await connection.commit();
        return response(baseResponse.SUCCESS, { addedNoticeIdx: insertNoticeResponse[0].insertId });

    } catch (err) {
        logger.error(`App - createNotice Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        await connection.rollback();
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}

exports.deleteNotice = async function (noticeIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        const deleteNoticeResponse = await adminDao.deleteNotice(connection, noticeIdx);
        return response(baseResponse.SUCCESS);
    } catch (err) {
        logger.error(`App - deleteNotice Service error\n: ${err.message} \n${JSON.stringify(err)}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}