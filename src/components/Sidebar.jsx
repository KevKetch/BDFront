/**
 * @file Sidebar.jsx
 * @description Barre de navigation latérale avec menu par rôle,
 * support du dark mode et menu messagerie.
 */
import React from 'react';
import { useApp } from '../context/AppContext';
import T from '../i18n/translations';
import {
  LayoutDashboard, Users, School, FileText,
  CreditCard, Bus, UsersRound, MessageSquare,
  Settings, Calculator, FileEdit, UserCircle, LogOut, GraduationCap,
  ShieldCheck, ShieldAlert, X, FileDown, UserCheck
} from 'lucide-react';

const NAV_ITEMS = {
  admin: [
    { id:'dashboard',    icon: <LayoutDashboard size={20} /> },
    { id:'adminRoot',    icon: <ShieldCheck size={20} /> },
    { id:'paiements',    icon: <CreditCard size={20} /> },
    { id:'personnel',    icon: <UsersRound size={20} /> },
    { id:'banque_epreuves', icon: <FileDown size={20} /> },
    { id:'coefficients', icon: <Calculator size={20} /> },
    { id:'presences',        icon: <UserCheck size={20} /> },
    { id:'messagerie',   icon: <MessageSquare size={20} /> },
    { id:'parametres',   icon: <Settings size={20} /> },
  ],
  fondateur: [
    { id:'dashboard',    icon: <LayoutDashboard size={20} /> },
    { id:'eleves',       icon: <Users size={20} /> },
    { id:'classes',      icon: <School size={20} /> },
    { id:'bulletins',    icon: <FileText size={20} /> },
    { id:'paiements',    icon: <CreditCard size={20} /> },
    { id:'transport',    icon: <Bus size={20} /> },
    { id:'personnel',    icon: <UsersRound size={20} /> },
    { id:'banque_epreuves', icon: <FileDown size={20} /> },
    { id:'coefficients', icon: <Calculator size={20} /> },
    { id:'presences',        icon: <UserCheck size={20} /> },
    { id:'messagerie',   icon: <MessageSquare size={20} /> },
    { id:'parametres',   icon: <Settings size={20} /> },
  ],
  directeur: [
    { id:'dashboard',    icon: <LayoutDashboard size={20} /> },
    { id:'eleves',       icon: <Users size={20} /> },
    { id:'classes',      icon: <School size={20} /> },
    { id:'bulletins',    icon: <FileText size={20} /> },
    { id:'paiements',    icon: <CreditCard size={20} /> },
    { id:'transport',    icon: <Bus size={20} /> },
    { id:'personnel',    icon: <UsersRound size={20} /> },
    { id:'coefficients', icon: <Calculator size={20} /> },
    { id:'banque_epreuves', icon: <FileDown size={20} /> },
    { id:'presences',        icon: <UserCheck size={20} /> },
    { id:'messagerie',   icon: <MessageSquare size={20} /> },
    { id:'parametres',   icon: <Settings size={20} /> },
  ],
  enseignant: [
    { id:'dashboard',    icon: <LayoutDashboard size={20} /> },
    { id:'eleves',       icon: <Users size={20} /> },
    { id:'discipline',   icon: <ShieldAlert size={20} /> },
    { id:'bulletins',    icon: <FileText size={20} /> },
    { id:'saisie_notes', icon: <FileEdit size={20} /> },
    { id:'evaluations',  icon: <FileEdit size={20} /> },
    { id:'banque_epreuves', icon: <FileDown size={20} /> },
    { id:'presences',        icon: <UserCheck size={20} /> },
    { id:'messagerie',   icon: <MessageSquare size={20} /> },
    { id:'parametres',   icon: <Settings size={20} /> },
  ],
  parent: [
    { id:'dashboard',    icon: <UserCircle size={20} /> },
    { id:'eleves',       icon: <Users size={20} /> },
    { id:'bulletins',    icon: <FileText size={20} /> },
    { id:'paiements',    icon: <CreditCard size={20} /> },
    { id:'messagerie',   icon: <MessageSquare size={20} /> },
    { id:'parametres',   icon: <Settings size={20} /> },
  ],
};

