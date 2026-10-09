import React, { useState } from 'react';
import { Modal, Button, Badge } from './ui/index.js';
import { Database, Check, Copy, ExternalLink, ShieldCheck, HardDrive, Zap, Server } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const ENV_SNIPPET = `PORT=5000
CLIENT_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/statushired
JWT_SECRET=paste-a-long-random-string-here`;

export const DatabaseSetupModal = ({ isOpen, onClose }) => {
  const { isConfigured, serverStatus } = useAuth();
  const [copied, setCopied] = useState(false);

  const copyEnv = () => {
    navigator.clipboard.writeText(ENV_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <span>MongoDB & API Server Setup</span>
        </div>
      }
      description="StatusHired runs on a MERN stack: the React app talks to an Express API which stores everything in MongoDB."
      maxWidth="xl"
    >
      <div className="space-y-5 text-sm">
        {/* Status indicator */}
        <div className="p-3.5 rounded-xl border border-[#E1EBE5] dark:border-[#1D2A23] bg-slate-50 dark:bg-[#060A08]/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-medium text-slate-800 dark:text-[#E8F5EE]">
              {isConfigured
                ? 'Connected to MongoDB through the API server'
                : serverStatus?.db === 'unreachable'
                  ? 'API server not reachable (is it running on port 5000?)'
                  : 'MongoDB not connected (check MONGODB_URI)'}
            </span>
          </div>
          <Badge variant={isConfigured ? 'success' : 'warning'}>
            {isConfigured ? 'Live MongoDB' : 'Setup Required'}
          </Badge>
        </div>

        {/* Step 1: MongoDB */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-slate-900 dark:text-[#E8F5EE] flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              Get a MongoDB connection string
            </h4>
            <a
              href="https://www.mongodb.com/atlas"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium"
            >
              Open MongoDB Atlas <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <p className="font-semibold text-emerald-900 dark:text-emerald-200">Pick whichever is easiest:</p>
            <div className="space-y-2 pl-1 leading-relaxed">
              <div className="p-2.5 rounded-lg bg-white/70 dark:bg-black/30 border border-emerald-100/60 dark:border-emerald-900/40">
                <p className="font-medium text-emerald-950 dark:text-emerald-300 mb-1">A. Local MongoDB (installed on your machine)</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Use{' '}
                  <code className="bg-emerald-100 dark:bg-emerald-950 px-1 py-0.5 rounded font-mono">
                    mongodb://127.0.0.1:27017/statushired
                  </code>
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/70 dark:bg-black/30 border border-emerald-100/60 dark:border-emerald-900/40">
                <p className="font-medium text-emerald-950 dark:text-emerald-300 mb-1">B. MongoDB Atlas (free cloud cluster)</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Create a cluster &rarr; <strong>Connect</strong> &rarr; <strong>Drivers</strong> &rarr; copy the URI that looks like{' '}
                  <code className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono px-1 py-0.5 rounded font-semibold">
                    mongodb+srv://user:pass@cluster.mongodb.net/statushired
                  </code>
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white/70 dark:bg-black/30 border border-emerald-100/60 dark:border-emerald-900/40">
                <p className="font-medium text-emerald-950 dark:text-emerald-300 mb-1">C. No install at all (demo)</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Set <code className="bg-emerald-100 dark:bg-emerald-950 px-1 py-0.5 rounded font-mono">USE_MEMORY_DB=true</code> and the
                  server starts an in-memory MongoDB (data resets on restart).
                </p>
              </div>
            </div>
          </div>

          <p className="text-slate-600 dark:text-[#8AA097] text-xs">
            Copy{' '}
            <code className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#1D2A23] text-emerald-600 dark:text-emerald-400 font-mono">
              server/.env.example
            </code>{' '}
            to{' '}
            <code className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#1D2A23] text-emerald-600 dark:text-emerald-400 font-mono">
              server/.env
            </code>{' '}
            and fill in:
          </p>
          <div className="relative">
            <pre className="p-3 pr-28 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">{ENV_SNIPPET}</pre>
            <div className="absolute top-2 right-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={copyEnv}
                leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>

        {/* Step 2: Start the servers */}
        <div className="space-y-3 pt-2">
          <h4 className="font-semibold text-slate-900 dark:text-[#E8F5EE] flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
              2
            </span>
            Start the API and the React app
          </h4>
          <p className="text-slate-600 dark:text-[#8AA097] text-xs leading-relaxed">
            From the project root run <strong>npm run dev</strong> (starts both), or in two terminals:
          </p>
          <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">{`cd server && npm run dev     # API on http://localhost:5000
cd client && npm run dev     # React on http://localhost:3000`}</pre>
          <p className="text-slate-600 dark:text-[#8AA097] text-xs leading-relaxed">
            Collections (<code className="px-1 rounded bg-slate-100 dark:bg-slate-800">users</code>,{' '}
            <code className="px-1 rounded bg-slate-100 dark:bg-slate-800">applications</code>,{' '}
            <code className="px-1 rounded bg-slate-100 dark:bg-slate-800">resumes</code>,{' '}
            <code className="px-1 rounded bg-slate-100 dark:bg-slate-800">reminders</code>,{' '}
            <code className="px-1 rounded bg-slate-100 dark:bg-slate-800">stagehistories</code>) are created automatically by
            Mongoose — there is no SQL schema to run.
          </p>
        </div>

        {/* Step 3: Email (optional) */}
        <div className="space-y-2 pt-2">
          <h4 className="font-semibold text-slate-900 dark:text-[#E8F5EE] flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
              3
            </span>
            Sign-up emails (optional)
          </h4>
          <p className="text-slate-600 dark:text-[#8AA097] text-xs leading-relaxed">
            Add <strong>GMAIL_USER</strong> + <strong>GMAIL_APP_PASSWORD</strong> (or <strong>RESEND_API_KEY</strong>) to send the
            6-digit verification code by email. Without them the code is printed in the server terminal so you can still sign up
            while developing.
          </p>
        </div>

        {/* What you get */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl border border-[#E1EBE5] dark:border-[#1D2A23] bg-white dark:bg-[#060A08]/60">
            <ShieldCheck className="w-4 h-4 text-emerald-500 mb-1.5" />
            <p className="font-medium text-slate-800 dark:text-[#E8F5EE] text-xs">Per-user isolation</p>
            <p className="text-[11px] text-slate-500 dark:text-[#8AA097]">Every query is scoped to the signed-in JWT user.</p>
          </div>
          <div className="p-3 rounded-xl border border-[#E1EBE5] dark:border-[#1D2A23] bg-white dark:bg-[#060A08]/60">
            <HardDrive className="w-4 h-4 text-emerald-500 mb-1.5" />
            <p className="font-medium text-slate-800 dark:text-[#E8F5EE] text-xs">Private resume storage</p>
            <p className="text-[11px] text-slate-500 dark:text-[#8AA097]">PDFs served through short-lived signed links.</p>
          </div>
          <div className="p-3 rounded-xl border border-[#E1EBE5] dark:border-[#1D2A23] bg-white dark:bg-[#060A08]/60">
            <Zap className="w-4 h-4 text-amber-500 mb-1.5" />
            <p className="font-medium text-slate-800 dark:text-[#E8F5EE] text-xs">Realtime sync</p>
            <p className="text-[11px] text-slate-500 dark:text-[#8AA097]">Socket.io pushes changes to all your open tabs.</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-500 dark:text-[#8AA097] flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5" />
            Health endpoint: <code className="font-mono">/api/health</code>
          </span>
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
