import Papa from 'papaparse';

export interface ParsedGSProMetrics {
  avgClubSpeed: number;
  avgBallSpeed: number;
  avgSmashFactor: number;
  avgLaunchAngle: number;
  avgSpinRate: number;
  avgCarry: number;
  avgDispersion: number;
  shotCount: number;
  rawShots: any[];
}

// Helper function to find a value using multiple possible column names
function getValue(shot: any, possibleNames: string[]): number | null {
  for (const name of possibleNames) {
    if (shot[name] !== undefined && shot[name] !== null && shot[name] !== '') {
      const val = Number(shot[name]);
      if (!isNaN(val)) return val;
    }
  }
  return null;
}

export function parseGSProCSV(csvContent: string): ParsedGSProMetrics {
  const results = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  const shots = results.data as any[];
  const validShots = shots.filter(s => s && Object.keys(s).length > 5);

  if (validShots.length === 0) {
    throw new Error("No valid shots found in CSV. Make sure you exported from GSPro Practice Range.");
  }

  let totalClub = 0, totalBall = 0, totalSmash = 0;
  let totalLaunch = 0, totalSpin = 0, totalCarry = 0, totalDisp = 0;
  let count = 0;

  validShots.forEach(shot => {
    // Try many possible column name variations
    const clubSpeed = getValue(shot, ['ClubSpeed', 'Club Speed', 'club_speed', 'Club_Speed']);
    const ballSpeed = getValue(shot, ['BallSpeed', 'Ball Speed', 'ball_speed']);
    const smash = getValue(shot, ['SmashFactor', 'Smash Factor', 'smash_factor']);
    const launch = getValue(shot, ['LaunchAngle', 'Launch Angle', 'VLA', 'launch_angle']);
    const spin = getValue(shot, ['BackSpin', 'SpinRate', 'Spin Rate', 'spin_rate']);
    const carry = getValue(shot, ['Carry', 'rawCarryGame', 'rawCarryLM', 'CarryTotalDistance']);
    const offline = getValue(shot, ['Offline', 'Dispersion', 'offline']);

    if (clubSpeed !== null) { totalClub += clubSpeed; count++; }
    if (ballSpeed !== null) totalBall += ballSpeed;
    if (smash !== null) totalSmash += smash;
    if (launch !== null) totalLaunch += launch;
    if (spin !== null) totalSpin += spin;
    if (carry !== null) totalCarry += carry;
    if (offline !== null) totalDisp += offline;
  });

  const n = count || 1;

  return {
    avgClubSpeed: totalClub / n,
    avgBallSpeed: totalBall / n,
    avgSmashFactor: totalSmash / n,
    avgLaunchAngle: totalLaunch / n,
    avgSpinRate: totalSpin / n,
    avgCarry: totalCarry / n,
    avgDispersion: totalDisp / n,
    shotCount: n,
    rawShots: validShots
  };
}