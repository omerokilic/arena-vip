// ======================================================
// ARENA PLAYSTATION SIMRACING
// VIP ÇAĞRI SİSTEMİ
// ======================================================


// ======================================================
// SUPABASE
// ======================================================

const SUPABASE_URL =
    "https://ngpcywxleniznketgipz.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_1KvkDwQCCkh0BntMLYJwgA_s6Kzeb3A";

const db =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


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

const params =
    new URLSearchParams(
        window.location.search
    );

const room =
    Number(
        params.get("room")
    );


// ======================================================
// TALEP TÜRLERİ
// ======================================================

const requestTypes = {

    personel:
        "Personel Çağırıyor",

    teknik:
        "Teknik Destek İstiyor",

    servis:
        "Servis İstiyor",

    hesap:
        "Hesap İstiyor"

};


// ======================================================
// VIP ODA
// ======================================================

function setupRoom() {

    const badge =
        document.getElementById(
            "vipRoom"
        );

    if (!badge) {
        return;
    }

    if (
        room >= 1 &&
        room <= 4
    ) {

        badge.innerText =
            "VIP ODA " + room;

    } else {

        badge.innerText =
            "VIP ODA";

    }

}


// ======================================================
// MÜŞTERİ TALEBİ GÖNDER
// ======================================================

async function sendRequest(type) {

    if (
        room < 1 ||
        room > 4
    ) {

        alert(
            "VIP oda bilgisi bulunamadı."
        );

        return;

    }


    const buttons =
        document.querySelectorAll(
            ".buttons button"
        );


    buttons.forEach(
        function(button) {

            button.disabled = true;

        }
    );


    try {

        const {
            error
        } =

            await db
                .from(
                    "vip_requests"
                )
                .insert({

                    room_number:
                        room,

                    request_type:
                        requestTypes[type],

                    status:
                        "pending"

                });


        if (error) {

            console.error(
                "Supabase:",
                error
            );

            throw error;

        }


        const message =
            document.getElementById(
                "message"
            );


        if (message) {

            message.innerText =
                "✓ Talebiniz alındı. Personelimiz birazdan yanınıza gelecektir.";

            message.style.display =
                "block";

        }


    } catch (error) {

        console.error(
            "Talep gönderilemedi:",
            error
        );


        alert(
            "Talep gönderilemedi. Lütfen ana masaya haber verin."
        );


        buttons.forEach(
            function(button) {

                button.disabled =
                    false;

            }
        );

    }

}


// ======================================================
// MÜŞTERİ BUTONLARI
// ======================================================

function setupCustomerButtons() {

    const buttons =
        document.querySelectorAll(
            ".buttons button"
        );


    if (
        !buttons ||
        buttons.length < 4
    ) {

        return;

    }


    buttons[0].addEventListener(
        "click",
        function() {

            sendRequest(
                "personel"
            );

        }
    );


    buttons[1].addEventListener(
        "click",
        function() {

            sendRequest(
                "teknik"
            );

        }
    );


    buttons[2].addEventListener(
        "click",
        function() {

            sendRequest(
                "servis"
            );

        }
    );


    buttons[3].addEventListener(
        "click",
        function() {

            sendRequest(
                "hesap"
            );

        }
    );

}


// ======================================================
// SES SİSTEMİ
// ======================================================

async function enableSound() {

    try {

        if (!audioContext) {

            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

        }


        if (
            audioContext.state ===
            "suspended"
        ) {

            await audioContext.resume();

        }


        soundEnabled =
            true;


        const button =
            document.getElementById(
                "soundButton"
            );


        if (button) {

            button.innerText =
                "🔊 SES AKTİF";

            button.disabled =
                true;

        }


        // SES TESTİ

        playNotificationSound();


        console.log(
            "Arena ses sistemi aktif."
        );


    } catch (error) {

        console.error(
            "Ses sistemi hatası:",
            error
        );


        alert(
            "Ses sistemi başlatılamadı."
        );

    }

}


// ======================================================
// GÜÇLÜ BİLDİRİM SESİ
// ======================================================

