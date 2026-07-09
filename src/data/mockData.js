/**
 * @file mockData.js
 * @description Données complètes de démonstration pour l'application de gestion scolaire.
 * École Les Étoiles — Yaoundé, Cameroun — Année scolaire 2025-2026
 */

// ── UTILISATEURS ────────────────────────────────────────────────────────────────
const users = [
  {
    id: 'u0',
    nom: 'System', prenom: 'Admin',
    email: 'admin@ecole.cm', motDePasse: 'root', role: 'admin',
    photo: null, actif: true, classeId: null, classesIds: [],
    dateNaissance: '1985-01-01', lieuNaissance: 'Yaoundé',
    numeroCNI: '000000000', telephone: '000000000',
    quartier: 'Admin, Yaoundé', dateEmbauche: '2010-01-01'
  },
  {
    id: 'u1',
    nom: 'Tchamba', prenom: 'Rose',
    email: 'directeur@ecole.cm', motDePasse: '1234', role: 'directeur',
    photo: null, actif: true, classeId: null, classesIds: [],
    dateNaissance: '1980-04-12', lieuNaissance: 'Yaoundé',
    numeroCNI: '123456789', telephone: '677001122',
    quartier: 'Bastos, Yaoundé', dateEmbauche: '2015-09-01'
  },
  {
    id: 'u2',
    nom: 'Kamga', prenom: 'Emmanuel',
    email: 'fondateur@ecole.cm', motDePasse: '1234', role: 'fondateur',
    photo: null, actif: true, classeId: null, classesIds: [],
    dateNaissance: '1972-11-03', lieuNaissance: 'Bafoussam',
    numeroCNI: '987654321', telephone: '699887766',
    quartier: 'Nlongkak, Yaoundé', dateEmbauche: '2010-09-01'
  },
  {
    id: 'u3',
    nom: 'Nkomo', prenom: 'Albert',
    email: 'enseignant@ecole.cm', motDePasse: '1234', role: 'enseignant',
    photo: null, actif: true, classeId: 'c4', classesIds: ['c4', 'c5'],
    dateNaissance: '1988-07-22', lieuNaissance: 'Douala',
    numeroCNI: '456123789', telephone: '655443322',
    quartier: 'Mvan, Yaoundé', dateEmbauche: '2019-09-01'
  },
  {
    id: 'u4',
    nom: 'Ebongue', prenom: 'Marie',
    email: 'parent@ecole.cm', motDePasse: '1234', role: 'parent',
    photo: null, actif: true, classeId: null, classesIds: [],
    dateNaissance: '1990-02-14', lieuNaissance: 'Ebolowa',
    numeroCNI: '321654987', telephone: '676543210',
    quartier: 'Essos, Yaoundé', dateEmbauche: null
  },
  {
    id: 'u5',
    nom: 'Sanda', prenom: 'Pierre',
    email: 'sanda.pierre@ecole.cm', motDePasse: '1234', role: 'enseignant',
    photo: null, actif: true, classeId: 'c1', classesIds: ['c1', 'c2'],
    dateNaissance: '1992-05-18', lieuNaissance: 'Bamenda',
    numeroCNI: '112233445', telephone: '677552211',
    quartier: 'Olezoa, Yaoundé', dateEmbauche: '2018-09-01'
  },
  {
    id: 'u6',
    nom: 'Mvogo', prenom: 'Christine',
    email: 'mvogo.christine@ecole.cm', motDePasse: '1234', role: 'enseignant',
    photo: null, actif: true, classeId: 'c3', classesIds: ['c3', 'c6'],
    dateNaissance: '1986-11-25', lieuNaissance: 'Kribi',
    numeroCNI: '556677889', telephone: '655667788',
    quartier: 'Nkondengui, Yaoundé', dateEmbauche: '2017-09-01'
  },
  {
    id: 'u7',
    nom: 'Mengue', prenom: 'David',
    email: 'mengue.david@ecole.cm', motDePasse: '1234', role: 'enseignant',
    photo: null, actif: true, classeId: 'c7', classesIds: ['c7', 'c8'],
    dateNaissance: '1989-03-10', lieuNaissance: 'Edéa',
    numeroCNI: '778899001', telephone: '677778899',
    quartier: 'Etoa-Meki, Yaoundé', dateEmbauche: '2019-09-01'
  },
  {
    id: 'u8',
    nom: 'Toukam', prenom: 'Yvette',
    email: 'toukam.yvette@ecole.cm', motDePasse: '1234', role: 'enseignant',
    photo: null, actif: true, classeId: 'c9', classesIds: ['c9', 'c10'],
    dateNaissance: '1991-08-14', lieuNaissance: 'Yaoundé',
    numeroCNI: '334455667', telephone: '699334455',
    quartier: 'Kondengui, Yaoundé', dateEmbauche: '2020-09-01'
  },
  {
    id: 'u9',
    nom: 'Fopa', prenom: 'Thomas',
    email: 'fopa.thomas@ecole.cm', motDePasse: '1234', role: 'enseignant',
    photo: null, actif: true, classeId: 'c11', classesIds: ['c11', 'c12'],
    dateNaissance: '1987-12-03', lieuNaissance: 'Douala',
    numeroCNI: '990011223', telephone: '676990011',
    quartier: 'Nfandena, Yaoundé', dateEmbauche: '2018-09-01'
  },
  {
    id: 'u10',
    nom: 'Kenyata', prenom: 'Sophie',
    email: 'kenyata.sophie@ecole.cm', motDePasse: '1234', role: 'enseignant',
    photo: null, actif: true, classeId: 'c13', classesIds: ['c13'],
    dateNaissance: '1993-06-20', lieuNaissance: 'Yaoundé',
    numeroCNI: '445566778', telephone: '677445566',
    quartier: 'Mballa II, Yaoundé', dateEmbauche: '2021-09-01'
  }
];

