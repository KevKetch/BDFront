/**
 * @file EvaluationsPage.jsx
 * @description Interface de définition des structures d'évaluation par classe et matière.
 * - Sélecteurs stylisés (cards interactifs)
 * - Ajustement automatique des pourcentages (total toujours = 100%)
 * - Accès enseignant limité à ses propres classes
 * - I18n complet FR/EN
 */
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import T from '../i18n/translations';
import { FileEdit, Lock, School, BookOpen, Trash2, Upload, Paperclip } from 'lucide-react';

export default function EvaluationsPage() {
  const {
    utilisateurActif, classes, matieres, evaluations,
    definirEvaluations, peutAcceder, langue,
    getMatieresClasse, notify,
  } = useApp();
  const t = T[langue] || T.fr;

  const [selectedSection,  setSelectedSection]  = useState('');
  const [selectedClasse,  setSelectedClasse]  = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [evalList,        setEvalList]        = useState([]);
  const [showSectionPicker,  setShowSectionPicker]  = useState(false);
  const [showClassePicker,  setShowClassePicker]  = useState(false);
  const [showMatierePicker, setShowMatierePicker] = useState(false);

  const isLarge = ['fondateur', 'directeur', 'admin'].includes(utilisateurActif?.role);

  const mesClassesIds = utilisateurActif?.classesIds?.length
    ? utilisateurActif.classesIds
    : [utilisateurActif?.classeId].filter(Boolean);

  const classesAccessibles = utilisateurActif?.role === 'enseignant'
    ? classes.filter(c => mesClassesIds.includes(c.id))
    : classes;

  const classesFiltrees = utilisateurActif?.role === 'enseignant'
    ? classesAccessibles
    : (isLarge ? (selectedSection ? classesAccessibles.filter(c => c.section === selectedSection) : []) : classesAccessibles);

  if (!peutAcceder('evaluations_ecriture')) {
    return (
      <div className="empty-state">
        <Lock size={52} color="var(--text-muted)" style={{ marginBottom: 16 }} />
        <h3>{t.accesNonAutorise}</h3>
      </div>
    );
  }

  const classe  = classesAccessibles.find(c => c.id === selectedClasse);
  const matieresClasse = selectedClasse ? getMatieresClasse(selectedClasse) : [];
  const matiere = matieresClasse.find(m => m.id === selectedMatiere);
  const existingEval = evaluations.find(
    e => e.classeId === selectedClasse && e.matiereId === selectedMatiere
  );

  // Charger les évaluations existantes à chaque changement de sélection
  useEffect(() => {
    if (existingEval) setEvalList([...existingEval.evaluations]);
    else setEvalList([]);
  }, [selectedClasse, selectedMatiere]);

  const totalPct = evalList.reduce((s, e) => s + parseFloat(e.percentage || 0), 0);

  /** Ajoute une évaluation. La nouvelle prend 0% et le total reste à 100% */
  const handleAdd = () => {
    setEvalList(prev => [...prev, { name: '', percentage: 0, epreuve: null }]);
  };

  /**
   * Modifie un champ d'une évaluation.
   * Si le champ est "percentage" et que la somme dépasse 100%,
   * on réduit automatiquement l'évaluation qui avait le plus grand pourcentage
   * (sauf la ligne en cours de modification) pour maintenir le total à 100%.
   */
  const handleChange = (index, field, value) => {
    setEvalList(prev => {
      const next = prev.map((e, i) => i === index ? { ...e, [field]: field === 'percentage' ? parseFloat(value) || 0 : value } : { ...e });

      if (field === 'percentage') {
        const total = next.reduce((s, e) => s + (parseFloat(e.percentage) || 0), 0);
        if (total > 100) {
          const overflow = total - 100;
          // Trouver l'évaluation avec le plus grand % (autre que la ligne modifiée)
          let maxIdx = -1, maxVal = -1;
          next.forEach((e, i) => {
            if (i !== index && (parseFloat(e.percentage) || 0) > maxVal) {
              maxVal = parseFloat(e.percentage) || 0;
              maxIdx = i;
            }
          });
          if (maxIdx >= 0) {
            next[maxIdx] = {
              ...next[maxIdx],
              percentage: Math.max(0, parseFloat(next[maxIdx].percentage) - overflow),
            };
          }
        }
      }
      return next;
    });
  };

  const handleRemove = (index) => {
    setEvalList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedClasse || !selectedMatiere) return;
    const total = evalList.reduce((s, e) => s + parseFloat(e.percentage || 0), 0);
    if (Math.abs(total - 100) > 0.01) {
      notify(t.totalDoit100, 'error'); return;
    }
    await definirEvaluations(selectedClasse, selectedMatiere, evalList);
    setEvalList([]);
  };

  const SECTION_COLORS = {
    francophone: '#1B4F72', anglophone: '#27AE60', bilingue: '#8E44AD',
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Titre ── */}
      <div>
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileEdit size={24} /> {t.definirEvaluations}
        </div>
        <div className="section-subtitle">
          {langue === 'fr'
            ? 'Définissez la structure de notation (types d\'évaluations et leurs poids) par matière.'
            : 'Define the grading structure (evaluation types and weights) per subject.'}
        </div>
      </div>

      {/* ── Ligne de sélecteurs ── */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>

        {/* Sélecteur Section (obligatoire pour admin/directeur/fondateur) */}
        {isLarge && (
          <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5 }}>Section</div>
            <div
              className={`select-card ${selectedSection ? 'active' : ''}`}
              onClick={() => { setShowSectionPicker(p => !p); setShowClassePicker(false); setShowMatierePicker(false); }}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: selectedSection ? (SECTION_COLORS[selectedSection] || 'var(--gray-300)') : 'var(--gray-300)' }} />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                  {selectedSection ? selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1) : 'Choisir une section'}
                </span>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: 11, transform: showSectionPicker ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▼</span>
            </div>
            {showSectionPicker && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 300, background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', marginTop: 4, overflow: 'hidden' }}>
                {['francophone', 'anglophone', 'bilingue'].map(sec => {
                  const color = SECTION_COLORS[sec];
                  return (
                    <div key={sec}
                      onClick={() => { setSelectedSection(sec); setSelectedClasse(''); setSelectedMatiere(''); setShowSectionPicker(false); }}
                      style={{ padding: '11px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: selectedSection === sec ? 'var(--gray-50)' : 'transparent', borderLeft: `3px solid ${selectedSection === sec ? color : 'transparent'}`, transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                      onMouseLeave={e => e.currentTarget.style.background = selectedSection === sec ? 'var(--gray-50)' : 'transparent'}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{sec.charAt(0).toUpperCase() + sec.slice(1)}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>({classesAccessibles.filter(c => c.section === sec).length} classe(s))</span>
                      {selectedSection === sec && <span style={{ color: '#27AE60', marginLeft: 'auto' }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Sélecteur Classe */}
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5, display: 'flex', alignItems: 'center', gap: 4 }}>
            <School size={14} /> {langue === 'fr' ? 'Classe' : 'Class'}
          </div>
          <div
            className={`select-card ${selectedClasse ? 'active' : ''}`}
            onClick={() => { if (!isLarge || selectedSection) { setShowClassePicker(p => !p); setShowMatierePicker(false); setShowSectionPicker(false); } }}
            style={{ cursor: isLarge && !selectedSection ? 'not-allowed' : 'pointer', opacity: isLarge && !selectedSection ? 0.5 : 1 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: classe ? (SECTION_COLORS[classe.section] || '#1B4F72') : 'var(--gray-300)' }} />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                {classe ? classe.nom : (isLarge && !selectedSection ? 'Choisir d\'abord une section' : t.selectionnerClasse)}
              </span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: 11, transform: showClassePicker ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▼</span>
          </div>

          {showClassePicker && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', marginTop: 4, overflow: 'hidden' }}>
              {classesFiltrees.length === 0 ? (
                <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>Aucune classe{isLarge && !selectedSection ? ' — choisissez d\'abord une section' : ''}</div>
              ) : classesFiltrees.map(c => {
                const color = SECTION_COLORS[c.section] || '#1B4F72';
                return (
                  <div key={c.id}
                    onClick={() => { setSelectedClasse(c.id); setSelectedMatiere(''); setShowClassePicker(false); }}
                    style={{ padding: '11px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, background: selectedClasse === c.id ? 'var(--gray-50)' : 'transparent', borderLeft: `3px solid ${selectedClasse === c.id ? color : 'transparent'}`, transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = selectedClasse === c.id ? 'var(--gray-50)' : 'transparent'}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{c.nom}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.section}</div>
                    </div>
                    {selectedClasse === c.id && <span style={{ color: '#27AE60' }}>✓</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sélecteur Matière */}
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: .5, display: 'flex', alignItems: 'center', gap: 4 }}>
            <BookOpen size={14} /> {langue === 'fr' ? 'Matière' : 'Subject'}
          </div>
          <div
            className={`select-card ${selectedMatiere ? 'active' : ''} ${!selectedClasse ? 'disabled' : ''}`}
            onClick={() => { if (selectedClasse) { setShowMatierePicker(p => !p); setShowClassePicker(false); } }}
            style={{ cursor: selectedClasse ? 'pointer' : 'not-allowed', opacity: selectedClasse ? 1 : 0.5 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BookOpen size={14} color="var(--text-secondary)" />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>
                {matiere ? matiere.nom : t.selectionnerMatiere}
              </span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: 11, transform: showMatierePicker ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▼</span>
          </div>

          {showMatierePicker && selectedClasse && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
              background: 'var(--bg-card)', border: '1.5px solid var(--border-color)',
              borderRadius: 12, boxShadow: 'var(--shadow-lg)', marginTop: 4, overflow: 'hidden',
            }}>
              {matieresClasse.length === 0 ? (
                <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
                  {t.aucuneMatiere}
                </div>
              ) : matieresClasse.map(m => {
                const hasEval = evaluations.some(e => e.classeId === selectedClasse && e.matiereId === m.id);
                return (
                  <div key={m.id}
                    onClick={() => { setSelectedMatiere(m.id); setShowMatierePicker(false); }}
                    style={{
                      padding: '11px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                      background: selectedMatiere === m.id ? 'var(--gray-50)' : 'transparent',
                      transition: 'background .15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = selectedMatiere === m.id ? 'var(--gray-50)' : 'transparent'}
                  >
                    <span style={{
                      fontSize: 11, fontWeight: 700, width: 22, height: 22, borderRadius: 6,
                      background: 'var(--gray-100)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: 'var(--text-secondary)', flexShrink: 0,
                    }}>{m.ordre}</span>
                    <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{m.nom}</span>
                    {hasEval && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, background: '#DCFCE7', color: '#166534',
                        padding: '2px 7px', borderRadius: 10,
                      }}>✓ {langue === 'fr' ? 'Définie' : 'Set'}</span>
                    )}
                    {selectedMatiere === m.id && <span style={{ color: '#27AE60' }}>✓</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Éditeur d'évaluations ── */}
      {selectedClasse && selectedMatiere && (
        <div className="card animate-fade">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                {t.evaluationsPour} <span style={{ color: 'var(--primary)' }}>{matiere?.nom}</span>
                {' '}{t.en} <span style={{ color: 'var(--primary)' }}>{classe?.nom}</span>
              </h3>
              {/* Barre de progression du total */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <div style={{
                  height: 6, flex: 1, background: 'var(--gray-100)', borderRadius: 99, maxWidth: 200
                }}>
                  <div style={{
                    height: '100%', borderRadius: 99, transition: 'width .3s, background .3s',
                    width: `${Math.min(100, totalPct)}%`,
                    background: Math.abs(totalPct - 100) < 0.01 ? '#27AE60' : totalPct > 100 ? '#E74C3C' : '#F39C12',
                  }} />
                </div>
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  color: Math.abs(totalPct - 100) < 0.01 ? '#27AE60' : totalPct > 100 ? '#E74C3C' : '#F39C12',
                }}>
                  {t.total} {totalPct.toFixed(0)}%
                </span>
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleAdd}>
              + {t.ajouterEvaluation.replace('+ ', '')}
            </button>
          </div>

          <div className="card-body">
            {evalList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                <FileEdit size={36} color="var(--gray-400)" style={{ margin: '0 auto 8px' }} />
                <div>{langue === 'fr' ? 'Aucune évaluation définie. Cliquez sur « Ajouter » pour commencer.' : 'No evaluation defined. Click "Add" to start.'}</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {evalList.map((ev, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 12, alignItems: 'center',
                    padding: '12px 16px', background: 'var(--gray-50)',
                    borderRadius: 10, border: '1px solid var(--border-color)',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, background: 'var(--primary)',
                      color: 'white', fontWeight: 700, fontSize: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>{i + 1}</div>
                    <input
                      className="form-control"
                      placeholder={t.nomEvaluation}
                      value={ev.name}
                      onChange={e => handleChange(i, 'name', e.target.value)}
                      style={{ flex: 1, margin: 0 }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="number" min="0" max="100" step="1"
                        className="form-control"
                        placeholder="%"
                        value={ev.percentage}
                        onChange={e => handleChange(i, 'percentage', e.target.value)}
                        style={{ width: 80, textAlign: 'center', margin: 0 }}
                      />
                      <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>%</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 120 }}>
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: 'var(--gray-200)', color: 'var(--text-secondary)' }} title="Ajouter une épreuve">
                        <Upload size={16} />
                        <input type="file" style={{ display: 'none' }} onChange={e => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = evFile => handleChange(i, 'epreuve', { name: file.name, url: evFile.target.result });
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </label>
                      {ev.epreuve && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--primary)', background: 'var(--primary-light)', padding: '4px 8px', borderRadius: 12, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: 100 }}>
                          <Paperclip size={12} flexShrink={0} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.epreuve.name}</span>
                        </div>
                      )}
                    </div>

                    <button
                      className="btn btn-danger btn-sm btn-icon"
                      onClick={() => handleRemove(i)}
                      style={{ padding: '6px 10px' }}
                    ><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {evalList.length > 0 && (
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setEvalList([])}>
                {t.annuler}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={Math.abs(totalPct - 100) > 0.01 || evalList.some(e => !e.name.trim())}
              >
                {t.sauvegarder}
              </button>
            </div>
          )}
        </div>
      )}

      {/* État vide */}
      {(!selectedClasse || !selectedMatiere) && (
        <div className="empty-state">
          <FileEdit size={52} color="var(--text-muted)" style={{ marginBottom: 16 }} />
          <h3>{langue === 'fr' ? 'Sélectionnez une classe et une matière' : 'Select a class and a subject'}</h3>
          <p>{langue === 'fr'
            ? 'Utilisez les sélecteurs ci-dessus pour configurer les évaluations.'
            : 'Use the selectors above to configure evaluations.'}</p>
        </div>
      )}
    </div>
  );
}