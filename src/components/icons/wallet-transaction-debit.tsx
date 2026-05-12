import Svg, { Path, Rect } from "react-native-svg";
import { IconProps } from "./IconProps";

export function WalletTransactionDebitIcon({
  size = 38,
  width,
  height,
  ...props
}: IconProps) {
  const w = width ?? size;
  const h = height ?? size;

  return (
    <Svg width={w} height={h} viewBox="0 0 38 38" fill="none" {...props}>
      <Rect width={38} height={38} rx={8} fill="#F21543" fillOpacity={0.1} />
      <Path
        d="M11.3905 18.0565C11.6406 17.8065 11.9797 17.666 12.3333 17.666H25.6667C26.0203 17.666 26.3594 17.8065 26.6095 18.0565C26.8595 18.3066 27 18.6457 27 18.9993C27 19.353 26.8595 19.6921 26.6095 19.9422C26.3594 20.1922 26.0203 20.3327 25.6667 20.3327H12.3333C11.9797 20.3327 11.6406 20.1922 11.3905 19.9422C11.1405 19.6921 11 19.353 11 18.9993C11 18.6457 11.1405 18.3066 11.3905 18.0565Z"
        fill="#F21543"
      />
    </Svg>
  );
}
