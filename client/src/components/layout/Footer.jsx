import React from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { SocialLinks } from '../profile/SocialLinks.jsx';

export const Footer = ({
  className = '',
  copyrightText = 'Designed and developed by',
  authorName,
  content=`Share your valuable feedback & suggestions  `,
  feedbackEmail = '23bcp401@sot.pdpu.ac.in',
}) => {
  const { user } = useAuth();
  const name = authorName || user?.full_name || user?.username || 'StatusHired';
  const year = new Date().getFullYear();

  return (
    <footer className={`mt-16 border-t border-[#5b40b3] dark:border-[#1f6d43] bg-[var(--bg-elev)] ${className}`}>
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-4 pb-4 text-center">
        <p className="text-[14px] text-[#54635B] dark:text-[#8AA097]">
          © {year} {copyrightText}{' '}
          <span className="text-black dark:text-teal-100">{name}</span>
        </p>

        <p className="text-[14px] text-[#54635B] dark:text-[#8AA097]">
          {content}
          <a
            href={`mailto:${feedbackEmail}`}
            className="text-black dark:text-teal-300"
          >
            {feedbackEmail}
          </a>
        </p>
      </div>
    </footer>
  );
};