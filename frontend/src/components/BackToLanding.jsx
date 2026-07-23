import { Link } from 'react-router-dom'

function BackToLanding() {
  return (
    <Link to="/" style={styles.backLink}>
      &larr; Back to Games
    </Link>
  )
}

const styles = {
  backLink: {
    position: 'fixed',
    top: '20px',
    left: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '20px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 600,
    zIndex: 1000,
    backdropFilter: 'blur(6px)',
  },
}

export default BackToLanding