"use client";

export default function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(192,193,255,0.12),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(93,230,255,0.08),transparent_50%)]" />
      
      <svg
        className="absolute top-[-10%] w-[120vw] min-w-[1200px] opacity-40 mix-blend-screen"
        viewBox="0 0 1200 800"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <radialGradient id="glow-grad-1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glow-grad-2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00cbe6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g stroke="url(#line-grad)" strokeWidth="1.5" fill="none" opacity="0.3">
          <path d="M0,100 Q600,180 1200,100" />
          <path d="M0,200 Q600,320 1200,200" />
          <path d="M0,300 Q600,450 1200,300" />
          <path d="M0,400 Q600,580 1200,400" />
          <path d="M0,500 Q600,700 1200,500" />
          
          <path d="M200,0 Q250,400 200,800" />
          <path d="M400,0 Q500,400 400,800" />
          <path d="M600,0 Q700,400 600,800" />
          <path d="M800,0 Q900,400 800,800" />
          <path d="M1000,0 Q1050,400 1000,800" />
        </g>

        <path
          d="M-200,400 C100,500 400,200 600,400 C800,600 1100,300 1400,500"
          fill="none"
          stroke="#6366f1"
          strokeWidth="3"
          opacity="0.6"
          filter="blur(5px)"
        >
          <animate
            attributeName="d"
            dur="12s"
            repeatCount="indefinite"
            values="
              M-200,400 C100,500 400,200 600,400 C800,600 1100,300 1400,500;
              M-200,450 C150,300 450,500 650,450 C850,400 1050,550 1400,450;
              M-200,400 C100,500 400,200 600,400 C800,600 1100,300 1400,500
            "
          />
        </path>
        <path
          d="M-200,450 C200,550 500,150 700,350 C900,550 1200,250 1500,450"
          fill="none"
          stroke="#00cbe6"
          strokeWidth="4"
          opacity="0.5"
          filter="blur(8px)"
        >
          <animate
            attributeName="d"
            dur="18s"
            repeatCount="indefinite"
            values="
              M-200,450 C200,550 500,150 700,350 C900,550 1200,250 1500,450;
              M-200,350 C250,250 450,450 750,250 C950,150 1150,550 1500,350;
              M-200,450 C200,550 500,150 700,350 C900,550 1200,250 1500,450
            "
          />
        </path>

        <circle cx="300" cy="300" r="300" fill="url(#glow-grad-1)">
          <animate attributeName="cx" dur="20s" repeatCount="indefinite" values="300; 450; 200; 300" />
          <animate attributeName="cy" dur="20s" repeatCount="indefinite" values="300; 150; 400; 300" />
          <animate attributeName="r" dur="15s" repeatCount="indefinite" values="300; 350; 280; 300" />
        </circle>
        <circle cx="900" cy="500" r="400" fill="url(#glow-grad-2)">
          <animate attributeName="cx" dur="25s" repeatCount="indefinite" values="900; 750; 1000; 900" />
          <animate attributeName="cy" dur="25s" repeatCount="indefinite" values="500; 350; 600; 500" />
          <animate attributeName="r" dur="20s" repeatCount="indefinite" values="400; 350; 450; 400" />
        </circle>
      </svg>
    </div>
  );
}
