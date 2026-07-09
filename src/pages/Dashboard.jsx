/**
 * @file Dashboard.jsx
 * @description Tableau de bord adapté par rôle.
 * - Fondateur / Directeur : stats globales + graphiques
 * - Enseignant : stats de ses classes avec liens cliquables
 * - Parent : suivi de ses enfants
 */
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import T from '../i18n/translations';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, FileText, CreditCard, Bus, School, UserCircle, Calendar, Clock } from 'lucide-react';

const COLORS = ['#1B4F72','#2980B9','#F39C12','#27AE60','#E74C3C','#8E44AD'];

const StatCard = ({ icon, label, value, color, sub, onClick }) => (
  <div
    className="stat-card"
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : -1}
    onKeyDown={e => onClick && (e.key === 'Enter' || e.key === ' ') && onClick()}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    <div className="stat-icon" style={{ background:`${color}18` }}>
      <span style={{ fontSize:24 }}>{icon}</span>
    </div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-change up">↗ {sub}</div>}
    </div>
  </div>
);

/* ── Dashboard Parent ────────────────────────────────────────────── */
function ParentDashboard() {
  const { utilisateurActif, eleves, classes, notes, paiements, getMoyenne, langue, naviguer } = useApp();
  const t = T[langue] || T.fr;

  const mesEnfants = eleves.filter(e => e.statut === 'actif' && e.parentEmail === utilisateurActif?.email);
  const bulletinsCount = notes.filter(n => mesEnfants.some(e => e.id === n.eleveId)).length;
  const paiementsCount = paiements.filter(p => mesEnfants.some(e => e.id === p.eleveId)).length;

  return (
    <div style={S.container}>
      <div style={S.welcomeBox}>
        <h2 style={S.welcomeTitle}>{t.bonjour} {utilisateurActif?.prenom} 👋</h2>
        <p style={S.welcomeSub}>{t.suiviScolaire}</p>
      </div>

      <div style={{ ...S.statsGrid, gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))' }}>
        <StatCard icon={<Users size={24} />} label={t.enfantsScolarises} value={mesEnfants.length} color="#1B4F72" />
        <StatCard icon={<FileText size={24} />} label={t.bulletinsDisponibles} value={bulletinsCount} color="#27AE60" onClick={() => naviguer('bulletins')} />
        <StatCard icon={<CreditCard size={24} />} label={t.paiementsEffectues} value={paiementsCount} color="#F39C12" onClick={() => naviguer('paiements')} />
      </div>

      {mesEnfants.length === 0 ? (
        <div className="empty-state">
          <UserCircle size={52} color="var(--text-muted)" />
          <h3>{t.aucunEnfant}</h3>
          <p>{t.contactezDirection}</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {mesEnfants.map(enfant => {
            const cl = classes.find(c => c.id === enfant.classeId);
            const buls = notes.filter(n => n.eleveId === enfant.id);
            const dernierBul = buls[0];
            return (
              <div key={enfant.id} className="card animate-fade">
                <div className="card-header">
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <div style={S.enfantAvatar}>{enfant.prenom[0]}</div>
                    <div>
                      <h3 style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)' }}>
                        {enfant.prenom} {enfant.nom}
                      </h3>
                      <span className="badge badge-primary">{cl?.nom} — {enfant.section}</span>
                    </div>
                  </div>
                  <span className="badge badge-success">{enfant.statut}</span>
                </div>
                <div className="card-body">
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {[
                      ['Matricule', enfant.matricule],
                      ['Bus scolaire', enfant.bus ? `🚌 ${enfant.busLigne}` : 'Non'],
                      ['Bulletins', `${buls.length} disponible(s)`],
                      dernierBul ? ['Dernière moyenne', `${getMoyenne(dernierBul)}/20`] : null,
                    ].filter(Boolean).map(([label, val]) => (
                      <div key={label} style={S.infoItem}>
                        <span style={S.infoLabel}>{label}</span>
                        <span style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Dashboard Enseignant ─────────────────────────────────────────── */
function TeacherDashboard() {
  const { utilisateurActif, eleves, classes, notes, langue, naviguer, emploisDuTemps, matieres } = useApp();
  const t = T[langue] || T.fr;

  const [edtModal, setEdtModal] = useState(false);
  const [selectedClasseEdt, setSelectedClasseEdt] = useState(null);

  const mesClassesIds = utilisateurActif?.classesIds?.length
    ? utilisateurActif.classesIds
    : [utilisateurActif?.classeId].filter(Boolean);

  const mesEleves = eleves.filter(e => mesClassesIds.includes(e.classeId) && e.statut === 'actif');
  const bulletinsCount = notes.filter(n => mesEleves.some(e => e.id === n.eleveId)).length;
  const busCount = mesEleves.filter(e => e.bus).length;
  const mesClasses = classes.filter(c => mesClassesIds.includes(c.id));

  const generateTimeSlots = (config) => {
    if (!config) return [];
    const slots = [];
    let [h, m] = config.heureDebut.split(':').map(Number);
    let currentTime = h * 60 + m;

    for (let i = 0; i < config.tranches; i++) {
      const startH = Math.floor(currentTime / 60).toString().padStart(2, '0');
      const startM = (currentTime % 60).toString().padStart(2, '0');
      
      currentTime += config.dureeCours;
      const endH = Math.floor(currentTime / 60).toString().padStart(2, '0');
      const endM = (currentTime % 60).toString().padStart(2, '0');
      
      slots.push({ i, type: 'cours', label: `${startH}:${startM} - ${endH}:${endM}` });

      const pause = config.pauses.find(p => p.apresTranche === i + 1);
      if (pause) {
        const pStartH = Math.floor(currentTime / 60).toString().padStart(2, '0');
        const pStartM = (currentTime % 60).toString().padStart(2, '0');
        currentTime += pause.duree;
        const pEndH = Math.floor(currentTime / 60).toString().padStart(2, '0');
        const pEndM = (currentTime % 60).toString().padStart(2, '0');
        slots.push({ type: 'pause', label: `${pStartH}:${pStartM} - ${pEndH}:${pEndM}`, duree: pause.duree });
      }
    }
    return slots;
  };

  return (
    <div style={S.container}>
      <div style={S.welcomeBox}>
        <h2 style={S.welcomeTitle}>{t.bonjour} {utilisateurActif?.prenom} 👋</h2>
        <p style={S.welcomeSub}>
          {mesClasses.length > 0
            ? `${t.classeAssignee} ${mesClasses.map(c => c.nom).join(', ')}`
            : t.aucuneClasse}
        </p>
      </div>

      <div style={S.statsGrid}>
        <StatCard icon={<Users size={24} />} label={t.mesEleves} value={mesEleves.length} color="#1B4F72"
          onClick={() => naviguer('eleves')} />
        <StatCard icon={<FileText size={24} />} label={t.bulletinsSaisis} value={bulletinsCount} color="#27AE60"
          onClick={() => naviguer('bulletins')} />
        <StatCard icon={<Bus size={24} />} label={t.elevesEnBus} value={busCount} color="#F39C12" onClick={() => naviguer('transport')} />
      </div>

      {mesClasses.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header"><h3 className="card-title"><Calendar size={20} /> {t.emploiDuTemps}</h3></div>
          <div className="card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {mesClasses.map(c => (
              <button key={c.id} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8, borderColor: 'var(--border-color)' }} onClick={() => {
                setSelectedClasseEdt(c);
                setEdtModal(true);
              }}>
                <Clock size={16} /> {t.emploiDuTemps} {c.nom}
              </button>
            ))}
          </div>
        </div>
      )}

      {edtModal && selectedClasseEdt && (
        <div className="modal-overlay" onClick={() => setEdtModal(false)}>
          <div className="modal" style={{ maxWidth: 1000, width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="card-title">{t.emploiDuTempsDe} {selectedClasseEdt.nom}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setEdtModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ overflowY: 'auto', padding: 20 }}>
              {(() => {
                const config = emploisDuTemps.find(e => e.classeId === selectedClasseEdt.id);
                if (!config) {
                  return (
                    <div className="empty-state">
                      <Calendar size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                      <h3>{t.aucunEmploiTemps}</h3>
                      <p>{t.aucunEmploiTempsDesc}</p>
                    </div>
                  );
                }
                return (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table" style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ background: 'var(--gray-50)', padding: '10px' }}>{t.horaire}</th>
                          {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map(d => <th key={d} style={{ background: 'var(--primary)', color: 'white', padding: '10px', textAlign: 'center' }}>{d}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {generateTimeSlots(config).map((slot, sIdx) => (
                          <tr key={sIdx} style={slot.type === 'pause' ? { background: '#f8f9fa' } : {}}>
                            <td style={{ padding: '10px', fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>
                              {slot.label}
                              {slot.type === 'pause' && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.pause} ({slot.duree} min)</div>}
                            </td>
                            {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map(d => {
                              const matiereId = config.grille[d]?.[slot.i];
                              const matiere = matieres.find(m => m.id === matiereId);
                              return (
                                <td key={d} style={{ borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: 6, textAlign: 'center' }}>
                                  {slot.type === 'pause' ? (
                                    <span style={{ color: '#adb5bd', fontStyle: 'italic', fontSize: 13 }}>-- {t.pause} --</span>
                                  ) : (
                                    <div style={{ padding: '6px', fontSize: 13, fontWeight: matiere ? 600 : 400, color: matiere ? 'var(--text-primary)' : 'var(--text-muted)', background: matiere ? '#f0f4ff' : 'transparent', borderRadius: 4 }}>
                                      {matiere ? matiere.nom : '-'}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setEdtModal(false)}>{t.fermer}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Dashboard Admin / Fondateur / Directeur ──────────────────────── */
function AdminDashboard() {
  const { utilisateurActif, eleves, classes, paiements, notes, getMoyenne, langue, naviguer } = useApp();
  const t = T[langue] || T.fr;

  const actifs = eleves.filter(e => e.statut === 'actif');
  const totalPaye = paiements.filter(p => p.statut === 'payé').reduce((s, p) => s + (p.montant||0), 0);
  const busEleves = actifs.filter(e => e.bus).length;

  const elevesParSection = [
    { name:'Francophone', value: actifs.filter(e => e.section === 'francophone').length },
    { name:'Anglophone',  value: actifs.filter(e => e.section === 'anglophone').length },
    { name:'Bilingue',    value: actifs.filter(e => e.section === 'bilingue').length },
  ];
  const elevesParNiveau = classes
    .map(c => ({ name:c.niveau, eleves: eleves.filter(e => e.classeId === c.id && e.statut === 'actif').length }))
    .filter(c => c.eleves > 0);

  const derniersPaiements = [...paiements].reverse().slice(0, 5);

  return (
    <div style={S.container}>
      <div style={{ ...S.welcomeBox, background:'linear-gradient(135deg, #1B4F72 0%, #2980B9 100%)', borderRadius:16, padding:'28px 32px', boxShadow: '0 4px 15px rgba(41, 128, 185, 0.2)' }}>
        <div>
          <h2 style={{ ...S.welcomeTitle, color:'white' }}>
            {t.bienvenue?.replace('!','')} {utilisateurActif?.prenom}! 🎉
          </h2>
          <p style={{ ...S.welcomeSub, color:'rgba(255,255,255,.7)' }}>
            {t.vueEnsemble} — {t.anneeEn} 2025-2026
          </p>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:8 }}>
          <button className="btn btn-accent btn-sm" onClick={() => naviguer('eleves')}>
            + {langue === 'fr' ? 'Inscrire un élève' : 'Enroll Student'}
          </button>
          <button className="btn btn-sm" style={{ background:'rgba(255,255,255,.15)', color:'white', border:'1px solid rgba(255,255,255,.2)' }}
            onClick={() => naviguer('bulletins')}>
            📋 {t.bulletins}
          </button>
        </div>
      </div>

      <div style={S.statsGrid}>
        <StatCard icon={<Users size={24} />} label={t.elevesInscrits} value={actifs.length} color="#1B4F72" sub="Actifs" onClick={() => naviguer('eleves')} />
        <StatCard icon={<School size={24} />} label={t.classes} value={classes.length} color="#2980B9" onClick={() => naviguer('classes')} />
        <StatCard icon={<CreditCard size={24} />} label={t.recettes} value={totalPaye.toLocaleString('fr')} color="#F39C12" sub="Encaissé" onClick={() => naviguer('paiements')} />
        <StatCard icon={<Bus size={24} />} label={t.elevesEnBus} value={busEleves} color="#27AE60" onClick={() => naviguer('transport')} />
      </div>

      <div style={S.chartsGrid}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">{t.elevesParNiveau}</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={elevesParNiveau} barSize={32}>
                <XAxis dataKey="name" tick={{ fontSize:11, fill:'var(--text-secondary)' }} />
                <YAxis tick={{ fontSize:11, fill:'var(--text-secondary)' }} />
                <Tooltip contentStyle={{ borderRadius:8, fontSize:13 }} />
                <Bar dataKey="eleves" fill="#1B4F72" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">{t.repartitionSection}</h3></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={elevesParSection} cx="50%" cy="50%" outerRadius={70} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {elevesParSection.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{t.derniersPaiements}</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => naviguer('paiements')}>{t.voirTout}</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t.recu}</th><th>{t.type}</th>
                <th>{t.montant}</th><th>{t.date}</th><th>{t.statut}</th>
              </tr>
            </thead>
            <tbody>
              {derniersPaiements.length === 0
                ? <tr><td colSpan={5} style={{ textAlign:'center', padding:32, color:'var(--text-muted)' }}>{t.aucunPaiement}</td></tr>
                : derniersPaiements.map(p => (
                  <tr key={p.id}>
                    <td><code style={{ fontSize:11, background:'var(--gray-100)', padding:'2px 8px', borderRadius:4, color:'var(--text-primary)' }}>{p.recu}</code></td>
                    <td style={{ textTransform:'capitalize' }}>{p.type}</td>
                    <td><strong style={{ color:'var(--success)' }}>{(p.montant||0).toLocaleString('fr')} FCFA</strong></td>
                    <td>{p.date}</td>
                    <td><span className={`badge ${p.statut==='payé'?'badge-success':'badge-warning'}`}>{p.statut}</span></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Composant principal ──────────────────────────────────────────── */
export default function Dashboard() {
  const { utilisateurActif } = useApp();
  if (!utilisateurActif) return null;
  const role = utilisateurActif.role;
  if (role === 'parent')    return <ParentDashboard />;
  if (role === 'enseignant') return <TeacherDashboard />;
  return <AdminDashboard />;
}

const S = {
  container:    { padding:28, display:'flex', flexDirection:'column', gap:20 },
  welcomeBox:   { background:'var(--bg-card)', borderRadius:16, padding:'24px 28px', border:'1px solid var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 },
  welcomeTitle: { fontFamily:'Playfair Display,serif', fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:4 },
  welcomeSub:   { fontSize:14, color:'var(--text-secondary)' },
  statsGrid:    { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 },
  chartsGrid:   { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
  enfantAvatar: { width:44, height:44, borderRadius:'50%', background:'var(--primary)', color:'white', fontWeight:700, fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  infoItem:     { background:'var(--gray-50)', borderRadius:8, padding:'10px 12px', display:'flex', flexDirection:'column', gap:3 },
  infoLabel:    { fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:.5 },
};