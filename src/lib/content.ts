// Portfolio content shared by the classic sections, the homelab room panels
// and the terminal — one source of truth.

export type Project = {
  name: string;
  description: string;
  stack: string[];
  link: string;
  preview: string | null;
  placeholderFile?: string;
};

export const PROJECTS: Project[] = [
  {
    name: "Facial Recognition Door Lock",
    description:
      "Biometric physical access control system using OpenCV and KNN. Replaces keycard-based entry with real-time face identification, with 95% accuracy via eigenface normalization on a live dataset.",
    stack: ["Python", "OpenCV", "KNN", "Security", "JSON"],
    link: "https://facial-recognition-door-security-v5.vercel.app/",
    preview: "/previews/facial-recognition.png",
  },
  {
    name: "GSU Panther Chatbot",
    description:
      "Full-stack AI academic assistant for Georgia State students. GPT-4 grounded through Pinecone vector search, architected with data isolation and scoped retrieval to prevent prompt injection and hallucination.",
    stack: ["React", "Node.js", "Supabase", "Pinecone", "OpenAI API"],
    link: "https://frontend-4hefze9k9-youssefgaras-3531s-projects.vercel.app/",
    preview: "/previews/gsu-chatbot.png",
  },
  {
    name: "Intelligent Word Prediction Bot",
    description:
      "Real-time voice-interaction system combining speech recognition with TensorFlow LSTM pipelines for sequence prediction. Explores adversarial input handling and model robustness under noisy conditions.",
    stack: ["Python", "TensorFlow", "LSTM", "NLP"],
    link: "https://github.com/Juiccef",
    // PLACEHOLDER — drop a screenshot at /public/previews/word-prediction.png
    // and set:  preview: "/previews/word-prediction.png"
    preview: null,
    placeholderFile: "word-prediction.png",
  },
  {
    name: "UFC RSVP Page",
    description:
      "Dynamic RSVP and advertising website for a UFC event. Built with input validation, XSS mitigations, and responsive UX flows designed in Figma.",
    stack: ["Figma", "HTML", "CSS", "JavaScript"],
    link: "https://ufc319rsvppage.vercel.app/",
    preview: "/previews/ufc-rsvp.png",
  },
];

export type Site = {
  name: string;
  category: string;
  url: string;
  displayUrl: string;
  description: string;
  tags: string[];
  preview: string;
};

export const SITES: Site[] = [
  {
    name: "AROMA Roastery & Confectionery",
    category: "Roastery & Online Store · Duluth, GA",
    url: "https://www.aromaroastco.com/",
    displayUrl: "aromaroastco.com",
    description:
      "Bilingual English/Arabic storefront for a Duluth roastery selling fresh-roasted nuts, Arabic sweets, coffee and spices. It has a rotating hero, a category mega-menu, product cards with quick view and add-to-cart, and a gifting guide, in a warm Levantine-inspired design.",
    tags: ["Web Design", "E-commerce", "English / Arabic", "Responsive"],
    preview: "/previews/aroma.jpg",
  },
  {
    name: "Peach Parking Solutions",
    category: "Valet & Parking · Atlanta, GA",
    url: "https://www.peachparkingsolutions.com/",
    displayUrl: "peachparkingsolutions.com",
    description:
      "Design-and-build marketing site for an Atlanta valet company, with a bold photo-led hero, a service breakdown, and a quote-request flow built to turn event planners and venues into booked clients.",
    tags: ["Web Design", "Responsive", "SEO", "Lead Capture"],
    preview: "/previews/peach-parking.jpg",
  },
];

export const EXPERIENCE = [
  {
    role: "Endpoint Intern",
    company: "McKenney's, Inc.",
    location: "Atlanta, GA",
    period: "May 2026 to Present",
    type: "Internship",
    bullets: [
      "Administer enterprise-wide patch management with Quest KACE and PowerShell, rolling updates out across thousands of company devices while keeping them up.",
      "Designed and deployed secure printer configurations across the organization, hardening print infrastructure against unauthorized access.",
      "Configure and maintain Cisco Meraki networking and Starlink satellite connectivity for secure, reliable enterprise access.",
      "Monitor and triage security alerts in SentinelOne, investigating incidents to strengthen endpoint protection.",
    ],
  },
  {
    role: "Technical Director & Lead Graphics Operator",
    company: "Leading the Way",
    location: "Atlanta, GA",
    period: "Sep 2022 to May 2026",
    type: "Independent Contractor",
    bullets: [
      "Led live international TV broadcasts reaching 260M+ viewers across the Middle East via Nilesat, Arabsat, and Hotbird satellites.",
      "Operated Xpression broadcast graphics software in zero-error, high-pressure live production environments.",
      "Transcribed and translated TV graphics from English to Arabic in real time, cutting hours of production prep.",
    ],
  },
  {
    role: "Knack Tutor",
    company: "Georgia State University",
    location: "Atlanta, GA",
    period: "Aug 2025 to May 2026",
    type: "Part-time",
    bullets: [
      "Tutored students in Linear Algebra, CS 1302 (Java), and Physics 1211.",
      "Students improved by an average of one full letter grade on their assessments.",
    ],
  },
];

