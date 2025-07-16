# 🎵 Freesound Explorer

Ein moderner Next.js-basierter Web-Explorer für die Freesound.org API, der es Nutzern ermöglicht, Sounds zu suchen, zu filtern, zu hören und herunterzuladen.

## 🚀 Features

### ✅ Aktuelle Funktionen

#### 🔍 **Erweiterte Suchfunktionalität**
- Debounced Search mit 500ms Verzögerung
- Bis zu 150 Sounds pro Suchanfrage
- Real-time Suche mit visuellen Loading-States
- Suchvorschläge und Verlauf (persistiert)
- Auto-Complete Dropdown

#### 🎛️ **Erweiterte Filter**
- **Dauer-Filter**: Min/Max-Dauer in Sekunden
- **Tempo-Filter**: BPM-Bereich
- **Tonalität-Filter**: Musikalische Tonarten (Dur/Moll)
- Real-time Filter-Updates

#### 🎧 **Audio-Player**
- Interaktive Waveform-Visualisierung mit WaveSurfer.js
- Play/Pause-Kontrollen
- Lila-Design mit Fortschrittsanzeige

#### 👤 **Authentifizierung**
- OAuth2-Integration mit Freesound.org
- Supabase-Backend für Benutzerverwaltung
- Sichere Token-Speicherung
- Persistente Sitzungen

#### 💾 **Download-System**
- HQ-Datei-Downloads für angemeldete Nutzer
- Proxy-Downloads über Next.js API
- Sichere Token-basierte Authentifizierung

#### ❤️ **Favoriten-System**
- Sounds zu Favoriten hinzufügen/entfernen
- Persistente Speicherung im Browser
- Herz-Button in jeder Sound-Karte

#### 📱 **Responsive Design**
- Mobile-First Ansatz
- Dark Theme mit Slate-Farbschema
- Responsive Grid-Layout
- Touch-optimierte Bedienung

#### 🔄 **Pagination**
- "Mehr laden" Button (manuell)
- Auto-Scroll Funktionalität
- Infinite Scrolling mit intelligenter Erkennung

### 🛠️ Technologie-Stack

- **Framework**: Next.js 15.4.1 (App Router)
- **Sprache**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand 5.0.6 mit Persistierung
- **Audio**: WaveSurfer.js 7.10.0
- **Authentifizierung**: Supabase mit NextAuth
- **Icons**: Lucide React 0.525.0
- **Schriftarten**: Geist Sans & Geist Mono

## 📋 Installation

### Voraussetzungen
- Node.js 18+ 
- npm oder yarn
- Supabase-Projekt
- Freesound.org API-Zugang

### 1. Repository klonen
```bash
git clone <repository-url>
cd projektfreesound
```

### 2. Dependencies installieren
```bash
npm install
```

### 3. Umgebungsvariablen einrichten
Erstelle eine `.env.local` Datei:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Freesound API
NEXT_PUBLIC_FREESOUND_CLIENT_ID=your_freesound_client_id
FREESOUND_CLIENT_SECRET=your_freesound_client_secret
FREESOUND_API_KEY=your_freesound_api_key

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Supabase-Datenbank einrichten
```sql
-- Tabelle für Nutzerprofile
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT,
  freesound_id INTEGER,
  access_token TEXT,
  refresh_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- RLS aktivieren
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies erstellen
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

### 5. Entwicklungsserver starten
```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) in deinem Browser.

## 🏗️ Projektstruktur

```
src/
├── app/
│   ├── api/           # API-Routen
│   │   ├── auth/      # Authentifizierung
│   │   ├── download/  # Download-Proxy
│   │   └── search/    # Freesound-Suche
│   ├── components/    # React-Komponenten
│   │   ├── AuthButton.tsx
│   │   ├── FilterSidebar.tsx
│   │   ├── SampleCard.tsx
│   │   ├── SearchBar.tsx
│   │   └── WaveformPlayer.tsx
│   ├── layout.tsx     # Root-Layout
│   ├── page.tsx       # Hauptseite
│   └── globals.css    # Globale Styles
├── context/           # React-Context
│   └── UserProvider.tsx
├── lib/              # Utilities
│   └── supabase/     # Supabase-Clients
├── store/            # Zustand-Store
│   └── useSoundStore.ts
├── types/            # TypeScript-Typen
│   └── sound.ts
└── middleware.ts     # Next.js-Middleware
```

## 🎯 Verbesserungsvorschläge

### 🔧 Kurzfristige Verbesserungen (1-2 Wochen)

#### 1. **Performance-Optimierungen**
```typescript
// Beispiel: Memoization für SampleCard
const SampleCard = React.memo(({ sound }: { sound: Sound }) => {
  // Komponenten-Logik
});

// Virtualisierung für große Listen
import { FixedSizeList as List } from 'react-window';
```

