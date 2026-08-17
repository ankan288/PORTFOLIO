import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { Mail, ExternalLink, Code2, Database, BrainCircuit, Terminal, Award, Send, ArrowUpRight, X, Menu, Home, User, Briefcase } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import TiltCard from '../components/TiltCard';
import SideRays from '../components/SideRays';
import Stack from '../components/Stack';
import InfiniteMenu from '../components/InfiniteMenu';
import Dock from '../components/Dock';
import GlassSurface from '../components/GlassSurface';
import Lenis from 'lenis';
import '../index.css';

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 50, rotateX: -8 },
  visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.75, ease: [0.23, 1, 0.32, 1] } }
};

const fadeLeft = {
  hidden: { opacity: 0, x: -60, rotateY: 10 },
  visible: { opacity: 1, x: 0, rotateY: 0, transition: { duration: 0.75, ease: [0.23, 1, 0.32, 1] } }
};

const fadeRight = {
  hidden: { opacity: 0, x: 60, rotateY: -10 },
  visible: { opacity: 1, x: 0, rotateY: 0, transition: { duration: 0.75, ease: [0.23, 1, 0.32, 1] } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};

const cardReveal = {
  hidden: { opacity: 0, y: 60, rotateX: -12, scale: 0.93 },
  visible: { opacity: 1, y: 0, rotateX: 0, scale: 1, transition: { duration: 0.7, ease: [0.23, 1, 0.32, 1] } }
};

/* ─── Data ─── */
const skills = [
  'React.js','Next.js','TypeScript','TailwindCSS','Python','FastAPI',
  'Node.js','PostgreSQL','MongoDB','Docker','TensorFlow','PyTorch',
  'Hugging Face','Gemini API','Git','Firebase','AWS','REST APIs'
];

const projects = [
  { title: 'zeroHack-v2.0', desc: 'No description provided on GitHub.', tags: ['Python'], githubLink: 'https://github.com/ankan288/zeroHack-v2.0', liveLink: null, color: 'from-violet-600 to-indigo-700' },
  { title: 'ABB-OlYMPUS', desc: 'No description provided on GitHub.', tags: ['JavaScript'], githubLink: 'https://github.com/ankan288/ABB-OlYMPUS', liveLink: null, color: 'from-cyan-600 to-blue-700' },
  { title: 'ankan', desc: 'No description provided on GitHub.', tags: ['CSS'], githubLink: 'https://github.com/ankan288/ankan', liveLink: null, color: 'from-emerald-600 to-teal-700' },
  { title: 'School_portal', desc: 'No description provided on GitHub.', tags: ['TypeScript'], githubLink: 'https://github.com/ankan288/School_portal', liveLink: 'https://school-portal-theta-five.vercel.app', color: 'from-orange-600 to-red-700' },
  { title: 'FactPulse', desc: 'No description provided on GitHub.', tags: ['TypeScript'], githubLink: 'https://github.com/ankan288/FactPulse', liveLink: null, color: 'from-purple-600 to-pink-700' },
  { title: 'Asklytics', desc: 'No description provided on GitHub.', tags: ['TypeScript'], githubLink: 'https://github.com/ankan288/Asklytics', liveLink: null, color: 'from-amber-600 to-lime-700' },
];

import { badges as certs } from '../data/badges.js';

const navLinks = [
  { name: 'About', href: '#about' },
  { name: 'Skills', href: '#skills' },
  { name: 'Projects', href: '#projects' },
  { name: 'Certifications', href: '#certifications' },
  { name: 'Contact', href: '#contact' },
  { name: 'Design', href: '/design', isRouterLink: true },
];

/* ─── Floating 3D Badge ─── */
function FloatingBadge({ children, delay = 0, style = {} }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
      transition={{ delay, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -6, rotateY: 8, scale: 1.05, transition: { duration: 0.2 } }}
      style={{ perspective: '600px', ...style }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Main Portfolio ─── */
export default function Portfolio() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;
    const formData = new FormData(form);
    
    try {
      const res = await fetch("https://formsubmit.co/ajax/ankanghosh156@gmail.com", {
        method: "POST",
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });
      if (res.ok) {
        alert("Message sent successfully! (Note: If this is your first test, please check your email ankanghosh156@gmail.com to activate FormSubmit)");
        form.reset();
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Lenis smooth scroll setup
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    
    
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#050508' }}>

      <main>
        {/* ═══ HERO ═══ */}
        <section id="home" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '0 2rem', position: 'relative', overflow: 'hidden' }}>

          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <SideRays
              speed={2.5}
              rayColor1="#EAB308"
              rayColor2="#96c8ff"
              intensity={2}
              spread={2}
              origin="top-right"
              tilt={0}
              saturation={1.5}
              blend={0.75}
              falloff={1.6}
              opacity={1.0}
            />
          </div>

          <div style={{ maxWidth: '1180px', margin: '0 auto', width: '100%', paddingTop: '8rem', paddingBottom: '6rem', position: 'relative', zIndex: 1 }}>
            <motion.div variants={stagger} initial="hidden" animate="visible" style={{ perspective: '1200px' }}>

              <motion.div variants={fadeUp} style={{ marginBottom: '2rem' }}>
                <FloatingBadge delay={0.1}>
                  <span className="hero-badge">
                    <span className="hero-badge-dot" />
                    Available for new opportunities
                  </span>
                </FloatingBadge>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="hero-title"
                style={{ marginBottom: '1.5rem', transformStyle: 'preserve-3d' }}
              >
                Building<br />
                <motion.span
                  className="gradient-text"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                  style={{ backgroundSize: '200% 200%' }}
                >
                  Intelligent
                </motion.span><br />
                Digital Systems
              </motion.h1>

              <motion.p variants={fadeUp} style={{ fontSize: '1.1rem', color: 'var(--gray-2)', maxWidth: '520px', marginBottom: '2.5rem', lineHeight: 1.7 }}>
                I'm <strong style={{ color: 'var(--white)' }}>Ankan</strong> — a full-stack developer & AI enthusiast crafting high-performance apps from India 🇮🇳
              </motion.p>

              <motion.div variants={fadeUp} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
                <motion.a
                  href="#projects"
                  className="btn btn-fill"
                  whileHover={{ scale: 1.05, rotateX: -5, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ perspective: '400px' }}
                >
                  View Projects <ArrowUpRight size={16} />
                </motion.a>
                <motion.a
                  href="#contact"
                  className="btn btn-outline"
                  whileHover={{ scale: 1.05, rotateX: -5, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  style={{ perspective: '400px' }}
                >
                  Let's Talk
                </motion.a>
              </motion.div>

              <motion.div variants={fadeUp} style={{ display: 'flex', gap: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                {[['12+', 'Projects'], ['8+', 'Certifications'], ['2+', 'Yrs Exp']].map(([n, l], i) => (
                  <motion.div
                    key={l}
                    whileHover={{ y: -5, rotateY: 8, scale: 1.08 }}
                    style={{ perspective: '400px', cursor: 'default' }}
                  >
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--white)', lineHeight: 1 }}>{n}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-3)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{l}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll hint */}
          <div style={{ position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
            <div className="hero-scroll-hint">
              <div className="hero-scroll-line" />
              <span>scroll</span>
            </div>
          </div>
        </section>

        {/* ═══ ABOUT ═══ */}
        <section id="about" className="section-wrap">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>

            <motion.h2 variants={fadeUp} className="section-title" style={{ marginBottom: '3rem' }}>
              Who I <span className="gradient-text">Am</span>
            </motion.h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'start' }}>
              <motion.div variants={fadeLeft} style={{ gridColumn: 'span 2' }}>
                <TiltCard className="card" style={{ padding: '2.5rem', display: 'grid', gap: '1.5rem' }} intensity={8}>
                  <p style={{ fontSize: '1.1rem', color: 'var(--gray-1)', lineHeight: 1.8 }}>
                    I'm a passionate <strong style={{ color: 'var(--white)' }}>developer & technologist</strong> who blends technical depth with creative thinking. I build systems that are both functional and beautiful.
                  </p>
                  <p style={{ color: 'var(--gray-2)', lineHeight: 1.8 }}>
                    My journey spans <strong style={{ color: 'var(--gray-1)' }}>AI/ML, full-stack development, and API engineering</strong>. I'm constantly experimenting with new frameworks and pushing web boundaries.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    {[['Focus', 'AI · Web · APIs'], ['Location', 'India 🇮🇳'], ['Languages', 'English, Bengali'], ['Status', '● Open to Work']].map(([k, v]) => (
                      <div key={k}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--gray-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>{k}</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 500, color: k === 'Status' ? 'var(--green)' : 'var(--gray-1)' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div><motion.button className="btn btn-outline" style={{ fontSize: '0.8rem' }} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>Download CV</motion.button></div>
                </TiltCard>
              </motion.div>

              <motion.div variants={fadeRight} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <div style={{ width: 208, height: 208 }}>
                    <Stack
                      randomRotation={true}
                      sensitivity={180}
                      sendToBackOnClick={true}
                      cards={[
                        "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=500&auto=format",
                        "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=500&auto=format",
                        "https://images.unsplash.com/photo-1452626212852-811d58933cae?q=80&w=500&auto=format"
                      ].map((src, i) => (
                        <img 
                          key={i} 
                          src={src} 
                          alt={`card-${i + 1}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ))}
                    />
                  </div>
                </div>
                {[['12+', 'Projects Built'], ['8+', 'Certifications'], ['2+', 'Years Exp']].map(([n, l], i) => (
                  <TiltCard key={l} className="stat-box" intensity={10} scale={1.04}>
                    <div className="stat-number">{n}</div>
                    <div className="stat-label">{l}</div>
                  </TiltCard>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </section>

        <div className="section-divider" />

        {/* ═══ SKILLS ═══ */}
        <section id="skills" className="section-wrap">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>

            <motion.h2 variants={fadeUp} className="section-title" style={{ margin: '1rem 0 3rem' }}>
              Skills & <span className="gradient-text">Technologies</span>
            </motion.h2>

            {/* Skill Category Cards with tilt */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
              {[
                { title: 'Frontend', icon: <Code2 size={20} style={{ color: 'var(--accent)' }} />, skills: ['React.js', 'Next.js', 'TypeScript', 'TailwindCSS', 'HTML/CSS'] },
                { title: 'Backend', icon: <Terminal size={20} style={{ color: 'var(--green)' }} />, skills: ['Python', 'Node.js', 'FastAPI', 'Flask', 'REST APIs'] },
                { title: 'AI / ML', icon: <BrainCircuit size={20} style={{ color: 'var(--accent-2)' }} />, skills: ['TensorFlow', 'PyTorch', 'Hugging Face', 'Gemini API', 'OpenCV'] },
                { title: 'Data & Tools', icon: <Database size={20} style={{ color: '#60a5fa' }} />, skills: ['PostgreSQL', 'MongoDB', 'Git/GitHub', 'Docker', 'Firebase'] },
              ].map((cat, i) => (
                <motion.div key={i} variants={cardReveal} style={{ perspective: '800px' }}>
                  <TiltCard className="skill-cat-card" intensity={12} scale={1.03}>
                    <div className="skill-cat-icon">{cat.icon}</div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--white)', marginBottom: '1rem' }}>{cat.title}</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {cat.skills.map(s => <span key={s} className="skill-pill">{s}</span>)}
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>

            {/* Floating skill pills */}
            <motion.div variants={fadeUp} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              {skills.map((s, i) => (
                <motion.span
                  key={s}
                  className="skill-pill"
                  initial={{ opacity: 0, y: 20, rotateX: -15 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  whileHover={{ y: -4, rotateY: 8, scale: 1.08, transition: { duration: 0.15 } }}
                  style={{ perspective: '300px', cursor: 'default' }}
                >
                  {s}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </section>

        <div className="section-divider" />

        {/* ═══ PROJECTS ═══ */}
        <section id="projects" className="section-wrap">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '1rem 0 3rem', flexWrap: 'wrap', gap: '1rem' }}>
              <motion.h2 variants={fadeUp} className="section-title">
                Featured <span className="gradient-text">Work</span>
              </motion.h2>
              <motion.a variants={fadeUp} href="#" className="link-arrow">All projects <ArrowUpRight size={16} /></motion.a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {projects.map((p, i) => (
                <motion.div
                  key={i}
                  variants={cardReveal}
                  style={{ perspective: '1000px' }}
                >
                  <TiltCard className="project-card" intensity={10} scale={1.02} style={{ height: '100%' }}>
                    <div className={`project-visual bg-gradient-to-br ${p.color}`}>
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)' }} />
                      {/* 3D floating project number */}
                      <div className="project-3d-number">0{i + 1}</div>
                      <div className="project-overlay">
                        <motion.a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="project-icon-btn" whileHover={{ scale: 1.15, rotate: 5 }}><FaGithub size={16} /></motion.a>
                        {p.liveLink && (
                          <motion.a href={p.liveLink} target="_blank" rel="noopener noreferrer" className="project-icon-btn" whileHover={{ scale: 1.15, rotate: -5 }}><ExternalLink size={16} /></motion.a>
                        )}
                      </div>
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
                        {p.tags.map(t => <span key={t} className="tag-chip">{t}</span>)}
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--white)', marginBottom: '0.5rem' }}>{p.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--gray-2)', lineHeight: 1.7 }}>{p.desc}</p>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <div className="section-divider" />

        {/* ═══ CERTIFICATIONS ═══ */}
        <section id="certifications" className="section-wrap">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>

            <motion.h2 variants={fadeUp} className="section-title" style={{ margin: '1rem 0 3rem' }}>
              Certifications & <span className="gradient-text">Achievements</span>
            </motion.h2>
            <div style={{ width: '100%', height: '500px', margin: '2rem auto', position: 'relative', borderRadius: '24px', overflow: 'hidden' }}>
              <InfiniteMenu 
                items={certs.map((c, i) => ({
                  image: c.image,
                  link: c.link,
                  title: c.name,
                  description: c.issuer
                }))}
              />
            </div>
          </motion.div>
        </section>

        <div className="section-divider" />

        {/* ═══ CONTACT ═══ */}
        <section id="contact" className="section-wrap" style={{ paddingBottom: '8rem' }}>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}>

            <motion.h2 variants={fadeUp} className="section-title" style={{ margin: '1rem 0 3rem' }}>
              Let's <span className="gradient-text">Connect</span>
            </motion.h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'start' }}>
              <motion.div variants={fadeLeft} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <p style={{ color: 'var(--gray-2)', lineHeight: 1.8 }}>Open to new opportunities, collaborations, and interesting projects. Drop a message and let's build something great.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
                  <a href="mailto:ankanghosh156@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-h)', textDecoration: 'none' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <Mail size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Email</h4>
                      <span style={{ fontSize: '0.875rem', color: 'var(--gray-2)' }}>ankanghosh156@gmail.com</span>
                    </div>
                  </a>
                  
                  <a href="https://github.com/ankan288" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-h)', textDecoration: 'none' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <FaGithub size={20} className="text-gray-300" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>GitHub</h4>
                      <span style={{ fontSize: '0.875rem', color: 'var(--gray-2)' }}>github.com/ankan288</span>
                    </div>
                  </a>

                  <a href="https://www.linkedin.com/in/ankan-ghosh08" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-h)', textDecoration: 'none' }}>
                    <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <FaLinkedin size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>LinkedIn</h4>
                      <span style={{ fontSize: '0.875rem', color: 'var(--gray-2)' }}>www.linkedin.com/in/ankan-ghosh08</span>
                    </div>
                  </a>
                </div>
              </motion.div>

              <motion.div variants={fadeRight}>
                <GlassSurface width="100%" height="100%" borderRadius={24} blur={16} brightness={40}>
                  <form onSubmit={handleFormSubmit} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', border: 'none', background: 'transparent' }}>
                    <input type="hidden" name="_captcha" value="false" />
                    <input type="hidden" name="_template" value="table" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
                      <div style={{ width: '100%' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--gray-2)', fontWeight: 500, marginBottom: '0.5rem' }}>Name</label>
                        <input type="text" name="name" required placeholder="John Doe" className="input-field" style={{ width: '100%' }} />
                      </div>
                      <div style={{ width: '100%' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--gray-2)', fontWeight: 500, marginBottom: '0.5rem' }}>Email</label>
                        <input type="email" name="email" required placeholder="john@example.com" className="input-field" style={{ width: '100%' }} />
                      </div>
                    </div>
                    <div style={{ width: '100%' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--gray-2)', fontWeight: 500, marginBottom: '0.5rem' }}>Subject</label>
                      <input type="text" name="_subject" required placeholder="Project collaboration..." className="input-field" style={{ width: '100%' }} />
                    </div>
                    <div style={{ width: '100%' }}>
                      <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--gray-2)', fontWeight: 500, marginBottom: '0.5rem' }}>Message</label>
                      <textarea name="message" required rows={5} placeholder="Tell me about your project..." className="input-field" style={{ width: '100%', resize: 'vertical' }} />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-accent"
                      style={{ width: '100%', gap: '0.5rem', opacity: isSubmitting ? 0.7 : 1 }}
                      whileHover={{ scale: isSubmitting ? 1 : 1.02, y: isSubmitting ? 0 : -2, boxShadow: '0 12px 40px var(--accent-glow)' }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'} <Send size={16} />
                    </motion.button>
                  </form>
                </GlassSurface>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* FIXED DOCK NAVIGATION */}
      <div style={{ position: 'fixed', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
        <Dock 
          items={[
            { icon: <Home size={18} />, label: 'Home', onClick: () => document.getElementById('home').scrollIntoView({ behavior: 'smooth' }) },
            { icon: <User size={18} />, label: 'About', onClick: () => document.getElementById('about').scrollIntoView({ behavior: 'smooth' }) },
            { icon: <Code2 size={18} />, label: 'Skills', onClick: () => document.getElementById('skills').scrollIntoView({ behavior: 'smooth' }) },
            { icon: <Briefcase size={18} />, label: 'Projects', onClick: () => document.getElementById('projects').scrollIntoView({ behavior: 'smooth' }) },
            { icon: <Award size={18} />, label: 'Certs', onClick: () => document.getElementById('certifications').scrollIntoView({ behavior: 'smooth' }) },
            { icon: <Mail size={18} />, label: 'Contact', onClick: () => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }) },
            { icon: <BrainCircuit size={18} />, label: 'Design', onClick: () => navigate('/design') },
          ]}
          panelHeight={68}
          baseItemSize={50}
          magnification={70}
        />
      </div>

    </div>
  );
}
