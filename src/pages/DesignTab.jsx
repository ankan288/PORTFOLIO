import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import * as THREE from 'three';
import { Link } from 'react-router-dom';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DESIGN TAB â€” 4 Distinct Hero Design Variants
   Inspired by: animejs.com, dashcreative.co, everswap.com, hubtown.co.in
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

// â”€â”€â”€ Shared easing â”€â”€â”€
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];



/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DESIGN B â€” "ORBITAL COSMOS"
   Inspired by: Everswap (everswap.com)
   â€” Three.js orbital particle swarm
   â€” Floating glass cards with tilt
   â€” Depth-zoom camera effect on scroll
   â€” Large centred typography
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function OrbitalThree() {
  const mountRef = useRef(null);
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.set(0, 0, 6);

    // Central glowing sphere
    const centerGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const centerMat = new THREE.MeshBasicMaterial({ color: 0x7c6af7, wireframe: true, transparent: true, opacity: 0.3 });
    const centerMesh = new THREE.Mesh(centerGeo, centerMat);
    scene.add(centerMesh);

    // Glow sphere
    const glowGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x7c6af7, transparent: true, opacity: 0.06 });
    scene.add(new THREE.Mesh(glowGeo, glowMat));

    // Orbital rings
    const rings = [1.8, 2.6, 3.4].map((r, i) => {
      const geo = new THREE.TorusGeometry(r, 0.012, 8, 80);
      const mat = new THREE.MeshBasicMaterial({ color: [0x7c6af7, 0xc084fc, 0x34d399][i], transparent: true, opacity: 0.25 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = [0.4, 0.9, 1.4][i];
      mesh.rotation.z = [0.2, 0.5, 0.8][i];
      scene.add(mesh);
      return mesh;
    });

    // Orbiting particles
    const orbitParticles = [];
    const orbitColors = [0x7c6af7, 0xc084fc, 0x34d399];
    [1.8, 2.6, 3.4].forEach((radius, ri) => {
      for (let i = 0; i < 12; i++) {
        const geo = new THREE.SphereGeometry(0.06 - ri * 0.01, 8, 8);
        const mat = new THREE.MeshBasicMaterial({ color: orbitColors[ri], transparent: true, opacity: 0.9 });
        const mesh = new THREE.Mesh(geo, mat);
        const angle = (i / 12) * Math.PI * 2;
        orbitParticles.push({ mesh, radius, angle, speed: 0.005 - ri * 0.001, rx: [0.4, 0.9, 1.4][ri], rz: [0.2, 0.5, 0.8][ri] });
        scene.add(mesh);
      }
    });

    // Star field
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 30;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.03, transparent: true, opacity: 0.4, sizeAttenuation: true })));

    let mouse = { x: 0, y: 0 };
    const onMouse = (e) => {
      mouse = { x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 };
    };
    window.addEventListener('mousemove', onMouse);

    let t = 0;
    const animate = () => {
      t += 0.008;
      centerMesh.rotation.x = t * 0.3;
      centerMesh.rotation.y = t * 0.5;
      rings.forEach((r, i) => { r.rotation.z += [0.003, -0.002, 0.0025][i]; });
      orbitParticles.forEach(({ mesh, radius, angle: a0, speed, rx, rz }, i) => {
        const a = a0 + t * speed * 60;
        const x = Math.cos(a) * radius;
        const y = Math.sin(a) * radius;
        const cosX = Math.cos(rx), sinX = Math.sin(rx);
        const cosZ = Math.cos(rz), sinZ = Math.sin(rz);
        mesh.position.set(
          x * cosZ - y * sinX * sinZ,
          y * cosX,
          x * sinZ + y * sinX * cosZ
        );
      });
      camera.position.x += (mouse.x * 0.8 - camera.position.x) * 0.04;
      camera.position.y += (-mouse.y * 0.5 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    let rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouse);
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);
  return <div ref={mountRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />;
}

function FloatCard({ style, delay, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.8, ease: EASE_OUT_EXPO }}
      whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.25 } }}
      style={{
        position: 'absolute', background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, padding: '1.25rem', zIndex: 20, ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

function DesignB() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: 'radial-gradient(ellipse at 50% 40%, #0a0618 0%, #040408 100%)' }}>
      <OrbitalThree />

      {/* Centered content */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 2rem' }}>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.3em', color: '#c084fc', textTransform: 'uppercase', marginBottom: '2rem' }}>
          â—‰ Available for Work
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.4, ease: EASE_OUT_EXPO }}
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem, 7vw, 6rem)', fontWeight: 900, lineHeight: 0.92, color: '#fff', letterSpacing: '-0.04em', marginBottom: '1.5rem' }}
        >
          Ankan<br />
          <span style={{ background: 'linear-gradient(135deg, #7c6af7 0%, #c084fc 50%, #60a5fa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Dev&nbsp;+&nbsp;AI
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          style={{ fontFamily: 'var(--font-body)', color: 'rgba(200,200,230,0.55)', fontSize: '1rem', maxWidth: 380, lineHeight: 1.7, marginBottom: '2rem' }}
        >
          Full-stack engineer building intelligent, scalable systems â€” React, Python, AI/ML.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} style={{ display: 'flex', gap: '1rem' }}>
          <motion.button whileHover={{ scale: 1.06, boxShadow: '0 0 50px rgba(124,106,247,0.6)' }} style={{
            padding: '0.85rem 2.2rem', borderRadius: 99, background: 'linear-gradient(135deg, #7c6af7, #c084fc)',
            border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>Explore Work</motion.button>
          <motion.button whileHover={{ scale: 1.06 }} style={{
            padding: '0.85rem 2.2rem', borderRadius: 99, border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
          }}>Contact</motion.button>
        </motion.div>
      </div>

      {/* Floating glass badges */}
      <FloatCard style={{ top: '15%', left: '5%', minWidth: 140 }} delay={1.3}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#34d399', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>Status</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
          <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>Open to Work</span>
        </div>
      </FloatCard>

      <FloatCard style={{ top: '15%', right: '5%', minWidth: 120 }} delay={1.4}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#c084fc', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>Projects</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>12<span style={{ color: '#7c6af7' }}>+</span></div>
      </FloatCard>

      <FloatCard style={{ bottom: '18%', left: '6%' }} delay={1.5}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#60a5fa', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>Top Skills</div>
        {['React', 'Python', 'AI/ML'].map(s => (
          <div key={s} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{s}</div>
        ))}
      </FloatCard>

      <FloatCard style={{ bottom: '18%', right: '6%', minWidth: 110 }} delay={1.6}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#fbbf24', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>Certs</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>8<span style={{ color: '#fbbf24' }}>+</span></div>
      </FloatCard>

      <div style={{ position: 'absolute', top: 16, right: 16, fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'rgba(192,132,252,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', zIndex: 30 }}>
        Design B Â· Orbital Cosmos
      </div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DESIGN C â€” "CINEMATIC BOLD"
   Inspired by: Hubtown (hubtown.co.in)
   â€” Large bold typography, cinematic feel
   â€” Diagonal reveal strips
   â€” High-contrast dark + accent color blocks
   â€” Horizontal scrolling project showcase
   â€” Minimal, architectural spacing
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function DesignC() {
  const [counter, setCounter] = useState(0);
  const [lineVisible, setLineVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLineVisible(true), 400);
    let c = 0;
    const interval = setInterval(() => {
      c += 2;
      if (c >= 100) { clearInterval(interval); c = 100; }
      setCounter(c);
    }, 25);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  const strips = ['Building', 'Intelligent', 'Digital', 'Systems'];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#05050a' }}>

      {/* Background accent block â€” right side diagonal */}
      <div style={{
        position: 'absolute', top: 0, right: 0, width: '36%', height: '100%',
        background: 'linear-gradient(180deg, #7c6af7 0%, #c084fc 100%)',
        opacity: 0.06,
        clipPath: 'polygon(18% 0, 100% 0, 100% 100%, 0% 100%)',
      }} />

      {/* Bottom accent line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, #7c6af7, #c084fc, #34d399, transparent)',
        zIndex: 25,
      }} />

      {/* Vertical grid lines */}
      {[10, 25, 40, 55, 70].map((p, i) => (
        <motion.div key={i}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: lineVisible ? 1 : 0, scaleY: lineVisible ? 1 : 0 }}
          transition={{ delay: i * 0.06, duration: 0.8, ease: EASE_OUT_EXPO }}
          style={{
            position: 'absolute', left: `${p}%`, top: 0, bottom: 0,
            width: '1px', background: 'rgba(255,255,255,0.03)', transformOrigin: 'top',
          }}
        />
      ))}

      {/* Top loader bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: counter / 100 }}
        transition={{ duration: 0.5, ease: 'linear' }}
        style={{
          position: 'absolute', top: 0, left: 0, height: '2px', width: '100%',
          background: 'linear-gradient(90deg, #7c6af7, #c084fc)',
          transformOrigin: 'left', zIndex: 30,
        }}
      />

      {/* Counter â€” top right, above content, not overlapping stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          position: 'absolute', top: '1rem', right: '8%', zIndex: 20,
          textAlign: 'right', pointerEvents: 'none',
        }}
      >
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 900,
          color: 'rgba(124,106,247,0.1)', lineHeight: 1,
        }}>
          {String(counter).padStart(2, '0')}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.5rem',
          color: 'rgba(255,255,255,0.15)', letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>Loading</div>
      </motion.div>

      {/* â”€â”€ MAIN CONTENT COLUMN â”€â”€ */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 10,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        // Top padding: clear the loader bar; bottom padding: clear the stats strip (~64px)
        padding: '2rem 8% 80px',
      }}>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: EASE_OUT_EXPO }}
          style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
            letterSpacing: '0.28em', color: '#7c6af7',
            textTransform: 'uppercase', marginBottom: '1.2rem',
          }}
        >
          â€” Portfolio 2026 Â· Ankan
        </motion.div>

        {/* Title words â€” each clipped to prevent overflow */}
        <div style={{ marginBottom: '1.25rem' }}>
          {strips.map((word, i) => (
            <div key={word} style={{ overflow: 'hidden', lineHeight: 0.9 }}>
              <motion.div
                initial={{ y: '105%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.38 + i * 0.08, duration: 0.7, ease: EASE_OUT_EXPO }}
                style={{
                  // Smaller, tighter clamp so all 4 words fit within 560px height preview
                  fontSize: 'clamp(1.8rem, 4.2vw, 3.8rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.03em',
                  fontFamily: 'var(--font-display)',
                  color: i === 1 ? 'transparent' : '#fff',
                  // Stroke only on "Intelligent" â€” keep thin so it reads cleanly
                  WebkitTextStroke: i === 1 ? '1px #7c6af7' : 'none',
                  // Prevent the stroke word from wider overflow
                  display: 'block',
                  whiteSpace: 'nowrap',
                }}
              >
                {word}
              </motion.div>
            </div>
          ))}
        </div>

        {/* Description row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.55 }}
          style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}
        >
          <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.18)', flexShrink: 0 }} />
          <p style={{
            fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.38)',
            fontSize: '0.8rem', maxWidth: 300, lineHeight: 1.6, margin: 0,
          }}>
            Full-stack developer & AI engineer. Building systems that matter.
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15, duration: 0.5 }}
          style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 24px rgba(124,106,247,0.5)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '0.7rem 1.8rem', background: '#7c6af7', border: 'none',
              color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              clipPath: 'polygon(0 0, 94% 0, 100% 100%, 6% 100%)',
            }}
          >
            Explore Work
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04, borderColor: 'rgba(255,255,255,0.4)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '0.7rem 1.5rem', background: 'transparent',
              border: '1px solid rgba(255,255,255,0.18)',
              color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem',
              cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}
          >
            Contact â†—
          </motion.button>
        </motion.div>
      </div>

      {/* â”€â”€ BOTTOM STAT STRIP â€” fixed height, always above bottom border â”€â”€ */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.35, duration: 0.6 }}
        style={{
          position: 'absolute', bottom: 2, left: 0, right: 0, zIndex: 20,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(5,5,10,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', height: 62,
        }}
      >
        {[['12+', 'Projects Built'], ['8+', 'Certifications'], ['2+', 'Years Exp'], ['India', 'Location']].map(([n, l], i) => (
          <div key={l} style={{
            flex: 1, padding: '0.75rem 1rem',
            borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{n}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 3 }}>{l}</div>
          </div>
        ))}
      </motion.div>

      {/* Design label */}
      <div style={{
        position: 'absolute', top: 12, right: 16, zIndex: 30,
        fontFamily: 'var(--font-mono)', fontSize: '0.5rem',
        color: 'rgba(124,106,247,0.4)', letterSpacing: '0.18em', textTransform: 'uppercase',
      }}>
        Design C Â· Cinematic Bold
      </div>
    </div>
  );
}


