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

function t(key) {
  return UI_TEXT[state.language][key] || UI_TEXT.ja[key] || key;
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
    els.subcategory.append(new Option("カテゴリを選択", ""));
    return;
  }
  els.subcategory.disabled = false;
  els.subcategory.append(new Option("すべて", ""));
  subcategories.forEach((subcategory) => els.subcategory.append(new Option(subcategory, subcategory)));
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
  if (label === "外国人学生の受け入れ") {
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
  appendMeta(meta, "人数", record.membersRaw);
  appendMeta(meta, "設立", record.founded);
  appendMeta(meta, "外国人", `${record.foreignerRaw}${record.foreignerWelcomeMark ? " / 留学生歓迎" : ""}`);
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
    nodes.push(createLinkMenu("その他のリンク", otherLinks));
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
  els.count.textContent = `${total}件`;

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
  appendPageButton("<<", 1, { disabled: state.page === 1, label: "最初のページ" });
  appendPageButton("<", Math.max(1, groupStart - 5), { disabled: groupStart === 1, label: "前の5ページ" });
  for (let i = groupStart; i <= groupEnd; i++) {
    appendPageButton(String(i), i, { active: i === state.page });
  }
  appendPageButton(">", Math.min(pages, groupEnd + 1), { disabled: groupEnd === pages, label: "次の5ページ" });
  appendPageButton(">>", pages, { disabled: state.page === pages, label: "最後のページ" });
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
    ["活動内容", record.description],
    ["活動日時", record.activityDateTime],
    ["活動日", record.activityDays.length ? record.activityDays.join("・") : "情報なし"],
    ["場所", record.location],
    ["所属人数", record.membersRaw],
    ["設立年", record.founded],
    ["外国人学生の受け入れ", `${record.foreignerRaw} ※掲載基準: 受け入れ人数が1人以上、または公式サイトに「留学生歓迎」マークがある場合`],
    ["留学生歓迎マーク", record.foreignerWelcomeMark ? "あり" : "なし"],
    ["サイトメモ", record.siteMemo],
    ["note", record.note],
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
  setText(".brand", t("brand"));
  setTextAll(".nav-links > a", [t("navHome"), t("navDirectory"), t("navAbout"), t("navFaq")]);
  setText(".hero h1", t("heroTitle"));
  setText(".hero p", t("heroCopy"));
  setText('label[for="searchInput"]', t("search"));
  setText('label[for="categorySelect"]', t("category"));
  setText('label[for="subcategorySelect"]', t("subcategory"));
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
  els.subcategory.replaceChildren(new Option("カテゴリを選択", ""));
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
