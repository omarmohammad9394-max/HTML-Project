/* ============================================================
   script.js  — unified frontend logic (navbar, products, details)
   Interactive star rating + premium reviews (Option A)
   Author: tailored for your PrimeVault project
============================================================ */

/* -------------------------
   Utilities
--------------------------*/
function readLS(key, fallback = null) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch (e) { return fallback; }
}
function writeLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function $(id) { return document.getElementById(id); }

/* ============================================================
   NAVBAR — run on every page
============================================================ */
function loadNavbar() {
  const user = readLS("user");
  const cart = readLS("cart", []);

  const usernameBox = $("nav-username");
  const authButtons = $("auth-buttons");
  const cartCount = $("cart-count");

  if (!usernameBox || !authButtons || !cartCount) return;

  if (user) {
    usernameBox.textContent = `Hi, ${user.name}`;
    authButtons.style.display = "none";
  } else {
    usernameBox.textContent = "";
    authButtons.style.display = "flex";
  }

  cartCount.textContent = cart.length;
}

/* ============================================================
   PRODUCTS - listing & featured
============================================================*/

async function fetchCategory(category, elementId) {
  const box = $(elementId);
  if (!box) return;
  try {
    const res = await fetch(`http://localhost:5000/products/${category}`);
    if (!res.ok) throw new Error("Failed to load");
    const list = await res.json();
    renderProducts(list, elementId);
  } catch (err) {
    console.error("Error loading category:", category, err);
    box.innerHTML = `<p style="color:#666;padding:12px">Unable to load products.</p>`;
  }
}

function renderProducts(list, containerId) {
  const box = $(containerId);
  if (!box) return;
  box.innerHTML = "";
  list.forEach(product => {
    const el = document.createElement("div");
    el.className = "product";
    el.innerHTML = `
      <img src="${product.img}" class="pimg" loading="lazy">
      <h3>${product.name}</h3>
      <p>${product.price} EGP</p>
    `;
    el.addEventListener("click", () => openDetails(product.id));
    box.appendChild(el);
  });
}

