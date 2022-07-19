

// 이벤트 정보 조회
async function selectEvents(connection) {
  const selectEventsQuery = `
    SELECT eventIdx, eventImgUrl, title, content
    FROM Event
  `

  const [eventRows] = await connection.query(selectEventsQuery);

  return eventRows;
}


// 해당 셀럽과 관련된 모든 아이템의 row 개수
async function selectCelebItemsCount(connection, celebIdx) {
  const selectCelebItemsCountQuery = `
        select count(itemIdx) as count
        from Item
        where celebIdx = ?;
    `;

  const [countRow] = await connection.query(selectCelebItemsCountQuery, celebIdx);
  return countRow;
}

//
async function selectCelebItemsLatest(connection, selcetParams) {
  const selectCelebItemsLatestQuery = `
        select  I.itemIdx as itemIdx,
                II.itemImgUrl as itemImgUrl,
                case
                    when I.memberIdx is null
                        then C.name
                    else
                        M.name
                end as name,
                IF(isDib = I.itemIdx, 'Y', 'N') as isDib,
                B.brandKr as brandKr,
                I.name as itemName,
                U.profileImgUrl,
                U.nickName as publisher,
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
            left join (select itemIdx, itemImgUrl from ItemImg where isRepresent = 1) as II on I.itemIdx = II.itemIdx
            left join Celeb as C on C.celebIdx = I.celebIdx
            left join Member as M on I.memberIdx = M.memberIdx
            left join Brand as B on B.brandIdx = I.brandIdx
            left join User as U on U.userIdx = I.userIdx
            left join (select B.binderIdx, B.userIdx, D.itemIdx as isDib from Binder as B join Dib D on B.binderIdx = D.binderIdx where B.userIdx = ?) as dib on isDib = I.itemIdx
        where I.celebIdx = ?
        order by I.createdAt DESC
        LIMIT ?, ?;
    `;
  const [itemRows] = await connection.query(selectCelebItemsLatestQuery, selcetParams);

  return itemRows;

}

async function selectCelebItemsHot(connection, selcetParams) {
  const selectCelebItemsHotQuery = `
            select  I.itemIdx as itemIdx,
                    II.itemImgUrl as itemImgUrl,
                    case
                        when I.memberIdx is null
                            then C.name
                        else
                            M.name
                    end as name,
                    IF(isDib = I.itemIdx, 'Y', 'N') as isDib,
                    B.brandKr as brandKr,
                    I.name as itemName,
                    U.profileImgUrl,
                    U.nickName as publisher,
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
                left join (select itemIdx, itemImgUrl from ItemImg where isRepresent = 1) as II on I.itemIdx = II.itemIdx
                left join Celeb as C on C.celebIdx = I.celebIdx
                left join Member as M on M.memberIdx = I.memberIdx
                left join Brand as B on B.brandIdx = I.brandIdx
                left join User as U on U.userIdx = I.userIdx
                left join (select B.binderIdx, B.userIdx, D.itemIdx as isDib from Binder as B join Dib D on B.binderIdx = D.binderIdx where B.userIdx = ?) as dib on isDib = I.itemIdx
                left join (select itemIdx, count(itemIdx) as ilrank from ItemLike group by itemIdx order by count(itemIdx) DESC ) ILrank on I.itemIdx = ILrank.itemIdx
                left join (select D.itemIdx, count(D.itemIdx) as drank  from Dib as D group by D.itemIdx order by  count(D.itemIdx) DESC) Drank on Drank.itemIdx = I.itemIdx
            where I.celebIdx = ? and TIMESTAMPDIFF(MONTH, I.createdAt, current_timestamp) < 1
            order by ilcnt*0.7 + dcnt*0.3 DESC
            LIMIT ?, ?;
    `
  const [itemRows] = await connection.query(selectCelebItemsHotQuery, selcetParams);

  return itemRows;
}

async function selectMemberItemsCount(connection, memberIdx) {
  const selectCelebItemsCountQuery = `
        select count(itemIdx) as count
        from Item
        where memberIdx = ?;
    `;

  const [countRow] = await connection.query(selectCelebItemsCountQuery, memberIdx);
  return countRow;
}

