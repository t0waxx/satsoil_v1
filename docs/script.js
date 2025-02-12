/****************************************************
 * 言語切替機能
 ****************************************************/
let currentLang = "ja";

const translations = {
  ja: {
    "logo": "SATSOIL",
    "nav.home": "ダッシュボード",
    "nav.search": "農地検索",
    "nav.mypage": "投資ポートフォリオ",
    "section.home.title": "ダッシュボード",
    "section.home.recommended": "注目の農地",
    "section.home.alerts": "最新市場レポート",
    "section.search.title": "農地検索",
    "section.search.regionGroup": "地域グループ:",
    "section.search.regionDetail": "地域詳細:",
    "section.search.evalRange": "評価スコア範囲:",
    "section.search.soil": "土壌pH:",
    "section.search.floodRisk": "洪水リスク:",
    "section.search.crop": "作物:",
    "section.search.irrigation": "灌漑設備充実度:",
    "section.search.accessibility": "交通アクセス利便性:",
    "section.search.cropVariety": "作付け多様性:",
    "section.search.search": "検索",
    "section.detail.simulation": "投資シミュレーション",
    "section.detail.ddReport": "DDレポート生成",
    "section.detail.investFlow": "投資手続きへ",
    "section.ddReport.title": "DDレポート",
    "section.ddReport.back": "戻る",
    "section.investFlow.title": "投資手続き",
    "section.mypage.title": "投資ポートフォリオ"
  },
  en: {
    "logo": "SATSOIL",
    "nav.home": "Dashboard",
    "nav.search": "Farm Search",
    "nav.mypage": "Investment Portfolio",
    "section.home.title": "Dashboard",
    "section.home.recommended": "Featured Farms",
    "section.home.alerts": "Latest Market Reports",
    "section.search.title": "Farm Search",
    "section.search.regionGroup": "Region Group:",
    "section.search.regionDetail": "Region Detail:",
    "section.search.evalRange": "Evaluation Score Range:",
    "section.search.soil": "Soil pH:",
    "section.search.floodRisk": "Flood Risk:",
    "section.search.crop": "Crop:",
    "section.search.irrigation": "Irrigation Infrastructure:",
    "section.search.accessibility": "Transport Accessibility:",
    "section.search.cropVariety": "Crop Variety Potential:",
    "section.search.search": "Search",
    "section.detail.simulation": "Investment Simulation",
    "section.detail.ddReport": "Generate DD Report",
    "section.detail.investFlow": "Proceed to Investment",
    "section.ddReport.title": "DD Report",
    "section.ddReport.back": "Back",
    "section.investFlow.title": "Investment Process",
    "section.mypage.title": "Investment Portfolio"
  }
};

function updateLanguage() {
  const elems = document.querySelectorAll("[data-i18n]");
  elems.forEach(elem => {
    const key = elem.getAttribute("data-i18n");
    if (translations[currentLang] && translations[currentLang][key]) {
      elem.textContent = translations[currentLang][key];
    }
  });
}

function setLanguage(lang) {
  currentLang = lang;
  updateLanguage();
}

/****************************************************
 * 画面切替
 ****************************************************/
function showSection(sectionId) {
  const sections = document.querySelectorAll('section');
  sections.forEach(sec => {
    sec.classList.remove('active');
    if (sec.id === sectionId) {
      sec.classList.add('active');
      if (sectionId === "search" && searchMap) {
        setTimeout(() => { searchMap.invalidateSize(); }, 100);
      }
    }
  });
}

/****************************************************
 * Leaflet 地図初期化 (Searchセクション)
 ****************************************************/
let searchMap;
window.addEventListener("DOMContentLoaded", () => {
  searchMap = L.map('map').setView([35.6895, 139.6917], 10);
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri'
  }).addTo(searchMap);
  updateLanguage();

  // 投資ポートフォリオに複数のデモデータを投入
  investedFarms.push({ name: "農地A", amount: 1500000 });
  investedFarms.push({ name: "農地B", amount: 2000000 });
  investedFarms.push({ name: "農地C", amount: 1200000 });
  updateInvestedFarmsUI();
});

/****************************************************
 * タブ切替（簡易検索／詳細検索）
 ****************************************************/
