import React from 'react';

const OrsattiWizard: React.FC = () => (
    <div className="fixed bottom-0 right-0 md:bottom-8 md:right-8 z-50 pointer-events-none" aria-hidden="true">
        <svg
            width="200"
            height="300"
            viewBox="0 0 150 225"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-float-wizard drop-shadow-lg"
        >
            <g transform="translate(0, 20)">
                {/* Sparkles */}
                <path d="M 132.5 52.5 L 135 45 L 137.5 52.5 L 145 55 L 137.5 57.5 L 135 65 L 132.5 57.5 L 125 55 Z" fill="#fef08a" className="sparkle-1" style={{ transformOrigin: '135px 55px' }} />
                <path d="M 115 25 L 117 20 L 119 25 L 124 27 L 119 29 L 117 34 L 115 29 L 110 27 Z" fill="#fef08a" className="sparkle-2" style={{ transformOrigin: '117px 27px' }} />
                <path d="M 140 80 L 141.5 76 L 143 80 L 147 81.5 L 143 83 L 141.5 87 L 140 83 L 136 81.5 Z" fill="#fef08a" className="sparkle-3" style={{ transformOrigin: '141.5px 81.5px' }} />

                {/* Staff */}
                <line x1="125" y1="10" x2="145" y2="150" stroke="#5c2d0d" strokeWidth="6" strokeLinecap="round" />
                <circle cx="123" cy="12" r="10" className="animate-glow-staff" />

                {/* Wizard */}
                <g>
                    {/* Hat */}
                    <path d="M 75,0 L 40,50 L 110,50 Z" fill="#5b21b6" />
                    <path d="M 40,50 Q 75,65 110,50 Q 75,55 40,50 Z" fill="#4c1d95" />
                    <circle cx="60" cy="40" r="3" fill="#fef08a" />
                    <path d="M 80 30 L 82 25 L 84 30 L 89 32 L 84 34 L 82 39 L 80 34 L 75 32 Z" fill="#fef08a" />

                    {/* Hand */}
                    <circle cx="115" cy="80" r="8" fill="#fbcfe8" />

                    {/* Body */}
                    <path d="M 50,60 C 20,100 20,150 50,180 L 100,180 C 130,150 130,100 100,60 Z" fill="#6d28d9" />
                    <path d="M 50,60 C 75,50 75,50 100,60 L 100,70 C 75,80 75,80 50,70 Z" fill="#5b21b6" />

                    {/* Head */}
                    <circle cx="75" cy="70" r="20" fill="#fbcfe8" />
                    <circle cx="68" cy="70" r="2" fill="#27272a" />
                    <circle cx="82" cy="70" r="2" fill="#27272a" />

                    {/* Beard */}
                    <path d="M 55,80 Q 75,120 95,80 Q 75,130 55,80" fill="#e5e7eb" />
                    <path d="M 60,90 Q 75,140 90,90 Q 75,150 60,90" fill="#f3f4f6" />
                </g>
            </g>
        </svg>
    </div>
);

export default OrsattiWizard;
