import React from 'react';

export default function AppLogo({ size = 36, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={`shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="chassisGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E2538" />
          <stop offset="50%" stopColor="#121622" />
          <stop offset="100%" stopColor="#07090E" />
        </linearGradient>

        <linearGradient id="rimGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F2FE" />
          <stop offset="40%" stopColor="#3B82F6" />
          <stop offset="80%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#FF3366" />
        </linearGradient>

        <linearGradient id="signalGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#00F2FE" stopOpacity="1" />
        </linearGradient>

        <radialGradient id="coreDisc" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="45%" stopColor="#0284C7" />
          <stop offset="85%" stopColor="#0369A1" />
          <stop offset="100%" stopColor="#0C4A6E" />
        </radialGradient>

        <linearGradient id="glassGlint" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.28" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 1. Outer Chassis Squircle */}
      <rect
        x="36"
        y="36"
        width="440"
        height="440"
        rx="110"
        fill="url(#chassisGrad)"
        stroke="url(#rimGlow)"
        strokeWidth="10"
      />

      {/* 2. Concentric Precision Grid */}
      <g opacity="0.12" stroke="#FFFFFF" strokeWidth="2">
        <circle cx="256" cy="256" r="180" strokeDasharray="8,8" />
        <circle cx="256" cy="256" r="130" />
        <circle cx="256" cy="256" r="80" strokeDasharray="6,6" />
        <line x1="76" y1="256" x2="436" y2="256" />
        <line x1="256" y1="76" x2="256" y2="436" />
      </g>

      {/* 3. Radiating Wi-Fi LAN Waves */}
      <path
        d="M 176 156 A 114 114 0 0 1 336 156"
        stroke="url(#signalGrad)"
        strokeWidth="12"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M 204 186 A 74 74 0 0 1 308 186"
        stroke="url(#signalGrad)"
        strokeWidth="14"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M 232 216 A 34 34 0 0 1 280 216"
        stroke="#00F2FE"
        strokeWidth="16"
        strokeLinecap="round"
      />

      {/* 4. Tactile Directional Facets */}
      <path d="M 256 168 L 292 208 L 220 208 Z" fill="#1E293B" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <path d="M 256 344 L 292 304 L 220 304 Z" fill="#1E293B" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <path d="M 168 256 L 208 220 L 208 292 Z" fill="#1E293B" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <path d="M 344 256 L 304 220 L 304 292 Z" fill="#1E293B" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />

      {/* 5. Center Core Disc */}
      <circle cx="256" cy="256" r="46" fill="url(#coreDisc)" stroke="#7DD3FC" strokeWidth="5" />
      <circle cx="256" cy="256" r="18" fill="#FFFFFF" />

      {/* 6. TV Bevel Base Bar */}
      <rect x="206" y="380" width="100" height="14" rx="7" fill="#0284C7" />
      <circle cx="256" cy="387" r="4" fill="#00F2FE" />

      {/* 7. Specular Top Glass Arc */}
      <path
        d="M 36 146 C 36 85 85 36 146 36 L 366 36 C 427 36 476 85 476 146 L 476 210 C 370 170 140 170 36 210 Z"
        fill="url(#glassGlint)"
      />
    </svg>
  );
}