function switchSearchTab(tab) {
  const simpleDiv = document.getElementById("simpleSearch");
  const detailedDiv = document.getElementById("detailedSearch");
  const tabSimple = document.getElementById("tabSimple");
  const tabDetailed = document.getElementById("tabDetailed");
  if (tab === "simple") {
    simpleDiv.style.display = "block";
    detailedDiv.style.display = "none";
    tabSimple.classList.add("active");
    tabDetailed.classList.remove("active");
  } else {
    simpleDiv.style.display = "none";
    detailedDiv.style.display = "block";
    tabSimple.classList.remove("active");
    tabDetailed.classList.add("active");
  }
}

/****************************************************
 * 検索機能 (Searchセクション)
 * 26パターンの農地デモデータ生成とフィルタリング
 ****************************************************/
function searchFarmland() {
  // 簡易検索項目
  const regionGroup = document.getElementById("regionGroup").value;
  const country = document.getElementById("country").value;
  const prefecture = document.getElementById("prefecture").value;
  const regionDetail = document.getElementById("regionDetail").value;
  const minScore = document.getElementById("minScore").value;
  const maxScore = document.getElementById("maxScore").value;
  
  // 詳細検索項目（詳細タブが表示されている場合）
  let soilFilter = "";
  let floodRiskFilter = "";
  let cropTypeFilter = "";
  let waterSupplyFilter = "";
  let accessibilityFilter = "";
  let cropDiversityFilter = "";
  const detailedDiv = document.getElementById("detailedSearch");
  if (detailedDiv.style.display !== "none") {
    soilFilter = document.getElementById("soil").value;
    floodRiskFilter = document.getElementById("floodRisk").value;
    cropTypeFilter = document.getElementById("cropType").value;
    waterSupplyFilter = document.getElementById("waterSupply").value;
    accessibilityFilter = document.getElementById("accessibility").value;
    cropDiversityFilter = document.getElementById("cropDiversity").value;
  }
  
  const results = document.getElementById("searchResults");
  results.innerHTML = "";
  
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const crops = ["rice", "wheat", "soy", "tomato", "lettuce", "cucumber", "pepper", "cotton"];
  const risks = ["low", "medium", "high"];
  
  const dummyData = letters.map((letter, i) => {
    const soilPH = (Math.random() * 3 + 5).toFixed(1);
    const soilScore = Math.max(0, 100 - Math.abs(6.5 - soilPH) * 20);
    const rotationScore = Math.floor(Math.random() * 51) + 50;
    const potentialScore = Math.floor((soilScore + rotationScore) / 2);
    const crop = crops[i % crops.length];
    let roi;
    switch(crop) {
      case "rice": roi = "8%"; break;
      case "wheat": roi = "10%"; break;
      case "soy": roi = "12%"; break;
      case "tomato": roi = "9%"; break;
      case "lettuce": roi = "8%"; break;
      case "cucumber": roi = "9%"; break;
      case "pepper": roi = "10%"; break;
      case "cotton": roi = "11%"; break;
      default: roi = "8%";
    }
    let region;
    if (regionGroup) {
      region = regionGroup;
      if (country) region += " - " + country;
      if (prefecture) region += " - " + prefecture;
      if (regionDetail) region += " (" + regionDetail + ")";
    } else {
      region = "地域" + letter;
    }
    const waterSupply = Math.floor(Math.random() * 51) + 50;
    const accessibility = Math.floor(Math.random() * 51) + 50;
    const cropDiversity = Math.floor(Math.random() * 51) + 50;
    
    return {
      name: "農地" + letter,
      region: region,
      soilPH: soilPH,
      soilScore: soilScore,
      rotationScore: rotationScore,
      potential: potentialScore,
      risk: risks[i % risks.length],
      crop: crop,
      roi: roi,
      waterSupply: waterSupply,
      accessibility: accessibility,
      cropDiversity: cropDiversity,
      img: "https://placehold.jp/800x400?text=Farm+" + letter
    };
  });
  
  let filtered = dummyData.filter(item => {
    if (regionGroup && !item.region.includes(regionGroup)) return false;
    if (country && !item.region.includes(country)) return false;
    if (prefecture && !item.region.includes(prefecture)) return false;
    if (regionDetail && !item.region.includes(regionDetail)) return false;
    if (minScore && item.potential < Number(minScore)) return false;
    if (maxScore && item.potential > Number(maxScore)) return false;
    if (soilFilter) {
      const ph = parseFloat(item.soilPH);
      if (soilFilter === "low" && (ph < 5.0 || ph >= 6.0)) return false;
      if (soilFilter === "medium" && (ph < 6.0 || ph >= 7.0)) return false;
      if (soilFilter === "high" && (ph < 7.0 || ph > 8.0)) return false;
    }
    if (floodRiskFilter && item.risk !== floodRiskFilter) return false;
    if (cropTypeFilter && item.crop !== cropTypeFilter) return false;
    if (waterSupplyFilter && item.waterSupply < Number(waterSupplyFilter)) return false;
    if (accessibilityFilter && item.accessibility < Number(accessibilityFilter)) return false;
    if (cropDiversityFilter && item.cropDiversity < Number(cropDiversityFilter)) return false;
    return true;
  });
  
  if (filtered.length === 0) {
    results.innerHTML = "<p>該当する農地は見つかりませんでした。</p>";
    return;
  }
  
  filtered.forEach(farm => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${farm.img}" alt="${farm.name}">
      <div class="title">${farm.name}</div>
      <div class="subtitle">
        地域：${farm.region}<br>
        予想ROI：${farm.roi} / リスク：${farm.risk}<br>
        土壌pH：${farm.soilPH} (スコア：${farm.soilScore})<br>
        作物：${farm.crop}<br>
        潜在能力：${farm.potential}<br>
        灌漑設備：${farm.waterSupply} / アクセス：${farm.accessibility} / 作物多様性：${farm.cropDiversity}
      </div>
    `;
    card.onclick = () => {
      alert(`${farm.name} の詳細画面に遷移します。（実装例）`);
    };
    results.appendChild(card);
  });
}

/****************************************************
 * 衛星タイムラプス画像切替
 ****************************************************/
function changeImage(year) {
  const img = document.getElementById("satelliteImage");
  switch(year) {
    case 2020: img.src = "https://placehold.jp/800x400?text=Satellite+2020"; break;
    case 2021: img.src = "https://placehold.jp/800x400?text=Satellite+2021"; break;
    case 2022: img.src = "https://placehold.jp/800x400?text=Satellite+2022"; break;
    default: img.src = "https://placehold.jp/800x400?text=Satellite+Default";
  }
}

/****************************************************
 * 投資シミュレーション（デモ用固定データ）
 ****************************************************/
function simulateInvestment() {
  const resultText = `基準ROI：8%<br>
輪作最適化効果：＋2%<br>
生産管理改善効果：＋2%<br>
先物価格調整：＋0.5%<br>
----------------<br>
予測ROI：12.5%`;
  const result = document.getElementById("simulationResult");
  if (result) result.innerHTML = resultText;
}

/****************************************************
 * 農地A/B/C 詳細専用の機能
 ****************************************************/
function changeFarmAImage(year) {
  const img = document.getElementById("farmAImage");
  switch(year) {
    case 2020: img.src = "https://placehold.jp/800x400?text=FarmA+2020"; break;
    case 2021: img.src = "https://placehold.jp/800x400?text=FarmA+2021"; break;
    case 2022: img.src = "https://placehold.jp/800x400?text=FarmA+2022"; break;
    default: img.src = "https://placehold.jp/800x400?text=FarmA+Default";
  }
}
function updateFarmASimulation() {
  const result = document.getElementById("farmASimulationResult");
  if (result) {
    result.innerHTML = `基準ROI：8%<br>
輪作最適化効果：＋2%<br>
生産管理改善効果：＋2%<br>
先物価格調整：＋0.5%<br>
----------------<br>
予測ROI：12.5%`;
  }
}

function changeFarmBImage(year) {
  const img = document.getElementById("farmBImage");
  switch(year) {
    case 2020: img.src = "https://placehold.jp/800x400?text=FarmB+2020"; break;
    case 2021: img.src = "https://placehold.jp/800x400?text=FarmB+2021"; break;
    case 2022: img.src = "https://placehold.jp/800x400?text=FarmB+2022"; break;
    default: img.src = "https://placehold.jp/800x400?text=FarmB+Default";
  }
}
function updateFarmBSimulation() {
  simulateInvestment();
}

function changeFarmCImage(year) {
  const img = document.getElementById("farmCImage");
  switch(year) {
    case 2020: img.src = "https://placehold.jp/800x400?text=FarmC+2020"; break;
    case 2021: img.src = "https://placehold.jp/800x400?text=FarmC+2021"; break;
    case 2022: img.src = "https://placehold.jp/800x400?text=FarmC+2022"; break;
    default: img.src = "https://placehold.jp/800x400?text=FarmC+Default";
  }
}
function updateFarmCSimulation() {
  simulateInvestment();
}

/****************************************************
 * ウォッチリスト管理
 ****************************************************/
const watchlist = [];
function addToWatchlist(farmName) {
  if (!watchlist.includes(farmName)) {
    watchlist.push(farmName);
    alert(`${farmName}をウォッチリストに追加しました。`);
  } else {
    alert(`${farmName}は既にウォッチリストに追加済みです。`);
  }
  updateWatchlistUI();
}
function updateWatchlistUI() {
  const ul = document.getElementById("watchlist");
  if (!ul) return;
  ul.innerHTML = "";
  watchlist.forEach(farm => {
    const li = document.createElement("li");
    li.textContent = farm;
    ul.appendChild(li);
  });
}

/****************************************************
 * 投資手続きフロー
 ****************************************************/
let currentInvestFarm = null;
const investedFarms = [];
function confirmInvestAmount() {
  const amountInput = document.getElementById("investAmount");
  const amount = Number(amountInput.value);
  if (!amount || amount <= 0) {
    alert("正しい投資金額を入力してください。");
    return;
  }
  const farmName = "不特定の農地";
  const existing = investedFarms.find(f => f.name === farmName);
  if (existing) {
    existing.amount += amount;
    alert(`${farmName}へ追加投資しました。合計：${existing.amount}円`);
  } else {
    investedFarms.push({ name: farmName, amount });
    alert(`${farmName}へ${amount}円投資しました。`);
  }
  amountInput.value = "";
  updateInvestedFarmsUI();
}
function updateInvestedFarmsUI() {
  const tableBody = document.getElementById("investedFarmsTable");
  if (!tableBody) return;
  tableBody.innerHTML = "";
  investedFarms.forEach(farm => {
    let roiEstimate = "+8%";
    let numericROI = 0.08;
    let currentValue = Math.floor(farm.amount * (1 + numericROI));
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${farm.name}</td>
      <td>${farm.amount}円</td>
      <td>${currentValue}円</td>
      <td>${roiEstimate}</td>
    `;
    tableBody.appendChild(tr);
  });
}