// ── CLASSES ──────────────────────────────────────────────────────────────────────
const classes = [
  { id: 'c1', nom: 'PS A', niveau: 'PS', section: 'francophone', annee: '2025-2026', effectif: 22, enseignantId: 'u5', salle: 'S01' },
  { id: 'c2', nom: 'PS B', niveau: 'PS', section: 'anglophone', annee: '2025-2026', effectif: 24, enseignantId: 'u5', salle: 'S02' },
  { id: 'c3', nom: 'MS', niveau: 'MS', section: 'bilingue', annee: '2025-2026', effectif: 20, enseignantId: 'u6', salle: 'S03' },
  { id: 'c4', nom: 'GS A', niveau: 'GS', section: 'francophone', annee: '2025-2026', effectif: 18, enseignantId: 'u3', salle: 'S04' },
  { id: 'c5', nom: 'CP A', niveau: 'CP', section: 'francophone', annee: '2025-2026', effectif: 26, enseignantId: 'u3', salle: 'S05' },
  { id: 'c6', nom: 'CP B', niveau: 'CP', section: 'bilingue', annee: '2025-2026', effectif: 24, enseignantId: 'u6', salle: 'S06' },
  { id: 'c7', nom: 'CE1 A', niveau: 'CE1', section: 'francophone', annee: '2025-2026', effectif: 23, enseignantId: 'u7', salle: 'S07' },
  { id: 'c8', nom: 'CE1 B', niveau: 'CE1', section: 'anglophone', annee: '2025-2026', effectif: 21, enseignantId: 'u7', salle: 'S08' },
  { id: 'c9', nom: 'CE2 A', niveau: 'CE2', section: 'francophone', annee: '2025-2026', effectif: 25, enseignantId: 'u8', salle: 'S09' },
  { id: 'c10', nom: 'CE2 B', niveau: 'CE2', section: 'bilingue', annee: '2025-2026', effectif: 22, enseignantId: 'u8', salle: 'S10' },
  { id: 'c11', nom: 'CM1 A', niveau: 'CM1', section: 'francophone', annee: '2025-2026', effectif: 24, enseignantId: 'u9', salle: 'S11' },
  { id: 'c12', nom: 'CM1 B', niveau: 'CM1', section: 'anglophone', annee: '2025-2026', effectif: 23, enseignantId: 'u9', salle: 'S12' },
  { id: 'c13', nom: 'CM2', niveau: 'CM2', section: 'francophone', annee: '2025-2026', effectif: 20, enseignantId: 'u10', salle: 'S13' },
];

