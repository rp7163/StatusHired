import React from 'react';
import { Github, Linkedin, Twitter, Globe, Mail, Phone, Code2, Trophy, Terminal, Link as LinkIcon } from 'lucide-react';

/**
 * Builds the ordered list of social / contact links for a user.
 * Shared by the Footer and the Profile hero so both stay in sync.
 */
export function getSocialLinks(user) {
  if (!user) return [];
  const items = [
    { key: 'github', label: 'GitHub', href: user.github_url, icon: Github },
    { key: 'linkedin', label: 'LinkedIn', href: user.linkedin_url, icon: Linkedin },
    { key: 'twitter', label: 'X / Twitter', href: user.twitter_url, icon: Twitter },
    { key: 'portfolio', label: 'Portfolio', href: user.portfolio_url, icon: Globe },
    { key: 'leetcode', label: 'LeetCode', href: user.leetcode_url, icon: Code2 },
    { key: 'codeforces', label: 'Codeforces', href: user.codeforces_url, icon: Trophy },
    { key: 'codechef', label: 'CodeChef', href: user.codechef_url, icon: Terminal },
    { key: 'email', label: 'Email', href: user.email ? `mailto:${user.email}` : null, icon: Mail },
    { key: 'phone', label: 'Phone', href: user.phone ? `tel:${user.phone}` : null, icon: Phone },
    ...(Array.isArray(user.links) ? user.links : []).map((l, i) => ({
      key: `link-${i}`,
      label: l.label || l.url,
      href: l.url,
      icon: LinkIcon,
    })),
  ];
  return items.filter((i) => Boolean(i.href));
}

export const SocialLinks = ({ user, className = '', size = 44 }) => {
  const links = getSocialLinks(user);
  if (links.length === 0) return null;
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {links.map(({ key, label, href, icon: Icon }) => (
        <a
          key={key}
          href={href}
          target={href.startsWith('http') ? '_blank' : undefined}
          rel="noopener noreferrer"
          title={label}
          aria-label={label}
          className="social-btn"
          style={{ width: size, height: size }}
        >
          <Icon className="w-[18px] h-[18px]" strokeWidth={1.9} />
        </a>
      ))}
    </div>
  );
};
