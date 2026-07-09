/**
 * @file BanqueEpreuvesPage.jsx
 * @description Banque d'épreuves regroupant tous les sujets d'évaluation téléversés par les enseignants.
 * Permet la recherche, le filtrage et le téléchargement des épreuves.
 */
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import T from '../i18n/translations';
import { FileDown, Search, BookOpen, School, FileText, Download } from 'lucide-react';

export default function BanqueEpreuvesPage() {
  const { evaluations, classes, matieres, langue } = useApp();
  const t = T[langue] || T.fr;

  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedMatiere, setSelectedMatiere] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Récupérer toutes les épreuves téléversées
  const allExams = [];
  evaluations.forEach(evalGrp => {
    const classe = classes.find(c => c.id === evalGrp.classeId);
    const matiere = matieres.find(m => m.id === evalGrp.matiereId);

    if (evalGrp.evaluations) {
      evalGrp.evaluations.forEach(ev => {
        if (ev.epreuve && ev.epreuve.url) {
          allExams.push({
            id: `${evalGrp.id}-${ev.name}`,
            classeId: evalGrp.classeId,
            classeName: classe?.nom || 'Inconnue',
            matiereId: evalGrp.matiereId,
            matiereName: matiere?.nom || 'Inconnue',
            evalName: ev.name,
            epreuve: ev.epreuve
          });
        }
      });
    }
  });

  // Filtres disponibles
  const classesAvecEpreuves = classes.filter(c => allExams.some(ex => ex.classeId === c.id));
  const matieresUniques = [...new Set(allExams.map(ex => ex.matiereName))].sort();

  // Filtrer les épreuves selon la recherche et les sélections
  const filteredExams = allExams.filter(ex => {
    const matchClasse = selectedClasse ? ex.classeId === selectedClasse : true;
    const matchMatiere = selectedMatiere ? ex.matiereName === selectedMatiere : true;
    
    const query = searchQuery.toLowerCase().trim();
    const matchQuery = query
      ? ex.evalName.toLowerCase().includes(query) ||
        ex.epreuve.name.toLowerCase().includes(query) ||
        ex.matiereName.toLowerCase().includes(query) ||
        ex.classeName.toLowerCase().includes(query)
      : true;

    return matchClasse && matchMatiere && matchQuery;
  });

  // Gérer le téléchargement de l'épreuve (Data URL)
  const handleDownload = (epreuve) => {
    const link = document.createElement('a');
    link.href = epreuve.url;
    link.download = epreuve.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Titre de la page ── */}
      <div>
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileDown size={24} /> {t.banqueEpreuvesTitle}
        </div>
        <div className="section-subtitle">
          {t.sujetsTelechargement}
        </div>
      </div>

      {/* ── Section des filtres ── */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {/* Recherche textuelle */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{langue === 'fr' ? 'Rechercher' : 'Search'}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder={t.rechercherSujet}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              <Search
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          {/* Filtre Classe */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t.classe}</label>
            <select
              className="form-control"
              value={selectedClasse}
              onChange={e => setSelectedClasse(e.target.value)}
            >
              <option value="">{langue === 'fr' ? 'Toutes les classes' : 'All classes'}</option>
              {classesAvecEpreuves.map(c => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>

          {/* Filtre Matière */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">{t.matiere}</label>
            <select
              className="form-control"
              value={selectedMatiere}
              onChange={e => setSelectedMatiere(e.target.value)}
            >
              <option value="">{langue === 'fr' ? 'Toutes les matières' : 'All subjects'}</option>
              {matieresUniques.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Liste des épreuves ── */}
      {filteredExams.length === 0 ? (
        <div className="empty-state card" style={{ background: 'var(--bg-card)', padding: '60px 20px' }}>
          <FileText size={52} color="var(--text-muted)" style={{ marginBottom: 16 }} />
          <h3>{t.aucuneEpreuve}</h3>
          <p>
            {langue === 'fr' 
              ? 'Essayez de modifier vos filtres de recherche ou de téléverser des épreuves dans les Évaluations.' 
              : 'Try changing your search filters or uploading exams in Evaluations.'}
          </p>
        </div>
      ) : (
        <div className="card table-wrap animate-fade">
          <table>
            <thead>
              <tr>
                <th><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><BookOpen size={14} /> {t.matiere}</div></th>
                <th><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><School size={14} /> {t.classe}</div></th>
                <th>{langue === 'fr' ? 'Évaluation' : 'Evaluation'}</th>
                <th>{t.sujetFichier}</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredExams.map(ex => (
                <tr key={ex.id}>
                  <td style={{ fontWeight: 600 }}>{ex.matiereName}</td>
                  <td>
                    <span className="badge badge-primary">{ex.classeName}</span>
                  </td>
                  <td>{ex.evalName}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <FileText size={14} color="var(--primary)" />
                      {ex.epreuve.name}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-save btn-sm"
                      onClick={() => handleDownload(ex.epreuve)}
                      style={{ padding: '6px 14px', borderRadius: 8 }}
                      title={t.telecharger}
                    >
                      <Download size={14} />
                      <span className="no-print">{t.telecharger}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
