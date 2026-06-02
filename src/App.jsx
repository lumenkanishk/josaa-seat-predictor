import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PredictorForm from './components/PredictorForm';
import ResultCards from './components/ResultCards';
import { fetchAndParseCSV, processPredictorData } from './utils/dataProcessor';
import { GraduationCap, Loader2 } from 'lucide-react';

const PRELOADER_TASKS = [
  "Initializing JoSAA Seat Matrix Database...",
  "Indexing 23 Indian Institutes of Technology...",
  "Syncing Category Cutoff Ranges...",
  "Calibrating Neural Predictor Model...",
  "System Ready."
];

const CALCULATION_TASKS = [
  "[RUNNING: CROSS_EVALUATION]",
  "[MATCHING: SEAT_MATRIX_DATA_POINTS]",
  "[OPTIMIZING: PREDICTION_VECTORS]",
  "[FINALIZING: INSTITUTIONAL_ARRAY]"
];

const paragraph1 = "Navigating JoSAA seat allocation is a complex optimization puzzle. Our prediction engine simplifies this trajectory through high-fidelity, data-driven telemetry.";
const paragraph2 = "By calculating your exact rank metrics against modern state quotas, category variables, and institutional filters, the platform renders a streamlined matrix of eligible programs across India's premier IITs, NITs, IIITs, and GFTIs. Built entirely on top of multi-round historical closing rank datasets, this tool delivers crystal-clear tracking metrics, replacing guesswork with pure analytical certainty during your choice-filling window.";

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rankType: 'Open Rank',
    rank: '',
    seatType: '',
    instituteType: '',
    gender: '',
    quota: '',
    round: ''
  });

  const [results, setResults] = useState(null);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [error, setError] = useState('');
  
  const [showPreloader, setShowPreloader] = useState(true);
  const [taskIndex, setTaskIndex] = useState(0);
  const [displayedText1, setDisplayedText1] = useState('');
  const [displayedText2, setDisplayedText2] = useState('');
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcTaskIndex, setCalcTaskIndex] = useState(0);

  const videoRef = useRef(null);
  const calcTimeoutRef = useRef(null);
  const calcIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (calcTimeoutRef.current) clearTimeout(calcTimeoutRef.current);
      if (calcIntervalRef.current) clearInterval(calcIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.25;
    }
  }, []);

  useEffect(() => {
    const preloaderTimer = setTimeout(() => {
      setShowPreloader(false);
    }, 4000);

    const taskInterval = setInterval(() => {
      setTaskIndex(prev => (prev < PRELOADER_TASKS.length - 1 ? prev + 1 : prev));
    }, 1000);

    return () => {
      clearTimeout(preloaderTimer);
      clearInterval(taskInterval);
    };
  }, []);

  useEffect(() => {
    if (!showPreloader) {
      let i = 0;
      let j = 0;
      let p1Finished = false;
      
      const interval = setInterval(() => {
        if (!p1Finished) {
          if (i < paragraph1.length) {
            setDisplayedText1(paragraph1.slice(0, i + 1));
            i++;
          } else {
            p1Finished = true;
          }
        } else {
          if (j < paragraph2.length) {
            setDisplayedText2(paragraph2.slice(0, j + 1));
            j++;
          } else {
            clearInterval(interval);
          }
        }
      }, 10);
      
      return () => clearInterval(interval);
    }
  }, [showPreloader]);

  const handleSubmit = async () => {
    setIsCalculating(true);
    setError('');

    if (calcIntervalRef.current) clearInterval(calcIntervalRef.current);
    if (calcTimeoutRef.current) clearTimeout(calcTimeoutRef.current);

    calcIntervalRef.current = setInterval(() => {
      setCalcTaskIndex(prev => (prev + 1) % CALCULATION_TASKS.length);
    }, 500);

    calcTimeoutRef.current = setTimeout(async () => {
      clearInterval(calcIntervalRef.current);
      try {
        const rawData = await fetchAndParseCSV(formData.round);
        const filtered = processPredictorData(rawData, formData);
        setResults(filtered);
      } catch (err) {
        console.error(err);
        setError(`Failed to load ${formData.round}.csv. Make sure the file exists in the public directory.`);
      } finally {
        setIsCalculating(false);
      }
    }, 2000);
  };

  const handleReset = () => {
    if (calcTimeoutRef.current) clearTimeout(calcTimeoutRef.current);
    if (calcIntervalRef.current) clearInterval(calcIntervalRef.current);
    setIsCalculating(false);
    setResults(null);
    setSelectedBranches([]);
  };

  return (
    <>
      {/* Conditional Background Architecture */}
      {!results ? (
        <div className="fixed inset-0 w-full h-full bg-[#030303] z-0 pointer-events-none">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            disablePictureInPicture
            className="w-full h-full object-cover"
          >
            <source src="/bg-video.mp4" type="video/mp4" />
          </video>
        </div>
      ) : (
        <div className="fixed inset-0 w-full h-full bg-black -z-10 overflow-hidden">
          {/* The Dot Matrix Grid Layer */}
          <div 
            className="absolute inset-0 [background-size:20px_20px] [background-image:radial-gradient(#404040_1px,transparent_1px)] opacity-70"
          />
          {/* The Faded Vignette Radial Mask Layer to create a premium dark center depth */}
          <div 
            className="pointer-events-none absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
          />
        </div>
      )}
      
      {/* Global Noise and Tint Overlay */}
      <div className="fixed inset-0 z-10 pointer-events-none bg-black/30">
        <div className="absolute inset-0 noise-bg mix-blend-overlay"></div>
      </div>

      {/* Initial Educational Preloader */}
      <AnimatePresence>
        {showPreloader && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030303] text-white"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 bg-white blur-[50px] opacity-10 rounded-full"></div>
              <motion.div
                animate={{
                  boxShadow: ["0px 0px 0px rgba(255,255,255,0)", "0px 0px 30px rgba(255,255,255,0.3)", "0px 0px 0px rgba(255,255,255,0)"]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="rounded-full p-4"
              >
                <GraduationCap className="w-20 h-20 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" strokeWidth={1} />
              </motion.div>
            </motion.div>
            <div className="h-6 overflow-hidden flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={taskIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-mono text-sm text-white/70"
                >
                  {PRELOADER_TASKS[taskIndex]}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calculation Processing Preloader */}
      <AnimatePresence>
        {isCalculating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#030303]/90 backdrop-blur-md text-white"
          >
            <div className="relative flex items-center justify-center w-32 h-32 mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-0 rounded-full border-t-2 border-r-2 border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)]"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                className="absolute inset-4 rounded-full border-b-2 border-l-2 border-indigo-400 opacity-70"
              />
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
            </div>
            <div className="h-6 overflow-hidden flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={calcTaskIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="font-mono text-sm text-indigo-300 font-bold tracking-widest"
                >
                  {CALCULATION_TASKS[calcTaskIndex]}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="absolute top-6 left-6 z-30 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-white drop-shadow-md">JoSSA SEAT PREDICTOR 2025-26</h1>
      </div>

      <main className={
        !results 
          ? "min-h-screen flex items-center justify-center pt-24 pb-24 px-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-20"
          : "max-w-7xl mx-auto w-full px-4 relative z-20 py-8 pt-24 pb-24 min-h-screen flex flex-col"
      }>
        
        {/* Left Panel */}
        {!results && (
          <div className="flex flex-col gap-6 w-full max-w-lg mx-auto lg:mx-0">
            <div className="glass-panel p-8">
              <h3 className="text-xl font-mono text-white mb-4 flex items-center">
                <span className="w-3 h-3 bg-indigo-500 rounded-full inline-block mr-3 animate-[blink_1s_infinite]" />
                WEBSITE INSIGHTS
              </h3>
              <div className="text-white/80 leading-relaxed mb-6 space-y-4 min-h-[190px]">
                <p>{displayedText1}</p>
                <p>{displayedText2}</p>
              </div>
              <div className="flex gap-4 font-mono text-xs text-white/50">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>[SYS: ONLINE]</span>
                <span>[DATA_ROUND: 1-6]</span>
              </div>
            </div>
          </div>
        )}

        {/* Right Panel */}
        <div className="w-full flex-1 flex flex-col">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl w-full text-center">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {!results ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                <PredictorForm 
                  formData={formData} 
                  setFormData={setFormData} 
                  onSubmit={handleSubmit}
                  isLoading={isCalculating}
                />
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full flex-1 min-h-[500px]"
              >
                <ResultCards 
                  results={results} 
                  onReset={handleReset} 
                  selectedBranches={selectedBranches}
                  setSelectedBranches={setSelectedBranches}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <div className="fixed bottom-4 left-6 z-40 flex items-center font-mono text-xs text-white/50 bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 shadow-lg select-none">
        <span>Designed and Engineered by</span>
        <a 
          href="https://github.com/lumenkanishk" 
          target="_blank" 
          rel="noopener noreferrer"
          className="ml-2 px-3 py-1 rounded bg-white/5 border border-white/10 text-white/90 font-mono transition-all duration-300 shadow-sm flex items-center gap-2 hover:bg-amber-500/10 hover:border-amber-500/40 hover:text-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
          </svg>
          <span>@lumenkanishk</span>
        </a>
      </div>
    </>
  );
}

export default App;
