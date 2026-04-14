import React, { useState } from 'react';

const COLORS = [
  'bg-orange-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400',
  'bg-pink-400', 'bg-teal-400', 'bg-yellow-400', 'bg-indigo-400',
];

function colorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface ClubLogoProps {
  logo: string;
  name: string;
  className?: string;
}

const ClubLogo: React.FC<ClubLogoProps> = ({ logo, name, className = '' }) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`${colorFromName(name)} ${className} flex items-center justify-center text-white font-bold text-lg select-none overflow-hidden flex-shrink-0`}>
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <div className={`${className} overflow-hidden flex-shrink-0 relative`}>
      <img
        src={logo}
        alt={name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
};

export default ClubLogo;
