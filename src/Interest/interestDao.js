// 새롭게 추가한 함수를 아래 부분에서 export 해줘야 외부의 Provider, Service 등에서 사용가능합니다.

// 셀럽 및 멤버 전체 목록 조회
async function selectCelebsMembers(connection) {
  const selectCelebsMembersQuery = `
        SELECT C.celebIdx, category, isGroup, C.name AS celebName, celebImgUrl, memberIdx, M.name AS memberName, memberImgUrl
        FROM Celeb AS C
        LEFT JOIN Member AS M
        ON C.celebIdx = M.celebIdx
    `
  const selectCelebsMembersRows = await connection.query(
    selectCelebsMembersQuery
  );
  // console.log("rows", selectCelebsRows[0]);
  return selectCelebsMembersRows[0]
}


// 셀럽 목록 조회
async function selectCelebs(connection) {
  const selectCelebsQuery = `
        SELECT celebIdx, category, isGroup, name, celebImgUrl
        FROM Celeb
        order by category desc , name
    `
  const selectCelebsRows = await connection.query(
    selectCelebsQuery
  );
  // console.log("rows", selectCelebsRows[0]);
  return selectCelebsRows[0]
}

// 셀럽 추가 요청 삽입
async function insertCelebReq(connection, insertParams) {
  const insertCelebReqQuery = `
        INSERT INTO CelebReq(userIdx, name, reason)
        VALUES (?, ?, ?);
    `
  const insertCelebReqRows = await connection.query(
    insertCelebReqQuery,
    insertParams
  );
  // console.log(insertCelebReq[0]);
  return insertCelebReqRows
}

// 멤버 목록 조회
async function selectMembers(connection, celebIdx) {
  const selectMemebersQuery = `
        SELECT memberIdx, celebIdx, name, memberImgUrl
        FROM Member
        WHERE celebIdx = ?
    `;

  const selectMembersRows = await connection.query(
    selectMemebersQuery,
    celebIdx
  );

  return selectMembersRows

}


// 관심 셀럽 추가
async function insertInterestCeleb(connection, insertParams) {
  const insertInterestCelebQuery = `
        INSERT INTO InterestCeleb(userIdx, celebIdx)
        VALUES (?, ?);
    `;
  const insertInterestCelebRows = await connection.query(
    insertInterestCelebQuery,
    insertParams
  );

  return insertInterestCelebRows
}

// 관심 셀럽 식별자 조회
async function selectInterestCelebIdx(connection, selectParams) {
  const selectInterestCelebIdxQuery = `
        SELECT interestCelebIdx
        FROM InterestCeleb
        WHERE userIdx = ? AND celebIdx = ?;
    `;

  const [selectInterestCelebIdxRows] = await connection.query(
    selectInterestCelebIdxQuery,
    selectParams
  );

  return selectInterestCelebIdxRows

}

// 관심 멤버 추가
async function insertInterestMember(connection, insertParams) {
  const insertInterestMemberQuery = `
        INSERT INTO InterestMember(interestCelebIdx, memberIdx)
        VALUES(?, ?);
    `;

  const insertInterestMemberRows = await connection.query(
    insertInterestMemberQuery,
    insertParams
  );

  return insertInterestMemberRows
}

// 관심 셀럽 테이블에서 userIdx로 celebIdx rows 가져오기 
async function selectCelebIdx(connection, userIdx) {
  const selectCelebIdxQuery = `
        SELECT C.celebIdx, C.name, C.celebImgUrl, IC.interestCelebIdx
        FROM InterestCeleb as IC
            LEFT JOIN Celeb as C
                on IC.celebIdx = C.celebIdx
        WHERE userIdx = ?
        order by IC.interestCelebIdx;
  `;
  const selectCelebIdxRows = await connection.query(
    selectCelebIdxQuery,
    userIdx
  );

  return selectCelebIdxRows
}


