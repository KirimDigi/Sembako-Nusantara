import React, { useRef, useState } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

// 1. 3D Scroll Reveal Section Container (Slow & Cinematic 3D Depth)
interface Section3DProps extends HTMLMotionProps<'section'> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const Section3D: React.FC<Section3DProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  ...props
}) => {
  const getInitial = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: 90, rotateX: 20, scale: 0.92 };
      case 'down':
        return { opacity: 0, y: -90, rotateX: -20, scale: 0.92 };
      case 'left':
        return { opacity: 0, x: -90, rotateY: 18, scale: 0.92 };
      case 'right':
        return { opacity: 0, x: 90, rotateY: -18, scale: 0.92 };
      default:
        return { opacity: 0, y: 90, rotateX: 20, scale: 0.92 };
    }
  };

  return (
    <motion.section
      initial={getInitial()}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        transition: {
          duration: 1.4, // Made slower and more cinematic (1.4s)
          delay: delay,
          ease: [0.16, 1, 0.3, 1] // Luxury smooth deceleration
        }
      }}
      viewport={{ once: true, amount: 0.12 }}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  );
};

// 2. Interactive 3D Tilt Card (Mouse position aware with 3D Depth & Glare Sheen)
interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  depth?: number;
  delay?: number;
}

export const Card3D: React.FC<Card3DProps> = ({
  children,
  className = '',
  depth = 35,
  delay = 0
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // More pronounced 3D rotation angles (+- 16 deg)
    const rX = ((y - centerY) / centerY) * -16;
    const rY = ((x - centerX) / centerX) * 16;

    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.15
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, rotateX: 14, scale: 0.93 }}
      whileInView={{
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        transition: { duration: 1.1, delay: delay, ease: [0.16, 1, 0.3, 1] } // Slower entrance
      }}
      viewport={{ once: true, amount: 0.15 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        scale: isHovered ? 1.04 : 1,
        transformPerspective: 900,
        translateZ: isHovered ? depth : 0
      }}
      transition={{
        type: 'spring',
        stiffness: 180, // Slower, softer spring for majestic 3D feel
        damping: 18,
        mass: 0.8
      }}
      style={{
        transformStyle: 'preserve-3d'
      }}
      className={`relative will-change-transform ${className}`}
    >
      {/* Dynamic 3D Glare Light Reflection Effect */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl z-30 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 65%)`,
          opacity: isHovered ? glarePos.opacity : 0
        }}
      />
      {children}
    </motion.div>
  );
};

// 3. Staggered 3D Children Container
export const StaggerContainer3D: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}> = ({ children, className = '', staggerDelay = 0.15 }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem3D: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 50, rotateX: 18, scale: 0.92 },
        visible: {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] }
        }
      }}
      style={{ transformStyle: 'preserve-3d' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

