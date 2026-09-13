// js/deep-link-share.js

// Універсальна функція перемикання села всередині додатка
window.switchToTown = function(rawTown) {
    if (!rawTown) return;
    const cleanTown = rawTown.trim().toLowerCase();

    window.currentTown = cleanTown;

    const newUrl = window.location.pathname + '?town=' + cleanTown;
    window.history.replaceState({ town: cleanTown }, '', newUrl);

    // 1. Центруємо карту на потрібне місто
    if (window.townConfig && window.townConfig[cleanTown]) {
        const townData = window.townConfig[cleanTown];
        if (window.map) {
            window.map.flyTo({
                center: townData.coords,
                zoom: townData.zoom || 14,
                essential: true
            });
        }
    }

    // 2. Рендеримо полігони/шари для цього села
    if (typeof window.renderVillageLayers === 'function') {
        window.renderVillageLayers(cleanTown);
    }

    // 3. Завантажуємо мітки для цього села
    if (typeof window.loadUserMarkers === 'function') {
        window.loadUserMarkers(cleanTown);
    }
};

// Функція генерації посилання для кнопки 📤
window.shareCurrentMapLocation = async function() {
    let town = window.currentTown || 'berezhnytsia';
    const redirectPageUrl = "https://lorg1996.github.io/map-tiles-storage/redirect.html";
    const finalLink = `${redirectPageUrl}?town=${encodeURIComponent(town)}`;
    const shareText = `📍 Карта території (${town}) у додатку jwmaps:\n${finalLink}`;

    if (navigator.share) {
        try {
            await navigator.share({ title: 'jwmaps - Карта території', text: shareText });
        } catch (err) {
            console.log('Поширення скасовано', err);
        }
    } else {
        navigator.clipboard.writeText(finalLink);
        alert(`Посилання на територію (${town}) скопійовано!`);
    }
};

// Надійна ініціалізація слухача Capacitor Deep Links
function initDeepLinks() {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        window.Capacitor.Plugins.App.addListener('appUrlOpen', (data) => {
            try {
                let town = null;
                if (data.url && data.url.includes('town=')) {
                    const parts = data.url.split('town=');
                    town = parts[1].split('&')[0];
                    town = decodeURIComponent(town);
                }

                if (town) {
                    window.switchToTown(town);
                }
            } catch (e) {
                console.error("Помилка обробки appUrlOpen:", e);
            }
        });
    }
}

initDeepLinks();
document.addEventListener('DOMContentLoaded', initDeepLinks);