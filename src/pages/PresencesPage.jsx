import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { UserCheck, CheckCircle2, XCircle, AlertCircle, Save, Calendar, School, Clock } from 'lucide-react';

export default function AppelPage() {
  const { 
    classes, getElevesClasse, utilisateurActif, 
    appels, enregistrerAppel, langue 
  } = useApp();

  const role = utilisateurActif?.role;
  const mesClassesIds = utilisateurActif?.classesIds?.length 
    ? utilisateurActif.classesIds 
    : [utilisateurActif?.classeId].filter(Boolean);

  const classesAccessibles = ['admin', 'directeur', 'fondateur'].includes(role) 
    ? classes 
    : classes.filter(c => mesClassesIds.includes(c.id));

  const [selectedClasse, setSelectedClasse] = useState(classesAccessibles.length === 1 ? classesAccessibles[0].id : '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  
  // État local des présences en cours d'édition: { [eleveId]: 'present' | 'absent' | 'retard' }
  const [presences, setPresences] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const elevesClasse = useMemo(() => {
    return selectedClasse ? getElevesClasse(selectedClasse) : [];
  }, [selectedClasse, getElevesClasse]);

  // Charger les données d'appel existantes pour la date/classe sélectionnée
  useEffect(() => {
    if (!selectedClasse) {
      setPresences({});
      return;
    }
    
    const appelExistant = appels.find(a => a.date === selectedDate && a.classeId === selectedClasse);
    const newPresences = {};
    
    if (appelExistant) {
      // Reprendre l'existant
      elevesClasse.forEach(e => {
        newPresences[e.id] = appelExistant.presences[e.id] || 'present';
      });
    } else {
      // Par défaut, tous présents
      elevesClasse.forEach(e => {
        newPresences[e.id] = 'present';
      });
    }
    setPresences(newPresences);
  }, [selectedClasse, selectedDate, appels, elevesClasse]);

  const handleStatutChange = (eleveId, statut) => {
    setPresences(prev => ({ ...prev, [eleveId]: statut }));
  };

  const handleEnregistrer = async () => {
    if (!selectedClasse || elevesClasse.length === 0) return;
    setIsSaving(true);
    await enregistrerAppel(selectedDate, selectedClasse, presences);
    setIsSaving(false);
  };

  // Filtrer l'historique de la classe sélectionnée (les 5 derniers appels)
  const historiqueClasse = appels
    .filter(a => a.classeId === selectedClasse && a.date !== selectedDate)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const statsCurrent = useMemo(() => {
    const vals = Object.values(presences);
    return {
      present: vals.filter(v => v === 'present').length,
      absent: vals.filter(v => v === 'absent').length,
      retard: vals.filter(v => v === 'retard').length,
    };
  }, [presences]);

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
      
      {/* En-tête */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <UserCheck size={28} color="var(--primary)" />
          {langue === 'fr' ? 'Présences' : 'Attendance'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
          {langue === 'fr' 
            ? 'Enregistrez les présences, absences et retards. Les retards seront automatiquement ajoutés au dossier discipline de l\'élève.'
            : 'Record presences, absences, and lateness. Lateness will be automatically added to the student\'s discipline record.'}
        </p>
      </div>

      {/* Contrôles (Date et Classe) */}
      <div className="card" style={{ padding: 20, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><School size={16} /> Classe</label>
          <select 
            className="form-control" 
            value={selectedClasse} 
            onChange={e => setSelectedClasse(e.target.value)}
          >
            <option value="">-- Sélectionnez une classe --</option>
            {classesAccessibles.map(c => (
              <option key={c.id} value={c.id}>{c.nom} ({c.section})</option>
            ))}
          </select>
        </div>
        
        <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 200 }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={16} /> Date</label>
          <input 
            type="date" 
            className="form-control" 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>
      </div>

      {selectedClasse ? (
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          {/* Liste des élèves */}
          <div className="card" style={{ flex: 3, minWidth: 320 }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">Liste des élèves ({elevesClasse.length})</h3>
              <div style={{ display: 'flex', gap: 12, fontSize: 13, fontWeight: 600 }}>
                <span style={{ color: 'var(--success)' }}>{statsCurrent.present} Présents</span>
                <span style={{ color: 'var(--danger)' }}>{statsCurrent.absent} Absents</span>
                <span style={{ color: '#D97706' }}>{statsCurrent.retard} Retards</span>
              </div>
            </div>
            
            <div className="card-body" style={{ padding: 0 }}>
              {elevesClasse.length === 0 ? (
                <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
                  Aucun élève actif dans cette classe.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {elevesClasse.map((eleve, index) => {
                    const statut = presences[eleve.id] || 'present';
                    return (
                      <div key={eleve.id} style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        padding: '12px 20px', 
                        borderBottom: index < elevesClasse.length - 1 ? '1px solid var(--border-color)' : 'none',
                        background: statut === 'absent' ? '#FEF2F2' : statut === 'retard' ? '#FFFBEB' : 'transparent',
                        transition: 'background 0.2s'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {eleve.photo ? (
                            <img src={eleve.photo} alt={eleve.nom} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                              {eleve.prenom[0]}{eleve.nom[0]}
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{eleve.prenom} {eleve.nom}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{eleve.matricule}</div>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: 8, background: 'var(--gray-100)', padding: 4, borderRadius: 8 }}>
                          <button 
                            className={`btn btn-sm ${statut === 'present' ? 'btn-success' : 'btn-ghost'}`}
                            onClick={() => handleStatutChange(eleve.id, 'present')}
                            style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, opacity: statut === 'present' ? 1 : 0.6 }}
                          >
                            <CheckCircle2 size={16} /> Présent
                          </button>
                          
                          <button 
                            className={`btn btn-sm ${statut === 'absent' ? 'btn-danger' : 'btn-ghost'}`}
                            onClick={() => handleStatutChange(eleve.id, 'absent')}
                            style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, opacity: statut === 'absent' ? 1 : 0.6 }}
                          >
                            <XCircle size={16} /> Absent
                          </button>

                          <button 
                            className={`btn btn-sm ${statut === 'retard' ? 'btn-warning' : 'btn-ghost'}`}
                            onClick={() => handleStatutChange(eleve.id, 'retard')}
                            style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, background: statut === 'retard' ? '#F59E0B' : 'transparent', color: statut === 'retard' ? 'white' : 'inherit', opacity: statut === 'retard' ? 1 : 0.6 }}
                          >
                            <AlertCircle size={16} /> Retard
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {elevesClasse.length > 0 && (
              <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', padding: 16, borderTop: '1px solid var(--border-color)' }}>
                <button 
                  className="btn btn-primary" 
                  onClick={handleEnregistrer} 
                  disabled={isSaving}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Save size={18} /> {isSaving ? 'Enregistrement...' : 'Enregistrer les présences'}
                </button>
              </div>
            )}
          </div>

          {/* Historique Sidebar */}
          <div className="card" style={{ flex: 1, minWidth: 260 }}>
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={18} /> Historique récent</h3>
            </div>
            <div className="card-body">
              {historiqueClasse.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>
                  Aucune présence précédente enregistrée pour cette classe.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {historiqueClasse.map(hist => {
                    const vals = Object.values(hist.presences);
                    const abs = vals.filter(v => v === 'absent').length;
                    const ret = vals.filter(v => v === 'retard').length;
                    return (
                      <div 
                        key={hist.id} 
                        style={{ padding: 12, border: '1px solid var(--border-color)', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}
                        onClick={() => setSelectedDate(hist.date)}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                      >
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                          {new Date(hist.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 12 }}>
                          {abs > 0 && <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{abs} Absent(s)</span>}
                          {ret > 0 && <span style={{ color: '#D97706', fontWeight: 600 }}>{ret} Retard(s)</span>}
                          {abs === 0 && ret === 0 && <span style={{ color: 'var(--success)', fontWeight: 600 }}>Tous présents</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <School size={48} color="var(--text-muted)" />
          <h3>Sélectionnez une classe</h3>
          <p>Choisissez une classe ci-dessus pour gérer les présences.</p>
        </div>
      )}

    </div>
  );
}
