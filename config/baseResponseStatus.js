//Response로 보내줄 상태코드와 메세지 등을 이 파일에서 관리함

module.exports = {

  // Success
  SUCCESS: { "isSuccess": true, "code": 1000, "message": "성공" },

  // Common
  TOKEN_EMPTY: { "isSuccess": false, "code": 2000, "message": "JWT 토큰을 입력해주세요." },
  TOKEN_VERIFICATION_FAILURE: { "isSuccess": false, "code": 3000, "message": "JWT 토큰 검증 실패" },
  TOKEN_VERIFICATION_SUCCESS: { "isSuccess": true, "code": 1001, "message": "JWT 토큰 검증 성공" }, // ? auto login 시에 레스폰스로 쓴다!!

  //Request error
  SIGNUP_EMAIL_EMPTY: { "isSuccess": false, "code": 2001, "message": "이메일을 입력해주세요" },
  SIGNUP_EMAIL_LENGTH: { "isSuccess": false, "code": 2002, "message": "이메일은 30자리 미만으로 입력해주세요." },
  SIGNUP_EMAIL_ERROR_TYPE: { "isSuccess": false, "code": 2003, "message": "이메일을 형식을 정확하게 입력해주세요." },
  SIGNUP_PASSWORD_EMPTY: { "isSuccess": false, "code": 2004, "message": "비밀번호를 입력 해주세요." },
  SIGNUP_PASSWORD_LENGTH: { "isSuccess": false, "code": 2005, "message": "비밀번호는 6~20자리를 입력해주세요." },
  SIGNUP_NICKNAME_EMPTY: { "isSuccess": false, "code": 2006, "message": "닉네임을 입력 해주세요." },
  SIGNUP_NICKNAME_LENGTH: { "isSuccess": false, "code": 2007, "message": "닉네임은 최대 20자리를 입력해주세요." },

  SIGNIN_EMAIL_EMPTY: { "isSuccess": false, "code": 2008, "message": "이메일을 입력해주세요" },
  SIGNIN_EMAIL_LENGTH: { "isSuccess": false, "code": 2009, "message": "이메일은 30자리 미만으로 입력해주세요." },
  SIGNIN_EMAIL_ERROR_TYPE: { "isSuccess": false, "code": 2010, "message": "이메일을 형식을 정확하게 입력해주세요." },
  SIGNIN_PASSWORD_EMPTY: { "isSuccess": false, "code": 2011, "message": "비밀번호를 입력 해주세요." },

  USER_USERID_EMPTY: { "isSuccess": false, "code": 2012, "message": "userId를 입력해주세요." },
  USER_USERID_NOT_EXIST: { "isSuccess": false, "code": 2013, "message": "해당 회원이 존재하지 않습니다." },

  USER_USEREMAIL_EMPTY: { "isSuccess": false, "code": 2014, "message": "이메일을 입력해주세요." },
  USER_USEREMAIL_NOT_EXIST: { "isSuccess": false, "code": 2015, "message": "해당 이메일을 가진 회원이 존재하지 않습니다." },
  USER_IDX_NOT_MATCH: { "isSuccess": false, "code": 2016, "message": "유저 아이디 식별자 값을 확인해주세요" },
  USER_NICKNAME_EMPTY: { "isSuccess": false, "code": 2017, "message": "닉네임 값을 입력해주세요" },

  USER_STATUS_EMPTY: { "isSuccess": false, "code": 2018, "message": "회원 상태값을 입력해주세요" },

  SIGNUP_CODE_EMPTY: { "isSuccess": false, "code": 2019, "message": "인가코드 입력해주세요" },
  SIGNUP_PHONENUMBER_EMPTY: { "isSuccess": false, "code": 2020, "message": "전화번호를 입력해주세요." },
  SIGNUP_CERT_NUM_EMPTY: { "isSuccess": false, "code": 2021, "message": "인증번호를 입력해주세요." },
  SIGNUP_CERT_NUM_NOT_EXIST: { "isSuccess": false, "code": 2022, "message": "인증번호를 다시 요청해주세요." },

  INTEREST_CELEB_NAME_EMPTY: { "isSuccess": false, "code": 2030, "message": "셀럽 이름을 입력해주세요." },
  INTEREST_CELEB_REASON_EMPTY: { "isSuccess": false, "code": 2031, "message": "이유를 입력해주세요." },
  INTEREST_MEMBER_EMPTY: { "isSuccess": false, "code": 2032, "message": "해당 셀럽이 존재하지 않거나 그룹이 아닙니다." },

  BINDER_IDX_EMPTY: { "isSuccess": false, "code": 2040, "message": "바인더 식별자를 입력해주세요." },
  ITEM_IDX_EMPTY: { "isSuccess": false, "code": 2041, "message": "아이템 식별자를 입력해주세요." },
  USER_IDX_EMPTY: { "isSuccess": false, "code": 2042, "message": "유저 식별자를 입력해주세요." },
  NOTICE_IDX_EMPTY: { "isSuccess": false, "code": 2043, "message": "공지사항 식별자를 입력해주세요." },
  SEARCH_WORD_EMPTY: { "isSuccess": false, "code": 2044, "message": "검색어를 입력해주세요." },
  SEARCH_IDX_EMPTY: { "isSuccess": false, "code": 2045, "message": "최근 검색어 식별자를 입력해주세요." },

  CUR_PAGE_RANGE_OUT: { "isSuccess": false, "code": 2060, "message": "입력하신 페이지의 번호 범위가 초과입니다." },

  // Response error
  SIGNUP_REDUNDANT_EMAIL: { "isSuccess": false, "code": 3001, "message": "중복된 이메일입니다." },
  SIGNUP_REDUNDANT_NICKNAME: { "isSuccess": false, "code": 3002, "message": "중복된 닉네임입니다." },

  SIGNIN_EMAIL_WRONG: { "isSuccess": false, "code": 3003, "message": "이메일이 잘못 되었습니다." },
  SIGNIN_PASSWORD_WRONG: { "isSuccess": false, "code": 3004, "message": "비밀번호가 잘못 되었습니다." },
  SIGNIN_INACTIVE_ACCOUNT: { "isSuccess": false, "code": 3005, "message": "비활성화 된 계정입니다. 고객센터에 문의해주세요." },
  SIGNIN_WITHDRAWAL_ACCOUNT: { "isSuccess": false, "code": 3006, "message": "탈퇴 된 계정입니다. 고객센터에 문의해주세요." },

  SIGNUP_REDUNDANT_PHONENUMBER: { "isSuccess": false, "code": 3007, "message": "중복된 전화번호 입니다." },
  CHECK_EMAIL_EMPTY: { "isSuccess": false, "code": 3008, "message": "이메일 가입 내역이 없습니다." },

  USER_INTEREST_CELEB_EMPTY: { "isSuccess": false, "code": 3030, "message": "해당 유저는 등록된 관심 셀럽이 없습니다." },

  FOLLOW_REDUNDANT_ERROR: { "isSuccess": false, "code": 3040, "message": "해당 유저는 이미 팔로우 중입니다." },

  EVENT_LIST_EMPTY: { "isSuccess": false, "code": 3060, "message": "현재 진행 중인 이벤트가 없습니다." },

  SEARCH_ITEM_EMPTY: { "isSuccess": false, "code": 3070, "message": "검색된 아이템이 없습니다." },

  BINDER_NAME_REDUNDANT: { "isSuccess": false, "code": 3080, "message": "중복된 바인더 이름입니다." },
  BINDER_ITEM_REDUNDANT: { "isSuccess": false, "code": 3081, "message": "선택하신 아이템은 이미 해당 바인더에 존재합니다." },
  BINDER_STATUS_DELETED: { "isSuccess": false, "code": 3082, "message": "해당 바인더는 삭제된 상태입니다." },

  DIB_STATUS_DELETED: { "isSuccess": false, "code": 3090, "message": "해당 찜은 삭제된 상태입니다." },


  USER_REDUNDANT_NICKNAME: { "isSuccess": false, "code": 5001, "message": "현재 닉네임과 다른 닉네임을 입력해주세요" },
  USER_EMPTY_EMAIL: { "isSuccess": false, "code": 5002, "message": "해당되는 이메일이 없습니다." },
  USER_REDUNDANT_PASSWORD: { "isSuccess": false, "code": 5003, "message": "현재 비밀번호와 다른 비밀번호를 입력해주세요" },

  API_PARAMETER_EMPTY: { "isSuccess": false, "code": 6000, "message": "body 값을 입력해주세요." },
  API_QUERYSTRING_EMPTY: { "isSuccess": false, "code": 6001, "message": "query string 값을 입력해주세요." },


  //Connection, Transaction 등의 서버 오류
  DB_ERROR: { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러" },
  SERVER_ERROR: { "isSuccess": false, "code": 4001, "message": "서버 에러" },


}