function playNotificationSound() {

    if (
        !soundEnabled
    ) {

        return;

    }


    if (
        !audioContext
    ) {

        return;

    }


    const now =
        audioContext.currentTime;


    // --------------------------------------------------
    // ANA SES
    // --------------------------------------------------

    const oscillator1 =
        audioContext.createOscillator();

    const gain1 =
        audioContext.createGain();


    oscillator1.type =
        "square";


    oscillator1.frequency.setValueAtTime(
        880,
        now
    );


    oscillator1.connect(
        gain1
    );


    gain1.connect(
        audioContext.destination
    );


    gain1.gain.setValueAtTime(
        0.0001,
        now
    );


    gain1.gain.exponentialRampToValueAtTime(
        0.45,
        now + 0.02
    );


    gain1.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.30
    );


    oscillator1.start(
        now
    );


    oscillator1.stop(
        now + 0.32
    );


    // --------------------------------------------------
    // İKİNCİ SES
    // --------------------------------------------------

    const oscillator2 =
        audioContext.createOscillator();

    const gain2 =
        audioContext.createGain();


    oscillator2.type =
        "square";


    oscillator2.frequency.setValueAtTime(
        660,
        now + 0.35
    );


    oscillator2.connect(
        gain2
    );


    gain2.connect(
        audioContext.destination
    );


    gain2.gain.setValueAtTime(
        0.0001,
        now + 0.35
    );


    gain2.gain.exponentialRampToValueAtTime(
        0.45,
        now + 0.38
    );


    gain2.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.68
    );


    oscillator2.start(
        now + 0.35
    );


    oscillator2.stop(
        now + 0.70
    );


    // --------------------------------------------------
    // ÜÇÜNCÜ UYARI SESİ
    // --------------------------------------------------

    const oscillator3 =
        audioContext.createOscillator();

    const gain3 =
        audioContext.createGain();


    oscillator3.type =
        "square";


    oscillator3.frequency.setValueAtTime(
        990,
        now + 0.75
    );


    oscillator3.connect(
        gain3
    );


    gain3.connect(
        audioContext.destination
    );


    gain3.gain.setValueAtTime(
        0.0001,
        now + 0.75
    );


    gain3.gain.exponentialRampToValueAtTime(
        0.50,
        now + 0.78
    );


    gain3.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 1.15
    );


    oscillator3.start(
        now + 0.75
    );


    oscillator3.stop(
        now + 1.20
    );

}


// ======================================================
// TEKRARLI UYARI
// ======================================================

function playStrongNotification() {

    playNotificationSound();


    setTimeout(
        function() {

            if (
                soundEnabled
            ) {

                playNotificationSound();

            }

        },
        1500
    );

}


// ======================================================
// SAAT
// ======================================================

function formatTime(date) {

    return new Date(
        date
    ).toLocaleTimeString(
        "tr-TR",
        {

            hour:
                "2-digit",

            minute:
                "2-digit",

            second:
                "2-digit"

        }
    );

}


// ======================================================
// HTML GÜVENLİĞİ
// ======================================================

