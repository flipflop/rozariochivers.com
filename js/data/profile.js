/**
 * Profile, career, figures and links for "Technology Facts and Figures, 2026".
 * Every fact and number is taken from Rozario-Chivers-CV-2026-09-03.pdf
 * (and its cover letter); see docs/content-sources.md.
 */

/**
 * @typedef {Object} Profile
 * @property {string} name
 * @property {string} title        Headline roles.
 * @property {string} location
 * @property {string[]} roles
 * @property {string} standfirst   Short intro line.
 * @property {string[]} summary    Paragraphs for "The Pilot".
 * @property {string} motto        Quotation from the cover letter.
 * @property {Array<{name: string, text: string}>} capabilities  Skills grid.
 */
export const PROFILE = {
  name: 'Rozario Chivers',
  nickname: 'Roz',
  title: 'Chief Technology Officer · Digital Technologist · Principal Technologist · Digital Architect',
  tagline: 'Platform & Engineering Leadership · AI + ML & Agentic Engineering · Technology Innovation',
  photo: { src: 'assets/photos/roz-portrait-halftone.png?v=2', alt: 'Rozario Chivers speaking with a microphone at a technology business incubator event, with the Western Sydney University Launch Pad logo behind him, printed as an ink halftone.' },
  location: 'Sydney, NSW',
  roles: ['Chief Technology Officer', 'Digital Technologist', 'Principal Technologist', 'Digital Architect'],
  standfirst:
    'Technology leader, CTO and co-founder who still builds: AI vision, data platforms and agentic engineering, with a passion for accessible, inclusive design, enabling teams from small start-ups through to large multi-national enterprises.',
  summary: [
    'Roz is a Chief Technology Officer and technologist. His work spans AI and machine learning, agentic engineering, frontend engineering, design systems, content management, digital analytics, API integration patterns, event-oriented architectures and platform engineering, and leading teams driven by a clear mission and federated autonomy.',
    'Most recently, as full-time CTO and co-founder of Mould Detect, he has shipped production edge and cloud AI vision, a proprietary environmental data platform and a guard-railed RAG assistant, built almost entirely through AI-assisted, agentic engineering practices.',
    'His experience also covers user experience design, digital marketing, Lean methodologies and modern Agile practice, web analytics and developer experience. Accessibility is a long-standing passion: he believes the web should work for everyone, and has championed WCAG accessibility in design systems, component libraries and engineering standards since the early web-standards days. At IAG he worked with Vision Australia and the Coles in-house accessibility team to deliver Coles Insurance (underwritten by IAG), providing accessibility guidance and support and helping the team implement the WCAG guidelines. He co-founded a digital agency, Chimera Design Limited, in 1997 and a mobile development consultancy, Nouvelle Niche Limited, in 2008.'
  ],
  themeClock: {
    title: 'Theme Clock',
    thumb: { src: 'assets/images/theme-clock-ipad', w: 960, h: 620, cap: 'Theme Clock HD on iPad: the digital LCD theme', alt: 'Theme Clock on iPad: a glowing aqua seven-segment clock reading 06:34 AM, Sunday, over a dark honeycomb screen.' },
    text: [
      'In 2008 Roz co-created Theme Clock with Anna Huang, one of the first wave of iPhone apps. Theme Clock (Free) passed 1.8 million downloads, with more than 300,000 active users according to Apple’s usage statistics, and reached the global top ten on Apple’s App Store within six months of launch, followed by a companion app, Theme Clock Alarm.',
      'Theme Clock is coming back to iPhone and iPad, with new themes and new features.'
    ],
    links: [
      { label: 'Theme Clock (Free)', href: 'https://www.facebook.com/people/Theme-Clock-Free/100069029236504/' },
      { label: 'Theme Clock Alarm', href: 'https://www.facebook.com/people/Theme-Clock-Alarm/100067956645669/' },
      { label: 'Theme Clock HD on Behance', href: 'https://www.behance.net/gallery/1962873/Theme-Clock-HD' }
    ],
    cocreator: { name: 'Anna Huang', linkedin: 'https://www.linkedin.com/in/ayhh/', github: 'https://github.com/mlstudios-ai' }
  },
  publishing: {
    title: 'Digital publishing: Project Alesia to GolfPunk',
    thumb: { src: 'assets/images/golfpunk-issue-01', w: 960, h: 543, cap: 'GolfPunk Issue 01, July 2012, in the mobile-first reader', alt: 'GolfPunk Issue 1, July 2012: the cover with Ian Poulter, open in the digital reader with its contents list beside it.' },
    text: [
      'Roz was selected to work in secret in Farringdon on News International’s Project Alesia, an attempt to help print journalism meet the rise of smartphones and tablets, which were placing new demands on news organisations to embrace digital content production and distribution. News Corp shelved the project in October 2010.',
      'Its co-founders went on to build Pugpig, a successful digital publishing platform. Roz took the same experience into a bespoke, mobile-first digital publishing platform, built with co-founder Anna Huang for Enjoy Publishing and GolfPunk magazine, which relaunched as a digital title in 2012.'
    ],
    links: [
      { label: 'Project Alesia shelved (The Hollywood Reporter)', href: 'https://www.hollywoodreporter.com/business/business-news/news-corps-project-alesia-shelved-31830/' },
      { label: 'Pugpig', href: 'https://www.pugpig.com/' },
      { label: 'GolfPunk relaunches as a digital magazine', href: 'https://golfbusinessnews.com/news/media/golfpunk-founder-re-launches-title-as-digital-magazine/' }
    ]
  },
  motto: 'Digital Transformation starts with transformation of minds.',
  capabilities: [
    {
      name: 'AI + ML Engineering',
      text: 'CNN transfer learning (MobileNetV3), YOLO and ConvNeXt vision pipelines, PyTorch to ONNX with INT8 quantisation, TensorFlow.js and Core ML on-device inference, Grad-CAM explainability, lab-verified dataset curation.'
    },
    {
      name: 'LLM, RAG & Agentic Systems',
      text: 'Stateful LangGraph agents, AWS Bedrock and Guardrails, hybrid retrieval (dense plus BM25, Reciprocal Rank Fusion), context engineering, evaluator-optimizer loops, eval-gated CI/CD, Langfuse tracing, schema-bound tool use.'
    },
    {
      name: 'Agentic Engineering & Governance',
      text: 'Supervisor and sequential-handoff orchestration with Claude Code, spec-first planning, graduated autonomy tiers, human-in-the-loop checkpoints, governed read/write boundaries, model-tiered token economics.'
    },
    {
      name: 'Digital Strategy & Product',
      text: 'Technology product management, business model and pricing design, go-to-market strategy, investor and board material, roadmaps, OKRs, PRDs and risk registers.'
    },
    {
      name: 'Cloud & Infrastructure',
      text: 'AWS (SAM, Lambda, API Gateway, CloudFront, DynamoDB, S3, SageMaker, Bedrock, SES) and Azure; Terraform and infrastructure as code; multi-account governance and cost control.'
    },
    {
      name: 'Platform Ownership & Engineering',
      text: 'End-to-end platform ownership: governance, security and code auditing, DevSecOps and Path-to-Production, change-visibility dashboards, developer portals and internal open source.'
    },
    {
      name: 'Enterprise Architecture',
      text: 'Capability Maturity Models, Application Portfolios and API Portfolios, kept current at Mould Detect and applied at QBE, TAL, GBST and Macquarie to align strategy, investment and delivery.'
    },
    {
      name: 'Architecture & Modernisation',
      text: 'Platform and legacy modernisation, Micro Frontend architecture, event-oriented and API-first integration, evolutionary architecture, strangler patterns, security and IP strategy.'
    },
    {
      name: 'Frontend & Design Systems',
      text: 'Full stack development, React, vanilla ES modules and Web Components, native SwiftUI, design tokens and living style guides, WCAG accessibility, performance and SEO/GEO.'
    },
    {
      name: 'Ways of Working',
      text: 'Scaled Agile (SAFe), Design Thinking and Design Sprints, continuous discovery, Lean, DevSecOps and Path-to-Production improvement.'
    },
    {
      name: 'Leadership',
      text: 'CTO and Head-of-Digital roles across insurance, banking and fintech; teams from start-up size through to multi-national enterprises; mentoring, servant leadership, high-performance and innovation cultures.'
    }
  ]
};

