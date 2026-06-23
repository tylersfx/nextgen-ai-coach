'use client';

import React, { useState } from 'react';
import { 
  Play, Upload, Target, Award, Calendar, 
  TrendingUp, Users, ArrowRight 
} from 'lucide-react';
import { parseGSProCSV } from '../lib/csvParser';
import { analyzeSwing, generateTrainingPlan } from '../lib/analysisEngine';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Analysis {
  swingScore: number;
  strengths: string[];
  focusAreas: string[];
  keyInsights: string[];
  recommendedDrills: any[];
  gsproSummary: string;
  overallFeedback: string;
}

interface TrainingPlan {
  title: string;
  focus_areas: string[];
  drills: any[];
  duration_days: number;
  status: string;
}

export default function NextGenAICoach() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'session' | 'analysis'>('dashboard');
  const [selectedBay, setSelectedBay] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [trainingPlan, setTrainingPlan] = useState<TrainingPlan | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');

  // Simulated member data (in real app this comes from Supabase)
  const member = {
    name: "Tyler",
    membership: "Club Legend",
    sessionsThisMonth: 8,
    avgClubSpeed: 94.2,
    currentHandicap: 8.4,
  };

  const bays = [1, 2, 3, 4, 5];

  const startSession = (bay: number) => {
    setSelectedBay(bay);
    setCurrentView('session');
    setVideoBlob(null);
    setCsvFile(null);
    setAnalysis(null);
    setTrainingPlan(null);
  };

  const handleVideoRecord = async () => {
    // In production: Use MediaRecorder + getUserMedia with guided overlay
    // For MVP demo: Simulate recording or allow file upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        setVideoBlob(file);
        // In real app: upload to Supabase Storage
      }
    };
    input.click();
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
    }
  };

  const processSession = async () => {
    if (!csvFile) {
      alert("Please upload your GSPro CSV export first.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Parse CSV
      const csvText = await csvFile.text();
      const gsproMetrics = parseGSProCSV(csvText);

      // 2. Run AI Analysis (combines GSPro + rules)
      const result = analyzeSwing(gsproMetrics, sessionNotes);

      // 3. Generate adaptive Training Plan
      const plan = generateTrainingPlan(result);

      setAnalysis(result);
      setTrainingPlan(plan);
      setCurrentView('analysis');

      // In real app: Save session + analysis + plan to Supabase here
      console.log("Session saved (demo mode)");

    } catch (error: any) {
      alert("Error processing data: " + error.message);
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const completeDrill = (drillId: string) => {
    if (!trainingPlan) return;
    
    const updatedDrills = trainingPlan.drills.map(d => 
      d.id === drillId ? { ...d, completed: true } : d
    );
    
    setTrainingPlan({
      ...trainingPlan,
      drills: updatedDrills
    });
  };

  const finishAndSave = () => {
    // In real app: Update Supabase with completed plan + new session
    alert("Session saved! Your training plan has been updated. Great work at NextGen today.");
    setCurrentView('dashboard');
    // Reset state
    setSelectedBay(null);
    setVideoBlob(null);
    setCsvFile(null);
    setAnalysis(null);
    setTrainingPlan(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header with Logo */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="NextGen Golf Lounge" className="h-12 w-12" />
            <div>
              <div className="font-semibold text-2xl tracking-tight">NextGen AI Coach</div>
              <div className="text-xs text-white/60 -mt-1">POWERED BY PROTEE VX + GSPRO</div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="px-4 py-1.5 bg-white/5 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              {member.membership}
            </div>
            <div className="text-white/60">Welcome back, {member.name}</div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* DASHBOARD VIEW */}
        {currentView === 'dashboard' && (
          <div>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-5xl font-semibold tracking-tighter">Ready to improve?</h1>
                <p className="text-xl text-white/70 mt-2">Your last session showed strong contact. Let's build on it.</p>
              </div>
              <div className="text-right">
                <div className="text-emerald-400 text-sm font-medium">THIS MONTH</div>
                <div className="text-4xl font-semibold">{member.sessionsThisMonth} <span className="text-lg text-white/60">sessions</span></div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
              <div className="bg-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-3 text-emerald-400 mb-2">
                  <TrendingUp className="w-5 h-5" /> Avg Club Speed
                </div>
                <div className="text-4xl font-semibold">{member.avgClubSpeed} <span className="text-lg">mph</span></div>
              </div>
              <div className="bg-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-3 text-emerald-400 mb-2">
                  <Target className="w-5 h-5" /> Handicap
                </div>
                <div className="text-4xl font-semibold">{member.currentHandicap}</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-6 col-span-2">
                <div className="text-emerald-400 text-sm mb-3">CURRENT TRAINING FOCUS</div>
                <div className="text-2xl">Improve dispersion &amp; maintain posture through impact</div>
              </div>
            </div>

            {/* Bay Check-in */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Start a Session</h2>
                <div className="text-sm text-white/60">5 bays available • ProTee VX + GSPro</div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {bays.map(bay => (
                  <button
                    key={bay}
                    onClick={() => startSession(bay)}
                    className="group bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/50 rounded-2xl p-8 text-left transition-all active:scale-[0.985]"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-6xl font-semibold text-white/90 group-hover:text-emerald-400 transition-colors">Bay {bay}</div>
                        <div className="text-emerald-400 text-sm mt-1">Ready now</div>
                      </div>
                      <Play className="w-8 h-8 text-white/40 group-hover:text-emerald-400 mt-2 transition-colors" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center text-xs text-white/50 mt-8">
              Your Club Legend membership gives you unlimited AI analysis + priority training plans.
            </div>
          </div>
        )}

        {/* SESSION VIEW - Low Friction Flow */}
        {currentView === 'session' && selectedBay && (
          <div className="max-w-2xl mx-auto">
            <button 
              onClick={() => setCurrentView('dashboard')} 
              className="mb-6 text-sm flex items-center gap-2 text-white/60 hover:text-white"
            >
              ← Back to bays
            </button>

            <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="text-6xl font-semibold text-emerald-400">Bay {selectedBay}</div>
                <div>
                  <div className="text-xl">NextGen Golf Lounge</div>
                  <div className="text-white/60">ProTee VX + GSPro Connected</div>
                </div>
              </div>

              {/* Step 1: Video */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold">1</div>
                  <div className="text-xl font-medium">Record your swing (Down-The-Line)</div>
                </div>
                
                <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
                  <div className="text-sm text-white/70 mb-4">
                    Position your phone on a tripod or bay mount for a clear Down-The-Line view. 
                    Tap record, hit 8–12 balls, then stop.
                  </div>
                  
                  <button 
                    onClick={handleVideoRecord}
                    className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-2xl font-semibold text-lg active:bg-white/90"
                  >
                    <Play className="w-6 h-6" /> {videoBlob ? "Re-record Video" : "Record Video Now"}
                  </button>
                  
                  {videoBlob && (
                    <div className="mt-3 text-center text-emerald-400 text-sm flex items-center justify-center gap-2">
                      <Award className="w-4 h-4" /> Video captured successfully
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: GSPro CSV */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold">2</div>
                  <div className="text-xl font-medium">Upload your GSPro session data</div>
                </div>

                <label className="block border-2 border-dashed border-white/30 hover:border-emerald-400/70 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-black/30">
                  <Upload className="w-10 h-10 mx-auto mb-4 text-white/60" />
                  <div className="font-medium mb-1">Drag &amp; drop or tap to upload GSPro CSV</div>
                  <div className="text-sm text-white/60">Export from Practice Range → Clipboard icon → Export CSV</div>
                  <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleCSVUpload} 
                    className="hidden" 
                  />
                  {csvFile && (
                    <div className="mt-4 text-emerald-400 font-medium">✓ {csvFile.name} uploaded</div>
                  )}
                </label>
              </div>

              {/* Optional Notes */}
              <div className="mb-8">
                <div className="text-sm text-white/70 mb-2">Quick notes from this session (optional)</div>
                <textarea 
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Felt like I was releasing early on driver today..."
                  className="w-full bg-black/40 border border-white/20 rounded-2xl p-4 text-sm h-20 resize-y"
                />
              </div>

              <button 
                onClick={processSession}
                disabled={!csvFile || isProcessing}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/20 text-black disabled:text-white/60 font-semibold py-4 rounded-2xl text-lg flex items-center justify-center gap-3 transition-all"
              >
                {isProcessing ? "Analyzing your swing..." : "Analyze Session & Generate Plan"}
                {!isProcessing && <ArrowRight />}
              </button>

              <p className="text-center text-xs text-white/50 mt-4">
                Your data stays private. Analysis runs instantly.
              </p>
            </div>
          </div>
        )}

        {/* ANALYSIS + TRAINING PLAN VIEW */}
        {currentView === 'analysis' && analysis && trainingPlan && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-1 rounded-full text-sm mb-4">
                BAY {selectedBay} • SESSION COMPLETE
              </div>
              <h2 className="text-5xl font-semibold tracking-tighter">Analysis Complete</h2>
              <p className="text-2xl text-white/70 mt-2">Swing Score: <span className="font-semibold text-emerald-400">{analysis.swingScore}</span>/100</p>
            </div>

            {/* GSPro Summary */}
            <div className="bg-white/5 rounded-2xl p-6 mb-6">
              <div className="text-emerald-400 text-sm mb-1">PROTEE VX + GSPRO DATA</div>
              <div className="text-2xl">{analysis.gsproSummary}</div>
            </div>

            {/* Overall Feedback */}
            <div className="bg-white/5 rounded-2xl p-8 mb-8">
              <div className="prose prose-invert max-w-none">
                <p className="text-xl leading-relaxed">{analysis.overallFeedback}</p>
              </div>
            </div>

            {/* Strengths & Focus */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/5 rounded-2xl p-6">
                <div className="text-emerald-400 font-medium mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" /> STRENGTHS
                </div>
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => <li key={i} className="flex gap-3">• {s}</li>)}
                </ul>
              </div>
              <div className="bg-white/5 rounded-2xl p-6">
                <div className="text-amber-400 font-medium mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5" /> FOCUS AREAS
                </div>
                <ul className="space-y-2">
                  {analysis.focusAreas.map((f, i) => <li key={i} className="flex gap-3">• {f}</li>)}
                </ul>
              </div>
            </div>

            {/* Training Plan */}
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-emerald-400 text-sm">YOUR UPDATED 7-DAY PLAN</div>
                  <div className="text-3xl font-semibold">{trainingPlan.title}</div>
                </div>
                <Calendar className="w-10 h-10 text-white/40" />
              </div>

              <div className="space-y-4">
                {trainingPlan.drills.map((drill: any, index: number) => (
                  <div 
                    key={drill.id || index} 
                    className={`flex items-start gap-4 p-5 rounded-2xl border ${drill.completed ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-black/40 border-white/10'}`}
                  >
                    <div className="mt-1">
                      <input 
                        type="checkbox" 
                        checked={drill.completed} 
                        onChange={() => completeDrill(drill.id)}
                        className="w-5 h-5 accent-emerald-500" 
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{drill.name}</div>
                      <div className="text-white/80 text-sm mt-1">{drill.description}</div>
                      <div className="text-xs text-white/50 mt-2 flex items-center gap-4">
                        <span>{drill.durationMin} min</span>
                        <span className="text-emerald-400/70">Why: {drill.why}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={finishAndSave}
                className="mt-8 w-full bg-white text-black font-semibold py-4 rounded-2xl text-lg hover:bg-white/90 active:bg-white transition-all"
              >
                Save Session &amp; Update My Plan
              </button>
            </div>

            <div className="text-center text-sm text-white/50">
              Plans adapt automatically after each new session. Keep showing up — your AI coach learns with you.
            </div>
          </div>
        )}
      </div>

      {/* Bottom Nav (PWA feel) */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-white/10 p-2 flex justify-around text-xs">
        <button onClick={() => setCurrentView('dashboard')} className="flex flex-col items-center py-2 px-6 text-white/70 hover:text-white">
          <Users className="w-5 h-5 mb-0.5" /> Dashboard
        </button>
        <button onClick={() => setCurrentView('session')} className="flex flex-col items-center py-2 px-6 text-white/70 hover:text-white">
          <Play className="w-5 h-5 mb-0.5" /> New Session
        </button>
        <button className="flex flex-col items-center py-2 px-6 text-white/70 hover:text-white">
          <Calendar className="w-5 h-5 mb-0.5" /> My Plan
        </button>
      </div>
    </div>
  );
}
