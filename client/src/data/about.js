/**
 * ===========================================================================
 *  ABOUT PAGE CONTENT  (/about)
 * ---------------------------------------------------------------------------
 *  Everything shown on the About page lives in this ONE file.
 *  Edit the text / arrays below, save, and the page updates — no other code
 *  needs to change. Remove any entry (or set a section to an empty array [])
 *  to hide it.
 * ===========================================================================
 */

export const about = {
  // ---------- Hero ----------
  name: 'Rudra Patel',
  // role: 'Computer Engineer',
  // badge: 'Open to Software Engineer and Web Developer roles',
  tagline: 'Final Year B.Tech Computer Engineering student at PDEU, Gandhinagar — building thoughtful web apps, solving 1300+ DSA problems, and chasing clean code.',
  intro:
    'I build full-stack web apps and solve DSA problems across multiple platforms.',
  degree: 'B.Tech Computer Engineering · PDEU',
  location: 'Ahmedabad, Gujarat, India',
  email: '23bcp401@sot.pdpu.ac.in',
  phone: '+91 7573092630',
  status: 'Open to opportunities',
  photo: './rudra.jpg',
  resumeUrl: 'https://patelrudra.vercel.app/Resume.pdf',
  portfolioUrl: 'https://patelrudra.vercel.app',
  socials: [
    { label: 'GitHub', url: 'https://github.com/rp7163', icon: 'github' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/rudra-patel-pdeu/', icon: 'linkedin' },
    { label: 'Email', url: 'mailto:23bcp401@sot.pdpu.ac.in', icon: 'mail' },
    { label: 'LeetCode', url: 'https://leetcode.com/u/rp_7163', icon: 'leetcode' },
    { label: 'Codeforces', url: 'https://codeforces.com/profile/rp_7163', icon: 'codeforces' },
    { label: 'CodeChef', url: 'https://www.codechef.com/users/soft_pearl_26', icon: 'codechef' },
  ],

  // Big numbers under the hero
  stats: [
    { value: '1300+', label: 'DSA Problems' },
    { value: '8.91', label: 'CGPA' },
    { value: '1682', label: 'LeetCode' },
    { value: '1920', label: 'Coding Ninjas' },
  ],

  // ---------- About ----------
  aboutParagraphs: [
    "I'm a final-year Computer Engineering student at Pandit Deendayal Energy University with a CGPA of 8.91. I love the intersection of competitive programming and product engineering — writing algorithms by day and building full-stack apps.",
    "My toolkit spans C++ for DSA, and the MERN stack for web development. I've built a Git-like VCS in Python, a logistics database system, and a complete online education platform with Node.js, Express.js, and MongoDB.",
    'Currently looking for Software Engineer and Web Developer fresher roles where I can grow as an engineer and ship meaningful products.',
  ],

  // ---------- Skills ----------
  skills: [
    { group: 'Languages', items: ['C++', 'C', 'Python', 'JavaScript', 'SQL'] },
    { group: 'Frontend', items: ['React', 'HTML', 'CSS', 'Responsive Design'] },
    { group: 'Backend', items: ['Node.js', 'Express.js', 'REST APIs'] },
    { group: 'Databases', items: ['MongoDB', 'MySQL'] },
    {
      group: 'Core CS',
      items: ['Data Structures & Algorithms', 'Object-Oriented Programming', 'Operating Systems', 'Database Management Systems'],
    },
    { group: 'Tools', items: ['Git', 'GitHub', 'VS Code', 'Postman'] },
  ],

  // ---------- Projects ----------
  projects: [
    {
      emoji: '🔀',
      title: 'Version Control System (Git-like)',
      period: 'May 2024 – Jul 2024',
      description:
        'Built a Git-like VCS from scratch in Python. Implements repository initialization, content-addressable object storage using SHA-1, change tracking, commit history, and synchronization between local and remote-like stores — all without using Git.',
      tech: ['Python', 'os', 'hashlib', 'json'],
      url: 'https://github.com/rp7163/Version-Control-System',
    },
    {
      emoji: '🚚',
      title: 'Logistics Management System',
      period: 'Mar 2025 – May 2025',
      description:
        'Relational database application to manage end-to-end logistics — shipments, warehouses, fleet vehicles, and inventory levels. Designed ER diagrams, normalized tables up to 3NF, and wrote complex SQL queries with joins, triggers, and stored procedures.',
      tech: ['MySQL'],
      url: 'https://github.com/rp7163/Logistic-management-system',
    },
    {
      emoji: '📚',
      title: 'Study Notion — Online Education Platform',
      period: 'Jun 2025 – Aug 2025',
      description:
        'Full-stack backend for an EdTech platform inspired by StudyNotion. Built REST APIs for course CRUD, student enrollment, progress tracking, ratings & reviews, and transactional email notifications. Designed a normalized MongoDB schema and implemented auth with JWT + bcrypt.',
      tech: ['Node.js', 'Express.js', 'MongoDB'],
      url: 'https://github.com/rp7163/Study-Notion-BackEnd',
    },
    {
      emoji: '🚧',
      title: 'Status Hired — Job Application Tracker',
      period: 'Sept 2026 - Oct 2026',
      description: 'A full-stack web app to keep track of job applications in one place. Users can add every job they apply to, move it across stages like Applied, Interview and Offer on a drag-and-drop board, upload and preview their resumes, and set reminders for interviews and follow-ups. It has secure login with email verification, a personal profile page, and all data is saved per user in MongoDB. Built with the MERN stack and deployed live.',
      tech: ['React', 'Vite', 'Tailwind CSS', 'Node.js', 'Express.js', 'MongoDB', 'Socket.io', 'JWT'],
      liveURL: 'https://status-hired.vercel.app/',
      url: 'https://github.com/rp7163/StatusHired'
    },
  ],

  // ---------- Education ----------
  education: [
    {
      emoji: '🎓',
      level: 'B.Tech',
      period: '2023 — Present',
      current: true,
      institute: 'Pandit Deendayal Energy University, Gandhinagar',
      course: 'B.Tech in Computer Engineering',
      result: 'CGPA: 8.91',
    },
    {
      emoji: '📘',
      level: 'HSC',
      period: '2022 — 2023',
      institute: 'Devasya International School, Ahmedabad',
      course: 'Class XII — Science',
      result: '95.70 Percentile',
    },
    {
      emoji: '🏫',
      level: 'SSC',
      period: '2020 — 2021',
      institute: 'H. B. Mehta High School, Ahmedabad',
      course: 'Class X',
      result: '98.55 Percentile',
    },
  ],

  // ---------- Achievements ----------
  achievements: [
    { title: 'Global Rank 10', text: 'Secured global rank 10 in a weekly competitive coding contest on Coding Ninjas.' },
    { title: 'Specialist', text: 'Specialist on Coding Ninjas with a peak rating of 1920.' },
    { title: 'CodeChef 1560 / 1897', text: '2★ on CodeChef CP Contest 1560 (curr) & DSA Contest rating of 1897 (max).' },
    { title: 'Pupil · Codeforces', text: 'Pupil on Codeforces with a current rating of 1223.' },
    { title: '1300+ DSA Problems', text: 'Solved 1300+ DSA problems across Codeforces, LeetCode, CodeChef, and Coding Ninjas.' },
    {
      title: 'NPTEL Top 1%',
      text: "Gold + Elite certificate for scoring 100% in the NPTEL course 'Understanding Incubation and Entrepreneurship' — top 1%.",
      url: 'https://archive.nptel.ac.in/content/noc/NOC25/SEM2/Ecertificates/107/noc25-de20/Course/NPTEL25DE20S55060061410255295.pdf',
    },
  ],

  // ---------- Coding profiles ----------
  codingProfiles: [
    { platform: 'LeetCode', handle: '@rp_7163 · Top 15%', rating: '1682', ratingLabel: 'Rating', url: 'https://leetcode.com/u/rp_7163' },
    {
      platform: 'Coding Ninjas',
      handle: '@rp7163 · Specialist',
      rating: '1920',
      ratingLabel: 'Rating',
      url: 'https://www.naukri.com/code360/profile/4a7855bd-4f0b-455b-b273-712bd9a9ceb2',
    },
    {
      platform: 'CodeChef',
      handle: '@soft_pearl_26 · 2★ CP · 1897 DSA',
      rating: '1560',
      ratingLabel: 'CP 2★',
      url: 'https://www.codechef.com/users/soft_pearl_26',
    },
    { platform: 'Codeforces', handle: '@rp_7163 · Pupil', rating: '1223', ratingLabel: 'Rating', url: 'https://codeforces.com/profile/rp_7163' },
  ],

  // ---------- Contact ----------
  contactHeading: "Let's work together",
  contactText:
    "I'm currently looking for Software Engineer and Web Developer fresher roles and interesting internships. The fastest way to reach me is email — I usually reply within 24 hours.",
};

export default about;
