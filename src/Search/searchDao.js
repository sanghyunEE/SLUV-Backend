// 셀럽 or 멤버 매칭되는거 있는지 
async function selectName(connection, selectParams) {
    const selectNameQuery = `
        select C.celebIdx,
            M.memberIdx,
            C.name as celebName,
            M.name as memberName
        from Celeb as C
            left join Member as M on M.celebIdx = C.celebIdx
        where C.name like ? or M.name like ?
    `;
    const [matchRows] = await connection.query(selectNameQuery, selectParams);
    return matchRows;
}

// 브랜드 매칭되는거 있는지
async function selectBrand(connection, word) {
    const selectBrandQuery = `
    select B.brandIdx,
        B.brandKr
    from Brand as B
    where B.brandKr like ?        
    `;
    const [mathRow] = await connection.query(selectBrandQuery, word);
    return mathRow;
}

async function selectSearchItemCount(connection, userIdx, celebName, memberName, parentCategory, subCategory, brandKr) {
    const firstQuery = `
        select count(*) as count
        from Item as I
                left join (select B.userIdx, D.itemIdx from Dib as D join Binder as B on B.binderIdx = D.binderIdx and B.userIdx = ${userIdx}) as IsD on IsD.itemIdx = I.itemIdx
                join ItemImg as II on I.itemIdx = II.itemIdx and II.isRepresent = 1
                join Celeb as C on C.celebIdx = I.celebIdx
                left join Member as M on M.memberIdx = I.memberIdx
                join Brand as BR on BR.brandIdx = I.brandIdx`;
    let whereQuery = '\nwhere';
    if (celebName != '') {
        whereQuery = whereQuery + " C.name = '" + celebName + "' and ";
        // console.log(whereQuery);
    }
    if (memberName != '') {
        whereQuery = whereQuery + " M.name = '" + memberName + "' and ";
        // console.log(whereQuery);
    }
    if (parentCategory != '') {
        whereQuery = whereQuery + " I.parentCategory = '" + parentCategory + "' and ";
    }
    if (subCategory != '') {
        whereQuery = whereQuery + " I.subCategory = '" + subCategory + "' and ";
    }
    if (brandKr != '') {
        whereQuery = whereQuery + " BR.brandKr = '" + brandKr + "'";
    } else {
        whereQuery = whereQuery.substring(0, whereQuery.length - 4);
    }

    // whereQuery = `M.name = '${memberName}' and I.parentCategory = '${parentCategory}'`
    const lastQuery = `\norder by I.createdAt desc\n`


    const selectSearchItemQuery = firstQuery + whereQuery + lastQuery;
    // console.log(selectSearchItemQuery)

    const [itemRows] = await connection.query(selectSearchItemQuery);
    return itemRows;
}


async function selectSearchItem(connection, userIdx, celebName, memberName, parentCategory, subCategory, brandKr, page, pageSize) {
    const firstQuery = `
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
            I.name as itemName,
            U.nickName as nickName,
            U.profileImgUrl as profileImgUrl,
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
	    end as uploadTime
        from Item as I
                left join (select B.userIdx, D.itemIdx from Dib as D join Binder as B on B.binderIdx = D.binderIdx and B.userIdx = ${userIdx}) as IsD on IsD.itemIdx = I.itemIdx
                join ItemImg as II on I.itemIdx = II.itemIdx and II.isRepresent = 1
                join Celeb as C on C.celebIdx = I.celebIdx
                left join Member as M on M.memberIdx = I.memberIdx
                join Brand as BR on BR.brandIdx = I.brandIdx
                join User U on I.userIdx = U.userIdx`;
    let whereQuery = '\nwhere';
    if (celebName != '') {
        whereQuery = whereQuery + " C.name = '" + celebName + "' and ";
        // console.log(whereQuery);
    }
    if (memberName != '') {
        whereQuery = whereQuery + " M.name = '" + memberName + "' and ";
        // console.log(whereQuery);
    }
    if (parentCategory != '') {
        whereQuery = whereQuery + " I.parentCategory = '" + parentCategory + "' and ";
    }
    if (subCategory != '') {
        whereQuery = whereQuery + " I.subCategory = '" + subCategory + "' and ";
    }
    if (brandKr != '') {
        whereQuery = whereQuery + " BR.brandKr = '" + brandKr + "'";
    } else {
        whereQuery = whereQuery.substring(0, whereQuery.length - 4);
    }

    // whereQuery = `M.name = '${memberName}' and I.parentCategory = '${parentCategory}'`
    const lastQuery = `\norder by I.createdAt desc\n`


    const selectSearchItemQuery = firstQuery + whereQuery + lastQuery + `limit ${page}, ${pageSize};`;
    console.log(selectSearchItemQuery)

    const [itemRows] = await connection.query(selectSearchItemQuery);
    return itemRows;
}

