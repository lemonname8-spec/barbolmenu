// ============================
// Barbol Menu — app.js (FULL + CUSTOM CHIP) + WhatsApp details + Special Order
// One index.html, pages inside: home / cakes / sets / custom
// ============================

const WA = {
  phone: "996507210462", // <-- поменяй номер (без +)
  baseText: "Здравствуйте! Хочу заказать в Барбол:"
};

const PRICES = { S: 500, M: 750, L: 1000 };

// ---------- ДАННЫЕ ----------
const CAKES = [
  { id: 1, name: "Творожный", img: "assets/img/tvorozhny.jpg" },
  { id: 2, name: "Клубнично йогуртовый", img: "assets/img/klubnichny.jpg" },
  { id: 3, name: "Фантазия", img: "assets/img/fantaziya.jpg" },
  { id: 4, name: "Медовый", img: "assets/img/medovy.jpg" },
  { id: 5, name: "Балкаймак", img: "assets/img/balkaymak.jpg" },
  { id: 6, name: "Панчо", img: "assets/img/pancho.jpg" },
  { id: 7, name: "Сметанный рай", img: "assets/img/smetanniy-rai.jpg" },
  { id: 8, name: "Нежный", img: "assets/img/nezhniy.jpg" },
  { id: 9, name: "Лимонный торт", img: "assets/img/yablochniy-pirog.jpg" },
  { id: 10, name: "Торт пломбир", img: "assets/img/plombir.jpg" }
];

const SETS = [
  { id: 101, name: "Набор «Томпок токочтор»", price: 135, img: "assets/img/токоч.jpg" },
  { id: 102, name: "Набор «пряники со сгущенкой»", price: 165, img: "assets/img/сгущенка.jpg" },
  { id: 103, name: "Набор «Кекс classic»", price: 130, img: "assets/img/кекс.jpg" },
  { id: 104, name: "Набор «Нежный»", price: 130, img: "assets/img/нежни.jpg" },
  { id: 105, name: "Набор «Орешки»", price: 145, img: "assets/img/орешки.jpg" },
  { id: 106, name: "Набор «Пудровые колечки»", price: 135, img: "assets/img/колечки.jpg" },
  { id: 107, name: "Набор «Шоко вафли»", price: 180, img: "assets/img/шоко вафли.jpg" },
  { id: 108, name: "Набор «Эрке шоколады»", price: 300, img: "assets/img/эрке.jpg" },
  { id: 109, name: "Набор «Овсяное печенье»", price: 145, img: "assets/img/овсянное.jpg" },
  { id: 110, name: "Набор «Зиг заг с маком»", price: 160, img: "assets/img/зиг заг.jpg" }
];

// Страница "Заказать торт" (слайдер)
const CUSTOM_CAKES = [
  { id: "choco", name: "Шоколадный", img: "assets/img/хз.jpg" },
  { id: "vanilla", name: "Ванильный", img: "assets/img/ванил.jpg" },
  { id: "sour", name: "Сметанный", img: "assets/img/сметана.jpg" },
  { id: "curd", name: "Творожный", img: "assets/img/творогог.jpg" },
  { id: "condensed", name: "Со сгущёнкой", img: "assets/img/сгущен.jpg" },
  { id: "other", name: "Другое", img: "assets/img/другое.jpg" }
];

// ---------- СОСТОЯНИЕ ----------
let cartCount = 0;
let cartSum = 0;

let cakesRendered = false;
let setsRendered = false;
let customRendered = false;

// customOrderMode влияет только на активность кнопки WhatsApp внизу
let customOrderMode = false;

// выбранная основа для custom-торта
let selectedCustom = null;
let deliveryType = null; // "pickup" | "delivery" | null


// ✅ добавлено: список позиций для WhatsApp
// элементы: { type:"cake"|"set", name:string, size?: "S"|"M"|"L", price:number }
let cartItems = [];

// ✅ добавлено: спец-заказ (сохраняется и попадает в нижнюю WhatsApp кнопку)
let customOrder = null;
// { baseId: string|null, baseName: string, text: string }

// ---------- HELPERS ----------
const el = (id) => document.getElementById(id);
const txt = (v) => String(v ?? "").trim();

