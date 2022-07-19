//클라이언트의 요청을 '라우팅' 해주는 곳
module.exports = function (app) {
    const alarm = require('./alarmController');
    const jwtMiddleware = require('../../config/jwtMiddleware');

    // 11.1 본인의 알람 목록 조회
    app.get('/alarms', jwtMiddleware, alarm.getAlarms);

    // 11.2 fcm 토큰 등록 API
    app.patch('/users/fcm', jwtMiddleware, alarm.patchFcm);

}