/**
 * @typedef {Object} Role
 * @property {string} id
 * @property {string} employer   Airport name on the route map.
 * @property {string} short      Short label for the map.
 * @property {string} title
 * @property {string} start      e.g. 'Nov 2025'
 * @property {string} end        'Present' or e.g. 'Nov 2025'
 * @property {string} city
 * @property {string} highlight  One or two lines, from the CV.
 */
export const CAREER = [
  {
    id: 'mould-detect',
    employer: 'Mould Detect',
    short: 'MOULD DETECT',
    title: 'Co-Founder & Chief Technology Officer (full time)',
    start: 'Nov 2025',
    end: 'Present',
    city: 'Sydney',
    highlight:
      'Shipped production edge and cloud AI vision, a proprietary environmental data platform and a guard-railed RAG assistant, built by one full-time engineer plus agents.'
  },
  {
    id: 'brikiq',
    employer: 'BrikIQ',
    short: 'BRIKIQ',
    title: 'Chief Technology Officer',
    start: 'Nov 2024',
    end: 'Nov 2025',
    city: 'Sydney',
    highlight:
      'Set the technology strategy for an AWS-hosted, AI-powered property investment platform, with proofs of concept in voice interaction and RAG and a responsible approach to agentic AI.'
  },
  {
    id: 'tal',
    employer: 'TAL Insurance',
    short: 'TAL',
    title: 'Platform Owner (Group)',
    start: 'Jul 2023',
    end: 'Oct 2023',
    city: 'Sydney',
    highlight:
      'Led a new Platform Engineering model at enterprise scale, introducing internal open source and the TAL-X innovation accelerator.'
  },
  {
    id: 'qbe',
    employer: 'QBE Insurance Group',
    short: 'QBE',
    title: 'Principal Technologist for Digital',
    start: 'Apr 2020',
    end: 'Jul 2023',
    city: 'Sydney',
    highlight:
      'Led the React Atomic Design System and AUSPAC digital modernisation, cutting operational costs for digital initiatives by 30%.'
  },
  {
    id: 'macquarie',
    employer: 'Macquarie Group',
    short: 'MACQUARIE',
    title: 'Senior Web Architect / Digital Innovation Consultant',
    start: 'May 2019',
    end: 'Apr 2020',
    city: 'Sydney',
    highlight:
      'Designed the Max Platform, a micro frontend developer portal on single-spa supporting 300 to 1,000 engineers; showcased at YOW! 2019 Sydney.'
  },
  {
    id: 'gbst',
    employer: 'GBST Holdings',
    short: 'GBST',
    title: 'Digital Architect',
    start: 'Feb 2018',
    end: 'May 2019',
    city: 'Sydney',
    highlight:
      'Led UI development across multiple scrum teams in a $20M program; delivered the first production-quality React micro frontend inside Ember and cut total cost of ownership by approximately 30%.'
  },
  {
    id: 'icare',
    employer: 'icare',
    short: 'ICARE',
    title: 'Digital Experience Delivery Manager',
    start: 'Mar 2017',
    end: 'Feb 2018',
    city: 'Sydney',
    highlight:
      'Built the internal digital team and led the icare Design System and Global Experience Language, with Architecture Review Board approval.'
  },
  {
    id: 'earlier',
    employer: 'Earlier engagements',
    short: '1996–2017',
    title: 'Agencies, studios and two co-founded companies',
    start: '1996',
    end: '2017',
    city: 'London, Sydney and elsewhere',
    highlight:
      'Qantas, IAG, Expedia, Sapient Nitro, Ideaworks Game Studio (Activision), Virgin Publishing, Electronic Telegraph and more; co-founder of Chimera Design (1997) and Nouvelle Niche (2008); Theme Clock (2008), a global top-ten free iPhone app with 1.8 million downloads.'
  }
];

