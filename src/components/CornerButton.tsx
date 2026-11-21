import React from 'react';

export type CornerVariant = 'default' | 'primary' | 'emerald';
export type CornerSize = 'sm' | 'md';

export interface CornerButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
  accentSuffix?: string;
  icon?: React.ReactNode;
  variant?: CornerVariant;
  size?: CornerSize;
  compactCorners?: boolean;
  fullWidth?: boolean;
}

const CornerBracketSvg: React.FC<{ positionClass: string }> = ({ positionClass }) => (
  <svg
    className={`corner-bracket ${positionClass}`}
    viewBox="0 0 29 29"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M11.4381 1L0 1V0L11.4381 1.78814e-07C12.6316 -2.98023e-07 13.7762 0.474106 14.6201 1.31802L27.1577 13.8555C28.0016 14.6995 28.4757 15.8441 28.4757 17.0375V28.4757H27.4757V17.0375C27.4757 16.1093 27.1069 15.219 26.4505 14.5627L13.913 2.02513C13.2566 1.36875 12.3664 1 11.4381 1Z"
    />
  </svg>
);

export const CornerButton: React.FC<CornerButtonProps> = ({
  label,
  accentSuffix,
  icon,
  variant = 'default',
  size = 'md',
  compactCorners = false,
  fullWidth = false,
  className = '',
  type = 'button',
  ...rest
}) => {
  const baseChars = Array.from(label);
  const sepChars = accentSuffix ? [' ', '\\', ' '] : [];
  const suffixChars = accentSuffix ? Array.from(accentSuffix) : [];

  let animIdx = 0;

  return (
    <button
      type={type}
      className={`corner-btn corner-variant-${variant} corner-size-${size} ${
        compactCorners ? 'corner-compact' : ''
      } ${fullWidth ? 'w-full justify-between' : ''} ${className}`.trim()}
      {...rest}
    >
      <span className="corner-txt">
        {baseChars.map((ch, idx) => {
          const isSpace = ch === ' ';
          const i = isSpace ? 0 : animIdx++;
          return (
            <span
              key={`b-${idx}`}
              className="corner-letter"
              style={{ '--i': i } as React.CSSProperties}
            >
              {isSpace ? '\u00A0' : ch}
            </span>
          );
        })}
        {sepChars.map((ch, idx) => {
          const isSpace = ch === ' ';
          const i = isSpace ? 0 : animIdx++;
          return (
            <span
              key={`s-${idx}`}
              className={`corner-letter ${ch === '\\' ? 'lighter' : ''}`}
              style={{ '--i': i } as React.CSSProperties}
            >
              {isSpace ? '\u00A0' : ch}
            </span>
          );
        })}
        {suffixChars.map((ch, idx) => {
          const isSpace = ch === ' ';
          const i = isSpace ? 0 : animIdx++;
          return (
            <span
              key={`a-${idx}`}
              className="corner-letter bold"
              style={{ '--i': i } as React.CSSProperties}
            >
              {isSpace ? '\u00A0' : ch}
            </span>
          );
        })}
      </span>

      {icon && <span className="corner-icon">{icon}</span>}

      <CornerBracketSvg positionClass="top left rot-270" />
      <CornerBracketSvg positionClass="top right" />
      <CornerBracketSvg positionClass="bottom left rot-180" />
      <CornerBracketSvg positionClass="bottom right rot-90" />
    </button>
  );
};