async function selectDailyWord(connection) {
    const selectDailyWordQuery = `
        select S.searchWord,
            count(searchWord) as count,
            concat(current_date, ' 00:00 기준') as standard
        from Search as S
        where S.createdAt
            between date_add(concat(substring_index(current_timestamp, ' ', 1), ' 00:00:00'), interval -1 day)
                and concat(substring_index(current_timestamp, ' ', 1), ' 00:00:00')
        group by S.searchWord
        order by count desc, S.createdAt desc
        limit 10;
    `;
    const [wordRows] = await connection.query(selectDailyWordQuery);
    return wordRows;
}

async function selectMonthlyWord(connection) {
    const selectMonthlyWordQuery = `
        select S.searchWord,
            count(searchWord) as count
        from Search as S
        where S.createdAt
            between date_add(concat(substring_index(current_timestamp, ' ', 1), ' 00:00:00'), interval -1 month)
                and concat(substring_index(current_timestamp, ' ', 1), ' 00:00:00')
        group by S.searchWord
        order by count desc, S.createdAt desc
        limit 10;            
    `;
    const [wordRows] = await connection.query(selectMonthlyWordQuery);
    return wordRows;
}
async function selectRecentWord(connection, userIdx) {
    const selectRecentWordQuery = `
        select RS.searchWord,
                RS.recentSearchIdx
        from RecentSearch as RS
            join User as U on U.userIdx = RS.userIdx
        where U.userIdx = ${userIdx}
        order by RS.createdAt desc
        limit 15        
    `;
    const [wordRows] = await connection.query(selectRecentWordQuery);
    return wordRows;
}

async function deleteRecentWord(connection, recentSearchIdx) {
    const deleteRecentWordQuery = `
        delete from RecentSearch
        where recentSearchIdx = ${recentSearchIdx};
    `;
    const deleteRow = await connection.query(deleteRecentWordQuery);
    return deleteRow;
}

async function deleteAllRecentWord(connection, userIdx) {
    const deleteAllRecentWordQuery = `
        delete from RecentSearch
        where userIdx = ${userIdx};
    `;
    const deleteRow = await connection.query(deleteAllRecentWordQuery);
    return deleteRow;
}

async function insertSearchWord(connection, insertParams) {
    const insertSearchWordQuery = `
        INSERT INTO Search(userIdx, searchWord)
        VALUES (?, ?);
    `;
    console.log(insertSearchWordQuery);
    const insertRow = await connection.query(insertSearchWordQuery, insertParams);
    return insertRow;
}

async function insertRecentWord(connection, insertParams) {
    const insertRecentWordQuery = `
        INSERT INTO RecentSearch(userIdx, searchWord)
        VALUES (?, ?);
    `;
    console.log(insertRecentWordQuery);
    const insertRow = await connection.query(insertRecentWordQuery, insertParams);
    return insertRow;
}

