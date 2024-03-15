import React, { memo, ReactElement } from "react";

interface IconProps {
  size?: number;
  fill?: string;
  viewBox?: string;
  width?: number;
  height?: number;
  rectFill?: string;
}

interface SvgWrapProps {
  viewBox?: string;
  ratio?: number;
}

const defaultViewBox = "0 0 24 24";

export const SvgWrap = ({
  width = 24,
  height = 24,
  fill = "#000",
  viewBox = defaultViewBox,
  ratio = 1,
  rectFill,
  children,
}: IconProps & SvgWrapProps & { children: ReactElement }): ReactElement => (
  <svg
    data-testid="svg_wrap"
    fill={fill}
    height={height}
    viewBox={viewBox}
    width={width * ratio}
    xmlns="http://www.w3.org/2000/svg"
    fillRule="evenodd"
    clipRule="evenodd"
  >
    {rectFill && <rect width={width} height={height} rx="7" fill={rectFill} />}
    {children}
  </svg>
);

const getRatioFromViewBox = (viewBox: string): number => {
  const [, , width, height] = viewBox.split(" ");
  return +width / +height;
};

export function withSvgWrap(
  iconBody: ReactElement | string,
  svgWrapProps: SvgWrapProps = {}
): React.ComponentType<IconProps> {
  const { viewBox = defaultViewBox, ratio } = svgWrapProps;
  const targetRatio = ratio || getRatioFromViewBox(viewBox);

  const SvgIcon: React.FC<IconProps> = (props) => (
    <SvgWrap ratio={targetRatio} viewBox={viewBox} {...props}>
      {typeof iconBody === "string" ? <path d={iconBody} /> : iconBody}
    </SvgWrap>
  );

  return memo(SvgIcon);
}