/** Employers named for 1996–2017, as listed in the CV. */
export const EARLIER_EMPLOYERS = [
  'Qantas', 'IAG', 'Search Academy/Glasshat', 'Nice Agency', 'QuBit', 'Sapient Nitro',
  'Ideaworks Game Studio (Activision)', '20:20 Technology', 'Virgin Publishing', 'The App Business',
  'Expedia', 'LBi', 'Nouvelle Niche (Co-founder/CTO)', 'Salmon Limited',
  'Chimera Design (Co-founder)', 'Grass Roots Plc', 'Electronic Telegraph', 'Netcel Limited',
  'Aquinas Multimedia Design Studio (Cincinnati, Ohio)'
];

/**
 * Real numbers from the CV only.
 * @typedef {Object} Figure
 * @property {string} id
 * @property {string} label    Condensed-caps bar label.
 * @property {number} value    Numeric value for scaling (see `chart`).
 * @property {string} display  Text as shown, e.g. '50,000+'.
 * @property {string} unit
 * @property {string} source   Where in the CV it comes from.
 * @property {string} [chart]  Group key; values in different groups must not share one axis.
 */
export const FIGURES = [
  { id: 'images', label: 'AI VISION TRAINING IMAGES', value: 50000, display: '50,000+', unit: 'images', source: 'CV, Mould Detect', chart: 'count' },
  { id: 'specialists', label: 'SPECIALISTS IN THE MARKETPLACE', value: 5710, display: '5,710', unit: 'specialists across 83 regions', source: 'CV, Mould Detect', chart: 'count' },
  { id: 'components', label: 'COMPONENTS IN THE REACT PROTOTYPE', value: 74, display: '74', unit: 'components', source: 'CV, Mould Detect', chart: 'count' },
  { id: 'genera', label: 'LAB-VERIFIED MOULD GENERA CLASSIFIED (THAT HAVE AN IMPACT ON HUMAN HEALTH)', value: 6, display: '6', unit: 'genera', source: 'CV, Mould Detect', chart: 'count' },
  { id: 'engines', label: 'INTERCHANGEABLE VISION ENGINES', value: 7, display: '7', unit: 'engines behind one interface', source: 'CV, Mould Detect', chart: 'count' },
  { id: 'model', label: 'QUANTISED CNN MODEL SIZE', value: 5.8, display: '~5.8', unit: 'MB, Lambda- and browser-ready', source: 'CV, Mould Detect', chart: 'size' },
  { id: 'margin-low', label: 'GROSS MARGIN, LOW CASE', value: 82, display: '82%', unit: 'per cent', source: 'CV, Mould Detect', chart: 'percent' },
  { id: 'margin-high', label: 'GROSS MARGIN, HIGH CASE', value: 91, display: '91%', unit: 'per cent', source: 'CV, Mould Detect', chart: 'percent' },
  { id: 'cost-qbe', label: 'DIGITAL COST REDUCTION, QBE', value: 30, display: '30%', unit: 'per cent', source: 'CV, QBE', chart: 'percent' },
  { id: 'tco-gbst', label: 'TOTAL COST OF OWNERSHIP, GBST', value: 30, display: '~30%', unit: 'per cent reduction (approximate)', source: 'CV, GBST', chart: 'percent' },
  { id: 'engineers', label: 'ENGINEERS SERVED BY MAX PLATFORM', value: 1000, display: '300–1,000', unit: 'engineers (upper bound plotted)', source: 'CV, Macquarie', chart: 'people' },
  { id: 'downloads', label: 'THEME CLOCK DOWNLOADS, 2008', value: 1800000, display: '1.8M', unit: 'downloads (300k active users)', source: 'CV, 1996–2017 summary', chart: 'downloads' },
  { id: 'years', label: 'YEARS SINCE FIRST ENGAGEMENT', value: 30, display: '30', unit: 'years, 1996 to 2026', source: 'CV, 1996–2017 summary', chart: 'years' },
  { id: 'scan', label: 'SCAN TO RESULT', value: 60, display: '< 60', unit: 'seconds (classification, confidence, heatmap)', source: 'CV, Mould Detect', chart: 'time' }
];

