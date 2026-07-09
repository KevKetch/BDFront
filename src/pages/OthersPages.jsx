/**
 * @file OthersPages.jsx
 * @description Pages de gestion auxiliaires : Personnel, Classes (et matières), Transport et Paramètres.
 */
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import T from '../i18n/translations';
import { StudentProfileModal } from './ElevesPage';
import { UsersRound, School, Bus, Settings, BookOpen, Lock, ShieldAlert, Trash2, Plus, ChevronUp, ChevronDown, FileEdit, Check, X, Calendar } from 'lucide-react';

/* ══════════════════════════════════════════════════════════════════════════
   LISTE DES VILLES DU CAMEROUN (pour le lieu de naissance)
══════════════════════════════════════════════════════════════════════════ */
const VILLES_CAMEROUN = [
  'Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua', 'Maroua', 'Ngaoundéré',
  'Bertoua', 'Ebolowa', 'Buea', 'Kumba', 'Loum', 'Nkongsamba', 'Edéa', 'Kribi',
  'Limbe', 'Dschang', 'Bafia', 'Foumban', 'Kousséri', 'Mokolo', 'Guider', 'Yagoua',
  'Meiganga', 'Mbalmayo', 'Bafang', 'Bangangté', 'Wum', 'Kumbo', 'Fundong'
].sort();

