# OfferGuard implementation plan

## Product scope
OfferGuard is a frontend-first, privacy-first website prototype for students checking suspicious internship and job offer letters. The first release demonstrates the complete experience with a built-in sample offer and a simulated client-side analysis flow. It does not require login, a database, or retained document state. The UI will make the privacy promise explicit: each offer is analyzed on request and no state is kept between analyses.

## Implementation approach
- Build the public experience as a single responsive React route at `/` using the existing Vite/Tailwind starter.
- Create a focused dashboard view with two states: ready-to-scan upload and completed analysis. The sample offer button runs the same progress flow as upload, so evaluators can experience the product without supplying a PDF.
- Keep the prototype deterministic and transparent: the sample result contains a 62/100 elevated risk score, six explainable findings, highlighted offer snippets, and a three-step verification checklist. A user PDF is accepted in the browser, shown as the selected file, and routed through the same demo scan flow; this prototype does not claim to extract or retain PDF contents yet.
- Differentiate from generic fake-letter checkers with an evidence map: the interface connects the exact clause, the scam pattern it suggests, and the external verification action a student should take.
- Add a lightweight CSS 3D proof-trail visual to the homepage. It uses perspective, floating evidence nodes, orbit lines, and a document anchor rather than a heavyweight 3D engine, so it stays fast and legible on mobile.
- Use Lucide icons, CSS shapes, and editorial layout instead of external image dependencies. Use the proposal's light blue canvas, deep navy ink, mint action color, and warm red warning accents.
- Keep the starter's server/database helpers untouched because the approved first stage is static and stateless. Publish as a static Vite build from `dist/public`.
- Add `public/manus-routes.json` with the complete current page route set.
- Add `app.config.ts` with a durable HTTPS logo URL for project metadata.

## Project structure
- `client/src/pages/Home.tsx`: OfferGuard product shell, upload interaction, scan progress, result dashboard, checklist, and education/limitations copy.
- `client/src/index.css`: design tokens, typography, editorial layout utilities, responsive behavior, and motion.
- `client/src/App.tsx`: route registration and providers.
- `client/index.html`: document title and metadata.
- `public/manus-routes.json`: route manifest for the published app.
- `app.config.ts`: project logo metadata.
- `plan.md` and `TODO.md`: approved implementation decisions and outcome status.

## Design direction options
- **Editorial safety desk — 0.07:** a calm, magazine-like evidence review interface with oversized type, ruled dividers, and annotated document snippets.
- **Friendly civic utility — 0.06:** a bright, approachable public-service tool with clear cards, reassuring microcopy, and simple visual language.
- **Signal lab — 0.04:** a sharper, data-led analysis console with charts, signal chips, and a dark technical canvas.

### Chosen direction: Editorial safety desk

**Design Movement:** Contemporary editorial civic-tech, borrowing the clarity of a well-designed student newspaper and the trust cues of a public-interest service.

**Core Principles:** Explain the evidence; make the next action obvious; use warmth without minimizing risk; keep privacy visible in the interface.

**Color Philosophy:** A powder-blue canvas keeps the experience open and calm. Deep ink blue supplies authority and legibility. Mint signals forward motion and agency, while tomato red is reserved for genuine warning moments so the visual hierarchy stays honest.

**Layout Paradigm:** A left-anchored, asymmetric reading column with a persistent right-side analysis rail. The dashboard should feel like reading and annotating a document, not filling out a form or browsing a generic SaaS grid.

**Signature Elements:** A dashed “scan line” motif, large score numerals paired with small evidence labels, and inline red annotation marks on offer excerpts.

**Interaction Philosophy:** Every action should answer “what happens next?” Buttons use direct language (“Scan this sample”, “Upload an offer”). Findings expand or focus the relevant evidence rather than dumping the user into a black-box verdict.

**Animation:** Use restrained 180–280ms transitions for cards and controls. The scan state uses a slow moving dashed line and staged progress labels. Result content reveals in small upward fades; avoid bounce or celebratory motion around risk warnings.

**Typography System:** Use `Nunito Sans` for body/UI text and `DM Mono` for labels, scores, status chips, and evidence metadata. Headlines use the same friendly sans at high weight with tight line-height, keeping the type approachable but editorial.

**Brand Essence:** The evidence-first offer checker for students who want to understand a suspicious opportunity before they act. Personality: protective, clear, grounded.

**Brand Voice:** Headlines are plainspoken and specific; CTAs remove hesitation without overpromising. Example lines: “Spot the red flags before you say yes.” and “See what to verify before you reply or pay.”

**Wordmark & Logo:** A compact shield/check mark built from two offset document corners, paired with the OfferGuard wordmark. In the app header, the mark is rendered as a small navy rounded square with a mint check.

**Signature Brand Color:** `#3BC6A0` mint green, used as the ownable OfferGuard action color.

## Delivery
Use the initialized static build configuration (`pnpm install --frozen-lockfile && pnpm build:static`, output `dist/public`). After implementation, run type checks, start the static preview, verify the route manifest and main app response, capture a preview screenshot for layout inspection, commit to `main`, and prepare the managed repository for GitHub connection through the platform flow. Publication will be attempted only after the checkpoint is recorded.