async function loadFeaturedProducts() {
  const box = $("featuredProducts");
  if (!box) return;
  try {
    const res = await fetch("http://localhost:5000/products");
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    const all = [...data.electronics, ...data.clothes, ...data.accessories];
    const featured = all.slice(0, 6);
    box.innerHTML = "";
    featured.forEach(p => {
      const card = document.createElement("div");
      card.className = "featured-card2";
      card.innerHTML = `<img src="${p.img}" alt=""><h3>${p.name}</h3><p>${p.price} EGP</p>`;
      card.addEventListener("click", () => openDetails(p.id));
      box.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading featured products:", err);
  }
}

/* ============================================================
   NAV to DETAILS
   - openDetails fetches product by id from backend, stores in localStorage
============================================================*/
function openDetails(id) {
  const categories = ["electronics", "clothes", "accessories"];
  (async () => {
    for (let c of categories) {
      try {
        const res = await fetch(`http://localhost:5000/products/${c}/${id}`);
        if (res.ok) {
          const product = await res.json();
          writeLS("selectedProduct", product);
          window.location.href = "product-details.html";
          return;
        }
      } catch (e) { /* ignore */ }
    }
    alert("Product not found");
  })();
}

/* ============================================================
   GLOBAL PRODUCT (read from selectedProduct)
============================================================*/
let product = readLS("selectedProduct") || null;

/* ============================================================
   PRODUCT DETAILS — load page, rating widget & reviews
============================================================*/

function loadProductDetails() {
  // refresh global product in case it was changed
  product = readLS("selectedProduct") || null;
  if (!product || !$("details-image")) return;

  $("details-image").src = product.img;
  $("details-title").textContent = product.name;
  $("details-price").textContent = product.price + " EGP";
  $("details-description").textContent = product.desc;

  // build rating UI
  buildAverageStars();
  buildInteractiveStarInput();
  renderReviews();
}

/* -----------------------
   Rating helpers
------------------------*/

// compute average rating from product.rating + reviews array
function getRatingData() {
  const base = product.rating ? [{ rating: product.rating }] : [];
  const reviews = readLS("reviews_" + product.id, []);
  const all = [...base, ...reviews.map(r => ({ rating: r.rating || 0 }))];
  if (all.length === 0) return { avg: 0, count: 0 };
  const sum = all.reduce((s, r) => s + (Number(r.rating) || 0), 0);
  const avg = +(sum / all.length).toFixed(2);
  return { avg, count: reviews.length };
}

// render average stars (rounded to nearest 0.5)
function buildAverageStars() {
  const container = $("avg-stars");
  const scoreEl = $("avg-score");
  const countEl = $("reviews-count");
  if (!container || !scoreEl || !countEl) return;

  const { avg, count } = getRatingData();
  const whole = Math.floor(avg);
  const half = avg - whole >= 0.5;
  container.innerHTML = "";

  for (let i = 1; i <= 5; i++) {
    const s = document.createElement("span");
    s.className = "star";
    if (i <= whole) s.textContent = "★";
    else if (i === whole + 1 && half) s.textContent = "☆"; // we'll style half separately below if needed
    else s.textContent = "☆";
    container.appendChild(s);
  }

  scoreEl.textContent = avg > 0 ? `${avg} / 5` : "No rating";
  countEl.textContent = `${count} review${count === 1 ? "" : "s"}`;
}

/* -----------------------
   Interactive star input (user's rating)
------------------------*/
let userSelectedRating = 0;

function buildInteractiveStarInput() {
  const starInput = $("star-input");
  const label = $("your-rating-label");
  if (!starInput || !label) return;

  starInput.innerHTML = "";
  userSelectedRating = 0;
  label.textContent = "0 / 5";

  for (let i = 1; i <= 5; i++) {
    const s = document.createElement("span");
    s.className = "star";
    s.innerHTML = "☆";
    s.dataset.value = i;
    s.style.cursor = "pointer";

    s.addEventListener("mouseenter", () => {
      highlightStars(starInput, i);
      label.textContent = `${i} / 5`;
    });

    s.addEventListener("mouseleave", () => {
      highlightStars(starInput, userSelectedRating);
      label.textContent = `${userSelectedRating} / 5`;
    });

    s.addEventListener("click", () => {
      userSelectedRating = i;
      highlightStars(starInput, i);
      label.textContent = `${userSelectedRating} / 5`;
    });

    starInput.appendChild(s);
  }

  // If the user has given a rating before (part of their latest review),
  // attempt to prefill (we choose the most recent review by this user).
  const user = readLS("user");
  if (user) {
    const reviews = readLS("reviews_" + product.id, []);
    const my = reviews.find(r => r.user === user.name);
    if (my && my.rating) {
      userSelectedRating = my.rating;
      highlightStars(starInput, userSelectedRating);
      label.textContent = `${userSelectedRating} / 5`;
    }
  }
}

function highlightStars(container, value) {
  const stars = container.querySelectorAll(".star");
  stars.forEach(s => {
    const v = Number(s.dataset.value);
    if (v <= value) {
      s.classList.add("active");
      s.innerHTML = "★";
      s.style.color = "#ffbf00";
    } else {
      s.classList.remove("active");
      s.innerHTML = "☆";
      s.style.color = "#444";
    }
  });
}

/* ============================================================
   REVIEWS: render + submit
============================================================*/

function renderReviews() {
  const reviewBox = $("details-reviews");
  if (!reviewBox) return;
  reviewBox.innerHTML = "";

  // get reviews (newest first)
  const reviews = readLS("reviews_" + product.id, []) || [];
  if (reviews.length === 0) {
    reviewBox.innerHTML = `<div style="color:#666;padding:8px">No reviews yet — be the first!</div>`;
    return;
  }

  reviews.forEach(r => {
    const card = document.createElement("div");
    card.className = "review-card";

    const stars = "★".repeat(r.rating || 0);

    card.innerHTML = `
      <div class="review-header">
        <strong>${escapeHtml(r.user || "Guest")}</strong>
        <span class="review-stars">${stars}</span>
      </div>
      <div class="review-text">${escapeHtml(r.text)}</div>
      <div class="review-time">${timeAgo(r.time)}</div>
    `;
    reviewBox.appendChild(card);
  });
}

// submit review (with rating)
async function submitReviewAction() {
  const txtEl = $("newReview");
  if (!txtEl) return;
  const text = txtEl.value.trim();
  if (!text) { alert("Write something first!"); return; }

  // determine rating to save
  const rating = userSelectedRating || product.rating || 5;

  // user
  const user = readLS("user");
  const username = user ? user.name : "Guest";

  // gather reviews, ensure newest-first
  const key = "reviews_" + product.id;
  const reviews = readLS(key, []);
  // if user already has review, update it (we'll keep multiple reviews by same user but update latest if exists)
  // For simplicity: remove existing review by same user, then unshift new one.
  const filtered = reviews.filter(r => r.user !== username);

  const newReview = {
    user: username,
    text,
    rating,
    time: Date.now()
  };

  filtered.unshift(newReview);
  writeLS(key, filtered);

  // update UI
  txtEl.value = "";
  buildAverageStars();
  renderReviews();

  // keep the interactive stars set to the user's rating
  const starInput = $("star-input");
  if (starInput) highlightStars(starInput, rating);
  userSelectedRating = rating;

  // OPTIONAL: attempt to send to backend if you later add a server endpoint for reviews
  // (Not implemented in current backend)
}

/* safe text escape to avoid accidental HTML injection in reviews */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* timeAgo for timestamps */
function timeAgo(ts) {
  const now = Date.now();
  const diff = now - ts;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/* ============================================================
   CART functions
============================================================*/

function addToCartDetails() {
  const p = readLS("selectedProduct");
  if (!p) { alert("No product selected"); return; }

  const qtyEl = $("quantity");
  let qty = parseInt(qtyEl?.value || "1", 10);
  if (!qty || qty < 1) qty = 1;

  const cart = readLS("cart", []);
  cart.push({ name: p.name, price: p.price, qty, img: p.img });
  writeLS("cart", cart);
  alert("Added to cart!");
  loadNavbar();
}

function loadCart() {
  // used on cart page — left intact
  const box = $("cartItems");
  if (!box) return;
  const cart = readLS("cart", []);
  box.innerHTML = "";
  let total = 0;
  cart.forEach((item, i) => {
    total += item.price * item.qty;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.img}" class="cart-img">
      <div class="cart-info">
        <h4>${item.name}</h4>
        <p>${item.price} EGP × ${item.qty}</p>
      </div>
      <button class="remove-btn" onclick="removeItem(${i})">🗑</button>
    `;
    box.appendChild(div);
  });
  if ($("total")) $("total").textContent = "Total: " + total + " EGP";
}
function removeItem(i) {
  const cart = readLS("cart", []);
  cart.splice(i, 1);
  writeLS("cart", cart);
  loadCart();
  loadNavbar();
}

/* ============================================================
   PAYMENT / CHECKOUT (calls backend /checkout protected route)
============================================================*/
async function validatePayment() {
  const token = localStorage.getItem("token");
  const cart = readLS("cart", []);
  const total = cart.reduce((s, it) => s + it.price * it.qty, 0);
  try {
    const res = await fetch("http://localhost:5000/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ cart, total })
    });
    const data = await res.json();
    if (!res.ok) { alert("Checkout failed: " + (data.message || "unknown")); return false; }
    writeLS("cart", []);
   window.location.href = "confirmation.html?orderId=" + (data.orderId || "0");
return true;

  } catch (err) {
    console.error(err);
    alert("Server error during checkout.");
    return false;
  }
}

/* ============================================================
   PAGE BOOTSTRAP — wire events + initial loads
============================================================*/
window.addEventListener("DOMContentLoaded", () => {
  loadNavbar();
  // refresh product variable
  product = readLS("selectedProduct") || null;
  // run details loader if on product-details page
  loadProductDetails();

  // attach event handlers that exist on many pages
  if ($("btn-add-cart")) $("btn-add-cart").addEventListener("click", addToCartDetails);
  if ($("btn-submit-review")) $("btn-submit-review").addEventListener("click", submitReviewAction);

  // load categories if present
  if ($("electronicsList")) fetchCategory("electronics", "electronicsList");
  if ($("clothesList")) fetchCategory("clothes", "clothesList");
  if ($("accessoriesList")) fetchCategory("accessories", "accessoriesList");

  // featured
  loadFeaturedProducts();

  // cart page
  loadCart();
});


