/**
 * @file LoginPage.jsx
 * @description Page de connexion avec animation de fond (symboles scolaires),
 * design responsive mobile, et support FR/EN.
 */
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import T from '../i18n/translations';

/* Symboles flottants pour l'animation de fond (remplacement emojis par formes) */
const BG_SYMBOLS = [
  /* Formes géométriques — visibilité renforcée */
  { symbol:'◆', style:{ top:'8%',  left:'5%',  fontSize:24, color:'rgba(243,156,18,.45)', animation:'drift1 12s ease-in-out infinite' } },
  { symbol:'●', style:{ top:'15%', left:'25%', fontSize:18, color:'rgba(41,128,185,.5)', animation:'drift2 15s ease-in-out infinite' } },
  { symbol:'▲', style:{ top:'35%', left:'8%',  fontSize:20, color:'rgba(255,255,255,.35)', animation:'drift3 18s ease-in-out infinite' } },
  { symbol:'■', style:{ top:'55%', left:'18%', fontSize:16, color:'rgba(243,156,18,.55)', animation:'drift4 14s ease-in-out infinite' } },
  { symbol:'◆', style:{ top:'70%', left:'5%',  fontSize:22, color:'rgba(41,128,185,.4)', animation:'drift1 16s ease-in-out infinite reverse' } },
  { symbol:'●', style:{ top:'85%', left:'22%', fontSize:30, color:'rgba(255,255,255,.25)', animation:'drift2 20s ease-in-out infinite' } },
  { symbol:'▲', style:{ top:'10%', left:'45%', fontSize:24, color:'rgba(243,156,18,.5)', animation:'drift5 13s ease-in-out infinite' } },
  { symbol:'■', style:{ top:'40%', left:'40%', fontSize:20, color:'rgba(41,128,185,.4)', animation:'drift3 17s ease-in-out infinite reverse' } },
  { symbol:'◆', style:{ top:'65%', left:'38%', fontSize:18, color:'rgba(255,255,255,.3)', animation:'drift4 19s ease-in-out infinite' } },
  { symbol:'●', style:{ top:'80%', left:'48%', fontSize:24, color:'rgba(243,156,18,.45)', animation:'drift1 11s ease-in-out infinite' } },
  { symbol:'◆', style:{ top:'20%', left:'12%', fontSize:16, color:'rgba(243,156,18,.55)', animation:'drift2 22s ease-in-out infinite' } },
  { symbol:'●', style:{ top:'50%', left:'30%', fontSize:12, color:'rgba(41,128,185,.5)', animation:'drift5 25s ease-in-out infinite reverse' } },
  { symbol:'▲', style:{ top:'75%', left:'12%', fontSize:14, color:'rgba(243,156,18,.5)', animation:'drift3 20s ease-in-out infinite' } },
  { symbol:'■', style:{ top:'30%', left:'50%', fontSize:10, color:'rgba(255,255,255,.35)', animation:'drift4 28s ease-in-out infinite' } },
];

