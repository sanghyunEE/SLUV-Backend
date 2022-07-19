const jwtMiddleware = require("../../config/jwtMiddleware");
const interestProvider = require("./interestProvider");
const interestService = require("./interestService");
const baseResponse = require("../../config/baseResponseStatus");
const { response, errResponse } = require("../../config/response");
const regexEmail = require("regex-email");
const { emit } = require("nodemon");
require('dotenv').config()
const crypto = require("crypto");

// req.headers req.params req.query req.body 의 데이터들을 가져오는 곳
// 형식적 validation 처리 - 빈값, 길이, 닉네임 형식

// 3.0 셀럽 및 멤버 전체 목록 조회
exports.getCelebsMembers = async function (req, res) {
    const celebResult = await interestProvider.retrieveCelebList();
    // console.log(celebResult);
    const celebMemberResult = await Promise.all(celebResult.map(async (obj) => {
        if (obj.isGroup === 1) {
            const memberResult = await interestProvider.retrieveMemberList(obj.celebIdx);
            // console.log(memberResult);
            const member_obj = {
                memberList: memberResult
            }
            const new_obj = {
                ...obj,
                ...member_obj
            }
            // console.log(new_obj)
            return new_obj
        }
        else {
            return obj
        }
    }))

    console.log(celebMemberResult)

    return res.send(response(baseResponse.SUCCESS, celebMemberResult));
}


// 3.1 셀럽 목록 조회
exports.getCelebs = async function (req, res) {
    const celebResult = await interestProvider.retrieveCelebList();
    console.log(celebResult);
    return res.send(response(baseResponse.SUCCESS, celebResult));
}

// 3.2 셀럽 추가 요청하기
exports.postCelebReq = async function (req, res) {
    const { name, reason } = req.body;

    if (!name) return res.send(errResponse(baseResponse.INTEREST_CELEB_NAME_EMPTY));
    // else if (!reason) return res.send(errResponse(baseResponse.INTEREST_CELEB_REASON_EMPTY));

    const userIdxFromJWT = req.verifiedToken.userIdx;

    const postCelebReqResponse = await interestService.createCelebReq(userIdxFromJWT, name, reason);

    return res.send(response(baseResponse.SUCCESS));
}

// 3.3 멤버 목록 조회
exports.getMembers = async function (req, res) {
    const { celebIdx } = req.query;

    const memberResult = await interestProvider.retrieveMemberList(celebIdx);
    if (memberResult.length < 1) {
        return res.send(errResponse(baseResponse.INTEREST_MEMBER_EMPTY));

    }


    return res.send(response(baseResponse.SUCCESS, memberResult));
}

// 3.4 다른 스러버들이 많이 선택한 셀럽들 조회
exports.getTopChoiceCelebs = async function (req, res) {
    const topChoiceCelebInfoResult = await interestProvider.retrieveTopChoiceCelebInfoList();
    return res.send(response(baseResponse.SUCCESS, topChoiceCelebInfoResult))
}



// 3.5 해당 유저 관심 셀럽 + 멤버 조회
exports.getInterestCelebs = async function (req, res) {
    const userIdxFromJWT = req.verifiedToken.userIdx;

    const interestListResult = await interestProvider.retrieveInterestList(userIdxFromJWT);



    return res.send(response(baseResponse.SUCCESS, interestListResult));

}


// 3.6 관심 셀럽 추가
exports.postInterestCelebs = async function (req, res) {
    const userIdxFromJWT = req.verifiedToken.userIdx;
    const { celebMemberList } = req.body;

    const deleteInterestCelebsResponse = await interestService.deleteInterestCelebs(userIdxFromJWT);


    // 나중에 멤버 추가 완료 되면 주석 해제 해라 상현아.
    // celebMemberList.forEach(element => interestService.createInterestCeleb(userIdxFromJWT, element.celebIdx));
    for (element of celebMemberList) {
        await interestService.createInterestCeleb(userIdxFromJWT, element.celebIdx)
    }


    for (var i of celebMemberList) {
        if (i.memberList == null) {
            continue;
        }
        for (var j of i.memberList) {
            // console.log(i.celebIdx, j.memberIdx);
            await interestService.createInterestMember(userIdxFromJWT, i.celebIdx, j.memberIdx);
        }
    }

    return res.send(response(baseResponse.SUCCESS));


}