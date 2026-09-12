// ======================================================
// ARENA PLAYSTATION SIMRACING
// VIP ÇAĞRI SİSTEMİ (MENÜ & SEPET ENTEGRELİ)
// ======================================================


// ======================================================
// 1. ÜRÜN VE MENÜ VERİTABANI (FİYATLARI BURADAN DEĞİŞTİR)
// ======================================================
const menuData = [
    {
        category: "Soğuk İçecekler",
        items: [
            { id: "s1", name: "Teneke Kola", price: 40, icon: "🥤" },
            { id: "s2", name: "Redbull", price: 60, icon: "⚡" },
            { id: "s3", name: "Blackburn", price: 50, icon: "🔋" },
            { id: "s4", name: "Meyve Suyu", price: 30, icon: "🧃" },
            { id: "s5", name: "Soğuk Çay", price: 35, icon: "🍹" },
            { id: "s6", name: "Meyveli Soda", price: 25, icon: "🍾" },
            { id: "s7", name: "Sade Soda", price: 20, icon: "🧊" },
            { id: "s8", name: "Su", price: 10, icon: "💧" },
            { id: "s9", name: "Soğuk Kahve", price: 55, icon: "🧋" }
        ]
    },
    {
        category: "Sıcak İçecekler",
        items: [
            { id: "h1", name: "Çay", price: 15, icon: "☕" },
            { id: "h2", name: "Kahve", price: 40, icon: "☕" },
            { id: "h3", name: "Oralet", price: 15, icon: "🍊" }
        ]
    },
    {
        category: "Atıştırmalıklar",
        items: [
            { id: "a1", name: "Tam Karışık Tost", price: 120, icon: "🥪" },
            { id: "a2", name: "Yarım Karışık Tost", price: 70, icon: "🥪" },
            { id: "a3", name: "Tam Sucuklu Tost", price: 110, icon: "🥪" },
            { id: "a4", name: "Yarım Sucuklu Tost", price: 65, icon: "🥪" },
            { id: "a5", name: "Tam Kaşarlı Tost", price: 100, icon: "🥪" },
            { id: "a6", name: "Yarım Kaşarlı Tost", price: 60, icon: "🥪" },
            { id: "a7", name: "Çikolata", price: 30, icon: "🍫" },
            { id: "a8", name: "Bisküvi", price: 25, icon: "🍪" },
            { id: "a9", name: "Jelibon", price: 25, icon: "🍬" },
            { id: "a10", name: "Kovada Cips", price: 60, icon: "🍿" },
            { id: "a11", name: "Paket Cips", price: 40, icon: "🥔" },
            { id: "a12", name: "Kek", price: 20, icon: "🧁" }
        ]
    }
];

let cart = {}; // Müşterinin sepeti


// ======================================================
// SUPABASE
// ======================================================

const SUPABASE_URL = "https://ngpcywxleniznketgipz.supabase.co";
const SUPABASE_KEY = "sb_publishable_1KvkDwQCCkh0BntMLYJwgA_s6Kzeb3A";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// ======================================================
// GENEL DEĞİŞKENLER
// ======================================================

let audioContext = null;
let soundEnabled = false;
let previousPendingIds = new Set();
let firstLoad = true;


// ======================================================
// URL / ODA
// ======================================================

const params = new URLSearchParams(window.location.search);
const room = Number(params.get("room"));


// ======================================================
// TALEP TÜRLERİ
// ======================================================

const requestTypes = {
    personel: "Personel Çağırıyor",
    teknik: "Teknik Destek İstiyor",
    servis: "Servis İstiyor", // Artık menü için kullanılıyor, doğrudan gönderilmeyecek
    hesap: "Hesap İstiyor"
};


// ======================================================
// VIP ODA
// ======================================================

function setupRoom() {
    const badge = document.getElementById("vipRoom");
    if (!badge) return;
    if (room >= 1 && room <= 4) {
        badge.innerText = "VIP ODA " + room;
    } else {
        badge.innerText = "VIP ODA";
    }
}


// ======================================================
// MÜŞTERİ TALEBİ GÖNDER (Standart Butonlar İçin)
// ======================================================

