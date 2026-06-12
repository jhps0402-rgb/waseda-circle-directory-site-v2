const CSV_URL = "data/raw/official_latest_all_link_checked.csv";
const TRANSLATION_URLS = {
  en: "data/i18n/en/circles_en_complete.csv",
  ko: "data/i18n/ko/circles_ko_complete.csv",
  zh: "data/i18n/zh_mandarin/circles_zh_mandarin_complete.csv",
};
const FALLBACK_IMAGE = "https://www.waseda.jp/inst/weekly/assets/uploads/2015/12/waseda_no_image-610x457.png";
const PAGE_SIZE = 12;
const MAX_SEARCH_LENGTH = 80;
const MISSING_VALUES = new Set(["", "なし", "情報なし"]);

const SUBCATEGORIES = {
  "スポーツ（球技）": ["野球", "サッカー", "フットサル", "ラグビー", "アメリカンフットボール", "バスケットボール", "テニス", "バレーボール", "ゴルフ", "その他の球技"],
  "スポーツ（球技以外）": ["バドミントン", "ダンス", "武道", "乗馬", "ヨット", "スキー", "水泳", "サイクリング", "アウトドア", "その他のスポーツ"],
  "文化・芸術": ["舞台芸術", "演劇", "映画", "音楽", "声楽", "美術", "その他の文化"],
  "学問": ["政治", "経済", "歴史", "宗教", "哲学", "法律", "自然科学", "言語", "日本文学", "日本文化", "学問", "趣味", "技術"],
  "メディア・出版": ["出版", "コミュニケーション", "マスメディア", "企画", "レクリエーション"],
  "国際交流・ボランティア": ["国際交流", "ボランティア"],
  "その他": ["学生稲門会"],
};

const state = {
  baseRows: [],
  translations: {},
  records: [],
  filtered: [],
  page: 1,
  sortMembers: false,
  language: "ja",
};