async function recentWordCheck(connection, selectParams) {
    const recentWordCheckQuery = `
        select *
        from RecentSearch as RS
        where RS.userIdx = ? and RS.searchWord = ?;
    `;

    const [checkRows] = await connection.query(recentWordCheckQuery, selectParams);
    return checkRows;
}

async function selectSearchItemOnFiterCount(connection, userIdx, celebName, memberName, parentCategory, subCategory, brandKr, price) {
    const firstQuery = `
        select count(*) as count
        from Item as I
                left join (select B.userIdx, D.itemIdx from Dib as D join Binder as B on B.binderIdx = D.binderIdx and B.userIdx = ${userIdx}) as IsD on IsD.itemIdx = I.itemIdx
                join ItemImg as II on I.itemIdx = II.itemIdx and II.isRepresent = 1
                join Celeb as C on C.celebIdx = I.celebIdx
                left join Member as M on M.memberIdx = I.memberIdx
                join Brand as BR on BR.brandIdx = I.brandIdx`;
    let whereQuery = '\nwhere';
    if (celebName != '') {
        whereQuery = whereQuery + " C.name = '" + celebName + "' and ";
        // console.log(whereQuery);
    }
    if (memberName != '') {
        whereQuery = whereQuery + " M.name = '" + memberName + "' and ";
        // console.log(whereQuery);
    }
    if (parentCategory != '') {
        whereQuery = whereQuery + " I.parentCategory = '" + parentCategory + "' and ";
    }
    if (subCategory != '') {
        whereQuery = whereQuery + `I.subCategory ${subCategory} and`;
    }
    if (price != '') {
        whereQuery = whereQuery + ` I.price ${price} and `;
    }
    if (brandKr != '') {
        whereQuery = whereQuery + " BR.brandKr = '" + brandKr + "'";
    } else {
        whereQuery = whereQuery.substring(0, whereQuery.length - 4);
    }

    // whereQuery = `M.name = '${memberName}' and I.parentCategory = '${parentCategory}'`
    const lastQuery = `\norder by I.createdAt desc\n`


    const selectSearchItemQuery = firstQuery + whereQuery + lastQuery;
    // console.log(selectSearchItemQuery);
    const [itemRows] = await connection.query(selectSearchItemQuery);
    return itemRows;
}

async function selectSearchItemOnFiterLatest(connection, userIdx, celebName, memberName, parentCategory, subCategory, brandKr, price, page, pageSize) {
    const firstQuery = `
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
            I.name as itemName,
            U.nickName as nickName,
            U.profileImgUrl as profileImgUrl,
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
	    end as uploadTime
        from Item as I
                left join (select B.userIdx, D.itemIdx from Dib as D join Binder as B on B.binderIdx = D.binderIdx and B.userIdx = ${userIdx}) as IsD on IsD.itemIdx = I.itemIdx
                join ItemImg as II on I.itemIdx = II.itemIdx and II.isRepresent = 1
                join Celeb as C on C.celebIdx = I.celebIdx
                left join Member as M on M.memberIdx = I.memberIdx
                join Brand as BR on BR.brandIdx = I.brandIdx
                join User U on I.userIdx = U.userIdx`;
    let whereQuery = '\nwhere';
    if (celebName != '') {
        whereQuery = whereQuery + " C.name = '" + celebName + "' and ";
        // console.log(whereQuery);
    }
    if (memberName != '') {
        whereQuery = whereQuery + " M.name = '" + memberName + "' and ";
        // console.log(whereQuery);
    }
    if (parentCategory != '') {
        whereQuery = whereQuery + " I.parentCategory = '" + parentCategory + "' and ";
    }
    if (subCategory != '') {
        whereQuery = whereQuery + `I.subCategory ${subCategory} and`;
    }
    if (price != '') {
        whereQuery = whereQuery + ` I.price ${price} and `;
    }
    if (brandKr != '') {
        whereQuery = whereQuery + " BR.brandKr = '" + brandKr + "'";
    } else {
        whereQuery = whereQuery.substring(0, whereQuery.length - 4);
    }

    // whereQuery = `M.name = '${memberName}' and I.parentCategory = '${parentCategory}'`
    const lastQuery = `\norder by I.createdAt desc\n`


    const selectSearchItemQuery = firstQuery + whereQuery + lastQuery + `limit ${page}, ${pageSize};`;
    // console.log(selectSearchItemQuery)

    const [itemRows] = await connection.query(selectSearchItemQuery);
    return itemRows;
}

