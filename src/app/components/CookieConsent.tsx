'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CookieConsent = () => {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Prüft beim Laden der Komponente, ob die Zustimmung bereits gegeben wurde.
    const consent = localStorage.getItem('cookie_consent');
    if (consent !== 'given') {
      setShowConsent(true);
    }
  }, []);

  const acceptConsent = () => {
    setShowConsent(false);
    // Speichert die Zustimmung im lokalen Speicher, damit der Banner nicht erneut erscheint.
    localStorage.setItem('cookie_consent', 'given');
  };

  if (!showConsent) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 sm:px-8 pb-4">
         <div className="bg-slate-800/80 backdrop-blur-lg border border-slate-700 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
            <p className="text-sm text-slate-300 flex-grow">
                Wir verwenden Cookies, um die wesentliche Anmeldefunktionalität über Supabase zu ermöglichen. 
                Durch die Nutzung der Seite stimmst du der Verwendung dieser notwendigen Cookies zu.
            </p>
            <div className="flex-shrink-0">
                <button
                onClick={acceptConsent}
                className="bg-purple-600 text-white font-semibold py-2 px-6 rounded-full shadow-md hover:bg-purple-700 transition-colors duration-200"
                >
                Verstanden
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
