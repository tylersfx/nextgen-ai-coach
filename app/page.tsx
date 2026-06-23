'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, Upload, Target, Award, Calendar, 
  TrendingUp, Users, ArrowRight, Edit2, Lock 
} from 'lucide-react';
import { parseGSProCSV } from '../lib/csvParser';
import { analyzeSwing, generateTrainingPlan } from '../lib/analysisEngine';
import AuthModal from '@/components/AuthModal';
import { supabase } from '../lib/supabase';

export default function NextGenAICoach() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'session' | 'analysis'>('dashboard');
  const [selectedBay, setSelectedBay] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [trainingPlan, setTrainingPlan] = useState<any>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [newName, setNewName] = useState('');

  // Fetch user + profile
  useEffect(() => {
    const getUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profileData);
      }
    };

    getUserAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  // Save new name
  const saveProfileName = async () => {
    if (!user || !newName.trim()) return;

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: newName.trim() })
      .eq('id', user.id);

    if (!error) {
      setProfile({ ...profile, full_name: newName.trim() });
      setShowProfileModal(false);
      setNewName('');
    } else {
      alert("Error saving name: " + error.message);
    }
  };

  const displayName = profile?.full_name || user?.email || "User";
  const membershipType = profile?.membership_type || 'Club Member';
  const isClubLegend = membershipType === 'Club Legend';

  const member = {
    name: displayName,
    membership: membershipType,
    sessionsThisMonth: 8,
    avgClubSpeed: 94.2,
    currentHandicap: 8.4,
  };

  const bays = [1, 2, 3, 4, 5];

  const startSession = (bay: number) => {
    if (bay === 5 && !isClubLegend) {
      alert("Bay 5 is available for Club Legend members only.");
      return;
    }
    setSelectedBay(bay);
    setCurrentView('session');
    setVideoBlob(null);
    setCsvFile(null);
    setAnalysis(null);
    setTrainingPlan(null);
  };

  const handleVideoRecord = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) setVideoBlob(file);
    };
    input.click();
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCsvFile(file);
  };

  const processSession = async () => {
    if (!csvFile) {
      alert("Please upload your GSPro CSV export first.");
      return;
    }

    setIsProcessing(true);

    try {
      const csvText = await csvFile.text();
      const gsproMetrics = parseGSProCSV(csvText);
      const result = analyzeSwing(gsproMetrics, sessionNotes);
      const plan = generateTrainingPlan(result);

      setAnalysis(result);
      setTrainingPlan(plan);
      setCurrentView('analysis');
    } catch (error: any) {
      alert("Error processing data: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const completeDrill = (drillId: string) => {
    if (!trainingPlan) return;
    const updatedDrills = trainingPlan.drills.map((d: any) =>
      d.id === drillId ? { ...d, completed: true } : d
    );
    setTrainingPlan({ ...trainingPlan, drills: updatedDrills });
  };

  const finishAndSave = () => {
    alert("Session saved! Your training plan has been updated.");
    setCurrentView('dashboard');
    setSelectedBay(null);
    setVideoBlob(null);
    setCsvFile(null);
    setAnalysis(null);
    setTrainingPlan(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header - Improved for mobile to reduce spilling */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo.png" alt="NextGen Golf Lounge" className="h-9 w-9 sm:h-12 sm:w-12 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold text-xl sm:text-2xl tracking-tight truncate">NextGen AI Coach</div>
              <div className="text-[10px] sm:text-xs text-white/60 -mt-0.5 truncate">POWERED BY PROTEE VX + GSPRO</div>
            </div>
          </div>

          {/* Auth + Profile Section - More compact on mobile */}
          <div className="flex items-center gap-2 sm:gap-4 text-sm flex-shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setNewName(profile?.full_name || '');
                    setShowProfileModal(true);
                  }}
                  className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm sm:text-base max-w-[140px] truncate"
                >
                  <span className="truncate">{displayName}</span>
                  <Edit2 className="w-3.5 h-3.5 flex-shrink-0" />
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs sm:text-sm whitespace-nowrap"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs sm:text-sm whitespace-nowrap"
              >
                Log In / Sign Up
              </button>
            )}

            <div className="px-2.5 py-1 sm:px-4 sm:py-1.5 bg-white/5 rounded-full flex items-center gap-1.5 text-xs sm:text-sm whitespace-nowrap">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse" />
              {membershipType}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* DASHBOARD VIEW */}
        {currentView === 'dashboard' && (
          <div>
            <div className="flex justify-between items-end mb-6 sm:mb-8">
              <div>
                <h1 className="text-4xl sm:text-5xl font-semibold tracking-tighter">Ready to improve?</h1>
                <p className="text-lg sm:text-xl text-white/70 mt-1 sm:mt-2">Your last session showed strong contact. Let's build on it.</p>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-emerald-400 text-sm font-medium">THIS MONTH</div>
                <div className="text-4xl font-semibold">{member.sessionsThisMonth} <span className="text-lg text-white/60">sessions</span></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-3 text-emerald-400 mb-2 text-sm">
                  <TrendingUp className="w-4 h-4" /> Avg Club Speed
                </div>
                <div className="text-3xl sm:text-4xl font-semibold">{member.avgClubSpeed} <span className="text-base">mph</span></div>
              </div>
              <div className="bg-white/5 rounded-2xl p-5 sm:p-6">
                <div className="flex items-center gap-3 text-emerald-400 mb-2 text-sm">
                  <Target className="w-4 h-4" /> Handicap
                </div>
                <div className="text-3xl sm:text-4xl font-semibold">{member.currentHandicap}</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-5 sm:p-6 col-span-1 sm:col-span-2 lg:col-span-2">
                <div className="text-emerald-400 text-xs sm:text-sm mb-2">CURRENT TRAINING FOCUS</div>
                <div className="text-lg sm:text-xl">Improve dispersion & maintain posture through impact</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <h2 className="text-2xl font-semibold">Start a Session</h2>
                <div className="text-xs sm:text-sm text-white/60">5 bays available • ProTee VX + GSPro</div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {bays.map(bay => {
                  const isBay5 = bay === 5;
                  const canAccess = !isBay5 || isClubLegend;

                  return (
                    <button
                      key={bay}
                      onClick={() => startSession(bay)}
                      disabled={!canAccess}
                      className={`group rounded-2xl p-6 sm:p-8 text-left transition-all active:scale-[0.985] border flex flex-col justify-between h-full ${
                        canAccess 
                          ? 'bg-white/5 hover:bg-emerald-500/10 border-white/10 hover:border-emerald-500/50' 
                          : 'bg-white/5 border-white/10 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="text-5xl sm:text-6xl font-semibold text-white/90 group-hover:text-emerald-400 transition-colors">
                            Bay {bay}
                          </div>
                          {isBay5 && !isClubLegend && <Lock className="w-5 h-5 text-white/40" />}
                        </div>
                        <div className="text-emerald-400 text-sm mt-1">
                          {canAccess ? "Ready now" : "Club Legend only"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SESSION + ANALYSIS VIEWS (shortened for brevity - keep your existing full code here if needed) */}
        {currentView === 'session' && selectedBay && (
          <div className="max-w-2xl mx-auto">
            {/* Paste your existing session view code here */}
          </div>
        )}

        {currentView === 'analysis' && analysis && trainingPlan && (
          <div className="max-w-3xl mx-auto">
            {/* Paste your existing analysis view code here */}
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-2xl p-8 w-full max-w-md mx-4">
            <h2 className="text-2xl font-semibold mb-6">Edit Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/70 mb-1 block">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-black/40 border border-white/20 rounded-xl p-4 text-white"
                  placeholder="Enter your name"
                />
              </div>
              <div className="text-xs text-white/60">
                Current membership: <span className="text-emerald-400">{membershipType}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShowProfileModal(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-2xl font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={saveProfileName}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black py-3 rounded-2xl font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
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