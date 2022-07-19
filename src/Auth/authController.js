const axios = require("axios");
const qs = require('qs');
require('dotenv').config()
const jwtMiddleware = require("../../config/jwtMiddleware");
const authProvider = require("./authProvider");
const authService = require("./authService");
const userProvider = require("../User/userProvider");
const baseResponse = require("../../config/baseResponseStatus");
const { response, errResponse } = require("../../config/response");
const regexEmail = require("regex-email");

const { OAuth2Client, auth } = require('google-auth-library');

const LRU = require('lru-cache');
const CryptoJS = require('crypto-js');
const nodeCache = require('node-cache');
const myCache = new nodeCache({ stdTTL: 180, checkperiod: 600 }); // 인증번호 용
const jwtCache = new nodeCache({ stdTTl: 1800, checkperiod: 2000 }); // jwt 용

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const secret_config = require("../../config/secret");

const nodemailer = require("nodemailer");

// req.params req.query req.body 의 데이터들을 가져오는 곳
// 형식적 validation 처리



// 1.1 카카오 로그인(사실상 회원가입임)
exports.kakao_login = async function (req, res) {
    const code = req.query.code;
    // 인가 코드 없을 때 인가코드 달라고 에러 레스폰스 
    if (!code) return res.send(errResponse(baseResponse.SIGNUP_CODE_EMPTY));
    let token;
    try {
        token = await axios({// access token 
            method: 'POST',
            url: 'https://kauth.kakao.com/oauth/token',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            data: qs.stringify({
                grant_type: 'authorization_code',
                client_id: process.env.KAKAO_CLIENT_ID,
                client_secret: process.env.KAKAO_CLIENT_SECRET,
                redirectUri: process.env.KAKAO_REDIRECT_URI,
                'code': code,
            })//객체를 string 으로 변환
        });
        // console.log(token, 'token!');
    } catch (err) {
        return res.send(err)
    }

    let user;
    try {
        user = await axios({
            method: 'GET',
            url: 'https://kapi.kakao.com/v2/user/me',
            headers: {
                'Authorization': `Bearer ${token.data.access_token}`,
                'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
            }
        });
    } catch (err) {
        return res.send(err)
    }

    // console.log(user.data.kakao_account.email);
    // return res.send('ddd');

    const kakaoUser = user.data.kakao_account;
    const userSnsEmail = kakaoUser.email;
    console.log('userEmail', userSnsEmail);

    const signUpResponse = await authService.createUserSocial(userSnsEmail, 'KAKAO');

    return res.send(signUpResponse);
}

// 1.2 구글 로그인
exports.google_login = async function (req, res) {
    const credential = req.query.code;
    if (!credential) return res.send(errResponse(baseResponse.SIGNUP_CODE_EMPTY));

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const userEmail = payload['email'];
        return userEmail
    }
    const userSnsEmail = await verify().catch(console.error);
    // console.log(userSnsEmail);
    console.log('userEmail', userSnsEmail);


    const signUpResponse = await authService.createUserSocial(userSnsEmail, 'GOOGLE');

    res.send(signUpResponse);
}

// one tap login test
exports.g_login = async function (req, res) {
    const { credential } = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        console.log(payload);
        const userEmail = payload['email'];
        return userEmail
    }
    const userSnsEmail = await verify().catch(console.error);
    console.log(userSnsEmail);
    // console.log(req.body);
    res.send(credential);
}




// 1.4 로컬 회원가입
exports.local_signup = async function (req, res) {

    //POST body 값 가져오기
    const { phoneNumber, email, pwd, nickName } = req.body; // 비밀번호 재 확인 (pwdConfirm) 염두에 두자

    // 형식적 val 은 프론트 단에서 다 처리했으므로 빈 값인지만 확인하자. 
    if (!phoneNumber)
        return res.send(response(baseResponse.SIGNUP_PHONENUMBER_EMPTY));

    // 빈 값 체크
    if (!email)
        return res.send(response(baseResponse.SIGNUP_EMAIL_EMPTY));

    // 빈 값 체크
    if (!pwd)
        return res.send(response(baseResponse.SIGNUP_PASSWORD_EMPTY));

    // 빈 값 체크
    if (!nickName)
        return res.send(response(baseResponse.SIGNUP_NICKNAME_EMPTY));

    // createUser 함수 실행을 통한 결과 값을 signUpResponse에 저장
    const signUpResponse = await authService.createUserLocal(
        phoneNumber,
        email,
        pwd,
        nickName
    );

    return res.send(signUpResponse);

}

