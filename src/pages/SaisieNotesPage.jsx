import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import T from '../i18n/translations';
import { FileEdit, CheckCircle2, User, BookOpen, Clock, BarChart3, Save, School } from 'lucide-react';

/* ── Auto-appréciation selon la note ─── */
function getAppreciation(note) {
  if (note === '' || note === undefined || note === null || isNaN(note)) return '';
  const n = parseFloat(note);
  if (n >= 16) return 'Excellent';
  if (n >= 14) return 'Très Bien';
  if (n >= 12) return 'Bien';
  if (n >= 10) return 'Assez Bien';
  if (n >= 8)  return 'Passable';
  if (n >= 6)  return 'Médiocre';
  return 'Insuffisant';
}

export default function SaisieNotesPage() {
  const {
    utilisateurActif, classes, matieres, eleves, notes, evaluations, coefficients,
    peutAcceder, getMatieresClasse, getElevesClasse, updateNotesMasse, langue, calculateNoteFinale
  } = useApp();
  
  const t = T[langue] || T.fr;

  const mesClassesIds = utilisateurActif?.classesIds?.length
    ? utilisateurActif.classesIds
    : [utilisateurActif?.classeId].filter(Boolean);

  const classesAccessibles = utilisateurActif?.role === 'enseignant'
    ? classes.filter(c => mesClassesIds.includes(c.id))
    : classes;

  const [selectedSection, setSelectedSection] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [selectedSequence, setSelectedSequence] = useState('SEQ1');

  const isLarge = utilisateurActif?.role !== 'enseignant';
  const classesFiltrees = utilisateurActif?.role === 'enseignant'
    ? classesAccessibles
    : (isLarge && selectedSection ? classesAccessibles.filter(c => c.section === selectedSection) : (isLarge ? [] : classesAccessibles));
  
  const [localData, setLocalData] = useState({});
  
  const classe = classesAccessibles.find(c => c.id === selectedClasse);
  const matieresClasse = selectedClasse ? getMatieresClasse(selectedClasse) : [];
  const matiere = matieresClasse.find(m => m.id === selectedMatiere);
  
  const elevesDeClasse = selectedClasse ? getElevesClasse(selectedClasse) : [];
  
  const evalStructure = useMemo(() => {
    if (!selectedClasse || !selectedMatiere) return [];
    const exist = evaluations.find(e => e.classeId === selectedClasse && e.matiereId === selectedMatiere);
    return exist ? exist.evaluations : [];
  }, [selectedClasse, selectedMatiere, evaluations]);

  useEffect(() => {
    if (!selectedClasse || !selectedMatiere || !selectedSequence) {
      setLocalData({});
      return;
    }
    
    const newData = {};
    elevesDeClasse.forEach(eleve => {
      const bulletin = notes.find(n => n.eleveId === eleve.id && n.sequence === selectedSequence);
      const noteMatiere = bulletin?.notes?.find(n => n.matiereId === selectedMatiere);
      
      const evals = evalStructure.map((struct, idx) => {
        const existingEval = noteMatiere?.evaluations?.find(e => e.name === struct.name) || noteMatiere?.evaluations?.[idx];
        return {
          name: struct.name,
          note: existingEval?.note !== undefined ? existingEval.note : ''
        };
      });

      const noteFinale = calculateNoteFinale(evals, evalStructure);

      newData[eleve.id] = {
        evaluations: evals,
        noteFinale,
        appreciation: noteMatiere?.appreciation || getAppreciation(noteFinale),
      };
    });
    setLocalData(newData);
  }, [selectedClasse, selectedMatiere, selectedSequence, elevesDeClasse.length, evalStructure, notes]);

  const handleNoteChange = (eleveId, evalIndex, value) => {
    const val = value === '' ? '' : Math.max(0, Math.min(20, parseFloat(value) || 0));
    setLocalData(prev => {
      const next = { ...prev };
      const newEvals = [...next[eleveId].evaluations];
      newEvals[evalIndex] = { ...newEvals[evalIndex], note: val };
      
      const noteFinale = calculateNoteFinale(newEvals, evalStructure);
      next[eleveId] = {
        ...next[eleveId],
        evaluations: newEvals,
        noteFinale,
        appreciation: getAppreciation(noteFinale),
      };
      return next;
    });
  };

  const handleAppreciationChange = (eleveId, value) => {
    setLocalData(prev => ({
      ...prev,
      [eleveId]: {
        ...prev[eleveId],
        appreciation: value
      }
    }));
  };

  const handleSave = async () => {
    if (!selectedClasse || !selectedMatiere || !selectedSequence) return;
    await updateNotesMasse(selectedClasse, selectedMatiere, selectedSequence, localData);
  };

  if (!peutAcceder('bulletins_ecriture')) {
    return (
      <div className="empty-state">
        <FileEdit size={52} color="var(--text-muted)" style={{ marginBottom: 16 }} />
        <h3>Accès Restreint</h3>
      </div>
    );
  }

  const nbEleves = elevesDeClasse.length;
  const nbCompletes = Object.values(localData).filter(data => 
    data.evaluations.length > 0 && data.evaluations.every(e => e.note !== '')
  ).length;
  const progression = nbEleves > 0 ? Math.round((nbCompletes / nbEleves) * 100) : 0;

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 100 }}>
      {/* ── Sélecteurs unifiés ── */}
      <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {/* Section (uniquement pour admin/directeur/fondateur) */}
          {isLarge && (
            <div style={{ flex: 1, minWidth: 160 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, display: 'block', textTransform: 'uppercase' }}>Section</label>
              <select className="form-control" value={selectedSection}
                onChange={e => { setSelectedSection(e.target.value); setSelectedClasse(''); setSelectedMatiere(''); }}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: selectedSection ? '1.5px solid var(--primary)' : '1px solid var(--border-color)', fontWeight: 600, color: selectedSection ? 'var(--primary)' : 'inherit' }}
              >
                <option value="">— Section —</option>
                <option value="francophone">Francophone</option>
                <option value="anglophone">Anglophone</option>
                <option value="bilingue">Bilingue</option>
              </select>
            </div>
          )}

          {/* Classe */}
          <div style={{ flex: 1, minWidth: 200 }}>
             <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase' }}>
               <School size={16} /> CLASSE
             </label>
             <select className="form-control" value={selectedClasse}
               onChange={e => { setSelectedClasse(e.target.value); setSelectedMatiere(''); }}
               disabled={isLarge && !selectedSection}
               style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-color)', fontWeight: 600, opacity: isLarge && !selectedSection ? 0.5 : 1 }}
             >
               <option value="">{isLarge && !selectedSection ? '— Choisir une section d\'abord —' : '— Sélectionner —'}</option>
               {classesFiltrees.map(c => <option key={c.id} value={c.id}>{c.nom} ({getElevesClasse(c.id).length} élèves)</option>)}
             </select>
          </div>
          
          {/* Matière */}
          <div style={{ flex: 1, minWidth: 200 }}>
             <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase' }}>
               <BookOpen size={16} /> MATIÈRE
             </label>
             <select className="form-control" value={selectedMatiere} onChange={e => setSelectedMatiere(e.target.value)} disabled={!selectedClasse} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: selectedMatiere ? '1.5px solid var(--primary)' : '1px solid var(--border-color)', fontWeight: 600, color: selectedMatiere ? 'var(--primary)' : 'inherit', opacity: selectedClasse ? 1 : 0.5 }}>
                <option value="">— Sélectionner —</option>
                {matieresClasse.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
             </select>
          </div>

          {/* Séquence */}
          <div style={{ width: 150 }}>
             <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase' }}>
               <Clock size={16} /> SÉQUENCE
             </label>
             <select className="form-control" value={selectedSequence} onChange={e => setSelectedSequence(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-color)', fontWeight: 600 }}>
                {['SEQ1', 'SEQ2', 'SEQ3', 'SEQ4', 'SEQ5', 'SEQ6'].map(seq => <option key={seq} value={seq}>{seq}</option>)}
             </select>
          </div>
        </div>

        {/* Évaluations Pill */}
        {selectedClasse && selectedMatiere && (
          evalStructure.length > 0 ? (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'rgba(41,128,185,.08)', padding: '12px 20px', borderRadius: 8 }}>
              <span style={{ fontWeight: 600, color: 'var(--primary)', fontSize: 14 }}>Évaluations :</span>
              {evalStructure.map((e, i) => (
                <span key={i} style={{ background: '#74b9ff', color: 'white', padding: '4px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                  {e.name} ({e.percentage}%)
                </span>
              ))}
            </div>
          ) : (
            <div style={{ padding: '12px 20px', background: 'rgba(231,76,60,.1)', color: '#E74C3C', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
              Aucune structure d'évaluation définie pour cette matière. Veuillez d'abord définir les évaluations.
            </div>
          )
        )}
      </div>

      {/* ── KPIs ── */}
      {selectedClasse && selectedMatiere && (
        <>
          <div style={{ display: 'flex', gap: 16 }}>
            <div className="card" style={{ flex: 1, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <User size={28} color="#2980B9" />
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{nbEleves}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>ÉLÈVES</div>
              </div>
            </div>
            
            <div className="card" style={{ flex: 1, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <CheckCircle2 size={28} color="#27AE60" />
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{nbCompletes}/{nbEleves}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>COMPLÉTÉS</div>
              </div>
            </div>

            <div className="card" style={{ flex: 1, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <BarChart3 size={28} color="#F39C12" />
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{progression}%</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>PROGRESSION</div>
              </div>
            </div>

            <div className="card" style={{ flex: 2, padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
               <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Avancement</div>
               <div style={{ height: 6, background: 'var(--gray-200)', borderRadius: 99, overflow: 'hidden' }}>
                 <div style={{ height: '100%', width: `${progression}%`, background: progression === 100 ? '#27AE60' : 'var(--primary)', borderRadius: 99, transition: 'width 0.3s' }} />
               </div>
            </div>
          </div>

          {/* ── Table de Saisie des Notes ── */}
          <div className="card animate-fade" style={{ overflow: 'hidden' }}>
            {/* En-tête décorative du tableau */}
            <div style={{ background: 'linear-gradient(135deg, #0D2B40 0%, #1B4F72 60%, #2980B9 100%)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileEdit size={20} color="white" />
                </div>
                <div>
                  <div style={{ color: 'white', fontSize: 16, fontWeight: 700, fontFamily: 'Playfair Display, serif' }}>Tableau de Saisie des Notes</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 }}>{matiere?.nom} — {classe?.nom} — {selectedSequence}</div>
                </div>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>{nbEleves} élèves</span>
                <span style={{ background: progression === 100 ? 'rgba(39,174,96,0.3)' : 'rgba(243,156,18,0.3)', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>{progression}% complété</span>
              </div>
            </div>
            <div className="table-responsive" style={{ maxHeight: 500, overflowY: 'auto' }}>
              <table className="table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr style={{ background: 'var(--gray-50)', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ color: 'var(--text-primary)', padding: '14px 24px', minWidth: 220, textTransform: 'uppercase', fontSize: 11, fontWeight: 700, letterSpacing: 1, borderRight: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <User size={14} color="var(--primary)" />
                        Nom de l'Élève
                      </div>
                    </th>
                    
                    {evalStructure.map((e, i) => (
                      <th key={i} style={{ color: 'var(--text-primary)', padding: '14px 12px', textAlign: 'center', minWidth: 100, borderRight: '1px solid var(--border-color)' }}>
                        <div style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>{e.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 600, marginTop: 3 }}>{e.percentage}%</div>
                      </th>
                    ))}

                    <th style={{ color: '#B7791F', padding: '14px 12px', textAlign: 'center', textTransform: 'uppercase', fontSize: 11, fontWeight: 700, minWidth: 130, background: 'rgba(243,156,18,0.06)', borderRight: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <BarChart3 size={14} color="#B7791F" />
                        Note Définitive
                      </div>
                    </th>

                    <th style={{ color: '#1E7A4A', padding: '14px 12px', textAlign: 'center', textTransform: 'uppercase', fontSize: 11, fontWeight: 700, minWidth: 160, background: 'rgba(39,174,96,0.05)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <CheckCircle2 size={14} color="#1E7A4A" />
                        Appréciation
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {elevesDeClasse.map((eleve) => {
                    const rowData = localData[eleve.id] || {};
                    const noteFinale = rowData.noteFinale;
                    const noteColor = noteFinale >= 10 ? '#27AE60' : noteFinale > 0 ? '#E74C3C' : 'var(--text-primary)';
                    return (
                      <tr key={eleve.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{eleve.nom} {eleve.prenom}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{eleve.matricule}</div>
                        </td>

                        {evalStructure.map((ev, i) => (
                          <td key={i} style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <input 
                              type="number" step="0.25" min="0" max="20"
                              style={{ width: 60, border: '1.5px solid var(--border-color)', background: 'var(--bg-input)', borderRadius: 6, padding: '8px', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', textAlign: 'center', outline: 'none' }}
                              placeholder="—"
                              value={rowData.evaluations?.[i]?.note !== undefined ? rowData.evaluations[i].note : ''}
                              onChange={e => handleNoteChange(eleve.id, i, e.target.value)}
                              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                              onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                            />
                          </td>
                        ))}

                        {/* Note Définitive */}
                        <td style={{ padding: '12px 8px', textAlign: 'center', background: 'rgba(243,156,18,0.04)' }}>
                          <span style={{ fontWeight: 700, fontSize: 16, color: noteColor }}>
                            {noteFinale !== undefined && noteFinale > 0 ? noteFinale.toFixed(2) : '—'}
                          </span>
                        </td>

                        {/* Appréciation */}
                        <td style={{ padding: '12px 8px', textAlign: 'center', background: 'rgba(39,174,96,0.03)' }}>
                          <input 
                            type="text"
                            style={{ width: '100%', maxWidth: 140, border: '1.5px solid var(--border-color)', background: 'var(--bg-input)', borderRadius: 6, padding: '8px', fontSize: 13, color: 'var(--text-primary)', textAlign: 'center', outline: 'none', fontWeight: 500 }}
                            value={rowData.appreciation || ''}
                            onChange={e => handleAppreciationChange(eleve.id, e.target.value)}
                            placeholder="Auto"
                            onFocus={e => e.target.style.borderColor = '#27AE60'}
                            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Bottom Sticky Action Bar */}
          <div className="notes-action-bar">
            <div className="notes-action-copy" style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600 }}>
               <span style={{ color: 'var(--text-primary)' }}>{matiere?.nom}</span> · {classe?.nom} · {selectedSequence} <span style={{ marginLeft: 8 }}>{nbCompletes}/{nbEleves} élève(s) prêt(s)</span>
            </div>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={evalStructure.length === 0}
              style={{ 
                padding: '12px 24px', 
                fontSize: 15, 
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Save size={18} /> Enregistrer {nbCompletes} bulletin(s)
            </button>
          </div>
        </>
      )}

      {/* État vide */}
      {(!selectedClasse || !selectedMatiere) && (
        <div className="empty-state">
          <BookOpen size={52} color="var(--text-muted)" style={{ marginBottom: 16 }} />
          <h3>Saisie de Notes</h3>
          <p>Sélectionnez une classe et une matière pour commencer la saisie des notes.</p>
        </div>
      )}
    </div>
  );
}
