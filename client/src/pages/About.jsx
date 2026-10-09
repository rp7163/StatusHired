import React from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  FileText,
  GraduationCap,
  Github,
  Linkedin,
  Twitter,
  Code2,
  Trophy,
  Terminal,
  Link as LinkIcon,
  ExternalLink,
  Sparkles,
  CircleDot,
} from 'lucide-react';
import { about } from '../data/about.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { Avatar } from '../components/ui/Avatar.jsx';
import { Button } from '../components/ui/Button.jsx';

const ICONS = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  globe: Globe,
  mail: Mail,
  phone: Phone,
  leetcode: Code2,
  codeforces: Trophy,
  codechef: Terminal,
  link: LinkIcon,
};

/* Section wrapper: eyebrow + heading + optional subtitle (portfolio style) */
const Section = ({ eyebrow, title, subtitle, children }) => (
  <section className="space-y-5">
    <div>
      <span className="eyebrow mb-3">{eyebrow}</span>
      <h2 className="text-[28px] sm:text-[34px] font-bold tracking-tight leading-tight text-[#0C1A13] dark:text-[#E8F5EE]">{title}</h2>
      {subtitle && <p className="mt-1.5 text-[15px] text-[#54635B] dark:text-[#8AA097] max-w-2xl">{subtitle}</p>}
    </div>
    {children}
  </section>
);

const fade = (i = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay: Math.min(i, 6) * 0.05 },
});