const UI_TEXT = {
  ja: {
    brand: "早稲田サークル",
    heroTitle: "早稲田大学 サークルディレクトリ",
    heroCopy: "公式サークルガイドの情報をもとに、カテゴリ・人数・外国人学生受け入れ状況で探せます。",
    search: "検索",
    category: "メインカテゴリ",
    subcategory: "サブカテゴリ",
    day: "活動日",
    dayHelp: "選択した曜日のいずれかに活動するサークルを表示",
    irregularHelp: "不定期: 活動日が固定されていないサークル",
    foreignerEnrolled: "外国人学生の在籍",
    welcomeMark: "留学生歓迎マークあり",
    sort: "人数順",
    reset: "リセット",
    all: "すべて",
    chooseCategory: "カテゴリを選択",
    searchPlaceholder: "サークル名・活動内容",
    resultCount: (count) => `${count}件`,
    unavailable: "情報なし",
    none: "なし",
    yes: "あり",
    memberCount: (value) => `${value}人`,
    foundedYear: (value) => `${value}年`,
    cardMembers: "人数",
    cardFounded: "設立",
    cardForeigner: "外国人",
    modalDescription: "活動内容",
    modalDateTime: "活動日時",
    modalActivityDay: "活動日",
    modalLocation: "場所",
    modalMembers: "所属人数",
    modalFounded: "設立年",
    modalForeigner: "外国人学生の受け入れ",
    modalWelcomeMark: "留学生歓迎マーク",
    modalSiteMemo: "サイトメモ",
    foreignerCriteria: "※掲載基準: 受け入れ人数が1人以上、または公式サイトに「留学生歓迎」マークがある場合",
    welcomeSuffix: " / 留学生歓迎",
    otherLinks: "その他のリンク",
    firstPage: "最初のページ",
    previousPages: "前の5ページ",
    nextPages: "次の5ページ",
    lastPage: "最後のページ",
    noResults: "条件に一致するサークルがありません。",
    loading: "データを読み込み中...",
    schoolOfficial: "学校公式サイト",
    navHome: "ホーム",
    navDirectory: "Directory",
    navAbout: "このサイトについて",
    navFaq: "FAQ",
    aboutTitle: "このサイトについて",
    aboutCopy: [
      "このサイトは、早稲田大学公式サークルガイドの公開情報をもとに、サークルを検索・比較しやすく整理したディレクトリです。",
      "カテゴリ、活動日、所属人数、外国人学生の在籍状況、留学生歓迎マークなどを組み合わせて、自分に合うサークルを探せます。",
      "各サークルの詳細情報と外部リンクは公式掲載内容を基準にしています。リンク切れや非公開リンクは削除せず、確認できる範囲で状態を管理します。",
    ],
    faqTitle: "FAQ",
    faqItems: [
      ["掲載情報はどこから取得していますか？", "早稲田大学公式サークルガイドに掲載されている公開情報を基準にしています。"],
      ["「外国人学生の在籍」と「留学生歓迎マークあり」の違いは何ですか？", "「外国人学生の在籍」は掲載人数が1人以上の場合に表示されます。「留学生歓迎マークあり」は公式サイト上に歓迎マークが掲載されている場合に表示されます。"],
      ["活動日はどのように判定していますか？", "公式掲載の「活動日時・場所」から曜日表記を自動判定しています。複数の曜日を選ぶと、選択した曜日のいずれかに活動するサークルを表示します。"],
      ["リンクが開けない場合はどうすればよいですか？", "外部リンクは非公開、削除、または一時停止になっている場合があります。最新情報は学校公式サイトや各サークルの公式リンクで確認してください。"],
    ],
  },
  ko: {
    brand: "와세다 서클",
    heroTitle: "와세다대학교 서클 디렉터리",
    heroCopy: "공식 서클 가이드 정보를 바탕으로 카테고리, 인원, 외국인 학생 수용 여부로 검색할 수 있습니다.",
    search: "검색",
    category: "메인 카테고리",
    subcategory: "서브 카테고리",
    day: "활동일",
    dayHelp: "선택한 요일 중 하나라도 활동하는 서클을 표시",
    irregularHelp: "부정기: 활동일이 고정되어 있지 않은 서클",
    foreignerEnrolled: "외국인 학생 재적",
    welcomeMark: "유학생 환영 마크 있음",
    sort: "인원순",
    reset: "초기화",
    all: "전체",
    chooseCategory: "카테고리 선택",
    searchPlaceholder: "서클명・활동 내용",
    resultCount: (count) => `${count}개`,
    unavailable: "정보 없음",
    none: "없음",
    yes: "있음",
    memberCount: (value) => `${value}명`,
    foundedYear: (value) => `${value}년`,
    cardMembers: "인원",
    cardFounded: "설립",
    cardForeigner: "외국인",
    modalDescription: "활동 내용",
    modalDateTime: "활동 일시",
    modalActivityDay: "활동일",
    modalLocation: "장소",
    modalMembers: "소속 인원",
    modalFounded: "설립연도",
    modalForeigner: "외국인 학생 수용",
    modalWelcomeMark: "유학생 환영 마크",
    modalSiteMemo: "사이트 메모",
    foreignerCriteria: "※ 게재 기준: 수용 인원이 1명 이상이거나 공식 사이트에 ‘유학생 환영’ 마크가 있는 경우",
    welcomeSuffix: " / 유학생 환영",
    otherLinks: "기타 링크",
    firstPage: "첫 페이지",
    previousPages: "이전 5페이지",
    nextPages: "다음 5페이지",
    lastPage: "마지막 페이지",
    noResults: "조건에 맞는 서클이 없습니다.",
    loading: "데이터를 불러오는 중...",
    schoolOfficial: "학교 공식 사이트",
    navHome: "홈",
    navDirectory: "Directory",
    navAbout: "이 사이트에 대해",
    navFaq: "FAQ",
    aboutTitle: "이 사이트에 대해",
    aboutCopy: [
      "이 사이트는 와세다대학교 공식 서클 가이드의 공개 정보를 바탕으로 서클을 더 쉽게 검색하고 비교할 수 있도록 정리한 디렉터리입니다.",
      "카테고리, 활동일, 소속 인원, 외국인 학생 재적 여부, 유학생 환영 마크 등을 조합해 자신에게 맞는 서클을 찾을 수 있습니다.",
      "각 서클의 상세 정보와 외부 링크는 공식 게재 내용을 기준으로 합니다. 끊어진 링크나 비공개 링크는 삭제하지 않고 확인 가능한 범위에서 상태를 관리합니다.",
    ],
    faqTitle: "FAQ",
    faqItems: [
      ["정보는 어디에서 가져오나요?", "와세다대학교 공식 서클 가이드에 공개된 정보를 기준으로 합니다."],
      ["'외국인 학생 재적'과 '유학생 환영 마크 있음'은 무엇이 다른가요?", "'외국인 학생 재적'은 게재 인원이 1명 이상인 경우입니다. '유학생 환영 마크 있음'은 공식 사이트에 환영 마크가 표시된 경우입니다."],
      ["활동일은 어떻게 판단하나요?", "공식 게재 정보의 '활동일시/장소'에서 요일 표현을 자동 판정합니다. 여러 요일을 선택하면 선택한 요일 중 하나라도 활동하는 서클을 표시합니다."],
      ["링크가 열리지 않으면 어떻게 하나요?", "외부 링크는 비공개, 삭제, 일시정지 상태일 수 있습니다. 최신 정보는 학교 공식 사이트나 각 서클의 공식 링크에서 확인해 주세요."],
    ],
  },
  en: {
    brand: "Waseda Circles",
    heroTitle: "Waseda University Circle Directory",
    heroCopy: "Search official circle guide data by category, member count, and international student acceptance.",
    search: "Search",
    category: "Main category",
    subcategory: "Subcategory",
    day: "Activity day",
    dayHelp: "Show circles active on any selected day",
    irregularHelp: "Irregular: circles without a fixed activity day",
    foreignerEnrolled: "International students enrolled",
    welcomeMark: "Welcome mark shown",
    sort: "Members",
    reset: "Reset",
    all: "All",
    chooseCategory: "Select a category",
    searchPlaceholder: "Circle name or activity",
    resultCount: (count) => `${count} results`,
    unavailable: "No information",
    none: "None",
    yes: "Yes",
    memberCount: (value) => `${value} members`,
    foundedYear: (value) => `${value}`,
    cardMembers: "Members",
    cardFounded: "Founded",
    cardForeigner: "International",
    modalDescription: "Activity details",
    modalDateTime: "Activity time",
    modalActivityDay: "Activity day",
    modalLocation: "Location",
    modalMembers: "Members",
    modalFounded: "Founded",
    modalForeigner: "International students accepted",
    modalWelcomeMark: "Welcome mark",
    modalSiteMemo: "Site note",
    foreignerCriteria: "Listed when at least one international student is accepted, or when the official site shows an international-student welcome mark.",
    welcomeSuffix: " / International students welcome",
    otherLinks: "Other links",
    firstPage: "First page",
    previousPages: "Previous 5 pages",
    nextPages: "Next 5 pages",
    lastPage: "Last page",
    noResults: "No circles match the selected conditions.",
    loading: "Loading data...",
    schoolOfficial: "University official page",
    navHome: "Home",
    navDirectory: "Directory",
    navAbout: "About",
    navFaq: "FAQ",
    aboutTitle: "About",
    aboutCopy: [
      "This directory organizes public information from the Waseda University Official Circles Guide so circles can be searched and compared more easily.",
      "You can combine category, activity day, member count, international student enrollment, and welcome-mark filters to find circles that fit your needs.",
      "Circle details and external links are based on the official listing. Broken or private links are kept with status notes instead of being silently removed.",
    ],
    faqTitle: "FAQ",
    faqItems: [
      ["Where does the information come from?", "The data is based on public listings in the Waseda University Official Circles Guide."],
      ["What is the difference between international student enrollment and the welcome mark?", "International student enrollment is shown when the listed number is one or more. The welcome mark is shown when the official site displays the international-student welcome mark."],
      ["How are activity days detected?", "Activity days are inferred from the official activity date/time and location text. If multiple days are selected, circles active on any selected day are shown."],
      ["What should I do if a link does not open?", "External links may be private, deleted, or temporarily unavailable. Check the university official page or each circle's official links for the latest information."],
    ],
  },
  zh: {
    brand: "早稻田社团",
    heroTitle: "早稻田大学社团目录",
    heroCopy: "基于官方社团指南，可按类别、人数和留学生接收情况搜索。",
    search: "搜索",
    category: "主类别",
    subcategory: "子类别",
    day: "活动日",
    dayHelp: "显示在所选星期中任意一天活动的社团",
    irregularHelp: "不定期: 活动日不固定的社团",
    foreignerEnrolled: "有留学生在籍",
    welcomeMark: "有留学生欢迎标记",
    sort: "按人数",
    reset: "重置",
    all: "全部",
    chooseCategory: "选择类别",
    searchPlaceholder: "社团名称・活动内容",
    resultCount: (count) => `${count}个结果`,
    unavailable: "暂无信息",
    none: "无",
    yes: "有",
    memberCount: (value) => `${value}人`,
    foundedYear: (value) => `${value}年`,
    cardMembers: "人数",
    cardFounded: "成立",
    cardForeigner: "留学生",
    modalDescription: "活动内容",
    modalDateTime: "活动时间",
    modalActivityDay: "活动日",
    modalLocation: "地点",
    modalMembers: "成员人数",
    modalFounded: "成立年份",
    modalForeigner: "留学生接收情况",
    modalWelcomeMark: "留学生欢迎标记",
    modalSiteMemo: "网站备注",
    foreignerCriteria: "※刊载标准：接收人数为1人以上，或官方网站显示“欢迎留学生”标记",
    welcomeSuffix: " / 欢迎留学生",
    otherLinks: "其他链接",
    firstPage: "第一页",
    previousPages: "前5页",
    nextPages: "后5页",
    lastPage: "最后一页",
    noResults: "没有符合条件的社团。",
    loading: "正在加载数据...",
    schoolOfficial: "学校官方网站",
    navHome: "首页",
    navDirectory: "Directory",
    navAbout: "关于本站",
    navFaq: "FAQ",
    aboutTitle: "关于本站",
    aboutCopy: [
      "本网站基于早稻田大学官方社团指南的公开信息，整理成便于搜索和比较的社团目录。",
      "可以组合类别、活动日、人数、留学生在籍情况和留学生欢迎标记等条件，寻找适合自己的社团。",
      "各社团详情和外部链接以官方刊载内容为准。失效或非公开链接不会直接删除，而是在可确认范围内记录状态。",
    ],
    faqTitle: "FAQ",
    faqItems: [
      ["信息来自哪里？", "数据基于早稻田大学官方社团指南中公开刊载的信息。"],
      ["“有留学生在籍”和“有留学生欢迎标记”有什么区别？", "“有留学生在籍”表示刊载人数为1人以上。“有留学生欢迎标记”表示官方页面显示了留学生欢迎标记。"],
      ["活动日如何判定？", "系统会从官方刊载的活动日期、时间和地点文本中自动判定星期。选择多个星期时，会显示在任意所选星期活动的社团。"],
      ["链接打不开怎么办？", "外部链接可能为非公开、已删除或暂时不可用。请通过学校官方网站或各社团官方链接确认最新信息。"],
    ],
  },
};