// ✅ добавлено: группировка одинаковых позиций (×N)
function buildCartLinesGrouped() {
  // key -> { label, qty, unitPrice, sum }
  const map = new Map();

  for (const it of cartItems) {
    const type = it.type;
    const name = it.name || (type === "set" ? "Набор" : "Торт");
    const price = Number(it.price) || 0;
    const size = it.size || "";

    // торт: name|size|price, набор: name|price
    const key = type === "cake"
      ? `cake|${name}|${size}|${price}`
      : `set|${name}|${price}`;

    if (!map.has(key)) {
      map.set(key, {
        type,
        name,
        size,
        unitPrice: price,
        qty: 0,
        sum: 0
      });
    }
    const row = map.get(key);
    row.qty += 1;
    row.sum += price;
  }

  const lines = [];
  for (const row of map.values()) {
    if (row.type === "cake") {
      // "Творожный — M — 750 сом ×2 (=1500)"
      lines.push(`${row.name} — ${row.size} — ${row.unitPrice} сом ×${row.qty}${row.qty > 1 ? ` (= ${row.sum} сом)` : ""}`);
    } else {
      // "Набор «...» — 135 сом ×3 (=405)"
      lines.push(`${row.name} — ${row.unitPrice} сом ×${row.qty}${row.qty > 1 ? ` (= ${row.sum} сом)` : ""}`);
    }
  }

  // сортировка, чтобы в WhatsApp было стабильнее (не обязательно)
  // lines.sort();

  return lines;
}
function renderCartList(){
  const box = el("cartList");
  if (!box) return;

  if (!cartItems.length){
    box.innerHTML = "";
    return;
  }

  box.innerHTML = cartItems.map((it, i) => `
    <div class="cartRow" data-cart-index="${i}">
      <div class="cartRowLeft">
        ${it.type === "cake"
          ? `${it.name} — ${it.size} (${it.price} сом)`
          : `${it.name} (${it.price} сом)`
        }
      </div>
      <div class="cartRowBtns">
        <button class="cartBtn" data-cart-minus="${i}">−</button>
        <button class="cartBtn" data-cart-remove="${i}">×</button>
      </div>
    </div>
  `).join("");
}

function updateBar() {
  // ✅ синхронизация корзины по cartItems (чтобы не было рассинхрона)
  cartCount = cartItems.length;
  cartSum = cartItems.reduce((s, x) => s + (Number(x.price) || 0), 0);

  el("cartCount") && (el("cartCount").textContent = String(cartCount));
  el("cartSum") && (el("cartSum").textContent = String(cartSum));

  const btn = el("orderBtn");
  if (!btn) return;

  // ✅ активируем кнопку, если есть товары ИЛИ есть спец-заказ ИЛИ просто режим custom
  const hasSpecial = !!(customOrder && (txt(customOrder.baseName) || txt(customOrder.text)));
  const enabled = cartCount > 0 || hasSpecial || customOrderMode;
  btn.classList.toggle("enabled", enabled);

  const address = txt(el("address")?.value);

  // ✅ сборка сообщения WhatsApp
  const msg = [];
  msg.push(WA.baseText);

  // обычная корзина
  if (cartItems.length) {
    msg.push("Заказ:");
    msg.push(...buildCartLinesGrouped());
    msg.push(`Итого: ${cartSum} сом`);
  }

  // спец-заказ (если есть)
  if (hasSpecial) {
    msg.push(""); // пустая строка для читаемости
    msg.push("Спец-заказ торта:");
    msg.push(`Основа: ${customOrder.baseName || "(не выбрано)"}`);
    msg.push(customOrder.text ? `Комментарий: ${customOrder.text}` : "Комментарий: (не указан)");
    msg.push("Цена: договорная");
  }

  // если вообще ничего нет
  if (!cartItems.length && !hasSpecial) {
    msg.push("Заказ: (не выбрано)");
  }

  msg.push("");
  msg.push(address ? `Адрес: ${address}` : "Адрес: (не указан)");

  btn.href = `https://wa.me/${WA.phone}?text=${encodeURIComponent(msg.join("\n"))}`;
  renderCartList();
  updateDeliveryUI();
}


function showPage(pageId) {
  el("pageHome")?.classList.add("hidden");
  el("pageCakes")?.classList.add("hidden");
  el("pageSets")?.classList.add("hidden");
  el("pageCustom")?.classList.add("hidden");

  el(pageId)?.classList.remove("hidden");
  window.scrollTo(0, 0);
}

