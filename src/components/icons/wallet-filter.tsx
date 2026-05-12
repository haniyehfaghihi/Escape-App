import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { IconProps } from './IconProps';

export function WalletFilterIcon({
  size = 22,
  width,
  height,
  backgroundColor = '#FF6900',
  lineColor = '#FFFFFF',
  ...props
}: IconProps & {
  backgroundColor?: string;
  lineColor?: string;
}) {
  const w = width ?? size;
  const h = height ?? size;

  return (
    <Svg width={w} height={h} viewBox="0 0 22 22" fill="none" {...props}>
      <Rect width={22} height={22} rx={6} fill={backgroundColor} />
      <Path d="M5 8H17" stroke={lineColor} strokeWidth={1.5} strokeLinecap="round" />
      <Path d="M5 14H17" stroke={lineColor} strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx={13} cy={8} r={2} fill={lineColor} />
      <Circle cx={9} cy={14} r={2} fill={lineColor} />
    </Svg>
  );
}
