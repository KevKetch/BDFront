/**
 * @file App.jsx
 * @description Composant racine. Applique le dark mode, gère le routing
 * par page et injecte le contexte global.
 */
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ElevesPage from './pages/ElevesPage';
import BulletinsPage from './pages/BulletinsPage';
import PaiementsPage from './pages/PaiementsPage';
import EvaluationsPage from './pages/EvaluationsPage';
import CoefficientsPage from './pages/CoefficientsPage';
import MessageriePage from './pages/MessageriePage';
import SaisieNotesPage from './pages/SaisieNotesPage';
import AdminPage from './pages/AdminPage';
import BanqueEpreuvesPage from './pages/BanqueEpreuvesPage';
import PresencesPage from './pages/PresencesPage';
import { ClassesPage, TransportPage, PersonnelPage, ParametresPage } from './pages/OthersPages';
import Topbar from './components/Topbar';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/global.css';

function AppInner() {
  const { utilisateurActif, currentPage, darkMode } = useApp();

  // Appliquer le thème sur l'élément racine
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Ouvrir le sélecteur de date natif au clic n'importe où sur l'input date
  React.useEffect(() => {
    const handleDateInputClick = (e) => {
      if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'date') {
        try {
          e.target.showPicker();
        } catch (err) {
          console.warn('showPicker not supported:', err);
        }
      }
    };
    document.addEventListener('click', handleDateInputClick);
    return () => document.removeEventListener('click', handleDateInputClick);
  }, []);

  if (!utilisateurActif) return <LoginPage />;

  const PAGES = {
    dashboard:   <Dashboard />,
    eleves:      <ElevesPage />,
    discipline:  <ElevesPage initialTab="discipline" />,
    classes:     <ClassesPage />,
    bulletins:   <BulletinsPage />,
    paiements:   <PaiementsPage />,
    transport:   <TransportPage />,
    personnel:   <PersonnelPage />,
    parametres:  <ParametresPage />,
    evaluations: <EvaluationsPage />,
    saisie_notes:<SaisieNotesPage />,
    coefficients:<CoefficientsPage />,
    messagerie:  <MessageriePage />,
    banque_epreuves: <BanqueEpreuvesPage />,
    presences:   <PresencesPage />,
    adminRoot:   <AdminPage />,
  };

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position: 'relative' }}>
        <Topbar />
        <main
          style={{ flex:1, overflowY:'auto', background:'var(--bg-app)', paddingTop: '64px' }}
          className="animate-fade"
        >
          {PAGES[currentPage] || PAGES.dashboard}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppInner />
      </AppProvider>
    </ErrorBoundary>
  );
}