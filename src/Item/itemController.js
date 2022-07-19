const jwtMiddleware = require("../../config/jwtMiddleware");
const itemProvider = require("./itemProvider");
const itemService = require("./itemService");
const baseResponse = require("../../config/baseResponseStatus");
const { response, errResponse } = require("../../config/response");
const { application } = require("express");
require('dotenv').config()


// 브랜드 리스트 조회
exports.getBrands = async function (req, res) {
    const brandResult = await itemProvider.retrieveBrandList();
    return res.send(response(baseResponse.SUCCESS, brandResult));
}

// 4.1 정보공유하기 (아이템 정보 업로드)
exports.postItems = async function (req, res) {
    const { celebIdx, memberIdx, parentCategory, subCategory, brandIdx, name, whenDiscovery, whereDiscovery, price, content, sellerSite, itemImgUrlList } = req.body;
    if (!celebIdx || !parentCategory || !brandIdx || !name || !whenDiscovery || !whereDiscovery || !price || !itemImgUrlList) {
        return res.send(errResponse(baseResponse.API_PARAMETER_EMPTY));
    }
    const userIdxFromJWT = req.verifiedToken.userIdx;

    const postItemsResponse = await itemService.createItem(
        userIdxFromJWT,
        celebIdx,
        memberIdx,
        parentCategory,
        subCategory,
        brandIdx,
        name,
        whenDiscovery,
        whereDiscovery,
        price,
        content,
        sellerSite
    );
    if (postItemsResponse.code != 1000) {
        return res.send(postItemsResponse);
    }

    const itemIdx = postItemsResponse.result.itemIdx;


    const postItemImgResponse = await itemService.createItemImgs(itemIdx, itemImgUrlList);



    if (postItemImgResponse.code != 1000) {
        return res.send(postItemImgResponse);
    } else {
        return res.send(response(baseResponse.SUCCESS, { addedItem: itemIdx }));
    }


}


// 8.1 해당 아이템 상세보기
exports.getItemByIdx = async function (req, res) {
    //   const userIdxFromJWT = req.verifiedToken.userIdx;
    let userIdxFromJWT = req.query.userIdx;
    const itemIdx = req.params.itemIdx;
    if (!userIdxFromJWT) {
        console.log("비로그인 유저입니다.");
        userIdxFromJWT = 0;
    }

    if (!itemIdx) {
        return res.send(response(baseResponse.ITEM_IDX_EMPTY));
    }
    //최근 본 아이템에 넣어야죠.
    if (userIdxFromJWT != 0) {
        const recentItemResult = await itemService.createRecentItem(userIdxFromJWT, itemIdx);
    }



    const itemInfo = await itemProvider.retrieveItemInfo(userIdxFromJWT, itemIdx);
    const celebIdx = itemInfo.celebIdx;
    const memberIdx = itemInfo.memberIdx;
    console.log(celebIdx, memberIdx);
    const sameCelebItems = await itemProvider.retrieveSameCelebItems(userIdxFromJWT, itemIdx, celebIdx, memberIdx);
    const otherUserDibItems = await itemProvider.retrieveOtherUserDibItems(userIdxFromJWT, itemIdx);
    const sameBrandItems = await itemProvider.retrieveSameBrandItems(userIdxFromJWT, itemIdx);

    return res.send(response(baseResponse.SUCCESS, {
        itemInfo: itemInfo,
        sameCelebItemList: sameCelebItems,
        otherUserDibItemList: otherUserDibItems,
        sameBrandItemList: sameBrandItems
    }));


}

// 8.2 해당 아이템 좋아요
exports.postItemLike = async function (req, res) {
    const userIdx = req.verifiedToken.userIdx;
    const itemIdx = req.params.itemIdx;
    if (!itemIdx) {
        return res.send(response(baseResponse.ITEM_IDX_EMPTY));
    }

    const itemLikeResponse = await itemService.createItemLike(userIdx, itemIdx);
    return res.send(itemLikeResponse);
}

// 8.3 해당 아이템 좋아요 취소
exports.deleteItemLike = async function (req, res) {
    const userIdx = req.verifiedToken.userIdx;
    const itemIdx = req.params.itemIdx;
    if (!itemIdx) {
        return res.send(response(baseResponse.ITEM_IDX_EMPTY));
    }
    const unikeResponse = await itemService.deleteItemLike(userIdx, itemIdx);
    return res.send(unikeResponse);
}


// 8.4 해당 아이템 수정하기
exports.editItems = async function (req, res) {
    const { itemIdx } = req.params;
    if (!itemIdx) {
        return res.send(errResponse(baseResponse.ITEM_IDX_EMPTY));
    }
    const { parentCategory, subCategory, brandIdx, name, whenDiscovery, whereDiscovery, price, content, sellerSite, itemImgUrlList } = req.body;
    if (!parentCategory || !brandIdx || !name || !whenDiscovery || !whereDiscovery || !price || !itemImgUrlList) {
        return res.send(errResponse(baseResponse.API_PARAMETER_EMPTY));
    }
    const editItmeResponse = await itemService.editItem(
        itemIdx,
        parentCategory,
        subCategory,
        brandIdx,
        name,
        whenDiscovery,
        whereDiscovery,
        price,
        content,
        sellerSite,
        itemImgUrlList

    )

    const postItemImgResponse = await itemService.createItemImgs(itemIdx, itemImgUrlList);

    return res.send(editItmeResponse);
}


// 8.5 해당 아이템 삭제하기
exports.deleteItems = async function (req, res) {
    const { itemIdx } = req.params;
    if (!itemIdx) {
        return res.send(errResponse(baseResponse.ITEM_IDX_EMPTY));
    }

    const deleteItemResponse = await itemService.deleteItem(itemIdx);
    return res.send(deleteItemResponse);

}

// 8.7 게시글 신고하기
exports.reportItems = async function (req, res) {
    const reporterIdx = req.verifiedToken.userIdx; // 신고 하는 유저
    const itemIdx = req.params.itemIdx; // 신고 당하는 게시글
    if (!itemIdx) {
        return res.send(errResponse(baseResponse.ITEM_IDX_EMPTY));
    }
    const { category, content } = req.body;
    if (!category) {
        return res.send(errResponse(baseResponse.API_PARAMETER_EMPTY));
    }

    const reportItemResponse = await itemService.reportItem(reporterIdx, itemIdx, category, content);
    return res.send(reportItemResponse);
}

// 8.8 게시글 수정 요청하기
exports.requestItemEdit = async function (req, res) {
    const requesterIdx = req.verifiedToken.userIdx; // 수정 요청 유저
    const itemIdx = req.params.itemIdx; // 수정 요청 당하는 게시글
    if (!itemIdx) {
        return res.send(errResponse(baseResponse.ITEM_IDX_EMPTY));
    }
    const { category, content } = req.body;
    if (!category) {
        return res.send(errResponse(baseResponse.API_PARAMETER_EMPTY));
    }

    const requestItemEditResponse = await itemService.requestItemEdit(requesterIdx, itemIdx, category, content);
    return res.send(requestItemEditResponse);
}
