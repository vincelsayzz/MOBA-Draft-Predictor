import { useState, useEffect } from 'react'
import BackToLanding from '../components/BackToLanding.jsx'

const FULL_HERO_POOL = [
  {id:1, name:"Anti-Mage", n:"antimage"}, {id:2, name:"Axe", n:"axe"}, {id:3, name:"Bane", n:"bane"}, {id:4, name:"Bloodseeker", n:"bloodseeker"}, {id:5, name:"Crystal Maiden", n:"crystal_maiden"},
  {id:6, name:"Drow Ranger", n:"drow_ranger"}, {id:7, name:"Earthshaker", n:"earthshaker"}, {id:8, name:"Juggernaut", n:"juggernaut"}, {id:9, name:"Mirana", n:"mirana"}, {id:10, name:"Morphling", n:"morphling"},
  {id:11, name:"Shadow Fiend", n:"nevermore"}, {id:12, name:"Phantom Lancer", n:"phantom_lancer"}, {id:13, name:"Puck", n:"puck"}, {id:14, name:"Pudge", n:"pudge"}, {id:15, name:"Razor", n:"razor"},
  {id:16, name:"Sand King", n:"sand_king"}, {id:17, name:"Storm Spirit", n:"storm_spirit"}, {id:18, name:"Sven", n:"sven"}, {id:19, name:"Tiny", n:"tiny"}, {id:20, name:"Vengeful Spirit", n:"vengefulspirit"},
  {id:21, name:"Windranger", n:"windrunner"}, {id:22, name:"Zeus", n:"zuus"}, {id:23, name:"Kunkka", n:"kunkka"}, {id:25, name:"Lina", n:"lina"}, {id:26, name:"Lion", n:"lion"},
  {id:27, name:"Shadow Shaman", n:"shadow_shaman"}, {id:28, name:"Slardar", n:"slardar"}, {id:29, name:"Tidehunter", n:"tidehunter"}, {id:30, name:"Witch Doctor", n:"witch_doctor"}, {id:31, name:"Lich", n:"lich"},
  {id:32, name:"Riki", n:"riki"}, {id:33, name:"Enigma", n:"enigma"}, {id:34, name:"Tinker", n:"tinker"}, {id:35, name:"Sniper", n:"sniper"}, {id:36, name:"Necrophos", n:"necrolyte"},
  {id:37, name:"Warlock", n:"warlock"}, {id:38, name:"Beastmaster", n:"beastmaster"}, {id:39, name:"Queen of Pain", n:"queenofpain"}, {id:40, name:"Venomancer", n:"venomancer"}, {id:41, name:"Faceless Void", n:"faceless_void"},
  {id:42, name:"Wraith King", n:"skeleton_king"}, {id:43, name:"Death Prophet", n:"death_prophet"}, {id:44, name:"Phantom Assassin", n:"phantom_assassin"}, {id:45, name:"Pugna", n:"pugna"}, {id:46, name:"Templar Assassin", n:"templar_assassin"},
  {id:47, name:"Viper", n:"viper"}, {id:48, name:"Luna", n:"luna"}, {id:49, name:"Dragon Knight", n:"dragon_knight"}, {id:50, name:"Dazzle", n:"dazzle"}, {id:51, name:"Clockwerk", n:"rattletrap"},
  {id:52, name:"Leshrac", n:"leshrac"}, {id:53, name:"Nature's Prophet", n:"furion"}, {id:54, name:"Lifestealer", n:"life_stealer"}, {id:55, name:"Dark Seer", n:"dark_seer"}, {id:56, name:"Clinkz", n:"clinkz"},
  {id:57, name:"Omniknight", n:"omniknight"}, {id:58, name:"Enchantress", n:"enchantress"}, {id:59, name:"Huskar", n:"huskar"}, {id:60, name:"Night Stalker", n:"night_stalker"}, {id:61, name:"Broodmother", n:"broodmother"},
  {id:62, name:"Bounty Hunter", n:"bounty_hunter"}, {id:63, name:"Weaver", n:"weaver"}, {id:64, name:"Jakiro", n:"jakiro"}, {id:65, name:"Batrider", n:"batrider"}, {id:66, name:"Chen", n:"chen"},
  {id:67, name:"Spectre", n:"spectre"}, {id:68, name:"Ancient Apparition", n:"ancient_apparition"}, {id:69, name:"Doom", n:"doom_bringer"}, {id:70, name:"Ursa", n:"ursa"}, {id:71, name:"Spirit Breaker", n:"spirit_breaker"},
  {id:72, name:"Gyrocopter", n:"gyrocopter"}, {id:73, name:"Alchemist", n:"alchemist"}, {id:74, name:"Invoker", n:"invoker"}, {id:75, name:"Silencer", n:"silencer"}, {id:76, name:"Outworld Destroyer", n:"obsidian_destroyer"},
  {id:77, name:"Lycan", n:"lycan"}, {id:78, name:"Brewmaster", n:"brewmaster"}, {id:79, name:"Shadow Demon", n:"shadow_demon"}, {id:80, name:"Lone Druid", n:"lone_druid"}, {id:81, name:"Chaos Knight", n:"chaos_knight"},
  {id:82, name:"Meepo", n:"meepo"}, {id:83, name:"Treant Protector", n:"treant"}, {id:84, name:"Ogre Magi", n:"ogre_magi"}, {id:85, name:"Undying", n:"undying"}, {id:86, name:"Rubick", n:"rubick"},
  {id:87, name:"Disruptor", n:"disruptor"}, {id:88, name:"Nyx Assassin", n:"nyx_assassin"}, {id:89, name:"Naga Siren", n:"naga_siren"}, {id:90, name:"Keeper of the Light", n:"keeper_of_the_light"}, {id:91, name:"Io", n:"wisp"},
  {id:92, name:"Visage", n:"visage"}, {id:93, name:"Slark", n:"slark"}, {id:94, name:"Medusa", n:"medusa"}, {id:95, name:"Troll Warlord", n:"troll_warlord"}, {id:96, name:"Centaur Warrunner", n:"centaur"},
  {id:97, name:"Magnus", n:"magnataur"}, {id:98, name:"Timbersaw", n:"shredder"}, {id:99, name:"Bristleback", n:"bristleback"}, {id:100, name:"Tusk", n:"tusk"}, {id:101, name:"Skywrath Mage", n:"skywrath_mage"},
  {id:102, name:"Abaddon", n:"abaddon"}, {id:103, name:"Elder Titan", n:"elder_titan"}, {id:104, name:"Legion Commander", n:"legion_commander"}, {id:105, name:"Techies", n:"techies"}, {id:106, name:"Ember Spirit", n:"ember_spirit"},
  {id:107, name:"Earth Spirit", n:"earth_spirit"}, {id:108, name:"Underlord", n:"abyssal_underlord"}, {id:109, name:"Terrorblade", n:"terrorblade"}, {id:110, name:"Phoenix", n:"phoenix"}, {id:111, name:"Oracle", n:"oracle"},
  {id:112, name:"Winter Wyvern", n:"winter_wyvern"}, {id:113, name:"Arc Warden", n:"arc_warden"}, {id:114, name:"Monkey King", n:"monkey_king"}, {id:119, name:"Dark Willow", n:"dark_willow"}, {id:120, name:"Pangolier", n:"pangolier"}
];

