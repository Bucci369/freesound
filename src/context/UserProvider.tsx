'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '../lib/supabase/client';
import { type User } from '@supabase/supabase-js';

// Definieren des Kontexts, der den Benutzer und einen Ladezustand enthält
type UserContextType = {
  user: User | null;
  loading: boolean;
};

// Erstellen des Kontexts mit einem Standardwert
export const UserContext = createContext<UserContextType | undefined>(undefined);

// Erstellen der Provider-Komponente
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // onAuthStateChange feuert sofort mit dem aktuellen Status
    // und lauscht dann auf zukünftige Änderungen. Dies behandelt den
    // initialen Ladevorgang und Echtzeit-Updates.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth-Ereignis: ${event}`); // Zum Debuggen hinzugefügt
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []); // Leeres Abhängigkeits-Array stellt sicher, dass dies nur einmal ausgeführt wird

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};

// Ein benutzerdefinierter Hook, um den Kontext einfacher zu verwenden
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
