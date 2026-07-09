/**
 * @file BulletinsPage.jsx
 * @description Gestion des bulletins de notes.
 * - Saisie des notes, absences, appréciations.
 * - Rang calculé AUTOMATIQUEMENT (ne peut pas être saisi).
 * - Génération du bulletin final (PDF) avec en-tête officielle bilingue camerounaise.
 */
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import T from '../i18n/translations';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FileText, Download, FileSpreadsheet, ClipboardList } from 'lucide-react';

export default function BulletinsPage() {
  const {
    eleves, classes, notes, matieres, coefficients,
    enregistrerBulletin, utilisateurActif, peutAcceder, langue,
    calculerRang, getMoyenneFromBulletin, getMatieresClasse
  } = useApp();
  const t = T[langue] || T.fr;

  const role = utilisateurActif?.role;
  const isParent = role === 'parent';

  const [selectedEleve, setSelectedEleve] = useState('');
  const [annee, setAnnee] = useState(isParent ? '' : '2025-2026');
  const [sequence, setSequence] = useState(isParent ? '' : 'SEQ1');
  const [mode, setMode] = useState('view'); // 'view' | 'edit'
  const [form, setForm] = useState(null);
  const [searchEleve, setSearchEleve] = useState(''); // recherche par mot-clé
  const [showSuggestions, setShowSuggestions] = useState(false);

  const peutSaisir = peutAcceder('bulletins_ecriture');

  // Filtrage des élèves pour la sélection
  const elevesDispos = eleves.filter(e => {
    if (e.statut !== 'actif') return false;
    if (role === 'enseignant') {
      const mesClassesIds = utilisateurActif?.classesIds || [utilisateurActif?.classeId].filter(Boolean);
      return mesClassesIds.includes(e.classeId);
    }
    if (role === 'parent') return e.parentEmail === utilisateurActif?.email;
    return true;
  });

  // Filtrage par mot-clé (nom, prénom, matricule)
  const elevesFiltered = searchEleve.trim()
    ? elevesDispos.filter(e => {
        const q = searchEleve.toLowerCase();
        return e.nom.toLowerCase().includes(q)
          || e.prenom.toLowerCase().includes(q)
          || (e.matricule || '').toLowerCase().includes(q);
      })
    : elevesDispos;

  const currentEleve = eleves.find(e => e.id === selectedEleve);
  const currentClasse = classes.find(c => c.id === currentEleve?.classeId);
  const matieresClasse = currentClasse ? getMatieresClasse(currentClasse.id) : [];
  const existingBulletin = notes.find(n => n.eleveId === selectedEleve && n.sequence === sequence && n.anneeScolaire === annee);

  // Initialisation du formulaire
  const initForm = () => {
    if (existingBulletin) {
      setForm(JSON.parse(JSON.stringify(existingBulletin)));
    } else {
      setForm({
        eleveId: selectedEleve,
        sequence,
        anneeScolaire: annee || '2025-2026',
        notes: matieresClasse.map(m => ({ matiereId: m.id, noteFinale: '', appreciation: '' })),
        absences: 0, retards: 0, conduite: 'Bonne', soin: 'Soigné',
        ponctualite: 'Ponctuel', dateConseil: new Date().toISOString().slice(0, 10),
        appreciationGenerale: '',
        // Pas de rang manuel
      });
    }
    setMode('edit');
  };

  const handleNoteChange = (matiereId, field, value) => {
    setForm(prev => ({
      ...prev,
      notes: prev.notes.map(n => n.matiereId === matiereId ? { ...n, [field]: value } : n)
    }));
  };

  const saveBulletin = async () => {
    await enregistrerBulletin(form);
    setMode('view');
  };

  const telechargerBulletin = () => {
    if (!existingBulletin || !currentEleve || !currentClasse) return;
    
    const moyenne = getMoyenneFromBulletin(existingBulletin, currentClasse.id);
    const effectif = getElevesClasseLocal(currentClasse.id).length || currentClasse.effectif;
    const rang = calculerRang(currentEleve.id, currentClasse.id, sequence);

    const doc = new jsPDF('p', 'pt', 'a4');
    
    // Header
    doc.setFontSize(10);
    doc.text("RÉPUBLIQUE DU CAMEROUN", 40, 40);
    doc.text("Paix - Travail - Patrie", 40, 52);
    doc.text("MINISTÈRE DE L'ÉDUCATION DE BASE", 40, 70);
    doc.text("DÉLÉGATION RÉGIONALE DU CENTRE", 40, 82);
    doc.text("ÉCOLE LES ÉTOILES - YAOUNDÉ", 40, 94);

    doc.text("REPUBLIC OF CAMEROON", 400, 40);
    doc.text("Peace - Work - Fatherland", 400, 52);
    doc.text("MINISTRY OF BASIC EDUCATION", 400, 70);
    doc.text("CENTRE REGIONAL DELEGATION", 400, 82);
    doc.text("LES ÉTOILES SCHOOL - YAOUNDE", 400, 94);

    doc.setFontSize(14);
    doc.text(`Année Scolaire ${existingBulletin.anneeScolaire}`, 220, 110);

    doc.setFontSize(16);
    doc.text(`BULLETIN DE NOTES / REPORT CARD - ${sequence}`, 120, 140);

    doc.setFontSize(11);
    doc.text(`Nom / Name : ${currentEleve.nom.toUpperCase()}`, 40, 180);
    doc.text(`Prénom / First Name : ${currentEleve.prenom}`, 40, 195);
    doc.text(`Date & Lieu Naiss : ${currentEleve.dateNaissance} à ${currentEleve.lieuNaissance || 'Yaoundé'}`, 40, 210);
    doc.text(`Classe / Class : ${currentClasse.nom} (${currentClasse.section})`, 320, 180);
    doc.text(`Matricule / ID : ${currentEleve.matricule}`, 320, 195);
    doc.text(`Effectif / Size : ${effectif}`, 320, 210);

    const tableData = matieresClasse.map(m => {
      const noteObj = existingBulletin.notes.find(n => n.matiereId === m.id) || {};
      const coefObj = coefficients.find(c => c.classeId === currentClasse.id && c.matiereId === m.id);
      const coef = coefObj ? coefObj.coefficient : 1;
      const note = parseFloat(noteObj.noteFinale);
      const ponderee = !isNaN(note) ? (note * coef).toFixed(2) : '';
      return [m.nom, coef, !isNaN(note) ? note.toFixed(2) : '', ponderee, noteObj.appreciation || ''];
    });

    doc.autoTable({
      startY: 230,
      head: [['Matière / Subject', 'Coef.', 'Note /20', 'N. Pondérée', 'Appréciation / Comment']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [27, 79, 114] }
    });

    const finalY = doc.lastAutoTable.finalY || 230;

    doc.setFontSize(12);
    doc.text(`Moyenne Générale : ${moyenne} / 20`, 40, finalY + 30);
    doc.text(`Rang : ${rang || '-'} / ${effectif}`, 40, finalY + 45);
    doc.text(`Appréciation : ${existingBulletin.appreciationGenerale || '-'}`, 40, finalY + 60);

    doc.setFontSize(11);
    doc.text("Discipline:", 320, finalY + 30);
    doc.text(`Absences: ${existingBulletin.absences} h`, 320, finalY + 45);
    doc.text(`Retards: ${existingBulletin.retards}`, 320, finalY + 60);
    doc.text(`Conduite: ${existingBulletin.conduite}`, 320, finalY + 75);

    doc.text(`Yaoundé, le ${new Date().toLocaleDateString('fr-FR')}`, 350, finalY + 120);
    doc.text("Le Directeur / The Principal", 350, finalY + 140);
    doc.text("Le Parent / Parent", 40, finalY + 140);

    doc.save(`Bulletin_${currentEleve.matricule}_${sequence}.pdf`);
  };

  const telechargerExcel = () => {
    if (!existingBulletin || !currentEleve || !currentClasse) return;
    
    let csv = "Matiere,Coef,Note /20,Note Ponderee,Appreciation\n";
    matieresClasse.forEach(m => {
      const noteObj = existingBulletin.notes.find(n => n.matiereId === m.id) || {};
      const coefObj = coefficients.find(c => c.classeId === currentClasse.id && c.matiereId === m.id);
      const coef = coefObj ? coefObj.coefficient : 1;
      const note = parseFloat(noteObj.noteFinale);
      const ponderee = !isNaN(note) ? (note * coef).toFixed(2) : '';
      csv += `"${m.nom}",${coef},${!isNaN(note) ? note.toFixed(2) : ''},${ponderee},"${noteObj.appreciation || ''}"\n`;
    });

    const moyenne = getMoyenneFromBulletin(existingBulletin, currentClasse.id);
    const effectif = getElevesClasseLocal(currentClasse.id).length || currentClasse.effectif;
    const rang = calculerRang(currentEleve.id, currentClasse.id, sequence);

    csv += `\n\nMoyenne Generale,${moyenne}\n`;
    csv += `Rang,${rang}\n`;
    csv += `Effectif,${effectif}\n`;
    
    const blob = new Blob(["\ufeff", csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Bulletin_${currentEleve.matricule}_${sequence}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper local si getElevesClasse non dispo
  const getElevesClasseLocal = (id) => eleves.filter(e => e.classeId === id && e.statut === 'actif');

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
      
      {/* ── Entête ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ClipboardList size={24} /> {t.bulletins}
          </div>
          <div className="section-subtitle">{t.choisirEleveSeq}</div>
        </div>
        
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {/* Recherche par mot-clé */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <input
              className="form-control"
              placeholder="Rechercher un élève (nom, matricule...)"
              value={searchEleve}
              onChange={e => { setSearchEleve(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              style={{ paddingRight: 36 }}
            />
            {searchEleve && (
              <button
                onClick={() => { setSearchEleve(''); setSelectedEleve(''); setMode('view'); }}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16, lineHeight: 1 }}
              >✕</button>
            )}
            {/* Suggestions */}
            {showSuggestions && searchEleve && elevesFiltered.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 300, background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', marginTop: 4, overflow: 'hidden', maxHeight: 260, overflowY: 'auto' }}>
                {elevesFiltered.map(e => {
                  const cl = classes.find(c => c.id === e.classeId);
                  return (
                    <div key={e.id}
                      onMouseDown={() => { setSelectedEleve(e.id); setSearchEleve(`${e.prenom} ${e.nom}`); setShowSuggestions(false); setMode('view'); }}
                      style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border-color)', background: selectedEleve === e.id ? 'var(--gray-50)' : 'transparent' }}
                      onMouseEnter={el => el.currentTarget.style.background = 'var(--gray-50)'}
                      onMouseLeave={el => el.currentTarget.style.background = selectedEleve === e.id ? 'var(--gray-50)' : 'transparent'}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                        {e.prenom[0]}{e.nom[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{e.prenom} {e.nom}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.matricule} {cl ? `· ${cl.nom}` : ''}</div>
                      </div>
                      {selectedEleve === e.id && <span style={{ marginLeft: 'auto', color: 'var(--success)' }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
            {showSuggestions && searchEleve && elevesFiltered.length === 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 300, background: 'var(--bg-card)', border: '1.5px solid var(--border-color)', borderRadius: 10, boxShadow: 'var(--shadow-lg)', marginTop: 4, padding: '14px 16px', color: 'var(--text-muted)', fontSize: 13 }}>Aucun élève trouvé</div>
            )}
          </div>

          {/* OU : sélection via liste déroulante */}
          <select className="form-control" value={selectedEleve}
            onChange={e => { setSelectedEleve(e.target.value); setSearchEleve(''); setMode('view'); }}
            style={{ minWidth: 200, maxWidth: 260 }}
          >
            <option value="">{t.selectionnerEleve}</option>
            {elevesDispos.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom} — {e.matricule}</option>)}
          </select>

          {/* Année Académique */}
          <select className="form-control" value={annee} onChange={e => { setAnnee(e.target.value); setMode('view'); }} style={{ width: 140 }}>
            <option value="">Année</option>
            <option value="2023-2024">2023-2024</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2025-2026">2025-2026</option>
          </select>

          {/* Séquence */}
          <select className="form-control" value={sequence} onChange={e => { setSequence(e.target.value); setMode('view'); }} style={{ width: 140 }}>
            <option value="">Séquence</option>
            {['SEQ1', 'SEQ2', 'SEQ3', 'SEQ4', 'SEQ5', 'SEQ6', 'TRIM1', 'TRIM2', 'TRIM3'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Affichage Bulletin ── */}
      {selectedEleve && (!isParent || (annee && sequence)) ? (
        <div className="card animate-fade">
          <div className="card-header" style={{ background: 'var(--gray-50)' }}>
            <div>
              <h3 className="card-title">{currentEleve?.prenom} {currentEleve?.nom}</h3>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {currentClasse?.nom} · {currentEleve?.matricule} · {sequence} · {annee}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 12 }}>
              {mode === 'view' && existingBulletin && (
                <>
                  <button className="btn btn-primary" onClick={telechargerBulletin}>
                    <Download size={16} style={{ marginRight: 6 }} /> {t.telechargerPDF}
                  </button>
                  <button className="btn btn-secondary" onClick={telechargerExcel} style={{ background: '#27AE60', color: 'white', border: 'none' }}>
                    <FileSpreadsheet size={16} style={{ marginRight: 6 }} /> Excel (CSV)
                  </button>
                </>
              )}
              {mode === 'view' && peutSaisir && (
                <button className="btn btn-ghost" onClick={initForm}>
                  <FileText size={16} style={{ marginRight: 6 }} /> {existingBulletin ? t.modifierBulletin : t.saisirNotes}
                </button>
              )}
            </div>
          </div>

          <div className="card-body">
            {!existingBulletin && mode === 'view' ? (
              isParent && selectedEleve && (!annee || !sequence) ? (
                <div className="empty-state">
                  <FileText size={52} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                  <h3>Sélection incomplète</h3>
                  <p>Veuillez choisir une année académique et une séquence pour afficher le bulletin.</p>
                </div>
              ) : (
                <div className="empty-state">
                  <FileText size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
                  <h3>Bulletin non saisi</h3>
                  {peutSaisir && <p>Cliquez sur "Saisir les notes" pour commencer.</p>}
                </div>
              )
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Tableau des notes */}
                <div>
                  <h4 style={{ fontSize: 14, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 700 }}>
                    {t.noteParMatiere}
                  </h4>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>{t.matiere}</th>
                          <th style={{ width: 80, textAlign: 'center' }}>{t.coeff}</th>
                          <th style={{ width: 120 }}>{t.noteS20}</th>
                          {mode === 'view' && <th style={{ width: 120, textAlign: 'center' }}>{t.notePonderee}</th>}
                          <th>{t.appreciation}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {matieresClasse.map(m => {
                          const coefObj = coefficients.find(c => c.classeId === currentClasse?.id && c.matiereId === m.id);
                          const coef = coefObj ? coefObj.coefficient : 1;
                          
                          let noteObj;
                          if (mode === 'edit') {
                            noteObj = form.notes.find(n => n.matiereId === m.id) || { noteFinale: '', appreciation: '' };
                          } else {
                            noteObj = existingBulletin.notes.find(n => n.matiereId === m.id) || { noteFinale: '', appreciation: '' };
                          }

                          const noteVal = parseFloat(noteObj.noteFinale);
                          const ponderee = !isNaN(noteVal) ? (noteVal * coef).toFixed(2) : '—';

                          return (
                            <tr key={m.id}>
                              <td><strong>{m.nom}</strong></td>
                              <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{coef}</td>
                              <td>
                                {mode === 'edit' ? (
                                  <input type="number" step="0.25" min="0" max="20" className="form-control"
                                    value={noteObj.noteFinale} onChange={e => handleNoteChange(m.id, 'noteFinale', e.target.value)} />
                                ) : (
                                  <strong style={{ color: !isNaN(noteVal) && noteVal < 10 ? 'var(--danger)' : 'var(--text-primary)' }}>
                                    {noteObj.noteFinale}
                                  </strong>
                                )}
                              </td>
                              {mode === 'view' && (
                                <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                                  {ponderee}
                                </td>
                              )}
                              <td>
                                {mode === 'edit' ? (
                                  <input className="form-control" value={noteObj.appreciation} onChange={e => handleNoteChange(m.id, 'appreciation', e.target.value)} />
                                ) : (
                                  <span style={{ color: 'var(--text-muted)' }}>{noteObj.appreciation || '—'}</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Infos disciplinaires et appréciations globales */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  
                  <div style={{ background: 'var(--gray-50)', padding: 20, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: 14, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 16, fontWeight: 700 }}>
                      {t.elementsDisciplinaires}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div className="form-group">
                        <label className="form-label">{t.absences}</label>
                        {mode === 'edit' ? <input type="number" className="form-control" value={form.absences} onChange={e => setForm({...form, absences: e.target.value})} /> : <strong>{existingBulletin.absences} h</strong>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">{t.retards}</label>
                        {mode === 'edit' ? <input type="number" className="form-control" value={form.retards} onChange={e => setForm({...form, retards: e.target.value})} /> : <strong>{existingBulletin.retards}</strong>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">{t.conduite}</label>
                        {mode === 'edit' ? <input className="form-control" value={form.conduite} onChange={e => setForm({...form, conduite: e.target.value})} /> : <strong>{existingBulletin.conduite}</strong>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">{t.soinTravail}</label>
                        {mode === 'edit' ? <input className="form-control" value={form.soin} onChange={e => setForm({...form, soin: e.target.value})} /> : <strong>{existingBulletin.soin}</strong>}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'var(--gray-50)', padding: 20, borderRadius: 12, border: '1px solid var(--border-color)' }}>
                    <h4 style={{ fontSize: 14, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 16, fontWeight: 700 }}>
                      Bilan Séquence
                    </h4>
                    
                    {/* AFFICHAGE EN MODE VUE UNIQUEMENT POUR RANG ET MOYENNE */}
                    {mode === 'view' && (
                      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
                        <div style={{ flex: 1, background: 'white', padding: 12, borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{t.moyenneGenerale}</div>
                          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>
                            {getMoyenneFromBulletin(existingBulletin, currentClasse.id)}
                          </div>
                        </div>
                        <div style={{ flex: 1, background: 'white', padding: 12, borderRadius: 8, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{t.rangClasse}</div>
                          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-dark)' }}>
                            {calculerRang(currentEleve.id, currentClasse.id, sequence) || '-'} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/ {getElevesClasseLocal(currentClasse.id).length}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">{t.appreciationGenerale}</label>
                      {mode === 'edit' ? (
                        <textarea className="form-control" rows={3} value={form.appreciationGenerale} onChange={e => setForm({...form, appreciationGenerale: e.target.value})} placeholder={t.appreciationPlaceholder} />
                      ) : (
                        <div style={{ fontStyle: 'italic', color: 'var(--text-primary)', background: 'white', padding: 12, borderRadius: 8, border: '1px solid var(--border-color)' }}>
                          "{existingBulletin.appreciationGenerale || '—'}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {mode === 'edit' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                    <button className="btn btn-cancel" onClick={() => setMode('view')}>{t.annuler}</button>
                    <button className="btn btn-primary" onClick={saveBulletin}>{t.enregistrerBulletin}</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : isParent && selectedEleve && (!annee || !sequence) ? (
        <div className="empty-state">
          <FileText size={52} color="var(--text-muted)" style={{ marginBottom: 16 }} />
          <h3>Sélection incomplète</h3>
          <p>Veuillez choisir une année académique et une séquence pour afficher le bulletin.</p>
        </div>
      ) : (
        <div className="empty-state">
          <span style={{ fontSize: 52 }}>👩‍🎓</span>
          <h3>{t.selectionnerUnEleve}</h3>
          <p>{langue === 'fr' ? "Sélectionnez un élève et une séquence pour afficher ou saisir son bulletin de notes." : "Select a student and a sequence to view or enter their report card."}</p>
        </div>
      )}
    </div>
  );
}