import Modal from '@/Components/Modal';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function InviteFriendModal({ show, onClose, gameUuid, cardTheme }) {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sentInvites, setSentInvites] = useState({});

    const isDark = cardTheme === 'dark';

    useEffect(() => {
        if (show) {
            setLoading(true);
            axios.get('/friends')
                .then(res => {
                    setFriends(res.data.friends || []);
                })
                .finally(() => setLoading(false));
        } else {
            setSentInvites({});
        }
    }, [show]);

    const sendInvite = async (friendId) => {
        setSentInvites(prev => ({ ...prev, [friendId]: 'sending' }));
        try {
            await axios.post(`/friends/chat/${friendId}/send`, {
                message: `[INVITE_ROOM] ${gameUuid}`
            });
            setSentInvites(prev => ({ ...prev, [friendId]: 'sent' }));
        } catch (error) {
            setSentInvites(prev => ({ ...prev, [friendId]: 'error' }));
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className={`p-6 border-2 rounded-2xl ${
                isDark ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
            }`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-black font-mono tracking-wider">
                        ⚓ Invite Crew
                    </h2>
                    <button onClick={onClose} className="font-bold hover:text-red-500 text-lg">✕</button>
                </div>
                
                {loading ? (
                    <div className="text-center py-4 text-sm font-bold opacity-80">Loading friends...</div>
                ) : friends.length === 0 ? (
                    <div className="text-center py-4 text-sm font-bold opacity-80">No friends to invite.</div>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                        {friends.map(friend => (
                            <div key={friend.id} className={`flex justify-between items-center p-3 border-2 rounded-xl text-xs font-bold ${
                                isDark ? 'bg-[#2E438F]/40 border-white/20 text-white' : 'bg-[#A6B9FF]/20 border-[#2E438F] text-[#091540]'
                            }`}>
                                <div className="flex items-center gap-2">
                                    <span className={`w-2.5 h-2.5 rounded-full ${friend.is_online ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                                    <span className="truncate">{friend.name}</span>
                                </div>
                                <button
                                    onClick={() => sendInvite(friend.id)}
                                    disabled={sentInvites[friend.id] === 'sent' || sentInvites[friend.id] === 'sending'}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                                        sentInvites[friend.id] === 'sent'
                                            ? 'bg-emerald-600 text-white cursor-not-allowed'
                                            : sentInvites[friend.id] === 'sending'
                                            ? 'bg-[#2E438F] text-white opacity-60 cursor-wait'
                                            : 'bg-[#2E438F] hover:bg-[#091540] text-white'
                                    }`}
                                >
                                    {sentInvites[friend.id] === 'sent' ? 'Sent ✓' : sentInvites[friend.id] === 'sending' ? 'Sending...' : 'Invite'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
}