/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DESIGN D â€” "ANIME SPRING"
   Inspired by: Anime.js (animejs.com)
   â€” Spring physics bounce entrance
   â€” Stagger timeline sequences
   â€” Colorful, vibrant palette
   â€” Bouncy skill pills
   â€” Playful geometry animations
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const SPRING_FAST = { type: 'spring', stiffness: 400, damping: 20 };
const SPRING_BOUNCY = { type: 'spring', stiffness: 300, damping: 12 };
const SPRING_SOFT = { type: 'spring', stiffness: 200, damping: 18 };

function AnimatedShape({ style, delay, shape = 'circle', color, size = 60 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ ...SPRING_BOUNCY, delay }}
      style={{
        position: 'absolute', width: size, height: size,
        background: `linear-gradient(135deg, ${color}66, ${color}22)`,
        border: `2px solid ${color}44`,
        borderRadius: shape === 'circle' ? '50%' : shape === 'square' ? 12 : '4px',
        ...style,
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8 + delay * 2, repeat: Infinity, ease: 'linear' }}
        style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
      />
    </motion.div>
  );
}

function BounceSkillPill({ skill, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.7 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...SPRING_BOUNCY, delay }}
      whileHover={{ y: -8, scale: 1.1, transition: SPRING_FAST }}
      style={{
        padding: '0.5rem 1.1rem', borderRadius: 99, cursor: 'default',
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.06)',
        fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#e0e0f0',
        backdropFilter: 'blur(8px)',
      }}
    >
      {skill}
    </motion.div>
  );
}