const getLabel = (id, role, lang) => {
  const t = T[lang] || T.fr;
  const map = {
    admin: {
      dashboard:'Tableau de bord', adminRoot: t.adminRoot || 'Administration',
      paiements: t.paiements, personnel: t.personnel, parametres: t.parametres, messagerie: t.messagerie,
      banque_epreuves: t.banqueEpreuves, coefficients: t.coefficients, presences: 'Présences'
    },
    fondateur: {
      dashboard:'Tableau de bord', eleves: t.eleves, classes: t.classes,
      bulletins: t.bulletins, paiements: t.paiements, transport: t.transport,
      personnel: t.personnel, parametres: t.parametres, messagerie: t.messagerie,
      banque_epreuves: t.banqueEpreuves, coefficients: t.coefficients, presences: 'Présences'
    },
    directeur: {
      dashboard:'Tableau de bord', eleves: t.eleves, classes: t.classes,
      bulletins: t.bulletins, paiements: t.paiements, transport: t.transport,
      personnel: t.personnel, coefficients: t.coefficients, messagerie: t.messagerie,
      parametres: t.parametres, banque_epreuves: t.banqueEpreuves, presences: 'Présences'
    },
    enseignant: {
      dashboard: t.monTableauDeBord, eleves: t.mesEleves, discipline: 'Discipline',
      bulletins: t.mesBulletins, saisie_notes: 'Saisie de notes', evaluations: t.evaluations,
      banque_epreuves: t.banqueEpreuves, messagerie: t.messagerie,
      parametres: t.parametres, presences: 'Présences'
    },
    parent: {
      dashboard: t.mesEnfants, eleves: t.dossierScolaire,
      bulletins: t.bulletins, paiements: t.mesPaiements, messagerie: t.messagerie,
      parametres: t.parametres,
    },
  };
  return map[role]?.[id] || id;
};

const ROLE_LABELS = {
  admin:     { label:'Administrateur', color:'#E74C3C', bg:'rgba(231,76,60,.15)' },
  fondateur: { label:'Fondateur', color:'var(--primary)', bg:'rgba(93,173,226,.15)' },
  directeur: { label:'Directeur', color:'#27AE60', bg:'rgba(39,174,96,.15)' },
  enseignant:{ label:'Enseignant', color:'#2980B9', bg:'rgba(41,128,185,.15)' },
  parent:    { label:'Parent',    color:'#8E44AD', bg:'rgba(142,68,173,.15)' },
};

