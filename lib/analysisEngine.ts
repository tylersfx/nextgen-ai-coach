import { parseGSProCSV } from './csvParser';

// Types
export interface GSProMetrics {
  avgClubSpeed: number;
  avgBallSpeed: number;
  avgSmashFactor: number;
  avgLaunchAngle: number;
  avgSpinRate: number;
  avgCarry: number;
  avgDispersion: number;
  shotCount: number;
  rawShots?: any[];
}

export interface AnalysisResult {
  swingScore: number; // 0-100
  strengths: string[];
  focusAreas: string[];
  keyInsights: string[];
  recommendedDrills: Array<{
    name: string;
    description: string;
    durationMin: number;
    why: string;
  }>;
  gsproSummary: string;
  overallFeedback: string;
}

// Main Analysis Function - Combines GSPro data + video context + golf rules
export function analyzeSwing(
  gsproMetrics: GSProMetrics,
  videoNotes?: string, // optional user notes or future pose data
  previousSessions?: any[]
): AnalysisResult {
  const { 
    avgClubSpeed, avgSmashFactor, avgLaunchAngle, 
    avgSpinRate, avgCarry, avgDispersion, shotCount 
  } = gsproMetrics;

  let swingScore = 75; // baseline
  const strengths: string[] = [];
  const focusAreas: string[] = [];
  const keyInsights: string[] = [];
  const recommendedDrills: any[] = [];

  // === Power & Contact Analysis ===
  if (avgSmashFactor >= 1.45) {
    strengths.push("Excellent contact efficiency");
    swingScore += 8;
  } else if (avgSmashFactor < 1.35) {
    focusAreas.push("Center contact / Smash factor");
    keyInsights.push(`Smash factor of ${avgSmashFactor.toFixed(2)} suggests room to improve strike quality.`);
    recommendedDrills.push({
      name: "Impact Bag or Tee Drill",
      description: "Hit 20 balls focusing on compressing the ball and feeling the clubhead release through impact.",
      durationMin: 8,
      why: "Low smash often comes from poor sequencing or early release."
    });
    swingScore -= 6;
  }

  // === Club Speed ===
  if (avgClubSpeed > 95) {
    strengths.push("Strong club speed");
  } else if (avgClubSpeed < 85) {
    focusAreas.push("Club speed development");
    recommendedDrills.push({
      name: "Overspeed Training",
      description: "Alternate 5 normal swings with 5 swings using a lighter training club or alignment stick. Focus on smooth acceleration.",
      durationMin: 6,
      why: "Building speed without losing control."
    });
  }

  // === Launch & Spin (Ball Flight) ===
  if (avgLaunchAngle >= 10 && avgLaunchAngle <= 16) {
    strengths.push("Good launch window for irons/driver");
  } else if (avgLaunchAngle < 8) {
    focusAreas.push("Launch angle");
    keyInsights.push("Low launch can reduce carry distance.");
    recommendedDrills.push({
      name: "Low Tee / Forward Ball Position Drill",
      description: "Place ball slightly forward in stance and focus on sweeping the ball off the tee or turf with good extension.",
      durationMin: 7,
      why: "Helps increase dynamic loft and launch."
    });
  }

  if (avgSpinRate > 2800 && avgCarry > 160) {
    focusAreas.push("Spin management");
    keyInsights.push("Higher spin may be costing distance on some shots.");
  }

  // === Accuracy / Dispersion ===
  if (Math.abs(avgDispersion) < 8) {
    strengths.push("Tight dispersion — great accuracy");
    swingScore += 7;
  } else if (Math.abs(avgDispersion) > 18) {
    focusAreas.push("Dispersion & shot shape control");
    keyInsights.push(`Average offline of ${avgDispersion.toFixed(1)} yards indicates a consistent miss pattern.`);
    recommendedDrills.push({
      name: "Alignment Stick Gate Drill",
      description: "Set two alignment sticks to create a narrow gate at target. Hit 15 balls trying to start the ball through the gate.",
      durationMin: 10,
      why: "Improves path and face control at impact."
    });
    swingScore -= 5;
  }

  // === Overall Score Calculation ===
  // Bonus for high shot count (good practice volume)
  if (shotCount >= 15) swingScore += 3;
  if (shotCount >= 25) swingScore += 2;

  swingScore = Math.max(55, Math.min(98, Math.round(swingScore)));

  // === Generate Overall Feedback ===
  let overallFeedback = `Great session in Bay! `;
  if (strengths.length > 0) {
    overallFeedback += `You showed real strength in ${strengths.join(" and ").toLowerCase()}. `;
  }
  if (focusAreas.length > 0) {
    overallFeedback += `The main opportunities this session were around ${focusAreas.join(" and ").toLowerCase()}. `;
  }
  overallFeedback += `We built a focused 7-day training plan below based on these results.`;

  // === Default Drills if none added ===
  if (recommendedDrills.length === 0) {
    recommendedDrills.push({
      name: "Mirror or Video Review Drill",
      description: "Record 10 swings from DTL and compare to your best previous session. Focus on posture and sequencing.",
      durationMin: 8,
      why: "Even good swings benefit from deliberate practice and self-awareness."
    });
  }

  // Limit to 3 best drills
  const topDrills = recommendedDrills.slice(0, 3);

  return {
    swingScore,
    strengths: strengths.length > 0 ? strengths : ["Solid overall session"],
    focusAreas: focusAreas.length > 0 ? focusAreas : ["Consistency & refinement"],
    keyInsights,
    recommendedDrills: topDrills,
    gsproSummary: `${shotCount} shots • Avg Club Speed ${avgClubSpeed.toFixed(1)} mph • Smash ${avgSmashFactor.toFixed(2)} • Dispersion ${avgDispersion.toFixed(1)} yds`,
    overallFeedback
  };
}

// Helper to generate an adaptive Training Plan from analysis
export function generateTrainingPlan(analysis: AnalysisResult, userGoals?: string[]): any {
  const planTitle = analysis.focusAreas.length > 0 
    ? `Focus: ${analysis.focusAreas[0]}` 
    : "Refine & Maintain";

  const drills = analysis.recommendedDrills.map((drill, index) => ({
    ...drill,
    id: `drill-${Date.now()}-${index}`,
    completed: false,
    order: index + 1
  }));

  return {
    title: planTitle,
    focus_areas: analysis.focusAreas,
    drills,
    duration_days: 7,
    status: "active"
  };
}