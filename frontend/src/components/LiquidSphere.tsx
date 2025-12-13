import { useState, useEffect, useRef } from "react";

interface LiquidSphereProps {
  isActive: boolean;
  onClick: () => void;
  isLoading?: boolean;
  isPlaying?: boolean;
  audioLevel?: number; // 0-1 range for audio reactivity
  statusText?: string;
  subText?: string;
}

const LiquidSphere = ({ 
  isActive, 
  onClick, 
  isLoading = false,
  isPlaying = false,
  audioLevel = 0,
  statusText,
  subText
}: LiquidSphereProps) => {
  // Calculate scale based on audio level (1.0 to 1.3 range)
  const audioScale = 1 + (audioLevel * 0.3);
  
  // Determine the current state for styling
  const isAnimated = isActive || isPlaying;
  
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <button
        onClick={onClick}
        disabled={isLoading || isPlaying}
        className={`relative w-56 h-56 liquid-sphere ${
          isAnimated ? "liquid-sphere-active" : ""
        } ${isLoading || isPlaying ? "cursor-wait" : "cursor-pointer"} transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/20`}
        style={{
          transform: isPlaying ? `scale(${audioScale})` : undefined,
          transition: isPlaying ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out'
        }}
        aria-label={isActive ? "Stop listening" : "Start listening"}
      >
        {/* Glow effect - earthy tones */}
        <div
          className={`absolute inset-0 rounded-full transition-opacity duration-500 ${
            isAnimated ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: isPlaying 
              ? `radial-gradient(circle, hsla(30 45% 50% / ${0.3 + audioLevel * 0.4}) 0%, transparent 70%)`
              : "radial-gradient(circle, hsla(30 50% 50% / 0.25) 0%, transparent 70%)",
            transform: `scale(${1.3 + audioLevel * 0.3})`,
          }}
        />
        
        {/* Audio reactive rings */}
        {isPlaying && (
          <>
            <div 
              className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping"
              style={{ animationDuration: '1.5s' }}
            />
            <div 
              className="absolute inset-0 rounded-full border border-primary/20 animate-ping"
              style={{ animationDuration: '2s', animationDelay: '0.5s' }}
            />
          </>
        )}
        
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        )}
      </button>

      {/* Status Text */}
      <div className="text-center animate-fade-in">
        {statusText ? (
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">{statusText}</p>
            {subText && <p className="text-sm text-muted-foreground">{subText}</p>}
          </div>
        ) : isLoading ? (
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">Processing...</p>
            <p className="text-sm text-muted-foreground">Please wait</p>
          </div>
        ) : isPlaying ? (
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">Speaking...</p>
            <p className="text-sm text-muted-foreground">Tap when ready to respond</p>
          </div>
        ) : isActive ? (
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">Listening...</p>
            <p className="text-sm text-muted-foreground">Tap sphere to stop</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">Tap to speak</p>
            <p className="text-sm text-muted-foreground">Or type your message below</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiquidSphere;