/* ══════════════════════════════════════════════════════════════════════════
   PAGE PERSONNEL
══════════════════════════════════════════════════════════════════════════ */
export function PersonnelPage() {
  const { utilisateurs, classes, ajouterUtilisateur, modifierUtilisateur, supprimerUtilisateur, utilisateurActif, langue } = useApp();
  const t = T[langue] || T.fr;
  const [modal, setModal] = useState(null); // 'ajout', 'details', 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  
  const role = utilisateurActif?.role;
  const isAdmin = role === 'admin';
  const peutGerer = role === 'directeur';
  // Non-admin ne voit que les utilisateurs actifs
  const usersVisibles = isAdmin ? utilisateurs : utilisateurs.filter(u => u.actif !== false);
  
  const initialForm = {
    nom: '', prenom: '', email: '', role: 'enseignant', motDePasse: '1234',
    dateNaissance: '', lieuNaissance: '', numeroCNI: '', telephone: '',
    quartier: '', dateEmbauche: '', photo: null, classesIds: []
  };
  const [form, setForm] = useState(initialForm);

  const openDetails = (user) => {
    setSelectedUser(user);
    setModal('details');
  };

  const openEdit = (user) => {
    if (!peutGerer) return;
    setForm({ ...user, classesIds: user.classesIds || [] });
    setModal('edit');
  };

  const saveUser = async () => {
    if (modal === 'ajout') {
      await ajouterUtilisateur(form);
    } else if (modal === 'edit') {
      await modifierUtilisateur(form.id, form);
    }
    setModal(null);
  };

  const deleteUser = async (id) => {
    if (window.confirm(t.confirmSupprimer)) {
      await supprimerUtilisateur(id);
      setModal(null);
    }
  };

  const toggleClasse = (classeId) => {
    setForm(prev => {
      const ids = prev.classesIds || [];
      return {
        ...prev,
        classesIds: ids.includes(classeId) ? ids.filter(id => id !== classeId) : [...ids, classeId]
      };
    });
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="section-title"><UsersRound size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} /> {t.personnel2}</div>
          <div className="section-subtitle">{usersVisibles.length} {t.membrePersonnel}</div>
        </div>
        {peutGerer && (
          <button className="btn btn-primary" onClick={() => { setForm(initialForm); setModal('ajout'); }}>
            {t.ajouterMembre}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {usersVisibles.map(u => (
          <div key={u.id} className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s', opacity: u.actif === false ? 0.5 : 1, borderLeft: u.actif === false ? '4px solid #9CA3AF' : '4px solid transparent' }} onClick={() => openDetails(u)}>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {u.photo ? (
                <img src={u.photo} alt={`${u.prenom} ${u.nom}`} style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)', flexShrink: 0, filter: u.actif === false ? 'grayscale(1)' : 'none' }} />
              ) : (
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: u.actif === false ? '#9CA3AF' : 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
                  {u.prenom[0]}{u.nom[0]}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: 16, color: u.actif === false ? 'var(--text-muted)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: u.actif === false ? 'line-through' : 'none' }}>
                  {u.prenom} {u.nom}
                </h4>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {u.role}
                  {u.actif === false && <span style={{ background: '#6B7280', color: 'white', borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 700, marginLeft: 6 }}>Désactivé</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL AJOUT / EDITION */}
      {(modal === 'ajout' || modal === 'edit') && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 650 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="card-title">
                {modal === 'ajout' ? t.ajouterUnMembre : t.modifierMembre}
              </h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group"><label className="form-label">{t.nom}</label><input className="form-control" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">{t.prenom}</label><input className="form-control" value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-control" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">{t.telephone}</label><input className="form-control" value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})} /></div>
              
              <div className="form-group"><label className="form-label">{t.dateNaissance}</label><input className="form-control" type="date" value={form.dateNaissance} onChange={e => setForm({...form, dateNaissance: e.target.value})} /></div>
              <div className="form-group">
                <label className="form-label">{t.lieuNaissance}</label>
                <select className="form-control" value={form.lieuNaissance} onChange={e => setForm({...form, lieuNaissance: e.target.value})}>
                  <option value="">— {t.choisir} —</option>
                  {VILLES_CAMEROUN.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              
              <div className="form-group"><label className="form-label">{t.numeroCNI}</label><input className="form-control" value={form.numeroCNI} onChange={e => setForm({...form, numeroCNI: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">{t.quartier}</label><input className="form-control" value={form.quartier} onChange={e => setForm({...form, quartier: e.target.value})} /></div>
              
              <div className="form-group"><label className="form-label">{t.dateEmbauche}</label><input className="form-control" type="date" value={form.dateEmbauche} onChange={e => setForm({...form, dateEmbauche: e.target.value})} /></div>
              <div className="form-group">
                <label className="form-label">{t.role}</label>
                <select className="form-control" value={form.role} onChange={e => setForm({...form, role: e.target.value})} disabled={modal==='edit' && form.role==='directeur'}>
                  <option value="enseignant">Enseignant</option>
                  <option value="directeur">Directeur</option>
                  <option value="parent">Parent</option>
                </select>
              </div>

              {modal === 'ajout' && (
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">{t.motDePasseInitial}</label>
                  <input className="form-control" value={form.motDePasse} onChange={e => setForm({...form, motDePasse: e.target.value})} />
                </div>
              )}

              {form.role === 'enseignant' && (
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">{t.classeAssigneePers}</label>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                    {classes.map(c => (
                      <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: 'var(--gray-50)', padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border-color)' }}>
                        <input type="checkbox" checked={form.classesIds?.includes(c.id)} onChange={() => toggleClasse(c.id)} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{c.nom}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModal(null)}>{t.annuler}</button>
              <button className="btn btn-primary" onClick={saveUser}>{t.sauvegarder}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DÉTAILS */}
      {modal === 'details' && selectedUser && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                 {selectedUser.photo ? (
                   <img src={selectedUser.photo} alt={`${selectedUser.prenom} ${selectedUser.nom}`} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }} />
                 ) : (
                   <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>
                    {selectedUser.prenom[0]}{selectedUser.nom[0]}
                  </div>
                 )}
                <div>
                  <h2 style={{ fontSize: 22, margin: 0 }}>{selectedUser.prenom} {selectedUser.nom}</h2>
                  <div className="badge badge-primary" style={{ marginTop: 6, textTransform: 'capitalize' }}>{selectedUser.role}</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div style={{ background: 'var(--gray-50)', padding: 20, borderRadius: 12, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-200)', paddingBottom: 8 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Email</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedUser.email}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-200)', paddingBottom: 8 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t.telephone}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedUser.telephone || '—'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-200)', paddingBottom: 8 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t.dateNaissance}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedUser.dateNaissance || '—'} à {selectedUser.lieuNaissance || '—'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-200)', paddingBottom: 8 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t.numeroCNI}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedUser.numeroCNI || '—'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-200)', paddingBottom: 8 }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t.quartier}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedUser.quartier || '—'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t.dateEmbauche}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedUser.dateEmbauche || '—'}</strong>
                </div>
              </div>

              {selectedUser.role === 'enseignant' && (
                <div style={{ marginTop: 24 }}>
                  <h4 style={{ fontSize: 14, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BookOpen size={16} /> {t.classeEnseignees}
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {selectedUser.classesIds?.length > 0 
                      ? selectedUser.classesIds.map(id => {
                          const c = classes.find(c => c.id === id);
                          return c ? <span key={id} className="badge badge-success" style={{ fontSize: 13 }}>{c.nom}</span> : null;
                        })
                      : <span style={{ color: 'var(--text-muted)' }}>{t.aucuneClasseAssignee}</span>
                    }
                  </div>
                </div>
              )}
            </div>

            {peutGerer && (
              <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                <button className="btn btn-danger btn-sm" onClick={() => deleteUser(selectedUser.id)}>{t.supprimerMembre}</button>
                <button className="btn btn-primary" onClick={() => openEdit(selectedUser)}>{t.modifierMembre}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE CLASSES ET MATIÈRES
══════════════════════════════════════════════════════════════════════════ */
export function ClassesPage() {
  const { classes, ajouterClasse, modifierClasse, utilisateurs, matieres, ajouterMatiere, supprimerMatiere, modifierMatiere, peutAcceder, langue, eleves, getBulletins, getMoyenne, emploisDuTemps, sauvegarderEmploiDuTemps } = useApp();
  const t = T[langue] || T.fr;
  const [modal, setModal] = useState(null);
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [selectedEleve, setSelectedEleve] = useState(null);
  const [viewTab, setViewTab] = useState('infos');
  const [form, setForm] = useState({ nom: '', niveau: '', section: 'francophone', salle: '' });
  const [newMatiere, setNewMatiere] = useState('');
  const [matiereModal, setMatiereModal] = useState(false);
  const [editingMatiere, setEditingMatiere] = useState(null); // id de la matière en cours d'édition
  const [editNom, setEditNom] = useState('');
  
  // Emploi du temps
  const [edtModal, setEdtModal] = useState(false);
  const [edtConfig, setEdtConfig] = useState(null);

  const enseignants = utilisateurs.filter(u => u.role === 'enseignant');

  if (!peutAcceder('classes')) return <div className="empty-state"><Lock size={48} color="var(--danger)" style={{ marginBottom: 16 }} /> {t.accesNonAutorise}</div>;

  const openEdit = (c) => {
    setSelectedClasse(c);
    setForm({ nom: c.nom, niveau: c.niveau, section: c.section, salle: c.salle || '' });
    setModal('edit');
  };

  const openMatiereModal = (c) => {
    setSelectedClasse(c);
    setMatiereModal(true);
  };

  const saveClasse = async () => {
    if (modal === 'ajout') {
      await ajouterClasse(form);
    } else {
      await modifierClasse(selectedClasse.id, form);
    }
    setModal(null);
  };

  const handleAjouterMatiere = async (classeId) => {
    if (!newMatiere.trim()) return;
    await ajouterMatiere(classeId, newMatiere);
    setNewMatiere('');
  };

  const openEdtModal = (c) => {
    setSelectedClasse(c);
    const existing = emploisDuTemps.find(e => e.classeId === c.id);
    if (existing) {
      setEdtConfig(JSON.parse(JSON.stringify(existing)));
    } else {
      setEdtConfig({
        classeId: c.id,
        heureDebut: '08:00',
        dureeCours: 55,
        tranches: 7,
        pauses: [{ apresTranche: 2, duree: 30 }, { apresTranche: 5, duree: 60 }],
        grille: { Lundi: {}, Mardi: {}, Mercredi: {}, Jeudi: {}, Vendredi: {} }
      });
    }
    setEdtModal('config'); // 'config' ou 'grille'
  };

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

  const handleReorderMatiere = (classeId, matiereId, direction) => {
    const classeMatieres = matieres.filter(m => m.classeId === classeId).sort((a, b) => a.ordre - b.ordre);
    const idx = classeMatieres.findIndex(m => m.id === matiereId);
    if (direction === 'up' && idx > 0) {
      modifierMatiere(classeMatieres[idx].id, { ordre: classeMatieres[idx - 1].ordre });
      modifierMatiere(classeMatieres[idx - 1].id, { ordre: classeMatieres[idx].ordre });
    } else if (direction === 'down' && idx < classeMatieres.length - 1) {
      modifierMatiere(classeMatieres[idx].id, { ordre: classeMatieres[idx + 1].ordre });
      modifierMatiere(classeMatieres[idx + 1].id, { ordre: classeMatieres[idx].ordre });
    }
  };

  const handleRenameMatiere = (matiereId) => {
    if (!editNom.trim()) return;
    modifierMatiere(matiereId, { nom: editNom });
    setEditingMatiere(null);
    setEditNom('');
  };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div className="section-title"><School size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} /> {t.gestionClasses}</div>
          <div className="section-subtitle">{classes.length} {t.classesCrees}</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ nom: '', niveau: '', section: 'francophone', salle: '' }); setModal('ajout'); }}>
          {t.nouvelleClasse}
        </button>
      </div>

      {/* Classes regroupées par section */}
      {[
        { key: 'francophone', label: 'Section Francophone', color: '#1B4F72', bg: '#EBF5FB' },
        { key: 'anglophone',  label: 'Section Anglophone',  color: '#27AE60', bg: '#EAFAF1' },
        { key: 'bilingue',    label: 'Section Bilingue',    color: '#8E44AD', bg: '#F4ECF7' },
      ].map(({ key, label, color, bg }) => {
        const classesDuGroupe = classes.filter(c => c.section === key);
        if (classesDuGroupe.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: 32 }}>
            {/* En-tête de section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '12px 20px', background: bg, borderRadius: 12, border: `1.5px solid ${color}30` }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{classesDuGroupe.length} classe(s)</div>
              </div>
            </div>

            {/* Grille des classes de cette section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {classesDuGroupe.map(c => {
                const matieresClasse = matieres.filter(m => m.classeId === c.id);
                return (
                  <div key={c.id} className="card" style={{ borderTop: `3px solid ${color}`, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }} 
                       onClick={() => { setSelectedClasse(c); setModal('view_eleves'); }}
                       onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                       onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div className="card-header" style={{ background: 'var(--gray-50)', padding: '14px 18px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: 17, color: 'var(--text-primary)' }}>{c.nom}</h3>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{c.niveau} · {c.annee} {c.salle ? `· Salle: ${c.salle}` : ''}</div>
                      </div>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={(e) => { e.stopPropagation(); openEdit(c); }}><Settings size={14} /></button>
                    </div>
                    <div className="card-body" style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.effectif} <strong>{c.effectif}</strong></span>
                        <span className="badge" style={{ background: color + '18', color }}>{matieresClasse.length} {t.matiere}s</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-sm" style={{ flex: 1, background: color + '12', color, border: `1px solid ${color}30`, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={(e) => { e.stopPropagation(); openMatiereModal(c); }}>
                          <BookOpen size={14} /> Matières ({matieresClasse.length})
                        </button>
                        <button className="btn btn-sm" style={{ flex: 1, background: 'var(--gray-50)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={(e) => { e.stopPropagation(); openEdtModal(c); }}>
                          <Calendar size={14} /> Emploi du tps
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {modal === 'ajout' || modal === 'edit' ? (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="card-title">{modal === 'ajout' ? t.nouvelleClasse : t.modifierClasse}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group"><label className="form-label">Nom (ex: SIL A)</label><input className="form-control" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">{t.niveauNom} (ex: SIL)</label><input className="form-control" value={form.niveau} onChange={e => setForm({...form, niveau: e.target.value})} /></div>
              <div className="form-group"><label className="form-label">Salle (ex: S12)</label><input className="form-control" value={form.salle} onChange={e => setForm({...form, salle: e.target.value})} placeholder="Identifiant de la salle physique" /></div>
              <div className="form-group">
                <label className="form-label">Section</label>
                <select className="form-control" value={form.section} onChange={e => setForm({...form, section: e.target.value})}>
                  <option value="francophone">Francophone</option>
                  <option value="anglophone">Anglophone</option>
                  <option value="bilingue">Bilingue</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => setModal(null)}>{t.annuler}</button>
              <button className="btn btn-primary" onClick={saveClasse} disabled={!form.nom || !form.salle}>{t.sauvegarder}</button>
            </div>
          </div>
        </div>
      ) : null}

      {modal === 'view_eleves' && selectedClasse && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 800, width: '90%', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="card-title">Élèves de la classe {selectedClasse.nom}</h2>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Effectif : {eleves.filter(e => e.classeId === selectedClasse.id).length}</div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ overflowY: 'auto', padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                {eleves.filter(e => e.classeId === selectedClasse.id).map(eleve => {
                  const buls = getBulletins ? getBulletins(eleve.id) : [];
                  const dernierBul = buls[buls.length - 1];
                  return (
                    <div key={eleve.id} className="card" style={{ cursor: 'pointer', border: '1px solid var(--border-color)' }} onClick={() => { setSelectedEleve(eleve); setModal('view_eleve_details'); }}>
                      <div style={{ padding: '12px', display: 'flex', gap: 12, alignItems: 'center' }}>
                        {eleve.photo ? (
                          <img src={eleve.photo} alt="" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {eleve.prenom[0]}{eleve.nom[0]}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{eleve.prenom} {eleve.nom}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{eleve.matricule}</div>
                          {dernierBul && <div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 2 }}>Moy: {getMoyenne(dernierBul)}/20</div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {eleves.filter(e => e.classeId === selectedClasse.id).length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                    Aucun élève dans cette classe.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {modal === 'view_eleve_details' && selectedEleve && (
        <StudentProfileModal
          selected={selectedEleve}
          setModal={(m) => {
            if (m === null) setModal('view_eleves');
          }}
          viewTab={viewTab}
          setViewTab={setViewTab}
          t={t}
          peutEditerDiscipline={() => false}
          role={utilisateurs.find(u => u.id === selectedEleve.enseignantId)?.role || 'enseignant'}
          isFondateur={false}
          newIncident={{}}
          setNewIncident={() => {}}
          handleAddIncident={() => {}}
          peutModifier={false}
          openEdit={null}
          getClasse={(id) => classes.find(c => c.id === id)}
        />
      )}

      {/* MODAL GESTION MATIÈRES — Interface structurée */}
      {matiereModal && selectedClasse && (
        <div className="modal-overlay" onClick={() => { setMatiereModal(false); setEditingMatiere(null); }}>
          <div className="modal" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
            {/* En-tête premium */}
            <div style={{ background: 'linear-gradient(135deg, #0D2B40 0%, #1B4F72 60%, #2980B9 100%)', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BookOpen size={22} color="white" />
                </div>
                <div>
                  <div style={{ color: 'white', fontSize: 18, fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>Gestion des Matières</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 2 }}>{selectedClasse.nom} · {selectedClasse.section} · {selectedClasse.niveau}</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => { setMatiereModal(false); setEditingMatiere(null); }} style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.2)' }}>✕</button>
            </div>

            <div className="modal-body" style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Formulaire d'ajout */}
              <div style={{ background: 'var(--gray-50)', borderRadius: 12, padding: '16px 20px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Plus size={14} /> Ajouter une matière
                </h4>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input 
                    className="form-control" 
                    placeholder="Nom de la matière (ex: Mathématiques, Français, Sciences...)"
                    value={newMatiere} 
                    onChange={e => setNewMatiere(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAjouterMatiere(selectedClasse.id); }}
                    style={{ flex: 1 }}
                  />
                  <button className="btn btn-primary" onClick={() => handleAjouterMatiere(selectedClasse.id)} disabled={!newMatiere.trim()} style={{ whiteSpace: 'nowrap' }}>
                    <Plus size={16} /> Ajouter
                  </button>
                </div>
              </div>

              {/* Tableau des matières */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                    <BookOpen size={15} /> Matières de la classe
                  </h4>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                    {matieres.filter(m => m.classeId === selectedClasse.id).length} matière(s)
                  </span>
                </div>

                {matieres.filter(m => m.classeId === selectedClasse.id).length === 0 ? (
                  <div style={{ padding: '40px 24px', textAlign: 'center', background: 'var(--gray-50)', borderRadius: 12, color: 'var(--text-muted)', border: '2px dashed var(--border-color)' }}>
                    <BookOpen size={36} color="var(--gray-300)" style={{ marginBottom: 12 }} />
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Aucune matière</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>Ajoutez des matières pour commencer à organiser vos cours.</div>
                  </div>
                ) : (
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 12, overflow: 'hidden' }}>
                    <table className="table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#0D2B40' }}>
                          <th style={{ color: 'white', padding: '12px 16px', width: 50, textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: 1, borderBottom: 'none' }}>N°</th>
                          <th style={{ color: 'white', padding: '12px 16px', fontSize: 11, fontWeight: 700, letterSpacing: 1, borderBottom: 'none' }}>NOM DE LA MATIÈRE</th>
                          <th style={{ color: 'white', padding: '12px 16px', width: 80, textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: 1, borderBottom: 'none' }}>ORDRE</th>
                          <th style={{ color: 'white', padding: '12px 16px', width: 160, textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: 1, borderBottom: 'none' }}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matieres.filter(m => m.classeId === selectedClasse.id).sort((a, b) => a.ordre - b.ordre).map((m, idx, arr) => (
                          <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}>
                            {/* N° */}
                            <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #0D2B40, #2980B9)', color: 'white', fontWeight: 700, fontSize: 12 }}>
                                {idx + 1}
                              </span>
                            </td>
                            {/* Nom (avec édition inline) */}
                            <td style={{ padding: '10px 16px' }}>
                              {editingMatiere === m.id ? (
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                  <input 
                                    className="form-control" 
                                    value={editNom} 
                                    onChange={e => setEditNom(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleRenameMatiere(m.id); if (e.key === 'Escape') setEditingMatiere(null); }}
                                    autoFocus
                                    style={{ padding: '6px 10px', fontSize: 13 }}
                                  />
                                  <button className="btn btn-primary btn-sm" onClick={() => handleRenameMatiere(m.id)} style={{ padding: '6px 8px' }}><Check size={14} /></button>
                                  <button className="btn btn-ghost btn-sm" onClick={() => setEditingMatiere(null)} style={{ padding: '6px 8px' }}><X size={14} /></button>
                                </div>
                              ) : (
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14, cursor: 'pointer' }} onClick={() => { setEditingMatiere(m.id); setEditNom(m.nom); }} title="Cliquer pour renommer">
                                  {m.nom}
                                </span>
                              )}
                            </td>
                            {/* Boutons de réordonnancement */}
                            <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                                <button 
                                  onClick={() => handleReorderMatiere(selectedClasse.id, m.id, 'up')}
                                  disabled={idx === 0}
                                  style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border-color)', background: idx === 0 ? 'var(--gray-100)' : 'var(--bg-card)', cursor: idx === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: idx === 0 ? 0.3 : 1, transition: 'all 0.15s' }}
                                  title="Monter"
                                >
                                  <ChevronUp size={14} color="var(--text-secondary)" />
                                </button>
                                <button 
                                  onClick={() => handleReorderMatiere(selectedClasse.id, m.id, 'down')}
                                  disabled={idx === arr.length - 1}
                                  style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border-color)', background: idx === arr.length - 1 ? 'var(--gray-100)' : 'var(--bg-card)', cursor: idx === arr.length - 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: idx === arr.length - 1 ? 0.3 : 1, transition: 'all 0.15s' }}
                                  title="Descendre"
                                >
                                  <ChevronDown size={14} color="var(--text-secondary)" />
                                </button>
                              </div>
                            </td>
                            {/* Actions */}
                            <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                <button 
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => { setEditingMatiere(m.id); setEditNom(m.nom); }}
                                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px' }}
                                >
                                  <FileEdit size={13} /> Renommer
                                </button>
                                <button 
                                  className="btn btn-danger btn-sm" 
                                  onClick={() => {
                                    if (window.confirm(`Supprimer la matière "${m.nom}" ?`)) {
                                      supprimerMatiere(m.id);
                                    }
                                  }}
                                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px' }}
                                >
                                  <Trash2 size={13} /> Supprimer
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => { setMatiereModal(false); setEditingMatiere(null); }}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {edtModal && selectedClasse && (
        <div className="modal-overlay" onClick={() => setEdtModal(false)}>
          <div className="modal" style={{ maxWidth: edtModal === 'grille' ? 1000 : 500, width: '95%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="card-title">Emploi du Temps : {selectedClasse.nom}</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setEdtModal(false)}>✕</button>
            </div>
            
            <div className="modal-body" style={{ overflowY: 'auto', padding: 20 }}>
              {edtModal === 'config' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Heure de début (ex: 08:00)</label>
                    <input type="time" className="form-control" value={edtConfig.heureDebut} onChange={e => setEdtConfig({...edtConfig, heureDebut: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Durée d'un cours (minutes)</label>
                    <input type="number" className="form-control" value={edtConfig.dureeCours} onChange={e => setEdtConfig({...edtConfig, dureeCours: Number(e.target.value)})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nombre de tranches horaires par jour</label>
                    <input type="number" className="form-control" value={edtConfig.tranches} onChange={e => setEdtConfig({...edtConfig, tranches: Number(e.target.value)})} />
                  </div>
                  
                  <div style={{ padding: 12, background: 'var(--gray-50)', borderRadius: 8 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Pauses</div>
                    {edtConfig.pauses.map((p, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 13 }}>Après tranche</span>
                        <input type="number" className="form-control" style={{ width: 60, padding: 4 }} value={p.apresTranche} onChange={e => {
                          const newPauses = [...edtConfig.pauses];
                          newPauses[i].apresTranche = Number(e.target.value);
                          setEdtConfig({...edtConfig, pauses: newPauses});
                        }} />
                        <span style={{ fontSize: 13 }}>Durée (min)</span>
                        <input type="number" className="form-control" style={{ width: 70, padding: 4 }} value={p.duree} onChange={e => {
                          const newPauses = [...edtConfig.pauses];
                          newPauses[i].duree = Number(e.target.value);
                          setEdtConfig({...edtConfig, pauses: newPauses});
                        }} />
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => {
                          setEdtConfig({...edtConfig, pauses: edtConfig.pauses.filter((_, idx) => idx !== i)});
                        }}><Trash2 size={14} color="var(--danger)" /></button>
                      </div>
                    ))}
                    <button className="btn btn-sm btn-secondary" onClick={() => setEdtConfig({...edtConfig, pauses: [...edtConfig.pauses, { apresTranche: 1, duree: 15 }]})}>
                      <Plus size={14} /> Ajouter une pause
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="table" style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ background: 'var(--gray-50)', padding: '10px' }}>Horaire</th>
                        {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map(d => <th key={d} style={{ background: 'var(--primary)', color: 'white', padding: '10px', textAlign: 'center' }}>{d}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {generateTimeSlots(edtConfig).map((slot, sIdx) => (
                        <tr key={sIdx} style={slot.type === 'pause' ? { background: '#f8f9fa' } : {}}>
                          <td style={{ padding: '10px', fontWeight: 600, fontSize: 13, color: 'var(--text-secondary)', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>
                            {slot.label}
                            {slot.type === 'pause' && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Pause ({slot.duree} min)</div>}
                          </td>
                          {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map(d => (
                            <td key={d} style={{ borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: 6, textAlign: 'center' }}>
                              {slot.type === 'pause' ? (
                                <span style={{ color: '#adb5bd', fontStyle: 'italic', fontSize: 13 }}>-- Pause --</span>
                              ) : (
                                <select 
                                  className="form-control" 
                                  style={{ width: '100%', padding: '4px 8px', fontSize: 13, border: edtConfig.grille[d]?.[slot.i] ? '1px solid var(--primary)' : '1px solid var(--border-color)', background: edtConfig.grille[d]?.[slot.i] ? '#f0f4ff' : 'white' }}
                                  value={edtConfig.grille[d]?.[slot.i] || ''}
                                  onChange={e => {
                                    const newGrille = { ...edtConfig.grille };
                                    if (!newGrille[d]) newGrille[d] = {};
                                    newGrille[d][slot.i] = e.target.value;
                                    setEdtConfig({ ...edtConfig, grille: newGrille });
                                  }}
                                >
                                  <option value="">- Vide -</option>
                                  {matieres.filter(m => m.classeId === selectedClasse.id).map(m => (
                                    <option key={m.id} value={m.id}>{m.nom}</option>
                                  ))}
                                </select>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button className="btn btn-ghost" onClick={() => setEdtModal(false)}>Annuler</button>
              {edtModal === 'config' ? (
                <button className="btn btn-primary" onClick={() => setEdtModal('grille')}>Continuer vers la grille</button>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-secondary" onClick={() => setEdtModal('config')}>Retour Config</button>
                  <button className="btn btn-primary" onClick={() => { sauvegarderEmploiDuTemps(selectedClasse.id, edtConfig); setEdtModal(false); }}>Enregistrer</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE TRANSPORT SCOLAIRE
══════════════════════════════════════════════════════════════════════════ */
export function TransportPage() {
  const { eleves, classes, langue } = useApp();
  const t = T[langue] || T.fr;
  const inBus = eleves.filter(e => e.bus && e.statut === 'actif');
  
  const lignes = inBus.reduce((acc, el) => {
    const l = el.busLigne || 'Non assigné';
    if (!acc[l]) acc[l] = [];
    acc[l].push(el);
    return acc;
  }, {});

  return (
    <div style={{ padding: 28 }}>
      <div className="section-title"><Bus size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} /> {t.transportScolaireTitle.replace('🚌 ', '')}</div>
      <div className="section-subtitle" style={{ marginBottom: 24 }}>{inBus.length} {t.elevesEnBusSub}</div>
      {Object.entries(lignes).map(([ligne, els]) => (
        <div key={ligne} className="card" style={{ marginBottom: 16 }}>
          <div className="card-header" style={{ background: 'var(--gray-50)', padding: '12px 20px' }}>
            <strong style={{ color: ligne === 'Non assigné' ? 'var(--danger)' : 'var(--text-primary)' }}>{ligne}</strong>
            <span className="badge badge-primary">{els.length} élève(s)</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Matricule</th><th>Élève</th><th>Classe</th><th>Contact Parents</th></tr></thead>
              <tbody>
                {els.map(e => (
                  <tr key={e.id}>
                    <td><code>{e.matricule}</code></td>
                    <td><strong>{e.prenom} {e.nom}</strong></td>
                    <td>{classes.find(c => c.id === e.classeId)?.nom || '—'}</td>
                    <td>{e.parentTel || e.telephonePere || e.telephoneMere || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      {inBus.length === 0 && <div className="empty-state"><Bus size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} /> <h3>{t.aucunEleveBus}</h3></div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   PAGE PARAMÈTRES
══════════════════════════════════════════════════════════════════════════ */
export function ParametresPage() {
  const { utilisateurActif, modifierUtilisateur, darkMode, toggleDarkMode, langue, toggleLangue } = useApp();
  const t = T[langue] || T.fr;
  const [form, setForm] = useState({ ...utilisateurActif, motDePasse: '' });

  const save = () => {
    const data = { prenom: form.prenom, nom: form.nom, telephone: form.telephone };
    if (form.motDePasse) data.motDePasse = form.motDePasse;
    modifierUtilisateur(utilisateurActif.id, data);
    setForm(prev => ({ ...prev, motDePasse: '' }));
  };

  return (
    <div style={{ padding: 28, maxWidth: 600 }}>
      <div className="section-title" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Settings size={24} /> {t.parametresCompte.replace('⚙️ ', '')}
      </div>
      
      {/* Profil Personnel */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header"><h3 className="card-title">{t.informationsPerso}</h3></div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group"><label className="form-label">{t.prenom}</label><input className="form-control" value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">{t.nom}</label><input className="form-control" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={form.email} disabled /></div>
          <div className="form-group"><label className="form-label">{t.telephone}</label><input className="form-control" value={form.telephone || ''} onChange={e => setForm({...form, telephone: e.target.value})} /></div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">{t.nouveauMdp}</label>
            <input className="form-control" type="password" placeholder="Laisser vide pour ne pas modifier" value={form.motDePasse} onChange={e => setForm({...form, motDePasse: e.target.value})} />
          </div>
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={save}>{t.sauvegarderProfil}</button>
          </div>
        </div>
      </div>

      {/* Préférences UI */}
      <div className="card">
        <div className="card-header"><h3 className="card-title">{t.apparence}</h3></div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.modeSombre} / {t.modeClairLabel}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.activerModeSombre}</div>
            </div>
            <button className="btn btn-ghost" onClick={toggleDarkMode} style={{ fontSize: 24, padding: '8px 12px' }}>
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--gray-50)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.langue}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.langueActive} : {langue === 'fr' ? 'Français' : 'English'}</div>
            </div>
            <button className="btn btn-ghost" onClick={toggleLangue} style={{ fontWeight: 700, padding: '8px 16px' }}>
              {langue === 'fr' ? '🇺🇸 Switch to English' : '🇫🇷 Passer en Français'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}