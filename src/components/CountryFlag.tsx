import * as flags from 'country-flag-icons/react/3x2';

interface CountryFlagProps {
  countryCode: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'w-6 h-4',
  md: 'w-8 h-6',
  lg: 'w-12 h-8',
  xl: 'w-16 h-12',
};

export function CountryFlag({ countryCode, className = '', size = 'md' }: CountryFlagProps) {
  if (countryCode === 'SCO') {
    return <ScotlandFlag className={className} size={size} />;
  }

  // Convert FIFA codes to ISO 3166-1 alpha-2 codes
  const isoCode = fifaToIsoCode(countryCode);
  
  // Get the flag component dynamically
  const FlagComponent = (flags as any)[isoCode];
  
  if (!FlagComponent) {
    // Fallback to emoji if flag not found
    return <span className={className}>🏴</span>;
  }
  
  return (
    <FlagComponent 
      className={`${sizeClasses[size]} ${className} rounded shadow-sm border border-white/10`}
      title={countryCode}
    />
  );
}

function ScotlandFlag({ className = '', size }: Pick<CountryFlagProps, 'className' | 'size'>) {
  return (
    <svg
      viewBox="0 0 60 40"
      className={`${sizeClasses[size ?? 'md']} ${className} rounded shadow-sm border border-white/10`}
      role="img"
      aria-label="Scotland flag"
    >
      <title>Scotland</title>
      <rect width="60" height="40" fill="#005EB8" />
      <path d="M0 0L60 40M60 0L0 40" stroke="#FFFFFF" strokeWidth="8" />
    </svg>
  );
}

// Map FIFA codes to ISO 3166-1 alpha-2 codes
function fifaToIsoCode(fifaCode: string): string {
  const codeMap: Record<string, string> = {
    // North America
    'MEX': 'MX',
    'USA': 'US',
    'CAN': 'CA',
    'HAI': 'HT',
    'CUW': 'CW',
    'CRC': 'CR',
    'PAN': 'PA',
    'JAM': 'JM',
    'TTO': 'TT',
    
    // South America
    'BRA': 'BR',
    'ARG': 'AR',
    'URU': 'UY',
    'COL': 'CO',
    'CHI': 'CL',
    'PAR': 'PY',
    'PER': 'PE',
    'ECU': 'EC',
    'VEN': 'VE',
    'BOL': 'BO',
    
    // Europe
    'GER': 'DE',
    'ESP': 'ES',
    'FRA': 'FR',
    'ENG': 'GB-ENG',
    'ITA': 'IT',
    'POR': 'PT',
    'NED': 'NL',
    'BEL': 'BE',
    'SUI': 'CH',
    'AUT': 'AT',
    'POL': 'PL',
    'SWE': 'SE',
    'DEN': 'DK',
    'CRO': 'HR',
    'SRB': 'RS',
    'UKR': 'UA',
    'WAL': 'GB-WLS',
    'SCO': 'GB-SCT',
    'NIR': 'GB-NIR',
    'TUR': 'TR',
    'GRE': 'GR',
    'CZE': 'CZ',
    'ROU': 'RO',
    'SVK': 'SK',
    'NOR': 'NO',
    'HUN': 'HU',
    'ISL': 'IS',
    'BIH': 'BA',
    'SVN': 'SI',
    'FIN': 'FI',
    'ALB': 'AL',
    'BUL': 'BG',
    'MKD': 'MK',
    
    // Africa
    'RSA': 'ZA',
    'NGR': 'NG',
    'SEN': 'SN',
    'GHA': 'GH',
    'CIV': 'CI',
    'CMR': 'CM',
    'MAR': 'MA',
    'TUN': 'TN',
    'ALG': 'DZ',
    'EGY': 'EG',
    'MLI': 'ML',
    'BFA': 'BF',
    'GUI': 'GN',
    'CPV': 'CV',
    'GAB': 'GA',
    'CGO': 'CG',
    'COD': 'CD',
    'UGA': 'UG',
    'ZAM': 'ZM',
    'ZIM': 'ZW',
    'BEN': 'BJ',
    'TOG': 'TG',
    'KEN': 'KE',
    'TAN': 'TZ',
    
    // Asia
    'JPN': 'JP',
    'KOR': 'KR',
    'IRN': 'IR',
    'KSA': 'SA',
    'AUS': 'AU',
    'QAT': 'QA',
    'IRQ': 'IQ',
    'UAE': 'AE',
    'CHN': 'CN',
    'OMA': 'OM',
    'UZB': 'UZ',
    'THA': 'TH',
    'VIE': 'VN',
    'IND': 'IN',
    'BHR': 'BH',
    'JOR': 'JO',
    'KUW': 'KW',
    'LIB': 'LB',
    'SYR': 'SY',
    'PAL': 'PS',
    
    // Oceania
    'NZL': 'NZ',
  };
  
  return codeMap[fifaCode] || fifaCode;
}
