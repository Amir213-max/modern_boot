
import React, { useState, useEffect } from 'react';
import BotInterface from './components/BotInterface';
import RatingModal from './components/RatingModal';
import ModernSoftLanding from './components/ModernSoftLanding';
import AdminDashboard from './components/AdminDashboard';
import { AppMode, ChatLog } from './types';
import { db } from './services/db';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.LANDING);
  const [showRating, setShowRating] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
    } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // --- ABANDONED SESSION RECOVERY LOGIC ---
    // Check if there was a session closed without "Ending"
    const recoverAbandonedSession = async () => {
        const abandonedSession = localStorage.getItem('est_autosave_session');
        if (abandonedSession) {
            try {
                const data = JSON.parse(abandonedSession);
                // Only save if it has meaningful content (more than just the welcome message)
                if (data.messages && data.messages.length > 1) {
                    console.log("Recovering abandoned session...");
                    const fullLog: ChatLog = {
                        id: data.id,
                        timestamp: data.timestamp,
                        duration: (Date.now() - data.timestamp) / 1000,
                        userQuery: data.messages.map((m: any) => {
                            const role = m.role === 'user' ? '👤 العميل' : '🤖 E-stock Bot';
                            const imgTag = m.image ? ' [مرفق صورة]' : '';
                            return `${role}: ${m.text}${imgTag}`;
                        }).join('\n\n'),
                        botResponse: "جلسة غير مكتملة (تم الاسترداد تلقائياً)",
                        clientName: "زائر (جلسة مستعادة)"
                    };
                    
                    await db.addLog(fullLog);
                    console.log("Abandoned session saved to DB.");
                }
            } catch (e) {
                console.error("Error recovering session", e);
            }
            // Clean up
            localStorage.removeItem('est_autosave_session');
        }
    };
    recoverAbandonedSession();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const toggleTheme = () => {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      if (newMode) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
      } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
      }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User ${outcome} the install prompt`);
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleSessionEnd = (logId: string) => {
    setShowRating(logId);
  };

  const handleRatingClose = () => {
    setShowRating(null);
    setMode(AppMode.LANDING);
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-gray-50 dark:bg-gray-900 font-sans overflow-hidden transition-colors duration-300" dir="rtl">
      
      {/* LANDING PAGE MODE */}
      {mode === AppMode.LANDING && (
          <div className="h-full w-full overflow-y-auto overflow-x-hidden">
             <ModernSoftLanding 
                onOpenChat={() => setMode(AppMode.CLIENT)} 
                isDarkMode={isDarkMode}
                toggleTheme={toggleTheme}
             />
          </div>
      )}

      {/* CLIENT (CHAT) MODE */}
      {mode === AppMode.CLIENT && (
        <div className="h-full flex flex-col animate-in slide-in-from-bottom-4 duration-300">
           {/* Navbar specific to Chat App */}
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm z-40 select-none flex-shrink-0 transition-colors">
                <div className="max-w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-14 sm:h-16 items-center">
                    <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="flex-shrink-0 flex items-center justify-center bg-white dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-600 w-9 h-9 sm:w-10 sm:h-10">
                        {/* Chat Nav Icon */}
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full p-1">
                            <rect width='100' height='100' rx='20' fill='#F7941D'/>
                            <path d='M20 30 Q 50 15 80 30 V 75 Q 50 90 20 75 Z' fill='white' opacity='0.2'/>
                            <text x='50' y='65' fontSize='45' fontWeight='bold' fontFamily='serif' textAnchor='middle' fill='white'>MS</text>
                        </svg>
                    </div>
                    <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">E-stock chat <span className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-normal bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full border border-blue-100 dark:border-blue-800 hidden sm:inline-block">دعم فني</span></h1>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {isInstallable && (
                            <button
                                onClick={handleInstallClick}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold shadow-md hover:bg-blue-700 transition flex items-center gap-2 animate-pulse"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 9.75V1.5m0 0l3 3m-3-3l-3 3" transform="rotate(180 12 12)" />
                                </svg>
                                <span className="hidden sm:inline">تثبيت البرنامج</span>
                                <span className="sm:hidden">تثبيت</span>
                            </button>
                        )}
                    </div>
                </div>
                </div>
            </nav>

            <main className="flex-1 relative overflow-hidden p-0 sm:p-4 md:p-6 bg-gray-50 dark:bg-gray-900 transition-colors">
                <div className="h-full max-w-5xl mx-auto flex flex-col">
                    <div className="flex-1 relative flex flex-col min-h-0">
                        <BotInterface 
                            onSessionEnd={handleSessionEnd} 
                            onAdminClick={() => setMode(AppMode.ADMIN)} 
                            onBack={() => setMode(AppMode.LANDING)}
                            isDarkMode={isDarkMode}
                            toggleTheme={toggleTheme}
                        />
                    </div>
                    <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-1 sm:mt-2 py-1 flex-shrink-0 flex justify-between items-center px-4 select-none bg-gray-50 dark:bg-gray-900 sm:bg-transparent">
                        <span>مدعوم بواسطة Gemini 2.5 Flash</span>
                    </div>
                </div>
            </main>
        </div>
      )}

      {/* ADMIN MODE */}
      {mode === AppMode.ADMIN && (
          <div className="h-full w-full bg-gray-50 dark:bg-gray-900 p-0 sm:p-4 md:p-6 overflow-hidden transition-colors">
             <div className="h-full max-w-6xl mx-auto relative animate-in fade-in slide-in-from-bottom-4 flex flex-col min-h-0">
                <button 
                    onClick={() => setMode(AppMode.CLIENT)}
                    className="absolute top-4 left-4 z-50 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-600 dark:text-white p-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-600 transition-all hover:scale-105"
                    title="عودة للمحادثة"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <AdminDashboard isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
             </div>
          </div>
      )}

      {/* Modals */}
      {showRating && (
        <RatingModal 
          chatId={showRating} 
          onClose={handleRatingClose} 
        />
      )}
    </div>
  );
};

export default App;
