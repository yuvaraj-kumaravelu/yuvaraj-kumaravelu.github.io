# Yuvaraj K: Portfolio

This is Yuvaraj K's personal portfolio. He is an Amazon Connect Developer and Voice AI Engineer.
The site uses plain HTML, CSS and JavaScript. It has no frameworks and no build step.

## Run it locally

Double-click `index.html` to open it in a browser. Everything works this way.

If you prefer a local server:

```bash
# from this folder
python -m http.server 8080
# then open http://localhost:8080
```

## Folder structure

```
portfolio/
├── index.html                  # All page content (single page, semantic sections)
├── README.md
└── assets/
    ├── css/
    │   ├── tokens.css          # Design tokens: colours, fonts, spacing, radius, motion curves
    │   ├── themes.css          # Per-section colour themes (milk, muted, dark, darker)
    │   ├── base.css            # Reset, element defaults, type system, focus, reduced-motion
    │   ├── layout.css          # Container, sections, kicker pills, capsule header, footer
    │   ├── components.css      # Pill buttons, badges, chips, cards, AWS tiles, marquee, flows
    │   ├── sections.css        # Hero, About, Expertise, Projects, Experience, Education, Contact
    │   ├── callflow.css        # Project 01 call flow: fit-to-width row + full-screen "View large" dialog
    │   └── animations.css      # All motion (see "Animations" below)
    ├── js/
    │   ├── motion.js           # Reveals, headline splitting, count-ups, header, progress, cursor glow
    │   └── main.js             # Mobile nav, active link, waveform, copy, call-flow fit & zoom
    ├── icons/
    │   ├── aws/                # Official AWS Architecture service icons (unmodified)
    │   └── general/            # Official AWS general resource icons (user, client, email…)
    └── images/
        ├── favicon.svg
        └── logos/              # Five9 and Salesforce logos (cropped, transparent background)
```

The CSS files load in this order: tokens → themes → base → layout → components → sections → callflow → animations.
Each file only builds on the ones loaded before it.

## Editing content

All text lives in `index.html`. Each section starts with a clear comment banner, such as `<!-- Projects -->`.

| To change…                  | Look for                                           |
|-----------------------------|----------------------------------------------------|
| Headline, intro, badges     | the `Hero` section                                 |
| Key numbers (metric cards)  | `<dl class="impact">` in the hero                  |
| Scrolling AWS logo band     | the `Stack band` section (two identical lists)     |
| About text / roles wanted   | the `About` section                                |
| AWS services grid           | `<ul class="aws-grid">`                            |
| Skill chips                 | `<div class="skills">`                             |
| Projects                    | `<article class="project">` blocks (01–05)         |
| Project 01 call flow        | `<figure class="callflow">`: each card is an `<li class="cfx-card">` placed with `--x`/`--y`; arrows are in the `<svg class="cfx-wires">` |
| Contact details             | the `Contact` section (email, phone, LinkedIn)     |

**Adding an AWS icon:** copy the SVG from the AWS Architecture Icons pack into `assets/icons/aws/`.
Use a short kebab-case name, for example `amazon-sqs.svg`. Then reference it like this:

```html
<img class="aws-icon" src="assets/icons/aws/amazon-sqs.svg" alt="" width="80" height="80">
```

To add it to the logo band, add the same `<li class="marquee__item">` to **both** lists so the loop stays seamless.

**Changing colours or fonts:** edit `assets/css/tokens.css` only.

## Design system: "Stone & Signal Orange"

The palette, fonts and motion curves come from the original portfolio design.

| Role        | Value                                                                  |
|-------------|------------------------------------------------------------------------|
| Canvas      | `#EFEDE5` linen stone, `#E5E2D8` muted stone                           |
| Cards       | `#FFFFFB` milk white with `#E4E1D5` sand hairlines                     |
| Text        | `#262322` charcoal headings, `#59524F` body                            |
| Accent      | `#F94D00` signal orange, `#FFECD2` peach badges                        |
| Status      | `#0D7B46` green (live dots)                                            |
| Dark        | `#262322` charcoal with a `#38312F` radial gradient; `#1C1918` espresso |

**Accessible orange:** the bright `#F94D00` is used for decoration only: dots, lines, particles
and glows. Where orange has to be readable, the source design's deeper oranges are used instead:
`#DD3B00` for large italic words, `#D03B00` behind white button text, and `#A32C09` for small labels.
On dark sections the orange text is `#FA6D2E`.

### Section colours

Each section has its own background, set by one class in `themes.css`. The class re-maps the
colour tokens, so the text, lines and chips inside adapt automatically.

| Section    | Class           | Background                               |
|------------|-----------------|------------------------------------------|
| Hero       | *(none)*        | Linen stone `#EFEDE5` + peach glow       |
| Stack band | `theme-milk`    | Milk white `#FFFFFB`                     |
| About      | `theme-muted`   | Muted stone `#E5E2D8`                    |
| Expertise  | `theme-dark`    | Charcoal gradient (dark)                 |
| Projects   | *(none)*        | Linen stone, with milk-white cards       |
| Experience | `theme-muted`   | Muted stone `#E5E2D8`                    |
| Education  | `theme-milk`    | Milk white `#FFFFFB`                     |
| Contact    | `theme-dark`    | Charcoal gradient (dark)                 |
| Footer     | `theme-darker`  | Espresso `#1C1918`                       |