#### 2. **Toast-Notifications**
```bash
npm install react-hot-toast
```
- Benutzer-Feedback für Aktionen
- Erfolgs-/Fehlermeldungen
- Download-Bestätigungen

#### 3. **Erweiterte Fehlerbehandlung**
- Retry-Mechanismus für API-Calls
- Offline-Erkennung
- Graceful Degradation

#### 4. **SEO & Accessibility**
- Meta-Tags für einzelne Sounds
- ARIA-Labels für Audio-Player
- Keyboard-Navigation
- Screen-Reader-Unterstützung

### 🚀 Mittelfristige Features (1-2 Monate)

#### 1. **Erweiterte Audio-Features**
```typescript
// Beispiel: Playlist-System
interface Playlist {
  id: string;
  name: string;
  sounds: SoundData[];
  created_at: Date;
}

const usePlaylistStore = create<PlaylistState>((set) => ({
  playlists: [],
  createPlaylist: (name: string) => { /* */ },
  addToPlaylist: (playlistId: string, sound: SoundData) => { /* */ }
}));
```

**Features:**
- Playlist-Erstellung und -Verwaltung
- Spectogram-Visualisierung
- Audio-Effekte (Pitch, Speed, Reverb)
- Loop-Funktionalität

#### 2. **Social Features**
- Kommentarsystem für Sounds
- Bewertungen und Reviews
- Erweiterte Nutzerprofile
- Social Media Integration

#### 3. **Erweiterte Suche**
- Tag-basierte visuelle Suche
- AI-basierte Ähnlichkeitssuche
- Erweiterte Filter (Lizenz, Dateigröße)
- Gespeicherte Suchanfragen

#### 4. **Content Management**
- Offline-Modus mit Service Worker
- Bulk-Download-Funktionalität
- Thematische Sound-Sammlungen
- Export in verschiedene Formate

### 🌟 Langfristige Visionen (3+ Monate)

#### 1. **PWA (Progressive Web App)**
```json
// manifest.json
{
  "name": "Freesound Explorer",
  "short_name": "Freesound",
  "description": "Explore and download sounds from Freesound.org",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1e293b",
  "theme_color": "#7c3aed"
}
```

#### 2. **AI-Features**
- Automatische Tag-Generierung
- Sound-Empfehlungen basierend auf Hörverhalten
- Intelligente Kategorisierung
- Voice-to-Sound-Suche

#### 3. **Analytics & Insights**
```typescript
interface AnalyticsData {
  totalDownloads: number;
  popularSounds: SoundData[];
  userActivity: UserActivity[];
  trendingTags: string[];
}
```

#### 4. **Mobile App**
- React Native Implementation
- Native Audio-Features
- Push-Benachrichtigungen
- Offline-Synchronisation

## 🎨 UI/UX Verbesserungen

### 1. **Erweiterte Visualisierung**
- 3D-Waveforms mit Three.js
- Animierte Übergänge mit Framer Motion
- Drag & Drop für Datei-Verwaltung
- Responsive Audio-Player

### 2. **Personalisierung**
- Mehrere Farbschemata
- Layout-Optionen (Grid vs. Liste)
- Anpassbare Filter-Presets
- Benutzer-Einstellungen

### 3. **Erweiterte Interaktionen**
- Keyboard-Shortcuts
- Gesture-Unterstützung
- Voice-Commands
- Haptic-Feedback (Mobile)

## 🧪 Testing

### Unit Tests
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
npm run test
```

### E2E Tests
```bash
npm install -D playwright
npm run test:e2e
```

### Performance Tests
```bash
npm install -D lighthouse
npm run lighthouse
```

## 🚀 Deployment

### Vercel (Empfohlen)
```bash
npm install -g vercel
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Performance-Ziele

- **Lighthouse Score**: 90+ in allen Kategorien
- **Core Web Vitals**: Alle grün
- **Bundle Size**: < 500KB (gzipped)
- **API Response Time**: < 500ms
- **Time to Interactive**: < 3s

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/amazing-feature`)
3. Committe deine Änderungen (`git commit -m 'Add amazing feature'`)
4. Push zum Branch (`git push origin feature/amazing-feature`)
5. Öffne eine Pull Request

## 📝 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Siehe [LICENSE](LICENSE) für Details.

## 🙏 Danksagungen

- [Freesound.org](https://freesound.org) für die umfangreiche Sound-API
- [Supabase](https://supabase.com) für die Backend-Infrastruktur
- [Next.js](https://nextjs.org) für das React-Framework
- [Tailwind CSS](https://tailwindcss.com) für das Styling
- [WaveSurfer.js](https://wavesurfer-js.org) für die Audio-Visualisierung

## 📞 Support

Bei Fragen oder Problemen:
- GitHub Issues für Bug-Reports
- Diskussionen für Feature-Requests
- E-Mail für dringende Angelegenheiten

---

**Erstellt mit ❤️ und Next.js**