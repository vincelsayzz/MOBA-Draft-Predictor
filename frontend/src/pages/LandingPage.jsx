import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiLinkedin, FiFacebook, FiMail, FiGithub } from 'react-icons/fi'

// Each game's logo image lives in frontend/public/images/logos/ — drop your
// own files there using these exact filenames. If a file is missing, the
// badge falls back to a plain letter so nothing looks broken in the
// meantime.
const GAMES = [
  {
    id: 'dota2',
    path: '/dota2',
    name: 'Dota 2',
    accent: '#66fcf1',
    logo: '/public/Dota2-logo.webp',
  },
  {
    id: 'league',
    path: '/league',
    name: 'League of Legends',
    accent: '#e6b44c',
    logo: '/public/LOL-logo.png',
  },
  {
    id: 'hok',
    path: '/hok',
    name: 'Honor of Kings',
    accent: '#d4af37',
    logo: '/public/Hok-logo.jpg',
  },
]

// frontend/public/images/landing-bg.jpg — drop a background image here
// with that exact filename. Falls back to the dark solid color below if
// it's missing, so the page still looks intentional either way.
const BACKGROUND_IMAGE = '/public/landing-bg.png'

function LandingPage() {
  return (
    <div style={styles.page}>
      <style>
        {`
          .logo-badge { transition: transform 0.2s ease, box-shadow 0.2s ease; }
          .logo-badge:hover { transform: scale(1.08) translateY(-4px); }
          
          .social-icon { 
            transition: all 0.3s ease; 
            border-color: rgba(255,255,255,0.15) !important;
            color: #d5d8e0 !important;
          }
          .social-icon:hover { 
            border-color: #00d4ff !important; 
            color: #00d4ff !important; 
            box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
            transform: translateY(-3px); 
          }
        `}
      </style>

      <div style={styles.overlay} />

      <div style={styles.content}>
        
        {/* Main Content Area */}
        <div style={styles.mainSection}>
          <header style={styles.header}>
            <h1 style={styles.title}>MOBA DRAFT PREDICTOR</h1>
            <p style={styles.subtitle}>Predict the outcome of your favorite MOBA games</p>
          </header>

          <div style={styles.badgeRow}>
            {GAMES.map((game) => (
              <LogoBadge key={game.id} game={game} />
            ))}
          </div>
        </div>

        {/* Bottom / Connect Section */}
        <div style={styles.bottomSection}>
          <p style={styles.copyrightText}>
            © 2026 Vince Keth R. Maarat. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

function LogoBadge({ game }) {
  // Tracks whether the logo image failed to load (e.g. not added yet),
  // so we can swap in a plain-letter fallback instead of a broken image.
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <Link
      to={game.path}
      className="logo-badge"
      style={{ ...styles.badge, borderColor: game.accent, boxShadow: `0 0 25px ${game.accent}55` }}
      aria-label={game.name}
      title={game.name}
    >
      {!imgFailed ? (
        <img
          src={game.logo}
          alt={game.name}
          onError={() => setImgFailed(true)}
          style={styles.badgeImg}
        />
      ) : (
        <span style={{ ...styles.badgeFallback, color: game.accent }}>
          {game.name.charAt(0)}
        </span>
      )}
    </Link>
  )
}

const styles = {
  page: {
    position: 'relative',
    minHeight: '100vh',
    backgroundColor: '#0b0c10',
    backgroundImage: `url(${BACKGROUND_IMAGE})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    fontFamily: "'Roboto Condensed', sans-serif",
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(11,12,16,0.55) 0%, rgba(11,12,16,0.85) 100%)',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: '40px 20px 30px 20px',
  },
  mainSection: {
    flex: 1, 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { 
    textAlign: 'center', 
    marginBottom: '60px' 
  },
  title: {
    fontFamily: "'Cinzel', serif",
    fontSize: '44px',
    letterSpacing: '3px',
    margin: 0,
    // Added a gradient using the game accent colors (League Gold -> Dota Cyan -> HoK Gold)
    background: 'linear-gradient(90deg, #e6b44c 0%, #66fcf1 50%, #d4af37 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent',
    // Swapped textShadow for drop-shadow so the transparent text renders correctly
    filter: 'drop-shadow(0 4px 15px rgba(0,0,0,0.8))',
  },
  subtitle: { 
    fontSize: '16px', 
    color: '#d5d8e0', 
    marginTop: '14px', 
    textShadow: '0 2px 6px rgba(0,0,0,0.8)' 
  },
  badgeRow: {
    display: 'flex',
    gap: '40px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badge: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    border: '3px solid',
    backgroundColor: 'rgba(10, 12, 20, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    overflow: 'hidden',
  },
  badgeImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  badgeFallback: {
    fontFamily: "'Cinzel', serif",
    fontSize: '48px',
    fontWeight: 900,
  },
  bottomSection: {
    marginTop: 'auto', 
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    paddingTop: '60px',
  },
  bottomTopText: {
    color: '#00d4ff', 
    fontFamily: "monospace",
    fontSize: '13px',
    margin: '0 0 12px 0',
    letterSpacing: '0.5px',
  },
  bottomMainText: {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: '400',
    margin: '0 0 35px 0',
    letterSpacing: '0.5px',
  },
  socialRow: {
    display: 'flex',
    gap: '24px',
    marginBottom: '40px',
  },
  socialIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    border: '1px solid',
    textDecoration: 'none',
    fontSize: '18px',
  },
  copyrightText: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontFamily: "monospace",
    fontSize: '12px',
    margin: 0,
    letterSpacing: '0.5px',
  }
}

export default LandingPage