/** Capability statements: short, caps-friendly. */
/** Digital Technology Innovation chart (Impact and ROI section). `n` counts the organisations listed. */
export const INNOVATION = [
  { n: 6, label: 'Enterprise-scale design systems established', orgs: 'Argos.co.uk, icare, GBST, Macquarie Group (COG), QBE and Mould Detect' },
  { n: 3, label: 'Micro frontend frameworks', orgs: 'GBST (React.js in Ember.js), QBE (embedded insurance) and Macquarie Group (the “Max Platform”)' },
  { n: 6, label: 'Innovation practices established: continuous discovery, design thinking, divergent and dialectical thinking', orgs: 'IAG, icare, GBST, Macquarie Group (COG), QBE and Mould Detect' }
];

export const TICKER = [
  'CHIEF TECHNOLOGY OFFICER',
  'AI VISION SHIPPED TO PRODUCTION',
  'AGENTIC ENGINEERING WITH CLAUDE CODE',
  'GUARD-RAILED RAG ASSISTANTS',
  'EDGE AI AT ZERO MARGINAL COST',
  'FROM START-UP TEAMS TO MULTI-NATIONAL ENTERPRISES',
  'PLATFORM ENGINEERING',
  'DESIGN SYSTEMS AND MICRO FRONTENDS',
  'EVENT-ORIENTED AND API-FIRST',
  'AWS · TERRAFORM · SAM',
  'WCAG ACCESSIBILITY',
  'STRANGLER-PATTERN MODERNISATION',
  'INVESTOR-READY TECHNICAL NARRATIVE',
  'ONE ENGINEER PLUS AGENTS, A LIVE PLATFORM',
  'HUMAN-IN-THE-LOOP BY DESIGN',
  'SYDNEY, NSW'
];

