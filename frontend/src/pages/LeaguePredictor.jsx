import { useState, useEffect } from 'react'
import BackToLanding from '../components/BackToLanding.jsx'
import { API_BASE_URL } from '../config.js'

const TEAM_SIZE = 5
const ROLES = ['All', 'Top', 'Jungle', 'Mid', 'ADC', 'Support']

function LeaguePredictor() {
  const [heroes, setHeroes] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [blueTeam, setBlueTeam] = useState([])
  const [redTeam, setRedTeam] = useState([])
  const [pickingFor, setPickingFor] = useState('blue')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('All')
  const [prediction, setPrediction] = useState(null)
  const [predicting, setPredicting] = useState(false)
  const [hoveredHero, setHoveredHero] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  
  // Toast Notification State
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'warning') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 3500)
  }

  const fetchInitialData = () => {
    setLoading(true)
    setFetchError(false)

    // Fetch Champions
    fetch(`${API_BASE_URL}/api/lol/heroes`)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok')
        return res.json()
      })
      .then((data) => {
        setHeroes(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching champions:', err)
        setFetchError(true)
        setLoading(false)
        showToast('Failed to load champions. Check backend connection.', 'error')
      })

    // Fetch Leaderboard
    fetch(`${API_BASE_URL}/api/lol/leaderboard`)
      .then((res) => res.json())
      .then((data) => setLeaderboard(data.slice(0, 17)))
      .catch((err) => console.error('Error fetching leaderboard:', err))
  }

  useEffect(() => {
    document.title = 'LoL Draft Predictor'
    fetchInitialData()
  }, [])

  const isPicked = (hero) => blueTeam.some((h) => h.id === hero.id) || redTeam.some((h) => h.id === hero.id)
  const isReady = blueTeam.length === TEAM_SIZE && redTeam.length === TEAM_SIZE

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
        showToast('Blue Side is already full (5/5).', 'warning')
        return
      }
      const newBlue = [...blueTeam, hero]
      setBlueTeam(newBlue)

      if (newBlue.length === TEAM_SIZE && redTeam.length < TEAM_SIZE) {
        setPickingFor('red')
        showToast('Blue Side full! Auto-switched to Red Side drafting.', 'info')
      } else if (newBlue.length === TEAM_SIZE && redTeam.length === TEAM_SIZE) {
        showToast('Draft Complete! Click "Predict Match Outcome".', 'success')
      }
    } else {
      if (redTeam.length >= TEAM_SIZE) {
        showToast('Red Side is already full (5/5).', 'warning')
        return
      }
      const newRed = [...redTeam, hero]
      setRedTeam(newRed)

      if (newRed.length === TEAM_SIZE && blueTeam.length < TEAM_SIZE) {
        setPickingFor('blue')
        showToast('Red Side full! Auto-switched to Blue Side drafting.', 'info')
      } else if (newRed.length === TEAM_SIZE && blueTeam.length === TEAM_SIZE) {
        showToast('Draft Complete! Click "Predict Match Outcome".', 'success')
      }
    }
    setPrediction(null)
  }

  const handleRemove = (hero, team) => {
    if (team === 'blue') setBlueTeam(blueTeam.filter((h) => h.id !== hero.id))
    else setRedTeam(redTeam.filter((h) => h.id !== hero.id))
    setPrediction(null)
  }

  const handleResetDraft = () => {
    if (blueTeam.length === 0 && redTeam.length === 0) return
    setBlueTeam([])
    setRedTeam([])
    setPrediction(null)
    setPickingFor('blue')
    showToast('Draft reset successfully.', 'info')
  }

  const filteredHeroes = heroes.filter((hero) => {
    const matchesSearch = hero.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === 'All' || hero.role.includes(selectedRole)
    return matchesSearch && matchesRole
  })

  // Advanced Analytics Calculation Engine
  const calculateDraftAnalytics = (blue, red, backendData) => {
    const getTeamStats = (team) => {
      let phys = 10, mag = 10, cc = 10, dur = 10
      team.forEach((h) => {
        if (h.role.includes('Top')) { dur += 35; phys += 20; cc += 15; }
        if (h.role.includes('Jungle')) { dur += 20; phys += 25; cc += 20; }
        if (h.role.includes('Mid')) { mag += 45; cc += 15; }
        if (h.role.includes('ADC')) { phys += 45; }
        if (h.role.includes('Support')) { cc += 35; dur += 15; mag += 15; }
      })
      const normalize = (val) => Math.min(Math.round((val / 160) * 100), 100)
      return { physical: normalize(phys), magical: normalize(mag), cc: normalize(cc), durability: normalize(dur) }
    }

    const getPowerCurve = (team) => {
      let early = 20, mid = 20, late = 20
      team.forEach((h) => {
        if (h.role.includes('Jungle') || h.role.includes('Mid')) { early += 25; mid += 20; }
        if (h.role.includes('ADC')) { late += 40; mid += 15; }
        if (h.role.includes('Top')) { mid += 25; late += 20; }
        if (h.role.includes('Support')) { early += 20; mid += 15; }
      })
      const normalize = (val) => Math.min(Math.round((val / 130) * 100), 100)
      return { early: normalize(early), mid: normalize(mid), late: normalize(late) }
    }

    const getInsights = (team, name) => {
      const stats = getTeamStats(team)
      const insights = []
      if (stats.magical < 20) insights.push({ type: 'danger', text: `${name}: Full AD Comp (Armor Stacking Risk)` })
      if (stats.durability < 25) insights.push({ type: 'warning', text: `${name}: Lack of Frontline/Tanks` })
      if (stats.cc > 50) insights.push({ type: 'success', text: `${name}: Excellent CC & Teamfight Engine` })
      if (stats.magical >= 30 && stats.physical >= 30) insights.push({ type: 'success', text: `${name}: Balanced Hybrid Damage` })
      return insights
    }

    return {
      blueWin: backendData.blue_win_probability,
      redWin: backendData.red_win_probability,
      blueStats: getTeamStats(blue),
      redStats: getTeamStats(red),
      blueCurve: getPowerCurve(blue),
      redCurve: getPowerCurve(red),
      insights: [...getInsights(blue, 'Blue Side'), ...getInsights(red, 'Red Side')],
    }
  }

  const handlePredict = async () => {
    const blueMissing = TEAM_SIZE - blueTeam.length
    const redMissing = TEAM_SIZE - redTeam.length

    if (blueMissing > 0 || redMissing > 0) {
      if (blueMissing > 0 && redMissing > 0) {
        showToast(`Draft incomplete! Blue needs ${blueMissing} pick(s), Red needs ${redMissing} pick(s).`, 'warning')
      } else if (blueMissing > 0) {
        showToast(`Draft incomplete! Blue Side needs ${blueMissing} more pick(s).`, 'warning')
      } else {
        showToast(`Draft incomplete! Red Side needs ${redMissing} more pick(s).`, 'warning')
      }
      return
    }

    setPredicting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/lol/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blue_team_ids: blueTeam.map((h) => h.id),
          red_team_ids: redTeam.map((h) => h.id),
        }),
      })

      if (!response.ok) throw new Error('Backend server returned an error.')

      const data = await response.json()
      const analytics = calculateDraftAnalytics(blueTeam, redTeam, data)
      setPrediction(analytics)
      showToast('Match analytics calculated successfully!', 'success')
    } catch (err) {
      console.error('Prediction failed:', err)
      showToast('Failed to connect to ML backend. Ensure FastAPI server is running.', 'error')
    } finally {
      setPredicting(false)
    }
  }

  return (
    <div style={styles.page}>
      <style>{`
        .hex-scroll::-webkit-scrollbar { width: 5px; }
        .hex-scroll::-webkit-scrollbar-track { background: rgba(1, 10, 19, 0.8); border-left: 1px solid #1e282d; }
        .hex-scroll::-webkit-scrollbar-thumb { background: #c8aa6e; border-radius: 4px; }
      `}</style>

      <BackToLanding />

      {/* FLOATING HEXTECH TOAST NOTIFICATION */}
      {toast && (
        <div
          style={{
            ...styles.toastBanner,
            borderColor:
              toast.type === 'error'
                ? '#ef4444'
                : toast.type === 'success'
                ? '#10b981'
                : toast.type === 'info'
                ? '#06b6d4'
                : '#f59e0b',
            color:
              toast.type === 'error'
                ? '#fca5a5'
                : toast.type === 'success'
                ? '#6ee7b7'
                : toast.type === 'info'
                ? '#a5f3fc'
                : '#fde047',
          }}
        >
          <span>{toast.type === 'error' ? '🚫' : toast.type === 'success' ? '⚡' : toast.type === 'info' ? 'ℹ️' : '⚠️'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <header style={styles.header}>
        <h1 style={styles.title}>LEAGUE OF LEGENDS DRAFT</h1>
        <p style={styles.subtitle}>Construct team compositions and run ML match prediction algorithms</p>
      </header>

      <div style={styles.mainContainer}>
        
        {/* ROW 1: TOP SECTION (DRAFT BOARD LEFT | MATCH ANALYTICS RIGHT) */}
        <div style={styles.topRow}>
          
          {/* Draft Board Structure Update */}
          <div style={styles.draftBoard}>
            
            {/* Thematic Header */}
            <div style={styles.boardHeader}>
              <div style={styles.boardTitle}>SUMMONER'S RIFT</div>
              <div style={styles.boardSub}>5V5 TOURNAMENT DRAFT</div>
            </div>

            {/* Main Draft Columns */}
            <div style={styles.draftMain}>
              <TeamColumn label="BLUE SIDE" color="#0ea5e9" team={blueTeam} onRemove={(h) => handleRemove(h, 'blue')} align="left" />
              <div style={styles.vsBadge}>VS</div>
              <TeamColumn label="RED SIDE" color="#ef4444" team={redTeam} onRemove={(h) => handleRemove(h, 'red')} align="right" />
            </div>

            {/* Thematic Footer Status */}
            <div style={styles.boardFooter}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: isReady ? '#10b981' : '#f59e0b',
                boxShadow: isReady ? '0 0 8px #10b981' : '0 0 8px #f59e0b'
              }}></div>
              <span>{isReady ? 'TEAMS LOCKED - READY FOR ANALYSIS' : 'WAITING FOR TEAMS TO LOCK IN...'}</span>
            </div>
            
          </div>

          {/* Match Analytics Panel */}
          <div style={styles.analyticsPanel}>
            <h3 style={styles.panelTitle}>MATCH ANALYTICS</h3>

            <button
              onClick={handlePredict}
              disabled={predicting}
              style={{
                ...styles.predictBtn,
                opacity: isReady ? 1 : 0.5,
              }}
            >
              {predicting ? 'RUNNING ALGORITHMS...' : 'PREDICT MATCH OUTCOME'}
            </button>

            {prediction ? (
              <div style={styles.resultsArea}>
                {/* Win Probability Bar */}
                <div style={styles.winLabels}>
                  <span style={{ color: '#0ea5e9', fontWeight: 'bold', fontSize: '14px' }}>BLUE WIN: {prediction.blueWin}%</span>
                  <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '14px' }}>RED WIN: {prediction.redWin}%</span>
                </div>
                <div style={styles.barContainer}>
                  <div style={{ width: `${prediction.blueWin}%`, backgroundColor: '#0ea5e9', height: '100%', transition: 'width 0.8s ease' }}></div>
                  <div style={{ width: `${prediction.redWin}%`, backgroundColor: '#ef4444', height: '100%', transition: 'width 0.8s ease' }}></div>
                </div>

                {/* Stat Breakdown Grid */}
                <div style={styles.statsSection}>
                  <h4 style={styles.sectionHeader}>COMPOSITION PROFILE</h4>
                  <div style={styles.statsGrid}>
                    <div style={{ flex: 1 }}>
                      <StatBar label="Physical Dmg" value={prediction.blueStats.physical} color="#f59e0b" align="left" />
                      <StatBar label="Magical Dmg" value={prediction.blueStats.magical} color="#a855f7" align="left" />
                      <StatBar label="Crowd Control" value={prediction.blueStats.cc} color="#06b6d4" align="left" />
                      <StatBar label="Durability" value={prediction.blueStats.durability} color="#10b981" align="left" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <StatBar label="Physical Dmg" value={prediction.redStats.physical} color="#f59e0b" align="right" />
                      <StatBar label="Magical Dmg" value={prediction.redStats.magical} color="#a855f7" align="right" />
                      <StatBar label="Crowd Control" value={prediction.redStats.cc} color="#06b6d4" align="right" />
                      <StatBar label="Durability" value={prediction.redStats.durability} color="#10b981" align="right" />
                    </div>
                  </div>
                </div>

                {/* Power Curve */}
                <div style={styles.statsSection}>
                  <h4 style={styles.sectionHeader}>POWER SCALING CURVE</h4>
                  <PhaseRow label="EARLY GAME" blue={prediction.blueCurve.early} red={prediction.redCurve.early} />
                  <PhaseRow label="MID GAME" blue={prediction.blueCurve.mid} red={prediction.redCurve.mid} />
                  <PhaseRow label="LATE GAME" blue={prediction.blueCurve.late} red={prediction.redCurve.late} />
                </div>

                {/* Strategic Warnings */}
                {prediction.insights.length > 0 && (
                  <div style={styles.insightsArea}>
                    <h4 style={styles.sectionHeader}>STRATEGIC DRAFT WARNINGS</h4>
                    {prediction.insights.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          ...styles.insightTag,
                          borderColor: item.type === 'danger' ? '#ef4444' : item.type === 'warning' ? '#f59e0b' : '#10b981',
                          color: item.type === 'danger' ? '#fca5a5' : item.type === 'warning' ? '#fde047' : '#6ee7b7',
                        }}
                      >
                        ⚠️ {item.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={styles.emptyAnalyticsContainer}>
                <div style={styles.placeholderIcon}>🛡️</div>
                <h4 style={styles.placeholderTitle}>AWAITING FULL DRAFT</h4>
                <p style={styles.placeholderDesc}>
                  Select 5 champions for Blue Side and 5 for Red Side to execute ML match analytics.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ROW 2: CONTROLS BAR (ROLE TABS MOVED TO LEFT NEXT TO RESET) */}
        <div style={styles.controlsBar}>
          <div style={styles.toggleGroup}>
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
            <button
              onClick={handleResetDraft}
              style={styles.resetBtn}
              title="Reset Draft"
            >
              RESET
            </button>

            {/* MOVED ROLE TABS HERE */}
            <div style={styles.roleTabs}>
              {ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  style={{ ...styles.roleTab, ...(selectedRole === role ? styles.roleTabActive : {}) }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.filterGroup}>
            <input
              type="text"
              placeholder="Search champion..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* ROW 3: BOTTOM SECTION (CHAMPION POOL LEFT | STANDINGS CARD RIGHT) */}
        <div style={styles.bottomRow}>
          {/* Champion Pool */}
          <div className="hex-scroll" style={styles.pool}>
            {loading ? (
              <p style={{ color: '#c8aa6e', textAlign: 'center', width: '100%', gridColumn: '1 / -1' }}>Summoning Champions...</p>
            ) : fetchError ? (
              <div style={styles.errorBox}>
                <p style={{ color: '#ef4444', margin: 0, fontWeight: 'bold' }}>Failed to load champions</p>
                <button onClick={fetchInitialData} style={styles.retryBtn}>RETRY CONNECTION</button>
              </div>
            ) : filteredHeroes.length === 0 ? (
              <p style={{ color: '#a09b8c', textAlign: 'center', width: '100%', gridColumn: '1 / -1', fontStyle: 'italic' }}>
                No champions found matching "{searchQuery}"
              </p>
            ) : (
              filteredHeroes.map((hero) => {
                const picked = isPicked(hero)
                return (
                  <button
                    key={hero.id}
                    onClick={() => handlePick(hero)}
                    onMouseEnter={(e) => { setHoveredHero(hero); handleMouseMove(e) }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoveredHero(null)}
                    style={{ ...styles.heroCard, opacity: picked ? 0.3 : 1, filter: picked ? 'grayscale(100%)' : 'none', cursor: picked ? 'not-allowed' : 'pointer' }}
                  >
                    <div style={styles.imgWrapper}>
                      <img src={hero.image} alt={hero.name} style={styles.heroImg} />
                      <span style={styles.winRateOverlay}>{hero.win_rate}</span>
                    </div>
                    <div style={styles.heroName}>{hero.name}</div>
                  </button>
                )
              })
            )}
          </div>

          {/* Standings Card */}
          <div style={styles.leaderboardCard}>
            <h4 style={styles.lbTitle}>GLOBAL CHALLENGER STANDINGS (TOP 17)</h4>
            <div style={styles.lbHeader}>
              <span style={styles.lbRank}>RANK</span>
              <span style={styles.lbName}>SUMMONER</span>
              <span style={styles.lbLP}>LP</span>
              <span style={styles.lbWR}>WINRATE</span>
            </div>

            <div className="hex-scroll" style={styles.lbScrollArea}>
              {leaderboard.map((player) => {
                const wr = Math.round((player.wins / (player.wins + player.losses)) * 100)
                return (
                  <div key={player.rank} style={styles.lbRow}>
                    <span style={styles.lbRank}>{player.rank}</span>
                    <span style={styles.lbName}>{player.summonerName}</span>
                    <span style={styles.lbLP}>{player.leaguePoints}</span>
                    <span style={{ ...styles.lbWR, color: wr >= 60 ? '#4ade80' : '#a09b8c' }}>{wr}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Hover Tooltip */}
      {hoveredHero && (
        <div style={{ ...styles.tooltip, left: mousePos.x, top: mousePos.y }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h4 style={styles.ttTitle}>{hoveredHero.name}</h4>
            <span style={styles.ttWinRate}>{hoveredHero.win_rate} WR</span>
          </div>
          <p style={styles.ttRole}>{hoveredHero.role}</p>

          <div style={styles.ttBuildSection}>
            <div style={styles.ttLabel}>Recommended Final Build</div>
            <div style={styles.itemGrid}>
              {hoveredHero.build.map((item, idx) => (
                <img key={idx} src={item.image} alt="item" style={styles.itemIcon} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper Components for Analytics
function StatBar({ label, value, color, align }) {
  const isLeft = align === 'left'
  return (
    <div style={{ marginBottom: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#a09b8c', marginBottom: '2px', flexDirection: isLeft ? 'row' : 'row-reverse' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 'bold', color }}>{value}%</span>
      </div>
      <div style={{ height: '4px', backgroundColor: '#010a13', borderRadius: '2px', overflow: 'hidden', display: 'flex', justifyContent: isLeft ? 'flex-start' : 'flex-end' }}>
        <div style={{ width: `${value}%`, backgroundColor: color, height: '100%' }}></div>
      </div>
    </div>
  )
}

function PhaseRow({ label, blue, red }) {
  const blueLead = blue > red
  const redLead = red > blue
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px' }}>
      <span style={{ color: blueLead ? '#0ea5e9' : '#a09b8c', fontWeight: blueLead ? 'bold' : 'normal', width: '30px', textAlign: 'right' }}>{blue}%</span>
      <span style={{ color: '#c8aa6e', width: '90px', textAlign: 'center', fontSize: '10px', letterSpacing: '1px' }}>{label}</span>
      <span style={{ color: redLead ? '#ef4444' : '#a09b8c', fontWeight: redLead ? 'bold' : 'normal', width: '30px', textAlign: 'left' }}>{red}%</span>
    </div>
  )
}

function TeamColumn({ label, color, team, onRemove, align }) {
  const isRight = align === 'right'
  return (
    <div style={{ width: '42%' }}>
      <h3 style={{ color, borderBottom: `2px solid ${color}`, paddingBottom: '6px', textAlign: align, margin: '0 0 16px 0', fontSize: '15px', letterSpacing: '2px' }}>{label}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[...Array(TEAM_SIZE)].map((_, i) => {
          const hero = team[i]
          return (
            <div key={i} style={{ ...styles.slot, flexDirection: isRight ? 'row-reverse' : 'row' }}>
              {hero ? (
                <>
                  <img src={hero.image} alt={hero.name} style={styles.slotImg} />
                  <div style={{ flex: 1, textAlign: align }}>
                    <div style={styles.slotName}>{hero.name}</div>
                    <div style={styles.slotRole}>{hero.role}</div>
                  </div>
                  <button onClick={() => onRemove(hero)} style={styles.removeBtn}>✕</button>
                </>
              ) : (
                <span style={{ color: '#4b5563', fontSize: '13px', width: '100%', textAlign: 'center', fontStyle: 'italic' }}>Awaiting Selection...</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundImage: `linear-gradient(rgba(1, 10, 19, 0.82), rgba(1, 10, 19, 0.92)), url('/LOL-bg.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    color: '#f0e6d2',
    fontFamily: "'Spiegel', 'Open Sans', sans-serif",
    padding: '20px',
    position: 'relative',
  },
  toastBanner: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 2000,
    backgroundColor: '#010a13',
    border: '1px solid',
    padding: '12px 24px',
    borderRadius: '4px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '13px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
  },
  
  // ADJUSTED HEADER STYLES
  header: { 
    textAlign: 'center', 
    marginBottom: '32px', 
    paddingTop: '30px'
  },
  title: { 
    fontFamily: '"Georgia", "Times New Roman", serif', 
    color: '#c8aa6e', 
    margin: '0 0 12px 0', 
    letterSpacing: '8px', 
    fontSize: '44px', 
    textTransform: 'uppercase', 
    textShadow: '0 4px 12px rgba(0,0,0,0.9)' 
  },
  subtitle: { 
    color: '#a09b8c', 
    margin: 0, 
    fontSize: '15px',
    letterSpacing: '1px' 
  },

  mainContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  // Row 1: Top Section
  topRow: { display: 'flex', gap: '24px', alignItems: 'stretch' },
  
  draftBoard: { 
    flex: 2.2, 
    display: 'flex', 
    flexDirection: 'column',
    backgroundColor: '#091428', 
    padding: '20px 28px', 
    borderRadius: '4px', 
    border: '1px solid #c8aa6e', 
    boxShadow: '0 10px 30px rgba(0,0,0,0.6)' 
  },
  boardHeader: { textAlign: 'center', paddingBottom: '14px', borderBottom: '1px solid rgba(200, 170, 110, 0.15)', marginBottom: '18px' },
  boardTitle: { color: '#c8aa6e', fontSize: '14px', letterSpacing: '6px', fontWeight: 'bold' },
  boardSub: { color: '#a09b8c', fontSize: '10px', letterSpacing: '2px', marginTop: '6px' },
  draftMain: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flex: 1 },
  vsBadge: { color: '#c8aa6e', fontSize: '26px', fontWeight: 'bold', textShadow: '0 0 15px rgba(200,170,110,0.6)' },
  boardFooter: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid rgba(200, 170, 110, 0.15)', color: '#a09b8c', fontSize: '11px', letterSpacing: '1px', fontWeight: 'bold' },

  analyticsPanel: { flex: 1, backgroundColor: '#091428', padding: '18px 20px', borderRadius: '4px', border: '1px solid #c8aa6e', boxShadow: '0 10px 30px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column' },
  panelTitle: { color: '#c8aa6e', textAlign: 'center', margin: '0 0 14px 0', letterSpacing: '3px', fontSize: '15px' },
  predictBtn: { width: '100%', padding: '12px', backgroundColor: '#c8aa6e', color: '#010a13', border: 'none', borderRadius: '2px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', letterSpacing: '2px', marginBottom: '14px', transition: 'filter 0.2s' },

  resultsArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  winLabels: { display: 'flex', justifyContent: 'space-between' },
  barContainer: { display: 'flex', height: '18px', backgroundColor: '#010a13', borderRadius: '2px', overflow: 'hidden', border: '1px solid #1e282d' },

  statsSection: { backgroundColor: '#010a13', padding: '8px 10px', borderRadius: '2px', border: '1px solid #1e282d' },
  sectionHeader: { color: '#c8aa6e', fontSize: '10px', letterSpacing: '1px', margin: '0 0 6px 0', textAlign: 'center', textTransform: 'uppercase' },
  statsGrid: { display: 'flex', gap: '12px' },

  insightsArea: { backgroundColor: '#010a13', padding: '8px 10px', borderRadius: '2px', border: '1px solid #1e282d' },
  insightTag: { padding: '4px 8px', borderRadius: '2px', border: '1px solid', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' },

  emptyAnalyticsContainer: {
    flex: 1,
    minHeight: '130px',
    backgroundColor: '#010a13',
    border: '1px dashed #1e282d',
    padding: '16px 14px',
    borderRadius: '2px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
  placeholderIcon: { fontSize: '22px' },
  placeholderTitle: { color: '#c8aa6e', fontSize: '11px', margin: 0, letterSpacing: '2px' },
  placeholderDesc: { color: '#a09b8c', fontSize: '10px', margin: 0, lineHeight: '1.3' },

  // Row 2: Controls Divider Bar
  controlsBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#091428', padding: '14px 20px', borderRadius: '4px', border: '1px solid #1e282d', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', flexWrap: 'wrap', gap: '12px' },
  toggleGroup: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
  toggleBtn: { padding: '10px 18px', backgroundColor: '#010a13', border: '1px solid #1e282d', color: '#a09b8c', cursor: 'pointer', fontWeight: 'bold', borderRadius: '2px', letterSpacing: '1px', transition: 'all 0.2s', fontSize: '12px' },
  toggleActiveBlue: { border: '1px solid #0ea5e9', color: '#0ea5e9', boxShadow: 'inset 0 0 12px rgba(14,165,233,0.3)' },
  toggleActiveRed: { border: '1px solid #ef4444', color: '#ef4444', boxShadow: 'inset 0 0 12px rgba(239,68,68,0.3)' },
  resetBtn: { padding: '10px 14px', backgroundColor: '#010a13', border: '1px solid #ef4444', color: '#fca5a5', cursor: 'pointer', fontWeight: 'bold', borderRadius: '2px', fontSize: '11px', letterSpacing: '1px', transition: 'all 0.2s' },

  roleTabs: { display: 'flex', gap: '4px', marginLeft: '10px', flexWrap: 'wrap' },
  roleTab: { padding: '8px 12px', backgroundColor: '#010a13', border: '1px solid #1e282d', color: '#a09b8c', cursor: 'pointer', fontSize: '12px', borderRadius: '2px', transition: 'all 0.2s' },
  roleTabActive: { backgroundColor: '#c8aa6e', color: '#010a13', borderColor: '#c8aa6e', fontWeight: 'bold' },

  filterGroup: { display: 'flex', gap: '12px', alignItems: 'center' },
  searchInput: { padding: '10px 14px', backgroundColor: '#010a13', border: '1px solid #1e282d', color: '#f0e6d2', borderRadius: '2px', outline: 'none', width: '200px', fontSize: '13px' },

  // Row 3: Bottom Section
  bottomRow: { display: 'flex', gap: '24px', alignItems: 'stretch' },
  pool: { flex: 2.2, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(75px, 1fr))', gap: '12px', backgroundColor: '#091428', padding: '20px', borderRadius: '4px', border: '1px solid #1e282d', height: '480px', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' },
  heroCard: { background: 'none', border: 'none', padding: 0, textAlign: 'center', transition: 'transform 0.1s' },
  imgWrapper: { position: 'relative', border: '1px solid #1e282d', borderRadius: '2px', overflow: 'hidden' },
  heroImg: { width: '100%', aspectRatio: '1/1', objectFit: 'cover' },
  winRateOverlay: { position: 'absolute', bottom: 0, right: 0, backgroundColor: 'rgba(1,10,19,0.9)', color: '#4ade80', fontSize: '10px', padding: '1px 4px', fontWeight: 'bold', borderTopLeftRadius: '3px' },
  heroName: { fontSize: '11px', color: '#c8aa6e', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 'bold' },

  errorBox: { gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', height: '100%' },
  retryBtn: { backgroundColor: '#c8aa6e', color: '#010a13', border: 'none', padding: '8px 16px', fontWeight: 'bold', borderRadius: '2px', cursor: 'pointer', fontSize: '12px' },

  leaderboardCard: {
    flex: 1,
    backgroundColor: '#091428',
    padding: '20px',
    borderRadius: '4px',
    border: '1px solid #c8aa6e',
    boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
    height: '480px',
    display: 'flex',
    flexDirection: 'column',
  },
  lbScrollArea: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    paddingRight: '6px',
  },
  lbTitle: { color: '#c8aa6e', fontSize: '12px', letterSpacing: '2px', textAlign: 'center', margin: '0 0 12px 0', textTransform: 'uppercase' },
  lbHeader: { display: 'flex', borderBottom: '1px solid #1e282d', paddingBottom: '6px', marginBottom: '6px', fontSize: '10px', color: '#a09b8c', fontWeight: 'bold' },
  lbRow: { display: 'flex', padding: '6px 0', borderBottom: '1px solid rgba(30, 40, 45, 0.5)', fontSize: '11px', alignItems: 'center' },
  lbRank: { width: '35px', color: '#c8aa6e', fontWeight: 'bold', textAlign: 'center' },
  lbName: { flex: 1, color: '#f0e6d2', fontWeight: 'bold' },
  lbLP: { width: '50px', color: '#a09b8c', textAlign: 'right', paddingRight: '8px' },
  lbWR: { width: '50px', textAlign: 'right', fontWeight: 'bold' },

  slot: { backgroundColor: '#010a13', height: '46px', display: 'flex', alignItems: 'center', padding: '0 10px', borderRadius: '2px', border: '1px solid #1e282d', gap: '12px' },
  slotImg: { width: '34px', height: '34px', objectFit: 'cover', border: '1px solid #c8aa6e' },
  slotName: { fontSize: '13px', fontWeight: 'bold', color: '#f0e6d2' },
  slotRole: { fontSize: '11px', color: '#a09b8c' },
  removeBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', fontSize: '16px' },

  // Tooltip
  tooltip: { position: 'fixed', width: '220px', backgroundColor: '#010a13', border: '1px solid #c8aa6e', padding: '14px', zIndex: 1000, pointerEvents: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.9)' },
  ttTitle: { margin: 0, color: '#f0e6d2', fontSize: '15px', fontWeight: 'bold', letterSpacing: '1px' },
  ttWinRate: { color: '#4ade80', fontSize: '12px', fontWeight: 'bold' },
  ttRole: { color: '#a09b8c', fontSize: '11px', margin: '4px 0 12px 0', textTransform: 'uppercase' },
  ttLabel: { color: '#c8aa6e', fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px' },
  itemGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' },
  itemIcon: { width: '100%', aspectRatio: '1/1', border: '1px solid #1e282d', borderRadius: '2px' },
}

export default LeaguePredictor