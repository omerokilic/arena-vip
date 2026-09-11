const SUPABASE_URL =
    "https://ngpcywxleniznketgipz.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_1KvkDwQCCkh0BntMLYJwgA_s6Kzeb3A";


const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =====================================================
// MÜŞTERİ TARAFI
// =====================================================

const params =
    new URLSearchParams(window.location.search);

const room =
    Number(params.get("room"));


const requestTypes = {

    personel: "Personel Çağırıyor",

    teknik: "Teknik Destek İstiyor",

    servis: "Servis İstiyor",

    hesap: "Hesap İstiyor"

};


// VIP odası bilgisi

function setupRoom() {

    const badge =
        document.getElementById("vipRoom");

    if (!badge) {
        return;
    }


    if (room >= 1 && room <= 4) {

        badge.innerText =
            "VIP ODA " + room;

    } else {

        badge.innerText =
            "VIP ODA";

    }

}


// Talep gönder

async function sendRequest(type) {

    if (!(room >= 1 && room <= 4)) {

        alert(
            "VIP oda bilgisi bulunamadı."
        );

        return;
    }


    const buttons =
        document.querySelectorAll(
            ".buttons button"
        );


    buttons.forEach(function(button) {

        button.disabled = true;

    });


    try {

        const { error } =

            await db
                .from("vip_requests")
                .insert({

                    room_number: room,

                    request_type:
                        requestTypes[type],

                    status: "pending"

                });


        if (error) {

            console.error(error);

            throw error;

        }


        const message =
            document.getElementById("message");


        message.innerText =
            "Talebiniz alındı. Personelimiz birazdan yanınıza gelecektir.";


        message.style.display =
            "block";


    } catch (error) {

        console.error(error);


        alert(
            "Talep gönderilemedi. Lütfen ana masaya haber verin."
        );


        buttons.forEach(function(button) {

            button.disabled = false;

        });

    }

}


// Müşteri butonları

function setupCustomerButtons() {

    const buttons =
        document.querySelectorAll(
            ".buttons button"
        );


    if (!buttons.length) {
        return;
    }


    buttons[0].addEventListener(
        "click",
        function() {

            sendRequest("personel");

        }
    );


    buttons[1].addEventListener(
        "click",
        function() {

            sendRequest("teknik");

        }
    );


    buttons[2].addEventListener(
        "click",
        function() {

            sendRequest("servis");

        }
    );


    buttons[3].addEventListener(
        "click",
        function() {

            sendRequest("hesap");

        }
    );

}


// =====================================================
// PERSONEL PANELİ
// =====================================================


let soundEnabled =
    false;


let audioContext =
    null;


let previousPending =
    new Set();


// Ses sistemini aç

function enableSound() {

    try {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();


        if (
            audioContext.state ===
            "suspended"
        ) {

            audioContext.resume();

        }


        soundEnabled =
            true;


        const button =
            document.getElementById(
                "soundButton"
            );


        if (button) {

            button.innerText =
                "🔊 Ses Aktif";

            button.disabled =
                true;

        }

    } catch (error) {

        console.error(error);

    }

}


// Yeni çağrı geldiğinde ses

function playNotificationSound() {

    if (
        !soundEnabled ||
        !audioContext
    ) {

        return;

    }


    const oscillator =
        audioContext.createOscillator();


    const gain =
        audioContext.createGain();


    oscillator.connect(gain);

    gain.connect(
        audioContext.destination
    );


    oscillator.frequency.value =
        880;


    gain.gain.setValueAtTime(
        0.0001,
        audioContext.currentTime
    );


    gain.gain.exponentialRampToValueAtTime(
        0.25,
        audioContext.currentTime + 0.03
    );


    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioContext.currentTime + 0.7
    );


    oscillator.start();


    oscillator.stop(
        audioContext.currentTime + 0.75
    );

}


// Saat

