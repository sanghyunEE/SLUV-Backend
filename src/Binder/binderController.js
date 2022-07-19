const jwtMiddleware = require("../../config/jwtMiddleware");
const binderProvider = require("./binderProvider");
const binderService = require("./binderService");
const baseResponse = require("../../config/baseResponseStatus");
const { response, errResponse } = require("../../config/response");
const regexEmail = require("regex-email");
const { emit } = require("nodemon");
require('dotenv').config()
const crypto = require("crypto");


// 7.1 바인더 생성 API
exports.postBinders = async function (req, res) {

  const { isBasic, name, coverImgUrl } = req.body;
  const userIdxFromJWT = req.verifiedToken.userIdx;

  if (!isBasic || !name) {
    return res.send(errResponse(baseResponse.API_PARAMETER_EMPTY));
  }

  const createBinderResponse = await binderService.createBinder(
    userIdxFromJWT,
    isBasic,
    name,
    coverImgUrl
  );

  return res.send(createBinderResponse);
}

// 7.2 해당 아이템 특정 바인더에 찜 추가 API
exports.postDibs = async function (req, res) {
  const { itemIdx, binderIdx } = req.body;

  if (!itemIdx || !binderIdx) {
    return res.send(errResponse(baseResponse.API_PARAMETER_EMPTY));
  }

  const createDibsResponse = await binderService.createDib(
    itemIdx,
    binderIdx
  )

  return res.send(createDibsResponse);
}

// 7.3 바인더 목록 조회 API
exports.getBinders = async function (req, res) {
  const userIdxFromJWT = req.verifiedToken.userIdx;

  const binderListResult = await binderProvider.retrieveBinderList(userIdxFromJWT);

  return res.send(response(baseResponse.SUCCESS, binderListResult));
}

// 7.4 해당 바인더의 찜 아이템 목록 조회
exports.getDibs = async function (req, res) {
  const { binderIdx } = req.params;

  if (!binderIdx) {
    return res.send(errResponse(baseResponse.BINDER_IDX_EMPTY));
  }

  const dibListResult = await binderProvider.retrieveDibList(binderIdx);

  return res.send(response(baseResponse.SUCCESS, dibListResult));
}

// 7.5 해당 바인더의 찜 아이템 목록 삭제(=수정)
exports.patchDibsStatus = async function (req, res) {
  const { binderIdx } = req.params;
  const { itemIdxList } = req.body;

  if (!binderIdx) {
    return res.send(errResponse(baseResponse.BINDER_IDX_EMPTY));
  } else if (itemIdxList.length == 0) {
    return res.send(errResponse(baseResponse.API_PARAMETER_EMPTY));
  }

  const editDibsStatusResponse = await binderService.editDibsStatus(binderIdx, itemIdxList);
  // console.log(editDibsStatusResponse)
  return res.send(editDibsStatusResponse);
}


// 7.6 찜 아이템 다른 바인더로 이동시키기
exports.patchDibsBinderIdx = async function (req, res) {
  console.log(req.params);
  console.log(req.body);
  const { fromBinderIdx, toBinderIdx } = req.params;
  const { itemIdxList } = req.body;

  if (!fromBinderIdx || !toBinderIdx) {
    return res.send(errResponse(baseResponse.BINDER_IDX_EMPTY));
  } else if (itemIdxList.length == 0) {
    return res.send(errResponse(baseResponse.API_PARAMETER_EMPTY));
  }

  const editDibsBinderIdxResponse = await binderService.editDibsBinderIdx(
    fromBinderIdx,
    toBinderIdx,
    itemIdxList
  )
  return res.send(editDibsBinderIdxResponse);

}

// 7.7 바인더 수정
exports.patchBinders = async function (req, res) {
  const { binderIdx } = req.params;
  const { coverImgUrl, name } = req.body;

  console.log(coverImgUrl, name, "binderIdx : ", binderIdx);
  console.log(typeof (coverImgUrl), typeof (name));

  if (binderIdx == null) { // 형식적 처리 !binderIdx
    return res.send(errResponse(baseResponse.BINDER_IDX_EMPTY));
  } else if (name == null) { // 형식적 처리
    return res.send(errResponse(baseResponse.API_PARAMETER_EMPTY));
  }

  const editBinderResponse = await binderService.editBinder(binderIdx, coverImgUrl, name);


  return res.send(editBinderResponse);
}

// 7.8 바인더 삭제
exports.patchBinderStatus = async function (req, res) {
  const { binderIdx } = req.params;
  if (!binderIdx) { // 형식적 처리
    return res.send(errResponse(baseResponse.BINDER_IDX_EMPTY));
  }

  const editBinderStatusResponse = await binderService.editBinderStatus(Number(binderIdx));
  return res.send(editBinderStatusResponse);

}


// 7.9 아이템 찜 취소
exports.deleteDib = async function (req, res) {
  const userIdx = req.verifiedToken.userIdx;
  const itemIdx = req.params.itemIdx;
  if (!itemIdx) {
    return res.send(errResponse(baseResponse.ITEM_IDX_EMPTY));
  }

  const deleteDibResponse = await binderService.deleteDib(userIdx, itemIdx);
  return res.send(deleteDibResponse);

}
