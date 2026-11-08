import React from 'react';
import type { PieceType, PieceColor } from '../types/chess';

interface PieceProps {
  type: PieceType;
  color: PieceColor;
  className?: string;
  size?: number | string;
}

// Crisp, authentic Neo / Staunton vector SVGs
export const ChessPiece: React.FC<PieceProps> = ({ type, color, className = '', size = '100%' }) => {
  const isWhite = color === 'w';

  // Base fill colors matching Chess.com piece aesthetic:
  // White pieces: clean white/cream body #ffffff with subtle dark outline #181715
  // Black pieces: deep charcoal #302e2b / #262522 with silver/white interior accents
  const pieceKey = `${color}${type.toUpperCase()}`;

  const renderSvgContent = () => {
    switch (pieceKey) {
      case 'wP': // White Pawn
        return (
          <svg viewBox="0 0 45 45" width={size} height={size} className={className}>
            <path
              d="m22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
              fill="#ffffff"
              stroke="#1b1a17"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        );

      case 'bP': // Black Pawn
        return (
          <svg viewBox="0 0 45 45" width={size} height={size} className={className}>
            <path
              d="m22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
              fill="#272522"
              stroke="#1b1a17"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path d="m22.5 10c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3z" fill="#3d3a36" />
          </svg>
        );

      case 'wN': // White Knight
        return (
          <svg viewBox="0 0 45 45" width={size} height={size} className={className}>
            <g fill="none" fillRule="evenodd" stroke="#1b1a17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path
                d="m 22,10 c 10.5,1 16.5,8 16,29 L 15,39 C 15,30 9.65,24.4 7,20 9,19 11,18 11,16 11,14 10,12 8,11 c 4.5,-2 11,-2 14,3 z"
                fill="#ffffff"
              />
              <path
                d="m 24,18 c 0.38,2.91 -5.55,7.37 -8,9 -3,2 -2.82,4.34 -5,4 -1.04,-0.94 -1.12,-2.72 0,-4 1.5,-1.7 4,-3.5 5,-6 1.5,-3.8 2.5,-6 8,-3 z"
                fill="#ffffff"
              />
              <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" fill="#1b1a17" />
              <path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" fill="#1b1a17" />
            </g>
          </svg>
        );

      case 'bN': // Black Knight
        return (
          <svg viewBox="0 0 45 45" width={size} height={size} className={className}>
            <g fill="none" fillRule="evenodd" stroke="#1b1a17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path
                d="m 22,10 c 10.5,1 16.5,8 16,29 L 15,39 C 15,30 9.65,24.4 7,20 9,19 11,18 11,16 11,14 10,12 8,11 c 4.5,-2 11,-2 14,3 z"
                fill="#272522"
              />
              <path
                d="m 24,18 c 0.38,2.91 -5.55,7.37 -8,9 -3,2 -2.82,4.34 -5,4 -1.04,-0.94 -1.12,-2.72 0,-4 1.5,-1.7 4,-3.5 5,-6 1.5,-3.8 2.5,-6 8,-3 z"
                fill="#3d3a36"
              />
              <path d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5,25.5 A 0.5 0.5 0 1 1 9.5 25.5 z" fill="#e0dedb" />
              <path d="M 15 15.5 A 0.5 1.5 0 1 1 14,15.5 A 0.5 1.5 0 1 1 15 15.5 z" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" fill="#e0dedb" />
            </g>
          </svg>
        );

      case 'wB': // White Bishop
        return (
          <svg viewBox="0 0 45 45" width={size} height={size} className={className}>
            <g fill="none" fillRule="evenodd" stroke="#1b1a17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <g fill="#ffffff" strokeLinecap="butt">
                <path d="m 9,36 c 3.39,-0.97 10.11,0.43 13.5,-2 3.39,2.43 10.11,1.03 13.5,2 0,0 1.65,0.54 3,2 -0.68,0.97 -1.65,0.99 -3,1 -3.39,-0.21 -10.11,0.46 -13.5,-1 -3.39,1.46 -10.11,0.79 -13.5,1 -1.35,-0.01 -2.32,-0.03 -3,-1 1.35,-1.46 3,-2 3,-2 z" />
                <path d="m 15,32 c 2.5,2.5 12.5,2.5 15,0 0.5,-1.5 0,-2 0,-2 0,-2.5 -2.5,-4 -2.5,-4 5.5,-1.5 6,-11.5 -5,-15.5 -11,4 -10.5,14 -5,15.5 0,0 -2.5,1.5 -2.5,4 0,0 -0.5,0.5 0,2 z" />
                <path d="m 25,8 a 2.5,2.5 0 1 1 -5,0 2.5,2.5 0 1 1 5,0 z" />
              </g>
              <path d="m 17.5,26 h 10 M 15,30 h 15 m -7.5,-14.5 v 5 m -2.5,-2.5 h 5" stroke="#1b1a17" />
            </g>
          </svg>
        );

      case 'bB': // Black Bishop
        return (
          <svg viewBox="0 0 45 45" width={size} height={size} className={className}>
            <g fill="none" fillRule="evenodd" stroke="#1b1a17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <g fill="#272522" strokeLinecap="butt">
                <path d="m 9,36 c 3.39,-0.97 10.11,0.43 13.5,-2 3.39,2.43 10.11,1.03 13.5,2 0,0 1.65,0.54 3,2 -0.68,0.97 -1.65,0.99 -3,1 -3.39,-0.21 -10.11,0.46 -13.5,-1 -3.39,1.46 -10.11,0.79 -13.5,1 -1.35,-0.01 -2.32,-0.03 -3,-1 1.35,-1.46 3,-2 3,-2 z" />
                <path d="m 15,32 c 2.5,2.5 12.5,2.5 15,0 0.5,-1.5 0,-2 0,-2 0,-2.5 -2.5,-4 -2.5,-4 5.5,-1.5 6,-11.5 -5,-15.5 -11,4 -10.5,14 -5,15.5 0,0 -2.5,1.5 -2.5,4 0,0 -0.5,0.5 0,2 z" />
                <path d="m 25,8 a 2.5,2.5 0 1 1 -5,0 2.5,2.5 0 1 1 5,0 z" />
              </g>
              <path d="m 17.5,26 h 10 M 15,30 h 15 m -7.5,-14.5 v 5 m -2.5,-2.5 h 5" stroke="#e0dedb" />
            </g>
          </svg>
        );

      case 'wR': // White Rook
        return (
          <svg viewBox="0 0 45 45" width={size} height={size} className={className}>
            <g fill="#ffffff" fillRule="evenodd" stroke="#1b1a17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" />
              <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" />
              <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" />
              <path d="M 34,14 L 31,17 L 14,17 L 11,14" />
              <path d="M 14,17 L 14,29.5 L 31,29.5 L 31,17" />
              <path d="M 14,29.5 L 12,32 L 33,32 L 31,29.5" />
              <path d="M 14,17 L 31,17" strokeWidth="1" stroke="#1b1a17" />
            </g>
          </svg>
        );

      case 'bR': // Black Rook
        return (
          <svg viewBox="0 0 45 45" width={size} height={size} className={className}>
            <g fill="#272522" fillRule="evenodd" stroke="#1b1a17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 9,39 L 36,39 L 36,36 L 9,36 L 9,39 z" />
              <path d="M 12,36 L 12,32 L 33,32 L 33,36 L 12,36 z" />
              <path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14" />
              <path d="M 34,14 L 31,17 L 14,17 L 11,14" />
              <path d="M 14,17 L 14,29.5 L 31,29.5 L 31,17" />
              <path d="M 14,29.5 L 12,32 L 33,32 L 31,29.5" />
              <path d="M 14,17 L 31,17" strokeWidth="1" stroke="#e0dedb" />
            </g>
          </svg>
        );

      case 'wQ': // White Queen
        return (
          <svg viewBox="0 0 45 45" width={size} height={size} className={className}>
            <g fill="#ffffff" fillRule="evenodd" stroke="#1b1a17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 9 26 C 17.5 24.5 30 24.5 36 26 L 38 14 L 31 25 L 22.5 10 L 14 25 L 7 14 L 9 26 z" />
              <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 L 34,38.5 C 34,38.5 35.5,37.5 34.5,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z" />
              <circle cx="6" cy="12" r="2" fill="#ffffff" stroke="#1b1a17" strokeWidth="1.5" />
              <circle cx="14" cy="9" r="2" fill="#ffffff" stroke="#1b1a17" strokeWidth="1.5" />
              <circle cx="22.5" cy="8" r="2" fill="#ffffff" stroke="#1b1a17" strokeWidth="1.5" />
              <circle cx="31" cy="9" r="2" fill="#ffffff" stroke="#1b1a17" strokeWidth="1.5" />
              <circle cx="39" cy="12" r="2" fill="#ffffff" stroke="#1b1a17" strokeWidth="1.5" />
              <path d="M 11.5 30 C 15 29 30 29 33.5 30" stroke="#1b1a17" />
              <path d="M 12 33.5 C 18 32.5 27 32.5 33 33.5" stroke="#1b1a17" />
            </g>
          </svg>
        );

      case 'bQ': // Black Queen
        return (
          <svg viewBox="0 0 45 45" width={size} height={size} className={className}>
            <g fill="#272522" fillRule="evenodd" stroke="#1b1a17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 9 26 C 17.5 24.5 30 24.5 36 26 L 38 14 L 31 25 L 22.5 10 L 14 25 L 7 14 L 9 26 z" />
              <path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 10.5,36 10.5,36 C 9,37.5 11,38.5 11,38.5 L 34,38.5 C 34,38.5 35.5,37.5 34.5,36 C 34.5,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 z" />
              <circle cx="6" cy="12" r="2" fill="#272522" stroke="#1b1a17" strokeWidth="1.5" />
              <circle cx="14" cy="9" r="2" fill="#272522" stroke="#1b1a17" strokeWidth="1.5" />
              <circle cx="22.5" cy="8" r="2" fill="#272522" stroke="#1b1a17" strokeWidth="1.5" />
              <circle cx="31" cy="9" r="2" fill="#272522" stroke="#1b1a17" strokeWidth="1.5" />
              <circle cx="39" cy="12" r="2" fill="#272522" stroke="#1b1a17" strokeWidth="1.5" />
              <path d="M 11.5 30 C 15 29 30 29 33.5 30" stroke="#e0dedb" />
              <path d="M 12 33.5 C 18 32.5 27 32.5 33 33.5" stroke="#e0dedb" />
            </g>
          </svg>
        );

      case 'wK': // White King
        return (
          <svg viewBox="0 0 45 45" width={size} height={size} className={className}>
            <g fill="none" fillRule="evenodd" stroke="#1b1a17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 22.5,11.63 L 22.5,6" strokeLinejoin="miter" />
              <path d="M 20,8 L 25,8" strokeLinejoin="miter" />
              <path
                d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 22.5,25 z"
                fill="#ffffff"
                strokeLinejoin="miter"
              />
              <path
                d="M 11.5,37 C 17,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 19,16 9.5,13 6.5,19.5 C 3.5,25.5 11.5,30 11.5,30 L 11.5,37 z"
                fill="#ffffff"
              />
              <path d="M 11.5,30 C 17,27 27,27 32.5,30" />
              <path d="M 11.5,33.5 C 17,30.5 27,30.5 32.5,33.5" />
              <path d="M 11.5,37 C 17,34 27,34 32.5,37" />
            </g>
          </svg>
        );

      case 'bK': // Black King
        return (
          <svg viewBox="0 0 45 45" width={size} height={size} className={className}>
            <g fill="none" fillRule="evenodd" stroke="#1b1a17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 22.5,11.63 L 22.5,6" strokeLinejoin="miter" />
              <path d="M 20,8 L 25,8" strokeLinejoin="miter" />
              <path
                d="M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 24,11.5 21,11.5 22.5,25 z"
                fill="#272522"
                strokeLinejoin="miter"
              />
              <path
                d="M 11.5,37 C 17,40.5 27,40.5 32.5,37 L 32.5,30 C 32.5,30 41.5,25.5 38.5,19.5 C 34.5,13 25,16 22.5,23.5 L 22.5,27 L 22.5,23.5 C 19,16 9.5,13 6.5,19.5 C 3.5,25.5 11.5,30 11.5,30 L 11.5,37 z"
                fill="#272522"
              />
              <path d="M 11.5,30 C 17,27 27,27 32.5,30" stroke="#e0dedb" />
              <path d="M 11.5,33.5 C 17,30.5 27,30.5 32.5,33.5" stroke="#e0dedb" />
              <path d="M 11.5,37 C 17,34 27,34 32.5,37" stroke="#e0dedb" />
            </g>
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`chess-piece-wrapper select-none ${className}`}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        filter: isWhite
          ? 'drop-shadow(0 2px 3px rgba(0,0,0,0.45))'
          : 'drop-shadow(0 2px 3px rgba(0,0,0,0.6))',
      }}
    >
      {renderSvgContent()}
    </div>
  );
};