export default function Sidebar() {
  const { utilisateurActif, logout, currentPage, naviguer, langue, getMessagesRecus, schoolSettings, isSidebarOpen, setSidebarOpen } = useApp();

  const items    = NAV_ITEMS[utilisateurActif?.role] || [];
  const roleInfo = ROLE_LABELS[utilisateurActif?.role] || {};
  const t        = T[langue] || T.fr;

  // Nombre de messages non lus
  const unread = (getMessagesRecus?.() || []).filter(m => !m.lu).length;

  return (
    <>
      {/* Overlay pour fermer */}
      <div 
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 998,
          opacity: isSidebarOpen ? 1 : 0,
          pointerEvents: isSidebarOpen ? 'auto' : 'none',
          transition: 'opacity 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'
        }}
        onClick={() => setSidebarOpen(false)}
      />

      <aside style={{ 
        ...styles.sidebar, 
        transform: isSidebarOpen ? 'translateX(0)' : 'translateX(100%)'
      }}>
        {/* Header logo */}
        <div style={styles.header}>
          <div style={styles.brand}>
            <span style={styles.brandIcon}><GraduationCap size={28} /></span>
            <div>
              <div style={styles.brandName}>{schoolSettings?.nom || 'Les Étoiles'}</div>
              <div style={styles.brandSub}>2025–2026</div>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={() => setSidebarOpen(false)} title="Fermer">
            <X size={20} />
          </button>
        </div>

        {/* Carte utilisateur */}
        <div style={styles.userCard}>
          <div style={styles.avatarCircle}>
            {utilisateurActif?.prenom?.[0]}{utilisateurActif?.nom?.[0]}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={styles.userName}>{utilisateurActif?.prenom} {utilisateurActif?.nom}</div>
            <span style={{ ...styles.roleBadge, color:roleInfo.color, background:roleInfo.bg }}>
              {roleInfo.label}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          {items.map(item => {
            const isActive = currentPage === item.id;
            const label = getLabel(item.id, utilisateurActif?.role, langue);
            const isMsg = item.id === 'messagerie';
            return (
              <button
                key={item.id}
                style={{ ...styles.navItem, ...(isActive ? styles.navActive : {}) }}
                onClick={() => naviguer(item.id)}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span style={styles.navLabel}>{label}</span>
                {/* Badge messages non lus */}
                {isMsg && unread > 0 && (
                  <span style={styles.unreadBadge}>
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
                {isActive && <span style={styles.navDot} />}
              </button>
            );
          })}
        </nav>

        {/* Déconnexion */}
        <div style={styles.footer}>
          <button style={styles.logoutBtn} onClick={logout} title={t.deconnexion}>
            <span><LogOut size={20} /></span>
            <span style={{ fontSize: 16, fontWeight: 500 }}>{t.deconnexion}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

const styles = {
  sidebar: {
    background: '#0D2B40',
    width: 360,
    height: '100vh',
    position: 'fixed',
    top: 0,
    right: 0,
    zIndex: 999,
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    overflow: 'hidden',
    boxShadow: '-12px 0 40px rgba(0,0,0,0.3)',
  },
  header: {
    padding: '24px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(255,255,255,.08)',
    flexShrink: 0,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 12 },
  brandIcon: { color: 'var(--primary)' },
  brandName: { fontFamily: 'Playfair Display, serif', color: 'white', fontSize: 18, fontWeight: 700 },
  brandSub: { fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 2 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 10,
    background: 'rgba(255,255,255,.07)', border: 'none',
    color: 'white', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    transition: 'background 0.2s',
  },
  userCard: {
    margin: '24px 20px', padding: '16px',
    background: 'rgba(255,255,255,.06)', borderRadius: 16,
    display: 'flex', alignItems: 'center', gap: 16,
    flexShrink: 0,
  },
  avatarCircle: {
    width: 48, height: 48, borderRadius: '50%',
    background: 'rgba(93,173,226,.2)', border: '2px solid rgba(93,173,226,.4)',
    color: 'var(--primary)', fontWeight: 700, fontSize: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  userName: { color: 'white', fontWeight: 600, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 },
  roleBadge: { fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, letterSpacing: .5 },
  nav: { flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' },
  navItem: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 16,
    padding: '16px 18px', borderRadius: 14, border: 'none',
    background: 'transparent', cursor: 'pointer', color: 'rgba(255,255,255,.65)',
    fontSize: 16, fontWeight: 500, textAlign: 'left', transition: 'all .2s ease', position: 'relative',
  },
  navActive: { background: 'rgba(93,173,226,.15)', color: 'var(--primary)' },
  navIcon: { flexShrink: 0, display: 'flex', alignItems: 'center' },
  navLabel: { flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  navDot: { width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0 },
  unreadBadge: {
    minWidth: 22, height: 22, borderRadius: 11, background: '#E74C3C',
    color: 'white', fontSize: 12, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px',
    flexShrink: 0, marginLeft: 'auto',
  },
  footer: { padding: '24px 20px', borderTop: '1px solid rgba(255,255,255,.08)', flexShrink: 0 },
  logoutBtn: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 14,
    padding: '16px 18px', borderRadius: 14, border: 'none',
    background: 'rgba(231,76,60,.1)', cursor: 'pointer', color: '#E74C3C',
    transition: 'all .2s ease',
  },
};