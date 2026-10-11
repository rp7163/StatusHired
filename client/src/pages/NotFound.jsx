import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { Compass, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 shadow-sm">
        <Compass className="w-8 h-8" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
        Error 404
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 dark:text-[#E8F5EE] cambria-text !text-[40px] pb-4">
        Page Not Found
      </h1>

      <p className="mt-2 !text-[17px] text-slate-500 dark:text-[#8AA097] max-w-md comic-text">
        The application page or route you requested doesn't exist or may have been moved.
      </p>

      <div className="mt-6 flex items-center gap-3 cambria-text brightness-120 !text-black">
        <Link to="/">
          <Button variant="primary" leftIcon={<Home className="w-4 h-4 text-black" />} className="!text-black !text-[17px]">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