async function selectMemberItemsLatest(connection, selcetParams) {
  const selectMemberItemsLatestQuery = ` 
    select  I.itemIdx as itemIdx,
                II.itemImgUrl as itemImgUrl,
                M.name as name,
                IF(isDib = I.itemIdx, 'Y', 'N') as isDib,
                B.brandKr as brandKr,
                I.name as itemName,
                U.profileImgUrl,
                U.nickName as publisher,
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
            left join (select itemIdx, itemImgUrl from ItemImg where isRepresent = 1) as II on I.itemIdx = II.itemIdx
            left join Celeb as C on C.celebIdx = I.celebIdx
            left join Member as M on I.memberIdx = M.memberIdx
            left join Brand as B on B.brandIdx = I.brandIdx
            left join User as U on U.userIdx = I.userIdx
            left join (select B.binderIdx, B.userIdx, D.itemIdx as isDib from Binder as B join Dib D on B.binderIdx = D.binderIdx where B.userIdx = ?) as dib on isDib = I.itemIdx
        where I.memberIdx = ?
        order by I.createdAt DESC
        LIMIT ?, ?;
    `;
  const [itemRows] = await connection.query(selectMemberItemsLatestQuery, selcetParams);

  return itemRows;
}

async function selectMemberItemsHot(connection, selcetParams) {
  const selectMemberItemsHotQuery = ` 
    select  I.itemIdx as itemIdx,
                    II.itemImgUrl as itemImgUrl,
                    M.name as name,
                    IF(isDib = I.itemIdx, 'Y', 'N') as isDib,
                    B.brandKr as brandKr,
                    I.name as itemName,
                    U.profileImgUrl,
                    U.nickName as publisher,
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
                left join (select itemIdx, itemImgUrl from ItemImg where isRepresent = 1) as II on I.itemIdx = II.itemIdx
                left join Celeb as C on C.celebIdx = I.celebIdx
                left join Member as M on M.memberIdx = I.memberIdx
                left join Brand as B on B.brandIdx = I.brandIdx
                left join User as U on U.userIdx = I.userIdx
                left join (select B.binderIdx, B.userIdx, D.itemIdx as isDib from Binder as B join Dib D on B.binderIdx = D.binderIdx where B.userIdx = ?) as dib on isDib = I.itemIdx
                left join (select itemIdx, count(itemIdx) as ilrank from ItemLike group by itemIdx order by count(itemIdx) DESC ) ILrank on I.itemIdx = ILrank.itemIdx
                left join (select D.itemIdx, count(D.itemIdx) as drank  from Dib as D group by D.itemIdx order by  count(D.itemIdx) DESC) Drank on Drank.itemIdx = I.itemIdx
            where I.memberIdx = ? and TIMESTAMPDIFF(MONTH, I.createdAt, current_timestamp) < 1
            order by ilcnt*0.7 + dcnt*0.3 DESC
            LIMIT ?, ?;
    `;
  const [itemRows] = await connection.query(selectMemberItemsHotQuery, selcetParams);

  return itemRows;
}

async function selectHotUsers(connection, userIdx) {
  const selectHotUsersQuery = `
    select U.userIdx,
          U.profileImgUrl,
          U.nickName,
            case
                when U.registerType = 'LOCAL'
                    then substring(U.email, 1 ,instr(U.email, '@')-1)
                when U.registerType = 'KAKAO'
                    then substring(U.snsEmail, 1 ,instr(U.snsEmail, '@')-1)
                when U.registerType = 'GOOGLE'
                    then substring(U.snsEmail, 1 ,instr(U.snsEmail, '@')-1)
                end as id,
            IF(IsF.followerIdx is not null, 'Y', 'N') as isFollow,
            ifnull(ilcnt, 0) as itemLikeCount,
            ifnull(dcnt, 0) as itemDibCount,
            ifnull(fcnt, 0) as userFollowCount
    from User as U
        left join (select F.followIdx, F.followeeIdx, F.followerIdx from Follow as F where F.followerIdx = ${userIdx}) as IsF on IsF.followeeIdx = U.userIdx
        left join (select if(count(IL.itemIdx) is null, 0, count(IL.itemIdx))as ilcnt, I.userIdx  from ItemLike as IL
                  join Item as I on I.itemIdx = IL.itemIdx where TIMESTAMPDIFF(WEEK, IL.createdAt, current_timestamp) < 7   order by ilcnt DESC) as ILrank on ILrank.userIdx = U.userIdx
        left join (select if(count(D.itemIdx) is null, 0, count(D.itemIdx)) as dcnt , B.userIdx  from Dib as D
                  join Binder B on D.binderIdx = B.binderIdx where TIMESTAMPDIFF(WEEK, D.createdAt, current_timestamp) < 7  order by dcnt DESC) as Drank on Drank.userIdx = U.userIdx
        left join (select if(count(F.followeeIdx) is null, 0, count(F.followeeIdx)) as fcnt, F.followeeIdx as userIdx from Follow as F
                  where TIMESTAMPDIFF(WEEK, F.createdAt, current_timestamp) < 7   group by userIdx order by fcnt DESC ) as Frank on Frank.userIdx = U.userIdx
    where U.userIdx != ${userIdx}
    order by itemLikeCount*0.4 + itemDibCount*0.2 + userFollowCount*0.4 DESC
    LIMIT 10;
    `;
  const [userRows] = await connection.query(selectHotUsersQuery, userIdx);

  return userRows;

}

