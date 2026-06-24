import Papa from 'papaparse';

export interface NormalizedShot {
  club: string;
  ball_speed: number | null;
  club_speed: number | null;
  smash_factor: number | null;
  launch_angle: number | null;
  spin_rate: number | null;
  carry: number | null;
  offline: number | null;
}

export interface ParsedGSProSession {
  shots: NormalizedShot[];
  summary: {
    shot_count: number;
    avg_club_speed: number;
    avg_ball_speed: number;
    avg_smash_factor: number;
    avg_launch_angle: number;
    avg_spin_rate: number;
    avg_carry: number;
  };
}

function getNumericValue(row: any, keys: string[]): number | null {
  for (const key of keys) {
    const val = row[key];
    if (val != null && val !== '') {
      const num = parseFloat(val);
      if (!isNaN(num)) return num;
    }
  }
  return null;
}

export function parseGSProCSV(csvContent: string): ParsedGSProSession {
  const results = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
  const raw = results.data as any[];

  const shots: NormalizedShot[] = raw
    .filter(r => r && Object.keys(r).length > 3)
    .map(row => ({
      club: row.Club || row['Club Type'] || 'Unknown',
      ball_speed: getNumericValue(row, ['BallSpeed', 'Ball Speed']),
      club_speed: getNumericValue(row, ['ClubSpeed', 'Club Speed']),
      smash_factor: getNumericValue(row, ['SmashFactor', 'Smash Factor']),
      launch_angle: getNumericValue(row, ['LaunchAngle', 'VLA']),
      spin_rate: getNumericValue(row, ['BackSpin', 'SpinRate']),
      carry: getNumericValue(row, ['Carry', 'rawCarryGame']),
      offline: getNumericValue(row, ['Offline', 'Dispersion']),
    }))
    .filter(s => s.club_speed !== null);

  const avg = (arr: (number | null)[]) => {
    const valid = arr.filter((v): v is number => v !== null);
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : 0;
  };

  return {
    shots,
    summary: {
      shot_count: shots.length,
      avg_club_speed: avg(shots.map(s => s.club_speed)),
      avg_ball_speed: avg(shots.map(s => s.ball_speed)),
      avg_smash_factor: avg(shots.map(s => s.smash_factor)),
      avg_launch_angle: avg(shots.map(s => s.launch_angle)),
      avg_spin_rate: avg(shots.map(s => s.spin_rate)),
      avg_carry: avg(shots.map(s => s.carry)),
    }
  };
}