function DotaPredictor() {
  const [radiantHeroes, setRadiantHeroes] = useState([]);
  const [direHeroes, setDireHeroes] = useState([]);
  const [pickingFor, setPickingFor] = useState('Radiant');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [gameMode, setGameMode] = useState(22);
  const [rRegistered, setRRegistered] = useState(5);
  const [dRegistered, setDRegistered] = useState(5);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const [liveWinRates, setLiveWinRates] = useState({});
  const [heroApiData, setHeroApiData] = useState({});
  const [hoveredHero, setHoveredHero] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Custom Toast State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'warning') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const response = await fetch('https://api.opendota.com/api/heroStats');
        const data = await response.json();
        
        const winRateMap = {};
        const heroDataMap = {};
        
        data.forEach(hero => {
          heroDataMap[hero.id] = hero;

          if (hero.pro_pick > 10) {
            winRateMap[hero.id] = ((hero.pro_win / hero.pro_pick) * 100).toFixed(1);
          } else {
            const totalPubPicks = (hero['1_pick'] || 0) + (hero['2_pick'] || 0) + (hero['3_pick'] || 0) + 
                                  (hero['4_pick'] || 0) + (hero['5_pick'] || 0) + (hero['6_pick'] || 0) + 
                                  (hero['7_pick'] || 0) + (hero['8_pick'] || 0);
            
            const totalPubWins = (hero['1_win'] || 0) + (hero['2_win'] || 0) + (hero['3_win'] || 0) + 
                                 (hero['4_win'] || 0) + (hero['5_win'] || 0) + (hero['6_win'] || 0) + 
                                 (hero['7_win'] || 0) + (hero['8_win'] || 0);

            if (totalPubPicks > 0) winRateMap[hero.id] = ((totalPubWins / totalPubPicks) * 100).toFixed(1);
            else winRateMap[hero.id] = hero.turbo_picks > 0 ? ((hero.turbo_wins / hero.turbo_picks) * 100).toFixed(1) : "N/A";
          }
        });
        
        setLiveWinRates(winRateMap);
        setHeroApiData(heroDataMap);
      } catch (error) {
        console.error("Failed to fetch live stats from OpenDota", error);
        showToast("Failed to fetch live stats. Please check your connection.", "error");
      }
    };

    fetchLiveStats();
  }, []); 

  const getHeroImageUrl = (internalName) => `https://cdn.akamai.steamstatic.com/apps/dota2/images/heroes/${internalName}_vert.jpg`;
  
  const generateMetaItems = (primaryAttr) => {
    let core = [];
    let neutral = '';
    
    if (primaryAttr === 'agi') {
      core = ['power_treads', 'manta', 'black_king_bar', 'butterfly', 'skadi', 'greater_crit'];
      neutral = 'poor_mans_shield';
    } else if (primaryAttr === 'str') {
      core = ['phase_boots', 'blink', 'blade_mail', 'black_king_bar', 'heart', 'assault'];
      neutral = 'iron_talon';
    } else if (primaryAttr === 'int') {
      core = ['arcane_boots', 'force_staff', 'cyclone', 'ultimate_scepter', 'octarine_core', 'sheepstick'];
      neutral = 'ring_of_aquila';
    } else { // Universal
      core = ['travel_boots', 'hand_of_midas', 'sphere', 'black_king_bar', 'skadi', 'monkey_king_bar'];
      neutral = 'iron_talon';
    }
    
    return {
      core: core.map(item => `https://cdn.akamai.steamstatic.com/apps/dota2/images/items/${item}_lg.png`),
      neutral: `https://cdn.akamai.steamstatic.com/apps/dota2/images/items/${neutral}_lg.png`
    };
  };

  const handleMouseMove = (e) => {
    let x = e.clientX + 15;
    let y = e.clientY + 15;
    if (x + 340 > window.innerWidth) x = e.clientX - 355;
    if (y + 260 > window.innerHeight) y = e.clientY - 275;
    setMousePos({ x, y });
  };

  const calculateTeamStats = (heroes) => {
    if (heroes.length === 0) return { cc: 0, push: 0, scaling: 0, physical: 50, initiation: 0, durability: 0, mobility: 0 };
    const teamHash = heroes.reduce((acc, h) => acc + h.id, 0);
    return {
      cc: ((teamHash * 3) % 60) + 40, push: ((teamHash * 7) % 60) + 40, scaling: ((teamHash * 11) % 60) + 40,
      physical: ((teamHash * 13) % 80) + 10, initiation: ((teamHash * 17) % 60) + 40, 
      durability: ((teamHash * 19) % 60) + 40, mobility: ((teamHash * 23) % 60) + 40
    };
  };

  const handleHeroPick = (hero) => {
    const isAlreadyPicked = radiantHeroes.includes(hero) || direHeroes.includes(hero);
    if (isAlreadyPicked) {
      showToast(`${hero.name} has already been drafted!`, 'error');
      return;
    }

    if (pickingFor === 'Radiant') {
      if (radiantHeroes.length >= 5) {
        showToast("Radiant Side is already full (5/5).", 'warning');
        return;
      }
      const newRadiant = [...radiantHeroes, hero];
      setRadiantHeroes(newRadiant);

      // Auto-switch to Dire if Radiant finishes picking
      if (newRadiant.length === 5 && direHeroes.length < 5) {
        setPickingFor('Dire');
        showToast('Radiant Side full! Auto-switched to Dire drafting.', 'info');
      } else if (newRadiant.length === 5 && direHeroes.length === 5) {
        showToast('Draft Complete! Click "Analyze Draft & Predict".', 'success');
      }

    } else {
      if (direHeroes.length >= 5) {
        showToast("Dire Side is already full (5/5).", 'warning');
        return;
      }
      const newDire = [...direHeroes, hero];
      setDireHeroes(newDire);

      // Auto-switch to Radiant if Dire finishes picking
      if (newDire.length === 5 && radiantHeroes.length < 5) {
        setPickingFor('Radiant');
        showToast('Dire Side full! Auto-switched to Radiant drafting.', 'info');
      } else if (newDire.length === 5 && radiantHeroes.length === 5) {
        showToast('Draft Complete! Click "Analyze Draft & Predict".', 'success');
      }
    }
    
    setSearchQuery('');
    setHoveredHero(null); 
    setResults(null);
  };

  const handleRemoveHero = (heroToRemove, team) => {
    if (team === 'Radiant') setRadiantHeroes(radiantHeroes.filter(h => h.id !== heroToRemove.id));
    else setDireHeroes(direHeroes.filter(h => h.id !== heroToRemove.id));
    setResults(null);
  };

  const handlePredict = async () => {
    const rMissing = 5 - radiantHeroes.length;
    const dMissing = 5 - direHeroes.length;

    if (rMissing > 0 || dMissing > 0) {
      if (rMissing > 0 && dMissing > 0) {
        showToast(`Draft incomplete! Radiant needs ${rMissing} pick(s), Dire needs ${dMissing} pick(s).`, 'warning');
      } else if (rMissing > 0) {
        showToast(`Draft incomplete! Radiant needs ${rMissing} more pick(s).`, 'warning');
      } else {
        showToast(`Draft incomplete! Dire needs ${dMissing} more pick(s).`, 'warning');
      }
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const payload = { 
        radiant_heroes: radiantHeroes.map(h => h.id), dire_heroes: direHeroes.map(h => h.id),
        game_mode: parseInt(gameMode), r_registered: parseInt(rRegistered), d_registered: parseInt(dRegistered)
      };

      const response = await fetch("https://dota2-draft-predictor.onrender.com/predict", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Network response was not ok");
      
      const backendData = await response.json();
      setResults({ ...backendData, radiantStats: calculateTeamStats(radiantHeroes), direStats: calculateTeamStats(direHeroes) });
      showToast('Match analytics calculated successfully!', 'success');
    } catch (error) {
      showToast("Failed to connect to backend. Make sure FastAPI is running on port 8000.", "error");
    } finally {
      setLoading(false);
    }
  };

  const displayedHeroes = FULL_HERO_POOL.filter(hero => 
    hero.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

 return (
  <>
    <BackToLanding />
    <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Roboto+Condensed:wght@400;700&display=swap');
          
          body { 
            font-family: 'Roboto Condensed', sans-serif; 
            margin: 0;
            background-image: url('/wp11498037-dota-2-2022-wallpapers.jpg');
            background-size: cover;
            background-position: center top;
            background-attachment: fixed;
            background-repeat: no-repeat;
            background-color: #0b0c10;
            color: #c5c6c7;
            min-height: 100vh;
            overflow-x: hidden;
          }
          
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: rgba(11, 12, 16, 0.8); border-left: 1px solid rgba(31, 40, 51, 0.5); }
          ::-webkit-scrollbar-thumb { background: #45a29e; border-radius: 4px; }
          ::-webkit-scrollbar-thumb:hover { background: #66fcf1; }

          .hero-card { transition: all 0.2s ease-in-out; position: relative; }
          .hero-card:hover:not(.picked) { 
            transform: scale(1.05); 
            box-shadow: 0 0 12px rgba(102, 252, 241, 0.4);
            border-color: #66fcf1 !important;
            z-index: 10;
          }
          
          .search-input:focus {
            outline: none;
            border-color: #66fcf1;
            box-shadow: 0 0 15px rgba(102, 252, 241, 0.2);
          }

          input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; }
          input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none; height: 18px; width: 18px; border-radius: 50%;
            background: #66fcf1; cursor: pointer; margin-top: -6px; box-shadow: 0 0 10px rgba(102, 252, 241, 0.5);
          }
          input[type=range]::-webkit-slider-runnable-track {
            width: 100%; height: 6px; cursor: pointer; background: rgba(31, 40, 51, 0.8); border-radius: 3px;
          }
          
          .live-badge {
            position: absolute; top: 2px; right: 2px; background-color: rgba(0,0,0,0.8);
            border: 1px solid #d4af37; color: #d4af37; font-size: 9px; padding: 2px 4px;
            border-radius: 2px; font-weight: bold;
          }
          
          @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        `}
      </style>

      {/* FLOATING TOAST NOTIFICATION */}
      {toast && (
        <div
          style={{
            ...styles.toastBanner,
            borderColor:
              toast.type === 'error'
                ? '#c23b3b'
                : toast.type === 'success'
                ? '#56c271'
                : toast.type === 'info'
                ? '#45a29e'
                : '#ff9800',
            color:
              toast.type === 'error'
                ? '#ffb3b3'
                : toast.type === 'success'
                ? '#b3ffcc'
                : toast.type === 'info'
                ? '#b3ffff'
                : '#ffe6b3',
          }}
        >
          <span>{toast.type === 'error' ? '🚫' : toast.type === 'success' ? '⚡' : toast.type === 'info' ? 'ℹ️' : '⚠️'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* FLOATING HOVER MODAL */}
      {hoveredHero && heroApiData[hoveredHero.id] && (
        <div style={{
          ...styles.hoverTooltip,
          left: mousePos.x,
          top: mousePos.y,
        }}>
          <div style={styles.tooltipHeader}>
            <div style={{...styles.tooltipPortrait, backgroundImage: `url(${getHeroImageUrl(hoveredHero.n)})`}}></div>
            <div>
              <h4 style={styles.tooltipTitle}>{hoveredHero.name}</h4>
              <p style={styles.tooltipAttr}>
                {heroApiData[hoveredHero.id].primary_attr.toUpperCase()} · {heroApiData[hoveredHero.id].attack_type}
              </p>
            </div>
          </div>
          
          <div style={styles.tooltipBody}>
            <p style={styles.tooltipRoles}>{heroApiData[hoveredHero.id].roles.join(' · ')}</p>
            
            {/* Live Win Rate Progress Bar */}
            {liveWinRates[hoveredHero.id] && (
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: '#e5e5e5', fontWeight: 'bold' }}>
                  <span>Live Win Rate</span>
                  <span style={{ color: parseFloat(liveWinRates[hoveredHero.id]) >= 50 ? '#56c271' : '#c23b3b' }}>
                    {liveWinRates[hoveredHero.id]}{liveWinRates[hoveredHero.id] !== 'N/A' ? '%' : ''}
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#111', borderRadius: '3px', overflow: 'hidden', border: '1px solid #333' }}>
                  <div style={{ 
                    height: '100%', 
                    width: liveWinRates[hoveredHero.id] === 'N/A' ? '0%' : `${liveWinRates[hoveredHero.id]}%`, 
                    backgroundColor: parseFloat(liveWinRates[hoveredHero.id]) >= 50 ? '#56c271' : '#c23b3b',
                    transition: 'width 0.3s ease-in-out'
                  }}></div>
                </div>
              </div>
            )}

            <div style={styles.tooltipStatsGrid}>
              <div style={styles.tooltipStat}>🛡️ Armor: {heroApiData[hoveredHero.id].base_armor}</div>
              <div style={styles.tooltipStat}>👟 Speed: {heroApiData[hoveredHero.id].move_speed}</div>
              <div style={styles.tooltipStat}>⚔️ Dmg: {heroApiData[hoveredHero.id].base_attack_min}-{heroApiData[hoveredHero.id].base_attack_max}</div>
              <div style={styles.tooltipStat}>❤️ HP: {heroApiData[hoveredHero.id].base_health}</div>
            </div>

            {/* 6 Core Items + 1 Neutral Item */}
            <h5 style={styles.tooltipSubHeader}>Meta Build & Neutral</h5>
            <div style={styles.tooltipItemsContainer}>
              <div style={styles.tooltipCoreItems}>
                {generateMetaItems(heroApiData[hoveredHero.id].primary_attr).core.map((img, i) => (
                  <img key={i} src={img} alt="core-item" style={styles.tooltipItemImg} />
                ))}
              </div>
              
              <div style={styles.tooltipNeutralItemContainer}>
                  <img src={generateMetaItems(heroApiData[hoveredHero.id].primary_attr).neutral} alt="neutral-item" style={styles.tooltipNeutralImg} />
              </div>
            </div>

          </div>
        </div>
      )}

      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.appTitle}>DEFENSE OF <span style={{color: '#66fcf1'}}>THE ANCIENT 2</span></h1>
          <p style={styles.subtitle}>Select your heroes and match settings to analyze win probabilities.</p>
        </header>

        {/* SETTINGS PANEL */}
        <div style={styles.settingsPanel}>
          <h3 style={styles.settingsTitle}>MATCH CONTEXT SETTINGS</h3>
          <div style={styles.settingsGrid}>
            <div style={styles.settingControl}>
              <label style={styles.settingLabel}>GAME MODE</label>
              <select value={gameMode} onChange={(e) => setGameMode(e.target.value)} style={styles.selectInput}>
                <option value="22">Ranked All Pick</option>
                <option value="1">All Pick (Unranked)</option>
                <option value="2">Captains Mode</option>
                <option value="3">Random Draft</option>
                <option value="16">Captains Draft</option>
              </select>
            </div>
            <div style={styles.settingControl}>
              <label style={{...styles.settingLabel, color: '#56c271', textShadow: '0 1px 2px rgba(0,0,0,0.8)'}}>RADIANT PUBLIC PROFILES: {rRegistered} / 5</label>
              <input type="range" min="0" max="5" value={rRegistered} onChange={(e) => setRRegistered(e.target.value)} />
            </div>
            <div style={styles.settingControl}>
              <label style={{...styles.settingLabel, color: '#c23b3b', textShadow: '0 1px 2px rgba(0,0,0,0.8)'}}>DIRE PUBLIC PROFILES: {dRegistered} / 5</label>
              <input type="range" min="0" max="5" value={dRegistered} onChange={(e) => setDRegistered(e.target.value)} />
            </div>
          </div>
        </div>

        {/* DRAFT BOARD */}
        <div style={styles.draftBoard}>
          <div style={styles.teamColumn}>
            <h2 style={{ ...styles.teamTitle, color: '#56c271', borderBottomColor: '#56c271', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>THE RADIANT</h2>
            <div style={styles.slotsContainer}>
              {[...Array(5)].map((_, index) => {
                const hero = radiantHeroes[index];
                return (
                  <div key={`radiant-${index}`} style={styles.slot}>
                    {hero ? (
                      <button onClick={() => handleRemoveHero(hero, 'Radiant')} style={styles.heroBadge}>
                        <div style={{ ...styles.badgePortrait, backgroundImage: `url(${getHeroImageUrl(hero.n)})` }} />
                        <span style={styles.badgeName}>{hero.name}</span>
                        <span style={styles.removeIcon}>✕</span>
                      </button>
                    ) : <span style={styles.emptySlot}>Empty</span>}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={styles.vsDivider}>VS</div>
          <div style={styles.teamColumn}>
            <h2 style={{ ...styles.teamTitle, color: '#c23b3b', borderBottomColor: '#c23b3b', textAlign: 'right', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>THE DIRE</h2>
            <div style={styles.slotsContainer}>
              {[...Array(5)].map((_, index) => {
                const hero = direHeroes[index];
                return (
                  <div key={`dire-${index}`} style={{...styles.slot, flexDirection: 'row-reverse'}}>
                    {hero ? (
                      <button onClick={() => handleRemoveHero(hero, 'Dire')} style={{...styles.heroBadge, flexDirection: 'row-reverse'}}>
                        <div style={{ ...styles.badgePortrait, backgroundImage: `url(${getHeroImageUrl(hero.n)})` }} />
                        <span style={{...styles.badgeName, textAlign: 'right'}}>{hero.name}</span>
                        <span style={styles.removeIcon}>✕</span>
                      </button>
                    ) : <span style={styles.emptySlot}>Empty</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div style={styles.controls}>
          <div style={styles.radioGroup}>
            <label style={{ ...styles.radioLabel, backgroundColor: pickingFor === 'Radiant' ? 'rgba(86, 194, 113, 0.4)' : 'rgba(15, 20, 25, 0.8)', borderColor: pickingFor === 'Radiant' ? '#56c271' : 'rgba(255,255,255,0.2)' }}>
              <input type="radio" value="Radiant" checked={pickingFor === 'Radiant'} onChange={(e) => setPickingFor(e.target.value)} style={{ display: 'none' }}/> DRAFTING RADIANT
            </label>
            <label style={{ ...styles.radioLabel, backgroundColor: pickingFor === 'Dire' ? 'rgba(194, 59, 59, 0.4)' : 'rgba(15, 20, 25, 0.8)', borderColor: pickingFor === 'Dire' ? '#c23b3b' : 'rgba(255,255,255,0.2)' }}>
              <input type="radio" value="Dire" checked={pickingFor === 'Dire'} onChange={(e) => setPickingFor(e.target.value)} style={{ display: 'none' }}/> DRAFTING DIRE
            </label>
          </div>
        </div>
        
        {/* SEARCH BAR */}
        <div style={styles.searchContainer}>
          <input type="text" placeholder="Search for a hero..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.searchInput} className="search-input"/>
        </div>

        {/* SCROLLABLE HERO POOL */}
        <div style={styles.heroPoolContainer}>
          {displayedHeroes.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#ccc', marginTop: '40px', fontSize: '18px', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>No heroes found matching "{searchQuery}"</div>
          ) : (
            <div style={styles.heroPool}>
              {displayedHeroes.map(hero => {
                const isRadiant = radiantHeroes.includes(hero);
                const isDire = direHeroes.includes(hero);
                const isPicked = isRadiant || isDire;

                return (
                  <button 
                    key={hero.id} 
                    onClick={() => handleHeroPick(hero)}
                    onMouseEnter={(e) => { setHoveredHero(hero); handleMouseMove(e); }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoveredHero(null)}
                    className={`hero-card ${isPicked ? 'picked' : ''}`}
                    style={{
                      ...styles.poolCard, opacity: isPicked ? 0.35 : 1, filter: isPicked ? 'grayscale(100%)' : 'none', pointerEvents: isPicked ? 'none' : 'auto',
                      border: isRadiant ? '2px solid #56c271' : isDire ? '2px solid #c23b3b' : '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <div style={{ ...styles.poolCardImage, backgroundImage: `url(${getHeroImageUrl(hero.n)})` }} />
                    {liveWinRates[hero.id] && <div className="live-badge">{liveWinRates[hero.id]}%</div>}
                    <div style={styles.poolCardName}>{hero.name}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div style={styles.actionArea}>
          <button onClick={handlePredict} style={styles.predictButton} disabled={loading}>
            {loading ? "ANALYZING MATCH..." : "ANALYZE DRAFT & PREDICT"}
          </button>
        </div>

        {/* RESULTS DASHBOARD */}
        {results && (
          <div style={styles.resultsCard}>
            <h2 style={styles.resultTitle}>MATCH PREDICTION: <span style={{ color: results.winner === 'Radiant' ? '#56c271' : '#c23b3b', marginLeft: '10px', fontSize: '32px', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>{results.winner.toUpperCase()} VICTORY</span></h2>
            <div style={styles.probabilityBarContainer}>
              <div style={{...styles.probabilityBar, width: `${results.radiant_probability}%`, backgroundColor: '#56c271'}}></div>
              <div style={{...styles.probabilityBar, width: `${100 - results.radiant_probability}%`, backgroundColor: '#c23b3b'}}></div>
            </div>
            <div style={styles.probabilityLabels}>
              <span style={{color: '#56c271', textShadow: '0 1px 3px rgba(0,0,0,0.8)'}}>RADIANT ODDS: {results.radiant_probability.toFixed(1)}%</span>
              <span style={{color: '#c23b3b', textShadow: '0 1px 3px rgba(0,0,0,0.8)'}}>DIRE ODDS: {(100 - results.radiant_probability).toFixed(1)}%</span>
            </div>

            <h3 style={styles.statsMainTitle}>TEAM COMPOSITION ANALYSIS</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statBox}>
                <h4 style={{...styles.statHeader, color: '#56c271'}}>RADIANT DRAFT</h4>
                <div style={styles.statRow}><div style={styles.statLabel}>Initiation / Catch</div><div style={styles.statBarBg}><div style={{...styles.statBarFill, width: `${results.radiantStats.initiation}%`, backgroundColor: '#ff9800'}}></div></div></div>
                <div style={styles.statRow}><div style={styles.statLabel}>Crowd Control</div><div style={styles.statBarBg}><div style={{...styles.statBarFill, width: `${results.radiantStats.cc}%`, backgroundColor: '#e2b13c'}}></div></div></div>
                <div style={styles.statRow}><div style={styles.statLabel}>Durability / Frontline</div><div style={styles.statBarBg}><div style={{...styles.statBarFill, width: `${results.radiantStats.durability}%`, backgroundColor: '#4caf50'}}></div></div></div>
                <div style={styles.statRow}><div style={styles.statLabel}>Mobility / Elusive</div><div style={styles.statBarBg}><div style={{...styles.statBarFill, width: `${results.radiantStats.mobility}%`, backgroundColor: '#00bcd4'}}></div></div></div>
                <div style={styles.statRow}><div style={styles.statLabel}>Push Potential</div><div style={styles.statBarBg}><div style={{...styles.statBarFill, width: `${results.radiantStats.push}%`, backgroundColor: '#a63ce2'}}></div></div></div>
                <div style={styles.statRow}><div style={styles.statLabel}>Late Game Scaling</div><div style={styles.statBarBg}><div style={{...styles.statBarFill, width: `${results.radiantStats.scaling}%`, backgroundColor: '#3c79e2'}}></div></div></div>
                <div style={styles.statRow}><div style={styles.statLabel}>Dmg: Phys / Magic</div><div style={styles.statBarBg}><div style={{...styles.statBarFill, width: `${results.radiantStats.physical}%`, backgroundColor: '#c23b3b'}}></div><div style={{...styles.statBarFill, width: `${100 - results.radiantStats.physical}%`, backgroundColor: '#3ca3e2', position: 'absolute', right: 0}}></div></div></div>
              </div>
              <div style={styles.statBox}>
                <h4 style={{...styles.statHeader, color: '#c23b3b'}}>DIRE DRAFT</h4>
                <div style={styles.statRow}><div style={styles.statLabel}>Initiation / Catch</div><div style={styles.statBarBg}><div style={{...styles.statBarFill, width: `${results.direStats.initiation}%`, backgroundColor: '#ff9800'}}></div></div></div>
                <div style={styles.statRow}><div style={styles.statLabel}>Crowd Control</div><div style={styles.statBarBg}><div style={{...styles.statBarFill, width: `${results.direStats.cc}%`, backgroundColor: '#e2b13c'}}></div></div></div>
                <div style={styles.statRow}><div style={styles.statLabel}>Durability / Frontline</div><div style={styles.statBarBg}><div style={{...styles.statBarFill, width: `${results.direStats.durability}%`, backgroundColor: '#4caf50'}}></div></div></div>
                <div style={styles.statRow}><div style={styles.statLabel}>Mobility / Elusive</div><div style={styles.statBarBg}><div style={{...styles.statBarFill, width: `${results.direStats.mobility}%`, backgroundColor: '#00bcd4'}}></div></div></div>
                <div style={styles.statRow}><div style={styles.statLabel}>Push Potential</div><div style={styles.statBarBg}><div style={{...styles.statBarFill, width: `${results.direStats.push}%`, backgroundColor: '#a63ce2'}}></div></div></div>
                <div style={styles.statRow}><div style={styles.statLabel}>Late Game Scaling</div><div style={styles.statBarBg}><div style={{...styles.statBarFill, width: `${results.direStats.scaling}%`, backgroundColor: '#3c79e2'}}></div></div></div>
                <div style={styles.statRow}><div style={styles.statLabel}>Dmg: Phys / Magic</div><div style={styles.statBarBg}><div style={{...styles.statBarFill, width: `${results.direStats.physical}%`, backgroundColor: '#c23b3b'}}></div><div style={{...styles.statBarFill, width: `${100 - results.direStats.physical}%`, backgroundColor: '#3ca3e2', position: 'absolute', right: 0}}></div></div></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' },
  header: { textAlign: 'center', marginBottom: '30px' },
  appTitle: { fontFamily: "'Cinzel', serif", fontSize: '52px', margin: '0', letterSpacing: '4px', textShadow: '0 4px 15px rgba(0, 0, 0, 0.8)' },
  subtitle: { color: '#e5e5e5', fontSize: '18px', marginTop: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' },
  
  toastBanner: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10000,
    backgroundColor: 'rgba(15, 20, 25, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid',
    padding: '12px 24px',
    borderRadius: '4px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.9)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    animation: 'fadeIn 0.2s ease-in-out',
    color: '#fff'
  },

  hoverTooltip: {
    position: 'fixed', width: '320px', backgroundColor: 'rgba(11, 15, 20, 0.95)',
    backdropFilter: 'blur(10px)', border: '1px solid #d4af37', borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.8)', padding: '15px',
    pointerEvents: 'none', zIndex: 9999, animation: 'fadeIn 0.2s ease-out'
  },
  tooltipHeader: { display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', marginBottom: '10px' },
  tooltipPortrait: { width: '50px', height: '50px', borderRadius: '50%', backgroundSize: 'cover', backgroundPosition: 'top', marginRight: '15px', border: '1px solid #66fcf1' },
  tooltipTitle: { fontFamily: "'Cinzel', serif", color: '#fff', margin: '0 0 5px 0', fontSize: '18px' },
  tooltipAttr: { margin: '0', fontSize: '12px', color: '#8892b0', fontWeight: 'bold' },
  tooltipRoles: { color: '#66fcf1', fontSize: '12px', margin: '0 0 12px 0', fontStyle: 'italic' },
  tooltipStatsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '15px' },
  tooltipStat: { backgroundColor: 'rgba(0,0,0,0.5)', padding: '5px', borderRadius: '4px', fontSize: '12px', color: '#e5e5e5', border: '1px solid rgba(255,255,255,0.05)' },
  
  tooltipSubHeader: { fontFamily: "'Cinzel', serif", fontSize: '14px', color: '#d4af37', margin: '0 0 10px 0', borderBottom: '1px solid #333', paddingBottom: '5px' },
  tooltipItemsContainer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '5px' },
  tooltipCoreItems: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' },
  tooltipItemImg: { width: '45px', height: '32px', border: '1px solid #333', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.5)' },
  tooltipNeutralItemContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '12px', borderLeft: '1px dashed rgba(255,255,255,0.2)' },
  tooltipNeutralImg: { width: '45px', height: '45px', borderRadius: '50%', border: '2px solid #d4af37', boxShadow: '0 0 8px rgba(212, 175, 55, 0.6)', objectFit: 'cover' },

  settingsPanel: { backgroundColor: 'rgba(15, 20, 25, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' },
  settingsTitle: { fontFamily: "'Cinzel', serif", color: '#66fcf1', margin: '0 0 15px 0', fontSize: '18px', letterSpacing: '1px', textAlign: 'center', textShadow: '0 2px 4px rgba(0,0,0,0.8)' },
  settingsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  settingControl: { display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  settingLabel: { fontSize: '14px', fontWeight: 'bold', color: '#fff', marginBottom: '8px', textTransform: 'uppercase', textShadow: '0 1px 3px rgba(0,0,0,0.8)' },
  selectInput: { padding: '10px', backgroundColor: 'rgba(0, 0, 0, 0.6)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', fontFamily: "'Roboto Condensed', sans-serif", cursor: 'pointer' },

  draftBoard: { display: 'flex', justifyContent: 'space-between', backgroundColor: 'rgba(15, 20, 25, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 15px 35px rgba(0,0,0,0.6)', marginBottom: '30px' },
  teamColumn: { width: '42%' },
  vsDivider: { fontFamily: "'Cinzel', serif", fontSize: '36px', color: '#45a29e', display: 'flex', alignItems: 'center', textShadow: '0 0 15px rgba(0,0,0,0.8)' },
  teamTitle: { fontFamily: "'Cinzel', serif", fontSize: '24px', margin: '0 0 15px 0', borderBottom: '2px solid', paddingBottom: '8px', letterSpacing: '2px' },
  slotsContainer: { display: 'flex', flexDirection: 'column', gap: '8px' },
  slot: { backgroundColor: 'rgba(0, 0, 0, 0.6)', border: '1px solid rgba(255,255,255,0.1)', height: '50px', display: 'flex', alignItems: 'center', borderRadius: '4px', overflow: 'hidden' },
  emptySlot: { color: '#888', fontStyle: 'italic', width: '100%', textAlign: 'center' },
  heroBadge: { display: 'flex', alignItems: 'center', width: '100%', height: '100%', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '0', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' },
  badgePortrait: { width: '50px', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center' },
  badgeName: { flex: 1, padding: '0 15px', fontSize: '16px', fontWeight: 'bold', textAlign: 'left' },
  removeIcon: { color: '#ccc', padding: '0 15px', fontSize: '20px', textShadow: '0 1px 2px rgba(0,0,0,0.8)' },
  
  controls: { marginBottom: '20px' },
  radioGroup: { display: 'flex', justifyContent: 'center', gap: '20px' },
  radioLabel: { fontFamily: "'Cinzel', serif", fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', padding: '12px 30px', border: '1px solid', borderRadius: '4px', transition: 'all 0.3s ease', color: '#fff', backdropFilter: 'blur(5px)', textShadow: '0 2px 4px rgba(0,0,0,0.8)' },
  
  searchContainer: { marginBottom: '20px', display: 'flex', justifyContent: 'center' },
  searchInput: { width: '100%', maxWidth: '500px', padding: '12px 20px', fontSize: '16px', backgroundColor: 'rgba(15, 20, 25, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '25px', color: '#fff', fontFamily: "'Roboto Condensed', sans-serif", transition: 'all 0.3s', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' },

  heroPoolContainer: { backgroundColor: 'rgba(15, 20, 25, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', height: '400px', overflowY: 'auto', marginBottom: '30px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)' },
  heroPool: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '10px' },
  poolCard: { backgroundColor: '#000', borderRadius: '4px', cursor: 'pointer', padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 8px rgba(0,0,0,0.5)' },
  poolCardImage: { width: '100%', height: '90px', backgroundSize: 'cover', backgroundPosition: 'top' },
  poolCardName: { width: '100%', padding: '4px 2px', fontSize: '10px', fontWeight: 'bold', color: '#fff', backgroundColor: 'rgba(0, 0, 0, 0.8)', textTransform: 'uppercase', textAlign: 'center' },
  actionArea: { textAlign: 'center', marginTop: '30px' },
  
  predictButton: { fontFamily: "'Cinzel', serif", padding: '20px 60px', fontSize: '24px', fontWeight: '900', letterSpacing: '3px', backgroundColor: '#355e3b', background: 'linear-gradient(180deg, #56c271 0%, #355e3b 100%)', color: '#fff', border: '2px solid #56c271', borderRadius: '4px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.6)', textShadow: '0 2px 4px rgba(0,0,0,0.8)' },
  
  resultsCard: { marginTop: '40px', padding: '30px', backgroundColor: 'rgba(15, 20, 25, 0.9)', backdropFilter: 'blur(15px)', WebkitBackdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', boxShadow: '0 15px 40px rgba(0,0,0,0.8)' },
  resultTitle: { fontFamily: "'Cinzel', serif", textAlign: 'center', margin: '0 0 25px 0', textShadow: '0 2px 4px rgba(0,0,0,0.8)' },
  probabilityBarContainer: { display: 'flex', height: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.8)', marginBottom: '10px', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.5)' },
  probabilityBar: { transition: 'width 1s ease-in-out' },
  probabilityLabels: { display: 'flex', justifyContent: 'space-between', fontFamily: "'Cinzel', serif", fontWeight: 'bold', fontSize: '16px', marginBottom: '30px' },
  
  statsMainTitle: { fontFamily: "'Cinzel', serif", textAlign: 'center', fontSize: '20px', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '25px', marginTop: '10px', letterSpacing: '2px' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' },
  statBox: { backgroundColor: 'rgba(0, 0, 0, 0.4)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' },
  statHeader: { fontFamily: "'Cinzel', serif", margin: '0 0 20px 0', fontSize: '18px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', letterSpacing: '1px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' },
  statRow: { marginBottom: '15px' },
  statLabel: { fontSize: '13px', fontWeight: 'bold', color: '#e5e5e5', marginBottom: '5px', textTransform: 'uppercase', textShadow: '0 1px 2px rgba(0,0,0,0.8)' },
  statBarBg: { width: '100%', height: '8px', backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '4px', position: 'relative', overflow: 'hidden', border: '1px solid #111' },
  statBarFill: { height: '100%', borderRadius: '4px', transition: 'width 1s ease-in-out', boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.3)' }
};

export default DotaPredictor;