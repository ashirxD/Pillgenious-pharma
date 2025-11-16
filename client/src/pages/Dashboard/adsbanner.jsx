import React, { useState, useEffect, useRef } from 'react';
import { useAds } from '../../hooks/api/useDashboard';

export default function AdsBanner() {
  const { data: ads, isLoading } = useAds();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);
  const progressRef = useRef(null);

  // Auto-rotate ads every 6 seconds
  useEffect(() => {
    if (!ads || ads.length === 0) {
      return;
    }

    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, 6000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [ads, isPaused]);

  // Reset progress bar when ad changes
  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.animation = 'none';
      setTimeout(() => {
        if (progressRef.current) {
          progressRef.current.style.animation = 'progress 6s linear';
        }
      }, 10);
    }
  }, [currentIndex]);

  if (isLoading || !ads || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentIndex];

  const handleDotClick = (index) => {
    setCurrentIndex(index);
    // Reset the interval when manually changing
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
      }, 6000);
    }
  };

  return (
    <div
      className="relative w-full mb-8 rounded-xl overflow-hidden shadow-lg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner */}
      <div
        key={currentIndex}
        className={`bg-gradient-to-r ${currentAd.gradient} p-8 md:p-12 transition-all duration-700 ease-in-out animate-fadeIn`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                <span className={`text-sm font-semibold ${currentAd.textColor}`}>
                  {currentAd.title}
                </span>
              </div>
              <h2 className={`text-2xl md:text-4xl font-bold ${currentAd.textColor} mb-3`}>
                {currentAd.subtitle}
              </h2>
              <p className={`text-base md:text-lg ${currentAd.textColor} opacity-90`}>
                {currentAd.description}
              </p>
            </div>

            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg
                  className={`w-12 h-12 md:w-16 md:h-16 ${currentAd.textColor}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={currentAd.icon}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      {ads.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {ads.map((ad, index) => (
            <button
              key={ad.id}
              type="button"
              onClick={() => handleDotClick(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-8 h-2 bg-white'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to ad ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {ads.length > 1 && !isPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            ref={progressRef}
            className="h-full bg-white"
            style={{
              animation: 'progress 6s linear',
            }}
            key={currentIndex}
          />
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.7s ease-in-out;
        }
      `}</style>
    </div>
  );
}

