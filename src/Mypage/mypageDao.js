async function selectMypageUser(connection, userIdx) {
    const selectMypageUserQuery = `
        select U.userIdx,
            U.profileImgUrl,
            U.nickName,
                case
                    when U.registerType = 'LOCAL'
                        then concat('@', substring(U.email, 1 ,instr(U.email, '@')-1))
                    when U.registerType = 'KAKAO'
                        then concat('@', substring(U.snsEmail, 1 ,instr(U.snsEmail, '@')-1))
                    when U.registerType = 'GOOGLE'
                        then concat('@', substring(U.snsEmail, 1 ,instr(U.snsEmail, '@')-1))
                end as id,
            if(Followee.followerCnt is null, 0, Followee.followerCnt) as followerCnt,
            if(Following.followingCnt is null, 0, Following.followingCnt) as followingCnt,
            IF(IsF.followerIdx is not null, 'Y', 'N') as isFollow
        from User as U
            left join (select followerIdx, count(*) as followingCnt
                    from Follow as F
                    group by followerIdx
                ) as Following on Following.followerIdx = U.userIdx
            left join (select followeeIdx, count(*) as followerCnt
                    from Follow as F
                    group by followeeIdx
                ) as Followee on Followee.followeeIdx = U.userIdx
            left join (select F.followIdx, F.followeeIdx, F.followerIdx from Follow as F where F.followerIdx = ${userIdx}) as IsF on IsF.followeeIdx = U.userIdx
        where U.userIdx = ${userIdx};
    `;
    const [userInfoRow] = await connection.query(selectMypageUserQuery);
    return userInfoRow;
}

async function selectInterestCeleb(connection, userIdx) {
    const selectInterestCelebQuery = `
        select C.celebIdx, C.name as celebName
        from Celeb as C
            join InterestCeleb IC on C.celebIdx = IC.celebIdx
        where IC.userIdx = ${userIdx};
    `;

    const [interestCelebRows] = await connection.query(selectInterestCelebQuery);
    return interestCelebRows;


}


async function selectUploadItem(connection, userIdx, myIdx) {
    const selectUploadItemQuery = `
        select I.itemIdx,
            II.itemImgUrl,
            case
                    when I.memberIdx is null
                        then C.name
                    when I.memberIdx is not null
                        then M.name
                    end as name,
            if(IsD.userIdx is null, 'N', 'Y') as isDib,
            B.brandKr,
            I.name as itemName
        from Item as I
            join ItemImg II on I.itemIdx = II.itemIdx and II.isRepresent = 1
            join Celeb as C on I.celebIdx = C.celebIdx
            left join Member as M on M.memberIdx = I.memberIdx
            join Brand as B on I.brandIdx = B.brandIdx
            left join (select B.userIdx, D.itemIdx from Dib as D join Binder as B on B.binderIdx = D.binderIdx and B.userIdx = ${myIdx}) as IsD on IsD.itemIdx = I.itemIdx
        where I.userIdx = ${userIdx}
        order by I.createdAt desc;
    `;
    const [uploadRows] = await connection.query(selectUploadItemQuery);
    return uploadRows;
}

async function selectOtherUser(connection, myIdx, userIdx) {
    const selectOtherUserQuery = `
        select U.userIdx,
                U.profileImgUrl,
                U.nickName,
                case
                    when U.registerType = 'LOCAL'
                        then concat('@', substring(U.email, 1 ,instr(U.email, '@')-1))
                    when U.registerType = 'KAKAO'
                        then concat('@', substring(U.snsEmail, 1 ,instr(U.snsEmail, '@')-1))
                    when U.registerType = 'GOOGLE'
                        then concat('@', substring(U.snsEmail, 1 ,instr(U.snsEmail, '@')-1))
                end as id,
                if(Followee.followerCnt is null, 0, Followee.followerCnt) as followerCnt,
                if(Following.followingCnt is null, 0, Following.followingCnt) as followingCnt,
                IF(IsF.followerIdx is not null, 'Y', 'N') as isFollow
        from User as U
            left join (select followerIdx, count(*) as followingCnt
                    from Follow as F
                    group by followerIdx
                ) as Following on Following.followerIdx = U.userIdx
            left join (select followeeIdx, count(*) as followerCnt
                    from Follow as F
                    group by followeeIdx
                ) as Followee on Followee.followeeIdx = U.userIdx
            left join (select F.followIdx, F.followeeIdx, F.followerIdx from Follow as F where F.followerIdx = ${myIdx}) as IsF on IsF.followeeIdx = U.userIdx
        where U.userIdx = ${userIdx};
    `;
    const [userInfoRow] = await connection.query(selectOtherUserQuery);
    return userInfoRow;
}

