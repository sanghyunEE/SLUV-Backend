const { API_QUERYSTRING_EMPTY } = require("../../config/baseResponseStatus");

async function selectBrandInfo(connection) {
    const selectBrandInfoQuery = `
        SELECT brandIdx, brandKr, brandEn 
        FROM Brand
        order by brandKr;
  `;

    const selectBrandInfoRows = await connection.query(
        selectBrandInfoQuery
    );

    return selectBrandInfoRows
}


async function insertItemInfo(connection, insertPrams) {
    const insertItemInfoQuery = `
    INSERT INTO Item(userIdx, celebIdx, memberIdx, parentCategory, subCategory, brandIdx, name, whenDiscovery, whereDiscovery, price, content, sellerSite)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

    const insertItemInfoRow = await connection.query(
        insertItemInfoQuery,
        insertPrams
    );

    return insertItemInfoRow;

}

async function insertItemImgs(connection, insertParamsList) {
    const insertItemImgsQuery = `
    INSERT INTO ItemImg (itemIdx, isRepresent, itemImgUrl)
    VALUES ?
  `
    const insertItemImgsRow = await connection.query(
        insertItemImgsQuery,
        [insertParamsList]
    );

    return insertItemImgsRow;
}

async function selectItemInfo(connection, userIdx, itemIdx) {
    const selectItemInfoQuery = `
    # // itemImgUrl 빼고 itemInfo 다 가져오기
select	I.itemIdx as itemIdx,
		I.parentCategory as parentCategory,
        I.subCategory as subCategory,
        I.celebIdx as celebIdx,
        C.name as celebName,
        I.memberIdx as memberIdx,
        M.name as memberName,
        B.brandIdx as brandIdx,
        B.brandKr as brandKr,
        I.name as itemName,
        I.whenDiscovery as whenDiscovery,
        I.whereDiscovery as whereDiscovery,
        I.price as priceNumber,
        case
			when I.price = 1
				then "5만원 이하"
			when I.price = 2
				then "5만원 ~ 10만원"
			when I.price = 3
				then "10만원 ~ 20만원"
			when I.price = 4
				then "20만원 ~ 30만원"
            when I.price = 5
				then "30만원 이상"
		end as price,
		I.content as content,
		I.sellerSite as sellerSite,
        if(IsL.userIdx is null, 'N', 'Y') as isLike,
        if(itemLikeCnt is null, 0, itemLikeCnt) as itemLikeCnt,
        if(IsD.userIdx is null, 'N', 'Y') as isDib,
        if(dibCnt is null, 0, dibCnt) as dibCnt,
        I.userIdx as uploaderIdx,
        U.nickName as nickName,
        case
            when U.registerType = 'LOCAL'
                then concat('@', substring(U.email, 1 ,instr(U.email, '@')-1))
            when U.registerType = 'KAKAO'
                then concat('@', substring(U.snsEmail, 1 ,instr(U.snsEmail, '@')-1))
            when U.registerType = 'GOOGLE'
                then concat('@', substring(U.snsEmail, 1 ,instr(U.snsEmail, '@')-1))
        end as id,
        case
	        when timestampdiff(second, I.createdAt, current_timestamp) < 60
	            then concat(timestampdiff(second, I.createdAt, current_timestamp), '초 전')
	        when timestampdiff(minute , I.createdAt, current_timestamp) < 60
	            then concat(timestampdiff(minute, I.createdAt, current_timestamp), '분 전')
	        when timestampdiff(hour , I.createdAt, current_timestamp) < 24
	            then concat(timestampdiff(hour, I.createdAt, current_timestamp), '시간 전')
	        when timestampdiff(day , I.createdAt, current_timestamp) < 365
	            then concat(timestampdiff(day, I.createdAt, current_timestamp), '일 전')
	        else timestampdiff(year , I.createdAt, current_timestamp)
	    end as uploadTime,
        IF(IsF.followerIdx is not null, 'Y', 'N') as isFollow,
        if(I.userIdx = ${userIdx}, 'Y', 'N') as isMe,
        U.profileImgUrl
from Item as I
	left join (select * from ItemLike as IL where IL.userIdx = ${userIdx}) as IsL on IsL.itemIdx = I.itemIdx
    left join (select B.userIdx, D.itemIdx from Dib as D join Binder as B on B.binderIdx = D.binderIdx and B.userIdx = ${userIdx}) as IsD on IsD.itemIdx = I.itemIdx
    left join (select itemIdx, count(itemLikeIdx) as itemLikeCnt from ItemLike group by itemIdx) as Icnt on Icnt.itemIdx = I.itemIdx
    left join (select itemIdx, count(dibIdx) as dibCnt from Dib group by itemIdx) as Dcnt on Dcnt.itemIdx = I.itemIdx
	join Celeb as C on C.celebIdx = I.celebIdx
    left join Member as M on M.memberIdx = I.memberIdx
    join Brand as B on B.brandIdx = I.brandIdx
    join User U on I.userIdx = U.userIdx
    left join (select F.followIdx, F.followeeIdx, F.followerIdx from Follow as F where F.followerIdx = ${userIdx}) as IsF on IsF.followeeIdx = U.userIdx
where I.itemIdx = ${itemIdx};
  `;
    const [itemInfoRow] = await connection.query(selectItemInfoQuery);

    return itemInfoRow;
}

async function selectItemImgs(connection, itemIdx) {
    const selectItemImgsQuery = `
    select II.itemImgUrl, II.isRepresent
    from ItemImg as II
    where II.itemIdx = ${itemIdx};
    `;

    const [itemImgRows] = await connection.query(selectItemImgsQuery);
    return itemImgRows;
}

async function selectSameCelebItems(connection, userIdx, celebIdx, itemIdx) {
    const selectSameCelebItemsQuery = `
        select I.itemIdx,
                II.itemImgUrl,
                C.name as name,
                if(IsD.userIdx is null, 'N', 'Y') as isDib,
                B.brandKr as brandKr,
                I.name as itemName
        from Item as I
            left join (select B.userIdx, D.itemIdx from Dib as D join Binder as B on B.binderIdx = D.binderIdx and B.userIdx = ${userIdx}) as IsD on IsD.itemIdx = I.itemIdx
            join ItemImg as II on I.itemIdx = II.itemIdx
            join Celeb as C on C.celebIdx = I.celebIdx
            join Brand as B on B.brandIdx = I.brandIdx
        where I.celebIdx = ${celebIdx} and II.isRepresent = 1 and I.itemIdx != ${itemIdx} 
        order by I.createdAt DESC 
        limit 10;
    `;
    const [itemRows] = await connection.query(selectSameCelebItemsQuery);
    return itemRows;
}

async function selectSameMemberItems(connection, userIdx, memberIdx, itemIdx) {
    const selectSameMemberItemsQuery = `
        select I.itemIdx,
            II.itemImgUrl,
            M.name as name,
            if(IsD.userIdx is null, 'N', 'Y') as isDib,
            B.brandKr as brandKr,
            I.name as itemName
        from Item as I
            left join (select B.userIdx, D.itemIdx from Dib as D join Binder as B on B.binderIdx = D.binderIdx and B.userIdx = ${userIdx}) as IsD on IsD.itemIdx = I.itemIdx
            join ItemImg as II on I.itemIdx = II.itemIdx
            join Member M on I.memberIdx = M.memberIdx
            join Celeb as C on C.celebIdx = M.celebIdx
            join Brand as B on B.brandIdx = I.brandIdx
        where I.memberIdx = ${memberIdx} and II.isRepresent = 1 and I.itemIdx != ${itemIdx}
        group by itemIdx
        order by I.createdAt DESC 
        limit 10;
    `;

    const [itemRows] = await connection.query(selectSameMemberItemsQuery);
    return itemRows;
}

async function selectOtherUser(connection, itemIdx) {
    const selectOtherUser = `
        select B.userIdx
        from Item as I
            join Dib as D on D.itemIdx = I.itemIdx
            join Binder as B on B.binderIdx = D.binderIdx
        where I.itemIdx = ${itemIdx};
    `;

    const [userRows] = await connection.query(selectOtherUser);
    return userRows;
}

async function selectOtherUserDibItems(connection, userIdx, otherUserIdx) {
    const selectOtherUserDibItemsQuery = `
        select I.itemIdx,
            II.itemImgUrl,
            case
                when I.memberIdx is null
                    then C.name
                else
                    M.name
            end as name,
            if(IsD.userIdx is null, 'N', 'Y') as isDib,
            Br.brandKr,
            I.name as itemName
        from Item as I
            left join (select B.userIdx, D.itemIdx from Dib as D join Binder as B on B.binderIdx = D.binderIdx and B.userIdx = ${userIdx}) as IsD on IsD.itemIdx = I.itemIdx
            join Dib as D on D.itemIdx = I.itemIdx
            join Binder as B on B.binderIdx = D.binderIdx
            join ItemImg as II on II.itemIdx = I.itemIdx
            join Celeb C on I.celebIdx = C.celebIdx
            left join Member M on M.memberIdx = I.memberIdx
            join Brand as Br on Br.brandIdx = I.brandIdx
        where B.userIdx = ${otherUserIdx} and II.isRepresent = 1
        order by I.createdAt desc        
    `;

    const [itemRows] = await await connection.query(selectOtherUserDibItemsQuery);
    return itemRows;


}

async function selectSameBrandItems(connection, userIdx, itemIdx) {
    const selectSameBrandItemsQuery = `
        select I.itemIdx,
            II.itemImgUrl,
            case
                when I.memberIdx is null
                    then C.name
                else
                    M.name
            end as name,
            if(IsD.userIdx is null, 'N', 'Y') as isDib,
            BR.brandKr as brandKr,
            I.name as itemName
        from (select I.brandIdx
                from Item as I
                where I.itemIdx = ${itemIdx}) as IBR
                join Item as I on I.brandIdx = IBR.brandIdx
                left join (select B.userIdx, D.itemIdx from Dib as D join Binder as B on B.binderIdx = D.binderIdx and B.userIdx = ${userIdx}) as IsD on IsD.itemIdx = I.itemIdx
                join ItemImg II on I.itemIdx = II.itemIdx and II.isRepresent = 1
                join Celeb as C on C.celebIdx = I.celebIdx
                join Member as M on M.memberIdx = I.memberIdx
                join Brand as BR on BR.brandIdx = I.brandIdx
        where I.itemIdx != ${itemIdx}
        order by I.createdAt desc
        limit 10;
    `;
    const [itemRows] = await await connection.query(selectSameBrandItemsQuery);
    // console.log(itemRows)
    return itemRows;

}

async function selectOhterUserDibItems(connection, userIdx, itemIdx) {
    const selectOhterUserDibItemsQueyr = `
    select I.itemIdx,
                II.itemImgUrl,
                case
                    when I.memberIdx is null
                        then C.name
                    else
                        M.name
                end as name,
                if(IsD.userIdx is null, 'N', 'Y') as isDib,
                Br.brandKr,
                I.name as itemName
    from Item as I
                left join (select B.userIdx, D.itemIdx from Dib as D join Binder as B on B.binderIdx = D.binderIdx and B.userIdx = ${userIdx}) as IsD on IsD.itemIdx = I.itemIdx
                join Dib as D on D.itemIdx = I.itemIdx
                join Binder as B on B.binderIdx = D.binderIdx
                join ItemImg as II on II.itemIdx = I.itemIdx and II.isRepresent = 1
                join Celeb C on I.celebIdx = C.celebIdx
                left join Member M on M.memberIdx = I.memberIdx
                join Brand as Br on Br.brandIdx = I.brandIdx
                join (select B.userIdx, I.itemIdx
                        from Item as I
                            join Dib as D on D.itemIdx = I.itemIdx
                            join Binder as B on B.binderIdx = D.binderIdx
                        where I.itemIdx = ${itemIdx}) as DUSER on DUSER.userIdx = B.userIdx
    where I.itemIdx != ${itemIdx}
    group by I.itemIdx
    order by I.createdAt desc
    limit 10;
    `;
    const [itemRows] = await await connection.query(selectOhterUserDibItemsQueyr);
    return itemRows;
}

async function insertItemLike(connection, userIdx, itemIdx) {
    const insertItemLikeQuery = `
        INSERT INTO ItemLike (userIdx, itemIdx)
        VALUES (${userIdx}, ${itemIdx});
    `;

    const [likeRow] = await connection.query(insertItemLikeQuery);
    return likeRow;
}

async function deleteItemLike(connection, userIdx, itemIdx) {
    const deleteItemLikeQuery = `
        delete from ItemLike
        where userIdx = ${userIdx} and itemIdx = ${itemIdx};
    `;

    const [unlikeRow] = await connection.query(deleteItemLikeQuery);
    return unlikeRow;
}

async function patchItem(connection, itemIdx, patchParams) {
    const patchItemQuery = `
        UPDATE Item
        SET parentCategory = ?,
            subCategory = ?,
            brandIdx = ?,
            name = ?,
            whenDiscovery = ?,
            whereDiscovery = ?,
            price = ?,
            content = ?,
            sellerSite = ?
        WHERE itemIdx = ${itemIdx};
    `;

    const updateItemRow = await connection.query(patchItemQuery, patchParams);
    return updateItemRow;
}

async function deleteItemImg(connection, itemIdx) {
    const deleteItemImgQuery = `
        delete from ItemImg
        where itemIdx = ${itemIdx};
    `;

    const deleteRow = await connection.query(deleteItemImgQuery);
    return deleteRow;

}

async function deleteItem(connection, itemIdx) {
    const deleteItemQuery = `
        delete from Item
        where itemIdx = ${itemIdx};
    `;

    const deleteRow = await connection.query(deleteItemQuery);
    return deleteRow;
}

async function insertReportItem(connection, insertParams) {
    const insertReportItemQuery = `
        INSERT INTO ItemReport (reporterIdx, itemIdx, category, content)
        VALUES (?, ?, ?, ?);
    `;

    const reportRow = await connection.query(insertReportItemQuery, insertParams);
    return reportRow;
}

async function insertItemEditReq(connection, insertParams) {
    const insertItemEditReqQuery = `
        INSERT INTO ItemEditReq (requesterIdx, itemIdx, category, content)
        VALUES (?, ?, ?, ?);
    `;
    const requestRow = await connection.query(insertItemEditReqQuery, insertParams);
    return requestRow;

}

async function checkRecentItem(connection, userIdx, itemIdx) {
    const checkRecentItemQuery = `
    select *
    from RecentItem as RI
    where RI.userIdx = ${userIdx} and RI.itemIdx = ${itemIdx}
  `;
    const [recentItemRow] = await connection.query(checkRecentItemQuery);
    // console.log("test", recentItemRow)
    return recentItemRow;
}

async function deleteRecentItem(connection, recentIdx) {
    const deleteRecentItemQuery = `
    delete from RecentItem
    where recentIdx = ${recentIdx};
  `;
    const [deleteRow] = await connection.query(deleteRecentItemQuery);
    return deleteRow;
}


async function insertRecentItem(connection, insertParams) {
    const insertRecentItemQuery = `
    insert INTO RecentItem (userIdx, itemIdx)
    VALUES (?, ?);
  `;
    const insertRow = connection.query(insertRecentItemQuery, insertParams);
    return insertRow;
}

module.exports = {
    selectBrandInfo,
    insertItemInfo,
    insertItemImgs,
    selectItemInfo,
    selectItemImgs,
    selectSameCelebItems,
    selectSameMemberItems,
    selectOtherUser,
    selectOtherUserDibItems,
    selectSameBrandItems,
    selectOhterUserDibItems,
    insertItemLike,
    deleteItemLike,
    patchItem,
    deleteItemImg,
    deleteItem,
    insertReportItem,
    insertItemEditReq,
    checkRecentItem,
    deleteRecentItem,
    insertRecentItem,

};