import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/hooks/useTheme';
import { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import InviteFriendModal from '@/Components/InviteFriendModal';

export default function GameRoom({ game, gamePlayers, authUserId }) {
    const { id, uuid, creator_id, status, current_player_index, winner_id, board_state } = game;
    const [actionError, setActionError] = useState('');
    const [localBoardState, setLocalBoardState] = useState(board_state || {});
    const [theme, setTheme] = useTheme();
    const cardTheme = theme;
    const isDark = theme === 'dark';
    const [showRules, setShowRules] = useState(false);
    const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false);
    const [isRolling, setIsRolling] = useState(false);
    const [fakeRoll, setFakeRoll] = useState(1);
    const [cellPositions, setCellPositions] = useState({});
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showDisbandModal, setShowDisbandModal] = useState(false);
    const [showUnreadyWarning, setShowUnreadyWarning] = useState(false);

    const updateCellCenters = () => {
        const boardEl = document.getElementById('snakes-board');
        if (!boardEl) return;
        const boardRect = boardEl.getBoundingClientRect();
        const centers = {};
        for (let i = 1; i <= 100; i++) {
            const cellEl = document.getElementById(`cell-${i}`);
            if (cellEl) {
                const rect = cellEl.getBoundingClientRect();
                centers[i] = {
                    x: rect.left - boardRect.left + rect.width / 2,
                    y: rect.top - boardRect.top + rect.height / 2,
                };
            }
        }
        setCellPositions(centers);
    };

    useEffect(() => {
        const timer = setTimeout(updateCellCenters, 200);
        window.addEventListener('resize', updateCellCenters);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateCellCenters);
        };
    }, [localBoardState, cardTheme, status]);

    const getWavyPath = (x1, y1, x2, y2) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy);
        if (len === 0) return '';
        
        const waves = len > 200 ? 3 : 2;
        const points = [];
        const steps = 30;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const px = x1 + dx * t;
            const py = y1 + dy * t;
            const nx = -dy / len;
            const ny = dx / len;
            const amp = Math.sin(t * Math.PI) * 16 * Math.sin(t * Math.PI * waves * 2);
            points.push(`${px + nx * amp},${py + ny * amp}`);
        }
        return `M ${points.join(' L ')}`;
    };

    const renderLadderSVG = (x1, y1, x2, y2, key) => {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy);
        if (len === 0) return null;
        
        const nx = -dy / len;
        const ny = dx / len;
        
        const offset = 5;
        const lx1 = x1 + nx * offset;
        const ly1 = y1 + ny * offset;
        const lx2 = x2 + nx * offset;
        const ly2 = y2 + ny * offset;

        const rx1 = x1 - nx * offset;
        const ry1 = y1 - ny * offset;
        const rx2 = x2 - nx * offset;
        const ry2 = y2 - ny * offset;

        const strokeColor = isDark ? '#A6B9FF' : '#2E438F';
        const rungColor = isDark ? '#FFFFFF' : '#091540';

        const rungs = [];
        const steps = Math.max(3, Math.floor(len / 18));
        for (let i = 1; i < steps; i++) {
            const t = i / steps;
            const px1 = lx1 + (lx2 - lx1) * t;
            const py1 = ly1 + (ly2 - ly1) * t;
            const px2 = rx1 + (rx2 - rx1) * t;
            const py2 = ry1 + (ry2 - ry1) * t;
            rungs.push(
                <line 
                    key={i} 
                    x1={px1} y1={py1} x2={px2} y2={py2} 
                    stroke={rungColor} 
                    strokeWidth="2.5" 
                    opacity="0.9"
                />
            );
        }

        return (
            <g key={key}>
                <line x1={lx1} y1={ly1} x2={lx2} y2={ly2} stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" opacity="0.95" />
                <line x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" opacity="0.95" />
                {rungs}
            </g>
        );
    };

    const renderSnakeSVG = (x1, y1, x2, y2, key) => {
        const path = getWavyPath(x1, y1, x2, y2);
        if (!path) return null;

        return (
            <g key={key}>
                <path 
                    d={path} 
                    fill="none" 
                    stroke="#091540" 
                    strokeWidth="7" 
                    strokeLinecap="round" 
                    opacity="0.3"
                    transform="translate(2, 3)"
                />
                <path 
                    d={path} 
                    fill="none" 
                    stroke="#e11d48" 
                    strokeWidth="5" 
                    strokeLinecap="round" 
                    opacity="0.95"
                />
                <path 
                    d={path} 
                    fill="none" 
                    stroke="#fecdd3" 
                    strokeWidth="2.5" 
                    strokeDasharray="4,6" 
                    strokeLinecap="round" 
                    opacity="0.95"
                />
                <circle 
                    cx={x1} 
                    cy={y1} 
                    r="7" 
                    fill="#e11d48" 
                    stroke="#be123c" 
                    strokeWidth="1.5"
                />
                <circle cx={x1 - 2} cy={y1 - 1} r="1.2" fill="white" />
                <circle cx={x1 + 2} cy={y1 - 1} r="1.2" fill="white" />
                <circle cx={x1 - 2} cy={y1 - 1} r="0.6" fill="#091540" />
                <circle cx={x1 + 2} cy={y1 - 1} r="0.6" fill="#091540" />
            </g>
        );
    };

    // Polling setup: if it's not our turn, poll the state every 2.5 seconds to detect opponent moves
    const activePlayer = gamePlayers.find(p => p.player_index === current_player_index);
    const isMyTurn = activePlayer && activePlayer.user_id === authUserId && status === 'playing';

    useEffect(() => {
        setLocalBoardState(board_state || {});
        if (board_state?.last_roll) {
            setFakeRoll(board_state.last_roll);
        }
    }, [board_state]);

    useEffect(() => {
        let interval = null;
        const shouldPoll = status === 'waiting' || (status === 'playing' && !isMyTurn);

        if (shouldPoll) {
            interval = setInterval(() => {
                fetch(route('games.state', uuid))
                    .then(res => res.json())
                    .then(data => {
                        if (data) {
                            if (data.board_state) {
                                setLocalBoardState(data.board_state);
                                if (data.board_state.last_roll) {
                                    setFakeRoll(data.board_state.last_roll);
                                }
                            }
                            
                            const currentPlayersCount = gamePlayers.length;
                            const dataPlayersCount = data.game_players ? data.game_players.length : currentPlayersCount;
                            
                            // Check if readiness changed
                            const readyChanged = data.game_players && JSON.stringify(data.game_players.map(p => p.is_ready)) !== JSON.stringify(gamePlayers.map(p => p.is_ready));

                            if (data.status !== status || 
                                data.current_player_index !== current_player_index || 
                                (status === 'waiting' && dataPlayersCount !== currentPlayersCount) ||
                                (status === 'waiting' && readyChanged)) {
                                router.reload({ only: ['game', 'gamePlayers'] });
                            }
                        }
                    })
                    .catch(err => console.error("Error polling game state:", err));
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status, isMyTurn, current_player_index, uuid, gamePlayers.length]);

    const handleStartGame = () => {
        const unreadyPlayers = gamePlayers.filter(p => !p.is_creator && !p.is_ready);
        if (unreadyPlayers.length > 0) {
            setShowUnreadyWarning(true);
            return;
        }
        router.post(route('games.start', uuid), {}, {
            onError: (errors) => setActionError(errors.error || 'Failed to start game'),
        });
    };

    const handleSurrender = () => {
        setShowSurrenderConfirm(false);
        router.post(route('games.surrender', uuid), {}, {
            onError: (errors) => setActionError(errors.error || 'Failed to surrender'),
        });
    };

    const handleRollDie = () => {
        if (!isMyTurn || isRolling) {
            setActionError("It's not yer turn to roll, matey!");
            return;
        }
        setActionError('');
        setIsRolling(true);

        // Pick the exact roll value right now so animation and backend are 100% identical
        const targetRoll = Math.floor(Math.random() * 6) + 1;

        // Start cycling numbers to simulate roll animation
        let rollsCount = 0;
        const rollInterval = setInterval(() => {
            rollsCount++;
            if (rollsCount >= 10) {
                clearInterval(rollInterval);
                setFakeRoll(targetRoll);
                // Trigger actual backend roll with this exact roll value
                router.post(route('games.roll-die', uuid), { roll: targetRoll }, {
                    onFinish: () => {
                        setIsRolling(false);
                    },
                    onError: (errors) => {
                        setActionError(errors.error || errors.action_error || 'Failed to roll die');
                        setIsRolling(false);
                    }
                });
            } else {
                setFakeRoll(Math.floor(Math.random() * 6) + 1);
            }
        }, 70);
    };

    const renderDice = (value) => {
        const dotsMap = {
            1: [4],
            2: [0, 8],
            3: [0, 4, 8],
            4: [0, 2, 6, 8],
            5: [0, 2, 4, 6, 8],
            6: [0, 2, 3, 5, 6, 8],
        };

        const dots = dotsMap[value] || [4];

        return (
            <div className={`w-16 h-16 rounded-xl border-2 p-2.5 grid grid-cols-3 gap-1 shadow-md transition-all mx-auto ${
                isRolling ? 'animate-bounce rotate-12 scale-105 duration-100' : ''
            } ${isDark ? 'bg-[#091540] border-white/30 text-white shadow-lg' : 'bg-white border-[#2E438F] text-[#091540] shadow-md'}`}>
                {Array.from({ length: 9 }).map((_, idx) => {
                    const hasDot = dots.includes(idx);
                    return (
                        <div key={idx} className="flex items-center justify-center w-full h-full">
                            {hasDot && (
                                <div className={`w-2.5 h-2.5 rounded-full ${
                                    isDark ? 'bg-[#A6B9FF]' : 'bg-[#2E438F]'
                                }`} />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Snakes & Ladders Board Config
    const ladders = {
        2: 38, 7: 14, 8: 31, 15: 26, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 78: 98, 87: 94
    };
    const snakes = {
        16: 6, 46: 25, 49: 11, 62: 19, 64: 60, 74: 53, 89: 68, 92: 88, 95: 75, 99: 80
    };

    // Generate board grid rows (100 down to 1)
    const renderBoardCells = () => {
        const rows = [];
        for (let r = 9; r >= 0; r--) {
            const rowCells = [];
            for (let c = 0; c < 10; c++) {
                // Determine cell number in boustrophedon (snake-like) pattern
                let cellNum;
                if (r % 2 === 0) {
                    cellNum = r * 10 + c + 1;
                } else {
                    cellNum = r * 10 + (10 - c);
                }
                
                // Find players standing on this cell
                const standingPlayers = Object.values(localBoardState.players || {}).filter(
                    p => p.position === cellNum
                );

                const isLadder = ladders[cellNum];
                const isSnake = snakes[cellNum];

                // Design styles strictly matching the 4-color palette
                let cellBg = isDark
                    ? 'bg-[#2E438F]/25 border-white/15 text-white'
                    : 'bg-[#A6B9FF]/15 border-[#2E438F]/30 text-[#091540]';

                if (isLadder) {
                    cellBg = isDark
                        ? 'bg-[#2E438F] border-2 border-[#A6B9FF] text-white font-black shadow-md'
                        : 'bg-[#2E438F] border-2 border-[#091540] text-white font-black shadow-md';
                } else if (isSnake) {
                    cellBg = isDark
                        ? 'bg-rose-950/60 border-2 border-rose-500 text-rose-200 font-black shadow-md'
                        : 'bg-rose-100 border-2 border-rose-500 text-rose-900 font-black shadow-md';
                } else if (cellNum === 100) {
                    cellBg = isDark
                        ? 'bg-[#2E438F] border-2 border-white text-white font-black shadow-lg ring-2 ring-white/40'
                        : 'bg-[#A6B9FF]/40 border-2 border-[#2E438F] text-[#091540] font-black shadow-lg ring-2 ring-[#2E438F]/40';
                }

                rowCells.push(
                    <div 
                        key={cellNum} 
                        id={`cell-${cellNum}`}
                        className={`border h-16 p-1 relative flex flex-col justify-between rounded-xl transition-all shadow-xs ${cellBg}`}
                    >
                        {/* Cell Number & Indicator */}
                        <div className="flex justify-between items-center w-full">
                            <span className={`text-[10px] font-mono font-black ${isLadder ? 'text-white' : (isSnake ? (isDark ? 'text-rose-200' : 'text-rose-900') : (isDark ? 'text-white/80' : 'text-[#091540]/80'))}`}>
                                {cellNum}
                            </span>
                            {cellNum === 100 && <span className="text-xs animate-bounce" title="Safe Harbor (Finish)">🏆</span>}
                        </div>

                        {/* Connection visual indicator */}
                        {isLadder && (
                            <div className="absolute top-1 right-1 text-[9px] font-black text-[#A6B9FF] flex items-center gap-0.5" title={`Rigging Rope to ${ladders[cellNum]}`}>
                                <span>⚓➔{ladders[cellNum]}</span>
                            </div>
                        )}
                        {isSnake && (
                            <div className={`absolute top-1 right-1 text-[9px] font-black flex items-center gap-0.5 ${isDark ? 'text-rose-300' : 'text-rose-700'}`} title={`Sea Serpent to ${snakes[cellNum]}`}>
                                <span>🐉➔{snakes[cellNum]}</span>
                            </div>
                        )}

                        {/* Player Avatars */}
                        <div className="flex flex-wrap gap-1 items-center justify-center grow">
                            {standingPlayers.map(p => {
                                const dotColor = p.color === 'Red' ? '🔴' : p.color === 'Blue' ? '🔵' : p.color === 'Green' ? '🟢' : '🟡';
                                return (
                                    <span 
                                        key={p.user_id} 
                                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 border shadow-sm ${
                                            isDark
                                                ? 'bg-[#091540] border-white/30 text-white'
                                                : 'bg-white border-[#2E438F] text-[#091540]'
                                        }`}
                                        title={p.name}
                                    >
                                        {dotColor} <span className="max-w-[40px] truncate">{p.name.split(' ')[0]}</span>
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                );
            }
            rows.push(
                <div key={r} className="grid grid-cols-10 gap-1.5 w-full">
                    {rowCells}
                </div>
            );
        }
        return rows;
    };

    const wrapperBg = cardTheme === 'dark' 
        ? 'bg-[#091540] text-white min-h-screen pb-12 transition-colors' 
        : 'bg-white text-[#091540] min-h-screen pb-12 transition-colors';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center w-full">
                    <h2 className={`text-xl font-black leading-tight font-mono tracking-wider flex items-center gap-2 ${cardTheme === 'dark' ? 'text-white' : 'text-[#2E438F]'}`}>
                        <span>🐉</span> SERPENTS & RIGGING
                    </h2>
                    <div className="flex gap-3 items-center">
                        <button
                            onClick={() => setShowRules(true)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow border-2 ${
                                cardTheme === 'dark'
                                    ? 'bg-[#091540] hover:bg-[#2E438F] text-white border-white/20'
                                    : 'bg-white hover:bg-[#A6B9FF]/20 text-[#2E438F] border-[#2E438F]'
                            }`}
                        >
                            <span>📜 Voyage Rules</span>
                        </button>
                        <span className={`text-xs px-3.5 py-1.5 rounded-full border-2 font-black ${
                            cardTheme === 'dark'
                                ? 'bg-[#091540] border-white/20 text-[#A6B9FF]'
                                : 'bg-[#A6B9FF]/20 border-[#2E438F] text-[#091540]'
                        }`}>
                            Room UUID: <span className="font-mono font-bold select-all">{uuid.substring(0, 8)}</span>
                        </span>
                        <Link
                            href={route('dashboard')}
                            className={`text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border-2 transition-all duration-150 flex items-center gap-1.5 shadow-sm ${
                                cardTheme === 'dark'
                                    ? 'bg-[#091540] hover:bg-white text-white hover:text-[#091540] border-white/30 hover:border-white'
                                    : 'bg-white hover:bg-[#2E438F] text-[#2E438F] hover:text-white border-[#2E438F]'
                            }`}
                        >
                            <span>⚓</span> Back to Tavern
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Serpents & Rigging" />

            <div className={wrapperBg}>
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
                    {actionError && (
                        <div className="mb-6 p-4 bg-red-950/40 border border-red-800/50 text-red-400 text-sm font-bold rounded-lg flex justify-between items-center">
                            <span>🚨 {actionError}</span>
                            <button onClick={() => setActionError('')} className="hover:text-red-300 font-black">✕</button>
                        </div>
                    )}

                    {status === 'waiting' && (
                        <div className="rounded-2xl border-2 border-[#091540] p-8 shadow-2xl text-center max-w-xl mx-auto transition-colors bg-[#2E438F] text-white">
                            <span className="text-5xl animate-bounce block mb-4 text-white">⚓</span>
                            <h3 className="text-2xl font-black font-mono tracking-wider text-white uppercase">Awaiting Crew Members</h3>
                            <p className="mt-2 text-sm text-white/90 mb-6">Gather your crew of 2 to 4 pirates before setting sail.</p>

                            <div className="mt-4 mb-8">
                                <button
                                    onClick={() => setShowInviteModal(true)}
                                    className="bg-[#091540] hover:bg-[#091540]/80 text-white font-black py-2.5 px-6 rounded-xl uppercase tracking-widest border border-white/30 shadow-lg transition hover:scale-105"
                                >
                                    Invite Crew
                                </button>
                            </div>

                            <h4 className="text-xs uppercase font-black tracking-widest mb-1 text-[#A6B9FF]">Joined Pirates</h4>
                            <p className="text-xs text-white/80 mb-6 font-bold">
                                Current crew in lobby: <span className="font-black text-white">{gamePlayers.length}</span> / {game.max_players ?? 4} players.
                            </p>
                            
                            <div className="flex flex-col gap-3 justify-center mb-6 max-w-sm mx-auto">
                                {gamePlayers.map((p, idx) => (
                                    <div key={p.user_id} className="p-3.5 rounded-xl flex flex-col gap-2 shadow-md bg-[#091540] border-2 border-[#A6B9FF]/40 text-white">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-xl">🏴‍☠️</span>
                                            <div className="text-left flex-grow">
                                                <div className="font-black text-sm text-white">{p.name}</div>
                                                <div className="text-[11px] font-mono text-[#A6B9FF] font-bold">{p.user_id === creator_id ? 'Captain' : 'Crew Member'}</div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center mt-2 border-t border-white/20 pt-2">
                                            <div className="text-[11px] font-black uppercase tracking-widest">
                                                {p.user_id === creator_id ? (
                                                    <span className="text-emerald-400">READY</span>
                                                ) : p.is_ready ? (
                                                    <span className="text-emerald-400">READY</span>
                                                ) : (
                                                    <span className="text-rose-400">NOT READY</span>
                                                )}
                                            </div>
                                            {authUserId === creator_id && p.user_id !== creator_id && (
                                                <button
                                                    onClick={() => {
                                                        router.post(route('games.kick', uuid), { user_id: p.user_id }, { preserveScroll: true, onError: (errors) => setActionError(errors.error || 'Failed to kick player') });
                                                    }}
                                                    className="text-[11px] bg-red-600 hover:bg-red-500 text-white font-black px-3 py-1 rounded-lg transition"
                                                >
                                                    KICK
                                                </button>
                                            )}
                                            {authUserId === p.user_id && p.user_id !== creator_id && (
                                                <button
                                                    onClick={() => {
                                                        router.post(route('games.ready', uuid), {}, { preserveScroll: true });
                                                    }}
                                                    className={`text-[11px] text-white font-black px-3 py-1 rounded-lg transition border border-white/30 ${
                                                        p.is_ready ? 'bg-[#2E438F] hover:bg-[#091540]' : 'bg-emerald-600 hover:bg-emerald-500'
                                                    }`}
                                                >
                                                    {p.is_ready ? 'UNREADY' : 'READY'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {authUserId === creator_id ? (
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleStartGame}
                                        disabled={gamePlayers.length < 2}
                                        className={`px-8 py-3.5 rounded-xl font-black uppercase tracking-wider text-sm transition shadow-xl ${
                                            gamePlayers.length >= 2
                                                ? 'bg-white hover:bg-[#A6B9FF] text-[#091540] border-2 border-white hover:scale-[1.02]'
                                                : 'bg-white/40 text-[#091540]/60 border-2 border-white/40 cursor-not-allowed'
                                        }`}
                                    >
                                        Set Sail & Start Game
                                    </button>
                                    <button
                                        onClick={() => setShowDisbandModal(true)}
                                        className="px-8 py-2.5 rounded-xl font-black uppercase tracking-wider text-xs transition shadow border border-red-400 bg-red-600 text-white hover:bg-red-500"
                                    >
                                        Disband Room
                                    </button>
                                </div>
                            ) : (
                                <p className="text-xs text-white/90 italic animate-pulse font-bold">
                                    Waiting for the Captain to set sail...
                                </p>
                            )}
                        </div>
                    )}

                    {status !== 'waiting' && (
                        <div className="grid gap-6 lg:grid-cols-4">
                            
                            {/* LEFT SIDE: Snakes Board */}
                            <div className="lg:col-span-3 flex flex-col gap-6">
                                <div className={`rounded-2xl border-2 p-5 shadow-xl transition-colors ${
                                    isDark ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                                }`}>
                                    <div id="snakes-board" className="relative flex flex-col gap-1.5 w-full">
                                        {/* SVG Overlay for dynamic drawing of snakes and ladders */}
                                        <svg className="absolute inset-0 pointer-events-none w-full h-full z-10 select-none">
                                            {/* Ladders lines */}
                                            {Object.entries(ladders).map(([start, end]) => {
                                                const p1 = cellPositions[start];
                                                const p2 = cellPositions[end];
                                                if (!p1 || !p2) return null;
                                                return renderLadderSVG(p1.x, p1.y, p2.x, p2.y, `ladder-${start}`);
                                            })}
                                            {/* Snakes lines */}
                                            {Object.entries(snakes).map(([start, end]) => {
                                                const p1 = cellPositions[start];
                                                const p2 = cellPositions[end];
                                                if (!p1 || !p2) return null;
                                                return renderSnakeSVG(p1.x, p1.y, p2.x, p2.y, `snake-${start}`);
                                            })}
                                        </svg>
                                        {renderBoardCells()}
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT SIDE: Controls & Journal */}
                            <div className="flex flex-col gap-6">
                                
                                {/* Status Banner & Roll Die Button */}
                                <div className={`rounded-2xl p-5 shadow-xl border-2 transition-colors ${
                                    isDark ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                                }`}>
                                    <h3 className={`text-xs font-black font-mono tracking-widest uppercase mb-3 flex items-center gap-2 ${
                                        isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'
                                    }`}>
                                        <span>⚔️</span> Action Cabin
                                    </h3>
                                    
                                    {status === 'playing' ? (
                                        <div className="space-y-4">
                                            <div className={`p-4 rounded-xl text-center border-2 transition ${
                                                isDark ? 'bg-[#2E438F]/30 border-white/20 text-white' : 'bg-[#A6B9FF]/20 border-[#2E438F] text-[#091540]'
                                            }`}>
                                                <p className={`text-[11px] uppercase tracking-widest font-mono font-bold ${isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>
                                                    Active Captain:
                                                </p>
                                                <p className={`text-lg font-black my-1.5 animate-pulse ${isDark ? 'text-white' : 'text-[#091540]'}`}>
                                                    🏴‍☠️ {activePlayer?.name}
                                                </p>
                                                <div className="text-xs mt-2">
                                                    {isMyTurn ? (
                                                        <span className={`px-3 py-1.5 font-black rounded-xl uppercase tracking-wider animate-pulse border-2 shadow ${
                                                            isDark ? 'bg-[#2E438F] text-white border-white' : 'bg-[#2E438F] text-white border-[#091540]'
                                                        }`}>
                                                            🎲 YOUR TURN TO ROLL!
                                                        </span>
                                                    ) : (
                                                        <span className={`px-3 py-1.5 rounded-xl font-bold border ${
                                                            isDark ? 'bg-[#091540] text-[#A6B9FF] border-white/20' : 'bg-white text-[#2E438F] border-[#2E438F]'
                                                        }`}>
                                                            Waiting for roll...
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Animated Dice Display */}
                                            <div className="py-2">
                                                {renderDice(fakeRoll)}
                                            </div>

                                            {isMyTurn && (
                                                <button
                                                    onClick={handleRollDie}
                                                    disabled={isRolling}
                                                    className={`w-full py-3.5 px-6 font-black rounded-xl uppercase tracking-wider text-sm transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 border-2 ${
                                                        isDark
                                                            ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-white/20'
                                                            : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540]'
                                                    }`}
                                                >
                                                    {isRolling ? 'Rolling...' : '🎲 Roll the Die'}
                                                </button>
                                            )}

                                            <div className={`pt-3 border-t ${
                                                isDark ? 'border-white/20' : 'border-[#2E438F]/20'
                                            }`}>
                                                <button
                                                    onClick={() => setShowSurrenderConfirm(true)}
                                                    className="w-full text-[10px] bg-rose-700 hover:bg-rose-600 text-white font-black py-2 px-3 rounded-xl uppercase tracking-widest transition shadow-sm border border-rose-800"
                                                >
                                                    🏳️ Forfeit Game
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-emerald-950/40 border-2 border-emerald-500 text-white rounded-xl text-center">
                                            <span className="text-3xl block mb-1">🏆</span>
                                            <h4 className="font-black uppercase tracking-wider text-xs text-emerald-400">Voyage Completed</h4>
                                            <p className="text-xs mt-1 font-bold">
                                                Winner: <span className="font-black text-white">{gamePlayers.find(p => p.user_id === winner_id)?.name || 'Unknown'}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Leaderboard positions */}
                                <div className={`rounded-2xl p-5 shadow-xl border-2 transition-colors ${
                                    isDark ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                                }`}>
                                    <h3 className={`text-xs font-black font-mono tracking-widest uppercase mb-3 flex items-center gap-2 ${
                                        isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'
                                    }`}>
                                        <span>📍</span> Captain Positions
                                    </h3>
                                    <div className="space-y-2">
                                        {Object.values(localBoardState.players || {}).map(p => (
                                            <div 
                                                key={p.user_id} 
                                                className={`flex justify-between items-center p-3 rounded-xl border-2 transition shadow-sm ${
                                                    isDark ? 'bg-[#2E438F]/20 border-white/20 text-white' : 'bg-[#A6B9FF]/15 border-[#2E438F]/30 text-[#091540]'
                                                }`}
                                            >
                                                <span className="text-xs font-black flex items-center gap-1.5">
                                                    <span>{p.color === 'Red' ? '🔴' : p.color === 'Blue' ? '🔵' : p.color === 'Green' ? '🟢' : '🟡'}</span>
                                                    {p.name}
                                                </span>
                                                <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-lg border ${
                                                    isDark ? 'bg-[#2E438F] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                                                }`}>
                                                    Cell {p.position}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Play Logs (History log) */}
                                <div className={`border-2 p-5 rounded-2xl shadow-xl flex flex-col h-48 md:h-auto transition-colors ${
                                    isDark ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                                }`}>
                                    <h4 className={`text-xs font-black font-mono uppercase tracking-wider mb-2 flex items-center gap-2 ${
                                        isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'
                                    }`}>
                                        <span>📜</span> Voyage Journal (Log)
                                    </h4>
                                    <div className={`overflow-y-auto p-2.5 rounded-xl text-xs font-mono grow flex flex-col gap-1.5 max-h-56 border-2 ${
                                        isDark ? 'bg-[#2E438F]/20 border-white/20 text-white' : 'bg-[#A6B9FF]/10 border-[#2E438F] text-[#091540]'
                                    }`}>
                                        {(localBoardState.log || []).slice(-15).reverse().map((entry, idx) => (
                                            <p
                                                key={idx}
                                                className={`pb-1 border-b last:border-b-0 font-bold ${
                                                    isDark ? 'border-white/10 text-white/90' : 'border-[#2E438F]/10 text-[#091540]'
                                                }`}
                                            >
                                                {entry}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SURRENDER CONFIRMATION MODAL */}
                    {showSurrenderConfirm && (
                        <div className="fixed inset-0 bg-[#091540]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className={`w-full max-w-md p-6 rounded-2xl border-2 shadow-2xl transition-all ${
                                cardTheme === 'dark'
                                    ? 'bg-[#091540] border-white/30 text-white'
                                    : 'bg-white border-[#2E438F] text-[#091540]'
                            }`}>
                                <div className="flex items-center gap-3 text-red-500 mb-4">
                                    <span className="text-3xl">🏳️</span>
                                    <h3 className="text-lg font-black font-mono uppercase tracking-wider">Raise the White Flag?</h3>
                                </div>
                                <p className={`text-sm mb-6 ${cardTheme === 'dark' ? 'text-white/80' : 'text-[#091540]/80'}`}>
                                    Are ye sure ye want to surrender and flee this voyage? The remaining player with the highest cell position will claim immediate victory!
                                </p>
                                <div className="flex justify-end gap-3 font-semibold text-xs">
                                    <button
                                        onClick={() => setShowSurrenderConfirm(false)}
                                        className={`px-4 py-2.5 rounded-xl uppercase tracking-wider transition font-black border-2 ${
                                            cardTheme === 'dark'
                                                ? 'bg-[#2E438F] hover:bg-[#091540] text-white border-white/20'
                                                : 'bg-white hover:bg-[#A6B9FF]/20 text-[#091540] border-[#2E438F]'
                                        }`}
                                    >
                                        Stay & Fight
                                    </button>
                                    <button
                                        onClick={handleSurrender}
                                        className="px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl uppercase tracking-wider transition"
                                    >
                                        Surrender
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VOYAGE RULES MODAL */}
                    {showRules && (
                        <div className="fixed inset-0 bg-[#091540]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className={`w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 rounded-2xl border-2 shadow-2xl transition-all ${
                                cardTheme === 'dark'
                                    ? 'bg-[#091540] border-white/30 text-white'
                                    : 'bg-white border-[#2E438F] text-[#091540]'
                            }`}>
                                <div className={`flex justify-between items-center mb-6 pb-3 border-b ${cardTheme === 'dark' ? 'border-white/20' : 'border-[#2E438F]/30'}`}>
                                    <h3 className={`text-lg font-black font-mono uppercase tracking-wider flex items-center gap-2 ${cardTheme === 'dark' ? 'text-white' : 'text-[#091540]'}`}>
                                        <span>📜</span> Serpents & Rigging Rules (Aturan Ular Tangga)
                                    </h3>
                                    <button
                                        onClick={() => setShowRules(false)}
                                        className="font-bold text-lg p-1 hover:text-red-500"
                                    >
                                        ✕
                                    </button>
                                </div>
                                
                                <div className="space-y-5 text-sm leading-relaxed">
                                    <section>
                                        <h4 className={`font-black mb-1 ${cardTheme === 'dark' ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>1. Tujuan Permainan (Goal)</h4>
                                        <p className={cardTheme === 'dark' ? 'text-white/80' : 'text-[#091540]/80'}>
                                            Mencapai <strong>Sel 100</strong> terlebih dahulu untuk melabuhkan kapal bajak laut Anda dengan selamat di pelabuhan Tortuga!
                                        </p>
                                    </section>

                                    <section>
                                        <h4 className={`font-black mb-1 ${cardTheme === 'dark' ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>2. Giliran Pemain (Player Turn Actions)</h4>
                                        <p className={cardTheme === 'dark' ? 'text-white/80' : 'text-[#091540]/80'}>
                                            Di giliran Anda, klik tombol <strong>Roll the Die</strong> untuk melemparkan dadu bersisi 6. Kapal Anda akan maju sesuai dengan jumlah angka yang keluar.
                                        </p>
                                    </section>

                                    <section>
                                        <h4 className={`font-black mb-1 ${cardTheme === 'dark' ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>3. Rigging Ropes & Anchors (Ladders / Tangga)</h4>
                                        <p className={cardTheme === 'dark' ? 'text-white/80' : 'text-[#091540]/80'}>
                                            Jika Anda mendarat tepat di sel dengan tanda <strong>Tangga (Anchor/Rigging) ⚓</strong>, Anda akan langsung memanjat tali layar ke sel tujuan yang lebih tinggi!
                                        </p>
                                    </section>

                                    <section>
                                        <h4 className={`font-black mb-1 ${cardTheme === 'dark' ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>4. Sea Serpents (Snakes / Ular)</h4>
                                        <p className={cardTheme === 'dark' ? 'text-white/80' : 'text-[#091540]/80'}>
                                            Hati-hati dengan <strong>Ular Laut (Sea Serpents) 🐉</strong>! Jika mendarat di kepalanya, kapal Anda akan ditarik turun kembali ke sel yang lebih rendah.
                                        </p>
                                    </section>

                                    <section>
                                        <h4 className={`font-black mb-1 ${cardTheme === 'dark' ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>5. Aturan Tepat Sel 100</h4>
                                        <p className={cardTheme === 'dark' ? 'text-white/80' : 'text-[#091540]/80'}>
                                            Anda harus mendarat <strong>tepat</strong> di sel 100 untuk menang. Jika hasil lemparan dadu melebihi sel 100, sisa langkah akan memantul mundur (misalnya: jika Anda di 98 dan melempar angka 4, Anda akan maju ke 100 lalu mundur ke 98).
                                        </p>
                                    </section>
                                </div>

                                <div className={`mt-8 pt-4 border-t flex justify-end ${cardTheme === 'dark' ? 'border-white/20' : 'border-[#2E438F]/30'}`}>
                                    <button
                                        onClick={() => setShowRules(false)}
                                        className={`px-6 py-2.5 rounded-xl uppercase tracking-wider text-xs font-black transition shadow-md border-2 ${
                                            cardTheme === 'dark'
                                                ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-[#A6B9FF]/40'
                                                : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540]'
                                        }`}
                                    >
                                        Mengerti
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <InviteFriendModal
                show={showInviteModal}
                onClose={() => setShowInviteModal(false)}
                gameUuid={uuid}
                cardTheme={cardTheme}
            />

            {/* Disband Confirmation Modal */}
            <Modal show={showDisbandModal} onClose={() => setShowDisbandModal(false)} maxWidth="sm">
                <div className={`p-6 border-2 rounded-2xl ${cardTheme === 'dark' ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'}`}>
                    <h2 className="text-xl font-black font-mono uppercase tracking-widest text-center mb-3 flex justify-center items-center gap-2 text-red-500">
                        <span>☠️</span> SCUTTLE SHIP?
                    </h2>
                    <p className="text-center font-medium mb-6 text-sm">
                        Are ye absolutely sure ye want to disband this voyage? All crew members will be returned to the tavern.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={() => setShowDisbandModal(false)}
                            className={`px-5 py-2.5 rounded-xl font-black uppercase text-xs tracking-wider border-2 transition ${
                                cardTheme === 'dark' ? 'bg-[#2E438F] hover:bg-[#091540] text-white border-white/20' : 'bg-white hover:bg-[#A6B9FF]/20 text-[#091540] border-[#2E438F]'
                            }`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                router.delete(route('games.destroy', game.uuid));
                                setShowDisbandModal(false);
                            }}
                            className="px-5 py-2.5 rounded-xl font-black bg-red-600 hover:bg-red-500 text-white shadow uppercase text-xs tracking-wider transition"
                        >
                            Disband!
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Unready Crew Warning Modal */}
            <Modal show={showUnreadyWarning} onClose={() => setShowUnreadyWarning(false)} maxWidth="sm">
                <div className={`p-6 border-2 rounded-2xl text-center ${cardTheme === 'dark' ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'}`}>
                    <div className="text-4xl mb-3">🏴‍☠️</div>
                    <h2 className={`text-lg font-black font-mono uppercase tracking-widest mb-3 ${cardTheme === 'dark' ? 'text-white' : 'text-[#091540]'}`}>
                        CREW BELUM SIAP!
                    </h2>
                    <p className={`text-sm mb-6 ${cardTheme === 'dark' ? 'text-white/80' : 'text-[#091540]/80'}`}>
                        Ada crew yang belum menekan tombol READY. Semua anggota crew wajib bersiap sebelum kapal bisa berlayar!
                    </p>
                    <button
                        onClick={() => setShowUnreadyWarning(false)}
                        className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-md transition border-2 ${
                            cardTheme === 'dark'
                                ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-[#A6B9FF]/40'
                                : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540]'
                        }`}
                    >
                        Paham (Understood)
                    </button>
                </div>
            </Modal>
        </AuthenticatedLayout>

    );
}
