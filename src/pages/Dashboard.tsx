import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/Button';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  Flame, 
  X,
  HeartPulse,
  Car,
  Shield,
  Battery,
  Wifi,
  Zap,
  CheckCircle2,
  Mic,
  MicOff,
  Volume2,
  Eye,
  Send
} from 'lucide-react';

type EmergencyCategory = 'Medical' | 'Accident' | 'Security' | 'Fire';

// Local Translations for Women's Safety & Offline features
const localTranslations: Record<string, Record<string, string>> = {
  en: {
    womensSuite: "Women's Safety & Offline Suite",
    sirenActive: "🚨 STOP SIREN",
    sirenStandby: "🔊 Loud Panic Siren",
    discreetActive: "👁️ Discreet Screen Mask",
    offlineSmsActive: "📲 Dispatch Backup SMS",
    exitMaskBtn: "Return to Command Center",
    weatherHeadline: "Local Weather & News Forecast",
    temp: "24°C - Clear Skies",
    news: "System network operational. All nodes synced. No active threats reported in regional sector."
  },
  de: {
    womensSuite: "Frauensicherheit & Offline-Hilfe",
    sirenActive: "🚨 SIRENE STOPPEN",
    sirenStandby: "🔊 Laute Paniksirene",
    discreetActive: "👁️ Tarnbildschirm aktivieren",
    offlineSmsActive: "📲 Backup-SMS senden",
    exitMaskBtn: "Zurück zur Zentrale",
    weatherHeadline: "Wetter & Nachrichten",
    temp: "24°C - Klarer Himmel",
    news: "Systemnetzwerk betriebsbereit. Keine Bedrohungen im Sektor gemeldet."
  },
  es: {
    womensSuite: "Seguridad de la Mujer & Offline",
    sirenActive: "🚨 DETENER SIRENA",
    sirenStandby: "🔊 Sirena de Pánico",
    discreetActive: "👁️ Pantalla Discreta",
    offlineSmsActive: "📲 Enviar SMS de Respaldo",
    exitMaskBtn: "Volver al Panel",
    weatherHeadline: "Clima Local & Noticias",
    temp: "24°C - Despejado",
    news: "Red del sistema operativa. Todos los nodos sincronizados. Sin amenazas en el sector."
  },
  fr: {
    womensSuite: "Sécurité des Femmes & Hors-ligne",
    sirenActive: "🚨 ARRÊTER LA SIRÈNE",
    sirenStandby: "🔊 Sirène de Panique",
    discreetActive: "👁️ Écran de Masquage",
    offlineSmsActive: "📲 Envoyer SMS de Secours",
    exitMaskBtn: "Retour au Centre de Contrôle",
    weatherHeadline: "Météo Locale & Actualités",
    temp: "24°C - Ciel Dégagé",
    news: "Réseau opérationnel. Tous les nœuds synchronisés. Aucune menace signalée dans le secteur."
  },
  hi: {
    womensSuite: "महिला सुरक्षा और ऑफलाइन उपकरण",
    sirenActive: "🚨 सायरन बंद करें",
    sirenStandby: "🔊 तेज सायरन बजाएं",
    discreetActive: "👁️ गुप्त स्क्रीन मास्क",
    offlineSmsActive: "📲 ऑफलाइन एसएमएस भेजें",
    exitMaskBtn: "कंट्रोल सेंटर पर वापस जाएं",
    weatherHeadline: "स्थानीय मौसम और समाचार",
    temp: "24°C - साफ आसमान",
    news: "सिस्टम नेटवर्क ठीक से काम कर रहा है। क्षेत्रीय क्षेत्र में कोई आपातकाल दर्ज नहीं है।"
  },
  mr: {
    womensSuite: "महिला सुरक्षा आणि ऑफलाइन सहाय्य",
    sirenActive: "🚨 सायरन बंद करा",
    sirenStandby: "🔊 मोठा सायरन अलार्म",
    discreetActive: "👁️ गुपित स्क्रीन मास्क",
    offlineSmsActive: "📲 ऑफलाइन एसएमएस पाठवा",
    exitMaskBtn: "डॅशबोर्डवर परत जा",
    weatherHeadline: "स्थानिक हवामान आणि बातम्या",
    temp: "२४°C - निरभ्र आकाश",
    news: "सिस्टम नेटवर्क सुरळीत सुरू आहे. या भागात सध्या कोणतीही सुरक्षा अडचण नाही."
  },
  ta: {
    womensSuite: "பெண்கள் பாதுகாப்பு & ஆஃப்லைன் தொகுப்பு",
    sirenActive: "🚨 சைரனை நிறுத்து",
    sirenStandby: "🔊 உரத்த அலாரம் சைரன்",
    discreetActive: "👁️ ரகசிய திரைக்கவசம்",
    offlineSmsActive: "📲 ஆஃப்லைன் எஸ்எம்எஸ் அனுப்பு",
    exitMaskBtn: "டாஷ்போர்டுக்கு திரும்பு",
    weatherHeadline: "வானிலை & செய்திகள்",
    temp: "24°C - தெளிவான வானம்",
    news: "கணினி நெட்வொர்க் சரியாக உள்ளது. இந்த பகுதியில் எந்த எச்சரிக்கையும் இல்லை."
  }
};

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { activeEmergency, triggerSOS, markSafe, fetchUserHistory, userHistory } = useEmergency();
  const { showToast } = useToast();
  const { t, currentLanguage } = useLanguage();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory>('Medical');
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [loadingAction, setLoadingAction] = useState(false);

  // Diagnostics & Network State
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Voice SOS Trigger State
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  // Siren Audio API State
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [oscillators, setOscillators] = useState<any[]>([]);

  // Discreet Screen Mask state
  const [isMasked, setIsMasked] = useState(false);

  // Sync history and monitor network connection
  useEffect(() => {
    fetchUserHistory();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser]);

  // Read browser battery if supported
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        const handleLevelChange = () => {
          setBatteryLevel(Math.round(battery.level * 100));
        };
        battery.addEventListener('levelchange', handleLevelChange);
        return () => battery.removeEventListener('levelchange', handleLevelChange);
      });
    }
  }, []);

  // Web Speech Recognition Initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      
      const langMapping: Record<string, string> = {
        en: 'en-US',
        de: 'de-DE',
        es: 'es-ES',
        fr: 'fr-FR',
        hi: 'hi-IN',
        mr: 'mr-IN',
        ta: 'ta-IN'
      };
      
      rec.lang = langMapping[currentLanguage] || 'en-US';

      rec.onresult = (event: any) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript.toLowerCase().trim();
        console.log("Speech SOS detected:", text);
        
        // Multi-language distress keyword triggers
        const distressKeywords = [
          'help', 'emergency', 'rescue', 'danger', // English
          'बचाओ', 'मदद', 'आपातकाल', // Hindi
          'मदत', 'वाचवा', // Marathi
          'காப்பாத்துங்க', 'உதவி', // Tamil
          'hilfe', 'retten', 'notfall', 'gefahr', // German
          'aider', 'secours', 'sauver', // French
          'ayuda', 'auxilio', 'socorro', 'peligro' // Spanish
        ];

        const match = distressKeywords.some(keyword => text.includes(keyword));
        if (match) {
          showToast(`Voice Trigger Detected: "${text}"`, 'success');
          setIsCountingDown(true);
          setCountdown(3);
        }
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition error:", e);
        if (e.error === 'not-allowed') {
          showToast("Microphone access denied. Grant browser permissions for Voice SOS.", "error");
          setIsListening(false);
        }
      };

      rec.onend = () => {
        if (isListening) {
          try {
            rec.start();
          } catch (err) {
            console.log(err);
          }
        }
      };

      setRecognition(rec);
    }
  }, [currentLanguage, isListening]);

  // Clean up Speech Recognition on unmount
  useEffect(() => {
    return () => {
      if (recognition && isListening) {
        recognition.stop();
      }
    };
  }, [recognition, isListening]);

  // Clean up Audio Siren on unmount
  useEffect(() => {
    return () => {
      oscillators.forEach(osc => {
        try {
          osc.stop();
        } catch (e) {}
      });
    };
  }, [oscillators]);

  // Toggle Voice Recognition
  const toggleListening = () => {
    if (!recognition) {
      showToast(t('voiceNotSupported'), 'error');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      showToast('Voice SOS trigger deactivated.', 'info');
    } else {
      try {
        recognition.start();
        setIsListening(true);
        showToast('Microphone active. Shouting "Help", "बचाओ", "मदत" or "Hilfe" will trigger SOS.', 'success');
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Web Audio API Siren toggle
  const toggleSiren = () => {
    if (isSirenActive) {
      oscillators.forEach(osc => {
        try {
          osc.stop();
        } catch(e){}
      });
      setOscillators([]);
      setIsSirenActive(false);
      if (audioCtx) {
        try {
          audioCtx.close();
        } catch (e) {}
        setAudioCtx(null);
      }
      showToast('Siren Alarm Deactivated.', 'info');
    } else {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Setup primary oscillator (sawtooth wave for harsh alarm sound)
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, ctx.currentTime);

        // Setup LFO (frequency modulator to sweep tone up and down like a real siren)
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(2.5, ctx.currentTime); // sweep cycle of 2.5Hz

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(320, ctx.currentTime); // sweep frequency ±320Hz

        // Setup master gain (volume control)
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.7, ctx.currentTime);

        // Connections
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        osc.connect(masterGain);
        masterGain.connect(ctx.destination);

        // Start Oscillators
        lfo.start();
        osc.start();

        setAudioCtx(ctx);
        setOscillators([osc, lfo]);
        setIsSirenActive(true);
        showToast('🔊 PANIC SIREN ACTIVATED. Seeking attention immediately!', 'warning');
      } catch (err) {
        console.error(err);
        showToast('Web Audio Context not supported on this device.', 'error');
      }
    }
  };

  // Countdown timer logic
  useEffect(() => {
    let timer: any;
    if (isCountingDown && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (isCountingDown && countdown === 0) {
      handleFinalTrigger();
    }
    return () => clearTimeout(timer);
  }, [isCountingDown, countdown]);

  const handleSOSClick = () => {
    if (activeEmergency) {
      showToast('Emergency SOS is already broadcasted! Active tracking is online.', 'warning');
      return;
    }
    setIsCountingDown(true);
    setCountdown(3);
    showToast(`SOS Countdown initiated: Category [${selectedCategory}]. Preparing Geolocation packets...`, 'info');
  };

  const handleCancelCountdown = () => {
    setIsCountingDown(false);
    setCountdown(3);
    showToast('SOS broadcast canceled.', 'info');
  };

  const handleFinalTrigger = async () => {
    setIsCountingDown(false);
    setLoadingAction(true);
    try {
      showToast('Acquiring high-precision GPS coordinates...', 'info');
      await triggerSOS(selectedCategory);
      showToast(`${selectedCategory} SOS Alert successfully broadcasted across Guardian Mesh!`, 'success');
      navigate('/sos-success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error triggering SOS alert.', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleResolveEmergency = async () => {
    if (!activeEmergency) return;
    setLoadingAction(true);
    try {
      await markSafe(activeEmergency.emergencyId);
      showToast('You have marked yourself as SAFE. Broadcast ended.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Error marking safe.', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  // Category Configuration
  const categoryConfigs = {
    Medical: {
      label: 'Medical',
      icon: HeartPulse,
      colorClass: 'text-sky-500 bg-sky-500/10 border-sky-500/25',
      activeColor: 'from-sky-500 to-cyan-600 shadow-[0_10px_35px_rgba(14,165,233,0.35)]',
      checklist: [
        'Keep the casualty warm and calm.',
        'Do not move the injured person unless in immediate danger.',
        'Clear the airway and monitor breathing continuously.',
        'Locate and prepare physical medical cards/ID tags.'
      ]
    },
    Accident: {
      label: 'Accident',
      icon: Car,
      colorClass: 'text-yellow-650 bg-yellow-500/10 border-yellow-500/25',
      activeColor: 'from-yellow-500 to-orange-600 shadow-[0_10px_35px_rgba(249,115,22,0.35)]',
      checklist: [
        'Check yourself and passengers for immediate trauma.',
        'Turn on vehicle warning hazards and emergency flashers.',
        'Move to a safe roadside shoulder or protection barrier.',
        'Watch for oncoming vehicles and avoid walking on active lanes.'
      ]
    },
    Security: {
      label: 'Security',
      icon: Shield,
      colorClass: 'text-red-500 bg-red-500/10 border-red-500/25',
      activeColor: 'from-red-500 to-rose-600 shadow-[0_10px_35px_rgba(239,68,68,0.35)]',
      checklist: [
        'Evacuate or retreat to a locked, reinforced, or secure room.',
        'Silence your cellular device and reduce screen brightness to zero.',
        'Remain hidden; do not confront the hostile presence directly.',
        'Listen for footsteps, voices, or signs of emergency responders.'
      ]
    },
    Fire: {
      label: 'Fire',
      icon: Flame,
      colorClass: 'text-orange-500 bg-orange-500/10 border-orange-500/25',
      activeColor: 'from-orange-500 to-red-650 shadow-[0_10px_35px_rgba(249,115,22,0.35)]',
      checklist: [
        'Stay low to the floor to escape toxic smoke inhalation.',
        'Feel doors for heat using the back of your hand before opening.',
        'Cover nose and mouth with a damp cloth if available.',
        'Evacuate immediately; do not stop to collect personal belongings.'
      ]
    }
  };

  const selectedConfig = categoryConfigs[selectedCategory];
  const latestHistoryRecord = userHistory[0] || null;

  // Offline SMS Href builder
  const primaryPhone = currentUser?.contacts?.[0]?.phone || '';
  const smsBodyText = `RESQVERSE EMERGENCY ALERT!\nGuardian: ${currentUser?.name}\nDistress: ${selectedCategory}\nLocation: https://www.google.com/maps?q=${activeEmergency?.latitude || 0},${activeEmergency?.longitude || 0}`;
  const smsLink = primaryPhone 
    ? `sms:${primaryPhone}?body=${encodeURIComponent(smsBodyText)}` 
    : '#';

  // Render Discreet Screen Mask
  if (isMasked) {
    const maskText = localTranslations[currentLanguage] || localTranslations['en'];
    return (
      <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300 flex items-center justify-center font-sans">
        <div className="w-full max-w-md glass-panel p-6 sm:p-8 rounded-3xl text-center space-y-6">
          
          <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-805">
            <span className="font-bold text-sm tracking-wider text-slate-500 dark:text-slate-400">
              {maskText.weatherHeadline}
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
          </div>

          <div className="py-6 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-sky-500/10 flex items-center justify-center mb-4 border border-sky-500/20">
              <span className="text-4xl">☀️</span>
            </div>
            <h3 className="text-4xl font-extrabold text-slate-800 dark:text-white">
              {maskText.temp}
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 text-left text-xs leading-relaxed text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-850">
            <strong className="block mb-1 text-slate-700 dark:text-slate-300">System News:</strong>
            {maskText.news}
          </div>

          <Button 
            variant="glass" 
            fullWidth 
            onClick={() => setIsMasked(false)}
            className="border-slate-300 dark:border-slate-800 text-xs font-black text-slate-500 hover:text-slate-800 dark:hover:text-white"
          >
            {maskText.exitMaskBtn}
          </Button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 guardian-mesh-bg text-slate-800 dark:text-white transition-colors duration-300 relative">
      
      {/* SOS Countdown Overlay */}
      {isCountingDown && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-50 flex flex-col items-center justify-center text-center p-4">
          <div className="w-48 h-48 rounded-full bg-sky-500/10 border-4 border-sky-500 animate-ping absolute"></div>
          <div className="glass-panel p-8 rounded-3xl max-w-sm border-sky-500/30 flex flex-col items-center relative z-10 animate-float">
            <ShieldAlert className="w-16 h-16 text-sky-500 animate-pulse-fast mb-4 text-glow" />
            <h3 className="text-2xl font-black uppercase mb-1 text-slate-900 dark:text-white">{t('countdownOverlay')}</h3>
            <p className="text-xs text-sky-600 dark:text-sky-300 font-bold mb-6 uppercase">{t('countdownSub')}</p>
            
            {/* Number counter */}
            <div className="text-7xl font-black text-slate-800 dark:text-white text-glow mb-8 animate-pulse-fast">
              {countdown}
            </div>

            <Button 
              variant="glass" 
              onClick={handleCancelCountdown} 
              className="px-8 border-sky-500/40 text-sky-600 dark:text-sky-300 hover:text-sky-500"
            >
              <X className="w-4 h-4 mr-2" />
              {t('cancelDispatch')}
            </Button>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Segment: Welcome & Overall Status Banner */}
        <div className="glass-panel p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-left">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {t('commandCenter')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('welcome')}, <span className="font-mono text-sky-600 dark:text-sky-400 bg-sky-500/5 px-2 py-0.5 rounded border border-sky-500/10 font-bold">{currentUser?.name}</span> (ID: {currentUser?.uid.substring(0, 10)}...)
            </p>
          </div>
          
          {activeEmergency ? (
            <div className="glass-panel-danger px-4 py-2 rounded-xl flex items-center gap-2 animate-pulse-slow">
              <ShieldAlert className="w-5 h-5 text-red-500 text-glow-danger" />
              <div className="text-left">
                <p className="text-[10px] text-red-400 font-extrabold uppercase leading-none">{t('nodeStatus')}</p>
                <p className="text-sm font-black text-red-500 leading-tight">{t('activeEmergency')}</p>
              </div>
            </div>
          ) : (
            <div className="glass-panel-success px-4 py-2 rounded-xl flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-550" />
              <div className="text-left">
                <p className="text-[10px] text-green-650 dark:text-green-500 leading-none">{t('nodeStatus')}</p>
                <p className="text-sm font-black text-green-600 dark:text-green-550 leading-tight">{t('statusSafe')}</p>
              </div>
            </div>
          )}
        </div>

        {/* 3-Column Core Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1 & 2: Primary SOS Command & Radar */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* SOS Control Panel */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
              
              {/* Category Pills & Instructions (Left Side) */}
              <div className="flex-1 space-y-5 w-full text-left">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {t('selectDistress')}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t('categoryDesc')}</p>
                </div>

                {/* Category Grid */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  {Object.keys(categoryConfigs).map((catName) => {
                    const cfg = categoryConfigs[catName as EmergencyCategory];
                    const CatIcon = cfg.icon;
                    const isSelected = selectedCategory === catName;
                    
                    return (
                      <button
                        key={catName}
                        type="button"
                        onClick={() => setSelectedCategory(catName as EmergencyCategory)}
                        className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left font-bold text-xs transition-all duration-150 active:scale-95 cursor-pointer ${
                          isSelected 
                            ? 'bg-white dark:bg-slate-900/60 shadow border-sky-500/50 text-sky-600 dark:text-sky-400 scale-[1.02]' 
                            : 'bg-white/40 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                        disabled={!!activeEmergency}
                      >
                        <div className={`p-2 rounded-xl border ${cfg.colorClass}`}>
                          <CatIcon className="w-4 h-4" />
                        </div>
                        <span className="truncate">{t(catName.toLowerCase())}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Voice SOS Toggle Block (Entire card clickable) */}
                <div 
                  onClick={toggleListening}
                  className={`p-4 rounded-2xl bg-white/40 dark:bg-slate-900/30 border border-slate-250 dark:border-slate-800 flex items-center justify-between gap-4 cursor-pointer select-none active:scale-[0.99] hover:bg-white/60 dark:hover:bg-slate-900/40 transition-all duration-200 ${isListening ? 'border-sky-500/40 bg-sky-500/5' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${isListening ? 'bg-red-500/10 text-red-500 border-red-500/25 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 border-slate-250 dark:border-slate-700'}`}>
                      {isListening ? <Mic className="w-4.5 h-4.5" /> : <MicOff className="w-4.5 h-4.5" />}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{t('voiceSOS')}</p>
                      <p className="text-[10px] text-slate-400">{isListening ? t('voiceActive') : t('voiceInactive')}</p>
                    </div>
                  </div>
                  
                  {/* Toggle switch */}
                  <div
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isListening ? 'bg-sky-500' : 'bg-slate-350 dark:bg-slate-700'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isListening ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </div>
              </div>

              {/* SOS Trigger circular button & Radar screen */}
              <div className="flex flex-col items-center justify-center flex-shrink-0 w-full md:w-64 space-y-4">
                
                {activeEmergency ? (
                  // Active SOS resolve buttons
                  <div className="flex flex-col items-center animate-slide-in py-6">
                    <div className="w-36 h-36 rounded-full bg-red-500/10 border-4 border-red-500/35 flex items-center justify-center mb-5 animate-pulse-fast cursor-pointer" onClick={() => navigate('/sos-success')}>
                      <Flame className="w-16 h-16 text-red-500 animate-bounce text-glow-danger" />
                    </div>
                    <p className="text-xs text-red-500 font-extrabold uppercase tracking-widest animate-pulse mb-3">{t('statusActive')}</p>
                    <div className="flex flex-col gap-2 w-full">
                      <Button variant="success" size="md" onClick={handleResolveEmergency} isLoading={loadingAction} fullWidth>
                        <ShieldCheck className="w-4.5 h-4.5 mr-1.5" />
                        {t('safeButton')}
                      </Button>
                      <Link to="/sos-success" className="w-full">
                        <Button variant="glass" size="md" fullWidth>{t('telemetryDetails')}</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  // Standard standby pulse trigger
                  <div className="flex flex-col items-center">
                    <button
                      onClick={handleSOSClick}
                      className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br ${selectedConfig.activeColor} text-white font-black text-3xl sm:text-4xl uppercase tracking-wider border-8 border-white/60 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer transform hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none mb-2 relative`}
                      disabled={loadingAction}
                    >
                      <span className="text-glow">{t('holdSOS')}</span>
                      <span className="text-[8px] font-bold tracking-widest text-white/80 mt-1">TAP TO RESCUE</span>
                    </button>
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{t('standbyCommand')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Location Radar Card */}
            <div className="glass-panel p-6 rounded-3xl text-left space-y-4 relative overflow-hidden">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                {t('radarTitle')}
              </h3>
              
              <div className="relative w-full h-48 rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center bg-[linear-gradient(rgba(14,165,233,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.06)_1px,transparent_1px)] bg-[size:16px_16px]">
                {/* Rotating Sweep */}
                <div className="absolute w-64 h-64 rounded-full border border-sky-500/10 flex items-center justify-center">
                  <div className="absolute w-44 h-44 rounded-full border border-sky-500/10"></div>
                  <div className="absolute w-24 h-24 rounded-full border border-sky-500/10"></div>
                  <div className="absolute top-0 bottom-0 left-0 right-0 origin-center animate-spin" style={{ animationDuration: '6s' }}>
                    <div className="w-[50%] h-[50%] bg-gradient-to-tr from-sky-500/20 to-transparent origin-bottom-right rotate-45 rounded-tl-full blur-sm"></div>
                  </div>
                </div>
                
                {/* Glowing target point */}
                <div className="absolute flex flex-col items-center justify-center">
                  <div className="relative flex h-5 w-5 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                  </div>
                  <span className="text-[9px] font-mono text-sky-400 mt-2 font-bold tracking-widest bg-slate-900/80 px-2 py-0.5 rounded border border-sky-500/25">
                    LATENCY ACTIVE: SYNCED
                  </span>
                </div>
                
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full text-[9px] font-black text-green-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                  {t('radarStatus')}
                </div>
              </div>
            </div>

          </div>

          {/* Column 3: Live Telemetry Metrics & Safety Suite */}
          <div className="space-y-6">
            
            {/* Women's Safety & Offline Suite Card */}
            <div className="glass-panel p-6 rounded-3xl text-left space-y-4 border-purple-500/25 bg-purple-550/[0.01] dark:bg-purple-950/[0.01]">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                <ShieldCheck className="w-4 h-4 text-purple-500 animate-pulse-slow" />
                {localTranslations[currentLanguage]?.womensSuite || localTranslations['en'].womensSuite}
              </h3>

              <div className="space-y-3.5">
                {/* 🚨 Panic Siren Button */}
                <button
                  type="button"
                  onClick={toggleSiren}
                  className={`w-full py-3 px-4 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                    isSirenActive
                      ? 'bg-red-650 hover:bg-red-750 text-white border-red-700 animate-pulse shadow-sm'
                      : 'bg-white/40 dark:bg-slate-900/20 border-purple-500/25 hover:border-purple-550 text-purple-600 dark:text-purple-400'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  {isSirenActive ? (
                    <span>{localTranslations[currentLanguage]?.sirenActive || localTranslations['en'].sirenActive}</span>
                  ) : (
                    <span>{localTranslations[currentLanguage]?.sirenStandby || localTranslations['en'].sirenStandby}</span>
                  )}
                </button>

                {/* 👁️ Discreet Mask Mode Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMasked(true);
                    showToast('Discreet Screen Mask active. Distress tracking is live.', 'info');
                  }}
                  className="w-full py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-850 bg-white/40 dark:bg-slate-900/20 hover:border-sky-500 text-slate-700 dark:text-slate-300 hover:text-sky-600 text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Eye className="w-4 h-4" />
                  {localTranslations[currentLanguage]?.discreetActive || localTranslations['en'].discreetActive}
                </button>

                {/* 📲 Offline SMS Backup */}
                <a
                  href={smsLink}
                  onClick={(e) => {
                    if (!primaryPhone) {
                      e.preventDefault();
                      showToast('Please register emergency contacts in your profile first.', 'warning');
                    } else {
                      showToast('Opening native SMS client...', 'info');
                    }
                  }}
                  className={`w-full py-3 px-4 rounded-2xl border text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                    !isOnline
                      ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-655 animate-pulse shadow-sm'
                      : 'border-slate-300 dark:border-slate-850 bg-white/40 dark:bg-slate-900/20 hover:border-amber-500 text-slate-700 dark:text-slate-300 hover:text-amber-600'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  {localTranslations[currentLanguage]?.offlineSmsActive || localTranslations['en'].offlineSmsActive}
                  {!isOnline && (
                    <span className="text-[8px] uppercase bg-white/20 px-1 py-0.2 rounded font-black">
                      OFFLINE
                    </span>
                  )}
                </a>
              </div>
            </div>

            {/* Device Telemetry Metrics */}
            <div className="glass-panel p-6 rounded-3xl text-left space-y-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                {t('nodeDiagnostics')}
              </h3>
              
              <div className="grid grid-cols-2 gap-3.5">
                {/* metric 1 */}
                <div className="p-3 bg-white/40 dark:bg-slate-900/30 rounded-2xl border border-slate-250 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Battery className="w-4 h-4 text-sky-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t('deviceCell')}</span>
                  </div>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">
                    {batteryLevel !== null ? `${batteryLevel}%` : '87%'}
                  </p>
                  <p className="text-[9px] text-slate-400">{t('batteryStatus')}</p>
                </div>

                {/* metric 2 */}
                <div className="p-3 bg-white/40 dark:bg-slate-900/30 rounded-2xl border border-slate-250 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Wifi className="w-4 h-4 text-sky-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t('gpsPrecision')}</span>
                  </div>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">± 4.2m</p>
                  <p className="text-[9px] text-slate-400">High Precision</p>
                </div>

                {/* metric 3 */}
                <div className="p-3 bg-white/40 dark:bg-slate-900/30 rounded-2xl border border-slate-250 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Zap className="w-4 h-4 text-sky-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t('latency')}</span>
                  </div>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">12 ms</p>
                  <p className="text-[9px] text-slate-400">Guardian Bridge</p>
                </div>

                {/* metric 4 */}
                <div className="p-3 bg-white/40 dark:bg-slate-900/30 rounded-2xl border border-slate-250 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Users className="w-4 h-4 text-sky-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{t('peerMesh')}</span>
                  </div>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200 mt-1">5 Nodes</p>
                  <p className="text-[9px] text-slate-400">Relays Nearby</p>
                </div>
              </div>
            </div>

            {/* Dynamic Survival Checklist */}
            <div className="glass-panel p-6 rounded-3xl text-left space-y-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                {t('survivalGuide')}: <span className="text-sky-600 dark:text-sky-400 font-black">{t(selectedCategory.toLowerCase())}</span>
              </h3>
              
              <div className="space-y-3">
                {selectedConfig.checklist.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-4.5 h-4.5 text-sky-500 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-600 dark:text-slate-350 leading-tight">{step}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Dock: Responder Nodes & History preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          
          {/* Responder Contacts card */}
          <div className="glass-panel p-6 rounded-3xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('contactsTitle')}
              </h3>
              <Link to="/profile" className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline">
                {t('manageNodes')}
              </Link>
            </div>
            
            {currentUser?.contacts && currentUser.contacts.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {currentUser.contacts.map((contact, idx) => (
                  <div 
                    key={idx} 
                    className="p-3.5 rounded-2xl bg-white/40 dark:bg-slate-900/30 border border-slate-250 dark:border-slate-800/85 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{contact.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{contact.phone}</p>
                    </div>
                    
                    <a 
                      href={`tel:${contact.phone}`} 
                      className="w-full flex items-center justify-center gap-1 py-1 rounded-lg bg-slate-200/50 dark:bg-white/5 hover:bg-sky-500/10 text-[10px] font-semibold border border-slate-300 dark:border-white/5 hover:border-sky-500/25 transition-all text-slate-700 hover:text-sky-600 dark:text-slate-300 dark:hover:text-sky-400"
                    >
                      {t('dialNode')}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 text-xs font-semibold">
                No Emergency contacts configured. Update your profile immediately!
              </div>
            )}
          </div>

          {/* Quick Logs Card */}
          <div className="glass-panel p-6 rounded-3xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {t('timelineLogs')}
              </h3>
              <Link to="/history" className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline">
                {t('fullLog')}
              </Link>
            </div>
            
            {latestHistoryRecord ? (
              <div className="space-y-3.5 text-xs">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {t((latestHistoryRecord.category || 'General distress').toLowerCase())} SOS signal
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(latestHistoryRecord.timestamp).toLocaleDateString()} at {new Date(latestHistoryRecord.timestamp).toLocaleTimeString()}
                    </p>
                  </div>

                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border flex-shrink-0 ${
                    latestHistoryRecord.status === 'Emergency' 
                      ? 'bg-red-500/10 text-red-500 dark:text-red-500 border-red-500/20' 
                      : 'bg-green-500/10 text-green-600 dark:text-green-550 border border-green-500/20'
                  }`}>
                    {latestHistoryRecord.status}
                  </span>
                </div>
                
                <Button 
                  variant="primary"
                  fullWidth
                  onClick={() => window.open(latestHistoryRecord.googleMapsLink, '_blank', 'noopener,noreferrer')}
                  className="w-full text-xs font-bold transition-all text-white shadow-sm"
                >
                  {t('verifyMaps')}
                </Button>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs font-medium bg-white/20 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5">
                No incidents reported in the database history.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