// Génération des données d'élèves
const nomsPrenomsM = ['Fouda', 'Mbarga', 'Nkomo', 'Sanda', 'Mengue', 'Fopa', 'Toukam', 'Kenyata', 'Mvogo', 'Tekpa', 'Etounga', 'Ondobo', 'Enow', 'Metuge', 'Atemkeng', 'Ombang', 'Balla', 'Makpa', 'Ngu', 'Mokanda', 'Engome', 'Bessala', 'Akamba', 'Tsonge', 'Nkwa', 'Yonga', 'Mboua', 'Ndongmo', 'Epeta', 'Nyong', 'Ewane', 'Ayamba'];
const nomsPrenomsF = ['Tchamba', 'Ebongue', 'Mvogo', 'Sakam', 'Tagne', 'Enow', 'Kenyata', 'Biyene', 'Sanda', 'Ngambi', 'Kamkeng', 'Mboumbouo', 'Akindi', 'Mambo', 'Iyene', 'Teta', 'Nkono', 'Enjema', 'Mboum', 'Senkeu', 'Nsabang', 'Minang', 'Sube', 'Mbob', 'Engo', 'Togara', 'Edjankoume', 'Mbangue', 'Bozom', 'Magne', 'Tina', 'Siba'];
const prenoms = ['Kevin', 'Jean', 'Marie', 'Pierre', 'Sophie', 'David', 'Anne', 'Paul', 'Julie', 'Marc', 'Isabelle', 'Jean-Paul', 'Sandrine', 'Robert', 'Christine', 'Christophe', 'Vanessa', 'Luc', 'Célia', 'Olivier', 'Maud', 'Laurent', 'Nicole', 'Vincent', 'Florence'];
const quartiers = ['Bastos', 'Mvan', 'Essos', 'Olezoa', 'Nkondengui', 'Etoa-Meki', 'Kondengui', 'Nfandena', 'Mballa II', 'Yaoundé 1', 'Yaoundé 3', 'Yaoundé 6', 'Elig-Essono', 'Biyem-Assi', 'Mendong', 'Acacia'];
const villes = ['Yaoundé', 'Douala', 'Bafoussam', 'Bamenda', 'Kribi', 'Edéa', 'Ebolowa', 'Buea'];

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function genererEleve(id, classeId, num) {
  const sexe = seededRandom(id * 2) > 0.5 ? 'M' : 'F';
  const nomListe = sexe === 'M' ? nomsPrenomsM : nomsPrenomsF;
  const nom = nomListe[Math.floor(seededRandom(id * 3) * nomListe.length)];
  const prenom = prenoms[Math.floor(seededRandom(id * 5) * prenoms.length)];
  const anneeNaiss = 2015 + Math.floor(seededRandom(id * 7) * 6);
  const moisNaiss = Math.floor(seededRandom(id * 11) * 12);
  const jourNaiss = 1 + Math.floor(seededRandom(id * 13) * 28);
  const dateNaiss = `${anneeNaiss}-${String(moisNaiss + 1).padStart(2, '0')}-${String(jourNaiss).padStart(2, '0')}`;
  const lieuNaiss = villes[Math.floor(seededRandom(id * 17) * villes.length)];
  const quartier = quartiers[Math.floor(seededRandom(id * 19) * quartiers.length)];
  const avecBus = seededRandom(id * 23) > 0.6;
  
  const parentNom = nomsPrenomsM[Math.floor(seededRandom(id * 29) * nomsPrenomsM.length)];
  const parentPrenom = prenoms[Math.floor(seededRandom(id * 31) * prenoms.length)];
  const parentEmail = `${parentNom.toLowerCase()}.${parentPrenom.toLowerCase()}${num}@gmail.cm`;
  const phone1 = String(Math.floor(seededRandom(id * 37) * 10));
  const phone2 = String(Math.floor(seededRandom(id * 41) * 10));
  const phone3 = String(Math.floor(seededRandom(id * 43) * 10));
  const phone4 = String(Math.floor(seededRandom(id * 47) * 1000000)).padStart(6, '0');
  const parentTel = `67${phone1}${phone2}${phone3}${phone4}`;
  
  return {
    id: `e${id}`,
    matricule: `MAT-2025-${String(id).padStart(3, '0')}`,
    nom,
    prenom,
    dateNaissance: dateNaiss,
    lieuNaissance: lieuNaiss,
    sexe,
    classeId,
    section: classes.find(c => c.id === classeId)?.section || 'francophone',
    photo: null,
    adresse: `${quartier}, Yaoundé`,
    nomPere: `${parentNom} Pierre`,
    telephonePere: `67${String(Math.floor(seededRandom(id * 53) * 1000000)).padStart(6, '0')}`,
    emailPere: `${parentNom.toLowerCase()}.pere${num}@gmail.cm`,
    nomMere: `${parentNom} Chantal`,
    telephoneMere: `65${String(Math.floor(seededRandom(id * 59) * 1000000)).padStart(6, '0')}`,
    emailMere: '',
    nomTuteur: '',
    telephoneTuteur: '',
    emailTuteur: '',
    parentEmail,
    parentNom: `${parentNom} ${parentPrenom}`,
    parentTel,
    bus: avecBus,
    busLigne: avecBus ? ['Ligne A — Mvan', 'Ligne B — Nkondengui', 'Ligne C — Essos', 'Ligne D — Olezoa'][Math.floor(seededRandom(id * 61) * 4)] : '',
    dateInscription: '2025-09-05T08:00:00.000Z',
    anneeScolaire: '2025-2026',
    statut: 'actif'
  };
}