async function selectHotUsersCelebIdx(connection, selcetParams) {
  const selectHotUsersCelebIdxQuery = `
    select U.userIdx,
          U.profileImgUrl,
          U.nickName,
            case
                when U.registerType = 'LOCAL'
                    then substring(U.email, 1 ,instr(U.email, '@')-1)
                when U.registerType = 'KAKAO'
                    then substring(U.snsEmail, 1 ,instr(U.snsEmail, '@')-1)
                when U.registerType = 'GOOGLE'
                    then substring(U.snsEmail, 1 ,instr(U.snsEmail, '@')-1)
                end as id,
            IF(IsF.followerIdx is not null, 'Y', 'N') as isFollow,
            ifnull(ilcnt, 0) as itemLikeCount,
            ifnull(dcnt, 0) as itemDibCount,
            ifnull(fcnt, 0) as userFollowCount
    from User as U
        left join (select F.followIdx, F.followeeIdx, F.followerIdx from Follow as F where F.followerIdx = ?) as IsF on IsF.followeeIdx = U.userIdx
        left join (select if(count(IL.itemIdx) is null, 0, count(IL.itemIdx))as ilcnt, I.userIdx  from ItemLike as IL
                  join Item as I on I.itemIdx = IL.itemIdx where TIMESTAMPDIFF(WEEK, IL.createdAt, current_timestamp) < 7 order by ilcnt DESC) as ILrank on ILrank.userIdx = U.userIdx
        left join (select if(count(D.itemIdx) is null, 0, count(D.itemIdx)) as dcnt , B.userIdx  from Dib as D
                  join Binder B on D.binderIdx = B.binderIdx where TIMESTAMPDIFF(WEEK, D.createdAt, current_timestamp) < 7    order by dcnt DESC) as Drank on Drank.userIdx = U.userIdx
        left join (select if(count(F.followeeIdx) is null, 0, count(F.followeeIdx)) as fcnt, F.followeeIdx as userIdx from Follow as F
                  where TIMESTAMPDIFF(WEEK, F.createdAt, current_timestamp) < 7 group by userIdx order by fcnt DESC ) as Frank on Frank.userIdx = U.userIdx
        join (select IC.celebIdx, IC.userIdx from InterestCeleb as IC where celebIdx = ?) as InC on InC.userIdx = U.userIdx
    where U.userIdx != ?
    order by itemLikeCount*0.4 + itemDibCount*0.2 + userFollowCount*0.4 DESC
    LIMIT 10;
    `
  const [userRows] = await connection.query(selectHotUsersCelebIdxQuery, selcetParams);

  return userRows;
}


async function selectHotItemsDaily(connection, period, userIdx) {
  const selectHotItemsDailyQuery = `
select  I.itemIdx as itemIdx,
        II.itemImgUrl as itemImgUrl,
        case
            when I.memberIdx is null
                then C.name
            when I.memberIdx is not null
                then M.name
            end as name,
        B.brandKr as brandKr,
        I.name as itemName,
        ifnull(ilcnt, 0) as itemLikeCount,
        ifnull(dcnt, 0) as itemDibCount,
        IF(isDib = I.itemIdx, 'Y', 'N') as isDib,
        U.profileImgUrl,
        U.nickName as publisher,
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
    join (select itemIdx, itemImgUrl from ItemImg where isRepresent = 1) as II on I.itemIdx = II.itemIdx
    join Celeb as C on C.celebIdx = I.celebIdx
    left join Member M on I.memberIdx = M.memberIdx
    join Brand B on I.brandIdx = B.brandIdx
    left join (select itemIdx, count(itemIdx) as ilcnt from ItemLike as IL where TIMESTAMPDIFF(DAY, IL.createdAt, current_timestamp) < 1
                group by itemIdx order by count(itemIdx) DESC ) ILCNT on I.itemIdx = ILCNT.itemIdx
    left join (select D.itemIdx, count(D.itemIdx) as dcnt from Dib as D where TIMESTAMPDIFF(DAY, D.createdAt, current_timestamp) < 1
                group by D.itemIdx order by  count(D.itemIdx) DESC) DCNT on DCNT.itemIdx = I.itemIdx
    left join (select B.binderIdx, B.userIdx, D.itemIdx as isDib from Binder as B join Dib D on B.binderIdx = D.binderIdx where B.userIdx = ${userIdx}) as dib on isDib = I.itemIdx
    join User as U on U.userIdx = I.userIdx
order by itemLikeCount*0.7 + itemDibCount*0.3 Desc
limit 20;
    `;
  const [itemRows] = await connection.query(selectHotItemsDailyQuery);

  return itemRows;
}