To change a section's colour, swap its class in `index.html`.

### Fonts

| Font             | Used for                                                              |
|------------------|-----------------------------------------------------------------------|
| **Geist**        | All headings (weight 800, tight letter-spacing) and all body text     |
| **Fraunces** *italic* | "Punch" accent words in headings, in signal orange (`<em>` inside a heading) |
| **Geist Mono**   | Kicker pills, labels, dates, the console readouts and the brand mark  |

## Animations

Everything is plain CSS and JavaScript, with no animation library.

**From the original portfolio**

| Effect | Where |
|---|---|
| Spring scroll reveal (rise 32px, 0.85s, staggered) | Most blocks (`data-reveal`; children of `data-reveal-group` stagger) |
| Floating levitation, which pauses on hover | Hero "live call" console |
| Magnetic pill buttons: lift, press-in, diagonal arrow glide | All buttons |
| Breathing orange glow | Primary orange buttons |
| Radar ping | Green "live" status dots |
| Card lift on hover | Metric cards, AWS tiles, project cards, About and Experience cards |
| Data particles travelling along the lines | Hero console pipeline |
| Endless logo marquee (45s loop, pauses on hover) | AWS stack band |
| Ambient orange cursor glow | Whole page (mouse/trackpad only) |
| Count-up numbers | Key figures (`<span data-count>…</span>`) |

**Added in this version**

| Effect | Where | How to use it |
|---|---|---|
| Words rise from behind a mask | Hero name/role, section titles, contact title | add `data-split` to a short headline |
| Hairline rule draws across | Section dividers, roles, metrics, contact list | add `data-rule` |
| Diagram builds step by step | Project architecture panels | add `data-draw` to `.project__arch` |
| Call flow builds left to right, arrows draw in, a call "packet" travels the row, branch lines march; full-screen "View large" with zoom | Project 01 call flow | set `--step-i` on each card and arrow |
| Underline draws on hover | Contact links | automatic |
| Capsule header hides on scroll down; orange progress line | Whole page | automatic |

If a visitor has "reduce motion" turned on in their operating system, all of these are skipped
and the content appears in its final state straight away.

## Project call flows (01 and 02)

Both projects have a call-flow diagram built the same way: HTML cards placed with `--x`/`--y` on a fixed
canvas, with arrows in an `<svg class="cfx-wires">` layer behind them.

- **Project 01** (3040 × 560px) is one continuous left-to-right row. It starts at the **Customer**,
  then runs Five9 → Amazon Connect → Lex → Lambda tools → Salesforce CRM. **Not met** branches up,
  **Live agent** branches down, and **✓ Met** carries straight on.
- **Project 02** (2130 × 910px) is a loop drawn inside its AWS infrastructure: AWS Cloud → VPC →
  public subnet (ALB, NAT Gateway) → private subnet (RDS with agent login profiles) → ECS Fargate
  (Puppeteer + Python FastAPI, up to 5 parallel sessions). The loop runs Customer → Connect → Agent CCP →
  auto-answer → capture → resample → Bedrock Nova Sonic, then back via reply processing → injection
  → the customer hears the reply (2–2.5 s). Secrets Manager and ECR sit outside the VPC.

On the page, each flow is scaled to fit its panel, so the whole flow is visible without scrolling.
**View large**, or a click on the diagram, opens one shared full-screen view with zoom in, zoom out
and Fit controls, drag-to-pan, Ctrl/⌘ + scroll zoom and Esc to close. The dialog shows the
project's own title.

To move or add a step, change its `--x`/`--y` and update the matching arrow path in that flow's SVG.

## Resume requests

The site does not host the resume PDF. Visitors use the **Request resume** button instead.
It opens their email app with a message to Yuvaraj already filled in, and he replies with the resume.

## Deploying

The site is fully static, so you can upload this folder as it is to any static host:

- **GitHub Pages**: push the folder and enable Pages
- **Netlify / Vercel**: drag and drop the folder
- **Amazon S3 + CloudFront**: upload to a bucket with static website hosting enabled

## Accessibility and performance

- Semantic landmarks, a skip link, visible focus rings and labelled icon buttons
- Readable text meets WCAG AA contrast (4.5:1 or higher) on every section background
- Respects `prefers-reduced-motion`; the hero animation pauses when it is off screen
- Images below the fold load lazily; image sizes are set to avoid layout shift
- Works without JavaScript, because all content is in the HTML

## Credits

AWS, Amazon Connect and the AWS service icons are trademarks of Amazon.com, Inc. or its affiliates.
The icons come from the official AWS Architecture Icons pack.
The UI icons are from [Lucide](https://lucide.dev) (ISC licence).
Five9 and Salesforce logos are trademarks of their respective owners and are shown to identify the
platforms used in Project 01.