// ── ÉLÈVES ────────────────────────────────────────────────────────────────────────
const eleves = [];
let eleveId = 1;

const effectifs = {
  c1: 22, c2: 24, c3: 20, c4: 18,
  c5: 26, c6: 24, c7: 23, c8: 21,
  c9: 25, c10: 22, c11: 24, c12: 23, c13: 20
};

for (const [classeId, count] of Object.entries(effectifs)) {
  for (let i = 0; i < count; i++) {
    eleves.push(genererEleve(eleveId, classeId, eleveId));
    eleveId++;
  }
}

// ── MATIÈRES PAR CLASSE ──────────────────────────────────────────────────────────
const matieres = [
  { id: 'm1c1', classeId: 'c1', nom: 'Français', ordre: 1 },
  { id: 'm2c1', classeId: 'c1', nom: 'Mathématiques', ordre: 2 },
  { id: 'm3c1', classeId: 'c1', nom: 'Éveil Scientifique', ordre: 3 },
  { id: 'm4c1', classeId: 'c1', nom: 'Éducation Physique', ordre: 4 },
  { id: 'm5c1', classeId: 'c1', nom: 'Arts Plastiques', ordre: 5 },

  { id: 'm1c2', classeId: 'c2', nom: 'English', ordre: 1 },
  { id: 'm2c2', classeId: 'c2', nom: 'Mathematics', ordre: 2 },
  { id: 'm3c2', classeId: 'c2', nom: 'Science', ordre: 3 },
  { id: 'm4c2', classeId: 'c2', nom: 'Physical Education', ordre: 4 },
  { id: 'm5c2', classeId: 'c2', nom: 'Art & Craft', ordre: 5 },

  { id: 'm1c3', classeId: 'c3', nom: 'Français', ordre: 1 },
  { id: 'm2c3', classeId: 'c3', nom: 'English', ordre: 2 },
  { id: 'm3c3', classeId: 'c3', nom: 'Mathématiques', ordre: 3 },
  { id: 'm4c3', classeId: 'c3', nom: 'Sciences', ordre: 4 },
  { id: 'm5c3', classeId: 'c3', nom: 'Éducation Physique', ordre: 5 },

  { id: 'm1c4', classeId: 'c4', nom: 'Français', ordre: 1 },
  { id: 'm2c4', classeId: 'c4', nom: 'Mathématiques', ordre: 2 },
  { id: 'm3c4', classeId: 'c4', nom: 'Anglais', ordre: 3 },
  { id: 'm4c4', classeId: 'c4', nom: 'Sciences', ordre: 4 },
  { id: 'm5c4', classeId: 'c4', nom: 'Éducation Physique', ordre: 5 },
  { id: 'm6c4', classeId: 'c4', nom: 'Arts Plastiques', ordre: 6 },

  { id: 'm1c5', classeId: 'c5', nom: 'Français', ordre: 1 },
  { id: 'm2c5', classeId: 'c5', nom: 'Mathématiques', ordre: 2 },
  { id: 'm3c5', classeId: 'c5', nom: 'Anglais', ordre: 3 },
  { id: 'm4c5', classeId: 'c5', nom: 'Sciences', ordre: 4 },
  { id: 'm5c5', classeId: 'c5', nom: 'Éducation Physique', ordre: 5 },
  { id: 'm6c5', classeId: 'c5', nom: 'Arts Plastiques', ordre: 6 },
  { id: 'm7c5', classeId: 'c5', nom: 'Musique', ordre: 7 },

  { id: 'm1c6', classeId: 'c6', nom: 'Français', ordre: 1 },
  { id: 'm2c6', classeId: 'c6', nom: 'English', ordre: 2 },
  { id: 'm3c6', classeId: 'c6', nom: 'Mathématiques', ordre: 3 },
  { id: 'm4c6', classeId: 'c6', nom: 'Sciences', ordre: 4 },
  { id: 'm5c6', classeId: 'c6', nom: 'Éducation Physique', ordre: 5 },

  { id: 'm1c7', classeId: 'c7', nom: 'Français', ordre: 1 },
  { id: 'm2c7', classeId: 'c7', nom: 'Mathématiques', ordre: 2 },
  { id: 'm3c7', classeId: 'c7', nom: 'Anglais', ordre: 3 },
  { id: 'm4c7', classeId: 'c7', nom: 'Histoire-Géographie', ordre: 4 },
  { id: 'm5c7', classeId: 'c7', nom: 'Sciences', ordre: 5 },
  { id: 'm6c7', classeId: 'c7', nom: 'Éducation Physique', ordre: 6 },
  { id: 'm7c7', classeId: 'c7', nom: 'Arts Plastiques', ordre: 7 },
  { id: 'm8c7', classeId: 'c7', nom: 'Musique', ordre: 8 },

  { id: 'm1c8', classeId: 'c8', nom: 'English', ordre: 1 },
  { id: 'm2c8', classeId: 'c8', nom: 'Mathematics', ordre: 2 },
  { id: 'm3c8', classeId: 'c8', nom: 'French', ordre: 3 },
  { id: 'm4c8', classeId: 'c8', nom: 'Science', ordre: 4 },
  { id: 'm5c8', classeId: 'c8', nom: 'Physical Education', ordre: 5 },
  { id: 'm6c8', classeId: 'c8', nom: 'Art', ordre: 6 },

  { id: 'm1c9', classeId: 'c9', nom: 'Français', ordre: 1 },
  { id: 'm2c9', classeId: 'c9', nom: 'Mathématiques', ordre: 2 },
  { id: 'm3c9', classeId: 'c9', nom: 'Anglais', ordre: 3 },
  { id: 'm4c9', classeId: 'c9', nom: 'Histoire-Géographie', ordre: 4 },
  { id: 'm5c9', classeId: 'c9', nom: 'Sciences', ordre: 5 },
  { id: 'm6c9', classeId: 'c9', nom: 'Éducation Physique', ordre: 6 },
  { id: 'm7c9', classeId: 'c9', nom: 'Arts Plastiques', ordre: 7 },
  { id: 'm8c9', classeId: 'c9', nom: 'Musique', ordre: 8 },

  { id: 'm1c10', classeId: 'c10', nom: 'Français', ordre: 1 },
  { id: 'm2c10', classeId: 'c10', nom: 'English', ordre: 2 },
  { id: 'm3c10', classeId: 'c10', nom: 'Mathématiques', ordre: 3 },
  { id: 'm4c10', classeId: 'c10', nom: 'Sciences', ordre: 4 },
  { id: 'm5c10', classeId: 'c10', nom: 'Éducation Physique', ordre: 5 },

  { id: 'm1c11', classeId: 'c11', nom: 'Français', ordre: 1 },
  { id: 'm2c11', classeId: 'c11', nom: 'Mathématiques', ordre: 2 },
  { id: 'm3c11', classeId: 'c11', nom: 'Anglais', ordre: 3 },
  { id: 'm4c11', classeId: 'c11', nom: 'Histoire-Géographie', ordre: 4 },
  { id: 'm5c11', classeId: 'c11', nom: 'Sciences', ordre: 5 },
  { id: 'm6c11', classeId: 'c11', nom: 'Éducation Civique', ordre: 6 },
  { id: 'm7c11', classeId: 'c11', nom: 'Éducation Physique', ordre: 7 },
  { id: 'm8c11', classeId: 'c11', nom: 'Arts Plastiques', ordre: 8 },

  { id: 'm1c12', classeId: 'c12', nom: 'English', ordre: 1 },
  { id: 'm2c12', classeId: 'c12', nom: 'Mathematics', ordre: 2 },
  { id: 'm3c12', classeId: 'c12', nom: 'French', ordre: 3 },
  { id: 'm4c12', classeId: 'c12', nom: 'Science', ordre: 4 },
  { id: 'm5c12', classeId: 'c12', nom: 'Civic Education', ordre: 5 },
  { id: 'm6c12', classeId: 'c12', nom: 'Physical Education', ordre: 6 },

  { id: 'm1c13', classeId: 'c13', nom: 'Français', ordre: 1 },
  { id: 'm2c13', classeId: 'c13', nom: 'Mathématiques', ordre: 2 },
  { id: 'm3c13', classeId: 'c13', nom: 'Anglais', ordre: 3 },
  { id: 'm4c13', classeId: 'c13', nom: 'Histoire-Géographie', ordre: 4 },
  { id: 'm5c13', classeId: 'c13', nom: 'Sciences', ordre: 5 },
  { id: 'm6c13', classeId: 'c13', nom: 'Éducation Civique', ordre: 6 },
  { id: 'm7c13', classeId: 'c13', nom: 'Éducation Physique', ordre: 7 },
  { id: 'm8c13', classeId: 'c13', nom: 'Arts Plastiques', ordre: 8 },
];

