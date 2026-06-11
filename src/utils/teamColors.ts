// Team color mappings for visual enhancement
export const teamColors: Record<string, { primary: string; secondary: string }> = {
  // North America
  'MEX': { primary: '#006847', secondary: '#CE1126' },
  'USA': { primary: '#B22234', secondary: '#3C3B6E' },
  'CAN': { primary: '#FF0000', secondary: '#FFFFFF' },
  'CRC': { primary: '#002B7F', secondary: '#CE1126' },
  'PAN': { primary: '#DA291C', secondary: '#005293' },
  'JAM': { primary: '#009B3A', secondary: '#FED100' },
  
  // South America
  'BRA': { primary: '#009C3B', secondary: '#FFDF00' },
  'ARG': { primary: '#74ACDF', secondary: '#FFFFFF' },
  'URU': { primary: '#0038A8', secondary: '#FFFFFF' },
  'COL': { primary: '#FCD116', secondary: '#003893' },
  'CHI': { primary: '#D52B1E', secondary: '#0033A0' },
  'PAR': { primary: '#D52B1E', secondary: '#0038A8' },
  'PER': { primary: '#D91023', secondary: '#FFFFFF' },
  'ECU': { primary: '#FFD100', secondary: '#034EA2' },
  
  // Europe
  'GER': { primary: '#000000', secondary: '#DD0000' },
  'ESP': { primary: '#C60B1E', secondary: '#FFC400' },
  'FRA': { primary: '#002395', secondary: '#ED2939' },
  'ENG': { primary: '#FFFFFF', secondary: '#CF142B' },
  'ITA': { primary: '#009246', secondary: '#FFFFFF' },
  'POR': { primary: '#006600', secondary: '#FF0000' },
  'NED': { primary: '#FF4F00', secondary: '#FFFFFF' },
  'BEL': { primary: '#ED2939', secondary: '#FDDA24' },
  'SUI': { primary: '#FF0000', secondary: '#FFFFFF' },
  'AUT': { primary: '#ED2939', secondary: '#FFFFFF' },
  'POL': { primary: '#DC143C', secondary: '#FFFFFF' },
  'SWE': { primary: '#006AA7', secondary: '#FECC00' },
  'DEN': { primary: '#C60C30', secondary: '#FFFFFF' },
  'CRO': { primary: '#FF0000', secondary: '#FFFFFF' },
  'SRB': { primary: '#C6363C', secondary: '#0C4076' },
  'UKR': { primary: '#0057B7', secondary: '#FFD700' },
  'WAL': { primary: '#00A651', secondary: '#C8102E' },
  'SCO': { primary: '#0065BF', secondary: '#FFFFFF' },
  'TUR': { primary: '#E30A17', secondary: '#FFFFFF' },
  'CZE': { primary: '#11457E', secondary: '#D7141A' },
  'NOR': { primary: '#BA0C2F', secondary: '#00205B' },
  'HUN': { primary: '#436F4D', secondary: '#CD2A3E' },
  
  // Africa
  'RSA': { primary: '#007A4D', secondary: '#FFB81C' },
  'NGR': { primary: '#008751', secondary: '#FFFFFF' },
  'SEN': { primary: '#00853F', secondary: '#FDEF42' },
  'GHA': { primary: '#006B3F', secondary: '#FCD116' },
  'CIV': { primary: '#FF9A00', secondary: '#00CD00' },
  'CMR': { primary: '#007A5E', secondary: '#CE1126' },
  'MAR': { primary: '#C1272D', secondary: '#006233' },
  'TUN': { primary: '#E70013', secondary: '#FFFFFF' },
  'ALG': { primary: '#006233', secondary: '#FFFFFF' },
  'EGY': { primary: '#CE1126', secondary: '#000000' },
  
  // Asia
  'JPN': { primary: '#BC002D', secondary: '#FFFFFF' },
  'KOR': { primary: '#003478', secondary: '#CD2E3A' },
  'IRN': { primary: '#239F40', secondary: '#DA0000' },
  'KSA': { primary: '#165B33', secondary: '#FFFFFF' },
  'AUS': { primary: '#FFC800', secondary: '#00843D' },
  'QAT': { primary: '#8A1538', secondary: '#FFFFFF' },
  'IRQ': { primary: '#CE1126', secondary: '#007A3D' },
  'UAE': { primary: '#00732F', secondary: '#FF0000' },
  'CHN': { primary: '#DE2910', secondary: '#FFDE00' },
  'JOR': { primary: '#007A3D', secondary: '#CE1126' },
  
  // Oceania
  'NZL': { primary: '#000000', secondary: '#FFFFFF' },
};

export function getTeamColors(code: string): { primary: string; secondary: string } {
  return teamColors[code] || { primary: '#0a84ff', secondary: '#FFFFFF' };
}

// Group color scheme for visual variety
export const groupColors: Record<string, string> = {
  'A': '#FF6B6B', // Red
  'B': '#4ECDC4', // Teal
  'C': '#FFE66D', // Yellow
  'D': '#95E1D3', // Mint
  'E': '#F38181', // Pink
  'F': '#AA96DA', // Purple
  'G': '#FCBAD3', // Light Pink
  'H': '#A8D8EA', // Light Blue
  'I': '#FFB6B9', // Salmon
  'J': '#B4E7CE', // Light Green
  'K': '#FFD93D', // Gold
  'L': '#C7CEEA', // Lavender
};

export function getGroupColor(group: string): string {
  return groupColors[group] || '#0a84ff';
}

// Stage colors
export const stageColors: Record<string, string> = {
  'ROUND_OF_32': '#FF6B6B',
  'ROUND_OF_16': '#4ECDC4',
  'QUARTER_FINAL': '#FFE66D',
  'SEMI_FINAL': '#AA96DA',
  'THIRD_PLACE': '#95E1D3',
  'FINAL': '#F9CA24',
};

export function getStageColor(stage: string): string {
  return stageColors[stage] || '#0a84ff';
}
