import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import { useTheme } from '@/hooks/useTheme';
import { useState, useEffect, useRef } from 'react';

export default function Lobby({ games, user, activeTab = 'lobby' }) {
    // Social States
    const [friends, setFriends] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);
    const [friendEmail, setFriendEmail] = useState('');
    const [friendSuccess, setFriendSuccess] = useState('');
    const [friendError, setFriendError] = useState('');

    // Chat States
    const [activeChat, setActiveChat] = useState(null); // Friend object or null
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [showEmotes, setShowEmotes] = useState(false);
    const chatEndRef = useRef(null);

    // Global Theme State ('dark' or 'light')
    const [theme, setTheme] = useTheme();
    const cardTheme = theme;

    // Room Creation Options
    const [splendorPlayers, setSplendorPlayers] = useState(4);
    const [snakesPlayers, setSnakesPlayers] = useState(4);
    const [wordlePlayers, setWordlePlayers] = useState(2);
    const [disbandTarget, setDisbandTarget] = useState(null);
    const [removeTarget, setRemoveTarget] = useState(null);

    // Filter, Search, and Pagination States
    const [lobbyFilter, setLobbyFilter] = useState('all'); // all, splendor, snakes, wordle
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Store previous friends state to detect new unread messages
    const previousFriendsRef = useRef([]);

    // Ask for Notification permission on load
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

    // Fetch Friend Data
    const fetchFriendsData = () => {
        fetch(route('friends.index'))
            .then((res) => res.json())
            .then((data) => {
                if (data) {
                    const newFriends = data.friends || [];
                    
                    // Check for new messages
                    newFriends.forEach(newFriend => {
                        const oldFriend = previousFriendsRef.current.find(f => f.id === newFriend.id);
                        if (oldFriend && newFriend.unread_count > oldFriend.unread_count) {
                            // Don't notify if this is the active chat AND the window is focused
                            const isCurrentlyActive = activeChat && activeChat.id === newFriend.id;
                            if (!(isCurrentlyActive && document.hasFocus())) {
                                if ('Notification' in window && Notification.permission === 'granted') {
                                    new Notification(`New message from ${newFriend.name}`, {
                                        body: 'Ye have a new dispatch! Check the tavern.',
                                        icon: '/favicon.ico'
                                    });
                                }
                            }
                        }
                    });

                    previousFriendsRef.current = newFriends;
                    setFriends(newFriends);
                    setIncomingRequests(data.incoming || []);
                    setOutgoingRequests(data.outgoing || []);
                }
            })
            .catch((err) => console.error('Error fetching friends:', err));
    };

    // Poll social status in background (every 7.5 seconds)
    useEffect(() => {
        fetchFriendsData();
        const interval = setInterval(fetchFriendsData, 7500);
        return () => clearInterval(interval);
    }, [activeChat]);

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, activeChat]);

    // Poll chat messages in background (every 3 seconds when open)
    useEffect(() => {
        let chatInterval = null;
        if (activeChat) {
            const loadMessages = () => {
                fetch(route('friends.messages', activeChat.id))
                    .then((res) => res.json())
                    .then((data) => {
                        if (data && data.messages) {
                            setChatMessages(data.messages);
                        }
                    })
                    .catch((err) => console.error('Error fetching chat messages:', err));
            };

            loadMessages();
            chatInterval = setInterval(loadMessages, 3000);
        } else {
            setChatMessages([]);
        }

        return () => {
            if (chatInterval) clearInterval(chatInterval);
        };
    }, [activeChat]);

    // Send Friend Request
    const handleSendFriendRequest = (e) => {
        e.preventDefault();
        setFriendSuccess('');
        setFriendError('');

        fetch(route('friends.request'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ email: friendEmail }),
        })
            .then(async (res) => {
                const data = await res.json();
                if (res.ok) {
                    setFriendSuccess(data.success);
                    setFriendEmail('');
                    fetchFriendsData();
                } else {
                    setFriendError(data.error || 'Failed to send request.');
                }
            })
            .catch((err) => {
                console.error(err);
                setFriendError('An error occurred.');
            });
    };

    // Accept Friend Request
    const handleAcceptRequest = (friendshipId) => {
        fetch(route('friends.accept', friendshipId), {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        })
            .then((res) => {
                if (res.ok) {
                    fetchFriendsData();
                }
            })
            .catch((err) => console.error(err));
    };

    // Decline/Remove Friend Request
    const handleDeclineRequest = (friendshipId) => {
        fetch(route('friends.decline', friendshipId), {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        })
            .then((res) => {
                if (res.ok) {
                    fetchFriendsData();
                    if (activeChat && activeChat.friendship_id === friendshipId) {
                        setActiveChat(null);
                    }
                }
            })
            .catch((err) => console.error(err));
    };

    // Send Direct Message
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !activeChat) return;

        const currentInput = chatInput;
        setChatInput('');

        fetch(route('friends.send', activeChat.id), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: JSON.stringify({ message: currentInput }),
        })
            .then(async (res) => {
                const data = await res.json();
                if (res.ok && data.success) {
                    setChatMessages((prev) => [...prev, data.message]);
                }
            })
            .catch((err) => console.error('Error sending message:', err));
    };

    const createGame = (gameType, maxPlayers) => {
        router.post(route('games.create'), {
            game_type: gameType,
            max_players: maxPlayers,
        });
    };

    const joinGame = (uuid) => {
        router.post(route('games.join', uuid));
    };

    // Separate Lobbies list into:
    // 1. waiting/unstarted lobbies that match the search/filters (will be paginated)
    // 2. joined active/playing voyages (rejoin games, shown in a separate card deck)
    const activeJoinedVoyages = games.filter(
        (g) => g.is_joined && g.status === 'playing'
    );

    const recruitingLobbies = games.filter((g) => {
        // Only show waiting/recruiting lobbies
        if (g.status !== 'waiting') return false;

        // Filter by game type
        if (lobbyFilter !== 'all' && g.game_type !== lobbyFilter) return false;

        // Filter by search query (Creator name)
        if (searchQuery.trim() !== '') {
            return g.creator.toLowerCase().includes(searchQuery.toLowerCase());
        }

        return true;
    });

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(recruitingLobbies.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedLobbies = recruitingLobbies.slice(startIndex, startIndex + itemsPerPage);

    // Reset pagination page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [lobbyFilter, searchQuery]);

    // Theme wrapper classes
    const isDark = cardTheme === 'dark';

    const outerWrapperClass = isDark 
        ? 'py-8 bg-[#091540] text-white min-h-[calc(100vh-4rem)] transition-colors' 
        : 'py-8 bg-white text-[#091540] min-h-[calc(100vh-4rem)] transition-colors';

    const panelClass = isDark
        ? 'bg-[#091540] border-2 border-[#2E438F] rounded-2xl p-6 sm:p-8 shadow-2xl transition-colors text-white'
        : 'bg-white border-2 border-[#2E438F] rounded-2xl p-6 sm:p-8 shadow-lg transition-colors text-[#091540]';

    const innerCardClass = isDark
        ? 'bg-[#2E438F]/30 border-2 border-[#A6B9FF]/30 rounded-xl p-5 flex flex-col justify-between hover:border-[#A6B9FF] transition-all shadow-md text-white'
        : 'bg-white border-2 border-[#2E438F] rounded-xl p-5 flex flex-col justify-between hover:border-[#091540] transition-all shadow-md text-[#091540]';

    const textMutedClass = isDark ? 'text-white/80' : 'text-[#2E438F]';
    const textTitleClass = isDark ? 'text-white font-black' : 'text-[#091540] font-black';

    const selectClass = isDark
        ? 'bg-[#091540] border-2 border-white/30 text-white py-1.5 px-3 rounded-xl text-xs focus:border-[#A6B9FF] font-bold'
        : 'bg-white border-2 border-[#2E438F] text-[#091540] py-1.5 px-3 rounded-xl text-xs focus:border-[#091540] font-bold';

    const inputClass = isDark
        ? 'w-full text-xs bg-[#091540] border-2 border-white/30 rounded-xl focus:border-[#A6B9FF] focus:ring-[#A6B9FF] text-white placeholder-white/50 py-2 px-3.5 font-bold'
        : 'w-full text-xs bg-white border-2 border-[#2E438F] rounded-xl focus:border-[#091540] focus:ring-[#091540] text-[#091540] placeholder-[#2E438F]/60 py-2 px-3.5 font-bold';

    const tabBtnActive = isDark
        ? 'bg-[#2E438F] text-white border-2 border-[#A6B9FF] font-black shadow-md'
        : 'bg-[#2E438F] text-white border-2 border-[#091540] font-black shadow-md';
    const tabBtnInactive = isDark
        ? 'bg-[#091540] text-[#A6B9FF] border-2 border-white/20 hover:text-white hover:border-[#A6B9FF] font-bold'
        : 'bg-[#A6B9FF]/20 text-[#091540] border-2 border-[#2E438F] hover:bg-[#A6B9FF]/40 font-bold';

    return (
        <AuthenticatedLayout>
            <Head title="Tortuga Game Cove - Lobby" />

            <div className={outerWrapperClass}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    
                    {/* Main Content Area */}
                    <div className="grid gap-6 items-start">
                        
                        {/* ACTIVE TAB: GAME DECK */}
                        {activeTab === 'deck' && (
                            <div className="flex flex-col gap-6">
                                {/* GAME COVE DASHBOARD (Game Cards Selection) */}
                                <div className={panelClass}>
                                    <h3 className={`text-base font-black font-mono tracking-widest uppercase mb-4 flex items-center gap-2 border-b pb-3 ${isDark ? 'border-white/20 text-white' : 'border-[#2E438F] text-[#091540]'}`}>
                                        <span>🧭</span> Game Selection Deck
                                    </h3>
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {/* Card 1: Splendor */}
                                        <div className={`rounded-2xl border-2 p-6 flex flex-col justify-between transition-all shadow-md ${
                                            isDark ? 'bg-[#091540] border-white/30 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                                        }`}>
                                            <div>
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-3xl">🚢💎</span>
                                                    <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg border font-mono ${
                                                        isDark ? 'bg-[#2E438F] text-[#A6B9FF] border-[#A6B9FF]/40' : 'bg-[#A6B9FF]/30 text-[#091540] border-[#2E438F]'
                                                    }`}>
                                                        Card Drafting
                                                    </span>
                                                </div>
                                                <h4 className={`text-lg font-black font-mono tracking-wide ${isDark ? 'text-white' : 'text-[#091540]'}`}>
                                                    CORSAIR'S COVE (SPLENDOR)
                                                </h4>
                                                <p className={`text-xs mt-2.5 leading-relaxed font-medium ${isDark ? 'text-white/80' : 'text-[#091540]/80'}`}>
                                                    Plunder resources, trade with merchants, hire legendary crew members, and purchase powerful pirate ships to earn Infamy. The first captain to reach 15 infamy points rules the cove!
                                                </p>
                                            </div>

                                            <div className={`mt-6 pt-4 border-t flex items-center justify-between gap-4 ${isDark ? 'border-white/20' : 'border-[#2E438F]/30'}`}>
                                                <div className="flex items-center gap-2">
                                                    <label className={`text-xs uppercase font-black font-mono ${isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>Crew Limit:</label>
                                                    <select 
                                                        value={splendorPlayers} 
                                                        onChange={(e) => setSplendorPlayers(parseInt(e.target.value))}
                                                        className={selectClass}
                                                    >
                                                        <option value={2}>2 Players</option>
                                                        <option value={3}>3 Players</option>
                                                        <option value={4}>4 Players</option>
                                                    </select>
                                                </div>
                                                <button
                                                    onClick={() => createGame('splendor', splendorPlayers)}
                                                    className={`inline-flex items-center rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition shadow border-2 hover:scale-[1.02] ${
                                                        isDark
                                                            ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-[#A6B9FF]/40'
                                                            : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540]'
                                                    }`}
                                                >
                                                    Set Sail
                                                </button>
                                            </div>
                                        </div>

                                        {/* Card 2: Snakes & Ladders */}
                                        <div className={`rounded-2xl border-2 p-6 flex flex-col justify-between transition-all shadow-md ${
                                            isDark ? 'bg-[#091540] border-white/30 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                                        }`}>
                                            <div>
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-3xl">🐉🎲</span>
                                                    <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg border font-mono ${
                                                        isDark ? 'bg-[#2E438F] text-[#A6B9FF] border-[#A6B9FF]/40' : 'bg-[#A6B9FF]/30 text-[#091540] border-[#2E438F]'
                                                    }`}>
                                                        Dice Board
                                                    </span>
                                                </div>
                                                <h4 className={`text-lg font-black font-mono tracking-wide ${isDark ? 'text-white' : 'text-[#091540]'}`}>
                                                    SERPENTS & RIGGING (ULAR TANGGA)
                                                </h4>
                                                <p className={`text-xs mt-2.5 leading-relaxed font-medium ${isDark ? 'text-white/80' : 'text-[#091540]/80'}`}>
                                                    Roll the dice to navigate through the stormy sea! Climb rope rigging, dodge sea serpents, and race to anchor your ship safely at cell 100 before the other captains.
                                                </p>
                                            </div>

                                            <div className={`mt-6 pt-4 border-t flex items-center justify-between gap-4 ${isDark ? 'border-white/20' : 'border-[#2E438F]/30'}`}>
                                                <div className="flex items-center gap-2">
                                                    <label className={`text-xs uppercase font-black font-mono ${isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>Crew Limit:</label>
                                                    <select 
                                                        value={snakesPlayers} 
                                                        onChange={(e) => setSnakesPlayers(parseInt(e.target.value))}
                                                        className={selectClass}
                                                    >
                                                        <option value={2}>2 Players</option>
                                                        <option value={3}>3 Players</option>
                                                        <option value={4}>4 Players</option>
                                                    </select>
                                                </div>
                                                <button
                                                    onClick={() => createGame('snakes', snakesPlayers)}
                                                    className={`inline-flex items-center rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition shadow border-2 hover:scale-[1.02] ${
                                                        isDark
                                                            ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-[#A6B9FF]/40'
                                                            : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540]'
                                                    }`}
                                                >
                                                    Set Sail
                                                </button>
                                            </div>
                                        </div>

                                        {/* Card 3: Sandi Tortuga (Wordle KBBI) */}
                                        <div className={`rounded-2xl border-2 p-6 flex flex-col justify-between transition-all shadow-md ${
                                            isDark ? 'bg-[#091540] border-white/30 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                                        }`}>
                                            <div>
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-3xl">📜🔤</span>
                                                    <span className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg border font-mono ${
                                                        isDark ? 'bg-[#2E438F] text-[#A6B9FF] border-[#A6B9FF]/40' : 'bg-[#A6B9FF]/30 text-[#091540] border-[#2E438F]'
                                                    }`}>
                                                        Word Battle
                                                    </span>
                                                </div>
                                                <h4 className={`text-lg font-black font-mono tracking-wide ${isDark ? 'text-white' : 'text-[#091540]'}`}>
                                                    SANDI TORTUGA (TEBAK KATA)
                                                </h4>
                                                <p className={`text-xs mt-2.5 leading-relaxed font-medium ${isDark ? 'text-white/80' : 'text-[#091540]/80'}`}>
                                                    Pecahkan 5 huruf sandi rahasia kapal bajak laut dalam 6 kesempatan sesuai kosakata bahasa Indonesia sehari-hari! Berlomba memecahkan kata rahasia lebih cepat dari kapten lawan dalam arena duel 2x2.
                                                </p>
                                            </div>

                                            <div className={`mt-6 pt-4 border-t flex items-center justify-between gap-4 ${isDark ? 'border-white/20' : 'border-[#2E438F]/30'}`}>
                                                <div className="flex items-center gap-2">
                                                    <label className={`text-xs uppercase font-black font-mono ${isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>Crew Limit:</label>
                                                    <select 
                                                        value={wordlePlayers} 
                                                        onChange={(e) => setWordlePlayers(parseInt(e.target.value))}
                                                        className={selectClass}
                                                    >
                                                        <option value={1}>1 Player (Solo)</option>
                                                        <option value={2}>2 Players</option>
                                                        <option value={3}>3 Players</option>
                                                        <option value={4}>4 Players</option>
                                                    </select>
                                                </div>
                                                <button
                                                    onClick={() => createGame('wordle', wordlePlayers)}
                                                    className={`inline-flex items-center rounded-xl px-5 py-2.5 text-xs font-black uppercase tracking-widest transition shadow border-2 hover:scale-[1.02] ${
                                                        isDark
                                                            ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-[#A6B9FF]/40'
                                                            : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540]'
                                                    }`}
                                                >
                                                    Set Sail
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ACTIVE TAB: LOBBY TAVERN */}
                        {activeTab === 'lobby' && (
                            <div className="flex flex-col gap-6">

                            {/* REJOIN ACTIVE/PLAYING GAMES */}
                            {activeJoinedVoyages.length > 0 && (
                                <div className={panelClass}>
                                    <h3 className={`text-sm font-black font-mono tracking-widest uppercase mb-4 flex items-center gap-2 border-b pb-2.5 animate-pulse ${
                                        isDark ? 'border-white/20 text-white' : 'border-[#2E438F]/30 text-[#091540]'
                                    }`}>
                                        <span>⛵</span> Yer Current Active Voyages (Rejoin Game)
                                    </h3>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {activeJoinedVoyages.map((game) => (
                                            <div key={game.id} className={innerCardClass}>
                                                <div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`text-[10px] font-bold font-mono tracking-wider px-2.5 py-1 rounded-lg border ${
                                                            isDark ? 'bg-[#091540] border-[#A6B9FF]/40 text-[#A6B9FF]' : 'bg-[#A6B9FF]/30 border-[#2E438F] text-[#091540]'
                                                        }`}>
                                                            ID: {game.uuid.substring(0, 8)}
                                                        </span>
                                                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase font-mono tracking-wider border ${
                                                            isDark ? 'bg-[#091540] text-emerald-400 border-emerald-400/40' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                        }`}>
                                                            ⛵ Sailing
                                                        </span>
                                                    </div>
                                                    <h4 className={`text-sm font-bold ${textTitleClass}`}>
                                                        Captain {game.creator}'s Fleet
                                                    </h4>
                                                    <p className="text-[10px] text-[#2E438F] font-mono mt-0.5 uppercase tracking-widest font-black">
                                                        {game.game_type === 'snakes' ? '🐉 Serpents & Rigging' : (game.game_type === 'wordle' ? '📜 Sandi Tortuga' : '💎 Corsair\'s Cove')}
                                                    </p>
                                                    <div className="mt-3">
                                                        <p className={`text-[9px] uppercase tracking-widest font-mono ${textMutedClass}`}>
                                                            Crew size: {game.player_count}/{game.max_players}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-3 border-t border-[#2E438F]/20">
                                                    <Link
                                                        href={route('games.show', game.uuid)}
                                                        className="w-full inline-block text-center rounded bg-[#2E438F] px-4 py-2 text-xs font-black text-white uppercase tracking-widest hover:bg-[#2E438F] transition shadow"
                                                    >
                                                        Enter Cabin
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* RECRUITING LOBBIES SEARCH & LIST */}
                            <div className={panelClass}>
                                <div className={`flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 border-b pb-4 ${
                                    cardTheme === 'dark' ? 'border-white/20' : 'border-[#2E438F]'
                                }`}>
                                    <h3 className={`text-sm font-bold font-mono tracking-widest uppercase flex items-center gap-2 ${
                                        cardTheme === 'dark' ? 'text-white' : 'text-[#091540]'
                                    }`}>
                                        <span>🌊</span> Recruiting Lobbies
                                    </h3>
                                    
                                    {/* Search Bar */}
                                    <div className="w-full md:w-64">
                                        <input
                                            type="text"
                                            placeholder="🔍 Search Captain..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className={`w-full text-xs rounded-lg py-2 px-3 font-bold border transition ${
                                                cardTheme === 'dark'
                                                    ? 'bg-[#091540] border-white/40 text-white placeholder-white/60 focus:border-white focus:ring-white'
                                                    : 'bg-white border-[#2E438F] text-[#2E438F] placeholder-[#2E438F]/60 focus:border-[#091540] focus:ring-[#091540]'
                                            }`}
                                        />
                                    </div>
                                </div>

                                {/* Filter Tabs */}
                                <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                                    <button
                                        onClick={() => setLobbyFilter('all')}
                                        className={`px-3 py-1.5 border text-xs font-bold font-mono tracking-wider rounded uppercase transition duration-150 ${
                                            lobbyFilter === 'all' ? tabBtnActive : tabBtnInactive
                                        }`}
                                    >
                                        ⚓ All Lobbies
                                    </button>
                                    <button
                                        onClick={() => setLobbyFilter('splendor')}
                                        className={`px-3 py-1.5 border text-xs font-bold font-mono tracking-wider rounded uppercase transition duration-150 ${
                                            lobbyFilter === 'splendor' ? tabBtnActive : tabBtnInactive
                                        }`}
                                    >
                                        💎 Splendor
                                    </button>
                                    <button
                                        onClick={() => setLobbyFilter('snakes')}
                                        className={`px-3 py-1.5 border text-xs font-bold font-mono tracking-wider rounded uppercase transition duration-150 ${
                                            lobbyFilter === 'snakes' ? tabBtnActive : tabBtnInactive
                                        }`}
                                    >
                                        🐉 Ular Tangga
                                    </button>
                                    <button
                                        onClick={() => setLobbyFilter('wordle')}
                                        className={`px-3 py-1.5 border text-xs font-bold font-mono tracking-wider rounded uppercase transition duration-150 ${
                                            lobbyFilter === 'wordle' ? tabBtnActive : tabBtnInactive
                                        }`}
                                    >
                                        📜 Sandi Tortuga
                                    </button>
                                </div>

                                {paginatedLobbies.length === 0 ? (
                                    <div className="text-center py-12 text-[#2E438F]">
                                        <span className="text-4xl block mb-2">☠️</span>
                                        No unstarted recruiting lobbies found matching the filters. Create one above!
                                    </div>
                                ) : (
                                    <div>
                                        <div className="grid gap-6 md:grid-cols-2">
                                            {paginatedLobbies.map((game) => (
                                                <div key={game.id} className={innerCardClass}>
                                                    <div>
                                                        <div className="flex justify-between items-start mb-3">
                                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border font-mono tracking-wider ${
                                                                isDark ? 'bg-[#091540] border-[#A6B9FF]/40 text-[#A6B9FF]' : 'bg-[#A6B9FF]/30 border-[#2E438F] text-[#091540]'
                                                            }`}>
                                                                ID: {game.uuid.substring(0, 8)}
                                                            </span>
                                                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase font-mono tracking-wider border ${
                                                                isDark ? 'bg-[#091540] text-[#A6B9FF] border-[#A6B9FF]/40' : 'bg-[#A6B9FF]/30 text-[#091540] border-[#2E438F]'
                                                            }`}>
                                                                ⚓ Recruiting
                                                            </span>
                                                        </div>

                                                        <h4 className={`text-base font-black ${textTitleClass}`}>
                                                            Captain {game.creator}'s Fleet
                                                        </h4>
                                                        <p className={`text-[11px] font-mono mt-0.5 uppercase tracking-widest font-black ${
                                                            isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'
                                                        }`}>
                                                            {game.game_type === 'snakes' ? '🐉 Serpents & Rigging' : (game.game_type === 'wordle' ? '📜 Sandi Tortuga' : "💎 Splendor: Corsair's Cove")}
                                                        </p>

                                                        <div className="mt-4">
                                                            <p className={`text-[10px] uppercase tracking-widest font-black font-mono ${textMutedClass}`}>
                                                                Joined Crew ({game.player_count}/{game.max_players}):
                                                            </p>
                                                            <div className="mt-2 flex flex-wrap gap-1.5">
                                                                {game.players.map((name, idx) => (
                                                                    <span
                                                                        key={idx}
                                                                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                                                                            isDark ? 'bg-[#091540] border-white/30 text-white' : 'bg-[#A6B9FF]/20 border-[#2E438F] text-[#091540]'
                                                                        }`}
                                                                    >
                                                                        🏴‍☠️ {name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className={`mt-6 pt-3 border-t flex flex-col gap-2 ${isDark ? 'border-white/20' : 'border-[#2E438F]/30'}`}>
                                                        {game.is_joined ? (
                                                            <div className="flex gap-2 w-full">
                                                                <Link
                                                                    href={route('games.show', game.uuid)}
                                                                    className={`flex-1 text-center rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest transition shadow border-2 ${
                                                                        isDark 
                                                                            ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-[#A6B9FF]/40' 
                                                                            : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540]'
                                                                    }`}
                                                                >
                                                                    Enter Cabin
                                                                </Link>
                                                                {game.creator_id === user.id && (
                                                                    <button
                                                                        onClick={() => setDisbandTarget(game.uuid)}
                                                                        className="rounded-xl px-4 py-2 text-xs font-black text-white border-2 border-red-500 bg-red-600 hover:bg-red-500 transition shadow uppercase tracking-widest"
                                                                    >
                                                                        Disband
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ) : game.player_count < game.max_players ? (
                                                            <button
                                                                onClick={() => joinGame(game.uuid)}
                                                                className={`w-full rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest border-2 transition hover:scale-[1.01] shadow ${
                                                                    isDark
                                                                        ? 'bg-[#091540] hover:bg-[#2E438F] text-white border-white/30'
                                                                        : 'bg-white hover:bg-[#2E438F] hover:text-white text-[#2E438F] border-[#2E438F]'
                                                                }`}
                                                            >
                                                                Join Crew
                                                            </button>
                                                        ) : (
                                                            <button
                                                                disabled
                                                                className="w-full rounded-xl bg-slate-400/20 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-widest border border-slate-300 cursor-not-allowed text-center"
                                                            >
                                                                Ship is full
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/*                                         {/* CUSTOM PIRATE-THEMED PAGINATION */}
                                        {totalPages > 1 && (
                                            <div className="mt-8 pt-4 border-t border-[#2E438F]/20 flex justify-between items-center text-xs font-mono select-none">
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className={`px-3.5 py-2 border-2 rounded-xl uppercase font-black transition flex items-center gap-1.5 ${
                                                        currentPage === 1 
                                                            ? 'opacity-30 cursor-not-allowed border-current' 
                                                            : (isDark ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-[#A6B9FF]/40' : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540]')
                                                    }`}
                                                >
                                                    ◀ Prev Shore
                                                </button>
                                                <span className={`font-black tracking-wider text-xs ${isDark ? 'text-white' : 'text-[#091540]'}`}>
                                                    Shore {currentPage} of {totalPages}
                                                </span>
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className={`px-3.5 py-2 border-2 rounded-xl uppercase font-black transition flex items-center gap-1.5 ${
                                                        currentPage === totalPages 
                                                            ? 'opacity-30 cursor-not-allowed border-current' 
                                                            : (isDark ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-[#A6B9FF]/40' : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540]')
                                                    }`}
                                                >
                                                    Next Shore ▶
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                </div>
                            </div>
                        )}

                        {/* ACTIVE TAB: CREW */}
                        {activeTab === 'crew' && (
                        <div className={panelClass}>
                            
                            {/* Add Friend Request */}
                            <div>
                                <h3 className={`text-xs font-black font-mono tracking-widest uppercase mb-3 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-[#091540]'}`}>
                                    <span>➕</span> Add Crew Member
                                </h3>
                                <form onSubmit={handleSendFriendRequest} className="flex flex-col gap-2">
                                    <input
                                        type="text"
                                        placeholder="Username#PMPL"
                                        value={friendEmail}
                                        onChange={(e) => setFriendEmail(e.target.value)}
                                        className={inputClass}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className={`w-full text-xs font-black uppercase tracking-widest py-2.5 rounded-xl border-2 transition shadow-md ${
                                            isDark 
                                                ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-[#A6B9FF]/40' 
                                                : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540]'
                                        }`}
                                    >
                                        Send Request
                                    </button>
                                </form>
                                {friendSuccess && <p className="text-[10px] text-green-500 font-semibold mt-1">{friendSuccess}</p>}
                                {friendError && <p className="text-[10px] text-red-400 font-semibold mt-1">{friendError}</p>}
                            </div>

                            {/* Friend Requests (Incoming) */}
                            {incomingRequests.length > 0 && (
                                <div className={`border-t pt-4 mt-4 ${isDark ? 'border-white/20' : 'border-[#2E438F]/20'}`}>
                                    <h3 className={`text-xs font-black font-mono tracking-widest uppercase mb-3 ${isDark ? 'text-white' : 'text-[#091540]'}`}>
                                        🔔 Requests Received ({incomingRequests.length})
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        {incomingRequests.map((req) => (
                                            <div key={req.friendship_id} className={`p-3 rounded-xl border-2 flex justify-between items-center text-xs ${
                                                isDark ? 'bg-[#2E438F]/30 border-white/20 text-white' : 'bg-[#A6B9FF]/20 border-[#2E438F] text-[#091540]'
                                            }`}>
                                                <div className="truncate pr-1">
                                                    <p className={`font-bold truncate ${textTitleClass}`}>{req.name}</p>
                                                    <p className="text-[10px] text-[#2E438F] truncate">{req.email}</p>
                                                </div>
                                                <div className="flex gap-1 shrink-0">
                                                    <button
                                                        onClick={() => handleAcceptRequest(req.friendship_id)}
                                                        className="bg-[#2E438F] hover:bg-[#2E438F] text-white font-bold px-1.5 py-0.5 rounded text-[10px] uppercase transition"
                                                        title="Accept"
                                                    >
                                                        ✓
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeclineRequest(req.friendship_id)}
                                                        className="bg-red-800 hover:bg-red-700 text-white font-bold px-1.5 py-0.5 rounded text-[10px] uppercase transition"
                                                        title="Decline"
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Friends List (Discord-style Status) */}
                                <div className={`border-t pt-5 mt-5 ${isDark ? 'border-white/20' : 'border-[#2E438F]/30'}`}>
                                    <h3 className={`text-xs font-black font-mono tracking-widest uppercase mb-4 flex items-center gap-2 ${textTitleClass}`}>
                                        <span>👥</span> Crew Members ({friends.length})
                                    </h3>

                                    {friends.length === 0 ? (
                                        <p className={`text-xs text-center py-6 italic font-medium ${textMutedClass}`}>
                                            Ye have no crewmates yet. Add them by username#hashtag above!
                                        </p>
                                    ) : (
                                        <div className="flex flex-col gap-2.5">
                                            {friends.map((friend) => {
                                                const isOnline = friend.is_online;
                                                const statusText = friend.activity_status;
                                                const isPlaying = statusText.startsWith('Playing');

                                                return (
                                                    <div
                                                        key={friend.id}
                                                        onClick={() => setActiveChat(friend)}
                                                        className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all group shadow-sm ${
                                                            isDark
                                                                ? 'bg-[#2E438F]/30 hover:bg-[#2E438F]/60 border-white/20 text-white'
                                                                : 'bg-[#A6B9FF]/20 hover:bg-[#A6B9FF]/40 border-[#2E438F] text-[#091540]'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3 truncate pr-2">
                                                            <span
                                                                className={`w-3 h-3 rounded-full shrink-0 ${
                                                                    isPlaying
                                                                        ? 'bg-[#A6B9FF] animate-pulse'
                                                                        : isOnline
                                                                        ? 'bg-emerald-400'
                                                                        : 'bg-slate-400'
                                                                }`}
                                                                title={isOnline ? (isPlaying ? 'Playing Game' : 'Online') : 'Offline'}
                                                            />
                                                            
                                                            <div className="truncate">
                                                                <div className="flex items-center gap-2">
                                                                    <p className={`text-sm font-black truncate ${isDark ? 'text-white' : 'text-[#091540]'}`}>
                                                                        {friend.name}
                                                                    </p>
                                                                    {friend.unread_count > 0 && (
                                                                        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce shrink-0">
                                                                            {friend.unread_count}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className={`text-xs font-bold truncate ${
                                                                    isPlaying
                                                                        ? (isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]')
                                                                        : isOnline
                                                                        ? 'text-emerald-500'
                                                                        : (isDark ? 'text-white/60' : 'text-[#2E438F]/70')
                                                                }`}>
                                                                    {isPlaying ? '🎮 ' + statusText : isOnline ? 'Online' : 'Offline'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition duration-150 pr-1">
                                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                                                                isDark ? 'bg-[#091540] border-white/30 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                                                            }`}>
                                                                💬 Chat
                                                            </span>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setRemoveTarget(friend);
                                                                }}
                                                                className="text-xs font-bold text-red-500 hover:text-red-400 px-2 py-1 rounded"
                                                                title="Remove friend"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Disband Confirmation Modal */}
            <Modal show={disbandTarget !== null} onClose={() => setDisbandTarget(null)} maxWidth="sm">
                <div className={`p-6 border-2 rounded-2xl ${isDark ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'}`}>
                    <h2 className="text-xl font-black font-mono uppercase tracking-widest text-center mb-3 flex justify-center items-center gap-2 text-red-500">
                        <span>☠️</span> SCUTTLE SHIP?
                    </h2>
                    <p className="text-center font-medium mb-6 text-sm">
                        Are ye absolutely sure ye want to disband this voyage? All crew members will be returned to the tavern.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => setDisbandTarget(null)}
                            className={`px-5 py-2.5 rounded-xl font-black uppercase text-xs tracking-wider border-2 transition ${
                                isDark ? 'bg-[#2E438F] hover:bg-[#091540] text-white border-white/20' : 'bg-white hover:bg-[#A6B9FF]/20 text-[#091540] border-[#2E438F]'
                            }`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (disbandTarget) {
                                    router.delete(route('games.destroy', disbandTarget));
                                    setDisbandTarget(null);
                                }
                            }}
                            className="px-5 py-2.5 rounded-xl font-black bg-red-600 hover:bg-red-500 text-white shadow uppercase text-xs tracking-wider transition"
                        >
                            Disband!
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Remove Friend Confirmation Modal */}
            <Modal show={removeTarget !== null} onClose={() => setRemoveTarget(null)} maxWidth="sm">
                <div className={`p-6 border-2 rounded-2xl ${isDark ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'}`}>
                    <h2 className="text-xl font-black font-mono uppercase tracking-widest text-center mb-3 flex justify-center items-center gap-2 text-red-500">
                        <span>☠️</span> WALK THE PLANK?
                    </h2>
                    <p className="text-center font-medium mb-6 text-sm">
                        Are ye sure ye want to throw {removeTarget?.name} overboard and remove them from yer crew?
                    </p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => setRemoveTarget(null)}
                            className={`px-5 py-2.5 rounded-xl font-black uppercase text-xs tracking-wider border-2 transition ${
                                isDark ? 'bg-[#2E438F] hover:bg-[#091540] text-white border-white/20' : 'bg-white hover:bg-[#A6B9FF]/20 text-[#091540] border-[#2E438F]'
                            }`}
                        >
                            Mercy (Cancel)
                        </button>
                        <button
                            onClick={() => {
                                if (removeTarget) {
                                    router.delete(route('friends.decline', removeTarget.id));
                                    setRemoveTarget(null);
                                    fetchFriendsData();
                                }
                            }}
                            className="px-5 py-2.5 rounded-xl font-black bg-red-600 hover:bg-red-500 text-white shadow uppercase text-xs tracking-wider transition"
                        >
                            Overboard!
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ----------------- ACTIVE CHAT DRAWER / WIDGET ----------------- */}
            {activeChat && (
                <div className={`fixed bottom-4 right-4 w-80 sm:w-96 h-[460px] rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden z-50 border-2 animate-slide-up transition-all ${
                    isDark ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                }`}>
                    {/* Chat Header */}
                    <div className={`px-4 py-3 flex justify-between items-center shrink-0 ${
                        isDark ? 'bg-[#2E438F] text-white' : 'bg-[#2E438F] text-white'
                    }`}>
                        <div className="flex items-center gap-2.5 truncate">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                activeChat.activity_status.startsWith('Playing')
                                    ? 'bg-amber-400 animate-pulse'
                                    : activeChat.is_online
                                    ? 'bg-emerald-400'
                                    : 'bg-slate-400'
                            }`} />
                            <div className="truncate">
                                <h4 className="text-xs font-black text-white truncate">{activeChat.name}</h4>
                                <p className="text-[10px] text-[#A6B9FF] truncate font-mono">
                                    {activeChat.activity_status.startsWith('Playing') ? 'Playing Game' : activeChat.is_online ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveChat(null)}
                            className="text-white hover:text-red-300 font-black text-base px-1.5 transition"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className={`grow p-3.5 overflow-y-auto flex flex-col gap-2.5 max-h-80 scrollbar-thin ${
                        isDark ? 'bg-[#091540]' : 'bg-slate-50'
                    }`}>
                        {chatMessages.length === 0 ? (
                            <div className={`text-center py-12 text-xs italic font-medium ${isDark ? 'text-white/60' : 'text-[#2E438F]/70'}`}>
                                No whispers exchanged yet. Send a message to start chatting!
                            </div>
                        ) : (
                            chatMessages.map((msg) => {
                                const isMe = msg.sender_id === user.id;
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col max-w-[80%] rounded-2xl p-2.5 text-xs relative ${
                                            isMe
                                                ? 'self-end bg-[#2E438F] text-white font-medium rounded-tr-none shadow-sm'
                                                : isDark 
                                                ? 'self-start bg-[#2E438F]/40 text-white border border-white/20 rounded-tl-none'
                                                : 'self-start bg-white text-[#091540] border-2 border-[#2E438F] rounded-tl-none shadow-sm'
                                        }`}
                                    >
                                        <p className="break-words leading-relaxed select-text font-semibold">{msg.message}</p>
                                        <span className={`text-[9px] self-end mt-1 font-mono leading-none ${
                                            isMe ? 'text-[#A6B9FF]' : isDark ? 'text-white/60' : 'text-[#2E438F]/70'
                                        }`}>
                                            {msg.time}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Chat Input form */}
                    <form onSubmit={handleSendMessage} className={`p-3 border-t-2 flex gap-2 shrink-0 ${
                        isDark ? 'bg-[#091540] border-white/20' : 'bg-white border-[#2E438F]'
                    }`}>
                        <input
                            type="text"
                            placeholder="Send a whisper..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            className={`grow rounded-xl px-3 py-2 text-xs font-bold border-2 transition ${
                                isDark
                                    ? 'bg-[#091540] border-white/30 text-white placeholder-white/50 focus:border-[#A6B9FF]'
                                    : 'bg-white border-[#2E438F] text-[#091540] placeholder-[#2E438F]/60 focus:border-[#091540]'
                            }`}
                            maxLength={1000}
                            required
                        />
                        <button
                            type="submit"
                            className={`font-black text-xs px-4 py-2 rounded-xl uppercase tracking-wider transition shrink-0 border-2 ${
                                isDark
                                    ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-[#A6B9FF]/40'
                                    : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540]'
                            }`}
                        >
                            Send
                        </button>
                    </form>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