// 셀럽 테이블에서 특정 셀럽 정보 (name, imgUrl) 추출
async function selectCeleb(connection, celebIdx) {
  const selectCeleQuery = `
        SELECT name, celebImgUrl
        FROM Celeb
        WHERE celebIdx = ?;
  `;

  const selectCelebRows = await connection.query(
    selectCeleQuery,
    celebIdx
  );

  return selectCelebRows

}

// 관심 셀럽 테이블에서 top 10 으로 선정된 셀럽 정보 추출
async function selectInterestCelebTopChoice(connection) {
  const selectInterestCelebTopChoiceQuery = `
        SELECT IC.celebIdx, name, celebImgUrl 
        FROM InterestCeleb AS IC
        LEFT JOIN Celeb AS C
        ON IC.celebIdx = C.celebIdx
        GROUP BY celebIdx
        ORDER BY COUNT(IC.celebIdx) DESC
        LIMIT 10;
  `;

  const selectInterestCelebTopChoiceRows = await connection.query(
    selectInterestCelebTopChoiceQuery
  );

  return selectInterestCelebTopChoiceRows

}


async function selectInterests(connection, userIdx) {
  const selectInterestsQuery = `
        SELECT IC.celebIdx, C.isGroup , C.name, C.celebImgUrl, IM.memberIdx, M.name, M.memberImgUrl
        FROM InterestCeleb AS IC
        LEFT JOIN InterestMember AS IM
        ON IC.interestCelebIdx = IM.interestCelebIdx
        LEFT JOIN Celeb AS C
        ON C.celebIdx = IC.celebIdx
        LEFT JOIN Member AS M
        ON M.memberIdx = IM.memberIdx
        WHERE userIdx = ?;
    `;

  const [interestRows] = await connection.query(selectInterestsQuery, userIdx);
  // console.log(interestRows)
  return interestRows

}

async function selectInterestMembers(connection, interestCelebIdx) {
  const selectInterestMembersQuery = `
        SELECT IM.memberIdx, M.name, M.memberImgUrl
        FROM InterestMember as IM
        LEFT JOIN Member as M
        on IM.memberIdx = M.memberIdx
        WHERE IM.interestCelebIdx = ?
        order by memberIdx;
    `
  const [interestMembersRow] = await connection.query(selectInterestMembersQuery, interestCelebIdx)
  return interestMembersRow;
}

async function selectInterestCelebIdxs(connection, userIdx) {
  // console.log("@@@@@@@@@");
  const selectInterestCelebIdxsQuery = `
        SELECT interestCelebIdx
        FROM InterestCeleb
        WHERE userIdx = ?;
    `;
  // console.log(userIdx);
  const [interestCelebIdxRow] = await connection.query(selectInterestCelebIdxsQuery, userIdx);
  // console.log(2, interestCelebIdxRow);
  return interestCelebIdxRow;
}

async function deleteInterestMember(connection, interestCelebIdx) {
  const deleteInterestMeberQuery = `
        delete from InterestMember
        where interestCelebIdx = ?;
    `;
  const [deleteInterestMemberRow] = await connection.query(deleteInterestMeberQuery, interestCelebIdx);
  return deleteInterestMemberRow;

}

async function deleteInterestCeleb(connection, userIdx) {
  const deleteInterestCelebQuery = `
        delete from InterestCeleb
        where userIdx = ?;
    `;
  const [deleteInterestCelebRow] = await connection.query(deleteInterestCelebQuery, userIdx);
  return deleteInterestCelebRow;
}



module.exports = {
  selectCelebsMembers,
  selectCelebs,
  insertCelebReq,
  selectMembers,
  insertInterestCeleb,
  selectInterestCelebIdx,
  insertInterestMember,
  selectCelebIdx,
  selectCeleb,
  selectInterestCelebTopChoice,
  selectInterests,
  selectInterestMembers,
  selectInterestCelebIdxs,
  deleteInterestMember,
  deleteInterestCeleb

};
