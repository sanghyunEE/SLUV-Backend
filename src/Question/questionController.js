const jwtMiddleware = require("../../config/jwtMiddleware");
const questionProvider = require("./questionProvider");
const questionService = require("./questionService");
const baseResponse = require("../../config/baseResponseStatus");
const { response, errResponse } = require("../../config/response");
require('dotenv').config()



// 5.1 질문하기
exports.postQuestion = async function (req, res) {
    const { celebIdx, memberIdx, title, content, questionImgUrlList } = req.body;
    if (!celebIdx || !title || !questionImgUrlList) {
        return res.send(errResponse(baseResponse.API_PARAMETER_EMPTY));
    }
    const userIdxFromJWT = req.verifiedToken.userIdx;

    const postQuestionResponse = await questionService.createQuestion(
        userIdxFromJWT,
        celebIdx,
        memberIdx,
        title,
        content
    );
    if (postQuestionResponse.code != 1000) {
        return res.send(postQuestionResponse);
    }


    const questionIdx = postQuestionResponse.result.questionIdx;


    const postQuestionImgResponse = await questionService.createQuestionImgs(questionIdx, questionImgUrlList);



    if (postQuestionImgResponse.code != 1000) {
        return res.send(postQuestionImgResponse);
    } else {
        return res.send(response(baseResponse.SUCCESS, { addedQeustion: questionIdx }));
    }


}
