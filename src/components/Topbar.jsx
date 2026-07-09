/**
 * @file Topbar.jsx
 * @description Barre supérieure avec titre de page, date, boutons dark mode,
 * changement de langue, retour arrière, et notification toast.
 * Intègre désormais la barre de navigation horizontalement.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import T from '../i18n/translations';
import { 
  LayoutDashboard, Users, School, FileText, 
  CreditCard, Bus, UsersRound, Settings, 
  FileEdit, Calculator, MessageSquare, ShieldAlert,
  Sun, Moon, CheckCircle, AlertTriangle, XCircle, ArrowLeft, Menu,
  UserCircle, ShieldCheck, LogOut, UserCheck, FileDown
} from 'lucide-react';

const PAGE_TITLES = {
  fr: {
    dashboard:'Tableau de bord', eleves:'Gestion des Élèves',
    discipline:'Discipline & Conduite',
    classes:'Gestion des Classes', bulletins:'Bulletins & Évaluations',
    paiements:'Gestion des Paiements', transport:'Transport Scolaire',
    personnel:'Personnel', parametres:'Paramètres',
    evaluations:'Évaluations', coefficients:'Coefficients',
    messagerie:'Messagerie', presences:'Présences',
  },
  en: {
    dashboard:'Dashboard', eleves:'Student Management',
    discipline:'Discipline & Conduct',
    classes:'Class Management', bulletins:'Report Cards & Evaluations',
    paiements:'Payment Management', transport:'School Transport',
    personnel:'Staff', parametres:'Settings',
    evaluations:'Evaluations', coefficients:'Coefficients',
    messagerie:'Messaging', presences:'Attendance',
  }
};

const PAGE_ICONS = {
  dashboard: <LayoutDashboard size={24} />, 
  eleves: <Users size={24} />, 
  discipline: <ShieldAlert size={24} />,
  classes: <School size={24} />, 
  bulletins: <FileText size={24} />,
  paiements: <CreditCard size={24} />, 
  transport: <Bus size={24} />, 
  personnel: <UsersRound size={24} />, 
  parametres: <Settings size={24} />,
  evaluations: <FileEdit size={24} />, 
  coefficients: <Calculator size={24} />, 
  messagerie: <MessageSquare size={24} />,
  banque_epreuves: <FileDown size={24} />,
  presences: <UserCheck size={24} />,
};

const NAV_ITEMS = {
  admin: [
    { id:'dashboard',    icon: <LayoutDashboard size={16} /> },
    { id:'adminRoot',    icon: <ShieldCheck size={16} /> },
    { id:'paiements',    icon: <CreditCard size={16} /> },
    { id:'personnel',    icon: <UsersRound size={16} /> },
    { id:'banque_epreuves', icon: <FileDown size={16} /> },
    { id:'coefficients', icon: <Calculator size={16} /> },
    { id:'presences',        icon: <UserCheck size={16} /> },
    { id:'messagerie',   icon: <MessageSquare size={16} /> },
  ],
  fondateur: [
    { id:'dashboard',    icon: <LayoutDashboard size={16} /> },
    { id:'eleves',       icon: <Users size={16} /> },
    { id:'classes',      icon: <School size={16} /> },
    { id:'bulletins',    icon: <FileText size={16} /> },
    { id:'paiements',    icon: <CreditCard size={16} /> },
    { id:'transport',    icon: <Bus size={16} /> },
    { id:'personnel',    icon: <UsersRound size={16} /> },
    { id:'banque_epreuves', icon: <FileDown size={16} /> },
    { id:'coefficients', icon: <Calculator size={16} /> },
    { id:'presences',        icon: <UserCheck size={16} /> },
    { id:'messagerie',   icon: <MessageSquare size={16} /> },
  ],
  directeur: [
    { id:'dashboard',    icon: <LayoutDashboard size={16} /> },
    { id:'eleves',       icon: <Users size={16} /> },
    { id:'classes',      icon: <School size={16} /> },
    { id:'bulletins',    icon: <FileText size={16} /> },
    { id:'paiements',    icon: <CreditCard size={16} /> },
    { id:'transport',    icon: <Bus size={16} /> },
    { id:'personnel',    icon: <UsersRound size={16} /> },
    { id:'coefficients', icon: <Calculator size={16} /> },
    { id:'banque_epreuves', icon: <FileDown size={16} /> },
    { id:'presences',        icon: <UserCheck size={16} /> },
    { id:'messagerie',   icon: <MessageSquare size={16} /> },
  ],
  enseignant: [
    { id:'dashboard',    icon: <LayoutDashboard size={16} /> },
    { id:'eleves',       icon: <Users size={16} /> },
    { id:'discipline',   icon: <ShieldAlert size={16} /> },
    { id:'bulletins',    icon: <FileText size={16} /> },
    { id:'saisie_notes', icon: <FileEdit size={16} /> },
    { id:'evaluations',  icon: <FileEdit size={16} /> },
    { id:'banque_epreuves', icon: <FileDown size={16} /> },
    { id:'presences',        icon: <UserCheck size={16} /> },
    { id:'messagerie',   icon: <MessageSquare size={16} /> },
  ],
  parent: [
    { id:'dashboard',    icon: <UserCircle size={16} /> },
    { id:'eleves',       icon: <Users size={16} /> },
    { id:'bulletins',    icon: <FileText size={16} /> },
    { id:'paiements',    icon: <CreditCard size={16} /> },
    { id:'messagerie',   icon: <MessageSquare size={16} /> },
  ],
};

const getLabel = (id, role, lang) => {
  const t = T[lang] || T.fr;
  const map = {
    admin: {
      dashboard:'Tableau de bord', adminRoot: t.adminRoot || 'Administration',
      paiements: t.paiements, personnel: t.personnel, messagerie: t.messagerie,
      banque_epreuves: t.banqueEpreuves, coefficients: t.coefficients, presences: 'Présences'
    },
    fondateur: {
      dashboard:'Tableau de bord', eleves: t.eleves, classes: t.classes,
      bulletins: t.bulletins, paiements: t.paiements, transport: t.transport,
      personnel: t.personnel, messagerie: t.messagerie,
      banque_epreuves: t.banqueEpreuves, coefficients: t.coefficients, presences: 'Présences'
    },
    directeur: {
      dashboard:'Tableau de bord', eleves: t.eleves, classes: t.classes,
      bulletins: t.bulletins, paiements: t.paiements, transport: t.transport,
      personnel: t.personnel, coefficients: t.coefficients, messagerie: t.messagerie,
      banque_epreuves: t.banqueEpreuves, presences: 'Présences'
    },
    enseignant: {
      dashboard: t.monTableauDeBord, eleves: t.mesEleves, discipline: 'Discipline',
      bulletins: t.mesBulletins, saisie_notes: 'Saisie de notes', evaluations: t.evaluations, messagerie: t.messagerie,
      banque_epreuves: t.banqueEpreuves, presences: 'Présences'
    },
    parent: {
      dashboard: t.mesEnfants, eleves: t.dossierScolaire,
      bulletins: t.bulletins, paiements: t.mesPaiements, messagerie: t.messagerie,
    },
  };
  return map[role]?.[id] || id;
};

export default function Topbar() {
  const { 
    utilisateurActif, notification, darkMode, toggleDarkMode, langue, toggleLangue, 
    currentPage, isSidebarOpen, setSidebarOpen, toggleSidebar, naviguer,
    getMessagesRecus, logout
  } = useApp();

  const [isProfileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navContainerRef = useRef(null);

  useEffect(() => {
    const container = navContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      // Si on n'est pas sur mobile (où c'est vertical), on défile horizontalement
      if (window.innerWidth >= 1024 && e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  const titles = PAGE_TITLES[langue] || PAGE_TITLES.fr;
  const t = T[langue] || T.fr;

  const title  = titles[currentPage] || currentPage;
  const icon   = PAGE_ICONS[currentPage] || <FileText size={24} />;

  const now = new Date();
  const dateStr = now.toLocaleDateString(langue === 'fr' ? 'fr-FR' : 'en-US', {
    weekday:'long', day:'numeric', month:'long', year:'numeric'
  });

  const items = NAV_ITEMS[utilisateurActif?.role] || [];
  const unread = (getMessagesRecus?.() || []).filter(m => !m.lu).length;

  const handleMenuClick = () => {
    setProfileOpen(false);
    toggleSidebar();
  };

  const handleProfileClick = () => {
    setSidebarOpen(false);
    setProfileOpen(!isProfileOpen);
  };

  // Ferme les deux menus uniquement sur écran réduit (< 1024px)
  const closeMenusOnMobile = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
      setProfileOpen(false);
    }
  };

  return (
    <>
      {/* Notification toast */}
      {notification && (
        <div style={{
          ...styles.toast,
          background: notification.type === 'success' ? '#27AE60'
            : notification.type === 'warning' ? '#F39C12' : '#E74C3C',
        }}>
          {notification.type === 'success' ? <CheckCircle size={18} /> : notification.type === 'warning' ? <AlertTriangle size={18} /> : <XCircle size={18} />}
          {' '}{notification.message}
        </div>
      )}

      <header style={styles.topbar}>
        {/* Rangée principale : Titre + actions + menu burger + profil */}
        <div style={styles.topbarRow}>
        <div style={styles.left}>
          <span style={styles.pageIcon}>{icon}</span>
          <div style={{ marginRight: 16 }}>
            <h1 style={styles.pageTitle}>{title}</h1>
            <p style={styles.date}>{dateStr}</p>
          </div>

          {/* Toggle langue */}
          <button
            className="topbar-action-btn"
            onClick={toggleLangue}
            title={langue === 'fr' ? 'Switch to English' : 'Passer en Français'}
            style={{ marginRight: 8 }}
          >
            <span className="lang-badge">{langue.toUpperCase()}</span>
          </button>

          {/* Toggle dark mode */}
          <button
            className="topbar-action-btn"
            onClick={toggleDarkMode}
            title={darkMode ? (t.modeClairLabel) : (t.modeSombre)}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Navigation : se déploie à l'intérieur du header */}
        <div 
          className={`topbar-nav-container ${isSidebarOpen ? 'open' : ''}`} 
          ref={navContainerRef}
          tabIndex={0}
        >
          {items.map((item, index) => {
            const isActive = currentPage === item.id;
            const label = getLabel(item.id, utilisateurActif?.role, langue);
            const isMsg = item.id === 'messagerie';
            return (
              <button
                key={item.id}
                className={`topbar-nav-item ${isActive ? 'active' : ''}`}
                style={{ '--item-index': items.length - index }}
                onClick={() => { naviguer(item.id); closeMenusOnMobile(); }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span style={styles.navLabel}>{label}</span>
                {isMsg && unread > 0 && (
                  <span style={styles.unreadBadge}>{unread > 9 ? '9+' : unread}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Partie droite : Menu & Profil */}
        <div style={styles.right} ref={profileRef}>
          {/* Dropdown de profil (placé avant le menu pour s'étendre à sa gauche sur écran large) */}
          <div className={`topbar-profile-container ${isProfileOpen ? 'open' : ''}`}>
            <button 
              className="topbar-nav-item" 
              style={{ '--item-index': 1 }}
              onClick={() => { naviguer('parametres'); setProfileOpen(false); closeMenusOnMobile(); }}
            >
              <Settings size={16} />
              <span style={styles.navLabel}>{t.parametres || 'Paramètres'}</span>
            </button>
            <button 
              className="topbar-nav-item logout" 
              style={{ '--item-index': 0 }}
              onClick={() => { logout(); setProfileOpen(false); closeMenusOnMobile(); }}
            >
              <LogOut size={16} />
              <span style={styles.navLabel}>{t.deconnexion || 'Se déconnecter'}</span>
            </button>
          </div>

          {/* Toggle Menu (3 barres) */}
          <button
            className="topbar-action-btn"
            onClick={handleMenuClick}
            title="Menu"
            style={{ 
              background: isSidebarOpen ? 'rgba(243,156,18,0.15)' : 'transparent',
              color: isSidebarOpen ? '#F39C12' : 'var(--text-secondary)'
            }}
          >
            <Menu size={22} />
          </button>

          {/* Profil utilisateur */}
          <div 
            style={{ ...styles.userInfo, cursor: 'pointer' }}
            onClick={handleProfileClick}
          >
            <div style={styles.avatarInitials}>
              {utilisateurActif?.prenom?.[0]}{utilisateurActif?.nom?.[0]}
            </div>
            <div>
              <div style={styles.userName}>{utilisateurActif?.prenom} {utilisateurActif?.nom}</div>
              <div style={styles.userRole}>{utilisateurActif?.email}</div>
            </div>
          </div>
        </div>
        </div>
      </header>
    </>
  );
}

const styles = {
  toast: {
    position:'fixed', top:20, right:20, zIndex:9999,
    color:'white', padding:'12px 20px', borderRadius:12,
    boxShadow:'0 8px 32px rgba(0,0,0,.2)',
    fontSize:14, fontWeight:500,
    animation:'fadeIn .3s ease',
    display:'flex', alignItems:'center', gap:8,
  },
  topbar: {
    background:'var(--bg-card)',
    borderBottom:'1px solid var(--border-color)',
    position:'absolute', top:0, left:0, right:0, zIndex:50,
    boxShadow:'0 2px 16px rgba(0,0,0,.04)',
    display:'flex', flexDirection:'column',
  },
  topbarRow: {
    display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'10px 24px', minHeight:54,
    width:'100%',
  },
  left: { display:'flex', alignItems:'center', gap:12, flexShrink:0 },
  backBtn: {
    display:'flex', alignItems:'center', gap:6,
    padding:'7px 14px', borderRadius:10,
    border:'1.5px solid var(--border-color)',
    background:'var(--bg-card)', color:'var(--text-secondary)',
    cursor:'pointer', fontSize:13, fontWeight:500,
    transition:'all .18s', flexShrink:0,
    whiteSpace:'nowrap',
  },
  pageIcon:  { flexShrink:0, display:'flex', alignItems:'center', color:'var(--text-primary)' },
  pageTitle: {
    fontFamily:'Playfair Display, serif',
    fontSize:18, fontWeight:700, color:'var(--text-primary)',
    whiteSpace:'nowrap',
  },
  date:  { fontSize:11, color:'var(--text-muted)', marginTop:1, textTransform:'capitalize' },
  
  navIcon: { display: 'flex', alignItems: 'center' },
  navLabel: {},
  unreadBadge: {
    minWidth: 18, height: 18, borderRadius: 9, background: '#E74C3C',
    color: 'white', fontSize: 10, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
  },

  right: { display:'flex', alignItems:'center', gap:10, flexShrink:0 },
  userInfo: { display:'flex', alignItems:'center', gap:10, marginLeft: 8, padding: '4px', borderRadius: '8px', transition: 'background 0.2s ease' },
  avatarInitials: {
    width:38, height:38, borderRadius:'50%',
    background:'var(--primary)', color:'white',
    fontWeight:700, fontSize:14,
    display:'flex', alignItems:'center', justifyContent:'center',
    flexShrink:0,
  },
  userName: { fontSize:13, fontWeight:600, color:'var(--text-primary)', whiteSpace:'nowrap' },
  userRole: { fontSize:11, color:'var(--text-muted)', whiteSpace:'nowrap' },
};