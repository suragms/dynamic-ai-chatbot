# Dynamic AI Chatbot landing page — implementation and QA

Date: 14 October 2026. Developer attribution: Surag M S, Zidio Development Internship, Team 17.

## Files

Created:

- `frontend/src/ChatApp.tsx` — the existing application, retained with a landing-page return link and workspace navigation synchronization.
- `frontend/src/components/Landing/LandingPage.tsx` — page composition, navigation, filters, processing stages, and configuration interactions.
- `frontend/src/components/Landing/content.ts` — repository-grounded features, technologies, architecture, roadmap, and links.
- `frontend/src/components/Landing/ChatPreview.tsx` — three explicitly scripted conversations and illustrative message analysis.
- `frontend/src/components/Landing/LandingAnalytics.tsx` — existing backend metrics with loading, populated, empty, unavailable, retry, and refresh states.
- `frontend/src/components/Landing/landing.css` — scoped styling, breakpoints, connected diagrams, and motion preferences.
- `frontend/public/favicon.svg`, `frontend/public/social-preview.svg`, `frontend/public/social-preview.png` — project favicon and sharing assets.
- `docs/LANDING_PAGE_QA.md` — this report.

Modified:

- `frontend/src/App.tsx` — landing/workspace hash navigation and session preservation during navigation.
- `frontend/src/components/Header.tsx` — return navigation, responsive wrapping, and accurate connection/configuration labels.
- `frontend/index.html` — requested title and description, Open Graph, Twitter metadata, favicon, and sharing-image description.
- `README.md` — landing-page overview, correct development port, setup, build, deployment, configuration, and limitations.

Dependency versions, lockfile, backend services, existing chat controls, voice hooks, settings, and exports were retained.

## Sections and interactions

Implemented: sticky navigation; hero; project overview and three purpose cards; all twelve requested core features; interactive eight-stage pipeline; actual technology stack; Gemini workflow and Python / environment examples; architecture; real analytics; all nine roadmap enhancements; independent developer contribution; GitHub / LinkedIn / portfolio calls to action; mandatory footer.

Interactions: smooth anchors, active-section highlighting, responsive menu, Escape dismissal with focus restoration, feature categories, three scripted conversation examples, conversation/analysis toggle, eight selectable pipeline stages, configuration tabs, clipboard feedback, analytics refresh/retry, and entry to the preserved chatbot/dashboard. Current chat messages survive a visit to the landing page and return during the same page session.

## Actual stack

Frontend: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, and scoped CSS. Motion uses CSS and respects `prefers-reduced-motion`; Framer Motion was not required.

Backend: Python, Flask, Flask-CORS, NLTK, spaCy, scikit-learn, NumPy, SQLAlchemy / Flask-SQLAlchemy, SQLite, python-dotenv, and requests for the Gemini REST integration. Git/GitHub remains the source-control workflow.

## Verification

- Production command: `cd frontend; npm run build` — TypeScript and Vite build passed.
- Existing backend suite: `python -m pytest backend/tests -q` — **30 passed in 8.21 seconds**. This includes mocked Gemini success/error/timeout/rate-limit handling, chat, multilingual replies, analytics, history, and export endpoints.
- Browser layouts: 1280-pixel desktop, 768-pixel tablet, and 390-pixel mobile. No horizontal document overflow was observed. Feature cards, navigation, architecture, and pipeline adapt at breakpoints.
- Browser interactions: scripted preview changes, illustrative sentiment analysis, feature filtering (four experience cards), pipeline detail selection, configuration copy feedback, mobile menu closing after navigation, and Escape focus restoration were checked.
- Analytics: existing persisted data loaded through all four actual endpoints. An isolated in-memory database showed the empty state. Stopping the owned backend showed the unavailable state; restarting it and retrying restored the empty state. Loading feedback was observed. Empty datasets do not claim a measured 100% response success rate.
- Chat: an actual local greeting response returned intent, sentiment, and timing metadata with Gemini disabled. The conversation stayed visible after landing/workspace navigation. Browser QA messages were written to an in-memory database, not the user's stored conversation database.
- Console: no application errors or warnings were observed during normal connected landing interactions. Deliberately stopping the backend produces expected network errors while the page displays its recovery state.
- Semantic checks: one landing-page `h1`, accessible names for icon controls, semantic navigation/main/footer, skip link, visible focus styling, pressed-state controls, live feedback, and reduced-motion rules.
- Link checks: no missing internal anchor targets; all external links use `noopener noreferrer`. GitHub repository, integration source, architecture document, portfolio, and Gemini documentation were reachable. LinkedIn restricts automated requests (HEAD returned 405); the exact user-supplied URL is preserved, but destination content could not be verified.
- Secret check: actual non-placeholder local credential values were compared against the generated HTML/JS/CSS output without printing the credentials; **zero matches**. Environment files are ignored and untracked. No frontend provider key, visitor-key collection, or direct Gemini call was added.
- Development root and Flask's built frontend returned HTTP 200.

## Deployment

Run `npm ci` and `npm run build` in `frontend`. The output is `frontend/dist`. The existing Flask application serves this directory and `/api` on the same origin. Use a production WSGI server, HTTPS, installed model resources, and backend-only environment configuration for production. A standalone static host needs a reverse proxy for `/api`; otherwise the landing page works and analytics report the unavailable backend.

Set sharing-image metadata to the absolute public URL of `/social-preview.png` and add a canonical URL once the deployment domain is known. Detailed commands are in the README.

## Limits

Live Gemini connectivity was not tested or claimed. Provider tests are mocked; browser tests explicitly disabled the key. Gemini availability depends on a valid key, supported model, quota, and network access. spaCy and VADER behavior depends on installed language resources, and the local NLP models are primarily English. The hero is a labeled scripted preview. No model accuracy, production uptime, or invented performance benchmark appears on the landing page. Roadmap items remain labeled planned. Public deployment was not performed as part of this repository implementation.
