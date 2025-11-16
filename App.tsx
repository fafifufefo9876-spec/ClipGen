import React, { useState, useCallback, useEffect } from 'react';
import { generatePrompts, translatePrompts } from './services/geminiService';
import { PromptItem, Language } from './types';
import PromptCard from './components/PromptCard';

// Icons
const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 22.5l-.648-1.938a3.375 3.375 0 00-2.685-2.685L11.25 18l1.938-.648a3.375 3.375 0 002.685-2.685L16.25 13.5l.648 1.938a3.375 3.375 0 002.685 2.685L21 18.75l-1.938.648a3.375 3.375 0 00-2.685 2.685z" />
    </svg>
);

const CopyAllIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
);
  
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
);

const App: React.FC = () => {
  const [userApiKey, setUserApiKey] = useState('');
  const [isApiKeyInputVisible, setIsApiKeyInputVisible] = useState(false);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [clipCount, setClipCount] = useState<number | string>(3);

  const [promptsIdn, setPromptsIdn] = useState<PromptItem[]>([]);
  const [promptsEng, setPromptsEng] = useState<PromptItem[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('IDN');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!category || !description || !clipCount || +clipCount < 1) {
      setError("Semua kolom wajib diisi dan jumlah klip harus minimal 1.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPromptsIdn([]);
    setPromptsEng([]);

    try {
      const generatedPrompts = await generatePrompts(category, description, +clipCount, userApiKey);
      setPromptsIdn(generatedPrompts);
      setCurrentLanguage('IDN');

      // Translate in the background
      translatePrompts(generatedPrompts, userApiKey).then(setPromptsEng).catch(err => {
        console.error("Translation failed in background:", err);
        // Optionally, handle background translation failure, though the UI can proceed with IDN prompts.
      });

    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan yang tidak diketahui.");
    } finally {
      setIsLoading(false);
    }
  }, [category, description, clipCount, userApiKey]);

  const handleCopyAll = () => {
    const promptsToCopy = currentLanguage === 'IDN' ? promptsIdn : promptsEng;
    const formattedText = promptsToCopy
      .map((item, index) => `Prompt ${index + 1}\n${item.prompt}`)
      .join('\n\n');
    
    navigator.clipboard.writeText(formattedText);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };
  
  const displayedPrompts = currentLanguage === 'IDN' ? promptsIdn : promptsEng;

  return (
    <div className="min-h-screen bg-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto relative z-10">

        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 pb-2">
            VIDEO CLIP PROMPT GENERATOR
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
            Hasilkan rangkaian prompt klip video yang saling terhubung secara mulus untuk proyek video AI Anda.
          </p>
        </header>

        <main>
            <div className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 shadow-xl mb-8 backdrop-blur-sm h-24 flex items-center transition-all duration-300 ease-in-out">
                <div className="w-full flex items-center gap-4">
                    <button
                        onClick={() => setIsApiKeyInputVisible(!isApiKeyInputVisible)}
                        className="flex-shrink-0 p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-500 transition-all"
                        aria-label="Atur API Key"
                        aria-expanded={isApiKeyInputVisible}
                    >
                        <KeyIcon className="w-6 h-6" />
                    </button>
                    <div className={`flex-grow transition-opacity duration-300 ease-in-out ${isApiKeyInputVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                        <div className="min-w-[200px]">
                            <label htmlFor="apiKey" className="block text-sm font-medium text-amber-400 mb-2 sr-only">
                                Google AI Studio API Key (Opsional)
                            </label>
                            <input
                                type="password"
                                id="apiKey"
                                value={userApiKey}
                                onChange={(e) => setUserApiKey(e.target.value)}
                                disabled={isLoading}
                                placeholder="Masukkan Google AI Studio API Key"
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:opacity-50"
                            />
                        </div>
                    </div>
                </div>
            </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
            <div className="space-y-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-amber-400 mb-2">
                  KATEGORI<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isLoading}
                  placeholder="Contoh: Fiksi Ilmiah, Petualangan Alam"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:opacity-50"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-amber-400 mb-2">
                  DESKRIPSI UTAMA<span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  placeholder="Contoh: Astronot menjelajahi reruntuhan kuno di planet Mars yang misterius."
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:opacity-50 resize-y"
                />
              </div>

              <div>
                <label htmlFor="clipCount" className="block text-sm font-medium text-amber-400 mb-2">
                  JUMLAH KLIP<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="clipCount"
                  value={clipCount}
                  onChange={(e) => setClipCount(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10)))}
                  min="1"
                  disabled={isLoading}
                  placeholder="Contoh: 5"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:opacity-50"
                />
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-amber-500 text-slate-900 font-bold py-3 px-6 rounded-lg hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500 focus:ring-opacity-50 transition-all duration-300 disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 26 20">
                        <defs>
                            <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="rgba(252, 211, 77, 0.1)" />
                                <stop offset="100%" stopColor="#f59e0b" />
                            </linearGradient>
                        </defs>
                        <path 
                            d="M3 10C3 14.4183 7.47715 18 13 18C18.5228 18 23 14.4183 23 10C23 5.58172 18.5228 2 13 2C9.23234 2 5.92055 4.14557 4.02492 7" 
                            stroke="url(#spinner-gradient)" 
                            strokeWidth="4" 
                            strokeLinecap="round" 
                            fill="none"
                        />
                    </svg>
                    <span className="animate-text-gradient">Menghasilkan Prompt...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5"/>
                    <span>Generate Prompt</span>
                  </>
                )}
              </button>
            </div>
            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
          </div>

          {promptsIdn.length > 0 && (
            <div className="mt-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-100">Hasil Prompt</h2>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleCopyAll}
                        className={`text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                            allCopied
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                        }`}
                    >
                        {allCopied ? (
                            <>
                                <CheckIcon className="w-5 h-5" />
                                <span>Tersalin!</span>
                            </>
                        ) : (
                            <>
                                <CopyAllIcon className="w-5 h-5" />
                                <span>Copy All</span>
                            </>
                        )}
                    </button>
                    <div className="bg-slate-700 p-1 rounded-lg flex">
                        <button onClick={() => setCurrentLanguage('IDN')} className={`px-3 py-1 text-sm rounded-md transition-colors ${currentLanguage === 'IDN' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300'}`}>IDN</button>
                        <button onClick={() => setCurrentLanguage('ENG')} className={`px-3 py-1 text-sm rounded-md transition-colors ${currentLanguage === 'ENG' ? 'bg-amber-500 text-slate-900 font-bold' : 'text-slate-300'}`}>ENG</button>
                    </div>
                </div>
              </div>
              <div className="space-y-4">
                {displayedPrompts.length > 0 ? displayedPrompts.map((item, index) => (
                  <PromptCard key={index} index={index} text={item.prompt} />
                )) : (
                    // Show placeholders while translating
                    Array.from({ length: +clipCount }).map((_, index) => (
                        <div key={index} className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-5 animate-pulse">
                            <div className="h-4 bg-slate-700 rounded w-1/4 mb-4"></div>
                            <div className="h-3 bg-slate-700 rounded w-full mb-2"></div>
                            <div className="h-3 bg-slate-700 rounded w-5/6"></div>
                        </div>
                    ))
                )}
              </div>
            </div>
          )}
        </main>
        
        <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>&copy; 2025 Isa Rahmat Sobirin. All rights reserved</p>
        </footer>

      </div>
    </div>
  );
};

export default App;