export const LINKS = {
  linkedin: 'https://www.linkedin.com/in/rozariochivers/',
  behance: 'https://www.behance.net/rozario',
  github: 'https://github.com/flipflop',
  email: 'rozario@fastmail.com'
};

/**
 * Featured "current command" panel. CV facts only.
 * @typedef {Object} MouldDetect
 */
export const MOULD_DETECT = {
  name: 'Mould Detect',
  legal: 'MouldDetect Technologies Pty Ltd',
  role: 'Co-Founder & Chief Technology Officer (full time)',
  since: 'Nov 2025',
  status: 'COMMAND',
  url: 'https://molddetect.app',
  standfirst:
    'An AI-powered platform for early mould detection and building-health decision support: scan a surface with a smartphone and receive a classification, confidence score and explainability heatmap in under 60 seconds.',
  facts: [
    ['Training set', '50,000+ images (AI Vision API)'],
    ['Classifier', '6 genera, trained on lab-verified images'],
    ['Marketplace', '5,710 specialists across 83 regions'],
    ['Edge model', '~5.8 MB quantised CNN, runs in Lambda and in the browser'],
    ['Gross margin', '82–91% model; free-tier scans stay on-device'],
    ['Programme', 'AWS Startup Program member'],
    ['Timeline', 'Closed beta October 2026; Australian launch November 2026']
  ],
  how: {
    kicker: 'How it works',
    title: 'Your phone. Sixty seconds. A next step you can act on.',
    lede: 'One photo becomes four readings: likelihood, risk rating, confidence score and a recommended next step. Every reading opens a path you can take immediately: learn, ask the AI, order a lab test, or book a certified remediator.',
    readings: ['Likelihood', 'Risk rating', 'Confidence score', 'Next step'],
    paths: [{ t: 'Mould Edu' }, { t: 'Miss Mould AI assistant' }, { t: 'Lab testing' }, { t: 'Certified remediator marketplace', soon: true }],
    source: 'Diagram redrawn from molddetect.app.'
  },
  built: [
    'Production edge and cloud AI vision, coordinated with AWS partner Cloud Assembly (YOLO and CNN) and a bespoke in-house CNN training suite.',
    'The Environmental Data Suite: a proprietary API at data.molddetect.app for weather, humidity, dew point, condensation risk, flood forecasts and air quality.',
    '"Miss Mould", an in-app AI mycology assistant: LangGraph, AWS Bedrock with Guardrails, hybrid retrieval, Langfuse tracing and an eval-gated CI/CD pipeline.',
    'A 74-component React prototype, a native SwiftUI iOS app with on-device Core ML, a build-free vanilla-JS marketing site, a specialist marketplace and subscription billing.'
  ],
  result:
    'A live, production platform built by one full-time engineer plus agents, at a cloud run-rate measured in tens of dollars per month.'
};

