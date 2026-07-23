import { useState, useEffect } from 'react'
import BackToLanding from '../components/BackToLanding.jsx'
import { API_BASE_URL } from '../config.js'

const TEAM_SIZE = 5
const ROLES = ['All', 'Tank', 'Warrior', 'Assassin', 'Mage', 'Farm Lane', 'Support']
const HERO_ROLES = ROLES.filter((r) => r !== 'All')

function HokPredictor() {
  const [heroes, setHeroes] = useState([])
  const [loading, setLoading] = useState(true)
  const [blueTeam, setBlueTeam] = useState([])
  const [redTeam, setRedTeam] = useState([])
  const [pickingFor, setPickingFor] = useState('blue')
  const [hoveredHero, setHoveredHero] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [prediction, setPrediction] = useState(null)
  const [predicting, setPredicting] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('All')

  // Toast Notification State
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'warning') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3500)
  }

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/hok/heroes`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch heroes')
        return res.json()
      })
      .then((data) => {
        setHeroes(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching heroes:', err)
        setLoading(false)
        showToast('Failed to load heroes. Check backend connection.', 'error')
      })
  }, [])

  const isPicked = (hero) => blueTeam.some((h) => h.id === hero.id) || redTeam.some((h) => h.id === hero.id)

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX + 16, y: e.clientY + 16 })
  }

  const handlePick = (hero) => {
    if (isPicked(hero)) {
      showToast(`${hero.name} has already been drafted!`, 'error')
      return
    }

    if (pickingFor === 'blue') {
      if (blueTeam.length >= TEAM_SIZE) {
        showToast('Blue Team is already full (5/5).', 'warning')
        return
      }
      const newBlue = [...blueTeam, hero]
      setBlueTeam(newBlue)

      // Auto-switch side logic
      if (newBlue.length === TEAM_SIZE && redTeam.length < TEAM_SIZE) {
        setPickingFor('red')
        showToast('Blue Team full! Auto-switched to Red Team drafting.', 'info')
      } else if (newBlue.length === TEAM_SIZE && redTeam.length === TEAM_SIZE) {
        showToast('Draft Complete! Click "Analyze Draft & Predict".', 'success')
      }
    } else {
      if (redTeam.length >= TEAM_SIZE) {
        showToast('Red Team is already full (5/5).', 'warning')
        return
      }
      const newRed = [...redTeam, hero]
      setRedTeam(newRed)

      // Auto-switch side logic
      if (newRed.length === TEAM_SIZE && blueTeam.length < TEAM_SIZE) {
        setPickingFor('blue')
        showToast('Red Team full! Auto-switched to Blue Team drafting.', 'info')
      } else if (newRed.length === TEAM_SIZE && blueTeam.length === TEAM_SIZE) {
        showToast('Draft Complete! Click "Analyze Draft & Predict".', 'success')
      }
    }
    setHoveredHero(null)
    setPrediction(null) 
  }

  const handleRemove = (hero, team) => {
    if (team === 'blue') setBlueTeam(blueTeam.filter((h) => h.id !== hero.id))
    else setRedTeam(redTeam.filter((h) => h.id !== hero.id))
    setPrediction(null)
  }

  const missingRoles = (team) => {
    const filled = new Set()
    team.forEach((h) => HERO_ROLES.forEach((r) => { if (h.role.includes(r)) filled.add(r) }))
    return HERO_ROLES.filter((r) => !filled.has(r))
  }

  const filteredHeroes = heroes.filter((hero) => {
    const matchesSearch = hero.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          hero.original_name?.includes(searchQuery)
    const matchesRole = selectedRole === 'All' || hero.role.includes(selectedRole)
    return matchesSearch && matchesRole
  })

  const handlePredict = async () => {
    const blueMissing = TEAM_SIZE - blueTeam.length
    const redMissing = TEAM_SIZE - redTeam.length

    if (blueMissing > 0 || redMissing > 0) {
      if (blueMissing > 0 && redMissing > 0) {
        showToast(`Draft incomplete! Blue needs ${blueMissing} pick(s), Red needs ${redMissing} pick(s).`, 'warning')
      } else if (blueMissing > 0) {
        showToast(`Draft incomplete! Blue Team needs ${blueMissing} more pick(s).`, 'warning')
      } else {
        showToast(`Draft incomplete! Red Team needs ${redMissing} more pick(s).`, 'warning')
      }
      return
    }

    setPredicting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/hok/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blue_team_ids: blueTeam.map((h) => h.id),
          red_team_ids: redTeam.map((h) => h.id),
        }),
      })

      if (!response.ok) throw new Error('Backend server returned an error')

      const data = await response.json()
      const analytics = calculateDraftAnalytics(blueTeam, redTeam, data)
      setPrediction(analytics)
      showToast('Match analytics calculated successfully!', 'success')
    } catch (err) {
      console.error('Prediction failed:', err)
      showToast('Failed to connect to ML prediction backend.', 'error')
    } finally {
      setPredicting(false)
    }
  }

  const calculateDraftAnalytics = (blue, red, backendData) => {
    const getTeamStats = (team) => {
      let phys = 10, mag = 10, cc = 10, dur = 10
      team.forEach((h) => {
        if (h.role.includes('Tank')) { dur += 35; cc += 20; }
        if (h.role.includes('Warrior')) { dur += 20; phys += 25; cc += 10; }
        if (h.role.includes('Assassin')) { phys += 35; }
        if (h.role.includes('Mage')) { mag += 40; cc += 15; }
        if (h.role.includes('Farm Lane')) { phys += 40; }
        if (h.role.includes('Support')) { cc += 30; dur += 15; mag += 10; }
      })
      const normalize = (val) => Math.min(Math.round((val / 160) * 100), 100)
      return { physical: normalize(phys), magical: normalize(mag), cc: normalize(cc), durability: normalize(dur) }
    }

    const getPhaseAdvantage = (team) => {
      let early = 20, mid = 20, late = 20
      team.forEach((h) => {
        if (h.role.includes('Assassin')) { early += 25; mid += 10; }
        if (h.role.includes('Farm Lane')) { late += 30; mid += 10; }
        if (h.role.includes('Tank')) { mid += 20; late += 15; }
        if (h.role.includes('Mage')) { early += 10; mid += 25; }
      })
      const normalize = (val) => Math.min(Math.round((val / 120) * 100), 100)
      return { early: normalize(early), mid: normalize(mid), late: normalize(late) }
    }

    const getSynergyScore = (team) => {
      const rolesPicked = new Set(team.map(h => h.role))
      let score = rolesPicked.size * 15
      if (team.some(h => h.role.includes('Tank')) && team.some(h => h.role.includes('Farm Lane'))) score += 15
      if (team.some(h => h.role.includes('Support')) && team.some(h => h.role.includes('Mage'))) score += 10
      return Math.min(score, 99)
    }

    return {
      blueWin: backendData.blue_win_probability, 
      redWin: backendData.red_win_probability,
      blueStats: getTeamStats(blue), 
      redStats: getTeamStats(red),
      bluePhase: getPhaseAdvantage(blue), 
      redPhase: getPhaseAdvantage(red),
      blueSynergy: getSynergyScore(blue), 
      redSynergy: getSynergyScore(red),
    }
  }

  return (
    <div style={styles.page}>
      {/* Custom Scrollbar + animation styles */}
      <style>{`
        .fancy-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .fancy-scrollbar::-webkit-scrollbar-track {
          background: rgba(12, 17, 26, 0.8);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .fancy-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #0369a1 0%, #0c4a6e 100%);
          border-radius: 10px;
          border: 1px solid #38bdf8;
          box-shadow: inset 0 0 6px rgba(56, 189, 248, 0.5);
        }
        .fancy-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #0284c7 0%, #075985 100%);
          border: 1px solid #7dd3fc;
        }

        @keyframes hokSpin { to { transform: rotate(360deg); } }
        @keyframes hokFadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hokPulseGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(103, 232, 249, 0.2); }
          50% { box-shadow: 0 0 28px rgba(103, 232, 249, 0.55); }
        }
        .hok-hero-card {
          transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .hok-hero-card:hover:not(:disabled) {
          transform: translateY(-4px) scale(1.03);
          border-color: #67e8f9 !important;
          box-shadow: 0 8px 20px rgba(103, 232, 249, 0.25);
        }
        .hok-predict-btn:hover:not(:disabled) {
          background-color: rgba(103, 232, 249, 0.1) !important;
          animation: hokPulseGlow 1.6s ease-in-out infinite;
        }
        .hok-role-tab:hover {
          color: #fff !important;
          border-color: rgba(255,255,255,0.2) !important;
        }
        .hok-dashboard-enter {
          animation: hokFadeInUp 0.4s ease-out;
        }
      `}</style>

      <BackToLanding />

      {/* FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div
          style={{
            ...styles.toastBanner,
            borderColor:
              toast.type === 'error'
                ? '#f43f5e'
                : toast.type === 'success'
                ? '#10b981'
                : toast.type === 'info'
                ? '#38bdf8'
                : '#f59e0b',
            color:
              toast.type === 'error'
                ? '#fca5a5'
                : toast.type === 'success'
                ? '#6ee7b7'
                : toast.type === 'info'
                ? '#bae6fd'
                : '#fde047',
          }}
        >
          <span>{toast.type === 'error' ? '🚫' : toast.type === 'success' ? '⚡' : toast.type === 'info' ? 'ℹ️' : '⚠️'}</span>
          <span>{toast.message}</span>
        </div>
      )}
      
      <div style={styles.mainWrapper}>
        <header style={styles.header}>
          <h1 style={styles.title}>HONOR OF KINGS</h1>
          <p style={styles.subtitle}>Select your heroes and match settings to analyze win probabilities.</p>
        </header>

        {/* FANCY ANALYTICS DASHBOARD */}
        <div style={styles.topBox}>
          <div style={styles.topBoxHeader}>MATCH ANALYTICS & PREDICTION</div>
          
          {prediction ? (
            <div style={styles.dashboard} className="hok-dashboard-enter" key={prediction.blueWin}>
              
              {/* Grand Win Probability Bar */}
              <div style={styles.grandPredictionArea}>
                <div style={styles.winRateLabels}>
                  <span style={{ ...styles.neonTextBlue, fontSize: '18px' }}>BLUE WIN: {prediction.blueWin}%</span>
                  <span style={styles.vsBadge}>VS</span>
                  <span style={{ ...styles.neonTextRed, fontSize: '18px' }}>RED WIN: {prediction.redWin}%</span>
                </div>
                <div style={styles.tugOfWarContainer}>
                  <div style={{ ...styles.tugBlue, width: `${prediction.blueWin}%` }}></div>
                  <div style={styles.tugDivider}></div>
                  <div style={{ ...styles.tugRed, width: `${prediction.redWin}%` }}></div>
                </div>
              </div>

              {/* Advanced Stats Grid */}
              <div style={styles.statsGrid}>
                
                {/* BLUE TEAM STATS */}
                <div style={styles.teamStatsColumn}>
                  <h4 style={styles.statsSubtitleBlue}>Blue Composition</h4>
                  <StatBar label="Physical Dmg" value={prediction.blueStats.physical} color="#f59e0b" align="left" />
                  <StatBar label="Magical Dmg" value={prediction.blueStats.magical} color="#8b5cf6" align="left" />
                  <StatBar label="Crowd Control" value={prediction.blueStats.cc} color="#06b6d4" align="left" />
                  <StatBar label="Durability" value={prediction.blueStats.durability} color="#10b981" align="left" />
                </div>

                {/* CENTER: SYNERGY & POWER SPIKES */}
                <div style={styles.centerStatsColumn}>
                  <h4 style={{ color: '#cbd5e1', fontSize: '12px', margin: '0 0 12px 0', letterSpacing: '1px' }}>DRAFT SYNERGY</h4>
                  <div style={styles.synergyRow}>
                    <span style={styles.neonTextBlue}>{prediction.blueSynergy}</span>
                    <span style={{ color: '#475569', fontSize: '20px' }}>|</span>
                    <span style={styles.neonTextRed}>{prediction.redSynergy}</span>
                  </div>
                  
                  <h4 style={{ color: '#cbd5e1', fontSize: '12px', margin: '20px 0 12px 0', letterSpacing: '1px' }}>POWER CURVE</h4>
                  <PhaseAdvantageRow label="EARLY GAME" blueVal={prediction.bluePhase.early} redVal={prediction.redPhase.early} />
                  <PhaseAdvantageRow label="MID GAME" blueVal={prediction.bluePhase.mid} redVal={prediction.redPhase.mid} />
                  <PhaseAdvantageRow label="LATE GAME" blueVal={prediction.bluePhase.late} redVal={prediction.redPhase.late} />
                </div>

                {/* RED TEAM STATS */}
                <div style={styles.teamStatsColumn}>
                  <h4 style={styles.statsSubtitleRed}>Red Composition</h4>
                  <StatBar label="Physical Dmg" value={prediction.redStats.physical} color="#f59e0b" align="right" />
                  <StatBar label="Magical Dmg" value={prediction.redStats.magical} color="#8b5cf6" align="right" />
                  <StatBar label="Crowd Control" value={prediction.redStats.cc} color="#06b6d4" align="right" />
                  <StatBar label="Durability" value={prediction.redStats.durability} color="#10b981" align="right" />
                </div>

              </div>
            </div>
          ) : (
            <div style={styles.actionArea}>
              <button
                onClick={handlePredict}
                disabled={predicting}
                className="hok-predict-btn"
                style={{
                  ...styles.predictButton,
                  cursor: blueTeam.length === 5 && redTeam.length === 5 ? 'pointer' : 'not-allowed',
                  opacity: blueTeam.length === 5 && redTeam.length === 5 ? 1 : 0.4,
                }}
              >
                {predicting ? <><Spinner /> RUNNING ALGORITHMS...</> : 'PREDICT MATCH OUTCOME'}
              </button>
            </div>
          )}
        </div>

        {/* The Draft Board */}
        <div style={styles.draftBoard}>
          <TeamColumn label="THE BLUE TEAM" color="#38bdf8" team={blueTeam} onRemove={(h) => handleRemove(h, 'blue')} align="left" missing={missingRoles(blueTeam)} />
          <div style={styles.vsContainer}><span style={styles.vsText}>VS</span></div>
          <TeamColumn label="THE RED TEAM" color="#f43f5e" team={redTeam} onRemove={(h) => handleRemove(h, 'red')} align="right" missing={missingRoles(redTeam)} />
        </div>

        {/* Controls */}
        <div style={styles.controlsSection}>
          <div style={styles.toggleRow}>
            <button
              onClick={() => setPickingFor('blue')}
              style={{ ...styles.toggleBtn, ...(pickingFor === 'blue' ? styles.toggleActiveBlue : {}) }}
            >
              DRAFTING BLUE
            </button>
            <button
              onClick={() => setPickingFor('red')}
              style={{ ...styles.toggleBtn, ...(pickingFor === 'red' ? styles.toggleActiveRed : {}) }}
            >
              DRAFTING RED
            </button>
          </div>

          <div style={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search for a hero..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.roleTabs}>
            {ROLES.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className="hok-role-tab"
                style={{ ...styles.roleTab, ...(selectedRole === role ? styles.roleTabActive : {}) }}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Pool */}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#93a4bf' }}><Spinner /> Loading heroes...</p>
        ) : (
          <div className="fancy-scrollbar" style={styles.pool}>
            {filteredHeroes.map((hero) => {
              const picked = isPicked(hero)
              return (
                <button
                  key={hero.id}
                  onClick={() => handlePick(hero)}
                  onMouseEnter={(e) => { setHoveredHero(hero); handleMouseMove(e) }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setHoveredHero(null)}
                  disabled={picked}
                  className="hok-hero-card"
                  style={{ ...styles.heroCard, opacity: picked ? 0.2 : 1, filter: picked ? 'grayscale(100%)' : 'none' }}
                >
                  <div style={styles.cardImageWrapper}>
                    <img src={hero.image} alt={hero.name} style={styles.heroImg} />
                    <span style={styles.cardWinRate}>{hero.win_rate}</span>
                  </div>
                  <div style={styles.heroName}>{hero.name}</div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Tooltip */}
      {hoveredHero && (
        <div style={{ ...styles.tooltip, left: mousePos.x, top: mousePos.y }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={styles.tooltipTitle}>{hoveredHero.name}</h4>
            <span style={styles.winRateBadge}>{hoveredHero.win_rate} WR</span>
          </div>
          <p style={styles.tooltipMeta}>{hoveredHero.role}</p>
          <div style={styles.tooltipSection}>
            <div style={styles.tooltipLabel}>Current Meta Build</div>
            <div style={styles.buildList}>
              {hoveredHero.build.map((item, index) => (
                <span key={index} style={styles.buildTag}>
                  <span style={{ color: '#f5b942', marginRight: '4px' }}>{index + 1}.</span> {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '14px',
        height: '14px',
        border: '2px solid rgba(103, 232, 249, 0.25)',
        borderTopColor: '#67e8f9',
        borderRadius: '50%',
        animation: 'hokSpin 0.7s linear infinite',
        marginRight: '8px',
        verticalAlign: 'middle',
      }}
    />
  )
}

function StatBar({ label, value, color, align }) {
  const isLeft = align === 'left'
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px', flexDirection: isLeft ? 'row' : 'row-reverse' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 'bold', color }}>{value}</span>
      </div>
      <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', display: 'flex', justifyContent: isLeft ? 'flex-start' : 'flex-end' }}>
        <div style={{ width: `${value}%`, backgroundColor: color, height: '100%', borderRadius: '3px', boxShadow: `0 0 8px ${color}` }}></div>
      </div>
    </div>
  )
}

function PhaseAdvantageRow({ label, blueVal, redVal }) {
  const blueLead = blueVal > redVal
  const redLead = redVal > blueVal
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', fontSize: '11px' }}>
      <span style={{ color: blueLead ? '#38bdf8' : '#475569', fontWeight: blueLead ? 'bold' : 'normal', width: '30px', textAlign: 'right' }}>{blueVal}</span>
      <span style={{ color: '#94a3b8', width: '80px', textAlign: 'center', letterSpacing: '1px' }}>{label}</span>
      <span style={{ color: redLead ? '#f43f5e' : '#475569', fontWeight: redLead ? 'bold' : 'normal', width: '30px', textAlign: 'left' }}>{redVal}</span>
    </div>
  )
}

function TeamColumn({ label, color, team, onRemove, align, missing }) {
  return (
    <div style={{ width: '40%' }}>
      <h2 style={{ ...styles.teamTitle, color, textAlign: align, borderBottom: `2px solid ${color}` }}>{label}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[...Array(TEAM_SIZE)].map((_, i) => {
          const hero = team[i]
          return (
            <div key={i} style={styles.slot}>
              {hero ? (
                <div style={{ ...styles.slotFilledContainer, flexDirection: align === 'right' ? 'row-reverse' : 'row' }}>
                  <img src={hero.image} alt={hero.name} style={styles.slotHeroImg} />
                  <div style={{ flex: 1, textAlign: align }}>
                    <div style={styles.slotHeroName}>{hero.name}</div>
                    <div style={styles.slotHeroRole}>{hero.role}</div>
                  </div>
                  <button onClick={() => onRemove(hero)} style={styles.removeBtn}>✕</button>
                </div>
              ) : (
                <span style={styles.slotEmpty}>Empty</span>
              )}
            </div>
          )
        })}
      </div>
      {missing && missing.length > 0 && (
        <p style={{ fontSize: '12px', color, marginTop: '10px', textAlign: align }}>
          Missing: {missing.join(', ')}
        </p>
      )}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.75)), url('/gongsun-li.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed', color: '#f8fafc', fontFamily: "'Roboto Condensed', sans-serif", padding: '20px' },
  mainWrapper: { maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' },
  header: { textAlign: 'center', marginTop: '20px', textShadow: '0 2px 10px rgba(0,0,0,0.8)' },
  title: { fontFamily: "'Cinzel', serif", fontSize: '42px', margin: 0, letterSpacing: '2px', color: '#67e8f9' },
  subtitle: { color: '#e2e8f0', marginTop: '8px', fontSize: '15px' },
  
  toastBanner: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10000,
    backgroundColor: 'rgba(12, 17, 26, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid',
    padding: '12px 24px',
    borderRadius: '6px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    animation: 'hokFadeInUp 0.2s ease-out',
  },

  topBox: { backgroundColor: 'rgba(12, 17, 26, 0.88)', borderRadius: '8px', padding: '24px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 40px rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' },
  topBoxHeader: { color: '#67e8f9', fontSize: '13px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '24px', textAlign: 'center', textShadow: '0 0 10px rgba(103, 232, 249, 0.3)' },
  actionArea: { textAlign: 'center' },
  predictButton: { fontFamily: "'Cinzel', serif", padding: '14px 48px', fontSize: '16px', backgroundColor: 'transparent', color: '#67e8f9', border: '2px solid #67e8f9', borderRadius: '4px', fontWeight: 'bold', letterSpacing: '2px', transition: 'all 0.2s', boxShadow: '0 0 15px rgba(103, 232, 249, 0.2)' },
  
  dashboard: { display: 'flex', flexDirection: 'column', gap: '24px' },
  grandPredictionArea: { padding: '0 10px' },
  winRateLabels: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontWeight: 'bold' },
  neonTextBlue: { color: '#38bdf8', textShadow: '0 0 12px rgba(56, 189, 248, 0.6)' },
  neonTextRed: { color: '#f43f5e', textShadow: '0 0 12px rgba(244, 63, 94, 0.6)' },
  vsBadge: { backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', color: '#cbd5e1', letterSpacing: '2px' },
  tugOfWarContainer: { display: 'flex', height: '18px', borderRadius: '9px', overflow: 'hidden', backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)' },
  tugBlue: { backgroundColor: '#38bdf8', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 0 15px #38bdf8' },
  tugDivider: { width: '4px', backgroundColor: '#fff', zIndex: 2, boxShadow: '0 0 10px #fff' },
  tugRed: { backgroundColor: '#f43f5e', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '0 0 15px #f43f5e' },
  
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '24px', backgroundColor: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' },
  teamStatsColumn: { display: 'flex', flexDirection: 'column' },
  centerStatsColumn: { display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '0 16px' },
  statsSubtitleBlue: { margin: '0 0 16px 0', fontSize: '13px', color: '#38bdf8', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'left' },
  statsSubtitleRed: { margin: '0 0 16px 0', fontSize: '13px', color: '#f43f5e', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'right' },
  synergyRow: { display: 'flex', gap: '16px', fontSize: '28px', fontWeight: 'bold', alignItems: 'center' },

  draftBoard: { display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(12, 17, 26, 0.88)', borderRadius: '12px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 15px 40px rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' },
  teamTitle: { fontFamily: "'Cinzel', serif", fontSize: '18px', paddingBottom: '8px', marginBottom: '16px', letterSpacing: '2px' },
  vsContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '10%' },
  vsText: { fontFamily: "'Cinzel', serif", fontSize: '28px', color: '#67e8f9', textShadow: '0 0 15px rgba(103, 232, 249, 0.5)' },
  
  slot: { backgroundColor: 'rgba(0, 0, 0, 0.5)', height: '48px', display: 'flex', alignItems: 'center', padding: '0 12px', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '4px' },
  slotFilledContainer: { display: 'flex', alignItems: 'center', width: '100%', gap: '12px' },
  slotHeroImg: { width: '36px', height: '36px', objectFit: 'cover', border: '1px solid #334155' },
  slotHeroName: { fontSize: '14px', fontWeight: '700', color: '#fff' },
  slotHeroRole: { fontSize: '11px', color: '#94a3b8' },
  removeBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px', padding: '4px' },
  slotEmpty: { color: '#475569', fontStyle: 'italic', fontSize: '13px', width: '100%', textAlign: 'center' },
  
  controlsSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '10px' },
  toggleRow: { display: 'flex', gap: '12px' },
  toggleBtn: { fontFamily: "'Cinzel', serif", padding: '12px 32px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 30, 0.9)', color: '#94a3b8', cursor: 'pointer', fontWeight: '700', transition: 'all 0.2s', letterSpacing: '1px' },
  toggleActiveBlue: { backgroundColor: '#104d4e', borderColor: '#38bdf8', color: '#fff' },
  toggleActiveRed: { backgroundColor: '#4c1d2e', borderColor: '#f43f5e', color: '#fff' },
  searchWrapper: { width: '400px' },
  searchInput: { width: '100%', padding: '12px 20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 30, 0.9)', color: '#fff', fontSize: '14px', outline: 'none', textAlign: 'center' },
  roleTabs: { display: 'flex', gap: '8px', overflowX: 'auto' },
  roleTab: { padding: '6px 16px', borderRadius: '4px', border: '1px solid transparent', backgroundColor: 'rgba(15, 23, 30, 0.8)', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' },
  roleTabActive: { backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' },
  
  pool: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', 
    gap: '16px', 
    padding: '24px', 
    backgroundColor: 'rgba(12, 17, 26, 0.88)', 
    borderRadius: '12px', 
    border: '1px solid rgba(255,255,255,0.05)', 
    maxHeight: '400px', 
    overflowY: 'auto', 
    backdropFilter: 'blur(8px)' 
  },
  heroCard: { background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '8px', cursor: 'pointer', textAlign: 'center' },
  
  cardImageWrapper: { position: 'relative', display: 'inline-block', width: '100%' },
  cardWinRate: { position: 'absolute', bottom: '4px', right: '4px', backgroundColor: 'rgba(22, 163, 74, 0.95)', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' },
  
  heroImg: { width: '100%', aspectRatio: '1/1', objectFit: 'cover', border: '1px solid #334155', borderRadius: '4px' },
  heroName: { 
    fontSize: '12px', 
    fontWeight: '600', 
    color: '#cbd5e1', 
    marginTop: '8px', 
    whiteSpace: 'nowrap', 
    overflow: 'hidden', 
    textOverflow: 'ellipsis' 
  },
  
  tooltip: { position: 'fixed', width: '280px', background: 'rgba(12, 17, 26, 0.98)', border: '1px solid #334155', padding: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)', pointerEvents: 'none', zIndex: 1000 },
  tooltipTitle: { margin: '0', fontSize: '16px', color: '#fff' },
  winRateBadge: { backgroundColor: '#16a34a', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' },
  tooltipMeta: { margin: '4px 0 10px', color: '#94a3b8', fontSize: '12px' },
  tooltipSection: { marginTop: '10px' },
  tooltipLabel: { color: '#67e8f9', fontSize: '11px', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase' },
  buildList: { display: 'flex', flexDirection: 'column', gap: '4px' },
  buildTag: { backgroundColor: 'rgba(255,255,255,0.05)', color: '#cbd5e1', padding: '4px 8px', fontSize: '11px', borderLeft: '2px solid #f5b942' },
}

export default HokPredictor