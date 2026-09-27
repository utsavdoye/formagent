import Link from "next/link";

// The hero is a sentence with the product set inside it. The mic sits where
// you would speak, the little form sits where you get one back — so the page
// explains itself before anyone reads the paragraph underneath.

// Heights for the live bars inside the mic pill. Animated in CSS, no JS.
const MIC_BARS = [
  [0.34, 0], [0.62, 140], [0.9, 280], [0.5, 60], [0.74, 200], [0.4, 340],
];

// The demo is a real example of what the app does, including the thing a
// plain form builder gets wrong: a clip of someone playing is asked for as a
// LINK, because a 10 MB upload cap and a video do not mix. The app really does
// this, so the shop window shows it.
const QUESTIONS = [
  ["Your name", "Short text", ""],
  ["What do you play?", "Pick one · Guitar · Drums · Keys · Bass · Vocals", ""],
  ["How long have you been playing?", "Number · years", ""],
  ["Link to a clip of you playing", "Link · YouTube or Google Drive", "made a link"],
  ["Can you make Saturday rehearsals?", "Yes / no", ""],
];

const CLIP = [6, 11, 19, 28, 14, 22, 9, 17, 26, 12, 20, 8, 15, 24, 10, 18, 7, 13, 21, 9, 16, 6];

// Only things the product does today, each one measured or tested.
const PROOF = [
  ["5,000", "students on one college wifi, submitted in under a second"],
  ["2 sec", "from what you said to a finished form"],
  ["0 ₹", "to run. No card, no trial, no catch"],
];

const STEPS = [
  [
    "Say what you need",
    "Talk, or type. English, Hindi, or Hinglish the way people actually type it. Say “close it before the 28th” and it will.",
  ],
  [
    "Check what it wrote",
    "It picks the right kind of question for each thing — a dropdown, a date, a yes or no. Change anything before you share.",
  ],
  [
    "Share one link",
    "Answers come back as charts, a searchable table, or one person at a time. Spot a typo later? Fix it without losing a single answer.",
  ],
];

export default function Landing() {
  return (
    <main className="landing">
      <div className="landing-inner">
        <nav className="landing-nav">
          <span className="brand">
            <span className="mark">J</span>
            <span>JiffyThat</span>
          </span>
          <div className="landing-links">
            <a href="#how">How it works</a>
            <Link className="btn small ghost" href="/login">Sign in</Link>
            <Link className="btn small primary" href="/login?mode=signup">Try it free</Link>
          </div>
        </nav>

        <section className="hero">
          <p className="announce">
            <b>Hinglish</b>
            Speak Hindi, English, or both at once
          </p>

          <h1 className="hero-line" aria-label="Say it out loud. Get a form back.">
            <span className="hl-row" aria-hidden="true">
              Say it
              <span className="pill-mic">
                <span className="rec" />
                <span className="bars">
                  {MIC_BARS.map(([h, d], i) => (
                    <i key={i} style={{ "--h": h, animationDelay: `${d}ms` }} />
                  ))}
                </span>
                <svg className="hop" viewBox="0 0 120 90" aria-hidden="true">
                  <path d="M8 6 C 70 6, 104 30, 104 80" />
                  <path className="tip" d="M96 72 L104 82 L112 72" />
                </svg>
              </span>
              out loud.
            </span>
            <span className="hl-row" aria-hidden="true">
              Get a
              <span className="pill-form">
                <i />
                <i />
                <i className="tick" />
              </span>
              <mark>form</mark> back.
            </span>
          </h1>

          <span className="sparkle s1" aria-hidden="true">✦</span>
          <span className="sparkle s2" aria-hidden="true">✦</span>
          <span className="sparkle s3" aria-hidden="true">✦</span>

          <p className="hero-lede">
            Say what you need to collect. JiffyThat writes the questions, you check them,
            and everyone gets one link. No dragging fields around.
          </p>

          <div className="hero-cta">
            <Link className="btn big hl" href="/login?mode=signup">Make your first form</Link>
            <a className="btn big ghost" href="#how">See how it works ↓</a>
          </div>
          <p className="hero-small">Free · No card · Works on your phone</p>
        </section>

        <section className="demo" id="how">
          <div className="demo-said">
            <h4>You said</h4>
            <p>
              ok so we&apos;re holding auditions for the college band next month, I need
              their name, what they play, how long they&apos;ve been playing, a short clip
              of them actually playing something, and whether they can make Saturday
              rehearsals
            </p>
            <span className="clip" aria-hidden="true">
              {CLIP.map((h, i) => (
                <i key={i} style={{ height: `${h}px` }} />
              ))}
              <small>0:19</small>
            </span>
          </div>

          <div className="demo-arrow" aria-hidden="true">
            <span>5 questions</span>
          </div>

          <div className="demo-form">
            <div className="demo-head">
              <strong>Band auditions</strong>
              <span className="tag">written in 2s</span>
            </div>
            {QUESTIONS.map(([label, type, badge]) => (
              <div className="demo-q" key={label}>
                <span>
                  <b>{label}</b>
                  <small>{type}</small>
                </span>
                {badge && <span className="tag hl tiny">{badge}</span>}
              </div>
            ))}
          </div>
        </section>

        <section className="proof" aria-label="In numbers">
          {PROOF.map(([big, small]) => (
            <div key={big}>
              <strong>{big}</strong>
              <span>{small}</span>
            </div>
          ))}
        </section>

        <section className="how">
          <h2>
            Three steps. <mark>Nothing to learn.</mark>
          </h2>
          <ol>
            {STEPS.map(([title, body], i) => (
              <li key={title}>
                <span className="how-n">{i + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
          <Link className="btn big primary" href="/login?mode=signup">Try it — it takes a minute</Link>
        </section>

        <footer className="landing-foot">
          <p>Made for people who have better things to do than build forms.</p>
          <p>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
