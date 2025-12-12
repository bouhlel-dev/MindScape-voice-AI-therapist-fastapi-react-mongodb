import { useState } from "react";

interface LiquidSphereProps {
  isActive: boolean;
  onClick: () => void;
}

const LiquidSphere = ({ isActive, onClick }: LiquidSphereProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <button
        onClick={onClick}
        className={`relative w-64 h-64 liquid-sphere ${
          isActive ? "liquid-sphere-active" : ""
        } cursor-pointer transition-all duration-500 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/30`}
        aria-label={isActive ? "Stop listening" : "Start listening"}
      >
        {/* Glow effect */}
        <div
          className={`absolute inset-0 rounded-full transition-opacity duration-500 ${
            isActive ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: "radial-gradient(circle, hsla(270 75% 60% / 0.3) 0%, transparent 70%)",
            transform: "scale(1.3)",
          }}
        />
      </button>

      {/* Status Text */}
      <div className="text-center animate-fade-in">
        {isActive ? (
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
