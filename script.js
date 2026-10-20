
(async () => {
  const C = CONFIG, T = C.text;
  const $ = (s, r = document) => r.querySelector(s);
  const bn = n => String(n).replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]);
  const tk = n => "৳" + bn(Number(n || 0).toLocaleString("en-US"));
  const isPlus = s => C.plusSizes.includes(String(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Supabase থেকে সক্রিয় পণ্য লোড
  // সংযোগ ব্যর্থ হলে config.js-এর পণ্য ব্যবহার হবে
  try {
    if (typeof supabaseClient !== "undefined" && supabaseClient) {
      const { data, error } = await supabaseClient
        .from("products")
        .select("id, name, image, price, offer, stock, status")
        .eq("status", "Active")
        .order("id");

      if (error) throw error;

      if (data && data.length) {
        C.products = data.map(p => ({
          id: String(p.id),
          name: p.name,
          image: p.image,
          regularPrice: Number(p.price),
          offerPrice: Number(p.offer),
          stock: Number(p.stock)
        }));

        // সাধারণ হিরো/স্টিকি অংশের দাম প্রথম পণ্য থেকে
        C.regularPrice = Number(data[0].price);
        C.offerPrice = Number(data[0].offer);
      }
    }
  } catch (error) {
    console.error("Supabase product load error:", error);
  }

  const fill = s => String(s)
    .replace(/\{offer\}/g, tk(C.offerPrice))
    .replace(/\{regular\}/g, tk(C.regularPrice))
    .replace(/\{inside\}/g, tk(C.deliveryInsideDhaka))
    .replace(/\{outside\}/g, tk(C.deliveryOutsideDhaka))
    .replace(/\{plus\}/g, tk(C.plusSizeCharge));

  const state = { items: {}, cart: [], area: "in", pay: "cod" };

  /* ================= কনটেন্ট রেন্ডার ================= */
  const save = C.regularPrice - C.offerPrice;
  const pct = C.regularPrice ? Math.round(save / C.regularPrice * 100) : 0;

  document.querySelectorAll('link[rel=icon]').forEach(l => l.href = C.logo);
  $("#brand").textContent = C.brandName;
  $("#nav").innerHTML = C.nav.map(n => `<a href="${n.href}">${n.label}</a>`).join("");
  $("#footLogo").src = C.logo;

  setupHero();

  $("#heroTitle").innerHTML = T.heroTitle;
  $("#heroSub").textContent = fill(T.heroSub);
  $("#heroCta").textContent = T.heroCta;

  const waHello = `https://wa.me/${C.whatsappNumber}?text=${encodeURIComponent("আসসালামু আলাইকুম, " + C.brandName + " কুর্তি সম্পর্কে জানতে চাই।")}`;
  $("#waFloat").href = waHello;
  $("#waCard").href = `https://wa.me/${C.whatsappNumber}?text=${encodeURIComponent("আসসালামু আলাইকুম, আমি অন্য ড্রেসও নিতে চাই। ড্রেসগুলো দেখাবেন প্লিজ।")}`;
  $("#waCardTxt").textContent = T.otherDress;
  $("#heroDelivery").textContent = T.heroDelivery;
  $("#logoTag").textContent = T.logoTagline;
  $("#footPhone").textContent = bn(C.phone);
  $("#footPhone").href = "tel:" + C.phone;
  $("#trust").innerHTML = T.trust.map(x => `<div><b>${fill(x.title)}</b><span>${fill(x.sub)}</span></div>`).join("");
  $("#orderTitle").textContent = T.orderTitle;
  $("#orderLead").textContent = T.orderLead;

  if ($("#multiHint")) $("#multiHint").textContent = T.multiHint || "";

  $("#oldPrice").textContent = tk(C.regularPrice);
  $("#newPrice").textContent = tk(C.offerPrice);
  $("#savePrice").textContent = `${tk(save)} সাশ্রয়`;
  $("#plusNote").textContent = fill(T.plusNote);
  $("#stickyPrice").textContent = tk(C.offerPrice);
  $("#areaIn").textContent = tk(C.deliveryInsideDhaka);
  $("#areaOut").textContent = tk(C.deliveryOutsideDhaka);
  $("#whyTitle").textContent = T.whyTitle;
  $("#whyGrid").innerHTML = T.why.map((x, i) =>
    `<div class="why-item"><i>${bn(i + 1)}</i><b>${fill(x.title)}</b><p>${fill(x.text)}</p></div>`
  ).join("");
  $("#stepsTitle").textContent = T.stepsTitle;
  $("#stepsList").innerHTML = T.steps.map(x =>
    `<li><div><b>${fill(x.title)}</b><p>${fill(x.text)}</p></div></li>`
  ).join("");

  if (T.footerTagline) $("#footTag").textContent = T.footerTagline;
  else $("#footTag").remove();

  $("#yr").textContent = bn(new Date().getFullYear());

  /* ================= হিরো ছবি ================= */
  function setupHero() {
    const img = $("#heroLogo"), frame = $("#heroFrame"), hero = $("#hero");
    const blend = C.heroBlend || "multiply";

    const applyBlend = b => {
      img.style.mixBlendMode = b;
      frame.classList.toggle("photo", b === "normal");
    };

    const fit = () => {
      if (!img.naturalWidth) return;
      img.width = img.naturalWidth;
      img.height = img.naturalHeight;
      hero.classList.toggle("land", img.naturalWidth / img.naturalHeight > 1.25);
    };

    img.alt = C.brandName + " — হিরো ছবি";
    img.addEventListener("load", fit);
    img.addEventListener("error", () => {
      if (!img.dataset.fb && C.logo) {
        img.dataset.fb = "1";
        img.src = C.logo;
      }
    });

    img.src = C.heroImage || C.logo;
    applyBlend(blend);
    if (img.complete) fit();

    if (/[?&]admin/.test(location.search)) {
      const box = document.createElement("div");
      box.className = "hero-admin";
      box.innerHTML = `
        <button type="button" class="btn" id="hPick">🖼 হিরো ছবি বাছাই করুন</button>
        <button type="button" class="btn ghost" id="hBlend" hidden>সাদা ব্যাকগ্রাউন্ড মেশানো: চালু</button>
        <p id="hNote" hidden></p>
        <input type="file" id="hFile" accept="image/*" hidden>`;
      document.body.appendChild(box);

      let url = null, on = blend !== "normal";

      $("#hPick").onclick = () => $("#hFile").click();
      $("#hFile").onchange = e => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        if (url) URL.revokeObjectURL(url);
        url = URL.createObjectURL(f);
        img.src = url;
        $("#hBlend").hidden = false;
        $("#hNote").hidden = false;
        $("#hNote").textContent =
          "এটি শুধু এই ব্রাউজারে প্রিভিউ। স্থায়ী করতে ছবিটি repository-তে আপলোড করুন।";
      };

      $("#hBlend").onclick = e => {
        on = !on;
        applyBlend(on ? "multiply" : "normal");
        e.target.textContent = "সাদা ব্যাকগ্রাউন্ড মেশানো: " + (on ? "চালু" : "বন্ধ");
      };
    }
  }

  /* ================= ভিডিও ================= */
  if (C.youtubeId || C.localVideo) {
    $("#videoSec").hidden = false;
    $("#videoWrap").innerHTML = C.localVideo
      ? `<video src="${C.localVideo}" autoplay muted loop playsinline controls></video>`
      : `<iframe src="https://www.youtube-nocookie.com/embed/${C.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${C.youtubeId}&playsinline=1&rel=0&modestbranding=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="${C.brandName} কুর্তি ভিডিও"></iframe>`;
  }

  /* ================= হিরো স্পার্কল ================= */
  if (!reduce) {
    const box = $("#sparkles");
    for (let i = 0; i < 16; i++) {
      const s = document.createElement("span");
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.animationDelay = -Math.random() * 4 + "s";
      s.style.animationDuration = 3 + Math.random() * 3 + "s";
      box.appendChild(s);
    }
  }

  /* ================= মোবাইল মেনু ================= */
  const burger = $("#burger"), nav = $("#nav");

  burger.addEventListener("click", () => {
    const o = nav.classList.toggle("open");
    burger.classList.toggle("open", o);
    burger.setAttribute("aria-expanded", o);
  });

  nav.addEventListener("click", e => {
    if (e.target.closest("a")) {
      nav.classList.remove("open");
      burger.classList.remove("open");
    }
  });

  const links = [...nav.querySelectorAll("a")];
  const spy = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) {
      links.forEach(a => a.classList.toggle(
        "active", a.getAttribute("href") === "#" + en.target.id
      ));
    }
  }), { rootMargin: "-40% 0px -55% 0px" });

  ["top", "order", "why", "steps"].forEach(id => {
    const el = document.getElementById(id);
    if (el) spy.observe(el);
  });

  /* ================= ক্লিক অ্যানিমেশন ================= */
  document.addEventListener("pointerdown", e => {
    const t = e.target.closest("a,button,.pcard,.choice,.pay,.sz,.why-item,.trust div");
    if (!t) return;

    if (!reduce) {
      const r = document.createElement("span");
      r.className = "click-ripple";
      r.style.left = e.clientX + "px";
      r.style.top = e.clientY + "px";
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 750);
    }

    t.classList.remove("pink-ring");
    void t.offsetWidth;
    t.classList.add("pink-ring");
    setTimeout(() => t.classList.remove("pink-ring"), 700);
  });

  /* ================= কার্ট ================= */
  function toast(msg) {
    let t = $("#toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.remove("show");
    void t.offsetWidth;
    t.classList.add("show");
    clearTimeout(toast.tm);
    toast.tm = setTimeout(() => t.classList.remove("show"), 1800);
  }

  const grid = $("#productGrid");
  const cards = {};

  function resetCard(pid) {
    delete state.items[pid];
    const el = cards[pid];
    if (!el) return;
    el.classList.remove("sel");
    el.querySelectorAll(".sz").forEach(b => b.classList.remove("on"));
    el.querySelector(".qty b").textContent = bn(1);
    el.querySelector(".perr").textContent = "";
  }

  function addToCart(pid, quiet) {
    const it = state.items[pid];
    if (!it) return false;

    if (!it.size) {
      cards[pid].querySelector(".perr").textContent = "আগে সাইজ বাছাই করুন।";
      return false;
    }

    const product = C.products.find(p => p.id === pid);
    if (product && Number.isFinite(product.stock) && product.stock <= 0) {
      cards[pid].querySelector(".perr").textContent = "এই পণ্যটি বর্তমানে স্টকে নেই।";
      return false;
    }

    const existing = state.cart.find(c => c.pid === pid && c.size === it.size);
    if (existing) existing.qty = Math.min(20, existing.qty + it.qty);
    else state.cart.push({ pid, size: it.size, qty: it.qty });

    resetCard(pid);
    if (!quiet) toast("অর্ডারে যোগ হয়েছে ✓");
    refresh();
    return true;
  }

  const flushPending = () => Object.keys(state.items).forEach(pid => {
    if (state.items[pid] && state.items[pid].size) addToCart(pid, true);
  });

  /* ================= প্রোডাক্ট কার্ড ================= */
  C.products.forEach(p => {
    const el = document.createElement("div");
    el.className = "pcard";
    el.dataset.id = p.id;
    el.tabIndex = 0;
    cards[p.id] = el;

    const regular = Number(p.regularPrice ?? C.regularPrice);
    const offer = Number(p.offerPrice ?? C.offerPrice);
    const discount = regular > 0 ? Math.round((regular - offer) / regular * 100) : 0;
    const sb = (s, plus) =>
      `<button type="button" class="sz${plus ? " plus" : ""}" data-size="${s}">${bn(s)}</button>`;

    el.innerHTML = `
      <div class="pimg">${p.name}<img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.remove()"></div>
      <span class="badge">${bn(discount)}% ছাড়</span>
      <span class="tick">✓</span>
      <span class="incart"></span>
      <div class="pbody">
        <h4>${p.name}</h4>
        <div class="pp"><s>${tk(regular)}</s> <b class="unit">${tk(offer)}</b></div>
        <div class="tap">ট্যাপ করে নির্বাচন করুন</div>
        <div class="opts">
          <small>সাইজ</small>
          <div class="sizes">${C.sizes.map(s => sb(s)).join("")}</div>
          <small>প্লাস সাইজ</small>
          <div class="sizes">${C.plusSizes.map(s => sb(s, true)).join("")}</div>
          <div class="pnote">প্লাস সাইজ চার্জ +${tk(C.plusSizeCharge)} যোগ হয়েছে</div>
          <small>পরিমাণ</small>
          <div class="qty">
            <button type="button" data-q="-1" aria-label="কমান">−</button>
            <b>${bn(1)}</b>
            <button type="button" data-q="1" aria-label="বাড়ান">+</button>
          </div>
          <p class="perr"></p>
          <button type="button" class="btn add-btn" data-add="1">+ অর্ডারে যোগ করুন</button>
        </div>
      </div>`;

    grid.appendChild(el);

    const toggle = () => {
      if (state.items[p.id]) {
        delete state.items[p.id];
        el.classList.remove("sel");
      } else {
        state.items[p.id] = { size: null, qty: 1 };
        el.classList.add("sel");
      }
      refresh();
    };

    el.addEventListener("click", e => {
      if (!e.target.closest(".opts")) toggle();
    });

    el.addEventListener("keydown", e => {
      if ((e.key === "Enter" || e.key === " ") && e.target === el) {
        e.preventDefault();
        toggle();
      }
    });

    el.querySelector(".opts").addEventListener("click", e => {
      const it = state.items[p.id];
      if (!it) return;

      if (e.target.closest("[data-add]")) {
        addToCart(p.id);
        return;
      }

      const sz = e.target.closest(".sz");
      if (sz) {
        it.size = sz.dataset.size;
        el.querySelector(".perr").textContent = "";
        el.querySelectorAll(".sz").forEach(b => b.classList.toggle("on", b === sz));
      }

      const q = e.target.closest("[data-q]");
      if (q) {
        it.qty = Math.min(20, Math.max(1, it.qty + Number(q.dataset.q)));
        el.querySelector(".qty b").textContent = bn(it.qty);
      }
      refresh();
    });
  });

  /* ================= ডেলিভারি এলাকা ================= */
  document.querySelectorAll('input[name="area"]').forEach(r =>
    r.addEventListener("change", () => {
      state.area = r.value;
      document.querySelectorAll("#areaRow .choice").forEach(c =>
        c.classList.toggle("active", c.querySelector("input").checked)
      );
      refresh();
    })
  );

  /* ================= পেমেন্ট ================= */
  const payGrid = $("#payGrid");

  [["cod", "ক্যাশ অন ডেলিভারি"],
    ...Object.entries(C.payments).map(([k, v]) => [k, v.label])
  ].forEach(([k, label]) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "pay" + (k === "cod" ? " on" : "");
    b.dataset.k = k;
    b.textContent = label;
    if (k === "cod") b.style.gridColumn = "1 / -1";

    b.addEventListener("click", () => {
      state.pay = k;
      payGrid.querySelectorAll(".pay").forEach(x => x.classList.toggle("on", x === b));
      renderPay();
    });

    payGrid.appendChild(b);
  });

  function renderPay() {
    const box = $("#payInfo");
    box.hidden = false;

    if (state.pay === "cod") {
      box.innerHTML = `<b>ক্যাশ অন ডেলিভারি</b><br><span style="color:var(--muted)">কুর্তি হাতে পেয়ে ডেলিভারি ম্যানকে টাকা দিন। আগে কিছু পাঠাতে হবে না।</span>`;
      return;
    }

    const p = C.payments[state.pay], t = totals();
    box.innerHTML = `
      <div>প্রথমে <b id="payAmt" style="color:var(--deep)">${tk(t.total)}</b> টাকা নিচের ${p.label} নাম্বারে পাঠান।<br><small style="color:var(--muted)">${p.note}</small></div>
      <div class="num"><span>${p.number}</span><button type="button" class="copy" id="copyBtn">কপি</button></div>
      <label style="margin:0">Transaction ID / শেষ ৪ ডিজিট
        <input type="text" name="trx" id="trx" placeholder="পেমেন্টের পর যে ID পাবেন"></label>`;

    $("#copyBtn").onclick = async e => {
      try {
        await navigator.clipboard.writeText(p.number);
      } catch {}
      e.target.textContent = "কপি হয়েছে ✓";
      setTimeout(() => e.target.textContent = "কপি", 1500);
    };
  }

  /* ================= পণ্যের দাম ও হিসাব ================= */
  const unit = (it, product) =>
    Number(product.offerPrice ?? C.offerPrice) +
    (isPlus(it.size) ? C.plusSizeCharge : 0);

  const lines = () => state.cart.map(c => ({
    p: C.products.find(q => q.id === c.pid),
    size: c.size,
    qty: c.qty,
    key: c.pid + "|" + c.size
  })).filter(x => x.p);

  function totals() {
    const l = lines();
    const qty = l.reduce((a, x) => a + x.qty, 0);

    // প্রতিটি পণ্যের নিজস্ব অফার মূল্য দিয়ে সাবটোটাল
    const sub = l.reduce((a, x) =>
      a + x.qty * Number(x.p.offerPrice ?? C.offerPrice), 0);

    const plus = l.reduce((a, x) =>
      a + (isPlus(x.size) ? x.qty * C.plusSizeCharge : 0), 0);

    const del = qty
      ? (state.area === "in" ? C.deliveryInsideDhaka : C.deliveryOutsideDhaka)
      : 0;

    return { qty, sub, plus, del, total: sub + plus + del };
  }

  let lastTotal = null;

  function refresh() {
    const l = lines(), t = totals();

    C.products.forEach(p => {
      const el = cards[p.id];
      if (!el) return;

      const it = state.items[p.id];
      const pl = it && isPlus(it.size);
      const offer = Number(p.offerPrice ?? C.offerPrice);

      el.querySelector(".unit").textContent = tk(it ? unit(it, p) : offer);
      el.querySelector(".pnote").classList.toggle("show", !!pl);

      const n = state.cart.filter(c => c.pid === p.id)
        .reduce((a, c) => a + c.qty, 0);

      el.querySelector(".incart").textContent = n ? bn(n) + " টি যোগ হয়েছে" : "";
      el.classList.toggle("has", n > 0);
    });

    $("#sumLines").innerHTML = l.length
      ? l.map(x => `
        <div class="sline" data-key="${x.key}">
          <div>${x.p.name}
            <span>সাইজ: ${bn(x.size)}${isPlus(x.size) ? " (প্লাস)" : ""} × ${bn(x.qty)}</span>
            ${isPlus(x.size) ? `<span class="pl">+ প্লাস সাইজ চার্জ ${tk(C.plusSizeCharge)} × ${bn(x.qty)}</span>` : ""}
          </div>
          <div class="lr">
            <b>${tk(x.qty * unit({ size: x.size }, x.p))}</b>
            <div class="lctl">
              <button type="button" data-act="dec" aria-label="কমান">−</button>
              <i>${bn(x.qty)}</i>
              <button type="button" data-act="inc" aria-label="বাড়ান">+</button>
              <button type="button" data-act="rm" class="rm" aria-label="বাদ দিন">×</button>
            </div>
          </div>
        </div>`).join("")
      : `<p class="empty">এখনো কোনো কুর্তি যোগ করা হয়নি। ওপর থেকে কুর্তি বেছে সাইজ দিয়ে "অর্ডারে যোগ করুন" চাপুন।</p>`;

    $("#sumSub").textContent = tk(t.sub);
    $("#plusRow").hidden = t.plus === 0;
    $("#sumPlus").textContent = "+" + tk(t.plus);
    $("#sumDel").textContent = tk(t.del);
    $("#sumTotal").textContent = tk(t.total);

    if (lastTotal !== null && lastTotal !== t.total) {
      const b = $("#sumTotal");
      b.classList.remove("bump");
      void b.offsetWidth;
      b.classList.add("bump");
    }

    lastTotal = t.total;

    if (state.pay !== "cod") {
      const a = $("#payAmt");
      if (a) a.textContent = tk(t.total);
    }
  }

  $("#sumLines").addEventListener("click", e => {
    const b = e.target.closest("[data-act]");
    const row = e.target.closest(".sline");
    if (!b || !row) return;

    const [pid, size] = row.dataset.key.split("|");
    const c = state.cart.find(x => x.pid === pid && x.size === size);
    if (!c) return;

    if (b.dataset.act === "inc") c.qty = Math.min(20, c.qty + 1);
    if (b.dataset.act === "dec") c.qty = Math.max(1, c.qty - 1);
    if (b.dataset.act === "rm") state.cart = state.cart.filter(x => x !== c);

    refresh();
  });

  renderPay();
  refresh();

  /* ================= অর্ডার যাচাই ================= */
  const f = $("#orderForm");

  function validate(needTrx) {
    f.querySelectorAll(".bad").forEach(x => x.classList.remove("bad"));
    const bad = (el, msg) => {
      el.classList.add("bad");
      el.focus();
      return msg;
    };

    flushPending();
    const l = lines();

    if (!l.length) {
      return Object.keys(state.items).length
        ? 'সাইজ বাছাই করে "অর্ডারে যোগ করুন" চাপুন।'
        : "কমপক্ষে একটি কুর্তি নির্বাচন করুন।";
    }

    if (f.elements.name.value.trim().length < 2)
      return bad(f.elements.name, "আপনার নাম লিখুন।");

    if (!/^01[3-9]\d{8}$/.test(f.elements.phone.value.trim()))
      return bad(f.elements.phone, "সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন (01XXXXXXXXX)।");

    if (f.elements.address.value.trim().length < 10)
      return bad(f.elements.address, "পূর্ণ ঠিকানা লিখুন (এলাকা, থানা, জেলা সহ)।");

    if (needTrx && state.pay !== "cod" && $("#trx") && $("#trx").value.trim().length < 3)
      return bad($("#trx"), "পেমেন্টের Transaction ID দিন।");

    return "";
  }

  function orderText(no) {
    const t = totals();

    return [
      `*নতুন অর্ডার — ${C.brandName}*`,
      no ? `অর্ডার নাম্বার: ${no}` : "",
      "",
      ...lines().map(x =>
        `• ${x.p.name} | সাইজ ${x.size}${isPlus(x.size) ? " (প্লাস)" : ""} | পরিমাণ ${x.qty} | ${x.qty * unit({ size: x.size }, x.p)} টাকা`
      ),
      "",
      `সাবটোটাল: ${t.sub} টাকা`,
      t.plus ? `প্লাস সাইজ চার্জ: ${t.plus} টাকা` : "",
      `ডেলিভারি (${state.area === "in" ? "ঢাকার ভেতরে" : "ঢাকার বাইরে"}): ${t.del} টাকা`,
      `*সর্বমোট: ${t.total} টাকা*`,
      `পেমেন্ট: ${state.pay === "cod" ? "ক্যাশ অন ডেলিভারি" : C.payments[state.pay].label + (($("#trx") && $("#trx").value) ? " (TrxID: " + $("#trx").value.trim() + ")" : "")}`,
      "",
      `নাম: ${f.elements.name.value.trim()}`,
      `মোবাইল: ${f.elements.phone.value.trim()}`,
      `ঠিকানা: ${f.elements.address.value.trim()}`
    ].filter((x, i, a) => !(x === "" && (i === 0 || a[i - 1] === ""))).join("\n");
  }

  /* ================= Telegram ================= */
  function tgText(no) {
    const t = totals(), trx = $("#trx") ? $("#trx").value.trim() : "";

    return [
      "🛍 নতুন অর্ডার — " + C.brandName,
      "অর্ডার নং: " + no,
      "",
      "👤 " + f.elements.name.value.trim(),
      "📞 " + f.elements.phone.value.trim(),
      "📍 " + f.elements.address.value.trim(),
      "🚚 " + (state.area === "in" ? "ঢাকার ভেতরে" : "ঢাকার বাইরে"),
      "",
      ...lines().map(x =>
        "🛒 " + x.p.name + " | সাইজ " + x.size +
        (isPlus(x.size) ? " (প্লাস)" : "") + " | " + x.qty +
        " পিস | " + (x.qty * unit({ size: x.size }, x.p)) + " টাকা"
      ),
      "",
      "সাবটোটাল: " + t.sub + " ৳",
      t.plus ? "প্লাস সাইজ চার্জ: " + t.plus + " ৳" : "",
      "ডেলিভারি: " + t.del + " ৳",
      "💰 সর্বমোট: " + t.total + " ৳",
      "",
      "💳 " + (state.pay === "cod"
        ? "ক্যাশ অন ডেলিভারি"
        : C.payments[state.pay].label + (trx ? " | TrxID: " + trx : ""))
    ].filter((x, i, a) => !(x === "" && (i === 0 || a[i - 1] === ""))).join("\n");
  }

  async function sendTelegram(text) {
    const tg = C.telegram || {}, dbg = /[?&]debug/.test(location.search);

    if (C.telegramApi) {
      try {
        const r = await fetch(C.telegramApi, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });

        const j = await r.json().catch(() => null);

        if (dbg) alert(j && j.ok
          ? "Telegram: মেসেজ পাঠানো হয়েছে ✅"
          : "Telegram ত্রুটি: " + (j ? (j.description || j.error) : "উত্তর পড়া যায়নি (" + r.status + ")"));
        else if (j && !j.ok) console.warn("Telegram:", j.description || j.error);
      } catch (e) {
        if (dbg) alert("Telegram: পাঠাতে সমস্যা — " + e.message);
      }
      return;
    }

    const token = String(tg.botToken || "").trim();
    const chat = String(tg.chatId || "").trim();

    if (!token || !chat || /PASTE/.test(token)) {
      if (dbg) alert("Telegram: config.js-এ টোকেন বসানো হয়নি।");
      return;
    }

    try {
      const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        body: new URLSearchParams({ chat_id: chat, text })
      });

      const j = await r.json().catch(() => null);
      if (dbg) alert(j && j.ok
        ? "Telegram: মেসেজ পাঠানো হয়েছে ✅"
        : "Telegram ত্রুটি: " + (j ? j.description : "উত্তর পড়া যায়নি"));
      else if (j && !j.ok) console.warn("Telegram:", j.description);
    } catch (e) {
      if (dbg) alert("Telegram: পাঠাতে সমস্যা — " + e.message);
    }
  }

  const waLink = text =>
    `https://wa.me/${C.whatsappNumber}?text=${encodeURIComponent(text)}`;

  /* ================= অর্ডার সাবমিট ================= */
  f.addEventListener("submit", async e => {
    e.preventDefault();

    const err = validate(true);
    $("#formErr").textContent = err;
    if (err) return;

    const btn = f.querySelector('button[type="submit"]');
    btn.disabled = true;

    try {
      const d = new Date(), t = totals();
      const no = "AL" + String(d.getFullYear()).slice(2) +
        String(d.getMonth() + 1).padStart(2, "0") +
        String(d.getDate()).padStart(2, "0") + "-" +
        Math.floor(1000 + Math.random() * 9000);

      if (C.orderWebhook) {
        try {
          await fetch(C.orderWebhook, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({
              orderNo: no,
              time: d.toISOString(),
              name: f.elements.name.value.trim(),
              phone: f.elements.phone.value.trim(),
              address: f.elements.address.value.trim(),
              area: state.area,
              payment: state.pay,
              trxId: $("#trx") ? $("#trx").value.trim() : "",
              items: lines().map(x =>
                `${x.p.name} / সাইজ ${x.size} / ${x.qty}টি / ${x.qty * unit({ size: x.size }, x.p)} টাকা`
              ).join(" ; "),
              subtotal: t.sub,
              plusCharge: t.plus,
              delivery: t.del,
              total: t.total
            })
          });
        } catch {}
      }

      await sendTelegram(tgText(no));
      $("#tOrder").textContent = no;
      $("#tTotal").textContent = tk(t.total);
      $("#tWa").href = waLink(orderText(no));
      $("#thanks").hidden = false;
      confetti();
    } finally {
      btn.disabled = false;
    }
  });

  $("#tClose").onclick = () => {
    $("#thanks").hidden = true;
    f.reset();
    state.items = {};
    state.cart = [];
    state.pay = "cod";
    state.area = "in";

    document.querySelectorAll(".pcard").forEach(c => {
      c.classList.remove("sel");
      c.querySelectorAll(".sz").forEach(s => s.classList.remove("on"));
      c.querySelector(".qty b").textContent = bn(1);
    });

    payGrid.querySelectorAll(".pay").forEach(x =>
      x.classList.toggle("on", x.dataset.k === "cod")
    );

    document.querySelectorAll("#areaRow .choice").forEach((c, i) =>
      c.classList.toggle("active", i === 0)
    );

    renderPay();
    refresh();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  $("#waOrderBtn").addEventListener("click", () => {
    const err = validate(false);
    $("#formErr").textContent = err;
    if (err) return;
    window.open(waLink(orderText("")), "_blank", "noopener");
  });

  /* ================= কনফেটি ================= */
  function confetti() {
    if (reduce) return;

    const cols = ["#e91e8c", "#ff5db1", "#4b1a8c", "#a46fe0", "#ffd6ec"];

    for (let i = 0; i < 60; i++) {
      const c = document.createElement("i");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = cols[i % cols.length];
      c.style.animationDelay = Math.random() * .6 + "s";
      c.style.animationDuration = 1.8 + Math.random() * 1.4 + "s";
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3800);
    }
  }

  /* ================= স্টিকি দাম-বার ================= */
  const bar = $("#stickyBar"), seen = { hero: false, order: false };
  const syncBar = () => bar.classList.toggle("hide", seen.hero || seen.order);

  new IntersectionObserver(([en]) => {
    seen.hero = en.intersectionRatio >= 0.55;
    syncBar();
  }, { threshold: [0, 0.25, 0.55, 0.8, 1] }).observe($("#hero"));

  new IntersectionObserver(([en]) => {
    seen.order = en.isIntersecting;
    syncBar();
  }, { threshold: 0.12 }).observe($("#order"));

})().catch(error => {
  console.error("Alvina Website initialization error:", error);
});
