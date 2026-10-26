import React from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { SocialLinks } from '../profile/SocialLinks.jsx';

export const Footer = ({
  className = '',
  copyrightText = 'Designed and developed by',
  authorName,
  content=`Share your valuable feedback & suggestions on `,
  feedbackEmail = '23bcp401@sot.pdpu.ac.in',
}) => {
  const { user } = useAuth();
  const name = authorName || user?.full_name || user?.username || 'StatusHired';
  const year = new Date().getFullYear();

  return (
    <footer className={`mt-10 sm:mt-16 border-t border-[#5b40b3] dark:border-[#1f6d43] bg-[var(--bg-elev)] ${className}`}>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-4 text-center space-y-1">
        <p className="text-[13px] sm:text-[14px] text-[#54635B] dark:text-[#8AA097] leading-relaxed">
          © {year} {copyrightText}{' '}
          <span className="text-black dark:text-teal-100 font-medium">{name}</span>
        </p>

        <p className="text-[12.5px] sm:text-[14px] text-[#54635B] dark:text-[#8AA097] leading-relaxed break-words">
          {content}
          <a
            href={`mailto:${feedbackEmail}`}
            className="text-black dark:text-teal-300 font-medium underline-offset-2 hover:underline inline-block"
          >
            {feedbackEmail}
          </a>
        </p>
      </div>
    </footer>
  );
};