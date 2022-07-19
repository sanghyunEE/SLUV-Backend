const baseResponse = require("../../config/baseResponseStatus");
const category = require("../../config/itemCategory");
const { pool } = require("../../config/database");
const { response, errResponse } = require("../../config/response");
const { logger } = require("../../config/winston");

const searchDao = require("./searchDao");

exports.retrieveDailyWord = async function () {
  const connection = await pool.getConnection(async (conn) => conn);
  const dailyWordResult = await searchDao.selectDailyWord(connection);
  connection.release();

  return dailyWordResult;
}

exports.retrieveMonthlyWord = async function () {
  const connection = await pool.getConnection(async (conn) => conn);
  const monthlyWordResult = await searchDao.selectMonthlyWord(connection);
  connection.release();

  return monthlyWordResult;
}

exports.retrieveRecentWord = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const recentWordResult = await searchDao.selectRecentWord(connection, userIdx);
  connection.release();

  return recentWordResult;
}


exports.retrieveSearchItems = async function (userIdx, searchWord, page, pageSize) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const splitWord = searchWord.split(' ');
    const matchWord = { celebName: "", memberName: "", parentCategory: "", subCategory: "", brandNane: "" };
    // const matchWord = {};
    for (word of splitWord) {
      // console.log(" 현재단어:", word);
      const matchNameResult = await searchDao.selectName(connection, [word, word]);
      // console.log(matchNameResult);

      if (matchNameResult.length == 0) {
        continue;
      } else if (matchNameResult.length == 1) {
        if (matchNameResult[0].memberName == null) {
          matchWord.celebName = matchNameResult[0].celebName;
        } else {
          matchWord.memberName = matchNameResult[0].memberName;
        }
      } else if (matchNameResult.length > 1) {
        matchWord.celebName = matchNameResult[0].celebName;
      }
    }

    for (word of splitWord) {
      for (parent of category.parentCategoryList) {
        // console.log(word, parent.parent)
        if (word == parent.parent) {
          matchWord.parentCategory = word
        } else {
          continue;
        }
      }
    }

    for (word of splitWord) {
      for (parent of category.parentCategoryList) {
        // console.log(word, parent.parent)
        const subCategory = parent.subCategory; // list
        for (sub of subCategory) {
          if (sub.sub == word) {
            matchWord.subCategory = sub.sub;
          }
          for (i of sub.matchWordList) {
            if (i == word) {
              matchWord.subCategory = sub.sub;
            } else {
              continue;
            }
          }
        }
      }
    }

    for (word of splitWord) {
      const matchBrandResult = await searchDao.selectBrand(connection, word);
      // console.log(matchNameResult);

      if (matchBrandResult.length == 0) {
        continue;
      } else {
        matchWord.brandNane = matchBrandResult[0].brandKr
      }
    }

    // console.log(matchWord.dd);
    // const result = await searchDao.selectWordMatch(connection, word);




    // const isEmpty = Object.keys(matchWord).length === 0
    if (matchWord.memberName == '' && matchWord.celebName == '' && matchWord.parentCategory == ''
      && matchWord.subCategory == '' && matchWord.brandNane == '') {
      return errResponse(baseResponse.SEARCH_ITEM_EMPTY);
    }

    // const selectParams = Object.values(matchWord);
    let start = 0;
    if (page <= 0) {
      page = 1;
    } else { // offset
      start = (page - 1) * pageSize
    }

    const itemCount = await searchDao.selectSearchItemCount(connection,
      userIdx,
      matchWord.celebName,
      matchWord.memberName,
      matchWord.parentCategory,
      matchWord.subCategory,
      matchWord.brandNane
    );

    if (itemCount[0].count < 1) {
      return errResponse(baseResponse.SEARCH_ITEM_EMPTY);
    }
    // console.log(itemCount[0].count, typeof (itemCount[0].count));
    if (page > Math.ceil(itemCount[0].count / pageSize)) {
      console.log('page 범위 아웃!');
      return errResponse(baseResponse.CUR_PAGE_RANGE_OUT);
    }

    const searchItemResult = await searchDao.selectSearchItem(connection,
      userIdx,
      matchWord.celebName,
      matchWord.memberName,
      matchWord.parentCategory,
      matchWord.subCategory,
      matchWord.brandNane,
      start,
      pageSize
    );
    // console.log(searchItemResult);


    return response(baseResponse.SUCCESS, {
      searchItemCnt: searchItemResult.length,
      searchItemList: searchItemResult
    });
  } catch (err) {
    console.log(`App - retrieveSearchItems Provider error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
}

exports.retrieveSearchItemsOnFilter = async function (userIdx, searchWord, page, pageSize, parentCategorys, subCategorys, price, order) {
  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const splitWord = searchWord.split(' ');
    const matchWord = { celebName: "", memberName: "", parentCategory: "", subCategory: "", brandNane: "" };
    // const matchWord = {};
    for (word of splitWord) {
      // console.log(" 현재단어:", word);
      const matchNameResult = await searchDao.selectName(connection, [word, word]);
      // console.log(matchNameResult);

      if (matchNameResult.length == 0) {
        continue;
      } else if (matchNameResult.length == 1) {
        if (matchNameResult[0].memberName == null) {
          matchWord.celebName = matchNameResult[0].celebName;
        } else {
          matchWord.memberName = matchNameResult[0].memberName;
        }
      } else if (matchNameResult.length > 1) {
        matchWord.celebName = matchNameResult[0].celebName;
      }
    }

    for (word of splitWord) {
      for (parent of category.parentCategoryList) {
        // console.log(word, parent.parent)
        if (word == parent.parent) {
          matchWord.parentCategory = word
        } else {
          continue;
        }
      }
    }

    for (word of splitWord) {
      for (parent of category.parentCategoryList) {
        // console.log(word, parent.parent)
        const subCategory = parent.subCategory; // list
        for (sub of subCategory) {
          if (sub.sub == word) {
            matchWord.subCategory = sub.sub;
          }
          for (i of sub.matchWordList) {
            if (i == word) {
              matchWord.subCategory = sub.sub;
            } else {
              continue;
            }
          }
        }
      }
    }

    for (word of splitWord) {
      const matchBrandResult = await searchDao.selectBrand(connection, word);
      // console.log(matchNameResult);

      if (matchBrandResult.length == 0) {
        continue;
      } else {
        matchWord.brandNane = matchBrandResult[0].brandKr
      }
    }

    // console.log(matchWord.dd);
    // const result = await searchDao.selectWordMatch(connection, word);


    // console.log(matchWord)

    // const isEmpty = Object.keys(matchWord).length === 0
    if (matchWord.memberName == '' && matchWord.celebName == '' && matchWord.parentCategory == ''
      && matchWord.subCategory == '' && matchWord.brandNane == '') {
      return errResponse(baseResponse.SEARCH_ITEM_EMPTY);
    }

    // const selectParams = Object.values(matchWord);
    let start = 0;
    if (page <= 0) {
      page = 1;
    } else { // offset
      start = (page - 1) * pageSize
    }

    //9.7 작업
    if (parentCategorys) {
      console.log("필터 상위 null 아님");
      matchWord.parentCategory = parentCategorys;
    }
    if (subCategorys) {
      console.log("필터 하위 null 아님");
      const subs = subCategorys.split(' ');
      let column_sub = 'IN (';
      for (sub of subs) {
        column_sub = column_sub + " '" + sub + "',";
      }
      matchWord.subCategory = column_sub.substring(0, column_sub.length - 1) + ')';
      // console.log(matchWord.subCategory);
    }
    let column_price;
    if (!price) {
      column_price = 'IN (1,2,3,4,5)';
    } else {
      column_price = `= ${price}`;
    }

    console.log(userIdx,
      matchWord.celebName,
      matchWord.memberName,
      matchWord.parentCategory,
      matchWord.subCategory,
      matchWord.brandNane,
      column_price);

    const itemCount = await searchDao.selectSearchItemOnFiterCount(connection,
      userIdx,
      matchWord.celebName,
      matchWord.memberName,
      matchWord.parentCategory,
      matchWord.subCategory,
      matchWord.brandNane,
      column_price
    );

    if (itemCount[0].count < 1) {
      return errResponse(baseResponse.SEARCH_ITEM_EMPTY);
    }
    // console.log(itemCount[0].count, typeof (itemCount[0].count));
    if (page > Math.ceil(itemCount[0].count / pageSize)) {
      console.log('page 범위 아웃!');
      return errResponse(baseResponse.CUR_PAGE_RANGE_OUT);
    }

    let searchItemResult;
    if (order == "latest") {
      searchItemResult = await searchDao.selectSearchItemOnFiterLatest(connection,
        userIdx,
        matchWord.celebName,
        matchWord.memberName,
        matchWord.parentCategory,
        matchWord.subCategory,
        matchWord.brandNane,
        column_price,
        start,
        pageSize
      );
    } else if (order == 'hot') {
      searchItemResult = await searchDao.selectSearchItemOnFiterHot(connection,
        userIdx,
        matchWord.celebName,
        matchWord.memberName,
        matchWord.parentCategory,
        matchWord.subCategory,
        matchWord.brandNane,
        column_price,
        start,
        pageSize
      );
    }

    // console.log(searchItemResult);


    return response(baseResponse.SUCCESS, {
      searchItemCnt: searchItemResult.length,
      searchItemList: searchItemResult
    });
  } catch (err) {
    console.log(`App - retrieveSearchItems Provider error\n: ${err.message}`);
    return errResponse(baseResponse.DB_ERROR);
  } finally {
    connection.release();
  }
}