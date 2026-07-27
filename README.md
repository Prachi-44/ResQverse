# ResQVerse

ResQVerse is an offline-first emergency broadcast and safety hub built as a Progressive Web App (PWA). It is designed to work in both online cloud environments (syncing with Firebase) and offline zones (e.g., basement parking, tunnels, remote roads) where internet access is unavailable.

Built for **HACKVENTURE 2K26** by team **The_CodeCrafters** (VIT Pune).

## Key Features

- **Dual-State SOS Hub:** Categorize alerts into Medical, Accident, Security, or Fire emergencies for targeted assistance.
- **Hands-Free Voice SOS:** Continuously monitors for voice distress triggers in 7 languages (e.g., "Help", "बचाओ", "मदत") to activate emergency mode without touching the screen.
- **3-Second Countdown Buffer:** Visual/audio warning timer to cancel accidental triggers and prevent false alarms.
- **On-Device Siren:** Generates a wailing alarm directly in-browser using the Web Audio API (completely offline, 0kb download).
- **Discreet Camouflage Mode:** Disguises the UI behind a functioning Weather Dashboard to protect the user's privacy in hostile situations.
- **Cellular SMS Fallback:** Packages geolocation coordinates and user details into a pre-filled cellular SMS link for transmission over standard 2G networks when mobile data is unavailable.
- **Real-Time Guardian Feed:** Updates family/guardian dashboards reactively with live coordinates, device battery status, and GPS accuracy.

## Offline Architecture & Browser APIs

ResQVerse operates entirely client-side when connectivity is lost:
- **Satellite Geolocation:** Uses HTML5 Geolocation API (`enableHighAccuracy: true`) to fetch coordinates directly from the device's GPS chip, requiring no data network.
- **Web Audio Siren:** Synthesizes sound waves locally using oscillator nodes, meaning no external audio files are downloaded.
- **Web Speech API:** Uses local language models on the device for speech-to-text recognition.
- **SMS URI Scheme:** Opens the device's native SMS application with the pre-formatted coordinates link (`sms:<guardian>?body=...`).

## Firebase Failover Emulator

If Firebase environment variables are not configured, the app automatically switches to **Mock Failover Mode**:
- Uses a local NoSQL emulator backed by `localStorage` (`mockDb.ts`).
- Simulates Firestore's `onSnapshot` real-time listeners, keeping the live feeds and maps fully functional for local demonstration.

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4
- **Database:** Firebase Firestore (Online) / LocalStorage API (Offline Failover)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ResQVerse.git
   cd ResQVerse
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables (optional):
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
   *If these variables are omitted, the app will run using the simulated `localStorage` mock database.*

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. Build for production:
   ```bash
   npm run build
   ```

## Future Scope

- **P2P Bluetooth Mesh Relay:** Relaying emergency packets device-to-device using Web Bluetooth and WebRTC when cellular towers are down.
- **AI Voice Stress Detection:** Local TensorFlow.js integration to analyze vocal acoustics and detect panic states.
- **End-to-End Encryption:** Encrypting location coordinates on-device with the guardian's public key before database sync.