function DesignD() {
  const shapes = [
    { style: { top: '8%', right: '10%' }, color: '#7c6af7', size: 90, delay: 0.2, shape: 'circle' },
    { style: { top: '55%', right: '5%' }, color: '#34d399', size: 55, delay: 0.35, shape: 'square' },
    { style: { bottom: '10%', right: '20%' }, color: '#c084fc', size: 70, delay: 0.5, shape: 'circle' },
    { style: { top: '30%', right: '25%' }, color: '#60a5fa', size: 40, delay: 0.45, shape: 'square' },
    { style: { top: '70%', right: '35%' }, color: '#fbbf24', size: 35, delay: 0.6, shape: 'circle' },
  ];

  const pills = ['React.js', 'Python', 'AI/ML', 'FastAPI', 'Next.js', 'TensorFlow', 'Docker'];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: 'linear-gradient(160deg, #060612 0%, #0a0820 40%, #070712 100%)' }}>
      {/* Animated background dots */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.8, 0.3], y: [0, -20, 0] }}
          transition={{ delay: i * 0.1, duration: 3 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            left: `${(i * 5.3) % 100}%`, top: `${(i * 7.1) % 100}%`,
            width: 3, height: 3, borderRadius: '50%',
            background: ['#7c6af7', '#c084fc', '#34d399', '#60a5fa', '#fbbf24'][i % 5],
          }}
        />
      ))}

      {/* Geometric shapes */}
      {shapes.map((s, i) => <AnimatedShape key={i} {...s} />)}

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 8%' }}>

        {/* Bouncy badge */}
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...SPRING_BOUNCY, delay: 0.2 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '0.4rem 1rem', borderRadius: 99, marginBottom: '1.5rem',
            background: 'rgba(124,106,247,0.1)', border: '1px solid rgba(124,106,247,0.3)',
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#c084fc',
            width: 'fit-content',
          }}
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', display: 'inline-block' }}
          />
          Open to opportunities
        </motion.div>

        {/* Title with spring bounce per word */}
        <div style={{ marginBottom: '1.5rem' }}>
          {['Building', 'Intelligent', 'Futures'].map((word, i) => (
            <div key={word} style={{ overflow: 'hidden' }}>
              <motion.div
                initial={{ y: 80, opacity: 0, rotateX: -40 }}
                animate={{ y: 0, opacity: 1, rotateX: 0 }}
                transition={{ ...SPRING_SOFT, delay: 0.3 + i * 0.1 }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.5rem, 6vw, 5.5rem)',
                  fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.04em',
                  color: i === 1 ? 'transparent' : '#fff',
                  background: i === 1 ? 'linear-gradient(135deg, #7c6af7, #c084fc, #60a5fa)' : undefined,
                  WebkitBackgroundClip: i === 1 ? 'text' : undefined,
                  WebkitTextFillColor: i === 1 ? 'transparent' : undefined,
                }}
              >
                {word}
              </motion.div>
            </div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...SPRING_SOFT, delay: 0.7 }}
          style={{ fontFamily: 'var(--font-body)', color: 'rgba(200,200,230,0.55)', fontSize: '0.95rem', maxWidth: 380, lineHeight: 1.7, marginBottom: '2rem' }}
        >
          I'm <strong style={{ color: '#fff' }}>Ankan</strong> â€” full-stack dev & AI builder from India ðŸ‡®ðŸ‡³
        </motion.p>

        {/* Bouncy pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
          {pills.map((p, i) => <BounceSkillPill key={p} skill={p} delay={0.8 + i * 0.06} />)}
        </div>

        {/* Bouncy buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SPRING_BOUNCY, delay: 1.3 }}
            whileHover={{ scale: 1.08, y: -4, transition: SPRING_FAST }}
            whileTap={{ scale: 0.94 }}
            style={{
              padding: '0.85rem 2.2rem', borderRadius: 99,
              background: 'linear-gradient(135deg, #7c6af7, #c084fc)',
              border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              fontFamily: 'var(--font-body)', boxShadow: '0 8px 32px rgba(124,106,247,0.5)',
            }}
          >
            View Projects âœ¦
          </motion.button>
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SPRING_BOUNCY, delay: 1.4 }}
            whileHover={{ scale: 1.08, y: -4, transition: SPRING_FAST }}
            style={{
              padding: '0.85rem 2rem', borderRadius: 99,
              border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
            }}
          >
            Let's Talk
          </motion.button>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 16, right: 16, fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'rgba(52,211,153,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', zIndex: 30 }}>
        Design D Â· Anime Spring
      </div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DESIGN E â€” "EVERSWAP EXACT"
   Direct replica of everswap.com
   Screenshots analysed & matched:
   â€” Hero: blue sky + 3D painted mountains
   â€” Left 5 diamond sidebar nav (outline style)
   â€” Ultra-thin serif font (Feature Displayâ€“like)
   â€” Logo: diamond SVG + "EverSwap" text, top-left
   â€” Launch App pill button, top-right
   â€” Section 1: Hero "EverSwap" huge serif, "Scroll to start"
   â€” Section 2: Aerial mountain, "One | Pool" split
   â€” Section 3: Aerial river, "Where liquidity / Flows"
   â€” Section 4: Purple sky, diamond motif, "ReDeFined"
   â€” Section 5: Mountain lake, "One Pool / Every Function" + lime CTA
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

// â”€â”€â”€ Everswap colour tokens â”€â”€â”€
const EV = {
  offWhite:  '#fbfff4',
  darkGreen: '#203727',
  midGreen:  '#516e5a',
  sage:      '#bccca2',
  lime:      '#e0ffab',
  skyBlue:   '#6fa8c8',
  skyTop:    '#4a8ab5',
  purple:    '#5b2ba8',
  purpleDeep:'#3d1a7a',
};

// â”€â”€â”€ Shared serif font stack â”€â”€â”€
const SERIF = `'Cormorant Garamond', 'Playfair Display', Georgia, serif`;
const SANS  = `'Inter', 'Britti Sans', system-ui, sans-serif`;

// â”€â”€â”€ Everswap section data (mirrors real site content) â”€â”€â”€
const ES_SECTIONS = [
  {
    id: 0,
    bg: 'mountain-sky',   // blue sky + mountain 3D
    title: 'EverSwap',
    eyebrow: 'DeFi at Peak.',
    sub: 'Scroll to start',
    layout: 'hero-center',
  },
  {
    id: 1,
    bg: 'mountain-top',   // aerial mountain top-down
    left: 'One',
    right: 'Pool',
    layout: 'split-title',
  },
  {
    id: 2,
    bg: 'river-aerial',   // aerial river / forest view
    eyebrow: 'Where liquidity',
    title: 'Flows',
    desc: 'Smoother execution, more efficient markets, and better capital use across the system.',
    layout: 'center-text',
  },
  {
    id: 3,
    bg: 'purple-sky',    // purple/violet sky
    diamond: true,
    title: 'ReDeFined',
    desc: 'A new model for deeper, cleaner, and more efficient liquidity.',
    layout: 'center-text',
  },
  {
    id: 4,
    bg: 'mountain-lake', // mountain + lake CTA
    line1: 'One Pool',
    line2: 'Every Function',
    desc: 'Building a more capital-efficient foundation for on-chain markets.',
    cta: 'Launch App',
    layout: 'cta-center',
  },
];

// â”€â”€â”€ WebGL mountain sky canvas â”€â”€â”€
function EverMountainCanvas() {
  const mountRef = useRef(null);
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    // Sky gradient background
    renderer.setClearColor(0x6fa8c8, 1);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    // Sky atmosphere gradient as large backdrop plane
    const skyGeo = new THREE.PlaneGeometry(300, 200);
    const skyMat = new THREE.MeshBasicMaterial({ color: 0x5f99bc });
    const skyPlane = new THREE.Mesh(skyGeo, skyMat);
    skyPlane.position.set(0, 30, -80);
    scene.add(skyPlane);

    // Brighter sky horizon band
    const horizonGeo = new THREE.PlaneGeometry(300, 30);
    const horizonMat = new THREE.MeshBasicMaterial({ color: 0x8bbdd4, transparent: true, opacity: 0.6 });
    const horizonPlane = new THREE.Mesh(horizonGeo, horizonMat);
    horizonPlane.position.set(0, 5, -60);
    scene.add(horizonPlane);

    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 300);
    camera.position.set(0, 3, 22);
    camera.lookAt(0, 1, 0);

    // Mountain builder â€” creates a filled triangle-ridge shape
    function makeMtn(cx, cz, height, width, col, op = 1.0) {
      const pts = [];
      const segs = 40;
      for (let i = 0; i <= segs; i++) {
        const t = i / segs;
        const nx = Math.sin(t * Math.PI * 4.1 + cx * 0.5) * 0.18
                 + Math.sin(t * Math.PI * 9  + cz * 0.7) * 0.08;
        const x = cx + (t - 0.5) * width;
        const y = Math.sin(t * Math.PI) * height * (1 + nx * 0.4);
        pts.push([x, y]);
      }
      const shape = new THREE.Shape();
      shape.moveTo(pts[0][0] - cx, -4);
      pts.forEach(([x, y]) => shape.lineTo(x - cx, y));
      shape.lineTo(pts[pts.length - 1][0] - cx, -4);
      shape.closePath();
      const geo = new THREE.ShapeGeometry(shape);
      const mat = new THREE.MeshBasicMaterial({
        color: col, transparent: op < 1, opacity: op
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(cx, 0, cz);
      return m;
    }

    // Far background mountains (muted, blue-green)
    const mtns = [
      makeMtn(-20, -18, 7, 40, 0x3a6b4f, 0.7),
      makeMtn( 15, -16, 9, 38, 0x3f7354, 0.75),
      makeMtn(-5,  -14, 11, 42, 0x456b40, 0.8),
      // Mid mountains
      makeMtn( 0,  -9,  15, 44, 0x3d7548, 0.9),
      makeMtn(-14, -7,  9,  28, 0x4a8050, 0.9),
      makeMtn( 16, -7,  10, 30, 0x4a7d4c, 0.9),
      // Central MAIN tall peak
      makeMtn( 0,  -4,  18, 36, 0x3d6e40, 1.0),
      // Foreground flanking mountains
      makeMtn(-18, -1,  6,  24, 0x4e8a50, 1.0),
      makeMtn( 20, -1,  7,  22, 0x4d8850, 1.0),
      makeMtn(-9,  1,   4,  14, 0x558e56, 1.0),
      makeMtn( 11, 1,   5,  16, 0x568f58, 1.0),
    ];
    mtns.forEach(m => scene.add(m));

    // Ground plane (dark green at base)
    const groundGeo = new THREE.PlaneGeometry(400, 80);
    const groundMat = new THREE.MeshBasicMaterial({ color: 0x2d6035 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -4;
    scene.add(ground);

    // Warm light highlights on mountain surfaces
    const highlightGeo = new THREE.PlaneGeometry(6, 10);
    const highlightMat = new THREE.MeshBasicMaterial({ color: 0xd4c87a, transparent: true, opacity: 0.12 });
    const highlight = new THREE.Mesh(highlightGeo, highlightMat);
    highlight.rotation.z = 0.3;
    highlight.position.set(-1, 7, -3.5);
    scene.add(highlight);

    // Atmospheric mist layers
    for (let i = 0; i < 4; i++) {
      const mistGeo = new THREE.PlaneGeometry(80, 6);
      const mistMat = new THREE.MeshBasicMaterial({
        color: 0xc5dceb, transparent: true, opacity: 0.05 + i * 0.015
      });
      const mist = new THREE.Mesh(mistGeo, mistMat);
      mist.position.set(0, -0.5 + i * 1.8, -6 + i * 3);
      mist.rotation.x = -0.08;
      scene.add(mist);
    }

    let mouse = { x: 0, y: 0 };
    const onMouse = e => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5);
      mouse.y = (e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', onMouse);

    const onResize = () => {
      const nw = el.clientWidth, nh = el.clientHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    let t = 0, raf;
    const animate = () => {
      t += 0.004;
      camera.position.x += (mouse.x * 1.8 - camera.position.x) * 0.025;
      camera.position.y = 3 + Math.sin(t * 0.4) * 0.2 - mouse.y * 0.4;
      camera.lookAt(0, 2, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />;
}

// â”€â”€â”€ Aerial mountain top-down canvas (section 1) â”€â”€â”€
function EverAerialMountainCanvas() {
  const mountRef = useRef(null);
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x3a5c30, 1);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, w / h, 0.1, 200);
    camera.position.set(0, 20, 0);
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, -1);

    // Top-down lumpy terrain
    function makePatch(cx, cz, size, col, op = 1) {
      const geo = new THREE.CircleGeometry(size, 6 + Math.floor(size));
      const mat = new THREE.MeshBasicMaterial({ color: col, transparent: op < 1, opacity: op });
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(cx, 0, cz);
      return m;
    }

    // Rocky mountain patches â€” ochre/yellow mixed with dark green
    const patches = [
      makePatch(-6, -4, 5, 0x7a6820, 0.9),
      makePatch(5,  -3, 6, 0x6b5e1c, 0.85),
      makePatch(-2, 2,  7, 0x3d5825, 1.0),
      makePatch(8,  4,  4, 0x4f6b2f, 0.9),
      makePatch(-10,6,  5, 0x8a7228, 0.8),
      makePatch(2, -8,  6, 0x5c7a38, 0.9),
      makePatch(-4,-12, 8, 0x9a8434, 0.7),
      makePatch(12,-6,  7, 0x4a6025, 0.85),
    ];
    patches.forEach(p => scene.add(p));

    // Dark crevices / shadows
    for (let i = 0; i < 12; i++) {
      const geo = new THREE.CircleGeometry(1 + Math.random() * 3, 5);
      const mat = new THREE.MeshBasicMaterial({ color: 0x1a2c10, transparent: true, opacity: 0.5 + Math.random() * 0.3 });
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = -Math.PI / 2;
      m.position.set((Math.random() - 0.5) * 30, 0.1, (Math.random() - 0.5) * 30);
      scene.add(m);
    }

    // Ground base
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshBasicMaterial({ color: 0x2d4e1a });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    scene.add(ground);

    const onResize = () => {
      const nw = el.clientWidth, nh = el.clientHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    let t = 0, raf;
    const animate = () => {
      t += 0.002;
      camera.position.x = Math.sin(t * 0.3) * 1.5;
      camera.position.z = Math.cos(t * 0.2) * 1.5;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />;
}

// â”€â”€â”€ Aerial river/forest canvas (section 2) â”€â”€â”€
function EverRiverCanvas() {
  const mountRef = useRef(null);
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x2d5a28, 1);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, w / h, 0.1, 200);
    camera.position.set(0, 22, 0);
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, -1);

    // Rich green forest floor
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshBasicMaterial({ color: 0x2a5220 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Forest patches (darker + lighter greens)
    const forestColors = [0x1e4018, 0x2a5a22, 0x336028, 0x3a6e30, 0x4a7a3a, 0x558242];
    for (let i = 0; i < 30; i++) {
      const r = 2 + Math.random() * 5;
      const geo = new THREE.CircleGeometry(r, 7);
      const mat = new THREE.MeshBasicMaterial({
        color: forestColors[Math.floor(Math.random() * forestColors.length)],
        transparent: true, opacity: 0.8 + Math.random() * 0.2
      });
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = -Math.PI / 2;
      // Spread to the sides, leaving gap in centre
      const side = Math.random() < 0.5 ? -1 : 1;
      m.position.set(side * (6 + Math.random() * 12), 0.1, (Math.random() - 0.5) * 30);
      scene.add(m);
    }

    // River channel â€” blue/teal running down centre
    const riverGeo = new THREE.PlaneGeometry(4, 60);
    const riverMat = new THREE.MeshBasicMaterial({ color: 0x8bbcce, transparent: true, opacity: 0.85 });
    const river = new THREE.Mesh(riverGeo, riverMat);
    river.rotation.x = -Math.PI / 2;
    river.position.set(0, 0.2, 0);
    scene.add(river);

    // River shimmer highlights
    for (let i = 0; i < 5; i++) {
      const geo = new THREE.PlaneGeometry(1.5 + Math.random(), 4);
      const mat = new THREE.MeshBasicMaterial({ color: 0xd0e8f0, transparent: true, opacity: 0.3 });
      const m = new THREE.Mesh(geo, mat);
      m.rotation.x = -Math.PI / 2;
      m.position.set((Math.random() - 0.5) * 2, 0.3, (Math.random() - 0.5) * 20);
      scene.add(m);
    }

    const onResize = () => {
      const nw = el.clientWidth, nh = el.clientHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    let t = 0, raf;
    const animate = () => {
      t += 0.003;
      camera.position.x = Math.sin(t * 0.2) * 0.8;
      camera.lookAt(0, 0, Math.sin(t * 0.15) * 1);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />;
}

// â”€â”€â”€ Purple sky canvas (section 3) â”€â”€â”€
function EverPurpleCanvas() {
  const mountRef = useRef(null);
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x4e23a0, 1);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 200);
    camera.position.set(0, 0, 18);
    camera.lookAt(0, 0, 0);

    // Large purple sky gradient planes
    const skyColors = [0x5b2ba8, 0x6a35c0, 0x4416a0, 0x381490, 0x7a45d0];
    for (let i = 0; i < 5; i++) {
      const geo = new THREE.PlaneGeometry(100, 20);
      const mat = new THREE.MeshBasicMaterial({
        color: skyColors[i], transparent: true, opacity: 0.4 + i * 0.1
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(0, -10 + i * 8, -20 + i * 2);
      scene.add(m);
    }

    // Horizontal misty streaks â€” the characteristic purple mist
    for (let i = 0; i < 8; i++) {
      const geo = new THREE.PlaneGeometry(80 + Math.random() * 40, 2 + Math.random() * 3);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x9060d0, transparent: true, opacity: 0.12 + Math.random() * 0.08
      });
      const m = new THREE.Mesh(geo, mat);
      m.position.set((Math.random() - 0.5) * 10, -6 + i * 2.5, -5 + Math.random() * 8);
      m.rotation.z = (Math.random() - 0.5) * 0.05;
      scene.add(m);
    }

    // Background fill
    const bgGeo = new THREE.PlaneGeometry(300, 200);
    const bgMat = new THREE.MeshBasicMaterial({ color: 0x38188a });
    const bg = new THREE.Mesh(bgGeo, bgMat);
    bg.position.set(0, 0, -40);
    scene.add(bg);

    const onResize = () => {
      const nw = el.clientWidth, nh = el.clientHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    let t = 0, raf;
    const animate = () => {
      t += 0.005;
      scene.children.forEach((m, i) => {
        if (i > 0 && i < 8) {
          m.position.x += Math.sin(t * 0.4 + i) * 0.004;
        }
      });
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />;
}

// â”€â”€â”€ Mountain lake canvas (section 4) â”€â”€â”€
function EverLakeCanvas() {
  const mountRef = useRef(null);
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x6fa8c8, 1);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 200);
    camera.position.set(0, 2, 20);
    camera.lookAt(0, 1, 0);

    // Sky
    const skyGeo = new THREE.PlaneGeometry(300, 150);
    const skyMat = new THREE.MeshBasicMaterial({ color: 0x6fa8c8 });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    sky.position.set(0, 30, -70);
    scene.add(sky);

    function makeMtn2(cx, cz, height, width, col, op = 1) {
      const pts = [];
      for (let i = 0; i <= 36; i++) {
        const t = i / 36;
        const nx = Math.sin(t * Math.PI * 3.8 + cx * 0.4) * 0.2
                 + Math.sin(t * Math.PI * 8 + cz * 0.6) * 0.09;
        const x = cx + (t - 0.5) * width;
        const y = Math.sin(t * Math.PI) * height * (1 + nx * 0.35);
        pts.push([x, y]);
      }
      const shape = new THREE.Shape();
      shape.moveTo(pts[0][0] - cx, -5);
      pts.forEach(([x, y]) => shape.lineTo(x - cx, y));
      shape.lineTo(pts[pts.length - 1][0] - cx, -5);
      shape.closePath();
      const geo = new THREE.ShapeGeometry(shape);
      const mat = new THREE.MeshBasicMaterial({ color: col, transparent: op < 1, opacity: op });
      const m = new THREE.Mesh(geo, mat);
      m.position.set(cx, 0, cz);
      return m;
    }

    // Many tall mountains spread left-right
    const mtns2 = [
      makeMtn2(-22, -12, 7,  30, 0x3d6040, 0.8),
      makeMtn2( 22, -12, 8,  28, 0x3a5c3c, 0.8),
      makeMtn2(-11, -9,  10, 28, 0x4a7048, 0.9),
      makeMtn2( 12, -9,  11, 26, 0x4a6e46, 0.9),
      makeMtn2( 0,  -7,  16, 32, 0x3d6840, 1.0),
      makeMtn2(-18, -5,  8,  24, 0x527855, 1.0),
      makeMtn2( 18, -5,  9,  22, 0x527055, 1.0),
      makeMtn2(-8,  -3,  6,  18, 0x5a8260, 1.0),
      makeMtn2( 9,  -3,  7,  16, 0x5c8462, 1.0),
    ];
    mtns2.forEach(m => scene.add(m));

    // Ground
    const groundGeo = new THREE.PlaneGeometry(400, 80);
    const groundMat = new THREE.MeshBasicMaterial({ color: 0x3a6840 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -4;
    scene.add(ground);

    // Lake â€” blue reflecting water at base
    const lakeGeo = new THREE.PlaneGeometry(30, 12);
    const lakeMat = new THREE.MeshBasicMaterial({ color: 0x6a9eba, transparent: true, opacity: 0.7 });
    const lake = new THREE.Mesh(lakeGeo, lakeMat);
    lake.rotation.x = -Math.PI / 2;
    lake.position.set(0, -3.8, 5);
    scene.add(lake);

    // Lake shimmer
    const shimGeo = new THREE.PlaneGeometry(25, 8);
    const shimMat = new THREE.MeshBasicMaterial({ color: 0x8ac0d0, transparent: true, opacity: 0.25 });
    const shim = new THREE.Mesh(shimGeo, shimMat);
    shim.rotation.x = -Math.PI / 2;
    shim.position.set(0, -3.7, 5);
    scene.add(shim);

    let mouse = { x: 0, y: 0 };
    const onMouse = e => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5);
      mouse.y = (e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener('mousemove', onMouse);

    const onResize = () => {
      const nw = el.clientWidth, nh = el.clientHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    let t = 0, raf;
    const animate = () => {
      t += 0.003;
      camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.02;
      camera.position.y = 2 + Math.sin(t * 0.3) * 0.15 - mouse.y * 0.3;
      camera.lookAt(0, 1, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />;
}

// â”€â”€â”€ Diamond icon SVG (Everswap logo style) â”€â”€â”€
function DiamondLogo({ size = 18, color = '#fbfff4' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 1L19 10L10 19L1 10Z" stroke={color} strokeWidth="1.2" fill="none"/>
      <path d="M10 5L15 10L10 15L5 10Z" stroke={color} strokeWidth="0.8" fill="rgba(255,255,255,0.06)"/>
    </svg>
  );
}

// â”€â”€â”€ Sidebar diamond dot nav â”€â”€â”€
function EverDot({ active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ cursor: 'pointer', padding: '5px 0', display: 'flex', alignItems: 'center' }}
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path
          d="M6.5 1L12 6.5L6.5 12L1 6.5Z"
          stroke="rgba(251,255,244,0.7)"
          strokeWidth={active ? '1.5' : '1'}
          fill={active ? 'rgba(251,255,244,0.2)' : 'none'}
        />
        {active && (
          <path
            d="M6.5 4L9 6.5L6.5 9L4 6.5Z"
            fill="#fbfff4"
          />
        )}
      </svg>
    </div>
  );
}

// â”€â”€â”€ Launch App pill button â”€â”€â”€
function LaunchAppBtn({ lime = false, children = 'Launch App' }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0.6rem 1.5rem 0.6rem 1.8rem',
        borderRadius: 99,
        background: lime ? EV.lime : (hov ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.1)'),
        border: lime ? 'none' : '1px solid rgba(255,255,255,0.2)',
        color: lime ? EV.darkGreen : EV.offWhite,
        fontFamily: SANS,
        fontSize: '0.85rem',
        fontWeight: 600,
        cursor: 'pointer',
        letterSpacing: '0.01em',
        transition: 'all 0.2s ease',
        backdropFilter: lime ? 'none' : 'blur(8px)',
      }}
    >
      {children}
      <span style={{
        width: 26, height: 26, borderRadius: '50%',
        background: lime ? EV.darkGreen : 'rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 8L8 2M8 2H3M8 2V7"
            stroke={lime ? EV.lime : EV.offWhite}
            strokeWidth="1.4" strokeLinecap="round"
          />
        </svg>
      </span>
    </button>
  );
}

// â”€â”€â”€ Rotating diamond animation for section 3 â”€â”€â”€
function RotatingDiamond() {
  return (
    <motion.div
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      style={{ width: 200, height: 200, position: 'relative', marginBottom: '2rem' }}
    >
      {/* Outer diamond */}
      <svg viewBox="0 0 200 200" fill="none" style={{ position: 'absolute', inset: 0 }}>
        <path d="M100 10L190 100L100 190L10 100Z"
          stroke="rgba(251,255,244,0.5)" strokeWidth="1"
        />
        {/* Inner diamonds with arrow-like centre */}
        <path d="M100 35L165 100L100 165L35 100Z"
          stroke="rgba(251,255,244,0.25)" strokeWidth="0.8"
        />
        <path d="M100 55L145 100L100 145L55 100Z"
          stroke="rgba(251,255,244,0.15)" strokeWidth="0.6"
        />
        {/* Chevron arrows in centre */}
        <path d="M80 90L100 110L120 90" stroke="rgba(251,255,244,0.6)" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        <path d="M80 100L100 120L120 100" stroke="rgba(251,255,244,0.35)" strokeWidth="0.9" strokeLinecap="round" fill="none"/>
      </svg>
    </motion.div>
  );
}

