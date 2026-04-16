import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { colors } from '../../theme/colors';
import type { BaselineTestId } from '../../data/baselineTests';

interface Props {
  kind: BaselineTestId;
  size?: number;
}

/**
 * Minimal line-art illustrations for each baseline test. Abstract on purpose:
 * they communicate the movement shape without dictating anatomy.
 */
export const MoveIllustration: React.FC<Props> = ({ kind, size = 160 }) => {
  const stroke = colors.LIME;
  const muted = colors.GRAY2;
  const common = { width: size, height: size, viewBox: '0 0 160 160', fill: 'none' as const };

  switch (kind) {
    case 'squat':
      return (
        <Svg {...common}>
          <Circle cx={80} cy={36} r={10} stroke={stroke} strokeWidth={2.5} />
          <Path
            d="M80 46v34M80 80l-18 18M80 80l18 18M62 98v18M98 98v18"
            stroke={stroke}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <Line x1={36} y1={130} x2={124} y2={130} stroke={muted} strokeWidth={2} strokeDasharray="4 5" />
        </Svg>
      );
    case 'pushup':
      return (
        <Svg {...common}>
          <Circle cx={34} cy={80} r={10} stroke={stroke} strokeWidth={2.5} />
          <Path
            d="M44 80h76M44 80l20 22M60 102l64 10"
            stroke={stroke}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <Line x1={24} y1={120} x2={140} y2={120} stroke={muted} strokeWidth={2} strokeDasharray="4 5" />
        </Svg>
      );
    case 'plank':
      return (
        <Svg {...common}>
          <Circle cx={36} cy={68} r={10} stroke={stroke} strokeWidth={2.5} />
          <Path
            d="M46 70l74 18M46 70l16 50M120 88l-4 32"
            stroke={stroke}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <Line x1={24} y1={128} x2={140} y2={128} stroke={muted} strokeWidth={2} strokeDasharray="4 5" />
        </Svg>
      );
    case 'hinge':
      return (
        <Svg {...common}>
          <Circle cx={56} cy={40} r={10} stroke={stroke} strokeWidth={2.5} />
          <Path
            d="M62 48l30 36M92 84l18 14M92 84l-4 38M56 132v-18"
            stroke={stroke}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Line x1={24} y1={142} x2={140} y2={142} stroke={muted} strokeWidth={2} strokeDasharray="4 5" />
        </Svg>
      );
    default:
      return <Svg {...common}><Rect width="160" height="160" fill="none" /></Svg>;
  }
};
