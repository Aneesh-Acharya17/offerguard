import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Eye,
  FileText,
  LockKeyhole,
  MailWarning,
  RotateCcw,
  ScanLine,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Timer,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type ScanState = "ready" | "scanning" | "complete";

type Finding = {
  label: string;
  title: string;
  description: string;
  excerpt: string;
  icon: typeof AlertTriangle;
  tone: "red" | "amber" | "blue";
};

const scanSteps = [
  "Reading the offer text",
  "Checking for payment pressure",
  "Comparing recruiter signals",
  "Writing your next steps",
];

const findings: Finding[] = [
  {
    label: "Payment request",
    title: "Training fee before joining",
    description:
      "Legitimate employers typically cover onboarding. Asking you to pay before you start is a common pay-to-work signal.",
    excerpt: "A one-time training registration fee of ₹2,499 is required before your joining date.",
    icon: CreditCard,
    tone: "red",
  },
  {
    label: "Equipment charge",
    title: "Laptop deposit requested",
    description:
      "A deposit for equipment sent by a recruiter can be hard to recover, especially when payment is urgent or sent to a personal account.",
    excerpt: "Please transfer the refundable laptop security deposit today to reserve your kit.",
    icon: ShieldAlert,
    tone: "red",
  },
  {
    label: "Urgency",
    title: "Pressure to pay today",
    description:
      "Scammers create a deadline so there is less time to verify the company or ask someone you trust.",
    excerpt: "This offer expires at 6:00 PM today. Delays will result in immediate cancellation.",
    icon: Timer,
    tone: "amber",
  },
  {
    label: "Email signal",
    title: "Recruiter address does not match",
    description:
      "The sender uses a free mailbox instead of an address connected to the company named in the letter.",
    excerpt: "Contact: hiring.team.careers@gmail.com · Company: Northstar Labs",
    icon: MailWarning,
    tone: "blue",
  },
  {
    label: "Company impersonation",
    title: "The company may be being impersonated",
    description:
      "The letter uses polished branding, but it does not include a verifiable office address or company registration detail. That gap can be a sign that someone is borrowing a real company's identity.",
    excerpt: "Northstar Labs — Remote Internship Division · Bengaluru",
    icon: Building2,
    tone: "blue",
  },
  {
    label: "Language",
    title: "Pushy wording throughout",
    description:
      "Repeated instructions to act immediately make it harder to pause, research, and ask a trusted person for advice.",
    excerpt: "Do not share this offer with anyone until your position is confirmed.",
    icon: AlertTriangle,
    tone: "amber",
  },
];

const sampleOfferText = `Northstar Labs internship offer. A one-time training registration fee of ₹2,499 is required before your joining date. Please transfer the refundable laptop security deposit today to reserve your kit. This offer expires at 6:00 PM today. Contact hiring.team.careers@gmail.com. Do not share this offer with anyone until your position is confirmed.`;

type AnalysisResult = {
  score: number;
  level: string;
  summary: string;
  findings: Finding[];
};