UI_TEXT["zh-yue"] = UI_TEXT.zh;

const CATEGORY_LABELS = {
  ja: {
    "スポーツ（球技）": "スポーツ（球技）",
    "スポーツ（球技以外）": "スポーツ（球技以外）",
    "文化・芸術": "文化・芸術",
    "学問": "学問",
    "メディア・出版": "メディア・出版",
    "国際交流・ボランティア": "国際交流・ボランティア",
    "その他": "その他",
  },
  ko: {
    "スポーツ（球技）": "스포츠(구기)",
    "スポーツ（球技以外）": "스포츠(구기 외)",
    "文化・芸術": "문화・예술",
    "学問": "학문",
    "メディア・出版": "미디어・출판",
    "国際交流・ボランティア": "국제교류・봉사",
    "その他": "기타",
  },
  en: {
    "スポーツ（球技）": "Sports (ball games)",
    "スポーツ（球技以外）": "Sports (non-ball games)",
    "文化・芸術": "Culture and arts",
    "学問": "Academics",
    "メディア・出版": "Media and publishing",
    "国際交流・ボランティア": "International exchange and volunteering",
    "その他": "Other",
  },
  zh: {
    "スポーツ（球技）": "体育（球类）",
    "スポーツ（球技以外）": "体育（非球类）",
    "文化・芸術": "文化・艺术",
    "学問": "学术",
    "メディア・出版": "媒体・出版",
    "国際交流・ボランティア": "国际交流・志愿服务",
    "その他": "其他",
  },
};