async function sendRequest(type) {
    if (room < 1 || room > 4) {
        alert("VIP oda bilgisi bulunamadı.");
        return;
    }

    const buttons = document.querySelectorAll(".buttons button");
    buttons.forEach(button => button.disabled = true);

    try {
        const { error } = await db.from("vip_requests").insert({
            room_number: room,
            request_type: requestTypes[type],
            status: "pending"
        });

        if (error) throw error;

        const message = document.getElementById("message");
        if (message) {
            message.innerText = "✓ Talebiniz alındı. Personelimiz birazdan yanınıza gelecektir.";
            message.style.display = "block";
        }

    } catch (error) {
        console.error("Talep gönderilemedi:", error);
        alert("Talep gönderilemedi. Lütfen ana masaya haber verin.");
        buttons.forEach(button => button.disabled = false);
    }
}


// ======================================================
// SİPARİŞİ GÖNDER (Menü - Sepet İçin Özel Fonksiyon)
// ======================================================

async function sendDetailedOrder(orderText) {
    if (room < 1 || room > 4) {
        alert("VIP oda bilgisi bulunamadı.");
        return;
    }

    // Ana ekrandaki butonları kilitle
    const buttons = document.querySelectorAll(".buttons button");
    buttons.forEach(button => button.disabled = true);

    try {
        // Mevcut tablo yapını bozmadan siparişi request_type olarak gönderiyoruz
        // Örn: "Servis: 2x Teneke Kola, 1x Tost | Toplam: 200 TL"
        const { error } = await db.from("vip_requests").insert({
            room_number: room,
            request_type: orderText, 
            status: "pending"
        });

        if (error) throw error;

        closeMenuModal();
        cart = {}; // Sipariş başarılı olunca sepeti temizle
        updateCartUI();

        const message = document.getElementById("message");
        if (message) {
            message.innerText = "✓ Siparişiniz alındı. Hemen hazırlanıp getirilecektir.";
            message.style.display = "block";
        }

    } catch (error) {
        console.error("Sipariş gönderilemedi:", error);
        alert("Sipariş gönderilemedi. Lütfen ana masaya haber verin.");
        buttons.forEach(button => button.disabled = false);
    }
}


// ======================================================
// MÜŞTERİ BUTONLARI BAĞLANTILARI
// ======================================================

function setupCustomerButtons() {
    const buttons = document.querySelectorAll(".buttons button");
    if (!buttons || buttons.length < 4) return;

    buttons[0].addEventListener("click", () => sendRequest("personel"));
    buttons[1].addEventListener("click", () => sendRequest("teknik"));
    
    // 3. BUTON: Servis iste (Artık menüyü açacak)
    buttons[2].addEventListener("click", () => openMenuModal());
    
    buttons[3].addEventListener("click", () => sendRequest("hesap"));
}


// ======================================================
// ARAYÜZ (UI) - MENÜ VE SEPET SİSTEMİ OLUŞTURMA
// ======================================================