// ---------- RENDER: CAKES ----------
function renderCakes() {
  const grid = el("gridCakes");
  if (!grid) return;

  grid.innerHTML = CAKES.map((c) => `
    <article class="item" data-item="${c.id}" data-size="M">
      <div class="itemImg">
        <img src="${c.img}" alt="${c.name}" onerror="this.src='assets/img/cover.jpg'">
      </div>

      <div class="itemBody">
        <div class="itemTop">
          <div class="itemName">${c.name}</div>
          <div class="itemPrice"><span class="priceVal">${PRICES.M}</span> сом</div>
        </div>

        <div class="sizeRow" role="group" aria-label="Размер">
          <button class="sizeBtn" type="button" data-size-btn="S">S</button>
          <button class="sizeBtn isActive" type="button" data-size-btn="M">M</button>
          <button class="sizeBtn" type="button" data-size-btn="L">L</button>
        </div>

        <button class="itemBtn" type="button" data-add-cake="1">Добавить</button>
      </div>
    </article>
  `).join("");
}

function setCakeSize(cardEl, size) {
  if (!cardEl || !PRICES[size]) return;
  cardEl.dataset.size = size;

  cardEl.querySelectorAll("[data-size-btn]").forEach((b) => {
    b.classList.toggle("isActive", b.getAttribute("data-size-btn") === size);
  });

  const priceEl = cardEl.querySelector(".priceVal");
  if (priceEl) priceEl.textContent = String(PRICES[size]);
}

// ---------- RENDER: SETS ----------
function renderSets() {
  const grid = el("gridSets");
  if (!grid) return;

  grid.innerHTML = SETS.map((s) => `
    <article class="item" data-set="${s.id}" data-price="${s.price}">
      <div class="itemImg">
        <img src="${s.img}" alt="${s.name}" onerror="this.src='assets/img/cover.jpg'">
      </div>

      <div class="itemBody">
        <div class="itemTop">
          <div class="itemName">${s.name}</div>
          <div class="itemPrice"><span>${s.price}</span> сом</div>
        </div>

        <button class="itemBtn" type="button" data-add-set="1">Добавить</button>
      </div>
    </article>
  `).join("");
}

// ---------- CUSTOM: SLIDER + CHIP ----------
function renderCustom() {
  const slider = el("cakeSlider");
  if (!slider) return;

  slider.innerHTML = CUSTOM_CAKES.map((c) => `
    <div class="slideCard" data-custom="${c.id}">
      <div class="slideImg">
        <img src="${c.img}" alt="${c.name}" onerror="this.src='assets/img/cover.jpg'">
      </div>
      <div class="slideBody">
        <div class="slideName">${c.name}</div>
        <button class="chooseBtn" type="button" data-choose-custom="${c.id}">Выбрать</button>
      </div>
    </div>
  `).join("");

  // если ещё ничего не выбрано — пусть будет пусто (чип не показываем)
  markCustomSelected();
  renderPickedChip();
}

function markCustomSelected() {
  document.querySelectorAll(".slideCard").forEach((card) => {
    card.classList.toggle("selected", card.getAttribute("data-custom") === selectedCustom);
  });
}

function renderPickedChip() {
  const row = el("pickRow");
  if (!row) return;

  if (!selectedCustom) {
    row.innerHTML = "";
    return;
  }

  const obj = CUSTOM_CAKES.find(x => x.id === selectedCustom);
  const name = obj?.name || "Выбрано";

  row.innerHTML = `
    <div class="pickChip" data-picked>
      <span class="pickDot" aria-hidden="true"></span>
      <span class="pickName">${name}</span>
      <button class="pickX" type="button" data-clear-picked aria-label="Отменить выбор">✕</button>
    </div>
  `;
}

function sliderScroll(dir) {
  const slider = el("cakeSlider");
  if (!slider) return;
  slider.scrollBy({ left: dir * 240, behavior: "smooth" });
}