const SUBCATEGORY_LABELS = {
  en: {
    "野球": "Baseball", "サッカー": "Soccer", "フットサル": "Futsal", "ラグビー": "Rugby", "アメリカンフットボール": "American football", "バスケットボール": "Basketball", "テニス": "Tennis", "バレーボール": "Volleyball", "ゴルフ": "Golf", "その他の球技": "Other ball games",
    "バドミントン": "Badminton", "ダンス": "Dance", "武道": "Martial arts", "乗馬": "Equestrian", "ヨット": "Yachting", "スキー": "Skiing", "水泳": "Swimming", "サイクリング": "Cycling", "アウトドア": "Outdoor", "その他のスポーツ": "Other sports",
    "舞台芸術": "Performing arts", "演劇": "Theater", "映画": "Film", "音楽": "Music", "声楽": "Vocal music", "美術": "Fine arts", "その他の文化": "Other culture",
    "政治": "Politics", "経済": "Economics", "歴史": "History", "宗教": "Religion", "哲学": "Philosophy", "法律": "Law", "自然科学": "Natural sciences", "言語": "Languages", "日本文学": "Japanese literature", "日本文化": "Japanese culture", "学問": "Academics", "趣味": "Hobbies", "技術": "Technology",
    "出版": "Publishing", "コミュニケーション": "Communication", "マスメディア": "Mass media", "企画": "Planning", "レクリエーション": "Recreation",
    "国際交流": "International exchange", "ボランティア": "Volunteering", "学生稲門会": "Student Tomonkai",
  },
  ko: {
    "野球": "야구", "サッカー": "축구", "フットサル": "풋살", "ラグビー": "럭비", "アメリカンフットボール": "미식축구", "バスケットボール": "농구", "テニス": "테니스", "バレーボール": "배구", "ゴルフ": "골프", "その他の球技": "기타 구기",
    "バドミントン": "배드민턴", "ダンス": "댄스", "武道": "무도", "乗馬": "승마", "ヨット": "요트", "スキー": "스키", "水泳": "수영", "サイクリング": "사이클링", "アウトドア": "아웃도어", "その他のスポーツ": "기타 스포츠",
    "舞台芸術": "무대예술", "演劇": "연극", "映画": "영화", "音楽": "음악", "声楽": "성악", "美術": "미술", "その他の文化": "기타 문화",
    "政治": "정치", "経済": "경제", "歴史": "역사", "宗教": "종교", "哲学": "철학", "法律": "법률", "自然科学": "자연과학", "言語": "언어", "日本文学": "일본문학", "日本文化": "일본문화", "学問": "학문", "趣味": "취미", "技術": "기술",
    "出版": "출판", "コミュニケーション": "커뮤니케이션", "マスメディア": "매스미디어", "企画": "기획", "レクリエーション": "레크리에이션",
    "国際交流": "국제교류", "ボランティア": "봉사", "学生稲門会": "학생 도몬회",
  },
  zh: {
    "野球": "棒球", "サッカー": "足球", "フットサル": "五人制足球", "ラグビー": "橄榄球", "アメリカンフットボール": "美式足球", "バスケットボール": "篮球", "テニス": "网球", "バレーボール": "排球", "ゴルフ": "高尔夫", "その他の球技": "其他球类",
    "バドミントン": "羽毛球", "ダンス": "舞蹈", "武道": "武道", "乗馬": "马术", "ヨット": "帆船", "スキー": "滑雪", "水泳": "游泳", "サイクリング": "骑行", "アウトドア": "户外", "その他のスポーツ": "其他体育",
    "舞台芸術": "舞台艺术", "演劇": "戏剧", "映画": "电影", "音楽": "音乐", "声楽": "声乐", "美術": "美术", "その他の文化": "其他文化",
    "政治": "政治", "経済": "经济", "歴史": "历史", "宗教": "宗教", "哲学": "哲学", "法律": "法律", "自然科学": "自然科学", "言語": "语言", "日本文学": "日本文学", "日本文化": "日本文化", "学問": "学术", "趣味": "兴趣", "技術": "技术",
    "出版": "出版", "コミュニケーション": "交流", "マスメディア": "大众媒体", "企画": "策划", "レクリエーション": "休闲",
    "国際交流": "国际交流", "ボランティア": "志愿服务", "学生稲門会": "学生稻门会",
  },
};

const DAY_LABELS = {
  ja: { 月: "月", 火: "火", 水: "水", 木: "木", 金: "金", 土: "土", 日: "日", 平日: "平日", 週末: "週末", 不定期: "不定期" },
  ko: { 月: "월", 火: "화", 水: "수", 木: "목", 金: "금", 土: "토", 日: "일", 平日: "평일", 週末: "주말", 不定期: "부정기" },
  en: { 月: "Mon", 火: "Tue", 水: "Wed", 木: "Thu", 金: "Fri", 土: "Sat", 日: "Sun", 平日: "Weekdays", 週末: "Weekend", 不定期: "Irregular" },
  zh: { 月: "周一", 火: "周二", 水: "周三", 木: "周四", 金: "周五", 土: "周六", 日: "周日", 平日: "平日", 週末: "周末", 不定期: "不定期" },
};

CATEGORY_LABELS["zh-yue"] = CATEGORY_LABELS.zh;
SUBCATEGORY_LABELS["zh-yue"] = SUBCATEGORY_LABELS.zh;
DAY_LABELS["zh-yue"] = DAY_LABELS.zh;

function t(key) {
  return UI_TEXT[state.language][key] || UI_TEXT.ja[key] || key;
}

function callText(key, value) {
  const entry = t(key);
  return typeof entry === "function" ? entry(value) : entry;
}

function categoryLabel(value) {
  return CATEGORY_LABELS[state.language]?.[value] || value;
}

function subcategoryLabel(value) {
  return SUBCATEGORY_LABELS[state.language]?.[value] || value;
}