import { Moon, Sun, Lock, GraduationCap, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, langue, toggleLangue, darkMode, toggleDarkMode, schoolSettings } = useApp();
  const t = T[langue] || T.fr;

  const [email,   setEmail]   = useState('');
  const [mdp,     setMdp]     = useState('');
  const [err,     setErr]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showMdp, setShowMdp] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const ok = await login(email, mdp);
    if (!ok) setErr(t.erreurConnexion);
    setLoading(false);
  };

  return (
    <div style={styles.page} className="login-layout">
      {/* Fond animé avec symboles scolaires */}
      <div style={styles.bgLayer} aria-hidden="true">
        {BG_SYMBOLS.map((s, i) => (
          <span key={i} style={{ ...styles.bgSymbol, ...s.style }}>{s.symbol}</span>
        ))}
        {/* Cercles décoratifs */}
        <div style={{ ...styles.decorCircle, width:300, height:300, top:'-10%', right:'-5%', opacity:.06 }} />
        <div style={{ ...styles.decorCircle, width:200, height:200, bottom:'10%', left:'5%', opacity:.04 }} />
        <div style={{ ...styles.decorCircle, width:150, height:150, top:'40%', left:'35%', opacity:.03 }} />
      </div>

      {/* Boutons langue + dark mode en haut */}
      <div style={styles.topControls}>
        <button style={styles.ctrlBtn} onClick={toggleLangue}>
          <span style={{ fontSize:10, fontWeight:700 }}>
            {langue === 'fr' ? 'EN' : 'FR'}
          </span>
        </button>
        <button style={styles.ctrlBtn} onClick={toggleDarkMode}>
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      {/* Panneau gauche — formulaire de connexion */}
      <div style={styles.left} className="login-left">
        <div style={styles.card} className="login-card">
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ ...styles.cardIcon, display: 'flex', justifyContent: 'center' }}><Lock size={36} color="#0D2B40" /></div>
            <h2 style={styles.cardTitle}>{t.connexion}</h2>
            <p style={styles.cardSub}>{t.connectezVous}</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">{t.email}</label>
              <input
                className="form-control" type="email"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.cm" required
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t.motDePasse}</label>
              <div style={{ position: 'relative', display: 'block' }}>
                <input
                  className="form-control" type={showMdp ? "text" : "password"}
                  value={mdp} onChange={e => setMdp(e.target.value)}
                  placeholder="••••••••" required
                  style={{ paddingRight: '40px', width: '100%', margin: 0 }}
                />
                <button
                  type="button"
                  onClick={() => setShowMdp(!showMdp)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0
                  }}
                  title={showMdp ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showMdp ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {err && <div style={styles.errBox}>{err}</div>}

            <button
              className="btn btn-primary btn-xl w-full"
              type="submit" disabled={loading}
              style={{ justifyContent:'center', marginTop:8 }}
            >
              {loading
                ? <span className="spinner" style={{ width:18, height:18, borderWidth:2 }} />
                : t.seConnecter
              }
            </button>
          </form>
        </div>
      </div>

      {/* Panneau droit — logo et présentation de l'école */}
      <div style={styles.right} className="login-right">
        <div style={styles.leftInner}>
          <div style={styles.logoWrap}>
            <img
              src="./src/data/logo_ecole.png"
              alt={`Logo ${schoolSettings?.nom || 'École'}`}
              style={styles.logoImg}
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
            />
            <div style={{ ...styles.logoFallback, display:'none' }}><GraduationCap size={40} color="#F39C12" /></div>
          </div>
          <h1 style={styles.schoolName}>{schoolSettings?.nom || 'École Les Étoiles'}</h1>
          <p style={styles.schoolSub}>
            {langue === 'fr'
              ? schoolSettings?.sousTitreFR || 'Primaire & Maternelle — Yaoundé, Cameroun'
              : schoolSettings?.sousTitreEN || 'Primary & Nursery School — Yaoundé, Cameroon'}
          </p>

          <div style={styles.features}>
            {(langue === 'fr'
              ? ['Gestion des élèves & classes', 'Bulletins & évaluations', 'Suivi des paiements', 'Transport scolaire', 'Messagerie intégrée']
              : ['Student & class management', 'Report cards & evaluations', 'Payment tracking', 'School transport', 'Integrated messaging']
            ).map((f, i) => (
              <div key={i} style={styles.featureItem}>
                <span style={styles.featureDot} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight:'100vh', display:'flex',
    background:'linear-gradient(135deg, #0D2B40 0%, #1B4F72 55%, #2471A3 100%)',
    position:'relative', overflow:'hidden',
  },
  bgLayer: {
    position:'absolute', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden',
  },
  bgSymbol: {
    position:'absolute', userSelect:'none', opacity:.45, filter:'blur(.3px)',
    transition:'transform 0.3s',
  },
  decorCircle: {
    position:'absolute', borderRadius:'50%',
    border:'2px solid rgba(243,156,18,.55)',
  },
  left: {
    flex:1, display:'flex', alignItems:'center', justifyContent:'center',
    padding:'60px 50px', position:'relative', zIndex:1,
  },
  leftInner: { maxWidth:480, width:'100%' },
  logoWrap:  {
    width:96, height:96, borderRadius:'50%', overflow:'hidden',
    marginBottom:24, border:'3px solid rgba(243,156,18,.4)',
    display:'flex', alignItems:'center', justifyContent:'center',
    background:'rgba(255,255,255,.1)',
  },
  logoImg:      { width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' },
  logoFallback: { fontSize:40, alignItems:'center', justifyContent:'center' },
  schoolName: {
    fontFamily:'Playfair Display, serif',
    fontSize:34, fontWeight:900, color:'white',
    lineHeight:1.1, marginBottom:8,
  },
  schoolSub:   { fontSize:14, color:'rgba(255,255,255,.55)', marginBottom:36 },
  features:    { display:'flex', flexDirection:'column', gap:11, marginBottom:36 },
  featureItem: { display:'flex', alignItems:'center', gap:12, color:'rgba(255,255,255,.8)', fontSize:14 },
  featureDot:  { width:6, height:6, borderRadius:'50%', background:'#F39C12', flexShrink:0 },

  right: {
    width:480, display:'flex', flexDirection:'column',
    alignItems:'center', justifyContent:'center',
    padding:40, background:'rgba(255,255,255,.04)',
    backdropFilter:'blur(20px)', position:'relative', zIndex:1,
  },
  topControls: {
    position:'absolute', top:20, right:20,
    display:'flex', gap:8,
  },
  ctrlBtn: {
    width:36, height:36, borderRadius:10,
    background:'rgba(255,255,255,.1)',
    border:'1px solid rgba(255,255,255,.2)',
    color:'white', cursor:'pointer', fontSize:14,
    display:'flex', alignItems:'center', justifyContent:'center',
    transition:'all .2s',
  },
  card: {
    background:'white', borderRadius:24, padding:'40px 36px',
    boxShadow:'0 25px 80px rgba(0,0,0,.3)', width:'100%', maxWidth:400,
  },
  cardIcon:  { fontSize:36, marginBottom:12 },
  cardTitle: { fontFamily:'Playfair Display, serif', fontSize:26, fontWeight:700, color:'#0D2B40' },
  cardSub:   { fontSize:14, color:'#64748B', marginTop:6 },
  errBox: {
    background:'#FEE2E2', color:'#991B1B',
    padding:'10px 14px', borderRadius:8,
    fontSize:13, marginBottom:12, border:'1px solid #FECACA',
  },
};