// ✅ обновлено: теперь sendCustom сохраняет спец-заказ + может отправить отдельным окном
function sendCustomToWhatsApp() {
  const baseName = CUSTOM_CAKES.find(x => x.id === selectedCustom)?.name || "(не выбрано)";
  const comment = txt(el("customText")?.value);
  const address = txt(el("address")?.value);

  // сохраняем спец-заказ
  customOrder = customOrder || { baseId: null, baseName: "", text: "" };
  customOrder.baseId = selectedCustom;
  customOrder.baseName = baseName;
  customOrder.text = comment;

  // активируем режим, чтобы нижняя кнопка тоже стала активной
  customOrderMode = true;
  updateBar();

  // отдельная отправка (как раньше)
  const msg = [
    WA.baseText,
    "Спец-заказ торта:",
    `Основа: ${baseName}`,
    comment ? `Комментарий: ${comment}` : "Комментарий: (не указан)",
    "Цена: договорная",
    address ? `Адрес: ${address}` : "Адрес: (не указан)"
  ].join("\n");

  const url = `https://wa.me/${WA.phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

// ---------- BIND: HOME ----------
function bindHomeButtons() {
  el("btnCakes")?.addEventListener("click", () => {
    customOrderMode = false;
    updateBar();

    if (!cakesRendered) {
      renderCakes();
      cakesRendered = true;
    }
    showPage("pageCakes");
  });

  el("btnSets")?.addEventListener("click", () => {
    customOrderMode = false;
    updateBar();

    if (!setsRendered) {
      renderSets();
      setsRendered = true;
    }
    showPage("pageSets");
  });

  // Заказать торт — открывает страницу, не трогает корзину
  el("btnCustom")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    customOrderMode = true; // чтобы низовая WhatsApp-кнопка была активна, если нужно
    updateBar();

    if (!customRendered) {
      renderCustom();
      customRendered = true;
    } else {
      // если уже рисовали — просто обновим чип/выделение (на всякий)
      markCustomSelected();
      renderPickedChip();
    }

    showPage("pageCustom");
  });

  el("backBtnCakes")?.addEventListener("click", () => showPage("pageHome"));
  el("backBtnSets")?.addEventListener("click", () => showPage("pageHome"));
  el("backBtnCustom")?.addEventListener("click", () => showPage("pageHome"));
}

// ---------- BIND: ALL INTERACTIONS ----------
function bindInteractions() {
  document.addEventListener("click", (e) => {
    // убрать 1 позицию
const minus = e.target.closest("[data-cart-minus]");
if (minus){
  const i = Number(minus.getAttribute("data-cart-minus"));
  if (!isNaN(i)) cartItems.splice(i, 1);
  updateBar();
  return;
}
// Самовывоз
if (e.target.closest("#btnPickup")){
  deliveryType = "pickup";

  el("btnPickup")?.classList.add("active");
  el("btnDelivery")?.classList.remove("active");

  updateDeliveryUI();
  updateBar();
  return;
}

// Доставка
if (e.target.closest("#btnDelivery")){
  deliveryType = "delivery";

  el("btnDelivery")?.classList.add("active");
  el("btnPickup")?.classList.remove("active");

  updateDeliveryUI();
  updateBar();
  return;
}
// убрать полностью (пока то же самое, т.к. позиции поштучные)
const remove = e.target.closest("[data-cart-remove]");
if (remove){
  const i = Number(remove.getAttribute("data-cart-remove"));
  if (!isNaN(i)) cartItems.splice(i, 1);
  updateBar();
  return;
}

    // Стрелки custom-слайдера
    if (e.target.closest("#prevCake")) { sliderScroll(-1); return; }
    if (e.target.closest("#nextCake")) { sliderScroll(1); return; }

    // Сброс выбора (✕ на чипе)
    if (e.target.closest("[data-clear-picked]")) {
      selectedCustom = null;

      // ✅ чистим основу в customOrder (но текст можем оставить, если он уже набран)
      if (customOrder) {
        customOrder.baseId = null;
        customOrder.baseName = "";
      }

      markCustomSelected();
      renderPickedChip();
      updateBar();
      return;
    }

    // Выбрать основу (custom)
    const choose = e.target.closest("[data-choose-custom]");
    if (choose) {
      selectedCustom = choose.getAttribute("data-choose-custom");

      // ✅ сохраняем выбор в customOrder сразу, чтобы нижняя кнопка WhatsApp уже знала "Основа"
      const baseName = CUSTOM_CAKES.find(x => x.id === selectedCustom)?.name || "(не выбрано)";
      customOrder = customOrder || { baseId: null, baseName: "", text: "" };
      customOrder.baseId = selectedCustom;
      customOrder.baseName = baseName;

      markCustomSelected();
      renderPickedChip();
      updateBar();
      return;
    }

    // Отправить custom
    if (e.target.closest("#sendCustom")) {
      // ✅ перед отправкой сохраняем текст в customOrder (для нижней кнопки тоже)
      const comment = txt(el("customText")?.value);
      customOrder = customOrder || { baseId: null, baseName: "", text: "" };
      customOrder.text = comment;

      // если основы не выбрали — пусть будет "(не выбрано)"
      if (!customOrder.baseName) {
        customOrder.baseName = CUSTOM_CAKES.find(x => x.id === selectedCustom)?.name || "(не выбрано)";
        customOrder.baseId = selectedCustom;
      }

      customOrderMode = true;
      updateBar();

      // отдельная отправка (как у тебя было)
      sendCustomToWhatsApp();
      return;
    }

    // Размеры тортов
    const sizeBtn = e.target.closest("[data-size-btn]");
    if (sizeBtn) {
      const card = e.target.closest("[data-item]");
      if (!card) return;
      setCakeSize(card, sizeBtn.getAttribute("data-size-btn"));
      return;
    }

    // Добавить торт
    const addCake = e.target.closest("[data-add-cake]");
    if (addCake) {
      const card = e.target.closest("[data-item]");
      if (!card) return;

      customOrderMode = false;

      const size = card.dataset.size || "M";
      const price = PRICES[size] ?? PRICES.M;

      // ✅ сохраняем позицию для WhatsApp
      const itemId = card.getAttribute("data-item");
      const cakeObj = CAKES.find(x => String(x.id) === String(itemId));

      cartItems.push({
        type: "cake",
        name: cakeObj?.name || "Торт",
        size: size,
        price: price
      });

      updateBar();
      return;
    }

    // Добавить набор
    const addSet = e.target.closest("[data-add-set]");
    if (addSet) {
      const card = e.target.closest("[data-set]");
      if (!card) return;

      customOrderMode = false;

      const price = Number(card.getAttribute("data-price")) || 0;

      // ✅ сохраняем позицию для WhatsApp
      const setId = card.getAttribute("data-set");
      const setObj = SETS.find(x => String(x.id) === String(setId));

      cartItems.push({
        type: "set",
        name: setObj?.name || "Набор",
        price: price
      });

      updateBar();
      return;
    }
  });
}

// ---------- BIND: BOTTOM BAR ----------
function bindBottomBar() {
  el("clearBtn")?.addEventListener("click", () => {
    // ✅ очищаем всё: корзину + спец-заказ
    cartItems = [];
    customOrder = null;
    selectedCustom = null;
    deliveryType = null;

    cartCount = 0;
    cartSum = 0;

    customOrderMode = false;
    updateBar();
  });
  el("btnPickup")?.classList.remove("active");
el("btnDelivery")?.classList.remove("active");
  // ✅ если меняют адрес — обновляем ссылку WhatsApp
  el("address")?.addEventListener("input", updateBar);

  // ✅ если человек печатает текст спец-заказа — сохраняем в customOrder и обновляем кнопку
  // (не ломает ничего, просто делает удобнее)
  el("customText")?.addEventListener("input", () => {
    const comment = txt(el("customText")?.value);
    if (!customOrder) customOrder = { baseId: null, baseName: "", text: "" };
    customOrder.text = comment;
    updateBar();
  });
}
function updateDeliveryUI(){
  const choice = el("deliveryChoice");
  const address = el("address");

  if (!choice || !address) return;

  // если в корзине есть товары или спец-заказ
  const hasOrder = cartItems.length > 0 || customOrderMode;

  if (!hasOrder){
    choice.style.display = "none";
    address.classList.add("hidden");
    deliveryType = null;
    return;
  }

  // есть заказ
  if (!deliveryType){
    choice.style.display = "flex";
    address.classList.add("hidden");
  }

  if (deliveryType === "pickup"){
    choice.style.display = "flex";
    address.classList.add("hidden");
  }

  if (deliveryType === "delivery"){
    choice.style.display = "none";
    address.classList.remove("hidden");
  }
}
// ---------- START ----------
window.addEventListener("DOMContentLoaded", () => {
  // счётчики позиций
  el("count-cakes") && (el("count-cakes").textContent = `${CAKES.length} позиций`);
  el("count-sets") && (el("count-sets").textContent = `${SETS.length} позиций`);

  bindHomeButtons();
  bindInteractions();
  bindBottomBar();

  showPage("pageHome");
  updateBar();
});