export const About = () => {
  useDocumentTitle('About');
  const { user } = useAuth();
  const a = about;

  return (
    <div className="space-y-16">
      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden apple-card p-6 sm:p-10">
        <div className="pointer-events-none absolute -top-32 -right-24 w-[460px] h-[460px] rounded-full bg-[radial-gradient(circle,var(--accent-glow),transparent_65%)] opacity-70" />
        <div className="relative grid lg:grid-cols-[1fr_auto] gap-10 items-center">
          <div className="text-center lg:text-left">
            {a.badge && (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#B45309] dark:text-[#FBBF24] text-[12px] font-semibold mb-5">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
                {a.badge}
              </span>
            )}
            <h1 className="text-[36px] sm:text-[54px] leading-[1.05] font-bold tracking-tight text-[#0C1A13] dark:text-[#E8F5EE]">
              Hi, I&apos;m <span className="gradient-text">{a.name}</span>
            </h1>
            {a.role && <p className="mt-2 text-[20px] sm:text-[24px] font-semibold text-[#54635B] dark:text-[#8AA097]">{a.role}</p>}
            {a.tagline && <p className="mt-3 text-[16px] text-[#54635B] dark:text-[#8AA097]">{a.tagline}</p>}
            {a.intro && <p className="mt-4 max-w-2xl mx-auto lg:mx-0 text-[15px] leading-relaxed text-[#54635B] dark:text-[#8AA097]">{a.intro}</p>}

            <div className="mt-5 flex flex-wrap justify-center lg:justify-start gap-2 text-[13px] text-[#54635B] dark:text-[#8AA097]">
              {a.degree && <Chip icon={GraduationCap}>{a.degree}</Chip>}
              {a.location && <Chip icon={MapPin}>{a.location}</Chip>}
              {a.email && <Chip icon={Mail}>{a.email}</Chip>}
            </div>

            <div className="mt-7 flex flex-wrap justify-center lg:justify-start gap-3">
              {a.portfolioUrl && (
                <a href={a.portfolioUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" size="lg" leftIcon={<Globe className="w-4 h-4" />}>View my portfolio</Button>
                </a>
              )}
              {a.resumeUrl && (
                <a href={a.resumeUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="lg" leftIcon={<FileText className="w-4 h-4" />}>View resume</Button>
                </a>
              )}
            </div>

            {a.socials?.length > 0 && (
              <div className="mt-7 flex flex-wrap justify-center lg:justify-start gap-3">
                {a.socials.map((s) => {
                  const Icon = ICONS[s.icon] || LinkIcon;
                  return (
                    <a key={s.url} href={s.url} target={s.url.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" title={s.label} aria-label={s.label} className="social-btn">
                      <Icon className="w-[18px] h-[18px]" strokeWidth={1.9} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <div className="relative mx-auto">
            <div className="absolute inset-0 rounded-[32px] gradient-bg blur-2xl opacity-40 scale-105" />
            <div className="relative p-[3px] rounded-[32px] gradient-bg shadow-[0_20px_60px_var(--accent-glow)]">
              <Avatar user={user} src={a.photo || undefined} size={220} rounded="rounded-[29px]" className="!border-0 bg-[var(--bg-elev)]" />
            </div>
          </div>
        </div>

        {a.stats?.length > 0 && (
          <div className="relative mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {a.stats.map((s, i) => (
              <motion.div key={s.label} {...fade(i)} className="rounded-[16px] border border-[#E1EBE5] dark:border-[#1D2A23] bg-[var(--bg-elev-2)] p-5 text-center">
                <div className="text-[34px] font-bold leading-none gradient-text font-[Outfit]">{s.value}</div>
                <div className="mt-2 text-[12px] font-medium uppercase tracking-wider text-[#54635B] dark:text-[#8AA097]">{s.label}</div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ================= ABOUT ================= */}
      {a.aboutParagraphs?.length > 0 && (
        <Section eyebrow="About" title="A bit about me">
          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
            <motion.div {...fade()} className="apple-card p-6 sm:p-8 space-y-4 text-[15px] leading-relaxed text-[#54635B] dark:text-[#8AA097]">
              {a.aboutParagraphs.map((p, i) => <p key={i}>{p}</p>)}
            </motion.div>
            <motion.div {...fade(1)} className="apple-card p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-1 gap-5">
              <Fact label="Location" value={a.location} />
              <Fact label="Email" value={a.email} href={a.email ? `mailto:${a.email}` : null} />
              <Fact label="Phone" value={a.phone} href={a.phone ? `tel:${a.phone.replace(/\s+/g, '')}` : null} />
              <Fact label="Status" value={a.status} accent />
            </motion.div>
          </div>
        </Section>
      )}

      {/* ================= SKILLS ================= */}
      {a.skills?.length > 0 && (
        <Section eyebrow="Skills" title="My toolbox" subtitle="Technologies I use to design, build, and ship products that users love.">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {a.skills.map((g, i) => (
              <motion.div key={g.group} {...fade(i)} className="apple-card p-5">
                <h3 className="text-[15px] font-bold mb-3">{g.group}</h3>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((it) => (
                    <span key={it} className="px-3 py-1 rounded-full text-[13px] font-medium bg-[var(--accent-soft)] text-[#047857] dark:text-[#6EE7B7]">{it}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      {/* ================= PROJECTS ================= */}
      {a.projects?.length > 0 && (
        <Section eyebrow="Projects" title="Things I've built" subtitle="A selection of projects that taught me the most about real-world engineering.">
          <div className="grid md:grid-cols-2 gap-4">
            {a.projects.map((p, i) => (
              <motion.article key={p.title} {...fade(i)} className="apple-card p-6 flex flex-col hover:-translate-y-1 hover:shadow-[var(--shadow-glow)] transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-[14px] bg-[var(--accent-soft)] flex items-center justify-center text-[24px]">{p.emoji}</div>
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="social-btn !w-10 !h-10" title="Open project" aria-label="Open project">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <h3 className="mt-4 text-[18px] font-bold leading-snug">{p.title}</h3>
                {p.period && <p className="mt-1 text-[12px] font-mono uppercase tracking-wider text-[#8A9A92] dark:text-[#5C6F67]">{p.period}</p>}
                <p className="mt-3 text-[14px] leading-relaxed text-[#54635B] dark:text-[#8AA097] flex-1">{p.description}</p>
                {p.tech?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.tech.map((t) => (
                      <span key={t} className="px-2.5 py-1 rounded-md text-[12px] font-medium border border-[#E1EBE5] dark:border-[#1D2A23] text-[#54635B] dark:text-[#8AA097]">{t}</span>
                    ))}
                  </div>
                )}
              </motion.article>
            ))}
          </div>
        </Section>
      )}

      {/* ================= EDUCATION ================= */}
      {a.education?.length > 0 && (
        <Section eyebrow="Education" title="Where I studied" subtitle="My academic journey so far.">
          <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-[9px] sm:before:left-[13px] before:top-2 before:bottom-2 before:w-[2px] before:gradient-bg before:opacity-40 before:rounded-full">
            {a.education.map((e, i) => (
              <motion.div key={e.level + e.period} {...fade(i)} className="relative apple-card p-5 sm:p-6">
                <span className="absolute -left-6 sm:-left-8 top-7 w-[20px] h-[20px] sm:w-[28px] sm:h-[28px] rounded-full gradient-bg ring-4 ring-[var(--bg-main)] flex items-center justify-center text-[11px] sm:text-[14px]">{e.emoji}</span>
                <div className="flex flex-wrap items-center gap-2 text-[12px] font-mono uppercase tracking-wider text-[#8A9A92] dark:text-[#5C6F67]">
                  <span className="text-[#047857] dark:text-[#6EE7B7] font-semibold">{e.level}</span>
                  <span>·</span>
                  <span>{e.period}</span>
                  {e.current && <span className="ml-1 px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[#047857] dark:text-[#6EE7B7] normal-case tracking-normal">In progress</span>}
                </div>
                <h3 className="mt-2 text-[17px] font-bold">{e.institute}</h3>
                <p className="text-[14px] text-[#54635B] dark:text-[#8AA097]">{e.course}</p>
                {e.result && <p className="mt-2 text-[13px]"><span className="text-[#8A9A92] dark:text-[#5C6F67] uppercase text-[11px] tracking-wider mr-2">Result</span><span className="font-semibold gradient-text">{e.result}</span></p>}
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      {/* ================= ACHIEVEMENTS ================= */}
      {(a.achievements?.length > 0 || a.codingProfiles?.length > 0) && (
        <Section eyebrow="Achievements" title="Milestones & recognition" subtitle="Competitive programming, academics, and beyond.">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
            {a.achievements?.length > 0 && (
              <motion.div {...fade()} className="apple-card p-6">
                <h3 className="text-[15px] font-bold mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#059669] dark:text-[#34D399]" />Highlights</h3>
                <ul className="space-y-4">
                  {a.achievements.map((h) => (
                    <li key={h.title} className="flex gap-3">
                      <CircleDot className="w-4 h-4 mt-1 shrink-0 text-[#059669] dark:text-[#34D399]" />
                      <div>
                        <p className="text-[12px] font-mono uppercase tracking-wider text-[#047857] dark:text-[#6EE7B7]">{h.title}</p>
                        <p className="text-[14px] text-[#54635B] dark:text-[#8AA097]">
                          {h.url ? <a href={h.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{h.text}</a> : h.text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
            {a.codingProfiles?.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-[15px] font-bold px-1">Coding profiles</h3>
                {a.codingProfiles.map((c, i) => (
                  <motion.a key={c.platform} {...fade(i)} href={c.url} target="_blank" rel="noopener noreferrer" className="apple-card p-4 flex items-center justify-between gap-3 hover:border-[#10B981] transition-colors">
                    <div className="min-w-0">
                      <p className="text-[15px] font-bold">{c.platform}</p>
                      <p className="text-[12px] text-[#54635B] dark:text-[#8AA097] truncate">{c.handle}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[22px] font-bold leading-none gradient-text font-[Outfit]">{c.rating}</p>
                      <p className="text-[10px] uppercase tracking-wider text-[#8A9A92] dark:text-[#5C6F67]">{c.ratingLabel}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* ================= CONTACT ================= */}
      {(a.email || a.phone) && (
        <Section eyebrow="Contact" title={a.contactHeading || "Let's work together"}>
          <motion.div {...fade()} className="apple-card p-6 sm:p-8 grid md:grid-cols-[1.4fr_1fr] gap-6 items-center">
            <p className="text-[15px] leading-relaxed text-[#54635B] dark:text-[#8AA097]">{a.contactText}</p>
            <div className="space-y-3 text-[14px]">
              {a.email && <a href={`mailto:${a.email}`} className="flex items-center gap-3 hover:text-[#059669] dark:hover:text-[#34D399]"><span className="social-btn !w-10 !h-10"><Mail className="w-4 h-4" /></span>{a.email}</a>}
              {a.phone && <a href={`tel:${a.phone.replace(/\s+/g, '')}`} className="flex items-center gap-3 hover:text-[#059669] dark:hover:text-[#34D399]"><span className="social-btn !w-10 !h-10"><Phone className="w-4 h-4" /></span>{a.phone}</a>}
              {a.location && <p className="flex items-center gap-3"><span className="social-btn !w-10 !h-10"><MapPin className="w-4 h-4" /></span>{a.location}</p>}
            </div>
          </motion.div>
        </Section>
      )}
    </div>
  );
};

const Chip = ({ icon: Icon, children }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-elev-2)] border border-[#E1EBE5] dark:border-[#1D2A23]">
    <Icon className="w-3.5 h-3.5 text-[#059669] dark:text-[#34D399]" />
    {children}
  </span>
);

const Fact = ({ label, value, href, accent }) => {
  if (!value) return null;
  return (
    <div>
      <p className="text-[11px] font-mono uppercase tracking-wider text-[#8A9A92] dark:text-[#5C6F67]">{label}</p>
      {href ? (
        <a href={href} className="text-[14px] font-medium hover:text-[#059669] dark:hover:text-[#34D399] break-all">{value}</a>
      ) : (
        <p className={`text-[14px] font-medium ${accent ? 'text-[#047857] dark:text-[#6EE7B7]' : ''}`}>{value}</p>
      )}
    </div>
  );
};

export default About;