const excerptAround = (text: string, pattern: RegExp) => {
  const match = text.match(pattern);
  if (!match || match.index === undefined) return text.trim().slice(0, 170);
  const start = Math.max(0, match.index - 45);
  const end = Math.min(text.length, match.index + match[0].length + 95);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).replace(/\s+/g, " ").trim()}${end < text.length ? "…" : ""}`;
};

const analyzeOfferText = (rawText: string): AnalysisResult => {
  const text = rawText.replace(/\s+/g, " ").trim();
  const checks: Array<Finding | null> = [
    /(?:training|registration|onboarding|processing).{0,80}(?:fee|charge|payment|deposit)|(?:pay|transfer|send).{0,45}(?:fee|charge|deposit)/i.test(text)
      ? { ...findings[0], excerpt: excerptAround(text, /(?:training|registration|onboarding|processing).{0,80}(?:fee|charge|payment|deposit)|(?:pay|transfer|send).{0,45}(?:fee|charge|deposit)/i) }
      : null,
    /(?:laptop|equipment|kit|security deposit).{0,65}(?:deposit|charge|payment|fee)|(?:deposit|charge).{0,65}(?:laptop|equipment|kit)/i.test(text)
      ? { ...findings[1], excerpt: excerptAround(text, /(?:laptop|equipment|kit|security deposit).{0,65}(?:deposit|charge|payment|fee)|(?:deposit|charge).{0,65}(?:laptop|equipment|kit)/i) }
      : null,
    /(?:today|immediately|urgent|expires|act now|within \d+ hours|limited time|do not delay)/i.test(text)
      ? { ...findings[2], excerpt: excerptAround(text, /(?:today|immediately|urgent|expires|act now|within \d+ hours|limited time|do not delay)/i) }
      : null,
    /[\w.+-]+@(gmail|yahoo|outlook|hotmail)\.(com|in|co\.[a-z]{2})/i.test(text)
      ? { ...findings[3], excerpt: excerptAround(text, /[\w.+-]+@(gmail|yahoo|outlook|hotmail)\.(com|in|co\.[a-z]{2})/i) }
      : null,
    /(?:company|labs|technologies|solutions|pvt|private limited|inc\.?|llc).{0,100}(?:official|authorized|division|registration|address)|(?:gmail|yahoo|outlook|hotmail)\./i.test(text)
      ? { ...findings[4], excerpt: excerptAround(text, /(?:company|labs|technologies|solutions|pvt|private limited|inc\.?|llc).{0,100}(?:official|authorized|division|registration|address)|(?:gmail|yahoo|outlook|hotmail)\./i) }
      : null,
    /(?:do not share|confidential|immediately|urgent|act now|do not delay|must respond|final warning)/i.test(text)
      ? { ...findings[5], excerpt: excerptAround(text, /(?:do not share|confidential|immediately|urgent|act now|do not delay|must respond|final warning)/i) }
      : null,
  ];
  const detected = checks.filter((finding): finding is Finding => finding !== null);
  const score = Math.min(94, detected.length === 0 ? 8 : 8 + detected.length * 14 + (detected.length >= 3 ? 12 : 0));
  const level = score >= 66 ? "High attention" : score >= 35 ? "Worth checking" : "Low signal";
  const summary = detected.length === 0
    ? "No common scam patterns were found in the extracted text. Still verify the recruiter and company through official channels."
    : `${detected.length} signal${detected.length === 1 ? "" : "s"} found in the extracted text. Review the evidence below before you reply or pay.`;
  return { score, level, summary, findings: detected };
};

const extractPdfText = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
  }
  return pages.join(" ").trim();
};

const checklist = [
  {
    number: "01",
    title: "Verify the recruiter",
    body: "Search the sender’s name and email domain separately. Call a number from the company’s official website, not the offer letter.",
  },
  {
    number: "02",
    title: "Verify the company",
    body: "Visit the real company site and LinkedIn page. Check that the role, office, and recruiter actually exist there.",
  },
  {
    number: "03",
    title: "Verify the payment",
    body: "Do not pay a fee, deposit, or “refundable” charge to get hired. Ask your placement cell or someone you trust before replying.",
  },
];

function LogoMark() {
  return (
    <span className="logo-mark" aria-hidden="true">
      <ShieldCheck size={18} strokeWidth={2.4} />
    </span>
  );
}

function RiskRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="risk-ring" aria-label={`Risk score ${score} out of 100`}>
      <svg viewBox="0 0 100 100" role="img" aria-hidden="true">
        <circle className="risk-ring-track" cx="50" cy="50" r="42" />
        <circle
          className="risk-ring-value"
          cx="50"
          cy="50"
          r="42"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="risk-ring-label">
        <strong>{score}</strong>
        <span>/100</span>
      </div>
    </div>
  );
}

function AppHeader({ onReset }: { onReset: () => void }) {
  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="OfferGuard home">
        <LogoMark />
        <span>OfferGuard</span>
      </a>
      <div className="header-actions">
        <span className="privacy-pill">
          <LockKeyhole size={14} /> No data kept
        </span>
        <button className="text-button" onClick={onReset} type="button">
          <RotateCcw size={15} /> New check
        </button>
      </div>
    </header>
  );
}

export default function Home() {
  const [scanState, setScanState] = useState<ScanState>("ready");
  const [scanStep, setScanStep] = useState(0);
  const [selectedName, setSelectedName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [openFinding, setOpenFinding] = useState(0);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult>(() => analyzeOfferText(sampleOfferText));
  const [analysisError, setAnalysisError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scanState !== "scanning") return;

    const interval = window.setInterval(() => {
      setScanStep((current) => {
        if (current >= scanSteps.length - 1) {
          window.clearInterval(interval);
          window.setTimeout(() => setScanState("complete"), 650);
          return current;
        }
        return current + 1;
      });
    }, 730);

    return () => window.clearInterval(interval);
  }, [scanState]);

  const beginScan = (name: string, text: string) => {
    setSelectedName(name);
    setAnalysis(analyzeOfferText(text));
    setAnalysisError("");
    setScanStep(0);
    setOpenFinding(0);
    setCheckedSteps([]);
    setScanState("scanning");
  };

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return;
    try {
      const extractedText = await extractPdfText(file);
      if (!extractedText) throw new Error("No selectable text found");
      beginScan(file.name, extractedText);
    } catch {
      setSelectedName(file.name);
      setAnalysisError("We could not extract selectable text from this PDF. It may be a scanned image or encrypted document, so OfferGuard will not invent a result.");
      setScanStep(0);
      setOpenFinding(0);
      setCheckedSteps([]);
      setScanState("scanning");
    }
  };

  const reset = () => {
    setScanState("ready");
    setScanStep(0);
    setSelectedName("");
    setAnalysis(analyzeOfferText(sampleOfferText));
    setAnalysisError("");
    setOpenFinding(0);
    setCheckedSteps([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleChecklist = (index: number) => {
    setCheckedSteps((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index],
    );
  };

  return (
    <div className="app-shell" id="top">
      <AppHeader onReset={reset} />

      <main>
        <section className="hero-section section-wrap">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> Student safety desk · 01</div>
            <h1>Spot the red flags <em>before</em> you say yes.</h1>
            <p className="hero-lede">
              OfferGuard helps you read between the lines of an internship or job offer so you can see what to verify before you reply or pay.
            </p>
            <div className="hero-note">
              <Eye size={16} />
              <span>Evidence first. No absolute verdicts. Just clearer next steps.</span>
            </div>
          </div>
          <div className="hero-aside" aria-label="OfferGuard promise">
            <div className="aside-rule" />
            <p className="aside-kicker">The promise</p>
            <p className="aside-quote">“Understand the why, then decide.”</p>
            <p className="aside-small">A quick second opinion for the moment an offer feels a little too perfect.</p>
          </div>
        </section>

        <section className="evidence-section section-wrap" aria-labelledby="evidence-heading">
          <div className="evidence-copy">
            <div className="section-label"><span>WHY DIFFERENT</span> Evidence, not just a verdict</div>
            <p className="mono-label">THE OFFERGUARD EVIDENCE MAP</p>
            <h2 id="evidence-heading">See how one risky clause connects to your next move.</h2>
            <p className="evidence-lede">Most checkers stop at “probably fake.” OfferGuard turns the warning into a small investigation: the clause, the signal behind it, and the safest way to verify it.</p>
            <div className="evidence-points">
              <div><span className="point-number">01</span><p><strong>Trace the clause.</strong> See the exact sentence that triggered a warning.</p></div>
              <div><span className="point-number">02</span><p><strong>Understand the pattern.</strong> Learn why fees, urgency, and mismatched domains matter.</p></div>
              <div><span className="point-number">03</span><p><strong>Choose a check.</strong> Get a verification action you can do outside the tool.</p></div>
            </div>
          </div>
          <div className="evidence-map" aria-label="Three-dimensional evidence map showing a document connected to scam signals and verification actions">
            <div className="map-grid" />
            <div className="map-orbit orbit-one" />
            <div className="map-orbit orbit-two" />
            <div className="map-line line-one" />
            <div className="map-line line-two" />
            <div className="map-line line-three" />
            <div className="map-node node-document"><FileText size={19} /><span>Offer letter</span></div>
            <div className="map-node node-fee"><CreditCard size={17} /><span>Training fee</span><small>high signal</small></div>
            <div className="map-node node-domain"><MailWarning size={17} /><span>Email mismatch</span><small>check source</small></div>
            <div className="map-node node-action"><ShieldCheck size={17} /><span>Call official site</span><small>next action</small></div>
            <div className="map-caption"><span className="caption-pulse" /> interactive proof trail <span>01 / 03</span></div>
          </div>
        </section>

        {scanState === "ready" && (
          <section className="scan-section section-wrap" aria-labelledby="scan-heading">
            <div className="section-label"><span>02</span> Start with an offer</div>
            <div className="scan-layout">
              <div className="upload-panel">
                <div className="panel-heading">
                  <div>
                    <p className="mono-label">UPLOAD + ANALYZE</p>
                    <h2 id="scan-heading">What did they send you?</h2>
                  </div>
                  <span className="step-badge">1 / 4</span>
                </div>
                <div
                  className={`dropzone ${isDragging ? "is-dragging" : ""}`}
                  onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }}
                  onDrop={(event) => { event.preventDefault(); setIsDragging(false); handleFile(event.dataTransfer.files[0]); }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(event) => handleFile(event.target.files?.[0])}
                    aria-label="Upload an offer PDF"
                  />
                  <div className="upload-icon"><Upload size={22} /></div>
                  <strong>Drop the offer letter here</strong>
                  <span>PDF only · analyzed in this session</span>
                  <button className="outline-button" type="button" onClick={() => fileInputRef.current?.click()}>
                    Choose a PDF <ArrowRight size={16} />
                  </button>
                </div>
                <div className="privacy-callout">
                  <LockKeyhole size={17} />
                  <div><strong>Private by design</strong><span>We process on request and don’t keep a copy between checks.</span></div>
                </div>
              </div>

              <div className="demo-panel">
                <div className="demo-topline"><Sparkles size={16} /> Or skip the upload</div>
                <h3>See how the red flags get explained.</h3>
                <p>Try our sample internship letter. It contains the kinds of signals OfferGuard is built to surface.</p>
                <button className="mint-button" type="button" onClick={() => beginScan("sample-internship-offer.pdf", sampleOfferText)}>
                  Scan the sample <ArrowRight size={17} />
                </button>
                <div className="sample-paper" aria-hidden="true">
                  <div className="paper-clip" />
                  <FileText size={24} />
                  <div><strong>Northstar Labs</strong><span>Internship offer letter</span></div>
                  <AlertTriangle size={17} className="paper-alert" />
                </div>
              </div>
            </div>
          </section>
        )}

        {scanState === "scanning" && (
          <section className="scan-section section-wrap" aria-live="polite" aria-labelledby="progress-heading">
            <div className="section-label"><span>02</span> Reading the signal</div>
            <div className="progress-card">
              <div className="progress-header">
                <div>
                  <p className="mono-label">ANALYSIS IN PROGRESS</p>
                  <h2 id="progress-heading">Taking a closer look.</h2>
                </div>
                <div className="scan-orb"><ScanLine size={28} /></div>
              </div>
              <div className="document-preview">
                <div className="document-top"><span>{selectedName}</span><span>PDF · private session</span></div>
                <div className="fake-line long" /><div className="fake-line" /><div className="fake-line medium" />
                <div className="fake-highlight" /><div className="fake-line long" /><div className="fake-line short" />
                <div className="scan-line" />
              </div>
              <div className="progress-steps">
                {scanSteps.map((step, index) => (
                  <div className={`progress-step ${index < scanStep ? "done" : ""} ${index === scanStep ? "active" : ""}`} key={step}>
                    <span className="progress-dot">{index < scanStep ? <Check size={13} /> : index + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <p className="scan-footnote"><LockKeyhole size={14} /> Nothing is saved when this scan ends.</p>
            </div>
          </section>
        )}

        {scanState === "complete" && (
          <section className="results-section section-wrap" aria-labelledby="results-heading">
            <div className="section-label"><span>02</span> Your evidence desk</div>
            <div className="results-intro">
              <div>
                <p className="mono-label">ANALYSIS COMPLETE · {selectedName}</p>
                <h2 id="results-heading">{analysisError ? "We could not read enough text to analyze this file." : analysis.findings.length > 0 ? "There are a few things worth checking." : "No common red flags found in the extracted text."}</h2>
                <p>{analysisError || analysis.summary}</p>
              </div>
              <div className="result-stamp">{analysisError ? <><CircleHelp size={15} /> Needs another file</> : <><CheckCircle2 size={15} /> Review ready</>}</div>
            </div>

            <div className="results-grid">
              <aside className="score-card">
                <div className="score-card-head"><span>OVERALL SIGNAL</span><CircleHelp size={16} /></div>
                <RiskRing score={analysisError ? 0 : analysis.score} />
                <div className="score-copy"><strong>{analysisError ? "No result" : analysis.level}</strong><span>{analysisError ? "This file did not expose selectable text for the browser parser." : analysis.summary}</span></div>
                <div className="score-divider" />
                <div className="signal-count"><span><span className="signal-dot red" /> High attention</span><strong>{analysis.findings.filter((finding) => finding.tone === "red").length}</strong></div>
                <div className="signal-count"><span><span className="signal-dot amber" /> Worth checking</span><strong>{analysis.findings.filter((finding) => finding.tone === "amber").length}</strong></div>
                <div className="score-note"><Shield size={15} /> OfferGuard explains patterns; you make the call.</div>
              </aside>

              <div className="findings-column">
                <div className="findings-heading"><h3>What stood out</h3><span>{String(analysis.findings.length).padStart(2, "0")} signals</span></div>
                <div className="finding-list">
                  {analysis.findings.length === 0 && <div className="empty-findings"><ShieldCheck size={20} /><strong>{analysisError ? "No findings generated" : "No matching patterns detected"}</strong><span>{analysisError ? "Try a text-based PDF. Scanned images need OCR before they can be checked." : "That is not proof an offer is safe. Verify the sender and company independently."}</span></div>}
                  {analysis.findings.map((finding, index) => {
                    const Icon = finding.icon;
                    const isOpen = openFinding === index;
                    return (
                      <article className={`finding-card ${isOpen ? "is-open" : ""} ${finding.tone}`} key={finding.title}>
                        <button className="finding-trigger" type="button" onClick={() => setOpenFinding(isOpen ? -1 : index)} aria-expanded={isOpen}>
                          <span className="finding-icon"><Icon size={18} /></span>
                          <span className="finding-main"><span className="finding-label">{finding.label}</span><strong>{finding.title}</strong></span>
                          <ChevronDown size={18} className="chevron" />
                        </button>
                        {isOpen && (
                          <div className="finding-detail">
                            <p>{finding.description}</p>
                            <div className="evidence-snippet"><span className="evidence-tag">IN THE LETTER</span><span>“{finding.excerpt}”</span></div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="checklist-section">
              <div className="checklist-heading">
                <div>
                  <p className="mono-label">03 · BEFORE YOU REPLY OR PAY</p>
                  <h3>Your three-step verification</h3>
                </div>
                <p>Use the evidence to guide your next move, not to rush it.</p>
              </div>
              <div className="checklist-grid">
                {checklist.map((item, index) => {
                  const isChecked = checkedSteps.includes(index);
                  return (
                    <button className={`checklist-card ${isChecked ? "is-checked" : ""}`} key={item.number} type="button" onClick={() => toggleChecklist(index)}>
                      <span className="checklist-number">{isChecked ? <Check size={18} /> : item.number}</span>
                      <span className="checklist-text"><strong>{item.title}</strong><span>{item.body}</span></span>
                      <span className="checklist-arrow"><ArrowRight size={17} /></span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="honesty-grid">
              <div className="honesty-card">
                <div className="honesty-icon"><Eye size={20} /></div>
                <div><p className="mono-label">WHY THIS HELPS</p><h3>Learn the pattern, not just the label.</h3><p>Pay-to-work scams often look polished. Seeing the exact clause makes it easier to recognize the same playbook next time.</p></div>
              </div>
              <div className="limitation-card">
                <div className="honesty-icon"><CircleHelp size={20} /></div>
                <div><p className="mono-label">A FAIR WARNING</p><h3>Good tools have limits.</h3><p>OfferGuard can flag a safe offer or miss a brand-new scam. For high-stakes decisions, ask a trusted person and verify through official channels.</p></div>
              </div>
            </div>
          </section>
        )}

        <section className="how-section section-wrap">
          <div className="section-label"><span>04</span> The simple version</div>
          <div className="how-heading"><h2>From offer letter to informed decision.</h2><p>Four steps, no panic spiral.</p></div>
          <div className="how-grid">
            {[
              ["01", "Upload", "Bring the suspicious PDF into a private browser session."],
              ["02", "Read", "OfferGuard reads the words that are easy to skim past."],
              ["03", "Spot", "See the exact signals behind each warning."],
              ["04", "Decide", "Use a simple checklist to verify what matters."],
            ].map(([number, title, body]) => (
              <div className="how-card" key={number}><span>{number}</span><h3>{title}</h3><p>{body}</p></div>
            ))}
          </div>
        </section>
      </main>

      <footer className="site-footer section-wrap">
        <div className="footer-brand"><LogoMark /><span>OfferGuard</span></div>
        <p>Built to help students pause, verify, and stay in control.</p>
        <span className="footer-status"><span /> No account · No history</span>
      </footer>
    </div>
  );
}
