

(function () {
    let config = { apiKey: null, endpoint: '/api/track' };

    let visitorId = null;
    let sessionId = null;
    let sessionStarted = false;

    const SESSION_TIMEOUT = 30 * 60 * 1000;

    function getDevice() {
        const ua = navigator.userAgent.toLowerCase();

        if (ua.includes('ipad') || ua.includes('tablet')) return 'tablet';
        if (ua.includes('mobile') || ua.includes('android')) return 'mobile';
        return 'desktop';
    }

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
        const now = Date.now();
        const storedSessionId = getCookie('nexora_ses');
        const lastActivityTime = getCookie('nexora_last_activity');

        if (storedSessionId && lastActivityTime) {
            const timeSinceActivity = now - Number(lastActivityTime);

            if (!Number.isNaN(timeSinceActivity) && timeSinceActivity < SESSION_TIMEOUT) {
                sessionId = storedSessionId;
                setCookie('_nexora_last_activity', now.toString(), 1);
                return sessionId;
            }
        }

        sessionId = generateId();
        setCookie('nexora_ses', sessionId, 1);
        setCookie('nexora_last_activity', now.toString(), 1);

        if (!sessionStarted) {
            sessionStarted = true;
            track('session_start');
        }

        return sessionId;
    }

    function track(eventName, eventData) {
        if (!config.apiKey) {
            console.warn('Nexora not initialized');
            return;
        };

        setCookie('nexora_last_activity', Date.now().toString(), 1);

        const pageUrl = window.location.href;
        const pageTitle = document.title;
        const reffer = document.referrer

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
            device: getDevice(),
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
                body: JSON.stringify(payload),
                keepalive: true
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
    init(apiKey) {
      if (!apiKey) {
        console.warn('API key is required');
        return;
      }

      config.apiKey = apiKey;

      initializeVisitor();
      initializeSession();

      setupAutoTracking();
    },

    track(eventName, eventData) {
      track(eventName, eventData);
    }
  };
    }) ()