// 1.5 로컬 로그인
exports.local_login = async function (req, res) {
    const { email, pwd } = req.body;

    const signInResponse = await authService.postSignIn(email, pwd);

    return res.send(signInResponse);
}

// 1.6 자동 로그인
exports.auto_login = async function (req, res) {
    const userIdxFromJWT = req.verifiedToken.userIdx
    console.log(req.verifiedToken)
    console.log("자동 로그인 userIdx: ", userIdxFromJWT);

    const statusRows = await authProvider.allAccountCheck(userIdxFromJWT);
    console.log(statusRows);

    // 존재하지 않는 userIdx를 헤더로 넘겨줬을 경우
    if (statusRows.length < 1) return res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE));
    // 사용자가 인 비활성자인 경우
    if (statusRows[0].status === 'INACTIVE') return res.send(errResponse(baseResponse.SIGNIN_INACTIVE_ACCOUNT));
    // 사용자가 인 탈퇴한 경우 (삭제한 경우)
    if (statusRows[0].status === 'DELETED') return res.send(errResponse(baseResponse.SIGNIN_WITHDRAWAL_ACCOUNT));


    return res.send(response(baseResponse.TOKEN_VERIFICATION_SUCCESS, { userIdx: userIdxFromJWT }));
}


// 1.7 인증번호 발송
exports.send_certnum = async function (req, res) {
    const phone = req.query.phone;
    // console.log(typeof (phone)); // string 임
    if (!phone) return res.send(errResponse(baseResponse.SIGNUP_PHONENUMBER_EMPTY));

    myCache.del(phone);

    const certNum = Math.floor(1000 + Math.random() * 9000); // Number

    myCache.set(phone, certNum.toString());
    console.log('저장 할 전화번호 및 인증번호 : ', phone, certNum);

    const date = Date.now().toString();

    const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, process.env.NCP_SECRET_KEY);
    hmac.update('POST');
    hmac.update(' ');
    hmac.update(`/sms/v2/services/${process.env.SMS_SERVICE_ID}/messages`);
    hmac.update('\n');
    hmac.update(date);
    hmac.update('\n');
    hmac.update(process.env.NCP_ACCESS_KEY);
    const hash = hmac.finalize();
    const signature = hash.toString(CryptoJS.enc.Base64);

    try {
        const result = await axios({
            method: "POST",
            json: true,
            url: `https://sens.apigw.ntruss.com/sms/v2/services/${process.env.SMS_SERVICE_ID}/messages`,
            headers: {
                'Content-Type': 'application/json',
                'x-ncp-apigw-timestamp': date,
                'x-ncp-iam-access-key': process.env.NCP_ACCESS_KEY,
                'x-ncp-apigw-signature-v2': signature
            },
            data: {
                type: 'SMS',
                countryCode: "82",
                from: '01053187918',
                content: `SLUV 인증번호는 [${certNum}] 입니다.`, // 인증번호 난수 생성 후 -> 캐시 저장 후 -> 보내기
                // messages: [{ to: '01028615386' }] // 해당 유저 번호 
                messages: [{ to: phone }]
            }
        })
        console.log(result.data);
    } catch (err) {
        myCache.del(phone);
        return res.send(err)
    }

    return res.send(response(baseResponse.SUCCESS));

}

// 1.8 인증번호 인증
exports.certify_certnum = async function (req, res) {
    const phone = req.query.phone;
    const certnum = req.query.certnum; // String

    if (!phone) return res.send(errResponse(baseResponse.SIGNUP_PHONENUMBER_EMPTY));
    if (!certnum) return res.send(errResponse(baseResponse.SIGNUP_CERT_NUM_EMPTY));

    const cacheData = myCache.get(phone); // Number
    console.log('캐시에 저장되어 있던 인증번호 : ', cacheData);


    if (!cacheData || cacheData !== certnum) {
        return res.send(response(baseResponse.SIGNUP_CERT_NUM_NOT_EXIST));
    }
    myCache.del(phone);
    return res.send(response(baseResponse.SUCCESS));
}