// ── FRAIS SCOLAIRES ──────────────────────────────────────────────────────────────
const frais = {
  inscription: 25000,
  scolariteAnnuelle: 120000,
  tranches: [
    { id: 't1', nom: '1ère Tranche', montant: 40000, echeance: '2025-10-15', datePaiement: null },
    { id: 't2', nom: '2ème Tranche', montant: 40000, echeance: '2026-01-15', datePaiement: null },
    { id: 't3', nom: '3ème Tranche', montant: 40000, echeance: '2026-04-15', datePaiement: null },
  ],
  bus: 15000,
  anneeScolaire: '2025-2026',
  classes: {}
};

// ── PAIEMENTS ─────────────────────────────────────────────────────────────────────
const paiements = [];
let paiementId = 1;

for (let i = 0; i < Math.floor(eleves.length * 0.7); i++) {
  const eleve = eleves[Math.floor(seededRandom(i * 7) * eleves.length)];
  
  if (seededRandom(i * 13) > 0.3) {
    paiements.push({
      id: `p${paiementId++}`,
      eleveId: eleve.id,
      montant: 25000,
      type: 'inscription',
      statut: 'payé',
      recu: `REC-2025-${String(paiementId).padStart(3, '0')}`,
      date: '2025-09-05',
      datePaiement: '2025-09-05T08:30:00.000Z',
      trancheId: null,
      caissier: 'Rose Tchamba'
    });
  }
  
  if (seededRandom(i * 17) > 0.4) {
    paiements.push({
      id: `p${paiementId++}`,
      eleveId: eleve.id,
      montant: 40000,
      type: 'scolarite',
      statut: 'payé',
      recu: `REC-2025-${String(paiementId).padStart(3, '0')}`,
      date: '2025-10-10',
      datePaiement: '2025-10-10T09:15:00.000Z',
      trancheId: 't1',
      caissier: 'Rose Tchamba'
    });
  }
  
  if (seededRandom(i * 19) > 0.6) {
    paiements.push({
      id: `p${paiementId++}`,
      eleveId: eleve.id,
      montant: 40000,
      type: 'scolarite',
      statut: 'payé',
      recu: `REC-2025-${String(paiementId).padStart(3, '0')}`,
      date: '2026-01-15',
      datePaiement: '2026-01-15T10:00:00.000Z',
      trancheId: 't2',
      caissier: 'Rose Tchamba'
    });
  }
}