async function selectRecentItem(connection, userIdx) {
    const selectRecentItemQuery = `
        select I.itemIdx,
            II.itemImgUrl,
            case
                    when I.memberIdx is null
                        then C.name
                    when I.memberIdx is not null
                        then M.name
                    end as name,
            if(IsD.userIdx is null, 'N', 'Y') as isDib,
            B.brandKr,
            I.name as itemName
        from Item as I
            join RecentItem as RI on RI.itemIdx = I.itemIdx
            join ItemImg II on I.itemIdx = II.itemIdx and II.isRepresent = 1
            join Celeb as C on I.celebIdx = C.celebIdx
            left join Member as M on M.memberIdx = I.memberIdx
            join Brand as B on I.brandIdx = B.brandIdx
            left join (select B.userIdx, D.itemIdx from Dib as D join Binder as B on B.binderIdx = D.binderIdx and B.userIdx = ${userIdx}) as IsD on IsD.itemIdx = I.itemIdx
        where RI.userIdx = ${userIdx}
        order by RI.createdAt desc;            
    `;
    const [itemRows] = await connection.query(selectRecentItemQuery);
    return itemRows;

}

async function selectFollowers(connection, myIdx, userIdx) {
    const selectFollowersQuery = `
        select FUI.followerUserIdx as userIdx,
            U.profileImgUrl,
            U.nickName,
            case
                    when U.registerType = 'LOCAL'
                        then concat('@', substring(U.email, 1 ,instr(U.email, '@')-1))
                    when U.registerType = 'KAKAO'
                        then concat('@', substring(U.snsEmail, 1 ,instr(U.snsEmail, '@')-1))
                    when U.registerType = 'GOOGLE'
                        then concat('@', substring(U.snsEmail, 1 ,instr(U.snsEmail, '@')-1))
                end as id,
            IF(IsF.followerIdx is not null, 'Y', 'N') as isFollow
        from (select F.followerIdx as followerUserIdx
            from User as U
                join Follow as F on F.followeeIdx = U.userIdx
            where U.userIdx = ${userIdx}) as FUI
            join User as U on U.userIdx = FUI.followerUserIdx
            left join (select F.followIdx, F.followeeIdx, F.followerIdx from Follow as F where F.followerIdx = ${myIdx}) as IsF on IsF.followeeIdx = U.userIdx        
    `;

    const [followersRows] = await connection.query(selectFollowersQuery);
    return followersRows;
}

async function selectFollowings(connection, myIdx, userIdx) {
    const selectFollowingsQuery = `
        select FUI.followeeUserIdx as userIdx,
            U.profileImgUrl,
            U.nickName,
            case
                    when U.registerType = 'LOCAL'
                        then concat('@', substring(U.email, 1 ,instr(U.email, '@')-1))
                    when U.registerType = 'KAKAO'
                        then concat('@', substring(U.snsEmail, 1 ,instr(U.snsEmail, '@')-1))
                    when U.registerType = 'GOOGLE'
                        then concat('@', substring(U.snsEmail, 1 ,instr(U.snsEmail, '@')-1))
                end as id,
            IF(IsF.followerIdx is not null, 'Y', 'N') as isFollow
        from (select F.followeeIdx as followeeUserIdx
            from User as U
                join Follow as F on F.followerIdx = U.userIdx
            where U.userIdx = ${userIdx}) as FUI
            join User as U on U.userIdx = FUI.followeeUserIdx
            left join (select F.followIdx, F.followeeIdx, F.followerIdx from Follow as F where F.followerIdx = ${myIdx}) as IsF on IsF.followeeIdx = U.userIdx        
    `;
    const [followingsRows] = await connection.query(selectFollowingsQuery);
    return followingsRows;
}

async function selectNotices(connection) {
    const selectNoticesQuery = `
        select noticeIdx,
            title,
            substring_index(createdAt, ' ', 1) as createDate
        from Notice as N
    `;

    const [noticeRows] = await connection.query(selectNoticesQuery);
    return noticeRows;
}

async function selectNoticeInfo(connection, noticeIdx) {
    const selectNoticeInfoQuery = `
        select title,
            substring_index(createdAt, ' ', 1) as createDate,
            content
        from Notice as N
        where noticeIdx = ${noticeIdx};        
    `;

    const [noticeInfoRow] = await connection.query(selectNoticeInfoQuery);
    return noticeInfoRow;

}

async function selectNickname(connection, selectParams) {
    const selectNicknameQuery = `
        select userIdx
        from User as U 
        where userIdx != ? and nickName = ?;
    `;
    const [nickNameRow] = await connection.query(selectNicknameQuery, selectParams);
    return nickNameRow;
}

async function updateUser(connection, updateParams) {
    const updateUserQuery = `
        update User
        set nickName = ?, profileImgUrl = ?
        where userIdx = ?;    
    `;

    const updateUserRow = await connection.query(updateUserQuery, updateParams);
    return updateUserRow;
}

async function updateUserOnlyNickName(connection, updateParams) {
    const updateUserOnlyNickNameQuery = `
        update User
        set nickName = ?, profileImgUrl = NULL
        where userIdx = ?;    
    `;
    const updateUserRow = await connection.query(updateUserOnlyNickNameQuery, updateParams);
    return updateUserRow;
}

module.exports = {
    selectMypageUser,
    selectInterestCeleb,
    selectUploadItem,
    selectOtherUser,
    selectRecentItem,
    selectFollowers,
    selectFollowings,
    selectNotices,
    selectNoticeInfo,
    selectNickname,
    updateUser,
    updateUserOnlyNickName

};


