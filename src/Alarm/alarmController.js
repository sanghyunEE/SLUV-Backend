const jwtMiddleware = require("../../config/jwtMiddleware");
const alarmProvider = require("./alarmProvider");
const alarmService = require("./alarmService");
const baseResponse = require("../../config/baseResponseStatus");
const { response, errResponse } = require("../../config/response");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const secret_config = require("../../config/secret");


// req.params req.query req.body 의 데이터들을 가져오는 곳
// 형식적 validation 처리

// 11.1 본인의 알람 목록 조회
exports.getAlarms = async function (req, res) {
    const userIdx = req.verifiedToken.userIdx;

    const alarmListResult = await alarmProvider.retrieveAlarms(userIdx);
    return res.send(response(baseResponse.SUCCESS, alarmListResult));
}

// 11.2 fcm 토큰 등록 API
exports.patchFcm = async function (req, res) {
    const userIdx = req.verifiedToken.userIdx;
    const { fcmToken, platform, type } = req.body;

    const createFcmResponse = await alarmService.editFcm(userIdx, fcmToken, platform, type);
    // console.log(createFcmResponse);
    return res.send(createFcmResponse);
}