function escapeHTML(text) {

    return String(text)
        .replace(
            /[&<>"']/g,
            function(character) {

                const map = {

                    "&":
                        "&amp;",

                    "<":
                        "&lt;",

                    ">":
                        "&gt;",

                    '"':
                        "&quot;",

                    "'":
                        "&#039;"

                };


                return map[
                    character
                ];

            }
        );

}


// ======================================================
// TALEPLERİ GETİR
// ======================================================

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


    try {

        const {
            data,
            error
        } =

            await db
                .from(
                    "vip_requests"
                )
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending:
                            false
                    }
                )
                .limit(100);


        if (error) {

            throw error;

        }


        const pending =
            data.filter(
                function(item) {

                    return (
                        item.status ===
                        "pending"
                    );

                }
            );


        const completed =
            data.filter(
                function(item) {

                    return (
                        item.status !==
                        "pending"
                    );

                }
            );


        // ==================================================
        // YENİ ÇAĞRI KONTROLÜ
        // ==================================================

        const currentPendingIds =
            new Set(
                pending.map(
                    function(item) {

                        return item.id;

                    }
                )
            );


        // İlk açılışta ses çalma.

        if (
            !firstLoad
        ) {

            let newRequest =
                false;


            currentPendingIds.forEach(
                function(id) {

                    if (
                        !previousPendingIds.has(
                            id
                        )
                    ) {

                        newRequest =
                            true;

                    }

                }
            );


            if (
                newRequest
            ) {

                playStrongNotification();

            }

        }


        previousPendingIds =
            currentPendingIds;


        firstLoad =
            false;


        // ==================================================
        // SAYI
        // ==================================================

        if (count) {

            count.innerText =
                pending.length;

        }


        // ==================================================
        // BEKLEYENLER
        // ==================================================

        if (
            pending.length === 0
        ) {

            requestsContainer.innerHTML = `

                <div class="empty">

                    Şu anda bekleyen
                    VIP çağrısı bulunmuyor.

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


        // ==================================================
        // GEÇMİŞ
        // ==================================================

        if (
            historyContainer
        ) {

            if (
                completed.length === 0
            ) {

                historyContainer.innerHTML = `

                    <div class="empty">

                        Henüz tamamlanan
                        talep yok.

                    </div>

                `;

            } else {

                historyContainer.innerHTML =

                    completed
                        .slice(
                            0,
                            30
                        )
                        .map(
                            createHistoryHTML
                        )
                        .join("");

            }

        }


        // ==================================================
        // TAMAMLANDI BUTONLARI
        // ==================================================

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


    } catch (error) {

        console.error(
            "Talepler yüklenemedi:",
            error
        );


        requestsContainer.innerHTML = `

            <div class="empty">

                ❌ Talepler yüklenemedi.

            </div>

        `;

    }

}


// ======================================================
// TALEP KARTI
// ======================================================

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

                🕐
                ${formatTime(
                    item.created_at
                )}

            </div>


            <button
                class="complete"
                data-id="${item.id}"
            >

                ✓ TAMAMLANDI

            </button>

        </div>

    `;

}


// ======================================================
// GEÇMİŞ
// ======================================================

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


// ======================================================
// TALEBİ TAMAMLA
// ======================================================

async function completeRequest(event) {

    const id =
        Number(
            event.currentTarget
                .dataset
                .id
        );


    try {

        const {
            error
        } =

            await db
                .from(
                    "vip_requests"
                )
                .update({

                    status:
                        "completed",

                    completed_at:
                        new Date()
                            .toISOString()

                })
                .eq(
                    "id",
                    id
                );


        if (error) {

            throw error;

        }


        await loadRequests();


    } catch (error) {

        console.error(
            error
        );


        alert(
            "Talep tamamlanamadı."
        );

    }

}


// ======================================================
// GEÇMİŞİ TEMİZLE
// ======================================================

async function clearHistory() {

    const confirmed =
        confirm(
            "Tamamlanmış talepler silinsin mi?"
        );


    if (!confirmed) {

        return;

    }


    try {

        const {
            error
        } =

            await db
                .from(
                    "vip_requests"
                )
                .delete()
                .neq(
                    "status",
                    "pending"
                );


        if (error) {

            throw error;

        }


        await loadRequests();


    } catch (error) {

        console.error(
            error
        );


        alert(
            "Geçmiş temizlenemedi."
        );

    }

}


// ======================================================
// REALTIME
// ======================================================

function startRealtime() {

    console.log(
        "Arena Realtime başlatılıyor..."
    );


    db.channel(
        "arena-vip-realtime"
    )


        .on(

            "postgres_changes",

            {

                event:
                    "*",

                schema:
                    "public",

                table:
                    "vip_requests"

            },

            function(payload) {

                console.log(
                    "Yeni Supabase olayı:",
                    payload
                );


                loadRequests();

            }

        )


        .subscribe(
            function(status) {

                console.log(
                    "Realtime:",
                    status
                );

            }
        );

}


// ======================================================
// SAYFA BAŞLANGICI
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {


        // ==================================================
        // ADMIN PANELİ
        // ==================================================

        const requests =
            document.getElementById(
                "requests"
            );


        if (requests) {


            // SES BUTONU

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


            // GEÇMİŞİ TEMİZLE

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


            // TALEPLER

            loadRequests();


            // REALTIME

            startRealtime();


            console.log(
                "Arena VIP Paneli hazır."
            );


        } else {


            // ==================================================
            // VIP MÜŞTERİ SAYFASI
            // ==================================================

            setupRoom();

            setupCustomerButtons();


            console.log(
                "Arena VIP müşteri ekranı hazır."
            );

        }

    }
);
