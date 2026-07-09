import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import T from '../i18n/translations';
import { Users, Calendar, Settings, Shield, Plus, Check, X, UserX, Camera } from 'lucide-react';

const VILLES_CAMEROUN = [
  'Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Garoua', 'Maroua', 'Ngaoundéré',
  'Bertoua', 'Ebolowa', 'Buea', 'Kumba', 'Loum', 'Nkongsamba', 'Edéa', 'Kribi',
  'Limbe', 'Dschang', 'Bafia', 'Foumban', 'Kousséri', 'Mokolo', 'Guider', 'Yagoua',
  'Meiganga', 'Mbalmayo', 'Bafang', 'Bangangté', 'Wum', 'Kumbo', 'Fundong'
].sort();

export default function AdminPage() {
  const { 
    utilisateurs, peutAcceder, peutCreerCompteHaut, peutInscrirePersonnel,
    modifierUtilisateur, ajouterUtilisateur,
    schoolSettings, updateSchoolSettings,
    utilisateurActif, langue,
    sessions, activeSession, activeSessionLabel,
    ouvrirNouvelleAnneeScolaire, cloreSessionActive
  } = useApp();
  const t = T[langue] || T.fr;
  const [activeTab, setActiveTab] = useState('parametres');
  const [localSettings, setLocalSettings] = useState(schoolSettings);
  const [modalUser, setModalUser] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [nouvelleAnneeLabel, setNouvelleAnneeLabel] = useState('');
  const fileRef = useRef();
  const [formUser, setFormUser] = useState({ 
    prenom:'', nom:'', email:'', telephone:'', 
    dateNaissance: '', lieuNaissance: '', numeroCNI: '', quartier: '',
    motDePasse:'1234', role:'directeur', actif: true, photo: null
  });

  if (!peutAcceder('tout')) {
    return (
      <div className="empty-state">
        <Shield size={52} color="var(--text-muted)" style={{ marginBottom: 16 }} />
        <h3>Accès Restreint</h3>
        <p>Seul l'administrateur système a accès à cette section.</p>
      </div>
    );
  }

  // Calcul des KPIs
  const totalUsers = utilisateurs.length;
  const totalEnseignants = utilisateurs.filter(u => u.role === 'enseignant').length;
  const totalParents = utilisateurs.filter(u => u.role === 'parent').length;
  const totalSessions = sessions.length;

  const handleToggleStatus = (id, currentStatus) => {
    modifierUtilisateur(id, { actif: !currentStatus });
  };

  const handleSaveSettings = () => {
    updateSchoolSettings(localSettings);
  };

  // Rôles créables selon le niveau
  // L'admin SEUL peut créer des comptes. Les autres ne peuvent pas créer d'admin.
  let rolesAutorisés = [];
  if (peutCreerCompteHaut()) {
    // L'admin peut créer fondateur, directeur, enseignant (PAS d'autre admin)
    const adminExiste = utilisateurs.some(u => u.role === 'admin' && u.id !== utilisateurActif?.id);
    rolesAutorisés = adminExiste ? ['fondateur', 'directeur', 'enseignant'] : ['admin', 'fondateur', 'directeur', 'enseignant'];
  } else if (peutInscrirePersonnel()) {
    rolesAutorisés = ['enseignant', 'parent'];
  }

  const handlePhoto = ev => {
    const f = ev.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev2 => {
      setPhoto(ev2.target.result);
      setFormUser({...formUser, photo: ev2.target.result});
    };
    reader.readAsDataURL(f);
  };

  const handleOpenNewSession = async () => {
    const label = nouvelleAnneeLabel.trim() || activeSessionLabel;
    await ouvrirNouvelleAnneeScolaire(label);
    setNouvelleAnneeLabel('');
  };

  const handleCloseSession = async () => {
    await cloreSessionActive();
  };

  const handleCreateUser = () => {
    if (!formUser.prenom || !formUser.nom || !formUser.email) return;
    const dateEmbauche = new Date().toISOString().slice(0, 10); // Date du jour
    ajouterUtilisateur({ 
      ...formUser, 
      classesIds: [],
      dateEmbauche,
      photo: formUser.photo
    });
    setModalUser(false);
    setFormUser({ 
      prenom:'', nom:'', email:'', telephone:'', 
      dateNaissance: '', lieuNaissance: '', numeroCNI: '', quartier: '',
      motDePasse:'1234', role:'directeur', actif: true, photo: null
    });
    setPhoto(null);
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#0D2B40', fontFamily: 'serif' }}>Administration</div>
      </div>

      {/* ── KPIs ── */}
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, background: '#0D2B40', padding: '24px', borderRadius: 8, color: 'white', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, marginBottom: 8 }}>{totalUsers}</div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Utilisateurs</div>
        </div>
        <div style={{ flex: 1, background: '#0D2B40', padding: '24px', borderRadius: 8, color: 'white', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, marginBottom: 8 }}>{totalEnseignants}</div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Enseignants</div>
        </div>
        <div style={{ flex: 1, background: '#0D2B40', padding: '24px', borderRadius: 8, color: 'white', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, marginBottom: 8 }}>{totalParents}</div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Parents</div>
        </div>
        <div style={{ flex: 1, background: '#0D2B40', padding: '24px', borderRadius: 8, color: 'white', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1, marginBottom: 8 }}>{totalSessions}</div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Sessions scolaires</div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--border-color)', marginTop: 8 }}>
        {[
          { key: 'utilisateurs', label: 'Utilisateurs', icon: <Users size={16} /> },
          { key: 'sessions',     label: 'Sessions scolaires', icon: <Calendar size={16} /> },
          { key: 'parametres',   label: 'Paramètres',   icon: <Settings size={16} /> },
        ].map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '12px 16px', border: 'none', background: 'transparent',
              color: activeTab === tab.key ? '#0D2B40' : 'var(--text-muted)',
              fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center',
              borderBottom: activeTab === tab.key ? '3px solid #0D2B40' : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── Paramètres ── */}
      {activeTab === 'parametres' && (
        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 20, color: '#0D2B40', fontFamily: 'serif', marginBottom: 20 }}>Paramètres généraux</h2>
          <div style={{ background: '#F8F9FA', borderRadius: 8, padding: 24, border: '1px solid var(--border-color)' }}>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>Nom de l'école</label>
              <input 
                type="text" 
                value={localSettings.nom} 
                onChange={(e) => setLocalSettings({...localSettings, nom: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: 4, border: '1px solid var(--border-color)', fontSize: 14 }}
              />
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>Localisation (Ville)</label>
              <input 
                type="text" 
                value={localSettings.ville} 
                onChange={(e) => setLocalSettings({...localSettings, ville: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: 4, border: '1px solid var(--border-color)', fontSize: 14 }}
              />
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>Téléphone</label>
              <input 
                type="text" 
                value={localSettings.telephone} 
                onChange={(e) => setLocalSettings({...localSettings, telephone: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: 4, border: '1px solid var(--border-color)', fontSize: 14 }}
              />
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>Email</label>
              <input 
                type="email" 
                value={localSettings.email} 
                onChange={(e) => setLocalSettings({...localSettings, email: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: 4, border: '1px solid var(--border-color)', fontSize: 14 }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleSaveSettings} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={16} /> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Utilisateurs ── */}
      {activeTab === 'utilisateurs' && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, color: '#0D2B40', fontFamily: 'serif', margin: 0 }}>Utilisateurs</h2>
            {rolesAutorisés.length > 0 && (
              <button onClick={() => setModalUser(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Plus size={16} /> Ajouter un utilisateur
              </button>
            )}
          </div>

          {/* Légende des permissions */}
          <div style={{ background: '#EBF5FB', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 12, color: '#0D2B40', border: '1px solid #AED6F1' }}>
            <strong>Vos droits :</strong>{' '}
            {peutCreerCompteHaut()
              ? 'Vous pouvez créer des comptes Fondateur, Directeur et Enseignant.'
              : peutInscrirePersonnel()
              ? 'Vous pouvez créer des comptes Enseignant et Parent.'
              : 'Consultation uniquement.'}
          </div>
          
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>
            <table className="table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#F8F9FA', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '16px 24px', textAlign: 'left', color: '#7F8C8D', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>PRÉNOM</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', color: '#7F8C8D', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>NOM</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', color: '#7F8C8D', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>ADRESSE EMAIL</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', color: '#7F8C8D', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>RÔLE</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', color: '#7F8C8D', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>STATUT</th>
                  <th style={{ padding: '16px 24px', textAlign: 'left', color: '#7F8C8D', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {utilisateurs.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 24px', color: '#2C3E50', fontSize: 14 }}>{u.prenom}</td>
                    <td style={{ padding: '16px 24px', color: '#2C3E50', fontSize: 14 }}>{u.nom}</td>
                    <td style={{ padding: '16px 24px', color: '#7F8C8D', fontSize: 14 }}>{u.email}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: 0.5,
                        background: u.role === 'admin' ? '#FDEDEC' : u.role === 'directeur' ? '#E9F7EF' : u.role === 'fondateur' ? '#FEF9E7' : '#EBF5FB',
                        color: u.role === 'admin' ? '#E74C3C' : u.role === 'directeur' ? '#27AE60' : u.role === 'fondateur' ? '#F39C12' : '#2980B9'
                      }}>
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {u.actif
                        ? <span style={{ color: '#27AE60', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={14} /> Actif</span>
                        : <span style={{ color: '#E74C3C', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><X size={14} /> Inactif</span>}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      {u.id !== utilisateurActif?.id && (
                        <button
                          onClick={() => handleToggleStatus(u.id, u.actif)}
                          style={{ background: u.actif ? '#FEE2E2' : '#DCFCE7', color: u.actif ? '#E74C3C' : '#27AE60', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          {u.actif ? <><UserX size={13} /> Désactiver</> : <><Check size={13} /> Activer</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Sessions ── */}
      {activeTab === 'sessions' && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontSize: 20, color: '#0D2B40', fontFamily: 'serif', margin: 0 }}>Sessions scolaires</h2>
              <p style={{ margin: '6px 0 0', color: 'var(--text-muted)' }}>La session scolaire courante est {activeSession?.label || activeSessionLabel}.</p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                value={nouvelleAnneeLabel}
                onChange={(e) => setNouvelleAnneeLabel(e.target.value)}
                placeholder="2026-2027"
                style={{ minWidth: 150, padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border-color)' }}
              />
              <button onClick={handleOpenNewSession} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Plus size={16} /> Ouvrir une nouvelle session
              </button>
              <button onClick={handleCloseSession} className="btn btn-cancel" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Calendar size={16} /> Clore la session courante
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {[...sessions].reverse().map(session => (
              <div key={session.id} style={{ border: '1px solid var(--border-color)', borderRadius: 10, padding: 16, background: session.status === 'active' ? '#EBF5FB' : 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: '#0D2B40' }}>Session scolaire · {session.label}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                      {session.status === 'active' ? 'En cours' : 'Archivée'}
                      {session.openedAt ? ` • Ouverte le ${new Date(session.openedAt).toLocaleDateString('fr-FR')}` : ''}
                      {session.closedAt ? ` • Clôturée le ${new Date(session.closedAt).toLocaleDateString('fr-FR')}` : ''}
                    </div>
                  </div>
                  <span style={{ padding: '6px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: session.status === 'active' ? '#0D2B40' : '#6B7280', color: 'white' }}>
                    {session.status === 'active' ? 'Active' : 'Archivée'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 12, color: 'var(--text-secondary)', fontSize: 13 }}>
                  <div><strong>Année scolaire</strong><br />{session.anneeScolaire || session.label}</div>
                  <div><strong>Début</strong><br />{session.debutLabel || (session.debut ? new Date(session.debut).toLocaleDateString('fr-FR') : '—')}</div>
                  <div><strong>Fin</strong><br />{session.finLabel || (session.fin ? new Date(session.fin).toLocaleDateString('fr-FR') : '—')}</div>
                  <div><strong>Archive</strong><br />Notes : {session.archive?.notes?.length || 0} · Éval. : {session.archive?.evaluations?.length || 0}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MODAL CRÉATION UTILISATEUR ── */}
      {modalUser && (
        <div className="modal-overlay" onClick={() => setModalUser(false)}>
          <div className="modal" style={{ maxWidth: 720 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontFamily: 'Playfair Display,serif', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Plus size={20} /> Créer un nouveau compte
              </h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setModalUser(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Photo — disponible pour tous les rôles */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <div className="photo-upload" onClick={() => fileRef.current?.click()} style={{ cursor: 'pointer', width: 90, height: 90, borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border-color)', flexDirection: 'column', gap: 4 }}>
                  {photo
                    ? <img src={photo} alt="photo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : <><Camera size={28} color="var(--text-muted)" /><span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Ajouter photo</span></>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhoto} />
              </div>

              {/* Informations personnelles */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 12 }}>Informations personnelles</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Prénom *</label>
                    <input className="form-control" value={formUser.prenom} onChange={e => setFormUser({...formUser, prenom: e.target.value})} placeholder="Prénom" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Nom *</label>
                    <input className="form-control" value={formUser.nom} onChange={e => setFormUser({...formUser, nom: e.target.value})} placeholder="NOM" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Date de naissance</label>
                    <input className="form-control" type="date" value={formUser.dateNaissance} onChange={e => setFormUser({...formUser, dateNaissance: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Lieu de naissance</label>
                    <select className="form-control" value={formUser.lieuNaissance} onChange={e => setFormUser({...formUser, lieuNaissance: e.target.value})}>
                      <option value="">— Choisir —</option>
                      {VILLES_CAMEROUN.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Numéro CNI</label>
                    <input className="form-control" value={formUser.numeroCNI} onChange={e => setFormUser({...formUser, numeroCNI: e.target.value})} placeholder="N° CNI" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Quartier/Commune</label>
                    <input className="form-control" value={formUser.quartier} onChange={e => setFormUser({...formUser, quartier: e.target.value})} placeholder="Quartier" />
                  </div>
                </div>
              </div>

              {/* Informations de contact */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 12 }}>Informations de contact</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0, gridColumn: '1/-1' }}>
                    <label className="form-label">Adresse email *</label>
                    <input className="form-control" type="email" value={formUser.email} onChange={e => setFormUser({...formUser, email: e.target.value})} placeholder="email@ecole.cm" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Téléphone</label>
                    <input className="form-control" value={formUser.telephone} onChange={e => setFormUser({...formUser, telephone: e.target.value})} placeholder="6XX XXX XXX" />
                  </div>
                </div>
              </div>

              {/* Informations compte */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 12 }}>Paramètres du compte</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Mot de passe initial</label>
                    <input className="form-control" type="password" value={formUser.motDePasse} onChange={e => setFormUser({...formUser, motDePasse: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Rôle *</label>
                    <select className="form-control" value={formUser.role} onChange={e => setFormUser({...formUser, role: e.target.value})}>
                      {rolesAutorisés.map(r => (
                        <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ background: '#EBF5FB', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#0D2B40', marginTop: 12 }}>
                  <strong>• Mot de passe initial:</strong> {formUser.motDePasse}<br/>
                  <strong>• Date d'embauche:</strong> {new Date().toLocaleDateString('fr-FR')} (automatique)
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={() => { setModalUser(false); setPhoto(null); }}>Annuler</button>
              <button className="btn btn-primary" onClick={handleCreateUser} disabled={!formUser.prenom || !formUser.nom || !formUser.email} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={16} /> Créer le compte
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
