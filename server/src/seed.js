/**
 * Seeds a demo account with sample data.
 *   npm run seed
 * Login:  demo@statushired.app / demo1234
 */
import 'dotenv/config';
import { connectDB, disconnectDB } from './config/db.js';
import { User, UserSettings, Application, StageHistory, Reminder, Resume } from './models/index.js';

const DEMO_EMAIL = 'demo@statushired.app';
const DEMO_PASSWORD = 'demo1234';

const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const dateStr = (d) => d.toISOString().slice(0, 10);

/** Creates (or recreates) the demo account with sample data. Safe to call on a connected DB. */
export async function seedDemo() {
  await User.deleteOne({ email: DEMO_EMAIL });

  const user = await User.create({
    email: DEMO_EMAIL,
    password_hash: await User.hashPassword(DEMO_PASSWORD),
    full_name: 'Rudra Patel',
    username: 'rp7163',
    headline: 'Software Engineer · Full-Stack Developer',
    bio: 'Final Year B.Tech Computer Engineering student at PDEU, Gandhinagar — building thoughtful web apps, solving 1300+ DSA problems, and chasing clean code.',
    location: 'Ahmedabad, Gujarat, India',
    portfolio_url: 'https://patelrudra.vercel.app',
    github_url: 'https://github.com/rp7163',
    linkedin_url: 'https://www.linkedin.com/in/rudra-patel-pdeu/',
    leetcode_url: 'https://leetcode.com/u/rp_7163',
    codeforces_url: 'https://codeforces.com/profile/rp_7163',
    codechef_url: 'https://www.codechef.com/users/soft_pearl_26',
    open_to_work: true,
  });
  const uid = user._id;
  await Promise.all([
    Application.deleteMany({ user_id: uid }),
    StageHistory.deleteMany({ user_id: uid }),
    Reminder.deleteMany({ user_id: uid }),
    Resume.deleteMany({ user_id: uid }),
  ]);
  await UserSettings.create({ user_id: uid, theme: 'system', browser_notifications: false });

  const apps = [
    { company_name: 'Google', role: 'Software Engineer II', ctc: '₹45 LPA', location: 'Bengaluru', job_type: 'Full-time', source: 'Referral', stage: 'interview', applied_date: dateStr(daysAgo(14)), notes: 'Phone screen done. Onsite scheduled.' },
    { company_name: 'Microsoft', role: 'Frontend Engineer', ctc: '₹38 LPA', location: 'Hyderabad', job_type: 'Full-time', source: 'LinkedIn', stage: 'assessment', applied_date: dateStr(daysAgo(10)) },
    { company_name: 'Razorpay', role: 'Full Stack Developer', ctc: '₹28 LPA', location: 'Bengaluru', job_type: 'Full-time', source: 'Company Site', stage: 'applied', applied_date: dateStr(daysAgo(5)) },
    { company_name: 'Zomato', role: 'React Developer', ctc: '₹22 LPA', location: 'Gurugram', job_type: 'Full-time', source: 'Naukri', stage: 'saved' },
    { company_name: 'Atlassian', role: 'Senior Engineer', ctc: '₹55 LPA', location: 'Remote', job_type: 'Remote', source: 'Referral', stage: 'selected', applied_date: dateStr(daysAgo(30)) },
    { company_name: 'Swiggy', role: 'SDE-1', ctc: '₹20 LPA', location: 'Bengaluru', job_type: 'Full-time', source: 'LinkedIn', stage: 'rejected', applied_date: dateStr(daysAgo(21)) },
    { company_name: 'Freshworks', role: 'UI Engineer', ctc: '₹18 LPA', location: 'Chennai', job_type: 'Hybrid', source: 'Instahyre', stage: 'applied', applied_date: dateStr(daysAgo(2)) },
  ];

  const created = [];
  for (const [i, a] of apps.entries()) {
    const doc = await Application.create({ ...a, user_id: uid, position: i, created_at: daysAgo(30 - i * 3) });
    created.push(doc);
    await StageHistory.create({ application_id: doc._id, user_id: uid, from_stage: null, to_stage: 'saved', changed_at: daysAgo(30 - i * 3) });
    if (a.stage !== 'saved') {
      await StageHistory.create({ application_id: doc._id, user_id: uid, from_stage: 'saved', to_stage: 'applied', changed_at: daysAgo(28 - i * 3) });
    }
    if (!['saved', 'applied'].includes(a.stage)) {
      await StageHistory.create({ application_id: doc._id, user_id: uid, from_stage: 'applied', to_stage: a.stage, changed_at: daysAgo(20 - i * 2) });
    }
  }

  await Reminder.create([
    { user_id: uid, application_id: created[0]._id, title: 'Google onsite interview', description: 'System design + 2 coding rounds', remind_at: new Date(Date.now() + 2 * 86400000) },
    { user_id: uid, application_id: created[1]._id, title: 'Submit Microsoft take-home', description: 'Deadline for the coding assessment', remind_at: new Date(Date.now() + 86400000) },
    { user_id: uid, application_id: created[2]._id, title: 'Follow up with Razorpay recruiter', remind_at: new Date(Date.now() - 3600000) },
    { user_id: uid, application_id: null, title: 'Update resume with latest project', remind_at: new Date(Date.now() + 5 * 86400000) },
  ]);

  console.log(`[seed] Demo account ready -> ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

// Run directly:  npm run seed
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  connectDB()
    .then(seedDemo)
    .then(disconnectDB)
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
