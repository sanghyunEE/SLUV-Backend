module.exports = function (app) {
    const search = require('./searchController');
    const jwtMiddleware = require('../../config/jwtMiddleware');

    // 9.3 핫 랭킹 검색어 (일간)
    app.get('/search/hot-ranking', search.getDailyWord);

    // 9.4 인기 검색어 (월간)
    app.get('/search/hot-searchword', search.getMonthlyWord);

    // 9.5 유저의 최근 검색어 조회
    app.get('/search/recent', jwtMiddleware, search.getRecent);

    // 9.6 검색창 검색 결과 조회
    app.get('/search', jwtMiddleware, search.getSearchItems);

    // 9.7 필터링 검색 결과 조회
    app.get('/search/filter', jwtMiddleware, search.getSearchItemsOnFilter);

    // 9.8 특정 최근 검색어 지우기
    app.delete('/search/recent/:recentSearchIdx', search.deleteRecendWord);

    // 9.9 모든 최근 검색어 지우기
    app.delete('/search/recent', jwtMiddleware, search.deleteAllRecendWord);
}