function dayLabel(value) {
  return DAY_LABELS[state.language]?.[value] || value;
}

const DAY_GROUPS = {
  平日: ["月", "火", "水", "木", "金"],
  週末: ["土", "日"],
};

const els = {
  grid: document.getElementById("grid"),
  loading: document.getElementById("loading"),
  error: document.getElementById("error"),
  noresults: document.getElementById("noresults"),
  pagination: document.getElementById("pagination"),
  search: document.getElementById("searchInput"),
  category: document.getElementById("categorySelect"),
  subcategory: document.getElementById("subcategorySelect"),
  dayFilters: document.getElementById("dayFilters"),
  resetDays: document.getElementById("resetDays"),
  language: document.getElementById("languageSelect"),
  foreignerEnrolled: document.getElementById("foreignerEnrolledToggle"),
  welcomeMark: document.getElementById("welcomeMarkToggle"),
  sortMembers: document.getElementById("sortMembers"),
  reset: document.getElementById("resetFilters"),
  count: document.getElementById("resultCount"),
  template: document.getElementById("cardTemplate"),
  modal: document.getElementById("modal"),
  modalClose: document.getElementById("modalClose"),
  modalImage: document.getElementById("modalImage"),
  modalCategory: document.getElementById("modalCategory"),
  modalTitle: document.getElementById("modalTitle"),
  modalOfficialLink: document.getElementById("modalOfficialLink"),
  modalDetails: document.getElementById("modalDetails"),
};

function isPresent(value) {
  return !MISSING_VALUES.has(String(value ?? "").trim());
}