export const PHOTOS = [
  "/photos/650972603_18096526577512337_4567314352383703773_n.jpg",
  "/photos/653956318_18136268458510993_7133637385493163659_n.jpg",
  "/photos/651049058_18068570144652320_1011213500335140106_n.jpg",
  "/photos/652756299_18093485917843567_7740185498722407616_n.jpg",
  "/photos/654385360_18097287850807888_5734711489156017660_n.jpg",
  "/photos/650795741_18086794154466583_619092503578956881_n.jpg",
  "/photos/654526879_18144998599469871_401866364830960298_n.jpg",
  "/photos/650920182_18071149634219189_2753188449096934207_n.jpg",
  "/photos/653793425_18070054652266774_7222627803725084486_n.jpg",
];

/** The poster on the room's left wall. */
export const ROOM_POSTER = { src: "/room/hasbulla-square.jpg", wall: "/room/hasbulla-wall.jpg", alt: "Hasbulla at a fight, fist raised, in a white shirt" };

export const INSTAGRAM_URL = "https://www.instagram.com/y.gpics/";
export const RESUME_URL = "/resume.pdf";
/** Page image of the resume for the on-screen close-up (dated so image caches never serve an old one). */
export const RESUME_IMAGE = "/resume-2026-10-04.png";

export const SOCIALS = [
  { key: "email", label: "Email", handle: "youssefgaras@gmail.com", href: "mailto:youssefgaras@gmail.com" },
  { key: "linkedin", label: "LinkedIn", handle: "youssef-garas", href: "https://www.linkedin.com/in/youssef-garas/" },
  { key: "github", label: "GitHub", handle: "@Juiccef", href: "https://github.com/Juiccef" },
  { key: "instagram", label: "Photography", handle: "@y.gpics", href: INSTAGRAM_URL },
];

// Printed on the certificate — recruiters can verify authenticity at Cisco.
export const CCNA_VERIFY_URL = "https://www.cisco.com/go/verifycertificate";
export const CCNA_VERIFICATION_NO = "3d725c9f4c5c455ab40b655434254ed0";

export const CERTS = [
  {
    id: "ccna",
    name: "CCNA",
    full: "Cisco Certified Network Associate",
    issuer: "Cisco",
    note: "Valid through 2029",
    issued: "Jun 2026",
    validThrough: "Jun 2029",
    file: "/certs/ccna.pdf",
    thumb: "/certs/ccna-thumb.png",
    verify: { url: CCNA_VERIFY_URL, code: CCNA_VERIFICATION_NO },
  },
  {
    id: "secplus",
    name: "Security+",
    full: "CompTIA Security+",
    issuer: "CompTIA",
    note: "SY0-701 · valid through 2029",
    issued: "Sep 2026",
    validThrough: "Sep 2029",
    file: "/certs/secplus.pdf",
    thumb: "/certs/secplus-thumb.png",
    // printed on the certificate — enter the code at verify.comptia.org
    verify: { url: "https://verify.comptia.org", code: "5a14511e3f7e497f862e44847d940de6" },
  },
  {
    id: "gux",
    name: "Google UX Design",
    full: "Google UX Design Professional Certificate",
    issuer: "Google",
    note: "User research, wireframing and prototyping",
  },
  {
    id: "codepath",
    name: "CodePath",
    full: "CodePath Web Development",
    issuer: "CodePath",
    note: "Web development program",
  },
] as const;

// What runs on the P340 Tiny — the short, recruiter-facing version.
export const HOMELAB = {
  host: "Lenovo ThinkStation P340 Tiny",
  os: "Debian 13 · headless · 24/7",
  services: [
    { name: "Caddy", role: "reverse proxy with TLS from my own internal CA, 8+ services routed by subdomain" },
    { name: "AdGuard Home", role: "network-wide DNS + ad/tracker blocking, DNS-over-HTTPS upstream, split-horizon internal zone" },
    { name: "Tailscale", role: "WireGuard mesh VPN for remote access from behind CGNAT, with subnet routing + split DNS" },
    { name: "Docker Compose", role: "9+ container stack (media server with QuickSync transcoding, automation apps, Portainer) versioned in Git" },
    { name: "restic → Backblaze B2", role: "encrypted, deduplicated offsite backups on a systemd timer, with restores tested and used for real" },
  ],
  hardening: ["SSH keys only (ed25519), no root/password login", "fail2ban", "ufw default-deny, LAN-scoped rules", "unattended security upgrades"],
  stories: [
    "Traced a 502 to ufw's default-deny silently dropping Docker bridge traffic, and fixed it with a scoped allow rule.",
    "An unpinned image jumped two major versions mid-migration and broke auth between services. I pinned the versions and documented it in the repo.",
    "Migrated the whole stack (containers, volumes, DNS, CA) to the P340 with a planned IP cutover, so no bookmarks broke.",
  ],
};