async function selectSearchItemOnFiterHot(connection, userIdx, celebName, memberName, parentCategory, subCategory, brandKr, price, page, pageSize) {
    const firstQuery = `
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
            I.name as itemName,
            U.nickName as nickName,
            U.profileImgUrl as profileImgUrl,
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
        If(ilrank is null, 0, ilrank) as ilcnt,
        If(drank is null, 0, drank) as dcnt
        from Item as I
                left join (select B.userIdx, D.itemIdx from Dib as D join Binder as B on B.binderIdx = D.binderIdx and B.userIdx = ${userIdx}) as IsD on IsD.itemIdx = I.itemIdx
                join ItemImg as II on I.itemIdx = II.itemIdx and II.isRepresent = 1
                join Celeb as C on C.celebIdx = I.celebIdx
                left join Member as M on M.memberIdx = I.memberIdx
                join Brand as BR on BR.brandIdx = I.brandIdx
                join User U on I.userIdx = U.userIdx
                left join (select itemIdx, count(itemIdx) as ilrank from ItemLike group by itemIdx order by count(itemIdx) DESC ) ILrank on I.itemIdx = ILrank.itemIdx
                left join (select D.itemIdx, count(D.itemIdx) as drank  from Dib as D group by D.itemIdx order by  count(D.itemIdx) DESC) Drank on Drank.itemIdx = I.itemIdx
                `;
    let whereQuery = '\nwhere';
    if (celebName != '') {
        whereQuery = whereQuery + " C.name = '" + celebName + "' and ";
        // console.log(whereQuery);
    }
    if (memberName != '') {
        whereQuery = whereQuery + " M.name = '" + memberName + "' and ";
        // console.log(whereQuery);
    }
    if (parentCategory != '') {
        whereQuery = whereQuery + " I.parentCategory = '" + parentCategory + "' and ";
    }
    if (subCategory != '') {
        whereQuery = whereQuery + `I.subCategory ${subCategory} and`;
    }
    if (price != '') {
        whereQuery = whereQuery + ` I.price ${price} and `;
    }
    if (brandKr != '') {
        whereQuery = whereQuery + " BR.brandKr = '" + brandKr + "'";
    } else {
        whereQuery = whereQuery.substring(0, whereQuery.length - 4);
    }

    // whereQuery = `M.name = '${memberName}' and I.parentCategory = '${parentCategory}'`
    const lastQuery = `\norder by ilcnt*0.7 + dcnt*0.3 DESC\n`


    const selectSearchItemQuery = firstQuery + whereQuery + lastQuery + `limit ${page}, ${pageSize};`;
    console.log(selectSearchItemQuery)

    const [itemRows] = await connection.query(selectSearchItemQuery);
    return itemRows;
}

async function searchWordCheck(connection, selectParams) {
    const recentWordCheckQuery = `
        select *
        from Search as S
        where S.userIdx = ? and S.searchWord = ?;
    `;

    const [checkRows] = await connection.query(recentWordCheckQuery, selectParams);
    return checkRows;
}


module.exports = {
    selectName,
    selectBrand,
    selectSearchItemCount,
    selectSearchItem,
    selectDailyWord,
    selectMonthlyWord,
    selectRecentWord,
    deleteRecentWord,
    deleteAllRecentWord,
    insertSearchWord,
    insertRecentWord,
    recentWordCheck,
    selectSearchItemOnFiterCount,
    selectSearchItemOnFiterLatest,
    selectSearchItemOnFiterHot,
    searchWordCheck,



};


