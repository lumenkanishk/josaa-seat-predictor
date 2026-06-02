import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';

const SEAT_TYPES = [
  'ALL', 'SC', 'ST (PwD)', 'SC (PwD)', 'OPEN', 
  'OBC-NCL (PwD)', 'EWS (PwD)', 'OPEN (PwD)', 
  'ST', 'OBC-NCL', 'EWS'
];

const INSTITUTE_TYPES = [
  { value: 'ALL', label: 'ALL' },
  { value: 'IIT', label: 'Indian Institute of Technology (IIT)' },
  { value: 'NIT', label: 'National Institute of Technology (NIT)' },
  { value: 'IIIT', label: 'Indian Institute of Information Technology (IIIT)' },
  { value: 'GFTI', label: 'Government Funded Technical Institutions (GFTI)' }
];

const GENDERS = [
  'Gender-Neutral', 
  'Female-only (including Supernumerary)'
];

const QUOTAS = ['ALL', 'AI', 'HS', 'OS'];
const ROUNDS = ['1', '2', '3', '4', '5', '6'];

export default function PredictorForm({ formData, setFormData, onSubmit, isLoading }) {
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      let finalValue = value;
      if (name === 'rank') {
        finalValue = String(value).replace(/\D/g, '');
      }
      const updated = { ...prev, [name]: finalValue };
      if (name === 'rankType' && finalValue === 'Open Rank') {
        updated.seatType = '';
      } else if (name === 'rankType' && finalValue === 'Category Rank' && prev.rankType === 'Open Rank') {
        updated.seatType = '';
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    const trimmedName = (formData.name || '').trim();
    const trimmedEmail = (formData.email || '').trim();

    if (!trimmedName || !trimmedEmail || !formData.rank || !formData.rankType || (!formData.seatType && formData.rankType === 'Category Rank') || !formData.instituteType || !formData.gender || !formData.quota || !formData.round) {
      setValidationError("Access Denied. Please provide a valid registration name and an authenticated @gmail.com address to query the JoSAA seat matrix.");
      return;
    }

    if (!trimmedEmail.toLowerCase().endsWith('@gmail.com')) {
      setValidationError("Access Denied. Please provide a valid registration name and an authenticated @gmail.com address to query the JoSAA seat matrix.");
      return;
    }

    const rankNum = parseInt(formData.rank, 10);
    if (!rankNum || rankNum <= 0 || rankNum > 2500000) {
      setValidationError("Invalid rank parameters. Rank must be between 1 and 2,500,000 to process the calculation securely.");
      return;
    }

    setFormData(prev => ({ ...prev, name: trimmedName, email: trimmedEmail }));
    onSubmit();
  };

  return (
    <>
      <AnimatePresence>
        {validationError && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0f0f0f] border border-red-500/30 p-8 rounded-2xl max-w-md w-full shadow-2xl shadow-red-900/20 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
              <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Authentication Error</h3>
              <p className="text-white/70 text-sm leading-relaxed mb-8">{validationError}</p>
              <button 
                onClick={() => setValidationError('')}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors border border-white/10 font-medium"
              >
                Acknowledge
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="glass-panel p-6 sm:p-8 w-full max-w-2xl mx-auto space-y-6"
        onSubmit={handleSubmit}
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">JoSSA College Predictor</h2>
          <p className="text-white/60">Enter your details to find your chances</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Full Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              required
              className="glass-input w-full"
              placeholder="John Doe"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              required
              className="glass-input w-full"
              placeholder="student@gmail.com"
            />
          </div>

          {/* Rank Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Rank Type</label>
            <div className="flex gap-4 h-[50px] items-center bg-black/20 rounded-xl p-1 border border-white/5">
              {['Open Rank', 'Category Rank'].map(type => (
                <label 
                  key={type} 
                  className={cn(
                    "flex-1 flex items-center justify-center cursor-pointer rounded-lg text-sm transition-all h-full",
                    formData.rankType === type ? "bg-white/10 text-white font-medium shadow-sm" : "text-white/50 hover:text-white/80"
                  )}
                >
                  <input 
                    type="radio" 
                    name="rankType"
                    value={type}
                    checked={formData.rankType === type}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          {/* Rank */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 flex items-baseline">
              JEE Rank
              <span className="text-white/40 text-[11px] ml-2 font-mono lowercase">If you're eligible for category then mention category rank here</span>
            </label>
            <input 
              type="number" 
              name="rank"
              required
              min="1"
              value={formData.rank || ''}
              onChange={handleChange}
              className="glass-input w-full"
              placeholder="e.g. 5000"
            />
          </div>

          {/* Seat Type */}
          <AnimatePresence mode="popLayout">
            {formData.rankType === 'Category Rank' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-white/80">Seat Type / Category</label>
                <select 
                  name="seatType" 
                  value={formData.seatType || ''}
                  onChange={handleChange}
                  required
                  className="glass-input w-full appearance-none cursor-pointer"
                >
                  <option value="" disabled hidden></option>
                  {SEAT_TYPES.map(type => (
                    <option key={type} value={type} className="bg-zinc-900 text-white">{type}</option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Institute Type */}
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-white/80">Institute Type</label>
            <select 
              name="instituteType" 
              value={formData.instituteType || ''}
              onChange={handleChange}
              required
              className="glass-input w-full appearance-none cursor-pointer"
            >
              <option value="" disabled hidden></option>
              {INSTITUTE_TYPES.map(inst => (
                <option key={inst.value} value={inst.value} className="bg-zinc-900 text-white">{inst.label}</option>
              ))}
            </select>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Gender</label>
            <select 
              name="gender" 
              value={formData.gender || ''}
              onChange={handleChange}
              required
              className="glass-input w-full appearance-none cursor-pointer"
            >
              <option value="" disabled hidden></option>
              {GENDERS.map(g => (
                <option key={g} value={g} className="bg-zinc-900 text-white">{g}</option>
              ))}
            </select>
          </div>

          {/* State Quota */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">State Quota</label>
            <select 
              name="quota" 
              value={formData.quota || ''}
              onChange={handleChange}
              required
              className="glass-input w-full appearance-none cursor-pointer"
            >
              <option value="" disabled hidden></option>
              {QUOTAS.map(q => (
                <option key={q} value={q} className="bg-zinc-900 text-white">{q}</option>
              ))}
            </select>
          </div>

          {/* Round */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">JoSAA Round</label>
            <select 
              name="round" 
              value={formData.round || ''}
              onChange={handleChange}
              required
              className="glass-input w-full appearance-none cursor-pointer"
            >
              <option value="" disabled hidden></option>
              {ROUNDS.map(r => (
                <option key={r} value={`round${r}`} className="bg-zinc-900 text-white">Round {r}</option>
              ))}
            </select>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          type="submit"
          disabled={isLoading || !formData.rank}
          className="w-full mt-6 bg-red-500/10 hover:bg-red-600 hover:shadow-[0_0_30px_rgba(220,38,38,0.7)] text-white font-medium py-4 px-6 rounded-xl border border-red-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-400/0 via-red-400/20 to-red-400/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing Data...</span>
            </>
          ) : (
            <span>Predict Colleges</span>
          )}
        </motion.button>
      </motion.form>
    </>
  );
}