/**
 * Speaking engagements. Sources: cover letter 2026-09-03, CV 2026-09-03, LinkedIn posts supplied by Roz
 * (Terem / The Onset, AWS Beers with Engineers). Dates only where a source gives them.
 * @type {{when:string, title:string, host:string, venue?:string, topic:string, note?:string, photo?:string, alt?:string, video?:string, linkLabel?:string, linkSite?:string}[]}
 */
export const TALKS = [
  {
    when: 'September 2023',
    title: 'Micro Frontends for the large enterprise',
    host: 'Amazon Web Services · Beers with Engineers',
    venue: 'Sydney',
    topic: 'Micro Frontends',
    photo: 'assets/photos/talk-aws-beers-with-engineers-2023.jpg',
    alt: 'Roz presenting at AWS Beers with Engineers, beside a slide titled Global Experience Language Onion Architecture',
    note: 'Built on Roz’s experience at Macquarie Bank, including a “Global Experience Language” onion architecture for layering a component hierarchy from universal primitives to product-specific UI.',
  },
  {
    when: '2024',
    title: 'Managing Design Systems',
    host: 'Terem · Design System Workshop series',
    venue: 'The Onset, Surry Hills',
    topic: 'Design Systems',
    photo: 'assets/photos/talk-terem-design-systems-2024.jpg',
    alt: 'Roz and Rebecca Monfries presenting at The Onset, slide reading Success = Servant Leadership + Psychological Safety',
    note: 'Co-presented with Terem’s Rebecca Monfries: design systems as an organisational practice, where success rests on servant leadership and psychological safety.',
  },
  { when: 'August 2023', title: 'How to Avoid Failure in Digital Transformations', host: 'ScaleUp Sound Bytes podcast · EP4', topic: 'Digital Transformation', video: 'https://open.spotify.com/episode/2dplWrDrTHX35Ty40f0Ko5', linkLabel: 'Listen to the episode', linkSite: 'Spotify', note: 'Why so many enterprise transformations stall, scaled agile, leadership and politics, high-performing teams, and the role of design thinking.' },
  { when: 'April 2019', title: 'Design Systems The Missing Manual', host: 'Sydney Design Systems Meetup', topic: 'Design Systems', video: 'https://www.youtube.com/watch?v=NWuRthPbVOY' },
  { when: '', title: 'Digital innovation culture', host: 'Sydney Future Shapers Meetup', topic: 'Innovation' },
  { when: '', title: 'Design Systems and Pattern Portfolios', host: 'Oxford Geek Nights', venue: 'Cambridge', topic: 'Design Systems', note: 'From Roz’s London years, alongside membership of the London Web Standards Group.' },
];
