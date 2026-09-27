import "./globals.css";

export const metadata = {
  title: "JiffyThat — say it out loud, get a form back",
  description:
    "Say or type what you need to collect. JiffyThat writes the form, gives you a link to share, and collects every answer in one place.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/*
          Two faces, one request.

          Inter is the variable cut (100..900) rather than four fixed weights.
          The stylesheet asks for in-between weights like 560 and 620 — with
          static weights the browser fakes them by smearing the outlines, which
          is why text can look slightly muddy without anyone being able to say
          why. The variable font renders them properly.

          Bricolage Grotesque carries the big display lines only. At 90px it
          has a schoolbook warmth a neutral face lacks, which suits a tool for
          classrooms. Geist Mono sets numbers that sit in columns — roll
          numbers, counts, times — so they line up.

          Loaded by the browser rather than at build time, so an outage at
          Google can slow a page down but can never fail a deploy.
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Geist+Mono:wght@400..600&family=Inter:wght@100..900&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