// ── NOTES / BULLETINS ─────────────────────────────────────────────────────────────
const notes = [];
let noteId = 1;

for (const eleve of eleves) {
  const classMatieres = matieres.filter(m => m.classeId === eleve.classeId);
  
  const notesEleve = [];
  for (const matiere of classMatieres) {
    const seed = parseInt(eleve.id.substring(1)) * parseInt(matiere.id.substring(1));
    const moyenneMatiere = 8 + seededRandom(seed) * 12;
    notesEleve.push({
      matiereId: matiere.id,
      evaluations: [],
      noteFinale: Math.round(moyenneMatiere * 10) / 10
    });
  }
  
  notes.push({
    id: `n${noteId++}`,
    eleveId: eleve.id,
    sequence: 'SEQ1',
    anneeScolaire: '2025-2026',
    notes: notesEleve,
    absences: Math.floor(seededRandom(parseInt(eleve.id.substring(1)) * 23) * 4),
    retards: Math.floor(seededRandom(parseInt(eleve.id.substring(1)) * 29) * 3),
    conduite: ['Bonne', 'Excellente', 'Très bonne', 'Acceptable', 'À améliorer'][Math.floor(seededRandom(parseInt(eleve.id.substring(1)) * 31) * 5)],
    soin: ['Soigné', 'Très soigné', 'Peu soigné', 'Acceptable'][Math.floor(seededRandom(parseInt(eleve.id.substring(1)) * 37) * 4)],
    ponctualite: ['Ponctuel', 'Très ponctuel', 'Souvent en retard', 'Acceptable'][Math.floor(seededRandom(parseInt(eleve.id.substring(1)) * 41) * 4)],
    appreciationGenerale: 'Élève ayant besoin de s\'impliquer davantage dans ses études.',
    dateConseil: '2025-11-15'
  });
}

