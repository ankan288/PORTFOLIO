import { useRef, useCallback } from 'react';

/**
 * TiltCard — wraps children in a div that tilts in 3D on mouse move.
 * Props:
 *  - className, style  — forwarded to wrapper
 *  - intensity         — tilt amount in degrees (default 15)
 *  - glare             — show glare overlay (default true)
 *  - scale             — hover scale (default 1.03)
 */
export default function TiltCard({
  children,
  className = '',
  style = {},
  intensity = 15,
  glare = true,
  scale = 1.03,
}) {
  const cardRef = useRef(null);
  const glareRef = useRef(null);

  const handleMouseMove = useCallback(
    (e) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);   // -1 → 1
      const dy = (e.clientY - cy) / (rect.height / 2);  // -1 → 1

      const rotX = -dy * intensity;
      const rotY = dx * intensity;

      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
      card.style.transition = 'transform 0.05s linear';

      if (glare && glareRef.current) {
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        glareRef.current.style.background = `linear-gradient(${angle}deg, rgba(255,255,255,0.12) 0%, transparent 70%)`;
        glareRef.current.style.opacity = '1';
      }
    },
    [intensity, glare, scale]
  );

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
    card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
    if (glare && glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  }, [glare]);

  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        position: 'relative',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'inherit',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
}