/****************************************************
 * 国・都道府県の選択肢更新
 ****************************************************/
function updateCountryOptions() {
  const regionGroup = document.getElementById("regionGroup").value;
  const countrySelect = document.getElementById("country");
  countrySelect.innerHTML = '<option value="">指定なし</option>';
  if (regionGroup === "Asia") {
    const countries = ["Japan", "Korea", "China"];
    countries.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      countrySelect.appendChild(opt);
    });
  } else if (regionGroup === "Africa") {
    const countries = ["Kenya", "SouthAfrica", "Nigeria"];
    countries.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c;
      opt.textContent = c;
      countrySelect.appendChild(opt);
    });
  }
}

function updatePrefectureOptions() {
  const country = document.getElementById("country").value;
  const prefectureSelect = document.getElementById("prefecture");
  prefectureSelect.innerHTML = '<option value="">指定なし</option>';
  if (country === "Japan") {
    const prefectures = ["Hokkaido", "Tokyo", "Osaka"];
    prefectures.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p;
      opt.textContent = p;
      prefectureSelect.appendChild(opt);
    });
  } else if (country === "Korea") {
    const prefectures = ["Seoul", "Busan"];
    prefectures.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p;
      opt.textContent = p;
      prefectureSelect.appendChild(opt);
    });
  }
}

/****************************************************
 * 初期化処理
 ****************************************************/
window.addEventListener("DOMContentLoaded", () => {
  // 複数のデモ投資データを投入
  investedFarms.push({ name: "農地A", amount: 1500000 });
  investedFarms.push({ name: "農地B", amount: 2000000 });
  investedFarms.push({ name: "農地C", amount: 1200000 });
  updateInvestedFarmsUI();
  updateWatchlistUI();
});
