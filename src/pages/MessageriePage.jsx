import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import T from '../i18n/translations';
import { MessageCircle, Send, Search, Lock, User as UserIcon } from 'lucide-react';

export default function MessageriePage() {
  const {
    utilisateurActif, utilisateurs, langue, messages,
    getDestinatairesAutorises, envoyerMessage, marquerLu,
  } = useApp();
  const t = T[langue] || T.fr;

  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const myId = utilisateurActif?.id;
  const destinos = getDestinatairesAutorises();

  // Sort and group messages by conversation
  // We'll just show the authorized recipients on the left.
  const filteredDestinos = destinos.filter(u => {
    const q = search.toLowerCase();
    return u.nom.toLowerCase().includes(q) || u.prenom.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  // Get conversation with selected user
  const conversation = selectedUser 
    ? messages.filter(m => 
        (m.expediteurId === myId && m.destinataireId === selectedUser.id) ||
        (m.expediteurId === selectedUser.id && m.destinataireId === myId)
      ).sort((a, b) => new Date(a.dateEnvoi) - new Date(b.dateEnvoi))
    : [];

  useEffect(() => {
    // Mark unread messages as read when opening a conversation
    if (selectedUser) {
      conversation.forEach(m => {
        if (m.destinataireId === myId && !m.lu) {
          marquerLu(m.id);
        }
      });
      // Scroll to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedUser, messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    setSending(true);
    await envoyerMessage({ destinataireId: selectedUser.id, sujet: 'Chat', corps: newMessage });
    setNewMessage('');
    setSending(false);
  };

  const getLastMessage = (userId) => {
    const userMsgs = messages.filter(m => 
      (m.expediteurId === myId && m.destinataireId === userId) ||
      (m.expediteurId === userId && m.destinataireId === myId)
    ).sort((a, b) => new Date(b.dateEnvoi) - new Date(a.dateEnvoi));
    return userMsgs[0];
  };

  const getUnreadCount = (userId) => {
    return messages.filter(m => m.expediteurId === userId && m.destinataireId === myId && !m.lu).length;
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateDivider = (iso) => {
    if (!iso) return '';
    const date = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return langue === 'fr' ? "Aujourd'hui" : 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return langue === 'fr' ? 'Hier' : 'Yesterday';
    } else {
      return date.toLocaleDateString(langue === 'fr' ? 'fr-FR' : 'en-US', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 68px)', overflow: 'hidden', background:'var(--bg-app)' }}>
      {/* ── Panneau gauche : Contacts ── */}
      <div style={{
        width: 340, flexShrink: 0, borderRight: '1px solid var(--border-color)',
        display: 'flex', flexDirection: 'column', background: 'var(--bg-card)',
      }}>
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12, display:'flex', alignItems:'center', gap:8 }}>
            <MessageCircle size={20} /> {t.messagerieTitle?.replace('💬 ', '') || 'Messagerie'}
          </h2>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position:'absolute', left:10, top:10, color:'var(--text-muted)' }} />
            <input 
              className="form-control" 
              placeholder="Rechercher un contact..." 
              style={{ paddingLeft: 34, borderRadius: 20 }}
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {filteredDestinos.map(u => {
            const lastMsg = getLastMessage(u.id);
            const unreadCount = getUnreadCount(u.id);
            const isSelected = selectedUser?.id === u.id;
            
            return (
              <div 
                key={u.id}
                onClick={() => setSelectedUser(u)}
                style={{
                  padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
                  cursor: 'pointer', transition: 'background .2s',
                  background: isSelected ? 'var(--gray-100)' : 'transparent',
                }}
                onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = 'var(--gray-50)' }}
                onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ width:44, height:44, borderRadius:'50%', background:'var(--primary)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, flexShrink:0 }}>
                  {u.prenom[0]}{u.nom[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {u.prenom} {u.nom}
                    </div>
                    {lastMsg && <div style={{ fontSize: 11, color: unreadCount > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>{formatTime(lastMsg.dateEnvoi)}</div>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {lastMsg ? lastMsg.corps : <span style={{fontSize:11, fontStyle:'italic'}}>{u.role}</span>}
                    </div>
                    {unreadCount > 0 && <span style={{ background:'var(--primary)', color:'white', fontSize:10, fontWeight:700, borderRadius:10, padding:'2px 6px' }}>{unreadCount}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Panneau droit : Chat ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '16px 24px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--primary)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>
                {selectedUser.prenom[0]}{selectedUser.nom[0]}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{selectedUser.prenom} {selectedUser.nom}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{selectedUser.role}</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {conversation.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ padding: '12px 24px', background: 'var(--bg-card)', borderRadius: 20, fontSize: 13, boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                    Envoyez un message pour démarrer la conversation.
                  </div>
                </div>
              ) : (
                conversation.map((msg, index) => {
                  const isMe = msg.expediteurId === myId;
                  const showDateDivider = index === 0 || new Date(msg.dateEnvoi).toDateString() !== new Date(conversation[index - 1].dateEnvoi).toDateString();

                  return (
                    <React.Fragment key={msg.id}>
                      {showDateDivider && (
                        <div style={{ margin: '12px auto 4px', textAlign: 'center' }}>
                          <span style={{ 
                            background: 'var(--gray-200)', color: 'var(--text-secondary)', 
                            padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' 
                          }}>
                            {formatDateDivider(msg.dateEnvoi)}
                          </span>
                        </div>
                      )}
                      <div style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                        <div style={{ 
                          background: isMe ? 'var(--primary)' : 'var(--bg-card)', 
                          color: isMe ? 'white' : 'var(--text-primary)',
                          padding: '10px 14px', 
                          borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          fontSize: 14, lineHeight: 1.4,
                          boxShadow: '0 1px 2px rgba(0,0,0,.05)',
                          border: isMe ? 'none' : '1px solid var(--border-color)',
                        }}>
                          {msg.corps}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textAlign: isMe ? 'right' : 'left' }}>
                          {formatTime(msg.dateEnvoi)}
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} style={{ padding: '16px 24px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 12 }}>
              <input 
                className="form-control" 
                placeholder="Écrivez un message..." 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)}
                style={{ flex: 1, borderRadius: 24, padding: '12px 20px' }}
              />
              <button type="submit" disabled={!newMessage.trim() || sending} style={{ 
                width: 46, height: 46, borderRadius: '50%', background: 'var(--primary)', color: 'white', 
                border: 'none', cursor: newMessage.trim() ? 'pointer' : 'not-allowed', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: newMessage.trim() ? 1 : 0.6
              }}>
                <Send size={20} style={{ marginLeft: -2 }} />
              </button>
            </form>
          </>
        ) : (
          <div className="empty-state" style={{ flex: 1, justifyContent: 'center' }}>
            <MessageCircle size={64} color="var(--text-muted)" style={{ marginBottom: 16 }} />
            <h3 style={{ color: 'var(--text-secondary)' }}>Vos messages</h3>
            <p>Sélectionnez un contact pour démarrer ou continuer une discussion.</p>
          </div>
        )}
      </div>
    </div>
  );
}
