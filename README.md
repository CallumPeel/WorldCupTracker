# npm run dev -- --host

# FIFA World Cup 2026 Tracker

A premium, iPad-first Progressive Web App for tracking the 2026 FIFA World Cup with **NO SPOILERS**.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Features

### Core Principle: NO SPOILERS
- **Only shows scores YOU enter** - never imports real-world results
- Fixtures, teams, dates, and venues are imported automatically
- All scores, standings, and brackets are calculated from your manual entries only

### Match Tracking
- 📅 **Complete Fixture Schedule** in Australia/Perth timezone (AWST)
- ⏱️ **Live Countdown Timers** to each match
- 👁️ **Mark Matches as Watched** for easy tracking
- ⚽ **Manual Score Entry** with beautiful, touch-friendly interface
- 🔔 **Match Reminders** with browser notifications

### Tournament Features
- 📊 **Group Standings Tables** calculated from your scores
- 🏆 **Knockout Bracket Generator** based on your entered results
- 📈 **Tournament Progress Tracking**
- 🎯 **Filter by Stage** (Group Stage, Knockouts, etc.)

### Data Management
- 💾 **Import/Export** your data as JSON
- 🔄 **Update Fixtures** without affecting entered scores
- 📱 **Offline Support** - works without internet
- ☁️ **PWA Installation** - install on iPad like a native app

### Design
- 🎨 **Premium Dark Mode** - Apple Sports inspired
- 📱 **iPad-First Design** - optimized for large touch screens
- ✨ **Smooth Animations** - Framer Motion powered
- 🎯 **Touch-Friendly** - 44pt minimum tap targets
- 🚀 **Blazing Fast** - React + Vite

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/CallumPeel/WorldCupTracker.git
cd WorldCupTracker
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## 🌐 Deploy for Free on Vercel

This app is ready to deploy on Vercel's free Hobby plan.

### One-time setup

1. Push this repository to GitHub.
2. Open your [Vercel dashboard](https://vercel.com/dashboard).
3. Click **Add New → Project**.
4. Import `CallumPeel/WorldCupTracker` from GitHub.
5. Confirm the project settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Click **Deploy**.

The included `vercel.json` file configures Vercel to serve React Router routes such as `/schedule`, `/groups`, and `/knockout` correctly.

After the first deployment, Vercel will automatically redeploy the app whenever you push changes to the connected branch.

## 📱 Installing as PWA

### On iPad (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will now work like a native app with offline support

## 🏗️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **IndexedDB (idb)** - Local data storage
- **date-fns** - Date manipulation
- **Vite PWA Plugin** - Progressive Web App features

## 📁 Project Structure

```
WorldCupTracker/
├── public/
│   └── fixtures.json          # Static fixture data (no spoilers)
├── src/
│   ├── api/                   # API and data management
│   │   ├── fixtures.ts        # Fixture fetching with sanitization
│   │   └── userdata.ts        # IndexedDB operations
│   ├── components/            # Reusable UI components
│   │   ├── BottomNav.tsx
│   │   ├── CountdownTimer.tsx
│   │   ├── GroupTable.tsx
│   │   ├── MatchCard.tsx
│   │   └── ScoreEntry.tsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── useCountdown.ts
│   │   ├── useFixtures.ts
│   │   └── useUserData.ts
│   ├── pages/                 # Page components
│   │   ├── Schedule.tsx
│   │   ├── Groups.tsx
│   │   ├── Knockout.tsx
│   │   └── More.tsx
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/                 # Utility functions
│   │   ├── bracketGenerator.ts
│   │   ├── groupCalculator.ts
│   │   ├── notifications.ts
│   │   └── timezone.ts
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── index.html
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## 🔧 Configuration

### Timezone
The app displays all match times in **Australia/Perth timezone (AWST, UTC+8)**. To change this, edit `src/utils/timezone.ts`:

```typescript
const PERTH_TIMEZONE = 'Australia/Perth'; // Change this
```

### Fixture Data Source
By default, fixtures are loaded from `public/fixtures.json`. To integrate with an external API, modify `src/api/fixtures.ts`:

```typescript
export async function fetchFixtures(): Promise<Fixture[]> {
  // Replace with your API endpoint
  const response = await fetch('YOUR_API_URL');
  const data = await response.json();
  return data.map(sanitizeApiFixture);
}
```

**IMPORTANT**: The `sanitizeApiFixture` function ensures no spoiler data (scores, results, standings) is imported.

## 🎯 Usage

### Adding Match Scores
1. Navigate to the Schedule page
2. Click on any match card
3. Enter the score in the modal
4. Scores are saved locally and used for standings/bracket calculations

### Viewing Group Standings
1. Go to the Groups tab
2. Tables show standings calculated from YOUR entered scores only
3. Top 2 teams from each group are highlighted

### Knockout Bracket
1. Navigate to the Knockout tab
2. Bracket is automatically generated based on group stage results you've entered
3. Winner is displayed when the tournament is complete

### Data Backup
1. Go to More tab
2. Tap "Export Data" to save a JSON backup
3. Use "Import Data" to restore from a backup

## 🛡️ Anti-Spoiler Protection

This app implements multiple layers of spoiler protection:

1. **API Sanitization**: The `sanitizeApiFixture` function in `src/api/fixtures.ts` strips all result data from external sources
2. **Local-Only Scores**: All scores are stored in IndexedDB on your device only
3. **No External Results**: The app never fetches live scores or results
4. **Offline-First**: Works completely offline after initial load

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👏 Acknowledgments

- Design inspired by Apple Sports
- Built for World Cup fans who want to watch matches spoiler-free
- Optimized for iPad viewing experience

## 📧 Contact

Callum Peel - [GitHub](https://github.com/CallumPeel)

---

**Enjoy tracking the 2026 FIFA World Cup! ⚽🏆**