function formatTime(date) {

    return new Date(date)
        .toLocaleTimeString(
            "tr-TR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

}


// HTML güvenliği

function escapeHTML(text) {

    return String(text)
        .replace(
            /[&<>"']/g,
            function(character) {

                const map = {

                    "&": "&amp;",

                    "<": "&lt;",

                    ">": "&gt;",

                    '"': "&quot;",

                    "'": "&#039;"

                };

                return map[
                    character
                ];

            }
        );

}


// Bekleyen çağrıları getir

async function loadRequests() {

    const requestsContainer =
        document.getElementById(
            "requests"
        );


    const historyContainer =
        document.getElementById(
            "history"
        );


    const count =
        document.getElementById(
            "requestCount"
        );


    if (!requestsContainer) {

        return;

    }


    const { data, error } =

        await db
            .from("vip_requests")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            )
            .limit(100);


    if (error) {

        console.error(error);

        requestsContainer.innerHTML = `

            <div class="empty">

                Supabase bağlantısı kurulamadı.

                <br><br>

                Ayarlarınızı kontrol edin.

            </div>

        `;

        return;

    }


    const pending =
        data.filter(function(item) {

            return item.status === "pending";

        });


    const completed =
        data.filter(function(item) {

            return item.status !== "pending";

        });


    // Yeni çağrı kontrolü

    const currentPending =
        new Set(
            pending.map(
                item => item.id
            )
        );


    if (
        previousPending.size > 0
    ) {

        currentPending.forEach(
            function(id) {

                if (
                    !previousPending.has(id)
                ) {

                    playNotificationSound();

                }

            }
        );

    }


    previousPending =
        currentPending;


    count.innerText =
        pending.length;


    // Bekleyenler

    if (!pending.length) {

        requestsContainer.innerHTML = `

            <div class="empty">

                Şu anda bekleyen VIP çağrısı bulunmuyor.

            </div>

        `;

    } else {

        requestsContainer.innerHTML =

            pending
                .map(
                    createRequestHTML
                )
                .join("");

    }


    // Geçmiş

    if (!completed.length) {

        historyContainer.innerHTML = `

            <div class="empty">

                Henüz tamamlanan talep yok.

            </div>

        `;

    } else {

        historyContainer.innerHTML =

            completed
                .slice(0, 30)
                .map(
                    createHistoryHTML
                )
                .join("");

    }


    // Tamamlandı butonları

    document
        .querySelectorAll(
            ".complete"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    completeRequest
                );

            }
        );

}


// Bekleyen çağrı kartı

function createRequestHTML(item) {

    return `

        <div class="request">

            <div class="room">

                VIP ODA
                ${item.room_number}

            </div>


            <div class="type">

                ${escapeHTML(
                    item.request_type
                )}

            </div>


            <div class="time">

                ${formatTime(
                    item.created_at
                )}

            </div>


            <button

                class="complete"

                data-id="${item.id}">

                ✓ TAMAMLANDI

            </button>

        </div>

    `;

}


// Geçmiş kartı

function createHistoryHTML(item) {

    return `

        <div class="history-item">

            <span>

                VIP ${item.room_number}

                • 

                ${escapeHTML(
                    item.request_type
                )}

            </span>


            <span>

                ${formatTime(
                    item.created_at
                )}

            </span>

        </div>

    `;

}


// Talebi tamamla

async function completeRequest(event) {

    const id =
        Number(
            event.currentTarget.dataset.id
        );


    const { error } =

        await db
            .from("vip_requests")
            .update({

                status: "completed",

                completed_at:
                    new Date().toISOString()

            })
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(error);

        alert(
            "Talep tamamlanamadı."
        );

        return;

    }


    loadRequests();

}


// Geçmişi temizle

async function clearHistory() {

    const confirmed =
        confirm(
            "Tamamlanmış talepler silinsin mi?"
        );


    if (!confirmed) {

        return;

    }


    const { error } =

        await db
            .from("vip_requests")
            .delete()
            .neq(
                "status",
                "pending"
            );


    if (error) {

        console.error(error);

        alert(
            "Geçmiş temizlenemedi."
        );

        return;

    }


    loadRequests();

}


// =====================================================
// GERÇEK ZAMANLI SUPABASE BAĞLANTISI
// =====================================================

function startRealtime() {

    db.channel(
        "arena-vip-realtime"
    )

    .on(

        "postgres_changes",

        {

            event: "*",

            schema: "public",

            table: "vip_requests"

        },

        function() {

            loadRequests();

        }

    )

    .subscribe();

}


// =====================================================
// SAYFA BAŞLANGICI
// =====================================================

if (
    document.getElementById(
        "requests"
    )
) {

    // PERSONEL PANELİ

    const soundButton =
        document.getElementById(
            "soundButton"
        );


    if (soundButton) {

        soundButton.addEventListener(
            "click",
            enableSound
        );

    }


    const clearButton =
        document.querySelector(
            ".clear"
        );


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearHistory
        );

    }


    loadRequests();

    startRealtime();

} else {

    // MÜŞTERİ EKRANI

    setupRoom();

    setupCustomerButtons();

}