// ── COEFFICIENTS ─────────────────────────────────────────────────────────────────
const coefficients = [];
let coefId = 1;

for (const classe of classes) {
  const classMatieres = matieres.filter(m => m.classeId === classe.id);
  for (const matiere of classMatieres) {
    const coef = matiere.nom.toLowerCase().includes('français') || matiere.nom.toLowerCase().includes('math') ? 2 : 
                 matiere.nom.toLowerCase().includes('anglais') || matiere.nom.toLowerCase().includes('english') ? 1.5 : 1;
    coefficients.push({
      id: `coef${coefId++}`,
      classeId: classe.id,
      matiereId: matiere.id,
      coefficient: coef
    });
  }
}

// ── ÉVALUATIONS ──────────────────────────────────────────────────────────────────
const evaluations = [];
let evalId = 1;

for (const classe of classes) {
  const classMatieres = matieres.filter(m => m.classeId === classe.id);
  for (const matiere of classMatieres) {
    evaluations.push({
      id: `eval${evalId++}`,
      classeId: classe.id,
      matiereId: matiere.id,
      evaluations: [
        { name: 'Contrôle Continu', percentage: 40 },
        { name: 'Examen/Devoir', percentage: 60 }
      ]
    });
  }
}

// ── MESSAGES ───────────────────────────────────────────────────────────────────────
const messages = [
  {
    id: 'msg1',
    expediteurId: 'u4',
    destinataireId: 'u3',
    sujet: 'Absence de Kevin',
    corps: 'Bonjour Monsieur Nkomo, Kevin a été absent hier car il était malade. Merci de votre compréhension.',
    dateEnvoi: '2025-10-12T08:30:00.000Z',
    lu: true
  },
  {
    id: 'msg2',
    expediteurId: 'u3',
    destinataireId: 'u4',
    sujet: 'Re: Absence de Kevin',
    corps: 'Bonjour Mme Ebongue, merci pour l\'information. Kevin peut reprendre les cours dès demain.',
    dateEnvoi: '2025-10-12T10:15:00.000Z',
    lu: false
  }
];