async function selectHotItemsWeekly(connection, period, userIdx) {
  const selectHotItemsWeeklyQuery = `
        select  I.itemIdx as itemIdx,
        II.itemImgUrl as itemImgUrl,
        case
            when I.memberIdx is null
                then C.name
            when I.memberIdx is not null
                then M.name
            end as name,
        B.brandKr as brandKr,
        I.name as itemName,
        ifnull(ilcnt, 0) as itemLikeCount,
        ifnull(dcnt, 0) as itemDibCount,
        IF(isDib = I.itemIdx, 'Y', 'N') as isDib,
        U.profileImgUrl,
        U.nickName as publisher,
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
    join (select itemIdx, itemImgUrl from ItemImg where isRepresent = 1) as II on I.itemIdx = II.itemIdx
    join Celeb as C on C.celebIdx = I.celebIdx
    left join Member M on I.memberIdx = M.memberIdx
    join Brand B on I.brandIdx = B.brandIdx
    left join (select itemIdx, count(itemIdx) as ilcnt from ItemLike as IL where TIMESTAMPDIFF(WEEK, IL.createdAt, current_timestamp) < 7
                group by itemIdx order by count(itemIdx) DESC ) ILCNT on I.itemIdx = ILCNT.itemIdx
    left join (select D.itemIdx, count(D.itemIdx) as dcnt from Dib as D where TIMESTAMPDIFF(WEEK, D.createdAt, current_timestamp) < 7
                group by D.itemIdx order by  count(D.itemIdx) DESC) DCNT on DCNT.itemIdx = I.itemIdx
    left join (select B.binderIdx, B.userIdx, D.itemIdx as isDib from Binder as B join Dib D on B.binderIdx = D.binderIdx where B.userIdx = ${userIdx}) as dib on isDib = I.itemIdx
    join User as U on U.userIdx = I.userIdx
order by itemLikeCount*0.7 + itemDibCount*0.3 Desc
limit 20;
    `;
  const [itemRows] = await connection.query(selectHotItemsWeeklyQuery);

  return itemRows;
}


async function selectHowKeywords(connection) {
  const selectHowKeywordsQuery = `
select keyword
    from (select	itemIdx,
                  concat(celebName, ' ', ifnull(memberName, ''), ' ', subCategory) as keyword
          from (select	I.itemIdx,
                        C.name as celebName,
                        M.name as memberName,
                        if(I.subCategory = '기타', '', I.subCategory) as subCategory
                from Item as I
                  join Celeb as C on C.celebIdx = I.celebIdx
                  left join Member as M on M.memberIdx = I.memberIdx
                where timestampdiff(week, I.createdAt, current_timestamp) < 7
                ) as AllKeyword) as AK
    group by keyword
    order by count(keyword) desc
    limit 15;
  `;
  const [hotKeywordRows] = await connection.query(selectHowKeywordsQuery);
  return hotKeywordRows;
}


