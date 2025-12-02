# Nexora

# SaaS Analytics Dashboard - Project Reference

## 1. Core Idea

Build a SaaS product analytics dashboard to track and visualize events from a product. The dashboard will:

- Track real-time events (live updates)
- Support multi-tenant orgs and user roles
- Demonstrate advanced Next.js concepts:
    - Server Components / Client Components
    - Server Actions
    - Route handlers for API
    - Streaming / SSE / WebSockets
    - Middleware / caching
- Focus on clean UI/UX with attention to detail, mobile responsiveness, and interactive charts
- Include a Layer 1 snippet (tiny JS SDK) to simulate developer integration

---

## 2. Core Features (MVP)

1. **User / Org Authentication**
    - NextAuth + roles
    - Each org has its own dashboard
    - Users see only their org data
2. **Event Tracking**
    - Track key events: User Signed Up, Project Created, Item Added, Checkout Started / Completed, Feature Used, Message Sent, Error Occurred
    - Event payload: `eventName + properties + timestamp + user/org id`
3. **Event Ingestion API**
    - `/api/track` route handler
    - Accepts POST events from snippet or simulator
    - Saves events to DB (Prisma + PostgreSQL)
4. **Live Dashboard / Analytics UI**
    - Counters: total users, new signups, recent events
    - Timeline / Event Feed showing events live
    - Charts: line/bar charts for trends
    - Filters: by event type, date, or user/org
5. **Multi-Tenant Support**
    - Dashboard filters data by org
    - Users see only events for their org
    - Admins can see all org events
6. **Event Simulator / Layer 1 Snippet**
    - Generate events for demo purposes
    - Tiny JS snippet posting events to `/api/track`
    - Optional: simulate page views, button clicks
7. **Real-Time Updates**
    - SSE or WebSocket to push events to dashboard instantly
    - Smooth animations for counters/charts
8. **Server Actions**
    - Minor forms: filters, alerts, annotations

---

## 3. Optional / Advanced Features

- Historical reports (daily, weekly, monthly) with ISR
- Custom dashboards per user / team
- Multi-org admin panel
- Alerts & notifications for threshold events
- Interactive charts (hover, zoom)
- Metrics improvement animation (“Conversion ↑ 23%”)
- Export data (CSV / JSON)
- Color themes, responsive layouts

---

## 4. Event List for SaaS Product

| Event Name | Properties Example | Purpose |
| --- | --- | --- |
| User Signed Up | plan: "Pro" | Track adoption by plan |
| Project Created | projectType: "Analytics" | Shows feature usage |
| Item Added | itemId, value | Example of product interaction |
| Checkout Started | totalAmount | Funnel tracking |
| Checkout Completed | totalAmount | Conversion metrics |
| Feature Used | featureName | Track feature usage |
| Message Sent | threadId | Engagement metrics |
| Error Occurred | errorCode | Track app stability |

---

## 5. Layer 1 Snippet / SDK

- Tiny JS snippet for developers or simulator:

```html
<script>
window.analytics = {
  track: (eventName, properties) => {
    fetch("https://your-app.com/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, properties })
    });
  }
};
</script>

```

- Sends events to `/api/track`
- For portfolio, events can be generated from simulator page

---

## 6. Dashboard Areas (UI/UX Focus)

- **Counters / Metrics**: live total users, new signups, events per hour
- **Timeline / Event Feed**: scrollable list of live events
- **Charts / Graphs**: line/bar charts showing trends, animated updates
- **Filters Panel**: filter by event type, date range, or org
- **Org Switcher**: switch between multiple org dashboards (multi-tenant)
- **Mobile Focus**: responsive layout, swipeable panels, compact counters, touch-friendly charts
- **Animations**: numbers update with smooth increment animations, chart lines animate dynamically

---

## 7. Project File Structure
/app
  /dashboard
    page.tsx             # Main dashboard page (Server Component)
    /components
      Counter.tsx        # Client Component for live counters
      EventFeed.tsx      # Timeline / event feed
      EventChart.tsx     # Charts wrapper (Chart.js or Recharts)
  /api
    /track
      route.ts           # Event ingestion API
  /org
    layout.tsx           # Layout per organization
    page.tsx             # Optional admin panel
/lib
  prisma.ts               # Prisma client
  db.ts                   # DB utilities
  analytics.ts            # Event simulation / snippet logic
/public
  analytics-snippet.js    # Layer 1 snippet for devs