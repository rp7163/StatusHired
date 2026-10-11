import React from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { SocialLinks } from '../profile/SocialLinks.jsx';

export const Footer = () => {
  const { user } = useAuth();
  const name = user?.full_name || user?.username || 'StatusHired';
  const location = user?.location;
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-[#5b40b3] dark:border-[#1f6d43] bg-[var(--bg-elev)]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-4 pb-4 text-center">
        {/* <SocialLinks user={user} className="justify-center" /> */}

        {/* <div className="w-20 h-[2px] gradient-bg opacity-50 rounded-full mx-auto my-6" /> */}

        <p className="text-[14px] text-[#54635B] dark:text-[#8AA097]">
          © {year} Built with the MERN stack by <span className="text-[14px] text-black dark:text-teal-100">{name}</span>
        </p>
        {/* {location && (
          <p className="mt-1.5 text-[13px] text-[#8A9A92] dark:text-[#5C6F67] inline-flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-[#059669] dark:text-[#34D399] fill-current" /> in {location}
          </p>
        )} */}
        <p className="text-[14px]  text-[#54635B] dark:text-[#8AA097]">Share your valuable feedback & suggestions on <a href="mailto:23bcp401@sot.pdpu.ac.in" className="text-[14px] text-black  dark:text-teal-300">23bcp401@sot.pdpu.ac.in</a></p>
      </div>
    </footer>
  );
};
