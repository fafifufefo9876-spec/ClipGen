import React, { useState } from 'react';

interface PromptCardProps {
  index: number;
  text: string;
}

const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);


const PromptCard: React.FC<PromptCardProps> = ({ index, text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-5 transition-all duration-300 ease-in-out hover:border-amber-500/50 hover:shadow-amber-500/10">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-grow">
          <h3 className="font-bold text-lg text-amber-400 mb-2">Prompt {index + 1}</h3>
          <p className="text-slate-300 leading-relaxed">{text}</p>
        </div>
        <button
          onClick={handleCopy}
          className={`relative flex-shrink-0 p-2 rounded-lg transition-colors duration-200 ${
            copied
              ? 'bg-green-500/20 text-green-400'
              : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
          }`}
          aria-label="Salin Prompt"
        >
            {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
    </div>
  );
};

export default PromptCard;