function injectMenuUI() {
    // 1. Modal ve CSS Tasarımı Ekleme
    const style = document.createElement("style");
    style.innerHTML = `
        #menuModal {
            display: none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%;
            background-color: rgba(0,0,0,0.85); backdrop-filter: blur(5px);
            font-family: 'Inter', sans-serif;
        }
        .menu-content {
            background: #111; color: white; width: 95%; max-width: 500px;
            margin: 5% auto; border-radius: 12px; border: 1px solid #ffd700;
            display: flex; flex-direction: column; max-height: 85vh;
            box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
        }
        .menu-header {
            padding: 15px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;
        }
        .menu-header h2 { margin: 0; color: #ffd700; font-size: 1.2rem; text-transform: uppercase; letter-spacing: 1px; }
        .close-menu { background: none; border: none; color: #ff4444; font-size: 1.5rem; font-weight: bold; cursor: pointer; padding: 0 10px;}
        .menu-body { padding: 15px; overflow-y: auto; flex-grow: 1; }
        .menu-category { color: #888; font-size: 0.9rem; font-weight: bold; margin: 20px 0 10px 0; border-bottom: 1px dashed #333; padding-bottom: 5px; text-transform: uppercase; }
        .menu-category:first-child { margin-top: 0; }
        .menu-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #222; }
        .item-info { display: flex; align-items: center; gap: 10px; flex-grow: 1; }
        .item-icon { font-size: 1.5rem; }
        .item-name { font-size: 1rem; font-weight: 500; }
        .item-price { color: #ffd700; font-size: 0.9rem; font-weight: bold; }
        .item-controls { display: flex; align-items: center; gap: 10px; }
        .qty-btn { background: #333; color: white; border: none; width: 32px; height: 32px; border-radius: 8px; font-size: 1.2rem; cursor: pointer; transition: 0.2s; }
        .qty-btn:active { background: #ffd700; color: black; }
        .qty-display { min-width: 20px; text-align: center; font-weight: bold; font-size: 1.1rem; }
        .menu-footer { padding: 15px; border-top: 1px solid #333; background: #0a0a0a; border-radius: 0 0 12px 12px; }
        .cart-summary { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .cart-total-label { font-size: 1rem; color: #aaa; }
        .cart-total-price { font-size: 1.4rem; color: #ffd700; font-weight: bold; }
        .send-order-btn { width: 100%; padding: 15px; background: #ffd700; color: #000; font-weight: bold; font-size: 1.1rem; border: none; border-radius: 8px; cursor: pointer; text-transform: uppercase; transition: 0.3s; }
        .send-order-btn:disabled { background: #444; color: #888; cursor: not-allowed; }
        .send-order-btn:active:not(:disabled) { transform: scale(0.98); }
    `;
    document.head.appendChild(style);

    // 2. HTML Yapısı
    const modalHTML = `
        <div id="menuModal">
            <div class="menu-content">
                <div class="menu-header">
                    <h2>🛒 Sipariş Menüsü</h2>
                    <button class="close-menu" onclick="closeMenuModal()">✕</button>
                </div>
                <div class="menu-body" id="menuItemsContainer">
                    <!-- Ürünler buraya JS ile yüklenecek -->
                </div>
                <div class="menu-footer">
                    <div class="cart-summary">
                        <div class="cart-total-label">TOPLAM:</div>
                        <div class="cart-total-price" id="cartTotalPrice">0 TL</div>
                    </div>
                    <button class="send-order-btn" id="sendOrderBtn" onclick="submitOrder()" disabled>Siparişi Gönder</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 3. Ürünleri Listele
    const container = document.getElementById("menuItemsContainer");
    let htmlContent = "";

    menuData.forEach(cat => {
        htmlContent += `<div class="menu-category">${cat.category}</div>`;
        cat.items.forEach(item => {
            htmlContent += `
                <div class="menu-item">
                    <div class="item-info">
                        <div class="item-icon">${item.icon}</div>
                        <div>
                            <div class="item-name">${item.name}</div>
                            <div class="item-price">${item.price} TL</div>
                        </div>
                    </div>
                    <div class="item-controls">
                        <button class="qty-btn" onclick="changeQty('${item.id}', '${item.name}', ${item.price}, -1)">-</button>
                        <div class="qty-display" id="qty-${item.id}">0</div>
                        <button class="qty-btn" onclick="changeQty('${item.id}', '${item.name}', ${item.price}, 1)">+</button>
                    </div>
                </div>
            `;
        });
    });
    
    container.innerHTML = htmlContent;
}

// 4. Sepet İşlemleri
window.changeQty = function(id, name, price, change) {
    if (!cart[id]) {
        cart[id] = { name: name, price: price, qty: 0 };
    }
    
    cart[id].qty += change;
    if (cart[id].qty <= 0) {
        delete cart[id];
        document.getElementById(`qty-${id}`).innerText = "0";
    } else {
        document.getElementById(`qty-${id}`).innerText = cart[id].qty;
    }
    
    updateCartUI();
};

function updateCartUI() {
    let total = 0;
    for (let key in cart) {
        total += (cart[key].price * cart[key].qty);
    }
    
    document.getElementById("cartTotalPrice").innerText = total + " TL";
    
    const sendBtn = document.getElementById("sendOrderBtn");
    if (total > 0) {
        sendBtn.disabled = false;
        sendBtn.innerText = `Siparişi Gönder (${total} TL)`;
    } else {
        sendBtn.disabled = true;
        sendBtn.innerText = "Siparişi Gönder";
    }
}

// 5. Siparişi Hazırlama
window.submitOrder = function() {
    let orderDetails = "SİPARİŞ:\n";
    let total = 0;
    
    for (let key in cart) {
        orderDetails += `• ${cart[key].qty}x ${cart[key].name}\n`;
        total += (cart[key].price * cart[key].qty);
    }
    
    orderDetails += `\nTOPLAM: ${total} TL`;
    
    // Oluşturduğumuz stringi mevcut request_type alanına yazdırarak Ana Masaya iletiyoruz
    sendDetailedOrder(orderDetails);
};

// 6. Modal Aç/Kapat
window.openMenuModal = function() {
    const modal = document.getElementById("menuModal");
    if (!modal) {
        injectMenuUI();
    }
    document.getElementById("menuModal").style.display = "block";
};

window.closeMenuModal = function() {
    const modal = document.getElementById("menuModal");
    if (modal) {
        modal.style.display = "none";
    }
};

// Modal dışına tıklayınca kapanma desteği
window.onclick = function(event) {
    const modal = document.getElementById("menuModal");
    if (event.target == modal) {
        closeMenuModal();
    }
};


// ======================================================
// SES SİSTEMİ VE GERİ KALAN MEVCUT KODLAR (DOKUNULMADI)
// ======================================================

async function enableSound() {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }
        soundEnabled = true;

        const button = document.getElementById("soundButton");
        if (button) {
            button.innerText = "🔊 SES AKTİF";
            button.disabled = true;
        }

        playNotificationSound();
        console.log("Arena ses sistemi aktif.");
    } catch (error) {
        console.error("Ses sistemi hatası:", error);
        alert("Ses sistemi başlatılamadı.");
    }
}

function playNotificationSound() {
    if (!soundEnabled || !audioContext) return;
    const now = audioContext.currentTime;

    const oscillator1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    oscillator1.type = "square";
    oscillator1.frequency.setValueAtTime(880, now);
    oscillator1.connect(gain1);
    gain1.connect(audioContext.destination);
    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.exponentialRampToValueAtTime(0.45, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.30);
    oscillator1.start(now);
    oscillator1.stop(now + 0.32);

    const oscillator2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    oscillator2.type = "square";
    oscillator2.frequency.setValueAtTime(660, now + 0.35);
    oscillator2.connect(gain2);
    gain2.connect(audioContext.destination);
    gain2.gain.setValueAtTime(0.0001, now + 0.35);
    gain2.gain.exponentialRampToValueAtTime(0.45, now + 0.38);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.68);
    oscillator2.start(now + 0.35);
    oscillator2.stop(now + 0.70);

    const oscillator3 = audioContext.createOscillator();
    const gain3 = audioContext.createGain();
    oscillator3.type = "square";
    oscillator3.frequency.setValueAtTime(990, now + 0.75);
    oscillator3.connect(gain3);
    gain3.connect(audioContext.destination);
    gain3.gain.setValueAtTime(0.0001, now + 0.75);
    gain3.gain.exponentialRampToValueAtTime(0.50, now + 0.78);
    gain3.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);
    oscillator3.start(now + 0.75);
    oscillator3.stop(now + 1.20);
}

function playStrongNotification() {
    playNotificationSound();
    setTimeout(() => { if (soundEnabled) playNotificationSound(); }, 1500);
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function escapeHTML(text) {
    return String(text).replace(/[&<>"']/g, function(character) {
        const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
        return map[character];
    });
}

async function loadRequests() {
    const requestsContainer = document.getElementById("requests");
    const historyContainer = document.getElementById("history");
    const count = document.getElementById("requestCount");

    if (!requestsContainer) return;

    try {
        const { data, error } = await db
            .from("vip_requests")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(100);

        if (error) throw error;

        const pending = data.filter(item => item.status === "pending");
        const completed = data.filter(item => item.status !== "pending");

        const currentPendingIds = new Set(pending.map(item => item.id));

        if (!firstLoad) {
            let newRequest = false;
            currentPendingIds.forEach(id => {
                if (!previousPendingIds.has(id)) newRequest = true;
            });
            if (newRequest) playStrongNotification();
        }

        previousPendingIds = currentPendingIds;
        firstLoad = false;

        if (count) count.innerText = pending.length;

        if (pending.length === 0) {
            requestsContainer.innerHTML = `<div class="empty">Şu anda bekleyen VIP çağrısı bulunmuyor.</div>`;
        } else {
            requestsContainer.innerHTML = pending.map(createRequestHTML).join("");
        }

        if (historyContainer) {
            if (completed.length === 0) {
                historyContainer.innerHTML = `<div class="empty">Henüz tamamlanan talep yok.</div>`;
            } else {
                historyContainer.innerHTML = completed.slice(0, 30).map(createHistoryHTML).join("");
            }
        }

        document.querySelectorAll(".complete").forEach(button => {
            button.addEventListener("click", completeRequest);
        });

    } catch (error) {
        console.error("Talepler yüklenemedi:", error);
        requestsContainer.innerHTML = `<div class="empty">❌ Talepler yüklenemedi.</div>`;
    }
}

// Admin paneli için HTML kırılımları (CSS bozulmasın diye <pre> veya whitespace kullanılabilir. 
// Yeni sipariş formatı çok satırlı gelebileceği için css white-space: pre-line desteği ile daha şık durur.)
function createRequestHTML(item) {
    return `
        <div class="request">
            <div class="room">VIP ODA ${item.room_number}</div>
            <div class="type" style="white-space: pre-line; line-height: 1.4;">
                ${escapeHTML(item.request_type)}
            </div>
            <div class="time">🕐 ${formatTime(item.created_at)}</div>
            <button class="complete" data-id="${item.id}">✓ TAMAMLANDI</button>
        </div>
    `;
}

function createHistoryHTML(item) {
    return `
        <div class="history-item">
            <span style="white-space: pre-line;">VIP ${item.room_number} • ${escapeHTML(item.request_type)}</span>
            <span>${formatTime(item.created_at)}</span>
        </div>
    `;
}

async function completeRequest(event) {
    const id = Number(event.currentTarget.dataset.id);
    try {
        const { error } = await db
            .from("vip_requests")
            .update({ status: "completed", completed_at: new Date().toISOString() })
            .eq("id", id);
        if (error) throw error;
        await loadRequests();
    } catch (error) {
        console.error(error);
        alert("Talep tamamlanamadı.");
    }
}

async function clearHistory() {
    const confirmed = confirm("Tamamlanmış talepler silinsin mi?");
    if (!confirmed) return;
    try {
        const { error } = await db
            .from("vip_requests")
            .delete()
            .neq("status", "pending");
        if (error) throw error;
        await loadRequests();
    } catch (error) {
        console.error(error);
        alert("Geçmiş temizlenemedi.");
    }
}

function startRealtime() {
    console.log("Arena Realtime başlatılıyor...");
    db.channel("arena-vip-realtime")
        .on("postgres_changes", { event: "*", schema: "public", table: "vip_requests" }, payload => {
            console.log("Yeni Supabase olayı:", payload);
            loadRequests();
        })
        .subscribe(status => {
            console.log("Realtime:", status);
        });
}

// ======================================================
// SAYFA BAŞLANGICI
// ======================================================

document.addEventListener("DOMContentLoaded", function() {
    const requests = document.getElementById("requests");
    
    if (requests) {
        // ADMIN PANELİ
        const soundButton = document.getElementById("soundButton");
        if (soundButton) soundButton.addEventListener("click", enableSound);

        const clearButton = document.querySelector(".clear");
        if (clearButton) clearButton.addEventListener("click", clearHistory);

        loadRequests();
        startRealtime();
        console.log("Arena VIP Paneli hazır.");
    } else {
        // VIP MÜŞTERİ SAYFASI
        setupRoom();
        setupCustomerButtons();
        console.log("Arena VIP müşteri ekranı hazır.");
    }
});