function safeUrl(value) {
  if (!isPresent(value)) return "";
  try {
    const url = new URL(String(value).trim(), window.location.href);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function isNoInfoValue(value) {
  return !isPresent(value) || ["なし", "情報なし"].includes(String(value).trim());
}

function localizeSimpleValue(value) {
  const text = String(value ?? "").trim();
  if (isNoInfoValue(text)) return text === "情報なし" ? t("unavailable") : t("none");
  return text;
}

function formatMemberCount(value) {
  if (isNoInfoValue(value)) return t("unavailable");
  const count = extractNumber(value);
  return count ? callText("memberCount", count) : String(value);
}

function formatFoundedYear(value) {
  if (isNoInfoValue(value)) return t("unavailable");
  const year = extractNumber(value);
  return year ? callText("foundedYear", year) : String(value);
}

function formatActivityDays(days) {
  return days.length ? days.map(dayLabel).join(" / ") : t("unavailable");
}

function formatForeigner(record) {
  const count = extractNumber(record.foreignerRaw);
  const base = count ? callText("memberCount", count) : localizeSimpleValue(record.foreignerRaw);
  return `${base}${record.foreignerWelcomeMark ? t("welcomeSuffix") : ""}`;
}

function parseCSV(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") {
      cell += ch;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const headers = rows.shift().map((header) => header.replace(/^\uFEFF/, "").trim());
  return rows
    .filter((cells) => cells.some((cell) => cell.trim()))
    .map((cells) => Object.fromEntries(headers.map((header, i) => [header, (cells[i] ?? "").trim()])));
}

function extractNumber(value) {
  const normalized = String(value ?? "").replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
  const match = normalized.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function extractActivityDays(value) {
  const text = String(value ?? "");
  const days = new Set();
  if (/不定期|随時|イベント|開催時|未定|応相談|曜日不定/.test(text)) days.add("不定期");
  if (/毎日|全日/.test(text)) ["月", "火", "水", "木", "金", "土", "日"].forEach((day) => days.add(day));
  if (/平日/.test(text)) DAY_GROUPS.平日.forEach((day) => days.add(day));
  if (/週末|土日|休日/.test(text)) DAY_GROUPS.週末.forEach((day) => days.add(day));
  const patterns = {
    月: /月曜|月曜日|月[・,、\s／\/〜~\-]/,
    火: /火曜|火曜日|火[・,、\s／\/〜~\-]/,
    水: /水曜|水曜日|水[・,、\s／\/〜~\-]/,
    木: /木曜|木曜日|木[・,、\s／\/〜~\-]/,
    金: /金曜|金曜日|金[・,、\s／\/〜~\-]/,
    土: /土曜|土曜日|土[・,、\s／\/〜~\-]/,
    日: /日曜|日曜日|(?<!曜)日[・,、\s／\/〜~\-]/,
  };
  Object.entries(patterns).forEach(([day, pattern]) => {
    if (pattern.test(text)) days.add(day);
  });
  return [...days];
}

function splitSchedule(value) {
  const schedule = isPresent(value) ? String(value).trim() : "情報なし";
  if (schedule === "情報なし") {
    return { dateTime: "情報なし", location: "情報なし" };
  }

  const slashParts = schedule.split(/[\/／]/).map((part) => part.trim()).filter(Boolean);
  if (slashParts.length >= 2) {
    return {
      dateTime: slashParts.slice(0, -1).join(" / "),
      location: slashParts.at(-1),
    };
  }

  const commaParts = schedule.split(/[、，]/).map((part) => part.trim()).filter(Boolean);
  if (commaParts.length >= 2) {
    return {
      dateTime: commaParts.slice(0, -1).join("、"),
      location: commaParts.at(-1),
    };
  }

  return { dateTime: schedule, location: "情報なし" };
}

function imageList(value) {
  if (!isPresent(value)) return [FALLBACK_IMAGE];
  const urls = value.split(",").map((item) => item.trim()).filter(Boolean);
  return urls.length ? urls : [FALLBACK_IMAGE];
}

function cleanLinkLabel(label) {
  return String(label || "その他")
    .replace(/[\uE000-\uF8FF╢]/g, "")
    .replace(/\s+/g, " ")
    .trim() || "その他";
}

function parseOtherLinks(value) {
  if (!isPresent(value)) return [];
  const text = String(value);
  const matches = [...text.matchAll(/([^:;]+):\s*(https?:\/\/[^;\s]+)/g)];
  if (matches.length) {
    return matches.map((match) => ({
      label: cleanLinkLabel(match[1]),
      url: match[2],
      group: "その他",
    }));
  }
  const urls = text.match(/https?:\/\/[^\s,;]+/g) || [];
  return urls.map((url) => ({ label: "その他", url, group: "その他" }));
}

function translatedValue(translation, row, column) {
  return isPresent(translation?.[column]) ? translation[column] : row[column];
}

function normalizeRow(row, translation = {}) {
  const displaySchedule = translatedValue(translation, row, "活動日時・場所");
  const scheduleParts = splitSchedule(displaySchedule);
  return {
    id: row.circle_id,
    wasedaId: row.waseda_id,
    name: translatedValue(translation, row, "名前") || "名称不明",
    mainCategory: translatedValue(translation, row, "メインカテゴリ") || "その他",
    subcategory: translatedValue(translation, row, "サブカテゴリ") || "その他",
    categoryKey: row["メインカテゴリ"] || "その他",
    subcategoryKey: row["サブカテゴリ"] || "その他",
    description: translatedValue(translation, row, "活動内容") || "情報なし",
    schedule: displaySchedule || "情報なし",
    activityDateTime: scheduleParts.dateTime,
    location: scheduleParts.location,
    activityDays: extractActivityDays(row["活動日時・場所"]),
    membersRaw: row["所属人数"] || "情報なし",
    membersNumber: extractNumber(row["所属人数"]),
    founded: row["設立年"] || "情報なし",
    foreignerRaw: row["外国人学生の受け入れ"] || "情報なし",
    foreignerNumber: extractNumber(row["外国人学生の受け入れ"]),
    foreignerWelcomeMark: row["外国人学生歓迎マーク"] === "あり",
    foreignerAccepted: extractNumber(row["外国人学生の受け入れ"]) > 0 || row["外国人学生歓迎マーク"] === "あり",
    images: imageList(row["写真URL"]),
    siteMemo: translatedValue(translation, row, "サイトメモ") || "なし",
    schoolUrl: row["ウェブサイト（学校）"],
    note: row.note || "なし",
    remarks: row["備考"] || "なし",
    links: {
      "Web": row["ウェブサイト（サークル）"],
      "Instagram": row.Instagram,
      "X": row.X,
      "Facebook": row.Facebook,
      "LINE": row.LINE,
      "Waseda Weekly": row["Waseda Weekly"],
      "YouTube": row.YouTube,
      "TikTok": row.TikTok,
      "note": row.note,
      "その他": row["その他のリンク"],
    },
  };
}

function buildRecordsForLanguage(language) {
  const translations = state.translations[language] || {};
  return state.baseRows.map((row) => normalizeRow(row, translations[row.circle_id]));
}

function renderSubcategories() {
  const selected = els.category.value;
  const subcategories = SUBCATEGORIES[selected] || [];
  els.subcategory.replaceChildren();
  if (!subcategories.length) {
    els.subcategory.disabled = true;
    els.subcategory.append(new Option(t("chooseCategory"), ""));
    return;
  }
  els.subcategory.disabled = false;
  els.subcategory.append(new Option(t("all"), ""));
  subcategories.forEach((subcategory) => els.subcategory.append(new Option(subcategoryLabel(subcategory), subcategory)));
}

function applyFilters() {
  if (els.search.value.length > MAX_SEARCH_LENGTH) {
    els.search.value = els.search.value.slice(0, MAX_SEARCH_LENGTH);
  }
  const query = els.search.value.trim().toLowerCase();
  const category = els.category.value;
  const subcategory = els.subcategory.value;
  const selectedDays = getSelectedDays();
  state.filtered = state.records.filter((record) => {
    if (category && record.categoryKey !== category) return false;
    if (subcategory && record.subcategoryKey !== subcategory) return false;
    if (selectedDays.length) {
      const expectedDays = selectedDays.flatMap((day) => DAY_GROUPS[day] || [day]);
      if (!expectedDays.some((expectedDay) => record.activityDays.includes(expectedDay))) return false;
    }
    if (els.foreignerEnrolled.checked && record.foreignerNumber <= 0) return false;
    if (els.welcomeMark.checked && !record.foreignerWelcomeMark) return false;
    if (query) {
      const haystack = [record.name, record.description, record.subcategory, record.schedule, record.categoryKey, record.subcategoryKey].join(" ").toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
  if (state.sortMembers) {
    state.filtered.sort((a, b) => b.membersNumber - a.membersNumber);
  }
  state.page = 1;
  render();
}

function getSelectedDays() {
  return [...els.dayFilters.querySelectorAll("input:checked")].map((input) => input.value);
}

function makeLinks(record) {
  return Object.entries(record.links)
    .flatMap(([label, value]) => {
      if (!isPresent(value)) return [];
      if (label === "その他") return parseOtherLinks(value);
      const urls = String(value).match(/https?:\/\/[^\s,]+/g) || [];
      return urls.map((url) => ({ label, url }));
    });
}

function appendMeta(dl, label, value) {
  const dt = document.createElement("dt");
  const dd = document.createElement("dd");
  dt.textContent = label;
  dd.textContent = value;
  if (label === t("modalForeigner")) {
    dd.classList.add("criteria-note");
  }
  dl.append(dt, dd);
}

function setupImageCarousel(container, images) {
  let index = 0;
  const prev = container.querySelector(".image-arrow-prev");
  const next = container.querySelector(".image-arrow-next");
  const hasMultipleImages = images.length > 1;

  const update = () => {
    container.style.backgroundImage = `url("${images[index]}")`;
    prev.disabled = !hasMultipleImages;
    next.disabled = !hasMultipleImages;
  };

  const move = (delta, event) => {
    event.stopPropagation();
    event.currentTarget.blur();
    if (!hasMultipleImages) return;
    index = (index + delta + images.length) % images.length;
    update();
  };

  prev.onclick = (event) => move(-1, event);
  next.onclick = (event) => move(1, event);
  update();
}

function renderCard(record) {
  const node = els.template.content.firstElementChild.cloneNode(true);
  setupImageCarousel(node.querySelector(".card-image"), record.images);
  node.querySelector(".card-kicker").textContent = `${record.mainCategory} / ${record.subcategory}`;
  node.querySelector("h3").textContent = record.name;
  node.querySelector(".card-description").textContent = record.description;
  const meta = node.querySelector(".card-meta");
  appendMeta(meta, t("cardMembers"), formatMemberCount(record.membersRaw));
  appendMeta(meta, t("cardFounded"), formatFoundedYear(record.founded));
  appendMeta(meta, t("cardForeigner"), formatForeigner(record));
  const officialSlot = node.querySelector(".official-link-slot");
  const officialLink = createOfficialLink(record);
  if (officialLink) officialSlot.append(officialLink);
  const linkRow = node.querySelector(".link-row");
  appendLinks(linkRow, record, 4);
  node.addEventListener("click", (event) => {
    if (event.target.closest("a, summary, button")) return;
    openModal(record);
  });
  return node;
}

function createLink(link) {
  const url = safeUrl(link.url);
  if (!url) return null;
  const a = document.createElement("a");
  a.className = "link-button";
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = link.label;
  return a;
}

function createLinkMenu(label, links) {
  const details = document.createElement("details");
  details.className = "link-menu";
  const summary = document.createElement("summary");
  summary.className = "link-button";
  summary.textContent = label;
  const list = document.createElement("div");
  list.className = "link-menu-list";
  links.forEach((link) => {
    const url = safeUrl(link.url);
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = link.label;
    list.append(a);
  });
  details.append(summary, list);
  return details;
}

function appendLinks(container, record, limit = Infinity) {
  const links = makeLinks(record);
  const regularLinks = links.filter((link) => link.group !== "その他");
  const otherLinks = links.filter((link) => link.group === "その他");
  const nodes = regularLinks.map(createLink).filter(Boolean);

  if (otherLinks.length === 1) {
    nodes.push(createLink(otherLinks[0]));
  } else if (otherLinks.length > 1) {
    nodes.push(createLinkMenu(t("otherLinks"), otherLinks));
  }

  nodes.slice(0, limit).forEach((node) => container.append(node));
}

function createOfficialLink(record) {
  const url = safeUrl(record.schoolUrl);
  if (!url) return null;
  const a = document.createElement("a");
  a.className = "official-link";
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";
  a.textContent = t("schoolOfficial");
  return a;
}

function render() {
  const total = state.filtered.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  state.page = Math.min(state.page, pages);
  const start = (state.page - 1) * PAGE_SIZE;
  const pageItems = state.filtered.slice(start, start + PAGE_SIZE);

  els.grid.replaceChildren();
  pageItems.forEach((record) => els.grid.append(renderCard(record)));
  els.noresults.hidden = total !== 0;
  els.count.textContent = callText("resultCount", total);

  els.pagination.replaceChildren();
  if (pages > 1) {
    renderPaginationButtons(pages);
  }
}

function appendPageButton(label, page, options = {}) {
  const button = document.createElement("button");
  button.className = `page-btn${options.active ? " active" : ""}`;
  button.type = "button";
  button.textContent = label;
  button.disabled = options.disabled;
  if (options.label) button.setAttribute("aria-label", options.label);
  button.addEventListener("click", () => {
    state.page = page;
    render();
  });
  els.pagination.append(button);
}

function renderPaginationButtons(pages) {
  const groupStart = Math.floor((state.page - 1) / 5) * 5 + 1;
  const groupEnd = Math.min(groupStart + 4, pages);
  appendPageButton("<<", 1, { disabled: state.page === 1, label: t("firstPage") });
  appendPageButton("<", Math.max(1, groupStart - 5), { disabled: groupStart === 1, label: t("previousPages") });
  for (let i = groupStart; i <= groupEnd; i++) {
    appendPageButton(String(i), i, { active: i === state.page });
  }
  appendPageButton(">", Math.min(pages, groupEnd + 1), { disabled: groupEnd === pages, label: t("nextPages") });
  appendPageButton(">>", pages, { disabled: state.page === pages, label: t("lastPage") });
}

function openModal(record) {
  setupImageCarousel(els.modalImage, record.images);
  els.modalCategory.textContent = `${record.mainCategory} / ${record.subcategory}`;
  els.modalTitle.textContent = record.name;
  els.modalOfficialLink.replaceChildren();
  const officialLink = createOfficialLink(record);
  if (officialLink) els.modalOfficialLink.append(officialLink);
  appendLinks(els.modalOfficialLink, record);
  els.modalDetails.replaceChildren();
  [
    [t("modalDescription"), record.description],
    [t("modalDateTime"), localizeSimpleValue(record.activityDateTime)],
    [t("modalActivityDay"), formatActivityDays(record.activityDays)],
    [t("modalLocation"), localizeSimpleValue(record.location)],
    [t("modalMembers"), formatMemberCount(record.membersRaw)],
    [t("modalFounded"), formatFoundedYear(record.founded)],
    [t("modalForeigner"), `${formatForeigner(record)} ${t("foreignerCriteria")}`],
    [t("modalWelcomeMark"), record.foreignerWelcomeMark ? t("yes") : t("none")],
    [t("modalSiteMemo"), localizeSimpleValue(record.siteMemo)],
    ["note", localizeSimpleValue(record.note)],
  ].forEach(([label, value]) => appendMeta(els.modalDetails, label, value));
  els.modal.hidden = false;
}

function closeModal() {
  els.modal.hidden = true;
}

function setText(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
}

function setTextAll(selector, values) {
  document.querySelectorAll(selector).forEach((el, index) => {
    if (values[index]) el.textContent = values[index];
  });
}

function scrollToTop(event) {
  event.preventDefault();
  history.replaceState(null, "", `${location.pathname}${location.search}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function applyLanguage() {
  document.documentElement.lang = state.language === "ko" ? "ko" : state.language === "zh-yue" ? "zh-Hant-HK" : state.language === "zh" ? "zh-Hans" : state.language === "en" ? "en" : "ja";
  document.title = t("heroTitle");
  setText(".brand", t("brand"));
  setTextAll(".nav-links > a", [t("navHome"), t("navDirectory"), t("navAbout"), t("navFaq")]);
  setText(".hero h1", t("heroTitle"));
  setText(".hero p", t("heroCopy"));
  setText('label[for="searchInput"]', t("search"));
  els.search.placeholder = t("searchPlaceholder");
  setText('label[for="categorySelect"]', t("category"));
  setText('label[for="subcategorySelect"]', t("subcategory"));
  [...els.category.options].forEach((option) => {
    option.textContent = option.value ? categoryLabel(option.value) : t("all");
  });
  [...els.dayFilters.querySelectorAll("label")].forEach((label) => {
    const input = label.querySelector("input");
    const span = label.querySelector("span");
    if (input && span) span.textContent = dayLabel(input.value);
  });
  setText(".filter-label-row span", t("day"));
  setText("#dayFilterHelp", t("dayHelp"));
  setText("#irregularHelp", t("irregularHelp"));
  const irregularLabel = els.dayFilters.querySelector('input[value="不定期"]')?.closest("label");
  if (irregularLabel) irregularLabel.title = t("irregularHelp").replace(/^不定期:\s*/, "");
  setText("#foreignerEnrolledToggle + span", t("foreignerEnrolled"));
  setText("#welcomeMarkToggle + span", t("welcomeMark"));
  els.sortMembers.textContent = t("sort");
  els.reset.textContent = t("reset");
  els.resetDays.textContent = t("reset");
  els.noresults.textContent = t("noResults");
  if (!els.loading.hidden) els.loading.textContent = t("loading");
  setText("#about h2", t("aboutTitle"));
  setTextAll("#about p", t("aboutCopy"));
  setText("#faq h2", t("faqTitle"));
  document.querySelectorAll(".faq-item").forEach((item, index) => {
    const faqItem = t("faqItems")[index];
    if (!faqItem) return;
    item.querySelector("h3").textContent = faqItem[0];
    item.querySelector("p").textContent = faqItem[1];
  });
  state.records = buildRecordsForLanguage(state.language);
  renderSubcategories();
  applyFilters();
  render();
}

async function init() {
  try {
    const response = await fetch(`${CSV_URL}?v=${Date.now()}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.baseRows = parseCSV(await response.text());
    const translationEntries = await Promise.all(Object.entries(TRANSLATION_URLS).map(async ([language, url]) => {
      const translationResponse = await fetch(`${url}?v=${Date.now()}`);
      if (!translationResponse.ok) throw new Error(`${language} translation HTTP ${translationResponse.status}`);
      const rows = parseCSV(await translationResponse.text());
      return [language, Object.fromEntries(rows.map((row) => [row.circle_id, row]))];
    }));
    state.translations = Object.fromEntries(translationEntries);
    state.records = buildRecordsForLanguage(state.language);
    state.filtered = state.records.slice();
    els.loading.hidden = true;
    renderSubcategories();
    applyLanguage();
    render();
  } catch (error) {
    els.loading.hidden = true;
    els.error.hidden = false;
    els.error.textContent = `データを読み込めませんでした: ${error.message}`;
  }
}

els.search.addEventListener("input", applyFilters);
els.category.addEventListener("change", () => {
  renderSubcategories();
  applyFilters();
});
els.subcategory.addEventListener("change", applyFilters);
els.dayFilters.addEventListener("change", applyFilters);
els.resetDays.addEventListener("click", () => {
  els.dayFilters.querySelectorAll("input").forEach((input) => {
    input.checked = false;
  });
  applyFilters();
});
els.language.addEventListener("change", () => {
  state.language = els.language.value;
  applyLanguage();
});
els.foreignerEnrolled.addEventListener("change", applyFilters);
els.welcomeMark.addEventListener("change", applyFilters);
els.sortMembers.addEventListener("click", () => {
  state.sortMembers = !state.sortMembers;
  els.sortMembers.classList.toggle("active", state.sortMembers);
  applyFilters();
});
els.reset.addEventListener("click", () => {
  els.search.value = "";
  els.category.value = "";
  els.dayFilters.querySelectorAll("input").forEach((input) => {
    input.checked = false;
  });
  els.subcategory.replaceChildren(new Option(t("chooseCategory"), ""));
  els.subcategory.disabled = true;
  els.foreignerEnrolled.checked = false;
  els.welcomeMark.checked = false;
  state.sortMembers = false;
  els.sortMembers.classList.remove("active");
  applyFilters();
});
els.modalClose.addEventListener("click", closeModal);
els.modal.addEventListener("click", (event) => {
  if (event.target === els.modal) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});
document.querySelectorAll("[data-scroll-top]").forEach((link) => {
  link.addEventListener("click", scrollToTop);
});

init();
