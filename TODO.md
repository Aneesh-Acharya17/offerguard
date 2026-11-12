# OfferGuard TODO

## 1. Deliver the privacy-first scan entry point
- [x] The site presents OfferGuard as a practical helper for students checking suspicious internship and job offer letters before they reply or pay.
- [x] A focused browser-based dashboard lets a user choose a PDF offer and clearly shows the selected filename.
- [x] The interface explicitly states that each offer is analyzed on request and no state is retained between analyses.
- [x] A built-in sample offer can launch the complete experience without requiring a personal upload.

## 2. Deliver the visible scan flow
- [x] The product communicates a clear progression from upload to text reading to signal detection to a completed risk summary.
- [x] Uploading a file or selecting the sample moves through a visible scan/progress state before showing results.
- [x] The prototype avoids implying that it has stored the offer or created an account.

## 3. Deliver explainable risk findings
- [x] The completed dashboard shows an overall risk score and summary without using an absolute Safe or Unsafe verdict.
- [x] Findings cover training fees, equipment charges, urgent payment demands, suspicious email domains, company impersonation, and pushy wording.
- [x] Each warning includes a plain-language explanation of why the signal may be concerning.
- [x] Findings are tied to relevant offer text through highlighted excerpts or evidence labels.

## 4. Deliver the verification checklist and education layer
- [x] The results view provides a practical three-step checklist to independently verify the recruiter, company, and payment request before responding.
- [x] The interface helps students understand the “why” behind each warning rather than blindly trusting a verdict.
- [x] The site communicates honest limitations: it may flag a safe offer or miss a brand-new scam.
- [x] Privacy guidance and next-step advice are visible without requiring navigation away from the analysis.

## 5. Deliver the responsive editorial interface
- [x] The responsive interface uses light blue surfaces, deep blue typography, mint/green action areas, warm red warning accents, rounded cards, and editorial storytelling.
- [x] The layout works at desktop and mobile widths, with readable type, usable controls, and no clipped content.
- [x] The design uses a scan-line motif, score/evidence hierarchy, and inline warning annotations consistently.

## 6. Deliver deployment and repository readiness
- [x] The app serves its complete route manifest at `/manus-routes.json`.
- [x] The static build completes with `pnpm build:static` and produces `dist/public/index.html`.
- [x] The project includes the implementation plan, TODO, and project logo metadata needed for checkpointing.
- [x] The final implementation is committed to `main` and prepared for the managed GitHub connection flow.

## 7. Deliver a differentiated evidence-map frontend
- [x] The homepage explains that OfferGuard connects a suspicious clause to the signal behind it and the verification action a student can take, rather than only returning a fake/safe label.
- [x] The homepage includes a lightweight CSS 3D proof-trail visual with a document anchor, risk-signal nodes, connecting lines, and a next-action node.
- [x] The 3D visual remains readable and contained at desktop and mobile widths without adding a heavyweight rendering dependency.

## 8. Analyze uploaded PDFs instead of returning a fixed demo result
- [x] A selectable-text PDF is parsed in-browser with PDF.js before analysis, and the resulting findings are based on that document's extracted text.
- [x] The analyzer checks explainable signals for payment requests, equipment deposits, urgency, free-mail domains, possible impersonation gaps, and pushy wording, and shows matching excerpts.
- [x] The results score, summary, signal counts, and finding list change with the analyzed text; the built-in sample regression produced six signals and a 94/100 high-attention score.
- [x] Image-only or encrypted PDFs do not receive a fabricated default result; they show a clear unreadable-file message instead.
