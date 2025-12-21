
// helper funtions
function getDeveice() {
    const ua = navigator.userAgent.toLowerCase();

    if (ua.includes('ipad') || ua.includes('tablet')) {
        return 'tablet';
    }
    if (ua.includes('mobile') || ua.includes('android')) {
        return 'mobile';
    }
    return 'desktop';
}

(function () {
    let config = { apiKey: null, endpoint: '/api/track' };

    let visitorId = null;
    let sessionId = null;

    function generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function getCookie(name) {
        if (!name) {
            throw new Error('Cookie name is required');
        }
        const value = document.cookie.split('; ').find(c => c.startsWith(name + "="));
        return value ? value.split('=')[1] : null;
    }

    function setCookie(name, value, days) {
        if (!name || !value || !days) {
            throw new Error('please provide all fields for setting cookie')
        };
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
        const expires = 'expires=' + date.toUTCString()
        document.cookie = `${name}=${value}; ${expires}; path=/`
    }

    function initializeVisitor() {
        visitorId = getCookie('_nexora_vid');

        if (!visitorId) {
            visitorId = generateId();
            setCookie('_nexora_vid', visitorId, 730)
        }

        return visitorId;
    }

    function initializeSession() {
        sessionId = getCookie('_nexora_ses');

        if (!sessionId) {
            sessionId = generateId();
            setCookie('_nexora_ses', sessionId, 730)
        }

        return sessionId;
    }

    function track(eventName, eventData) {
        if (!config.apiKey) {
            throw new Error('nexora not initilized')
        };

        const pageUrl = window.location.href;
        const pageTitle = document.title;
        const reffer = document.referrer

        const device = getDeveice();
        const ua = navigator.userAgent

        const date = new Date
        const payload = {
            apiKey: config.apiKey,

            eventName: eventName,
            eventData: eventData,

            visitorId: visitorId,
            sessionId: sessionId,

            pageUrl: pageUrl,
            pageTitle: pageTitle,
            referrer: reffer,

            userAgent: ua,
            device: device,

            timestamp: date.toISOString()
        }
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(payload)], {
                type: "application/json"
            })
            navigator.sendBeacon(config.endpoint, blob)
        } else {
            fetch(config.endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })
                .then((res) => res.json())
                .then((res) => console.log('Event data sent to server', res))
                .catch((err) => console.error('tracking failed', err))
        }

    }

    function trackPageView() {
        track("page_view")
    }

    function setupAutoTracking() {
        trackPageView();

        window.addEventListener('beforeunload', function () {
            track('session_end');
        });

        window.addEventListener('popstate', function () {
            track('page_view')
        });
    }

    window.nexora = {
        init: function (apiKey) {
            config.apiKey = apiKey;

            initializeVisitor();
            initializeSession();
        },
        track: function (eventName, eventData) { track(eventName, eventData) }
    };
})()

