import React from 'react';
import Svg, {
  Circle,
  Path,
  Rect,
  G,
  Line,
  Polyline,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

const DEFAULT = 24;

export const FireIcon: React.FC<IconProps> = ({ size = DEFAULT, color = '#E8FF6B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2s4 4 4 8a4 4 0 01-8 0c0-1 .5-2 1-3-1 1-3 3-3 6a6 6 0 0012 0c0-5-6-11-6-11z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

export const DumbbellIcon: React.FC<IconProps> = ({ size = DEFAULT, color = '#E8FF6B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="9" width="2.5" height="6" rx="1" fill={color} />
    <Rect x="4.5" y="7" width="2.5" height="10" rx="1" fill={color} />
    <Rect x="17" y="7" width="2.5" height="10" rx="1" fill={color} />
    <Rect x="19.5" y="9" width="2.5" height="6" rx="1" fill={color} />
    <Rect x="7" y="11" width="10" height="2" fill={color} />
  </Svg>
);

export const TargetIcon: React.FC<IconProps> = ({ size = DEFAULT, color = '#E8FF6B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.6} />
    <Circle cx="12" cy="12" r="5" stroke={color} strokeWidth={1.6} />
    <Circle cx="12" cy="12" r="1.6" fill={color} />
  </Svg>
);

export const HeartPulseIcon: React.FC<IconProps> = ({ size = DEFAULT, color = '#E8FF6B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
    <Polyline
      points="8,12 10,12 11,10 13,14 14,12 16,12"
      stroke={color}
      strokeWidth={1.4}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BoltIcon: React.FC<IconProps> = ({ size = DEFAULT, color = '#E8FF6B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill={color} />
  </Svg>
);

export const MountainIcon: React.FC<IconProps> = ({ size = DEFAULT, color = '#E8FF6B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 20L9 9l4 6 2-3 6 8z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
  </Svg>
);

export const BrainIcon: React.FC<IconProps> = ({ size = DEFAULT, color = '#E8FF6B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 4a3 3 0 00-3 3v1a3 3 0 00-2 3 3 3 0 002 3v1a3 3 0 003 3h1V4H9zM15 4a3 3 0 013 3v1a3 3 0 012 3 3 3 0 01-2 3v1a3 3 0 01-3 3h-1V4h1z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

export const LoopIcon: React.FC<IconProps> = ({ size = DEFAULT, color = '#E8FF6B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 12a8 8 0 0114-5M20 12a8 8 0 01-14 5"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      fill="none"
    />
    <Polyline points="17,3 18,7 14,8" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    <Polyline points="7,21 6,17 10,16" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
  </Svg>
);

export const GymIcon: React.FC<IconProps> = ({ size = DEFAULT, color = '#E8FF6B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="9" width="3" height="6" rx="1" fill={color} />
    <Rect x="19" y="9" width="3" height="6" rx="1" fill={color} />
    <Rect x="5" y="7" width="3" height="10" rx="1" fill={color} />
    <Rect x="16" y="7" width="3" height="10" rx="1" fill={color} />
    <Rect x="8" y="11" width="8" height="2" fill={color} />
  </Svg>
);

export const HomeIcon: React.FC<IconProps> = ({ size = DEFAULT, color = '#E8FF6B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 11l9-8 9 8v9a2 2 0 01-2 2h-4v-6h-6v6H5a2 2 0 01-2-2z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" fill="none" />
  </Svg>
);

export const BodyIcon: React.FC<IconProps> = ({ size = DEFAULT, color = '#E8FF6B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="4" r="2" stroke={color} strokeWidth={1.6} />
    <Path d="M12 6v6M8 9l4-2 4 2M9 22l3-10 3 10" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

export const QuestionIcon: React.FC<IconProps> = ({ size = DEFAULT, color = '#E8FF6B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.6} />
    <Path d="M9.5 9a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    <Circle cx="12" cy="17" r="1" fill={color} />
  </Svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = DEFAULT, color = '#0D0D0D' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline
      points="5,12 10,17 19,7"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

export const LockIcon: React.FC<IconProps> = ({ size = DEFAULT, color = '#E8FF6B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth={1.6} fill="none" />
    <Path d="M8 11V8a4 4 0 018 0v3" stroke={color} strokeWidth={1.6} fill="none" />
  </Svg>
);

export const GoogleIcon: React.FC<IconProps> = ({ size = DEFAULT }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4" />
    <Path d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1a5.9 5.9 0 01-5.6-4.1H3.1v2.6A10 10 0 0012 22z" fill="#34A853" />
    <Path d="M6.4 13.9a6 6 0 010-3.8V7.5H3.1a10 10 0 000 9z" fill="#FBBC05" />
    <Path d="M12 6a5.4 5.4 0 013.8 1.5l2.9-2.9A10 10 0 003.1 7.5l3.3 2.6A5.9 5.9 0 0112 6z" fill="#EA4335" />
  </Svg>
);

export const AppleIcon: React.FC<IconProps> = ({ size = DEFAULT, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16.4 12.7c0-2.7 2.2-4 2.3-4-1.3-1.8-3.2-2.1-3.9-2.1-1.7-.2-3.2 1-4 1-.9 0-2.2-1-3.6-1-1.8 0-3.6 1-4.5 2.7-2 3.3-.5 8.3 1.4 11 .9 1.3 2 2.8 3.5 2.8 1.4-.1 1.9-.9 3.6-.9 1.7 0 2.1.9 3.6.9 1.5 0 2.5-1.4 3.4-2.7 1.1-1.5 1.5-3 1.5-3.1-.1 0-3-1.2-3-4.6zM13.8 4.9c.8-.9 1.3-2.2 1.1-3.4-1.1 0-2.4.7-3.2 1.6-.7.8-1.4 2.1-1.2 3.3 1.2.1 2.4-.6 3.3-1.5z"
      fill={color}
    />
  </Svg>
);

export const CoachAvatarIcon: React.FC<IconProps> = ({ size = 40 }) => (
  <Svg width={size} height={size} viewBox="0 0 40 40">
    <Defs>
      <LinearGradient id="coachGrad" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#E8FF6B" />
        <Stop offset="1" stopColor="#B8E84A" />
      </LinearGradient>
    </Defs>
    <Circle cx="20" cy="20" r="20" fill="url(#coachGrad)" />
    <Circle cx="20" cy="16" r="5" fill="#0D0D0D" />
    <Path d="M10 32c2-5 6-8 10-8s8 3 10 8" fill="#0D0D0D" />
  </Svg>
);

export const HeroIllustration: React.FC<IconProps> = ({ size = 220 }) => (
  <Svg width={size} height={size} viewBox="0 0 220 220">
    <Defs>
      <LinearGradient id="heroBg" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#E8FF6B" stopOpacity="0.25" />
        <Stop offset="1" stopColor="#E8FF6B" stopOpacity="0.02" />
      </LinearGradient>
      <LinearGradient id="heroRing" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#E8FF6B" />
        <Stop offset="1" stopColor="#B8E84A" />
      </LinearGradient>
    </Defs>
    <Circle cx="110" cy="110" r="100" fill="url(#heroBg)" />
    <Circle cx="110" cy="110" r="82" stroke="url(#heroRing)" strokeWidth={3} fill="none" />
    <G>
      <Rect x="58" y="102" width="10" height="16" rx="2" fill="#E8FF6B" />
      <Rect x="68" y="96" width="10" height="28" rx="2" fill="#E8FF6B" />
      <Rect x="142" y="96" width="10" height="28" rx="2" fill="#E8FF6B" />
      <Rect x="152" y="102" width="10" height="16" rx="2" fill="#E8FF6B" />
      <Rect x="78" y="107" width="64" height="6" fill="#E8FF6B" />
    </G>
    <Circle cx="110" cy="60" r="6" fill="#E8FF6B" />
    <Circle cx="160" cy="160" r="5" fill="#E8FF6B" opacity={0.7} />
    <Circle cx="60" cy="160" r="4" fill="#E8FF6B" opacity={0.5} />
  </Svg>
);
