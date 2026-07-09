/**
 * @file ElevesPage.jsx
 * @description Gestion des élèves avec formulaire enrichi (père/mère/tuteur),
 * lieu de naissance via liste déroulante des villes camerounaises,
 * filtrage par rôle, dark mode et i18n.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import T from '../i18n/translations';
import VILLES from '../data/villesCameroun';
import { 
  Users, UserPlus, Bus, School, BookOpen, Star, FileEdit, Trash2, Camera, User, Phone, Mail,
  ShieldAlert, AlertTriangle, PlusCircle, GraduationCap
} from 'lucide-react';

const INCIDENT_TYPES = [
  { type: 'Absence', points: 1 },
  { type: 'Retard', points: 1 },
  { type: 'Injures', points: 5 },
  { type: 'Vandalisme', points: 8 },
  { type: 'Bagarre', points: 10 },
  { type: 'Vol', points: 20 },
];

export const STUDENT_STYLES = {
  container:     { padding:28, display:'flex', flexDirection:'column', gap:20 },
  topBar:        { display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', justifyContent:'space-between' },
  counter:       { fontSize:13, color:'var(--text-secondary)', fontWeight:500 },
  grid:          { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 },
  eleveHeader:   { padding:'18px 18px 12px', display:'flex', gap:14, alignItems:'flex-start' },
  elevePhotoWrap:{ position:'relative', flexShrink:0 },
  elevePhoto:    { width:56, height:56, borderRadius:'50%', objectFit:'cover', border:'2px solid var(--bg-card)', boxShadow:'0 2px 8px rgba(0,0,0,.12)' },
  eleveInitials: { width:56, height:56, borderRadius:'50%', background:'var(--primary)', color:'white', fontWeight:700, fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' },
  busBadge:      { position:'absolute', bottom:-2, right:-2, fontSize:12, background:'white', borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 4px rgba(0,0,0,.15)' },
  eleveName:     { fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:4 },
  eleveBody:     { padding:'0 18px 14px' },
  eleveMeta:     { fontSize:13, color:'var(--text-secondary)', display:'flex', flexDirection:'column', gap:4 },
  eleveActions:  { borderTop:'1px solid var(--border-color)', padding:'10px 18px', display:'flex', gap:8, background:'var(--bg-app)', borderBottomLeftRadius:12, borderBottomRightRadius:12 },
  modalTitle:    { fontSize:20, fontWeight:700, color:'var(--text-primary)', margin:0 },
  viewPhoto:     { width:90, height:90, borderRadius:'50%', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 12px rgba(0,0,0,.1)' },
  detailGrid:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, background:'var(--gray-50)', padding:16, borderRadius:12 },
  detailItem:    { display:'flex', flexDirection:'column', gap:4 },
  detailLabel:   { fontSize:12, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase' },
  detailVal:     { fontSize:14, color:'var(--text-primary)', fontWeight:500 },
  formGrid:      { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 },
  sectionTitle:  { fontSize:14, fontWeight:700, textTransform:'uppercase', color:'var(--text-secondary)', marginTop:24, marginBottom:16, display:'flex', alignItems:'center' },
  errBox:        { background:'#FEF2F2', color:'#DC2626', padding:'12px 16px', borderRadius:8, fontSize:14, marginBottom:16, border:'1px solid #FCA5A5' }
};

const SECTIONS = ['francophone','anglophone','bilingue'];

export function StudentProfileModal({ 
  selected, setModal, viewTab, setViewTab, t, peutEditerDiscipline, role, isFondateur, 
  newIncident, setNewIncident, handleAddIncident, peutModifier, openEdit, getClasse 
}) {
  const S = STUDENT_STYLES;
  return (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth:600, width:'min(92vw, 600px)', maxHeight:'88vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={S.modalTitle}>{t.dossierEleve}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:24 }}>
                <div style={S.viewPhoto}>
                  {selected.photo
                    ? <img src={selected.photo} alt={selected.prenom} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
                    : <span style={{ fontSize:32, fontWeight:700, color:'white' }}>{selected.prenom[0]}{selected.nom[0]}</span>}
                </div>
                <div>
                  <h2 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)' }}>{selected.prenom} {selected.nom}</h2>
                  <div style={{ display:'flex', gap:8, marginTop:6, flexWrap:'wrap' }}>
                    <span className="badge badge-primary">{selected.matricule}</span>
                    <span className="badge badge-gray">{selected.section}</span>
                    <span className="badge badge-success">{selected.statut}</span>
                    {selected.bus && <span className="badge badge-warning"><Bus size={12}/> Bus</span>}
                  </div>
                </div>
              </div>

              <div className="pill-tabs" style={{ marginBottom: 16 }}>
                <button className={`pill-tab ${viewTab==='infos'?'active':''}`} onClick={() => setViewTab('infos')}>Informations</button>
                {(peutEditerDiscipline(selected?.id) || ['directeur','fondateur','parent'].includes(role)) && (
                  <button className={`pill-tab ${viewTab==='discipline'?'active':''}`} onClick={() => setViewTab('discipline')}>Discipline</button>
                )}
              </div>

              {viewTab === 'infos' && (
                <>
                  <div style={S.detailGrid}>
                    {[
                      [t.classe,         getClasse(selected.classeId)?.nom],
                      [t.dateNaissance,  selected.dateNaissance],
                      [t.lieuNaissance,  selected.lieuNaissance],
                      [t.sexe,           selected.sexe === 'M' ? t.masculin : t.feminin],
                      [t.adresse,        selected.adresse],
                      [t.dateInscription,selected.dateInscription ? new Date(selected.dateInscription).toLocaleDateString('fr-FR') : null],
                      [t.anneeScolaire,  selected.anneeScolaire],
                    ].filter(([,v]) => v).map(([label,val]) => (
                      <div key={label} style={S.detailItem}>
                        <span style={S.detailLabel}>{label}</span>
                        <span style={S.detailVal}>{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Contacts parents */}
                  {[
                    { titre: t.pere, nom: selected.nomPere, tel: selected.telephonePere, tel2: selected.telephonePere2, email: selected.emailPere },
                    { titre: t.mere, nom: selected.nomMere, tel: selected.telephoneMere, tel2: selected.telephoneMere2, email: selected.emailMere },
                    { titre: t.tuteur, nom: selected.nomTuteur, tel: selected.telephoneTuteur, tel2: selected.telephoneTuteur2, email: selected.emailTuteur },
                  ].filter(p => p.nom).map(p => (
                    <div key={p.titre} style={{ marginTop:12, background:'var(--gray-50)', borderRadius:10, padding:'12px 16px' }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', marginBottom:6 }}>{p.titre}</div>
                      <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)' }}>{p.nom}</div>
                      {p.tel  && <div style={{ fontSize:13, color:'var(--text-secondary)', display:'flex', gap:6, alignItems:'center', marginTop:4 }}><Phone size={14}/> {p.tel}</div>}
                      {p.tel2 && <div style={{ fontSize:13, color:'var(--text-secondary)', display:'flex', gap:6, alignItems:'center', marginTop:2 }}><Phone size={14}/> {p.tel2}</div>}
                      {p.email && <div style={{ fontSize:13, color:'var(--text-secondary)', display:'flex', gap:6, alignItems:'center', marginTop:2 }}><Mail size={14}/> {p.email}</div>}
                    </div>
                  ))}
                </>
              )}

              {viewTab === 'discipline' && (
                <div>
                  {(() => {
                    const incidents = selected.incidents || [];
                    const totalPoints = incidents.reduce((s, i) => s + i.points, 0);
                    
                    return (
                      <>
                        {totalPoints >= 50 && (
                          <div style={{ display:'flex', alignItems:'center', gap:14, background:'linear-gradient(135deg, #FEF2F2, #FEE2E2)', color:'#991B1B', border:'2px solid #F87171', borderRadius:12, padding:'16px 20px', marginBottom:12, animation:'pulse 2s infinite' }}>
                            <AlertTriangle size={28} color="#DC2626" />
                            <div>
                              <strong style={{ fontSize:15, display:'block', marginBottom:4 }}>Alerte Discipline — Convocation Parentale Requise</strong>
                              <span style={{ fontSize:13, lineHeight:1.5 }}>L'élève a accumulé <strong>{totalPoints} points</strong> de mauvaise conduite (seuil : 50). Veuillez <strong>convoquer le parent/tuteur</strong> de cet élève pour un entretien disciplinaire.</span>
                              {selected.parentTel && (
                                <div style={{ marginTop:8, fontSize:12, background:'white', padding:'6px 12px', borderRadius:8, display:'inline-flex', alignItems:'center', gap:6 }}>
                                  <Phone size={13}/> Contact parent : <strong>{selected.parentTel}</strong>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div style={{ background:'var(--gray-50)', padding:16, borderRadius:12, display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                          <div>
                            <div style={{ fontSize:12, color:'var(--text-secondary)', textTransform:'uppercase', fontWeight:700 }}>Total Points</div>
                            <div style={{ fontSize:24, fontWeight:800, color: totalPoints >= 50 ? 'var(--danger)' : 'var(--primary)' }}>{totalPoints} pts</div>
                          </div>
                          <ShieldAlert size={32} color={totalPoints >= 50 ? 'var(--danger)' : 'var(--gray-400)'} />
                        </div>

                        <h4 style={{ fontSize:14, marginBottom:12, color:'var(--text-primary)' }}>Historique des incidents</h4>
                        {incidents.length === 0 ? (
                          <div style={{ padding:20, textAlign:'center', color:'var(--text-muted)', fontSize:14, background:'var(--bg-app)', borderRadius:8 }}>
                            Aucun incident enregistré.
                          </div>
                        ) : (
                          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                            {incidents.map(i => (
                              <div key={i.id} style={{ display:'flex', justifyContent:'space-between', background:'var(--bg-card)', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border-color)' }}>
                                <div>
                                  <div style={{ fontWeight:600, fontSize:14 }}>{i.type}</div>
                                  <div style={{ fontSize:12, color:'var(--text-secondary)' }}>{new Date(i.date).toLocaleDateString('fr-FR')}</div>
                                </div>
                                <div className="badge badge-danger" style={{ height:'fit-content' }}>+{i.points} pts</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {peutEditerDiscipline(selected?.id) && !isFondateur && role !== 'parent' && (
                          <div style={{ marginTop:24, padding:16, background:'var(--gray-100)', borderRadius:12, border:'1px solid var(--border-color)' }}>
                            <h4 style={{ fontSize:13, textTransform:'uppercase', marginBottom:12, color:'var(--text-secondary)', fontWeight:700 }}>Signaler un comportement</h4>
                            <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
                              <div className="form-group" style={{ marginBottom:0, flex:1 }}>
                                <label className="form-label">Type d'incident</label>
                                <select className="form-control" value={newIncident.type} onChange={e => setNewIncident({...newIncident, type:e.target.value})}>
                                  {INCIDENT_TYPES.map(it => <option key={it.type} value={it.type}>{it.type} (+{it.points} pts)</option>)}
                                </select>
                              </div>
                              <div className="form-group" style={{ marginBottom:0, flex:1 }}>
                                <label className="form-label">Date</label>
                                <input type="date" className="form-control" value={newIncident.date} onChange={e => setNewIncident({...newIncident, date:e.target.value})} />
                              </div>
                              <button className="btn btn-primary" onClick={handleAddIncident}><PlusCircle size={16} /> Ajouter</button>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
            <div className="modal-footer">
              {peutModifier && !isFondateur && viewTab === 'infos' && (
                <button className="btn btn-primary" onClick={() => openEdit ? openEdit(selected) : null}>
                  <FileEdit size={16} style={{marginRight:4}} /> {t.modifier}
                </button>
              )}
              {peutEditerDiscipline(selected?.id) && !isFondateur && viewTab === 'discipline' && (
                <span style={{ fontSize: 12, color: 'var(--success)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Vous pouvez modifier la discipline de cet élève.
                </span>
              )}
              {role === 'parent' && viewTab === 'discipline' && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Consultation uniquement — contactez l'enseignant pour toute question.
                </span>
              )}
              {!peutEditerDiscipline(selected?.id) && viewTab === 'discipline' && !['admin','parent'].includes(role) && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Seul l'enseignant de cet élève peut modifier la discipline.
                </span>
              )}
            </div>
          </div>
        </div>
  );
}

export default function ElevesPage({ initialTab = null }) {
  const {
    eleves, classes, utilisateurActif,
    ajouterEleve, modifierEleve, supprimerEleve, restaurerEleve,
    getBulletins, getMoyenne, langue,
    peutInscrireEleve, peutEditerDiscipline,
    navParam, setNavParam,
  } = useApp();
  const t = T[langue] || T.fr;

  const [modal,       setModal]       = useState(null);
  const [selected,    setSelected]    = useState(null);
  const [search,      setSearch]      = useState('');
  const [filtreClasse,setFiltreClasse]= useState('');
  const [filtreSection,setFiltreSection] = useState('');
  const [form,        setForm]        = useState({});
  const [photo,       setPhoto]       = useState(null);
  const [tabParent,   setTabParent]   = useState('pere'); // 'pere'|'mere'|'tuteur'
  const [roleParent,  setRoleParent]  = useState('');    // rôle obligatoire: 'pere'|'mere'|'tuteur'
  const [viewTab,     setViewTab]     = useState('infos'); // 'infos'|'discipline'
  const [newIncident, setNewIncident] = useState({ type: 'Absence', date: new Date().toISOString().slice(0,10) });
  const [errMsg,      setErrMsg]      = useState('');
  const fileRef = useRef();

  // Navigation depuis la gestion des classes
  useEffect(() => {
    if (navParam?.classeId) {
      setFiltreClasse(navParam.classeId);
      const cl = classes.find(c => c.id === navParam.classeId);
      if (cl) setFiltreSection(cl.section);
      setNavParam(null);
    }
  }, [navParam, setNavParam, classes]);

  const role       = utilisateurActif?.role;
  const isFondateur = role === 'fondateur';
  // Peut inscrire / modifier un élève (infos générales) — PAS le fondateur
  const peutModifier = peutInscrireEleve() && !isFondateur;
  // Peut accéder au dossier (lecture + discipline)
  const peutVoirDossier = ['directeur','fondateur','enseignant','admin','parent'].includes(role);

  /* ── Filtrage des élèves ─────────────────────────────── */
  const isAdmin = role === 'admin';
  // Admin voit tout (actifs + archivés) ; les autres ne voient que les actifs
  const baseEleves = isAdmin ? eleves : eleves.filter(e => e.statut === 'actif');
  const filtered = baseEleves.filter(e => {
    const q = search.toLowerCase();
    const matchQ = !q || e.nom.toLowerCase().includes(q) || e.prenom.toLowerCase().includes(q) || (e.matricule||'').toLowerCase().includes(q);
    const matchC = !filtreClasse  || e.classeId === filtreClasse;
    const matchS = !filtreSection || e.section === filtreSection;
    // Parent : uniquement ses enfants
    const matchP = role !== 'parent' || e.parentEmail === utilisateurActif?.email;
    // Enseignant : uniquement ses classes
    const mesClassesIds = utilisateurActif?.classesIds?.length
      ? utilisateurActif.classesIds : [utilisateurActif?.classeId].filter(Boolean);
    const matchE = role !== 'enseignant' || mesClassesIds.includes(e.classeId);
    return matchQ && matchC && matchS && matchP && matchE;
  });

  /* ── Ouverture des modals ───────────────────────────── */
  const openAdd = () => {
    setForm({ section:'francophone', sexe:'M', bus:false, statut:'actif' });
    setPhoto(null); setErrMsg(''); setTabParent('pere'); setRoleParent(''); setModal('add');
  };
  const openView = (e, forceTab = null)  => {
    setSelected(e);
    // Si on arrive depuis la sidebar Discipline ou le bouton discipline → onglet discipline directement
    setViewTab(forceTab || (initialTab === 'discipline' ? 'discipline' : 'infos'));
    setModal('view');
  };
  const openEdit = (e) => {
    setSelected(e); setForm({...e}); setPhoto(e.photo);
    const rolePrincipal = e.roleParent || (e.nomPere?.trim() ? 'pere' : e.nomMere?.trim() ? 'mere' : e.nomTuteur?.trim() ? 'tuteur' : '');
    setErrMsg(''); setTabParent(rolePrincipal || 'pere'); setRoleParent(rolePrincipal); setModal('edit');
  };

  /* ── Photo ──────────────────────────────────────────── */
  const handlePhoto = ev => {
    const f = ev.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev2 => setPhoto(ev2.target.result);
    reader.readAsDataURL(f);
  };

  /* ── Validation & soumission ─────────────────────────── */
  const handleSubmit = () => {
    // 1. Rôle du parent principal obligatoire
    if (!roleParent) {
      setErrMsg(t.selectionnezRoleParent);
      return;
    }
    // 2. Vérifier que les champs du rôle choisi sont remplis
    if (roleParent === 'pere' && !form.nomPere?.trim()) {
      setErrMsg(t.erreurPereRequis); setTabParent('pere'); return;
    }
    if (roleParent === 'mere' && !form.nomMere?.trim()) {
      setErrMsg(t.erreurMereRequis); setTabParent('mere'); return;
    }
    if (roleParent === 'tuteur' && !form.nomTuteur?.trim()) {
      setErrMsg(t.erreurTuteurRequis); setTabParent('tuteur'); return;
    }
    // Email parent principal déterminé par le rôle sélectionné
    const parentEmail = roleParent === 'pere' ? (form.emailPere || '') :
                        roleParent === 'mere' ? (form.emailMere || '') :
                        (form.emailTuteur || '');
    const parentNom   = roleParent === 'pere' ? (form.nomPere || '') :
                        roleParent === 'mere' ? (form.nomMere || '') :
                        (form.nomTuteur || '');
    const parentTel   = roleParent === 'pere' ? (form.telephonePere || '') :
                        roleParent === 'mere' ? (form.telephoneMere || '') :
                        (form.telephoneTuteur || '');
    const data = { ...form, photo, parentEmail, parentNom, parentTel, roleParent };
    if (modal === 'add') ajouterEleve(data);
    else modifierEleve(selected.id, data);
    setModal(null);
  };


  const handleAddIncident = () => {
    if (!newIncident.type || !newIncident.date) return;
    const pts = INCIDENT_TYPES.find(i => i.type === newIncident.type)?.points || 0;
    const incident = { ...newIncident, points: pts, id: Date.now().toString() };
    const updatedIncidents = [...(selected.incidents || []), incident];
    
    modifierEleve(selected.id, { incidents: updatedIncidents });
    setSelected({ ...selected, incidents: updatedIncidents });
  };

  const getClasse = id => classes.find(c => c.id === id);

  /* ════════════════════════════════════════════════════════ RENDU */
  return (
    <div style={S.container}>
      {/* Le bandeau discipline a été supprimé — navigation directe */}
      {/* Barre de recherche + filtres */}
      <div style={S.topBar}>
        <div style={{ display:'flex', gap:10, flex:1, flexWrap:'wrap' }}>
          <input className="form-control" placeholder={t.rechercherEleve}
            value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth:240 }} />
          <select className="form-control" value={filtreClasse} onChange={e => setFiltreClasse(e.target.value)} style={{ maxWidth:180 }}>
            <option value="">{t.toutesClasses}</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <select className="form-control" value={filtreSection} onChange={e => setFiltreSection(e.target.value)} style={{ maxWidth:160 }}>
            <option value="">{t.toutesSections}</option>
            {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {peutModifier && (
          <button className="btn btn-primary" onClick={openAdd}><UserPlus size={16} /> {t.inscrire}</button>
        )}
      </div>

      <div className="card" style={{ padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap' }}>
        <div>
          <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:1 }}>
            {role === 'parent' ? 'Dossier scolaire' : 'Gestion des dossiers'}
          </div>
          <div style={{ fontSize:18, fontWeight:700, color:'var(--text-primary)' }}>
            {role === 'parent' ? 'Suivi de vos enfants' : 'Élèves et discipline'}
          </div>
          <div style={{ fontSize:13, color:'var(--text-secondary)', marginTop:4 }}>
            {role === 'parent'
              ? 'Consultez les informations, la discipline et le suivi scolaire de chaque enfant.'
              : 'Gérez les informations de chaque élève, leur discipline et les accès depuis une vue claire.'}
          </div>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <span className="badge badge-primary">{filtered.length} {t.eleveTrouve}</span>
          {role === 'parent' && <span className="badge badge-success">{filtered.filter(e => e.statut === 'actif').length} actif(s)</span>}
        </div>
      </div>

      <div style={S.counter}>{filtered.length} {t.eleveTrouve}</div>

      {/* Grille élèves */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <Users size={52} color="var(--text-muted)" />
          <h3>{t.aucunEleve}</h3>
          <p>{t.modifiezRecherche}</p>
          {peutModifier && <button className="btn btn-primary" onClick={openAdd}><UserPlus size={16} /> {t.inscrire}</button>}
        </div>
      ) : (() => {
        const SECTION_COLORS = { francophone: '#1B4F72', anglophone: '#27AE60', bilingue: '#8E44AD' };

        // Regrouper par classeId, dans l'ordre des classes
        const groupes = classes
          .map(c => ({
            classe: c,
            eleves: filtered.filter(e => e.classeId === c.id),
          }))
          .filter(g => g.eleves.length > 0);

        // Élèves sans classe assignée
        const sansCLasse = filtered.filter(e => !e.classeId || !classes.find(c => c.id === e.classeId));

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {groupes.map(({ classe, eleves: elevesGroupe }) => {
              const color = SECTION_COLORS[classe.section] || 'var(--primary)';
              return (
                <div key={classe.id}>
                  {/* En-tête de classe */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, padding: '10px 18px', background: color + '10', borderRadius: 12, border: `1.5px solid ${color}25` }}>
                    <School size={16} color={color} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color }}>{classe.nom}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 10 }}>{classe.section} · {classe.annee}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, background: color + '18', color, padding: '3px 10px', borderRadius: 20 }}>
                      {elevesGroupe.length} élève{elevesGroupe.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Grille des élèves de cette classe */}
                  <div style={S.grid}>
                    {elevesGroupe.map(eleve => {
                      const cl = getClasse(eleve.classeId);
                      const buls = getBulletins(eleve.id);
                      const dernierBul = buls[buls.length - 1];
                      const estArchive = eleve.statut === 'archive';
                      return (
                        <div key={eleve.id} className="card animate-fade" style={{ cursor: 'pointer', borderTop: `3px solid ${estArchive ? '#9CA3AF' : color}`, opacity: estArchive ? 0.65 : 1, background: estArchive ? 'var(--gray-50)' : 'var(--bg-card)' }} onClick={() => !estArchive && openView(eleve)}>
                          <div style={S.eleveHeader}>
                            <div style={S.elevePhotoWrap}>
                              {eleve.photo
                                ? <img src={eleve.photo} alt={eleve.prenom} style={S.elevePhoto} />
                                : <div style={{ ...S.eleveInitials, background: estArchive ? '#9CA3AF' : 'var(--primary)' }}>{eleve.prenom[0]}{eleve.nom[0]}</div>}
                              {eleve.bus && !estArchive && <span style={S.busBadge}><Bus size={12} color="#F39C12" /></span>}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h3 style={{ ...S.eleveName, textDecoration: estArchive ? 'line-through' : 'none', color: estArchive ? 'var(--text-muted)' : 'var(--text-primary)' }}>{eleve.prenom} {eleve.nom}</h3>
                              <span className="badge badge-gray">{eleve.matricule}</span>
                              {estArchive && <span style={{ background: '#6B7280', color: 'white', borderRadius: 4, padding: '2px 7px', fontSize: 11, fontWeight: 700, marginLeft: 6 }}>Archivé</span>}
                            </div>
                          </div>
                          {!estArchive && (
                            <div style={S.eleveBody}>
                              <div style={S.eleveMeta}>
                                <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><BookOpen size={12} /> {eleve.section}</span>
                                {dernierBul && <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Star size={12} /> Moy: <strong>{getMoyenne(dernierBul)}/20</strong></span>}
                              </div>
                            </div>
                          )}
                          <div style={S.eleveActions} onClick={e => e.stopPropagation()}>
                            {estArchive ? (
                              // Archivé : seul l'admin peut restaurer
                              isAdmin && (
                                <button className="btn btn-sm" style={{ background: '#16A34A', color: 'white', border: 'none', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => restaurerEleve(eleve.id)}>
                                  ↩ Restaurer
                                </button>
                              )
                            ) : (
                              // Actif : boutons normaux
                              <>
                                {peutModifier && (
                                  <>
                                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(eleve)}><FileEdit size={14} style={{ marginRight: 4 }} /> {t.modifier?.replace('✏️ ', '')}</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => supprimerEleve(eleve.id)}><Trash2 size={14} /></button>
                                  </>
                                )}
                                {role === 'enseignant' && !peutModifier && (
                                  <button className="btn btn-ghost btn-sm" onClick={() => openView(eleve, 'discipline')}><ShieldAlert size={14} style={{ marginRight: 4 }} /> Discipline</button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Élèves sans classe */}
            {sansCLasse.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, padding: '10px 18px', background: 'var(--gray-100)', borderRadius: 12, border: '1.5px solid var(--border-color)' }}>
                  <School size={16} color="var(--text-muted)" />
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-muted)' }}>Sans classe assignée</span>
                  <span style={{ fontSize: 12, fontWeight: 600, background: 'var(--gray-200)', color: 'var(--text-secondary)', padding: '3px 10px', borderRadius: 20, marginLeft: 'auto' }}>{sansCLasse.length}</span>
                </div>
                <div style={S.grid}>
                  {sansCLasse.map(eleve => {
                    const buls = getBulletins(eleve.id);
                    const dernierBul = buls[buls.length - 1];
                    return (
                      <div key={eleve.id} className="card animate-fade" style={{ cursor: 'pointer' }} onClick={() => openView(eleve)}>
                        <div style={S.eleveHeader}>
                          <div style={S.elevePhotoWrap}>
                            {eleve.photo ? <img src={eleve.photo} alt={eleve.prenom} style={S.elevePhoto} /> : <div style={S.eleveInitials}>{eleve.prenom[0]}{eleve.nom[0]}</div>}
                            {eleve.bus && <span style={S.busBadge}><Bus size={12} color="#F39C12" /></span>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={S.eleveName}>{eleve.prenom} {eleve.nom}</h3>
                            <span className="badge badge-gray">{eleve.matricule}</span>
                          </div>
                        </div>
                        <div style={S.eleveBody}>
                          <div style={S.eleveMeta}>
                            <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><BookOpen size={12} /> {eleve.section}</span>
                            {dernierBul && <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}><Star size={12} /> Moy: <strong>{getMoyenne(dernierBul)}/20</strong></span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ══ MODAL AJOUT / EDIT ══ */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth:680 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={S.modalTitle}>
                {modal === 'add' ? `+ ${t.inscrireAction?.replace('✅ ','')}` : t.modifier}
              </h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Photo */}
              <div style={{ display:'flex', justifyContent:'center', marginBottom:24 }}>
                <div className="photo-upload" onClick={() => fileRef.current?.click()}>
                  {photo
                    ? <img src={photo} alt="photo" />
                    : <div style={{ textAlign:'center' }}>
                        <Camera size={32} color="var(--text-muted)" style={{ margin: '0 auto' }} />
                        <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{t.photo}</div>
                      </div>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhoto} />
              </div>

              {/* Infos élève */}
              <div style={S.sectionTitle}><GraduationCap size={14} style={{marginRight:6}}/>{langue === 'fr' ? 'Informations de l\'élève' : 'Student Information'}</div>
              <div style={S.formGrid}>
                <div className="form-group">
                  <label className="form-label">{t.nom} *</label>
                  <input className="form-control" value={form.nom||''} onChange={e => setForm({...form, nom:e.target.value})} placeholder="NOM" />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.prenom} *</label>
                  <input className="form-control" value={form.prenom||''} onChange={e => setForm({...form, prenom:e.target.value})} placeholder="Prénom(s)" />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.dateNaissance} *</label>
                  <input className="form-control" type="date" value={form.dateNaissance||''} onChange={e => setForm({...form, dateNaissance:e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t.lieuNaissance}</label>
                  <input className="form-control" list="villes-list" value={form.lieuNaissance||''} onChange={e => setForm({...form, lieuNaissance:e.target.value})} placeholder={t.choisir} />
                  <datalist id="villes-list">
                    {VILLES.map(v => <option key={v} value={v} />)}
                  </datalist>
                </div>
                <div className="form-group">
                  <label className="form-label">{t.sexe}</label>
                  <select className="form-control" value={form.sexe||'M'} onChange={e => setForm({...form, sexe:e.target.value})}>
                    <option value="M">{t.masculin}</option>
                    <option value="F">{t.feminin}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t.section} *</label>
                  <select className="form-control" value={form.section||''} onChange={e => setForm({...form, section:e.target.value, classeId:''})}>
                    <option value="">{t.choisirSection}</option>
                    {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t.classe} *</label>
                  <select className="form-control" value={form.classeId||''} onChange={e => setForm({...form, classeId:e.target.value})}>
                    <option value="">{t.choisirClasse}</option>
                    {classes.filter(c => !form.section || c.section === form.section).map(c => (
                      <option key={c.id} value={c.id}>{c.nom} ({c.section})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t.adresse}</label>
                  <input className="form-control" value={form.adresse||''} onChange={e => setForm({...form, adresse:e.target.value})} placeholder="Quartier, Yaoundé" />
                </div>
              </div>

              {/* Parents / tuteurs */}
              <div style={S.sectionTitle}><Users size={14} style={{marginRight:6}}/>{t.informationsParent}</div>

              {/* Sélecteur de rôle obligatoire */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ display:'flex', alignItems:'center', gap:6 }}>
                  {t.roleParent} <span style={{ color:'var(--danger)', fontWeight:800, fontSize:15 }}>*</span>
                </label>
                <select
                  className="form-control"
                  value={roleParent}
                  onChange={e => { setRoleParent(e.target.value); setTabParent(e.target.value || 'pere'); }}
                  style={{ borderColor: !roleParent ? 'var(--danger)' : 'var(--border-color)', boxShadow: !roleParent ? '0 0 0 2px rgba(220,38,38,0.15)' : 'none' }}
                >
                  <option value="">{langue === 'fr' ? '— Sélectionner le rôle du parent principal —' : '— Select the primary parent role —'}</option>
                  <option value="pere">{t.pere}</option>
                  <option value="mere">{t.mere}</option>
                  <option value="tuteur">{t.tuteur}</option>
                </select>
                {!roleParent && (
                  <div style={{ fontSize:11, color:'var(--danger)', marginTop:4, display:'flex', alignItems:'center', gap:4 }}>
                    <span>⚠</span> {t.selectionnezRoleParent}
                  </div>
                )}
              </div>

              {/* Onglets père/mère/tuteur */}
              <div className="pill-tabs" style={{ marginBottom:16 }}>
                {[['pere',t.pere],['mere',t.mere],['tuteur',t.tuteur]].map(([k,lbl]) => (
                  <button
                    key={k}
                    className={`pill-tab ${tabParent===k?'active':''}`}
                    onClick={() => setTabParent(k)}
                    style={{ position:'relative' }}
                  >
                    {lbl}
                    {roleParent === k && (
                      <span style={{ position:'absolute', top:-4, right:-4, width:8, height:8, background:'var(--success)', borderRadius:'50%', border:'2px solid white' }} title={langue === 'fr' ? 'Parent principal' : 'Primary contact'} />
                    )}
                  </button>
                ))}
              </div>

              {tabParent === 'pere' && (
                <div style={S.formGrid}>
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label className="form-label">
                      {t.nomComplet}
                      {roleParent === 'pere' && <span style={{ color:'var(--danger)', marginLeft:4 }}>*</span>}
                    </label>
                    <input className="form-control" value={form.nomPere||''} onChange={e => setForm({...form, nomPere:e.target.value})} placeholder={langue === 'fr' ? 'Nom et prénoms du père' : "Father's full name"} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      {t.telephone} 1
                      {roleParent === 'pere' && <span style={{ color:'var(--danger)', marginLeft:4 }}>*</span>}
                    </label>
                    <input className="form-control" value={form.telephonePere||''} onChange={e => setForm({...form, telephonePere:e.target.value})} placeholder="6XX XXX XXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.telephone} 2 (Optionnel)</label>
                    <input className="form-control" value={form.telephonePere2||''} onChange={e => setForm({...form, telephonePere2:e.target.value})} placeholder="6XX XXX XXX" />
                  </div>
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label className="form-label">{t.emailAcces}</label>
                    <input className="form-control" type="email" value={form.emailPere||''} onChange={e => setForm({...form, emailPere:e.target.value})} />
                  </div>
                </div>
              )}
              {tabParent === 'mere' && (
                <div style={S.formGrid}>
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label className="form-label">
                      {t.nomComplet}
                      {roleParent === 'mere' && <span style={{ color:'var(--danger)', marginLeft:4 }}>*</span>}
                    </label>
                    <input className="form-control" value={form.nomMere||''} onChange={e => setForm({...form, nomMere:e.target.value})} placeholder={langue === 'fr' ? 'Nom et prénoms de la mère' : "Mother's full name"} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      {t.telephone} 1
                      {roleParent === 'mere' && <span style={{ color:'var(--danger)', marginLeft:4 }}>*</span>}
                    </label>
                    <input className="form-control" value={form.telephoneMere||''} onChange={e => setForm({...form, telephoneMere:e.target.value})} placeholder="6XX XXX XXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.telephone} 2 (Optionnel)</label>
                    <input className="form-control" value={form.telephoneMere2||''} onChange={e => setForm({...form, telephoneMere2:e.target.value})} placeholder="6XX XXX XXX" />
                  </div>
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label className="form-label">{t.emailAcces}</label>
                    <input className="form-control" type="email" value={form.emailMere||''} onChange={e => setForm({...form, emailMere:e.target.value})} />
                  </div>
                </div>
              )}
              {tabParent === 'tuteur' && (
                <div style={S.formGrid}>
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label className="form-label">
                      {t.nomComplet}
                      {roleParent === 'tuteur' && <span style={{ color:'var(--danger)', marginLeft:4 }}>*</span>}
                    </label>
                    <input className="form-control" value={form.nomTuteur||''} onChange={e => setForm({...form, nomTuteur:e.target.value})} placeholder={langue === 'fr' ? 'Nom et prénoms du tuteur' : "Guardian's full name"} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      {t.telephone} 1
                      {roleParent === 'tuteur' && <span style={{ color:'var(--danger)', marginLeft:4 }}>*</span>}
                    </label>
                    <input className="form-control" value={form.telephoneTuteur||''} onChange={e => setForm({...form, telephoneTuteur:e.target.value})} placeholder="6XX XXX XXX" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t.telephone} 2 (Optionnel)</label>
                    <input className="form-control" value={form.telephoneTuteur2||''} onChange={e => setForm({...form, telephoneTuteur2:e.target.value})} placeholder="6XX XXX XXX" />
                  </div>
                  <div className="form-group" style={{ gridColumn:'1/-1' }}>
                    <label className="form-label">{t.emailAcces}</label>
                    <input className="form-control" type="email" value={form.emailTuteur||''} onChange={e => setForm({...form, emailTuteur:e.target.value})} />
                  </div>
                </div>
              )}

              {errMsg && <div style={S.errBox}>{errMsg}</div>}

              {/* Transport */}
              <div style={S.sectionTitle}><Bus size={14} style={{marginRight:6}}/>{t.transportScolaire}</div>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                <input type="checkbox" id="bus" checked={!!form.bus} onChange={e => setForm({...form, bus:e.target.checked})} style={{ width:18, height:18, accentColor:'var(--primary)' }} />
                <label htmlFor="bus" style={{ fontSize:14, cursor:'pointer', color:'var(--text-primary)' }}>{t.emprunterBus}</label>
              </div>
              {form.bus && (
                <div className="form-group">
                  <label className="form-label">{t.ligneDeBus}</label>
                  <input className="form-control" value={form.busLigne||''} onChange={e => setForm({...form, busLigne:e.target.value})} placeholder={t.exLigneA} />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModal(null)}>{t.annuler}</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={!form.nom||!form.prenom||!form.classeId}>
                {modal === 'add' ? t.inscrireAction : t.enregistrer}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL VUE DÉTAILLÉE ══ */}
      {modal === 'view' && selected && (
        <StudentProfileModal
          selected={selected}
          setModal={setModal}
          viewTab={viewTab}
          setViewTab={setViewTab}
          t={t}
          peutEditerDiscipline={peutEditerDiscipline}
          role={role}
          isFondateur={isFondateur}
          newIncident={newIncident}
          setNewIncident={setNewIncident}
          handleAddIncident={handleAddIncident}
          peutModifier={peutModifier}
          openEdit={openEdit}
          getClasse={getClasse}
        />
      )}
    </div>
  );
}


const S = {
  container:     { padding:28, display:'flex', flexDirection:'column', gap:20 },
  topBar:        { display:'flex', alignItems:'center', gap:12, flexWrap:'wrap', justifyContent:'space-between' },
  counter:       { fontSize:13, color:'var(--text-secondary)', fontWeight:500 },
  grid:          { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 },
  eleveHeader:   { padding:'18px 18px 12px', display:'flex', gap:14, alignItems:'flex-start' },
  elevePhotoWrap:{ position:'relative', flexShrink:0 },
  elevePhoto:    { width:56, height:56, borderRadius:'50%', objectFit:'cover', border:'2px solid var(--bg-card)', boxShadow:'0 2px 8px rgba(0,0,0,.12)' },
  eleveInitials: { width:56, height:56, borderRadius:'50%', background:'var(--primary)', color:'white', fontWeight:700, fontSize:18, display:'flex', alignItems:'center', justifyContent:'center' },
  busBadge:      { position:'absolute', bottom:-2, right:-2, fontSize:12, background:'white', borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 4px rgba(0,0,0,.15)' },
  eleveName:     { fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:4 },
  eleveBody:     { padding:'0 18px 14px' },
  eleveMeta:     { display:'flex', flexDirection:'column', gap:4, fontSize:12, color:'var(--text-secondary)' },
  eleveActions:  { borderTop:'1px solid var(--border-color)', padding:'10px 18px', display:'flex', gap:8 },
  modalTitle:    { fontFamily:'Playfair Display,serif', fontSize:20, fontWeight:700, color:'var(--text-primary)' },
  sectionTitle:  { fontSize:13, fontWeight:700, color:'var(--gray-600)', textTransform:'uppercase', letterSpacing:.5, marginBottom:12, marginTop:8, paddingTop:12, borderTop:'1px solid var(--border-color)' },
  formGrid:      { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' },
  errBox:        { background:'#FEE2E2', color:'#991B1B', padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:12, border:'1px solid #FECACA' },
  viewPhoto:     { width:80, height:80, borderRadius:'50%', flexShrink:0, background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' },
  detailGrid:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
  detailItem:    { display:'flex', flexDirection:'column', gap:3, background:'var(--gray-50)', borderRadius:8, padding:'10px 12px' },
  detailLabel:   { fontSize:11, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:.5 },
  detailVal:     { fontSize:14, color:'var(--text-primary)', fontWeight:500 },
};