async function selectBinderNameCreate(connection, selectParams) {
  const selectBinderNameCreateQuery = `
    select binderIdx, name
    from Binder
    where userIdx = ? and name = ?;
  `;
  const [binderNameRows] = await connection.query(selectBinderNameCreateQuery, selectParams);
  return binderNameRows;
}


async function selectBinderName(connection, selectParams) {
  const selectBinderNameQuery = `
    SELECT binderIdx, name
    FROM Binder
    WHERE binderIdx != ? and name = ?;
  `;
  const [binderNameRows] = await connection.query(selectBinderNameQuery, selectParams);
  return binderNameRows;
}

async function insertBinder(connection, insertParams) {
  const insertBinderQuery = `
    INSERT INTO Binder(userIdx, isBasic, name, coverImgUrl)
    VALUES (?, ?, ?, ?);
  `;
  const insertBinderRow = await connection.query(insertBinderQuery, insertParams);
  return insertBinderRow;

}

async function selectDibItem(connection, selectParams) {
  const selectDibItemQuery = `
    SELECT dibIdx, itemIdx
    FROM Dib
    WHERE binderIdx = ? AND itemIdx = ?;
  `;
  const [dibItemRows] = await connection.query(selectDibItemQuery, selectParams);
  return dibItemRows;

}

async function insertDib(connection, insertParams) {
  const insertDibQuery = `
    INSERT INTO Dib(itemIdx, binderIdx)
    VALUES (?, ?);
  `;
  const insertDibRow = await connection.query(insertDibQuery, insertParams);
  return insertDibRow;
}

async function selectBinders(connection, userIdx) {
  const slectBinderQuery = `
    SELECT B.binderIdx, B.isBasic, B.coverImgUrl, B.name
    FROM Binder as B
    LEFT JOIN User as U
    ON U.userIdx = B.userIdx
    WHERE U.userIdx = ?;
  `;
  const [binderRows] = await connection.query(slectBinderQuery, userIdx);
  return binderRows;

}

async function selectDibs(connection, binderIdx) {
  const selectDibQuery = `
    select D.itemIdx, II.itemImgUrl,
       case
            when I.memberIdx is null then C.name
            when I.memberIdx is not null then M.name
        end as name,
       B.brandKr, I.name as itemName
    from Dib as D
        left join Item I on D.itemIdx = I.itemIdx
        left join Celeb C on I.celebIdx = C.celebIdx
        left join Member M on M.memberIdx = I.memberIdx
        left join (select * from ItemImg where isRepresent = 1) as II on D.itemIdx = II.itemIdx
        left join Brand B on I.brandIdx = B.brandIdx
    where D.binderIdx = ?
    order by D.dibIdx;
  `
  const [dibRows] = await connection.query(selectDibQuery, binderIdx);
  return dibRows;
}

async function selectDibStatus(connection, selectParams) {
  console.log("selectDibStatus 함수 다오 실행");
  const selectDibStatusQuery = `
        select status
        from Dib
        where binderIdx = ? and itemIdx = ?;
    `;

  const [dibStatusRow] = await connection.query(selectDibStatusQuery, selectParams);
  // console.log(dibStatusRow);
  return dibStatusRow;
}

async function updatedDibStatus(connection, updateParams) {
  const updateDibStatusQuery = `
        delete from Dib
        where binderIdx = ? and itemIdx = ?;
    `;

  const updateDibStatusRow = await connection.query(updateDibStatusQuery, updateParams);
  return updateDibStatusRow[0];
}

async function updatedDibBinderIdx(connection, updateParams) {
  const updateDibBinderIdxQuery = `
        update Dib
        set binderIdx = ?
        where binderIdx = ? and itemIdx = ?;
    `;

  const updateDibBinderIdxRow = await connection.query(updateDibBinderIdxQuery, updateParams);
  return updateDibBinderIdxQuery[0];
}

async function updateBinder(connection, updateParams) {
  console.log(updateParams);
  console.log(updateParams[0] == null);
  let updateBinderQuery = ''
  if (updateParams[0] == null) {
    console.log("url 빔 ");
    updateParams = [updateParams[1], updateParams[2]]
    updateBinderQuery = `
        update Binder
        set name = ?
        where binderIdx = ?;
    `;
  } else {
    console.log("url 안 빔");
    updateBinderQuery = `
        update Binder
        set coverImgUrl = ? , name = ?
        where binderIdx = ?;
    `;
  }

  const updateBinderRow = await connection.query(updateBinderQuery, updateParams);
  return updateBinderRow;
}

async function selectBinderStatus(connection, binderIdx) {
  const selectBinderStatusQuery = `
        select status
        from Binder
        where binderIdx = ?;
    `;


  const [binderStatusRow] = await connection.query(selectBinderStatusQuery, binderIdx);
  // console.log(binderStatusRow);
  return binderStatusRow;
}

async function updateBinderStatus(connection, binderIdx) {
  const updateBinderStatusQuery = `
        delete from Binder
        where binderIdx = ?;
    `;

  const updateBinderStatusRow = await connection.query(updateBinderStatusQuery, binderIdx);
  return updateBinderStatusRow[0];
}

async function deleteDib(connection, binderIdx, itemIdx) {
  const deleteDidQuery = `
    delete from Dib as D
    where D.binderIdx = ${binderIdx} and D.itemIdx = ${itemIdx};
  `;

  const [deleteRow] = await connection.query(deleteDidQuery);
  return deleteRow;
}

async function selectBinderIdx(connection, userIdx) {
  const selectBinderIdxQuery = `
    select *
    from Binder as B
    where B.userIdx = ${userIdx};
  `;
  const [binderIdxRows] = await connection.query(selectBinderIdxQuery);
  return binderIdxRows;
}

module.exports = {
  selectBinderNameCreate,
  selectBinderName,
  insertBinder,
  selectDibItem,
  insertDib,
  selectBinders,
  selectDibs,
  selectDibStatus,
  updatedDibStatus,
  updatedDibBinderIdx,
  updateBinder,
  selectBinderStatus,
  updateBinderStatus,
  selectBinderIdx,
  deleteDib

};
