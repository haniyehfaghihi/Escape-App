import Svg, { Path } from 'react-native-svg';
import { IconProps } from './IconProps';

export function WalletSuccessCheckIcon({
  size = 8,
  width,
  height,
  color = '#04B968',
  ...props
}: IconProps & { color?: string }) {
  const w = width ?? (size * 12) / 8;
  const h = height ?? size;

  return (
    <Svg width={w} height={h} viewBox="0 0 12 8" fill="none" {...props}>
      <Path
        d="M0.75 3.75L3.34123 6.41527C3.52446 6.60373 3.82233 6.61814 4.0229 6.44825L10.75 0.75"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}