// ── EMPLOIS DU TEMPS ───────────────────────────────────────────────────────────────
const emploisDuTemps = [
  {
    id: 'edt1',
    classeId: 'c1',
    heureDebut: '08:00',
    dureeCours: 55,
    tranches: 7,
    pauses: [{ apresTranche: 2, duree: 30 }, { apresTranche: 5, duree: 60 }],
    grille: {
      Lundi: { 0: 'm1c1', 1: 'm2c1', 2: 'm3c1', 3: 'm4c1', 4: 'm5c1', 5: 'm1c1', 6: 'm2c1' },
      Mardi: { 0: 'm2c1', 1: 'm1c1', 2: 'm4c1', 3: 'm3c1', 4: 'm5c1', 5: 'm2c1', 6: 'm1c1' },
      Mercredi: { 0: 'm3c1', 1: 'm5c1', 2: 'm1c1', 3: 'm2c1', 4: '', 5: '', 6: '' },
      Jeudi: { 0: 'm1c1', 1: 'm2c1', 2: 'm4c1', 3: 'm3c1', 4: 'm5c1', 5: 'm1c1', 6: 'm2c1' },
      Vendredi: { 0: 'm4c1', 1: 'm5c1', 2: 'm1c1', 3: 'm2c1', 4: 'm3c1', 5: 'm4c1', 6: 'm5c1' }
    }
  },
  {
    id: 'edt2',
    classeId: 'c4',
    heureDebut: '07:30',
    dureeCours: 50,
    tranches: 8,
    pauses: [{ apresTranche: 3, duree: 20 }, { apresTranche: 6, duree: 45 }],
    grille: {
      Lundi: { 0: 'm1c4', 1: 'm2c4', 2: 'm3c4', 3: 'm4c4', 4: 'm5c4', 5: 'm6c4', 6: 'm1c4', 7: 'm2c4' },
      Mardi: { 0: 'm3c4', 1: 'm4c4', 2: 'm1c4', 3: 'm2c4', 4: 'm6c4', 5: 'm5c4', 6: 'm3c4', 7: 'm4c4' },
      Mercredi: { 0: 'm1c4', 1: 'm2c4', 2: 'm3c4', 3: 'm4c4', 4: '', 5: '', 6: '', 7: '' },
      Jeudi: { 0: 'm5c4', 1: 'm6c4', 2: 'm1c4', 3: 'm2c4', 4: 'm3c4', 5: 'm4c4', 6: 'm5c4', 7: 'm6c4' },
      Vendredi: { 0: 'm2c4', 1: 'm1c4', 2: 'm4c4', 3: 'm3c4', 4: 'm6c4', 5: 'm5c4', 6: 'm2c4', 7: 'm1c4' }
    }
  }
];
// ── APPELS (PRÉSENCES) ──────────────────────────────────────────────────────────
const appels = [];

export default {
  users, classes, eleves, matieres,
  paiements, notes, frais,
  coefficients, evaluations, messages,
  emploisDuTemps, appels
};
