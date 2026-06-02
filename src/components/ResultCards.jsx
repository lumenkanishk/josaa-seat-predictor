import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Virtuoso } from 'react-virtuoso';
import { RotateCcw, MapPin, Building2, Users, Target, Trophy } from 'lucide-react';

export default function ResultCards({ results, onReset, selectedBranches, setSelectedBranches }) {
  if (!results || results.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-12 text-center max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[400px]"
      >
        <div className="w-20 h-20 mb-6 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
          <Target className="w-10 h-10 text-white/40" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">No Colleges Found</h3>
        <p className="text-white/60 mb-8 max-w-md">
          We couldn't find any colleges matching your exact criteria. Try broadening your search or adjusting your rank expectations.
        </p>
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/10"
        >
          <RotateCcw className="w-4 h-4" />
          Edit Search
        </button>
      </motion.div>
    );
  }

  const uniqueBranches = useMemo(() => {
    if (!results) return [];
    const branches = new Set();
    results.forEach(college => {
      college.eligibleBranches.forEach(branch => {
        branches.add(branch.programName);
      });
    });
    return Array.from(branches).sort();
  }, [results]);

  const [searchQuery, setSearchQuery] = useState("");
  const pinnedBranches = uniqueBranches.filter(b => selectedBranches.includes(b));
  const unpinnedBranches = uniqueBranches.filter(b => !selectedBranches.includes(b) && b.toLowerCase().includes(searchQuery.toLowerCase()));
  const displayBranches = [...pinnedBranches, ...unpinnedBranches];

  const filteredResults = useMemo(() => {
    if (selectedBranches.length === 0) return results;
    
    return results.map(college => ({
      ...college,
      eligibleBranches: college.eligibleBranches.filter(branch => 
        selectedBranches.includes(branch.programName)
      )
    })).filter(college => college.eligibleBranches.length > 0);
  }, [results, selectedBranches]);

  const totalBranches = filteredResults.reduce((acc, college) => acc + college.eligibleBranches.length, 0);

  const itemContent = (index, college) => (
    <div className="pb-6 pt-1 px-1">
      <div className="glass-card-wrapper group transition-all duration-300 border border-white/10 hover:border-white/20">
        <div className="absolute inset-[-150%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 will-change-transform">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[spin_4s_linear_infinite] origin-center" />
        </div>
        
        <div className="glass-card-inner p-6 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start gap-4 mb-5 pb-4 border-b border-white/10">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white leading-tight">
                {college.instituteName}
              </h3>
              <p className="text-white/60 text-sm mt-1 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {college.eligibleBranches.length} Eligible Branches
              </p>
            </div>
            {college.nirfRank !== 999 && (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#c4a77d]/20 to-[#c4a77d]/10 border border-[#c4a77d]/30 px-3 py-1.5 rounded-lg shrink-0">
                <Trophy className="w-4 h-4 text-[#c4a77d]" />
                <span className="text-sm font-bold text-[#c4a77d]">NIRF #{college.nirfRank}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {college.eligibleBranches.map((branch, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-gradient-to-r hover:from-orange-500/20 hover:via-yellow-500/10 hover:to-transparent animate-moving-gradient gap-3 transition-all duration-300">
                <div className="flex-1 pr-4">
                  <p className="text-sm font-medium text-white mb-1.5">{branch.programName}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" /> {branch.seatType}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Quota: {branch.quota}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {branch.gender === 'Gender-Neutral' ? 'Neutral' : 'Female'}
                    </span>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t border-white/10 sm:border-t-0 sm:border-l sm:pl-4 pt-3 sm:pt-0 mt-2 sm:mt-0 min-w-[100px]">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Closing Rank</span>
                  <span className="text-lg font-bold text-[var(--color-primary-500)]">{branch.closingRank}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col lg:flex-row gap-8 items-start h-[85vh]"
    >
      {/* 25% Sidebar */}
      <div className="w-full lg:w-1/4 sticky top-6 h-[calc(100vh-140px)] flex flex-col backdrop-blur-xl bg-black/45 border border-white/10 p-5 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 shrink-0">
        <h3 className="text-[10px] tracking-[0.2em] text-white/40 font-bold uppercase font-mono mb-3">// STREAM SELECTION</h3>
        <input 
          type="text" 
          placeholder="Search branches..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 mb-4 font-mono"
        />
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar scrollbar-thin">
          {displayBranches.map(branch => {
            const isSelected = selectedBranches.includes(branch);
            return (
              <button
                key={branch}
                onClick={() => {
                  if (isSelected) {
                    setSelectedBranches(selectedBranches.filter(b => b !== branch));
                  } else {
                    setSelectedBranches([...selectedBranches, branch]);
                  }
                }}
                className={isSelected 
                  ? "bg-amber-500/10 border border-amber-500/40 text-amber-400 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-pulse-subtle whitespace-normal break-words text-left leading-normal py-2.5 px-3 w-full h-auto min-h-[38px] flex items-center font-mono rounded-xl transition-all"
                  : "bg-white/5 border border-white/10 text-white/60 whitespace-normal break-words text-left leading-normal py-2.5 px-3 w-full h-auto min-h-[38px] flex items-center font-mono rounded-xl hover:bg-white/10 transition-all"
                }
              >
                {branch}
              </button>
            );
          })}
        </div>
      </div>

      {/* 75% Content */}
      <div className="w-full lg:w-3/4 flex-1 flex flex-col min-h-0 h-full">
        <div className="flex justify-between items-center mb-6 px-2 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Predictions</h2>
          <p className="text-white/60 text-sm mt-1">
            {filteredResults.length} colleges ({totalBranches} branches) found based on your rank
          </p>
        </div>
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-red-600/10 hover:border-red-500/40 hover:text-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] text-white rounded-lg transition-all duration-300 text-sm shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          Start Over
        </button>
      </div>

        <div className="flex-1 min-h-0 w-full relative">
          <div className="absolute inset-0">
            {filteredResults.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-black/45 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/60 rounded-2xl">
                <Target className="w-12 h-12 text-white/20 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Matching Institutions</h3>
                <p className="text-white/50 max-w-md text-sm leading-relaxed">No institutions found matching your precise criteria. Adjust your filters or select 'ALL' state quotas to expand search bounds.</p>
              </div>
            ) : (
              <Virtuoso
                style={{ height: '100%', width: '100%' }}
                data={filteredResults}
                itemContent={itemContent}
                className="virtual-scroll-container"
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