async function selectSimUsers(connection, selcetParams) {
  const selectSimUsersQuery = `
    select	U.userIdx,
        U.nickName,
            U.profileImgUrl,
            case
                when U.registerType = 'LOCAL'
                    then substring(U.email, 1 ,instr(U.email, '@')-1)
                when U.registerType = 'KAKAO'
                    then substring(U.snsEmail, 1 ,instr(U.snsEmail, '@')-1)
                when U.registerType = 'GOOGLE'
                    then substring(U.snsEmail, 1 ,instr(U.snsEmail, '@')-1)
        end as id,
            uploadCnt,
            IF(IsF.followerIdx is not null, 'Y', 'N') as isFollow
    from (select	SimUser.userIdx ,
          count(itemIdx) as uploadCnt
      from (	select IC.userIdx
          from (	select IC.celebIdx
              from User as U
                join InterestCeleb as IC
                  on IC.userIdx = U.userIdx
              where U.userIdx = ?) as UserIC
            join InterestCeleb as IC
              on IC.celebIdx = UserIC.celebIdx
          where  IC.userIdx != ?
          group by IC.userIdx) as SimUser
        left join Item as I
          on I.userIdx = SimUser.userIdx
      group by SimUser.userIdx
      order by uploadCnt desc) as userRank
      join User as U
        on U.userIdx = userRank.userIdx
      left join (select F.followIdx, F.followeeIdx, F.followerIdx from Follow as F where F.followerIdx = ?) as IsF on IsF.followeeIdx = U.userIdx
    limit 10;
  `;
  const [simUserRows] = await connection.query(selectSimUsersQuery, selcetParams);
  return simUserRows;

}

async function selectSimUserItems(connection, userIdx) {
  const selectSimUserItemsQuery = `
    select I.userIdx, I.itemIdx, II.itemImgUrl
from Item as I
	left join ItemImg as II
		on II.itemIdx = I.itemIdx
where II.isRepresent = 1 and I.userIdx = ?;
  `;
  const [itemRows] = await connection.query(selectSimUserItemsQuery, userIdx);
  return itemRows;

}

async function selectFollowerItemsCount(connection, userIdx) {
  const selectFollowerItemsCountQuery = `
        select count(*) as count
        from Item as I
            join Follow as F on F.followeeIdx = I.userIdx
            join (select * from ItemImg as II where II.isRepresent = 1) as II on I.itemIdx = II.itemIdx
        where F.followerIdx = ?
    `;
  const [countRow] = await connection.query(selectFollowerItemsCountQuery, userIdx);
  return countRow;

}

async function selectFollowerItems(connection, selcetParams) {
  const selectFollowerItemsQuery = `
        select I.itemIdx,
       II.itemImgUrl,
       case
           when I.memberIdx is null
               then C.name
           else
               M.name
       end as name,
       if(isDib = I.itemIdx, 'Y', 'N') as isDib,
       B.brandKr,
       I.name as ItemName,
       I.userIdx,
       U.profileImgUrl,
       U.nickName,
       case
	        when timestampdiff(second, I.updatedAt, current_timestamp) < 60
	            then concat(timestampdiff(second, I.updatedAt, current_timestamp), '초 전')
	        when timestampdiff(minute , I.updatedAt, current_timestamp) < 60
	            then concat(timestampdiff(minute, I.updatedAt, current_timestamp), '분 전')
	        when timestampdiff(hour , I.updatedAt, current_timestamp) < 24
	            then concat(timestampdiff(hour, I.updatedAt, current_timestamp), '시간 전')
	        when timestampdiff(day , I.updatedAt, current_timestamp) < 365
	            then concat(timestampdiff(day, I.updatedAt, current_timestamp), '일 전')
	        else timestampdiff(year , I.updatedAt, current_timestamp)
	    end as uploadTime
from Item as I
    join Follow as F on F.followeeIdx = I.userIdx
    join (select * from ItemImg as II where II.isRepresent = 1) as II on I.itemIdx = II.itemIdx
    join Celeb as C on C.celebIdx = I.celebIdx
    left join Member as M on M.memberIdx = I.memberIdx
    join User as U on U.userIdx = I.userIdx
    join Brand as B on B.brandIdx = I.brandIdx
    left join (select B.binderIdx, B.userIdx, D.itemIdx as isDib from Binder as B join Dib as D on B.binderIdx = D.binderIdx where B.userIdx = ?) as isDib on isDib = I.itemIdx
where F.followerIdx = ?
order by I.updatedAt DESC
limit ?,?;
    `;
  const [itemRows] = await connection.query(selectFollowerItemsQuery, selcetParams);
  return itemRows;
}

module.exports = {
  selectEvents,
  selectCelebItemsCount,
  selectCelebItemsLatest,
  selectCelebItemsHot,
  selectMemberItemsCount,
  selectMemberItemsLatest,
  selectMemberItemsHot,
  selectHotUsers,
  selectHotUsersCelebIdx,
  selectHotItemsDaily,
  selectHotItemsWeekly,
  selectHowKeywords,
  selectSimUsers,
  selectSimUserItems,
  selectFollowerItemsCount,
  selectFollowerItems



};