// 1.9 비밀번호 변경 링크 보내기
exports.send_editLink = async function (req, res) {
    const email = req.body.email;
    console.log(email);
    if (!email) return res.send(errResponse(baseResponse.USER_USEREMAIL_EMPTY));

    const checkEmail = await userProvider.readEmail(email);
    if (checkEmail.length === 0) {
        return res.send(response(baseResponse.USER_EMPTY_EMAIL));
    }
    //checkEmail[0] => userIdx

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.GOOGLE_MAIL, // 구글 계정 메일
            pass: process.env.GOOGLE_PASSWORD, // 구글 계정 비밀번호 혹은 앱 비밀번호
        },
    });


    let token = await jwt.sign(
        {
            userIdx: checkEmail[0].userIdx,
            email: email,
        }, // 토큰의 내용(payload)
        secret_config.jwtsecret, // 비밀키
        {
            expiresIn: "1800s", // 30 분으로 해야함.
            subject: "resetPassword",
        } // 유효 기간 365일
    );

    // jwtCache.del(token); // 초기 jwt 제거
    // jwtCache.set(token, email); // jwt - email 쌍으로 캐시에 저장

    const mailOptions = {
        from: process.env.GOOGLE_MAIL,
        to: email,
        subject: "[SLUV] 비밀번호 재설정 링크",
        html: `<div
   style="
      font-family: Pretendard;
      box-sizing: border-box;
      justify-content: center;
      align-items: center;
      background-color: #f4f4f4;
      padding: 20px;
   "
>
   <div
      style="
         box-sizing: border-box;
         background-color: white;
         width: 100%;
         min-height: 296px;
         padding: 13px 20px 20px 20px;
         border-radius: 16px;
      "
   >
      <div style="font-family: Pretendard; width: 38px; height: 38px;">SLUV</div>
      <h2
         style="
            font-family: Pretendard;
            font-size: 24px;
            margin-top: 0.375rem;
            margin-bottom: 26px;
            font-weight: bold;
            color: black;
         "
      >
         비밀번호 변경을<br />도와드릴게요
      </h2>
      <br />
      <p style="font-family: Pretendard; color: black; font-size: 13px; margin-bottom: 26px;">
         안녕하세요! Sluv(스럽) 고객센터입니다. <br />아래 ‘비밀번호 변경하기'를 클릭하시면,
         비밀번호 변경을 진행하실 수 있습니다. 30분 동안 유효한 버튼이니, 제한 시간이 지났다면
         비밀번호 찾기를 다시 해 주세요!
      </p>
      <br />
      <p style="font-family: Pretendard; color: black; font-size: 13px;"
         >이외에 도움이 필요하시다면,<br />
         <b>celebit.sluv@gmail.com</b>에 문의사항을 남겨주세요! 감사합니다.</span
      >
      <div style="display: flex; justify-content: center; align-items: center;">
         <a
            href="https://sluv.co.kr/settings/reset/password/${token}"
            style="
               font-family: Pretendard;
               height: 48px;
               width: 100%;
               background-color: #9e30f4;
               color: white;
               font-size: 16px;
               padding: 16px;
               box-sizing: border-box;
               text-decoration: none;
               font-weight: bold;
               border-radius: 16px;
               align-items: center;
               text-align: center;
               margin-top: 20px;
            "
         >
            비밀번호 변경하기
         </a>
      </div>
   </div>
</div>`,
        text: "비밀번호 재설정 링크를 보내드립니다. 30분 유효기간입니다.",
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(info);
    } catch (err) {
        // jwtCache.del(token);
        return res.send(err)
    }


    return res.send(response(baseResponse.SUCCESS));
}

exports.getEmail = async function (req, res) {
    const phone = req.query.phone;
    if (!phone) {
        return res.send(errResponse(baseResponse.SIGNUP_PHONENUMBER_EMPTY));
    }

    const retriveUserEmailResponse = await authProvider.retriveUserEmail(phone);
    return res.send(retriveUserEmailResponse);
}