// â”€â”€â”€ MAIN DESIGNE COMPONENT â”€â”€â”€
function DesignE() {
  const [active, setActive] = useState(0);
  const intervalRef = useRef(null);

  const startInterval = useCallback((from = 0) => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActive(s => (s + 1) % ES_SECTIONS.length);
    }, 5000);
  }, []);

  useEffect(() => {
    startInterval();
    return () => clearInterval(intervalRef.current);
  }, [startInterval]);

  const goTo = (i) => {
    setActive(i);
    startInterval(i);
  };

  const sec = ES_SECTIONS[active];

  // Pick the right background canvas
  const BgCanvas = {
    'mountain-sky':  EverMountainCanvas,
    'mountain-top':  EverAerialMountainCanvas,
    'river-aerial':  EverRiverCanvas,
    'purple-sky':    EverPurpleCanvas,
    'mountain-lake': EverLakeCanvas,
  }[sec.bg];

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      background: '#4a7ab0', // fallback sky
      fontFamily: SERIF,
    }}>

      {/* â”€â”€ BACKGROUND CANVAS â”€â”€ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={sec.bg}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        >
          <BgCanvas />
        </motion.div>
      </AnimatePresence>

      {/* Subtle dark vignette overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 120% 80% at 50% 100%, rgba(0,0,0,0.35) 0%, transparent 60%)',
      }} />

      {/* â”€â”€ TOP HEADER â”€â”€ */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 1.6rem',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <DiamondLogo size={18} color={EV.offWhite} />
          <span style={{
            fontFamily: SANS, fontSize: '0.9rem', fontWeight: 400,
            color: EV.offWhite, letterSpacing: '0.01em',
          }}>
            EverSwap
          </span>
        </div>

        {/* Launch App button */}
        <LaunchAppBtn>Launch App</LaunchAppBtn>
      </div>

      {/* â”€â”€ LEFT SIDEBAR DOT NAV â”€â”€ */}
      <div style={{
        position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
        zIndex: 30, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center',
      }}>
        {ES_SECTIONS.map((s, i) => (
          <EverDot
            key={i}
            active={active === i}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {/* â”€â”€ SECTION CONTENT â”€â”€ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute', inset: 0, zIndex: 10,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* â”€â”€ HERO SECTION (0) â”€â”€ */}
          {sec.layout === 'hero-center' && (
            <>
              {/* Tagline above */}
              <div style={{
                fontFamily: SANS,
                fontSize: '0.75rem',
                color: EV.offWhite,
                opacity: 0.85,
                letterSpacing: '0.04em',
                marginBottom: '0.6rem',
                textAlign: 'center',
              }}>
                {sec.eyebrow}
              </div>

              {/* Giant title */}
              <h1 style={{
                fontFamily: SERIF,
                fontSize: 'clamp(5rem, 14vw, 12rem)',
                fontWeight: 200,
                color: EV.offWhite,
                margin: 0,
                lineHeight: 0.9,
                letterSpacing: '-0.02em',
                textAlign: 'center',
                textShadow: '0 2px 40px rgba(0,0,0,0.2)',
              }}>
                {sec.title}
              </h1>

              {/* Scroll prompt */}
              <div style={{
                marginTop: '3.5rem',
                fontFamily: SANS,
                fontSize: '0.7rem',
                color: EV.offWhite,
                opacity: 0.5,
                letterSpacing: '0.06em',
              }}>
                {sec.sub}
              </div>
            </>
          )}

          {/* â”€â”€ SPLIT TITLE SECTION (1) â€” "One | Pool" â”€â”€ */}
          {sec.layout === 'split-title' && (
            <div style={{
              display: 'flex', alignItems: 'center',
              gap: 0, width: '100%', justifyContent: 'center',
            }}>
              <h2 style={{
                fontFamily: SERIF,
                fontSize: 'clamp(3.5rem, 9vw, 8rem)',
                fontWeight: 200,
                color: EV.offWhite,
                margin: 0, lineHeight: 0.95,
                letterSpacing: '-0.02em',
                textAlign: 'right',
                flex: 1, paddingRight: '3rem',
              }}>
                {sec.left}
              </h2>
              {/* Vertical divider */}
              <div style={{
                width: 1, height: '8rem',
                background: 'rgba(251,255,244,0.3)',
                flexShrink: 0,
              }} />
              <h2 style={{
                fontFamily: SERIF,
                fontSize: 'clamp(3.5rem, 9vw, 8rem)',
                fontWeight: 200,
                color: EV.offWhite,
                margin: 0, lineHeight: 0.95,
                letterSpacing: '-0.02em',
                textAlign: 'left',
                flex: 1, paddingLeft: '3rem',
              }}>
                {sec.right}
              </h2>
            </div>
          )}

          {/* â”€â”€ CENTER TEXT SECTIONS (2, 3) â”€â”€ */}
          {sec.layout === 'center-text' && (
            <div style={{ textAlign: 'center', padding: '0 3rem' }}>
              {sec.eyebrow && (
                <div style={{
                  fontFamily: SANS, fontSize: '0.75rem', fontWeight: 400,
                  color: EV.offWhite, opacity: 0.75,
                  letterSpacing: '0.05em', marginBottom: '0.5rem',
                }}>
                  {sec.eyebrow}
                </div>
              )}
              {sec.diamond && <RotatingDiamond />}
              <h2 style={{
                fontFamily: SERIF,
                fontSize: 'clamp(4rem, 10vw, 9rem)',
                fontWeight: 200,
                color: EV.offWhite,
                margin: sec.diamond ? '0 0 1.5rem' : '0 0 2rem',
                lineHeight: 0.92,
                letterSpacing: '-0.025em',
              }}>
                {sec.title}
              </h2>
              {sec.desc && (
                <p style={{
                  fontFamily: SANS, fontSize: '0.85rem', fontWeight: 300,
                  color: EV.offWhite, opacity: 0.75,
                  maxWidth: 440, margin: '0 auto',
                  lineHeight: 1.6, letterSpacing: '0.01em',
                }}>
                  {sec.desc}
                </p>
              )}
            </div>
          )}

          {/* â”€â”€ CTA SECTION (4) â”€â”€ */}
          {sec.layout === 'cta-center' && (
            <div style={{ textAlign: 'center', padding: '0 3rem' }}>
              <h2 style={{
                fontFamily: SERIF,
                fontSize: 'clamp(3rem, 7.5vw, 6.5rem)',
                fontWeight: 200,
                color: EV.offWhite,
                margin: '0 0 1.5rem',
                lineHeight: 0.95,
                letterSpacing: '-0.02em',
              }}>
                {sec.line1}<br />{sec.line2}
              </h2>
              {sec.desc && (
                <p style={{
                  fontFamily: SANS, fontSize: '0.85rem',
                  color: EV.offWhite, opacity: 0.7,
                  maxWidth: 420, margin: '0 auto 2.5rem',
                  lineHeight: 1.6,
                }}>
                  {sec.desc}
                </p>
              )}
              <LaunchAppBtn lime={true}>{sec.cta}</LaunchAppBtn>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* â”€â”€ DESIGN LABEL (hidden unless dev) â”€â”€ */}
      <div style={{
        position: 'absolute', top: 14, right: 180, zIndex: 30,
        fontFamily: SANS, fontSize: '0.5rem',
        color: 'rgba(251,255,244,0.35)', letterSpacing: '0.18em', textTransform: 'uppercase',
      }}>
        Design E Â· Everswap Exact
      </div>

      {/* â”€â”€ PROGRESS BAR â”€â”€ */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: 'rgba(251,255,244,0.08)', zIndex: 20,
      }}>
        <motion.div
          animate={{ scaleX: (active + 1) / ES_SECTIONS.length }}
          style={{
            height: '100%',
            background: 'rgba(251,255,244,0.5)',
            transformOrigin: 'left', originX: 0,
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DESIGN F â€” "ANIMEJS EXACT"
   Direct replica of animejs.com
   â€” WebGL/Three.js background outlines
   â€” DIN/Space Grotesk typography
   â€” Scroll-linked / auto-advancing slides
   â€” Rotating subtitle text loop
   â€” Sticky top-header & bottom install bar
   â€” Light/dark background transitions
   â€” Stagger grid circular ripple wave demo
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

function AnimeCanvas({ activeSlide }) {
  const mountRef = useRef(null);
  const targetCamZ = useRef(14);
  const targetCamY = useRef(0);
  const targetCamX = useRef(0);

  useEffect(() => {
    switch (activeSlide) {
      case 0:
        targetCamX.current = 0;
        targetCamY.current = 0;
        targetCamZ.current = 11;
        break;
      case 1:
        targetCamX.current = -3;
        targetCamY.current = 3;
        targetCamZ.current = 15;
        break;
      case 2:
        targetCamX.current = 3;
        targetCamY.current = -2;
        targetCamZ.current = 13;
        break;
      case 3:
        targetCamX.current = -3;
        targetCamY.current = -3;
        targetCamZ.current = 14;
        break;
      case 4:
        targetCamX.current = 0;
        targetCamY.current = 0;
        targetCamZ.current = 15;
        break;
      default:
        break;
    }
  }, [activeSlide]);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const w = el.clientWidth, h = el.clientHeight;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0, 14);

    const shapes = [];
    const colors = [0xff4b4b, 0xffcc2a, 0x00ffaa, 0x4d9cff, 0xc084fc];

    // Cube
    const cubeGeo = new THREE.BoxGeometry(2, 2, 2);
    const cubeMat = new THREE.MeshBasicMaterial({ color: colors[0], wireframe: true, transparent: true, opacity: 0.15 });
    const cube = new THREE.Mesh(cubeGeo, cubeMat);
    cube.position.set(-4, 2, -2);
    scene.add(cube);
    shapes.push({ mesh: cube, rx: 0.005, ry: 0.007 });

    // Torus
    const torusGeo = new THREE.TorusGeometry(1.6, 0.35, 8, 24);
    const torusMat = new THREE.MeshBasicMaterial({ color: colors[2], wireframe: true, transparent: true, opacity: 0.15 });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    torus.position.set(4, -3, -1);
    scene.add(torus);
    shapes.push({ mesh: torus, rx: 0.004, ry: 0.003 });

    // Octahedron
    const octGeo = new THREE.OctahedronGeometry(1.8);
    const octMat = new THREE.MeshBasicMaterial({ color: colors[1], wireframe: true, transparent: true, opacity: 0.15 });
    const oct = new THREE.Mesh(octGeo, octMat);
    oct.position.set(-5, -2, -3);
    scene.add(oct);
    shapes.push({ mesh: oct, rx: 0.006, ry: 0.005 });

    // Ring
    const ringGeo = new THREE.RingGeometry(1.2, 1.4, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: colors[3], wireframe: true, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(5, 3, -2);
    scene.add(ring);
    shapes.push({ mesh: ring, rx: 0.003, ry: 0.006 });

    // Star field
    const partGeo = new THREE.BufferGeometry();
    const count = 180;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 4;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const partMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.05,
      transparent: true,
      opacity: 0.15,
      sizeAttenuation: true
    });
    const particles = new THREE.Points(partGeo, partMat);
    scene.add(particles);

    let mouse = { x: 0, y: 0 };
    const onMouseMove = (e) => {
      const r = el.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouse.y = -((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    el.parentElement.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      const nw = el.clientWidth, nh = el.clientHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    let raf;
    const animate = () => {
      camera.position.x += (targetCamX.current + mouse.x * 1.2 - camera.position.x) * 0.04;
      camera.position.y += (targetCamY.current + mouse.y * 0.8 - camera.position.y) * 0.04;
      camera.position.z += (targetCamZ.current - camera.position.z) * 0.04;
      camera.lookAt(camera.position.x * 0.2, camera.position.y * 0.2, 0);

      shapes.forEach(s => {
        s.mesh.rotation.x += s.rx;
        s.mesh.rotation.y += s.ry;
      });

      particles.rotation.y += 0.0003;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      el.parentElement?.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }} />;
}

const ROTATING_WORDS = ['React Apps', 'Python APIs', 'AI Systems', 'Three.js 3D', 'Fast APIs'];

function RotatingText() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % ROTATING_WORDS.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span style={{ display: 'inline-block', height: '1.2em', verticalAlign: 'bottom', position: 'relative', width: '135px', marginLeft: '6px', overflow: 'hidden' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: 22, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -22, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #ff4b4b, #ffa828)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}
        >
          {ROTATING_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function StaggerGrid() {
  const [rippleOrigin, setRippleOrigin] = useState(null);
  const [rippleKey, setRippleKey] = useState(0);

  const handleDotHover = (row, col) => {
    setRippleOrigin({ row, col });
    setRippleKey(prev => prev + 1);
  };

  const rows = 6;
  const cols = 9;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '8px', maxWidth: '280px', margin: '0 auto' }}>
      {Array.from({ length: rows * cols }).map((_, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;

        let distance = 0;
        if (rippleOrigin) {
          distance = Math.sqrt(Math.pow(r - rippleOrigin.row, 2) + Math.pow(c - rippleOrigin.col, 2));
        }

        return (
          <motion.div
            key={`${i}-${rippleKey}`}
            onMouseEnter={() => handleDotHover(r, c)}
            animate={rippleOrigin ? {
              scale: [1, 1.8, 1],
              backgroundColor: ['rgba(255,255,255,0.12)', '#ffcc2a', 'rgba(255,255,255,0.12)']
            } : {}}
            transition={{
              duration: 0.8,
              delay: rippleOrigin ? distance * 0.06 : 0,
              ease: 'easeOut'
            }}
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.12)',
              cursor: 'pointer'
            }}
          />
        );
      })}
    </div>
  );
}

function DesignF() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [npmCopied, setNpmCopied] = useState(false);
  const autoAdvanceRef = useRef(null);

  const slidesCount = 5;

  const startAutoAdvance = () => {
    clearInterval(autoAdvanceRef.current);
    autoAdvanceRef.current = setInterval(() => {
      setActiveSlide(s => (s + 1) % slidesCount);
    }, 5500);
  };

  useEffect(() => {
    startAutoAdvance();
    return () => clearInterval(autoAdvanceRef.current);
  }, []);

  const handleDotClick = (i) => {
    setActiveSlide(i);
    startAutoAdvance();
  };

  const copyNpm = () => {
    navigator.clipboard.writeText('npm install ankan.js');
    setNpmCopied(true);
    setTimeout(() => setNpmCopied(false), 2000);
  };

  const isLight = activeSlide === 1;
  const animeFont = `'Space Grotesk', 'Rajdhani', sans-serif`;

  const dotVariants = {
    animate: (i) => ({
      x: [0, 180, 0],
      rotate: [0, 360, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        delay: i * 0.15,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  };

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      background: isLight ? '#dad5d0' : '#252423',
      color: isLight ? '#252423' : '#f6f4f2',
      fontFamily: animeFont,
      transition: 'background-color 0.6s ease, color 0.6s ease',
    }}>
      <AnimeCanvas activeSlide={activeSlide} />

      {/* â”€â”€ STICKY HEADER â”€â”€ */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.8rem 1.5rem',
        borderBottom: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.05)',
        background: isLight ? 'rgba(218,213,208,0.85)' : 'rgba(37,36,35,0.85)',
        backdropFilter: 'blur(8px)',
        transition: 'background-color 0.6s ease, border-color 0.6s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff4b4b', display: 'inline-block' }} />
          ankan.js
          <span style={{ fontSize: '0.65rem', background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, marginLeft: 4, fontWeight: 500, color: isLight ? '#666' : '#999' }}>v4.0</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem', fontWeight: 500 }}>
          {['Docs', 'Easings', 'Learn'].map(l => (
            <span key={l} style={{ cursor: 'pointer', opacity: 0.8 }} className="hover-opacity">{l}</span>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            style={{
              padding: '0.4rem 1.1rem', borderRadius: 99, border: 'none',
              background: '#ff4b4b', color: '#fff', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer'
            }}
          >
            Sponsor
          </motion.button>
        </div>
      </div>

      {/* â”€â”€ LEFT SIDEBAR DOT NAV â”€â”€ */}
      <div style={{
        position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
        zIndex: 35, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center',
      }}>
        {Array.from({ length: slidesCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleDotClick(i)}
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <div style={{
              width: 8, height: 8, transform: 'rotate(45deg)',
              border: `1.5px solid ${isLight ? '#252423' : '#f6f4f2'}`,
              background: activeSlide === i ? (isLight ? '#252423' : '#f6f4f2') : 'transparent',
              opacity: activeSlide === i ? 1 : 0.4,
              transition: 'all 0.3s'
            }} />
          </button>
        ))}
      </div>

      {/* â”€â”€ MAIN CONTENT â€” TRANSITION CONTAINER â”€â”€ */}
      <div style={{ position: 'relative', width: '100%', height: '100%', zIndex: 10, padding: '4.5rem 3.5rem 3.5rem 4rem' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}
          >
            {/* Slide 0: Hero */}
            {activeSlide === 0 && (
              <div style={{ textAlign: 'left', maxWidth: '520px' }}>
                <h1 style={{ fontSize: 'clamp(2.8rem, 6.5vw, 5rem)', fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.0, margin: '0 0 1rem', color: '#fff' }}>
                  ankan.js
                </h1>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 500, margin: '0 0 1.2rem', color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                  Interactive Web Developer & <RotatingText />
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, margin: '0 0 2rem' }}>
                  A lightweight creative library designed for high-performance animation sequencing, hardware-accelerated 3D effects, and modern responsive layouts. Pushing design frontiers.
                </p>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <button style={{ padding: '0.65rem 1.6rem', borderRadius: 6, border: 'none', background: '#f6f4f2', color: '#252423', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>Get Started</button>
                  <button style={{ padding: '0.65rem 1.6rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>Documentation</button>
                </div>
              </div>
            )}

            {/* Slide 1: Toolbox (Light) */}
            {activeSlide === 1 && (
              <div style={{ width: '100%', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 1.8rem', color: '#2f2e2d' }}>
                  The animation toolbox.
                </h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {[
                    { title: 'CSS', color: '#ff4b4b', desc: 'Animate opacity, shadows, borders.' },
                    { title: 'Transforms', color: '#ffa828', desc: 'Translate, rotate, scale, skew.' },
                    { title: 'SVG', color: '#00ffaa', desc: 'Morph vector paths and trace strokes.' },
                    { title: 'DOM', color: '#4d9cff', desc: 'Manipulate HTML attributes directly.' },
                    { title: 'JS Objects', color: '#c084fc', desc: 'Stagger custom key-value variables.' }
                  ].map(c => (
                    <motion.div
                      key={c.title}
                      whileHover={{ y: -6, scale: 1.02 }}
                      style={{
                        flex: '1 1 120px', maxWidth: '145px', padding: '1rem 0.8rem', borderRadius: 12,
                        background: 'rgba(0,0,0,0.03)', borderTop: `4px solid ${c.color}`,
                        textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 6,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                      }}
                    >
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2f2e2d' }}>{c.title}</span>
                      <span style={{ fontSize: '0.65rem', color: '#666', lineHeight: 1.4 }}>{c.desc}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Slide 2: Intuitive API (Dark) */}
            {activeSlide === 2 && (
              <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '2rem' }}>
                <div style={{ flex: '1', textAlign: 'left', maxWidth: '340px' }}>
                  <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#05dbe9', margin: '0 0 1rem' }}>
                    Intuitive API.
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                    Sequence complicated movements, define staggered delays, and control play/pause states using clean, chainable JavaScript methods. Built for readability.
                  </p>
                </div>
                <div style={{ flex: '1.2', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: 16 }}>
                  {/* Code editor */}
                  <div style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.65rem', color: '#a6accd', textAlign: 'left', lineHeight: 1.4 }}>
                    <div><span style={{ color: '#c792ea' }}>ankan</span>.<span style={{ color: '#82aaff' }}>timeline</span>({'{'} loop: <span style={{ color: '#f78c6c' }}>true</span> {'}'})</div>
                    <div style={{ paddingLeft: 12 }}>.<span style={{ color: '#82aaff' }}>add</span>({'{'}</div>
                    <div style={{ paddingLeft: 24 }}>targets: <span style={{ color: '#c3e88d' }}>'.dot'</span>,</div>
                    <div style={{ paddingLeft: 24 }}>translateX: <span style={{ color: '#f78c6c' }}>180</span>,</div>
                    <div style={{ paddingLeft: 24 }}>rotate: <span style={{ color: '#c3e88d' }}>'1turn'</span>,</div>
                    <div style={{ paddingLeft: 24 }}>delay: <span style={{ color: '#82aaff' }}>stagger</span>(<span style={{ color: '#f78c6c' }}>150</span>)</div>
                    <div style={{ paddingLeft: 12 }}>{'}'});</div>
                  </div>
                  {/* Visual Demo */}
                  <div style={{ width: '80px', display: 'flex', flexDirection: 'column', gap: 12, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 12 }}>
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        custom={i}
                        variants={dotVariants}
                        animate="animate"
                        style={{
                          width: '18px', height: '18px', borderRadius: '50%',
                          background: ['#ff4b4b', '#ffcc2a', '#00ffaa'][i],
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Slide 3: Staggering */}
            {activeSlide === 3 && (
              <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '2rem' }}>
                <div style={{ flex: '1', textAlign: 'left', maxWidth: '340px' }}>
                  <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#ffcc2a', margin: '0 0 1rem' }}>
                    Staggering.
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: '1rem' }}>
                    Follow the grid. Hover or click any circle in the matrix to emit circular stagger waves across the coordinate system.
                  </p>
                </div>
                <div style={{ flex: '1.2', display: 'flex', justifyContent: 'center' }}>
                  <StaggerGrid />
                </div>
              </div>
            )}

            {/* Slide 4: Get Started */}
            {activeSlide === 4 && (
              <div style={{ width: '100%', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 2rem' }}>
                  Get started.
                </h2>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', maxWidth: '580px', margin: '0 auto' }}>
                  {[
                    { t: 'Read documentation', desc: 'Learn APIs & syntax', border: '#ff4b4b' },
                    { t: 'Explore easings', desc: 'Visual physics curves', border: '#00ffaa' },
                    { t: 'View github repo', desc: 'Open-source code', border: '#ffa828' }
                  ].map(card => (
                    <motion.div
                      key={card.t}
                      whileHover={{ scale: 1.03 }}
                      style={{
                        flex: 1, padding: '1.2rem 1rem', borderRadius: 12,
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                        borderTop: `4px solid ${card.border}`, textAlign: 'left', cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>{card.t}</div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>{card.desc}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* â”€â”€ STICKY BOTTOM ACTION BAR â”€â”€ */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.6rem 1.5rem',
        borderTop: isLight ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.05)',
        background: isLight ? 'rgba(218,213,208,0.85)' : 'rgba(37,36,35,0.85)',
        backdropFilter: 'blur(8px)',
        transition: 'background-color 0.6s ease, border-color 0.6s ease',
      }}>
        {/* Terminal copy block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.2)', padding: '5px 12px', borderRadius: 6, fontSize: '0.75rem', fontFamily: 'monospace' }}>
          <span style={{ color: isLight ? '#777' : '#999' }}>$</span>
          <span style={{ color: isLight ? '#333' : '#eee', fontWeight: 500 }}>npm install ankan.js</span>
          <button onClick={copyNpm} style={{ background: 'none', border: 'none', color: isLight ? '#666' : '#aaa', cursor: 'pointer', padding: 0, fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>
            {npmCopied ? 'âœ“' : 'ðŸ“‹'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', fontSize: '0.75rem', fontWeight: 600 }}>
          <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            Learn more
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 5H9M9 5L5 1M9 5L5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   DESIGNS REGISTRY
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

const DESIGNS = [
  {
    id: 'F',
    label: 'AnimeJS Exact',
    sub: 'Anime.js replica',
    accent: '#ff4b4b',
    icon: 'â˜„ï¸',
    component: DesignF,
  },
  {
    id: 'B',
    label: 'Orbital Cosmos',
    sub: 'Everswap style',
    accent: '#c084fc',
    icon: 'ðŸŒŒ',
    component: DesignB,
  },
  {
    id: 'C',
    label: 'Cinematic Bold',
    sub: 'Hubtown style',
    accent: '#ffffff',
    icon: 'ðŸŽ¬',
    component: DesignC,
  },
  {
    id: 'D',
    label: 'Anime Spring',
    sub: 'Anime.js style',
    accent: '#34d399',
    icon: 'âœ¦',
    component: DesignD,
  },
  {
    id: 'E',
    label: 'Everswap Exact',
    sub: 'Everswap replica',
    accent: '#e0ffab',
    icon: 'â—‡',
    component: DesignE,
  },
];

export default function DesignTab() {
  const [active, setActive] = useState('E');
  const [key, setKey] = useState(0); // force remount to replay animations

  const handleSelect = useCallback((id) => {
    setActive(id);
    setKey(k => k + 1);
  }, []);

  const ActiveDesign = DESIGNS.find(d => d.id === active)?.component ?? DesignE;
  const activeDesign = DESIGNS.find(d => d.id === active);

  return (
    <section
      id="design"
      style={{ minHeight: '100vh', padding: '8rem 0 4rem', position: 'relative' }}
    >
      <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 100 }}>
        <Link to="/" style={{ 
          display: 'flex', alignItems: 'center', gap: '0.5rem', 
          color: 'var(--gray-2)', textDecoration: 'none', fontFamily: 'var(--font-mono)', 
          fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' 
        }}>
          ← Back to Portfolio
        </Link>
      </div>

      {/* Section header */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 2rem 3rem' }}>
        <motion.span
          className="section-eyebrow"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          // Design Lab
        </motion.span>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ margin: '1rem 0 0.75rem' }}
        >
          Choose Your <span className="gradient-text">Design</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ color: 'var(--gray-2)', fontSize: '1rem', maxWidth: 520, lineHeight: 1.7 }}
        >
          5 distinct hero design concepts inspired by world-class studios. Pick your favourite and I'll build the full portfolio around it.
        </motion.p>
      </div>

      {/* Tab selector */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 2rem 2rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {DESIGNS.map((d) => (
            <motion.button
              key={d.id}
              onClick={() => handleSelect(d.id)}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'flex', flexDirection: 'column', gap: 4,
                padding: '0.85rem 1.5rem', borderRadius: 16, cursor: 'pointer',
                border: `1.5px solid ${active === d.id ? d.accent : 'var(--border)'}`,
                background: active === d.id ? `${d.accent}18` : 'var(--surface)',
                transition: 'all 0.25s ease', textAlign: 'left', minWidth: 140,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '1.1rem' }}>{d.icon}</span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700,
                  color: active === d.id ? d.accent : 'var(--gray-1)',
                }}>
                  {d.label}
                </span>
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.1em',
                color: active === d.id ? `${d.accent}cc` : 'var(--gray-3)', textTransform: 'uppercase',
              }}>
                Design {d.id} Â· {d.sub}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Preview window */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            borderRadius: 28, overflow: 'hidden',
            border: `1.5px solid ${activeDesign?.accent ?? 'var(--border)'}44`,
            boxShadow: `0 0 80px ${activeDesign?.accent ?? '#7c6af7'}18, 0 40px 120px rgba(0,0,0,0.6)`,
            height: 560, position: 'relative',
            transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
          }}
        >
          {/* Browser chrome bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 42, zIndex: 50,
            background: 'rgba(8,8,16,0.9)', backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', padding: '0 1.25rem', gap: '0.5rem',
          }}>
            {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
            ))}
            <div style={{
              flex: 1, marginLeft: '1rem', height: 22, background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)',
            }}>
              ankandev.io
            </div>
          </div>

          {/* Design preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${active}-${key}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
              style={{ position: 'absolute', inset: 0, paddingTop: 42 }}
            >
              <div style={{ width: '100%', height: '100%' }}>
                <ActiveDesign key={`${active}-${key}`} />
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Design info row */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginTop: '1.5rem', padding: '1.25rem 1.5rem',
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, flexWrap: 'wrap', gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--white)' }}>
                {activeDesign?.icon} {activeDesign?.label}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem', padding: '0.2rem 0.6rem',
                background: `${activeDesign?.accent}18`, border: `1px solid ${activeDesign?.accent}44`,
                borderRadius: 99, color: activeDesign?.accent, letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                Design {activeDesign?.id}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--gray-3)', marginTop: 4 }}>
              Inspired by: {activeDesign?.sub.replace(' style', '').replace(' replica', '')} Â· {
                { B: 'Three.js orbits + floating glass cards', C: 'Cinematic typography + diagonal reveals + counter', D: 'Spring physics + stagger bounce + skill pills', E: 'Three.js landscape & floating shapes + light/dark sections + serif font + diamond motifs + sidebar nav', F: 'Three.js bg + dark/light theme switch + rotating subtitle + interactive stagger grid + code demo' }[active]
              }
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '0.7rem 1.75rem', borderRadius: 99,
              background: `linear-gradient(135deg, ${activeDesign?.accent}, ${activeDesign?.accent}aa)`,
              border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.85rem',
              cursor: 'pointer', fontFamily: 'var(--font-body)',
              boxShadow: `0 4px 20px ${activeDesign?.accent}44`,
            }}
          >
            Apply This Design âœ¦
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
