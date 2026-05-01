"use client";

import Spline from '@splinetool/react-spline';
import { useEffect, useState } from "react";

export default function Hero3D() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Using requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initialize on mount
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      className="w-full h-[600px]"
      style={{
        transform: `scale(${1 + scrollY * 0.0003})`,
        willChange: 'transform'
      }}
    >
      <Spline scene="https://prod.spline.design/gXbi-VQowTDnqEfY/scene.splinecode" />
    </div>
  );
}