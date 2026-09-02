import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import InviteFriendModal from '@/Components/InviteFriendModal';
import { useTheme } from '@/hooks/useTheme';

export default function GameRoom({ game, gamePlayers, authUserId }) {
    const { id, uuid, creator_id, status, current_player_index, winner_id, board_state } = game;
    const [selectedTokens, setSelectedTokens] = useState([]);
    const [actionError, setActionError] = useState('');
    const [localBoardState, setLocalBoardState] = useState(board_state || {});
    const [theme] = useTheme();
    const cardTheme = theme;
    const isDark = theme === 'dark';
    const [showRules, setShowRules] = useState(false);
    const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);

    // Polling setup: if it's not our turn, poll the state every 2.5 seconds to detect opponent moves
    const activePlayer = gamePlayers.find(p => p.player_index === current_player_index);
    const isMyTurn = activePlayer && activePlayer.user_id === authUserId && status === 'playing';

    useEffect(() => {
        setLocalBoardState(board_state || {});
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
                            }
                            
                            // Detect if status changed or if a player joined/left in the waiting stage
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
            }, 2000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status, isMyTurn, current_player_index, uuid, gamePlayers.length]);

    const handleStartGame = () => {
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

    // Reset token selection
    const clearSelection = () => {
        setSelectedTokens([]);
        setActionError('');
    };

    // Token Selection Logic (Allows plundering 2 of same or 3 different)
    const handleTokenClick = (color) => {
        if (!isMyTurn) {
            setActionError("It's not yer turn to plunder, matey!");
            return;
        }
        if (color === 'gold') {
            setActionError("Ye cannot plunder Gold Doubloons directly! Reserve a chart to claim one.");
            return;
        }
        if ((localBoardState.tokens?.[color] ?? 0) <= 0) {
            setActionError(`There are no ${color} treasures left on the board.`);
            return;
        }

        setActionError('');
        const currentCount = selectedTokens.filter(c => c === color).length;

        if (currentCount === 2) {
            // Already has 2 of this color, clicking again deselects all of this color
            setSelectedTokens(selectedTokens.filter(c => c !== color));
        } else if (currentCount === 1) {
            // Clicking a color that already has 1 selected
            // We can only select a 2nd of the same color if:
            // 1. It is the ONLY color selected.
            // 2. The board has >= 4 tokens.
            const uniqueColors = [...new Set(selectedTokens)];
            if (uniqueColors.length > 1) {
                // Different colors are selected, treat as deselect for this color
                setSelectedTokens(selectedTokens.filter(c => c !== color));
            } else {
                const boardCount = localBoardState.tokens?.[color] ?? 0;
                if (boardCount < 4) {
                    setActionError(`Ye can only take 2 of the same color if there are 4 or more left (Currently: ${boardCount}).`);
                    return;
                }
                
                // Capacity check (max 10 total)
                const myState = localBoardState.players?.[authUserId];
                const myCurrentTokensCount = myState ? Object.values(myState.tokens).reduce((a, b) => a + b, 0) : 0;
                if (myCurrentTokensCount + selectedTokens.length + 1 > 10) {
                    setActionError("A pirate cannot carry more than 10 treasures! Return/spend tokens first.");
                    return;
                }

                setSelectedTokens([...selectedTokens, color]);
            }
        } else {
            // 0 of this color is selected. We want to add it.
            if (selectedTokens.length >= 3) {
                setActionError("Ye can only plunder up to 3 treasures per turn.");
                return;
            }

            const uniqueColors = [...new Set(selectedTokens)];
            // If we already have 2 of another color selected, we cannot select a different color
            if (selectedTokens.length === 2 && uniqueColors.length === 1) {
                setActionError("Ye cannot select different colors if ye chose duplicate treasures.");
                return;
            }

            // Capacity check (max 10 total)
            const myState = localBoardState.players?.[authUserId];
            const myCurrentTokensCount = myState ? Object.values(myState.tokens).reduce((a, b) => a + b, 0) : 0;
            if (myCurrentTokensCount + selectedTokens.length + 1 > 10) {
                setActionError("A pirate cannot carry more than 10 treasures! Return/spend tokens first.");
                return;
            }

            setSelectedTokens([...selectedTokens, color]);
        }
    };

    // Take Selected Tokens Action
    const submitTakeTokens = () => {
        if (selectedTokens.length === 0) return;
        router.post(route('games.take-tokens', uuid), {
            tokens: selectedTokens,
        }, {
            onSuccess: () => clearSelection(),
            onError: (errors) => setActionError(errors.action_error || 'Invalid plunder action'),
        });
    };

    // Buy Card Action
    const handleBuyCard = (cardId, tier, fromReserved = false) => {
        if (!isMyTurn) return;
        router.post(route('games.buy-card', uuid), {
            card_id: cardId,
            tier: tier,
            from_reserved: fromReserved,
        }, {
            onError: (errors) => setActionError(errors.action_error || 'Failed to buy asset'),
        });
    };

    // Reserve Card Action
    const handleReserveCard = (cardId, tier) => {
        if (!isMyTurn) return;
        router.post(route('games.reserve-card', uuid), {
            card_id: cardId,
            tier: tier,
        }, {
            onError: (errors) => setActionError(errors.action_error || 'Failed to reserve chart'),
        });
    };

    // Helper to evaluate if player can afford a card
    const canAffordCard = (card) => {
        const myState = localBoardState.players?.[authUserId];
        if (!myState) return false;

        let goldNeeded = 0;
        for (const [color, costAmount] of Object.entries(card.cost)) {
            const bonus = myState.bonuses[color] ?? 0;
            const discountedCost = Math.max(0, costAmount - bonus);
            const tokens = myState.tokens[color] ?? 0;
            if (tokens < discountedCost) {
                goldNeeded += (discountedCost - tokens);
            }
        }
        return (myState.tokens.gold ?? 0) >= goldNeeded;
    };

    // Color definitions for badges & icons
    const gemColors = {
        pearl: {
            bg: 'bg-white',
            text: 'text-[#091540]',
            border: isDark ? 'border-white/40' : 'border-[#2E438F]',
            label: 'Pearl (White)',
            emoji: '⚪',
        },
        sapphire: { bg: 'bg-[#2E438F]', text: 'text-white', border: 'border-white/30', label: 'Sapphire (Blue)', emoji: '🔵' },
        emerald: { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-700', label: 'Emerald (Green)', emoji: '🟢' },
        ruby: { bg: 'bg-rose-600', text: 'text-white', border: 'border-rose-700', label: 'Ruby (Red)', emoji: '🔴' },
        obsidian: {
            bg: 'bg-[#091540]',
            text: 'text-white',
            border: isDark ? 'border-white/40 ring-1 ring-white/20' : 'border-[#2E438F]',
            label: 'Obsidian (Black)',
            emoji: '⚫',
        },
        gold: { bg: 'bg-amber-400', text: 'text-[#091540]', border: 'border-amber-500', label: 'Gold Doubloon', emoji: '🪙' },
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center w-full">
                    <h2 className={`text-xl font-black leading-tight font-mono tracking-wider flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#2E438F]'}`}>
                        <span>⚔️</span> CORSAIR'S COVE
                    </h2>
                    <div className="flex gap-3 items-center">
                        <button
                            onClick={() => setShowRules(true)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-colors duration-150 flex items-center gap-1.5 shadow-sm border-2 ${
                                isDark
                                    ? 'bg-[#091540] hover:bg-[#2E438F] text-white border-white/20 hover:border-white/40'
                                    : 'bg-white hover:bg-[#A6B9FF]/20 text-[#2E438F] border-[#2E438F]'
                            }`}
                        >
                            <span>📜 Voyage Rules</span>
                        </button>
                        <span className={`text-xs px-3.5 py-1.5 rounded-full border-2 font-black ${
                            isDark
                                ? 'bg-[#091540] border-white/20 text-[#A6B9FF]'
                                : 'bg-[#A6B9FF]/20 border-[#2E438F] text-[#091540]'
                        }`}>
                            Room UUID: <span className="font-mono font-bold select-all">{uuid.substring(0, 8)}</span>
                        </span>
                        <Link
                            href={route('dashboard')}
                            className={`text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border-2 transition-all duration-150 flex items-center gap-1.5 shadow-sm ${
                                isDark
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
            <Head title="Voyage Room" />

            <div className={`py-6 min-h-screen transition-colors duration-200 ${
                cardTheme === 'dark' ? 'bg-[#091540] text-white' : 'bg-white text-[#091540]'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* General Errors Banner */}
                    {actionError && (
                        <div className={`mb-4 border-2 px-4 py-3 rounded-lg flex justify-between items-center text-sm font-semibold ${
                            cardTheme === 'dark'
                                ? 'bg-red-950/60 border-red-800 text-red-300'
                                : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                            <span>☠️ Alert: {actionError}</span>
                            <button onClick={() => setActionError('')} className="text-red-400 hover:text-red-650 font-black">X</button>
                        </div>
                    )}

                    {/* ----------------- LOBBY STAGE (WAITING) ----------------- */}
                    {status === 'waiting' && (
                        <div className="rounded-2xl border-2 border-[#091540] p-8 shadow-2xl text-center max-w-xl mx-auto my-12 transition-colors bg-[#2E438F] text-white">
                            <span className="text-5xl animate-bounce block mb-4 text-white">⚓</span>
                            <h2 className="text-2xl font-black text-white tracking-wider font-mono uppercase">
                                AWAITING CREW MEMBERS
                            </h2>
                            <p className="mt-2 text-sm text-white/90 mb-6">
                                Gather your crew of 2 to 4 pirates before setting sail.
                            </p>

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
                                {gamePlayers.map((p, i) => (
                                    <div key={i} className="p-3.5 rounded-xl flex flex-col gap-2 shadow-md bg-[#091540] border-2 border-[#A6B9FF]/40 text-white">
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
                                                        router.post(route('games.kick', uuid), { user_id: p.user_id }, {
                                                            preserveScroll: true,
                                                            onError: (errors) => setActionError(errors.error || 'Failed to kick player'),
                                                        });
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
                                {/* Empty Seat placeholders */}
                                {Array.from({ length: (game.max_players ?? 4) - gamePlayers.length }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="border-2 border-dashed border-white/30 py-3.5 px-4 rounded-xl flex items-center justify-center text-xs font-bold text-white/60 bg-[#091540]/50"
                                    >
                                        Waiting for matey...
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/20 flex justify-center gap-4">
                                {authUserId === creator_id ? (
                                    <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
                                        <button
                                            onClick={handleStartGame}
                                            disabled={gamePlayers.length < 2}
                                            className={`px-8 py-3.5 rounded-xl font-black uppercase tracking-wider text-sm transition shadow-xl ${
                                                gamePlayers.length >= 2
                                                    ? 'bg-white hover:bg-[#A6B9FF] text-[#091540] border-2 border-white hover:scale-[1.02]'
                                                    : 'bg-white/40 text-[#091540]/60 border-2 border-white/40 cursor-not-allowed'
                                            }`}
                                        >
                                            ⛵ Set Sail
                                        </button>
                                        <button
                                            onClick={() => {
                                                if(confirm('Are ye sure ye want to disband this voyage?')) {
                                                    router.delete(route('games.destroy', uuid));
                                                }
                                            }}
                                            className="px-8 py-2.5 rounded-xl font-black uppercase tracking-wider text-xs transition shadow border border-red-400 bg-red-600 text-white hover:bg-red-500"
                                        >
                                            Disband Room
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-xs text-white/90 italic animate-pulse font-bold">
                                        Waiting for the Captain to start the voyage...
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ----------------- ACTIVE GAME STAGE ----------------- */}
                    {(status === 'playing' || status === 'finished') && (
                        <div className="grid gap-6 lg:grid-cols-4">
                            
                            {/* LEFT SIDE: Noble cards & Board Card Rows (Tiers 3, 2, 1) */}
                            <div className="lg:col-span-3 flex flex-col gap-6">
                                
                                {/* Pirate Lords (Nobles) Row */}
                                <div className={`rounded-2xl p-5 shadow-lg border-2 transition-colors ${
                                    isDark ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                                }`}>
                                    <h3 className={`text-xs font-black font-mono tracking-widest uppercase mb-3 flex items-center gap-2 ${
                                        isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'
                                    }`}>
                                        <span className="text-base">👑</span> Pirate Lords (Nobles)
                                    </h3>
                                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                                        {localBoardState.nobles?.length === 0 ? (
                                            <p className={`text-xs italic ${isDark ? 'text-white/60' : 'text-[#2E438F]/70'}`}>
                                                All Pirate Lords have joined crews.
                                            </p>
                                        ) : (
                                            localBoardState.nobles?.map((noble) => (
                                                <div
                                                    key={noble.id}
                                                    className={`rounded-xl p-3.5 w-36 shrink-0 flex flex-col justify-between shadow-md relative border-2 transition ${
                                                        isDark ? 'bg-[#2E438F]/40 border-white/20 text-white' : 'bg-[#A6B9FF]/20 border-[#2E438F] text-[#091540]'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <span className={`text-2xl font-black leading-none font-mono ${isDark ? 'text-white' : 'text-[#091540]'}`}>
                                                            {noble.points}
                                                        </span>
                                                        <span className="text-sm">👑</span>
                                                    </div>
                                                    <p className={`text-xs font-black text-center my-3 leading-tight truncate ${
                                                        isDark ? 'text-white' : 'text-[#091540]'
                                                    }`} title={noble.name}>
                                                        {noble.name.split(' ').slice(1).join(' ') || noble.name}
                                                    </p>
                                                    <div className="flex flex-wrap gap-1 justify-center">
                                                        {Object.entries(noble.cost).map(([color, amount]) => (
                                                            <span
                                                                key={color}
                                                                className={`text-[10px] font-black font-mono w-5 h-5 rounded-full flex items-center justify-center border shadow-sm ${gemColors[color].bg} ${gemColors[color].text} ${gemColors[color].border}`}
                                                            >
                                                                {amount}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Board Card Rows */}
                                <div className={`rounded-2xl p-5 flex flex-col gap-6 shadow-lg border-2 transition-colors ${
                                    isDark ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                                }`}>
                                    
                                    {/* Map rows 3, 2, 1 */}
                                    {['tier3', 'tier2', 'tier1'].map((tierKey) => {
                                        const tierName = tierKey === 'tier3' ? 'Tier 3 (Galleons)' : tierKey === 'tier2' ? 'Tier 2 (Schooners)' : 'Tier 1 (Sloops & Crew)';
                                        
                                        return (
                                            <div key={tierKey} className="flex flex-col gap-2.5">
                                                <div className="flex justify-between items-center px-1">
                                                    <h4 className={`text-xs font-black font-mono tracking-wider uppercase ${
                                                        isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'
                                                    }`}>
                                                        {tierName}
                                                    </h4>
                                                    <span className={`text-xs font-mono font-bold px-2.5 py-0.5 border rounded-lg ${
                                                        isDark ? 'bg-[#2E438F] border-white/20 text-white' : 'bg-[#A6B9FF]/30 border-[#2E438F] text-[#091540]'
                                                    }`}>
                                                        Deck: {localBoardState.decks?.[tierKey]?.length ?? 0} left
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                    {/* Deck Card Pile */}
                                                    <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col justify-center items-center shadow select-none transition-colors ${
                                                        isDark
                                                            ? 'border-white/30 bg-[#2E438F]/20 text-white'
                                                            : 'border-[#2E438F] bg-[#A6B9FF]/10 text-[#091540]'
                                                    }`}>
                                                        <span className="text-3xl mb-1">🎴</span>
                                                        <span className="text-[10px] uppercase font-black tracking-widest font-mono">
                                                            Deck Pile
                                                        </span>
                                                        {isMyTurn && localBoardState.decks?.[tierKey]?.length > 0 && (
                                                            <button
                                                                onClick={() => handleReserveCard(localBoardState.decks[tierKey][0].id, tierKey)}
                                                                className={`mt-2 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border transition shadow ${
                                                                    isDark
                                                                        ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-white/20'
                                                                        : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540]'
                                                                }`}
                                                            >
                                                                Reserve Top
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Face-up Cards */}
                                                    {localBoardState.cards?.[tierKey]?.map((card) => {
                                                        const affordable = isMyTurn && canAffordCard(card);
                                                        
                                                        const cardBg = isDark
                                                            ? (affordable
                                                                ? 'bg-[#2E438F]/70 border-white ring-2 ring-white/60 text-white'
                                                                : 'bg-[#2E438F]/20 border-white/20 text-white')
                                                            : (affordable
                                                                ? 'bg-[#A6B9FF]/30 border-[#091540] ring-2 ring-[#2E438F] text-[#091540]'
                                                                : 'bg-white border-[#2E438F] text-[#091540]');

                                                        const ptsColor = isDark ? 'text-white' : 'text-[#091540]';
                                                        const ptsLabel = isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]';
                                                        const ptsZero = isDark ? 'text-white/40' : 'text-[#091540]/40';
                                                        
                                                        const bonusBg = isDark
                                                            ? 'bg-[#2E438F] border border-white/30 shadow'
                                                            : 'bg-[#A6B9FF]/40 border border-[#2E438F] shadow';

                                                        const titleBg = isDark
                                                            ? 'bg-[#091540]/60 border-t border-b border-white/20'
                                                            : 'bg-[#A6B9FF]/15 border-t border-b border-[#2E438F]/30';
                                                        const titleText = isDark ? 'text-white' : 'text-[#091540]';
                                                        const titleSub = isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]';

                                                        const btnBuy = isDark
                                                            ? (affordable
                                                                ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border border-white/30 shadow'
                                                                : 'bg-white/10 text-white/30 border border-white/10 cursor-not-allowed')
                                                            : (affordable
                                                                ? 'bg-[#2E438F] hover:bg-[#091540] text-white border border-[#091540] shadow'
                                                                : 'bg-[#091540]/10 text-[#091540]/40 border border-[#091540]/20 cursor-not-allowed');

                                                        const btnRev = isDark
                                                            ? 'bg-[#091540] hover:bg-[#2E438F] text-white border border-white/30'
                                                            : 'bg-white hover:bg-[#2E438F] hover:text-white text-[#2E438F] border border-[#2E438F]';

                                                        return (
                                                            <div key={card.id} className={`rounded-xl p-3 flex flex-col justify-between h-56 shadow-md hover:scale-[1.02] border-2 transition-all duration-200 ${cardBg}`}>
                                                                {/* Top: Points & Bonus */}
                                                                <div className="flex justify-between items-start">
                                                                    <span className={`text-2xl font-mono font-black leading-none flex items-baseline gap-0.5 ${ptsColor}`}>
                                                                        {card.points > 0 ? (
                                                                            <>
                                                                                {card.points}
                                                                                <span className={`text-[9px] font-sans font-black ml-0.5 ${ptsLabel}`}>PTS</span>
                                                                            </>
                                                                        ) : (
                                                                            <span className={`text-[9px] font-sans italic font-black ${ptsZero}`}>0 PTS</span>
                                                                        )}
                                                                    </span>
                                                                    <span
                                                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${bonusBg}`}
                                                                        title={`Permanent Bonus: ${card.bonus}`}
                                                                    >
                                                                        {gemColors[card.bonus].emoji}
                                                                    </span>
                                                                </div>

                                                                {/* Title */}
                                                                <div className={`py-1.5 my-2 text-center grow flex flex-col justify-center rounded-lg ${titleBg}`}>
                                                                    <p className={`text-[10px] font-black uppercase leading-snug tracking-wider truncate px-1 ${titleText}`} title={card.name}>
                                                                        {card.name}
                                                                    </p>
                                                                    <p className={`text-[8px] font-mono tracking-widest uppercase font-black mt-0.5 ${titleSub}`}>
                                                                        {tierKey === 'tier3' ? 'Galleon' : tierKey === 'tier2' ? 'Schooner' : 'Sloop'}
                                                                    </p>
                                                                </div>

                                                                {/* Card Cost & Action Buttons */}
                                                                <div className="flex items-center justify-between mt-auto gap-1">
                                                                    <div className="flex gap-0.5 flex-wrap">
                                                                        {Object.entries(card.cost).map(([color, amount]) => (
                                                                            <span
                                                                                key={color}
                                                                                className={`text-[10px] font-mono font-black w-5 h-5 rounded-full flex items-center justify-center border shadow-sm ${gemColors[color].bg} ${gemColors[color].text} ${gemColors[color].border}`}
                                                                                title={`${amount} ${gemColors[color].label}`}
                                                                            >
                                                                                {amount}
                                                                            </span>
                                                                        ))}
                                                                    </div>

                                                                    {isMyTurn && (
                                                                        <div className="flex gap-1 shrink-0">
                                                                            <button
                                                                                onClick={() => handleBuyCard(card.id, tierKey)}
                                                                                disabled={!affordable}
                                                                                className={`text-[9px] font-black py-1 px-2 rounded-lg uppercase tracking-wider transition ${btnBuy}`}
                                                                            >
                                                                                Buy
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleReserveCard(card.id, tierKey)}
                                                                                className={`text-[9px] font-black py-1 px-1.5 rounded-lg uppercase tracking-wider transition ${btnRev}`}
                                                                            >
                                                                                Rev
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    {/* Empty Card slots placeholders if deck is run out */}
                                                    {Array.from({ length: 4 - (localBoardState.cards?.[tierKey]?.length ?? 0) }).map((_, i) => (
                                                        <div key={i} className={`border-2 border-dashed rounded-xl h-56 flex items-center justify-center text-xs font-bold italic ${
                                                            isDark ? 'border-white/20 bg-white/5 text-white/40' : 'border-[#2E438F]/30 bg-[#A6B9FF]/10 text-[#2E438F]/50'
                                                        }`}>
                                                            Empty Chart
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            {/* RIGHT SIDE: Game State, Token chest piles, and Turn Log */}
                            <div className="flex flex-col gap-6">
                                
                                {/* ACTIVE PLAY BOARD / TURN BANNER */}
                                <div className={`rounded-2xl p-5 shadow-lg border-2 transition-colors ${
                                    isDark ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                                }`}>
                                    <h3 className={`text-xs font-black font-mono tracking-widest uppercase mb-3 flex items-center gap-2 ${
                                        isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'
                                    }`}>
                                        <span>⚔️</span> Status & Turn
                                    </h3>
                                    {status === 'playing' ? (
                                        <div className={`p-4 rounded-xl text-center border-2 transition ${
                                            isDark ? 'bg-[#2E438F]/30 border-white/20 text-white' : 'bg-[#A6B9FF]/20 border-[#2E438F] text-[#091540]'
                                        }`}>
                                            <p className={`text-[11px] uppercase tracking-widest font-mono font-bold ${
                                                isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'
                                            }`}>
                                                Active Pirate:
                                            </p>
                                            <p className={`text-lg font-black my-1.5 animate-pulse ${
                                                isDark ? 'text-white' : 'text-[#091540]'
                                            }`}>
                                                🏴‍☠️ {activePlayer?.name}
                                            </p>
                                            <div className="text-xs mt-2">
                                                {isMyTurn ? (
                                                    <span className={`px-3 py-1.5 font-black rounded-xl uppercase tracking-wider animate-pulse border-2 shadow ${
                                                        isDark
                                                            ? 'bg-[#2E438F] text-white border-white'
                                                            : 'bg-[#2E438F] text-white border-[#091540]'
                                                    }`}>
                                                        ⚔️ YOUR TURN TO PLUNDER!
                                                    </span>
                                                ) : (
                                                    <span className={`px-3 py-1.5 font-bold rounded-xl border ${
                                                        isDark ? 'bg-[#091540] text-[#A6B9FF] border-white/20' : 'bg-white text-[#2E438F] border-[#2E438F]'
                                                    }`}>
                                                        Waiting for opponent...
                                                    </span>
                                                )}
                                            </div>
                                            <div className={`mt-4 pt-3 border-t ${
                                                isDark ? 'border-white/20' : 'border-[#2E438F]/20'
                                            }`}>
                                                <button
                                                    onClick={() => setShowSurrenderConfirm(true)}
                                                    className="w-full text-[10px] bg-rose-700 hover:bg-rose-600 text-white font-black py-2 px-3 rounded-xl uppercase tracking-widest transition shadow-sm border border-rose-850"
                                                >
                                                    🏳️ Forfeit Voyage
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-emerald-950/40 border-2 border-emerald-500 text-white rounded-xl text-center">
                                            <p className="text-lg font-black text-emerald-400">Voyage Over!</p>
                                            <p className="text-xs mt-1 font-bold">Captain {gamePlayers.find(p => p.user_id === winner_id)?.name} won!</p>
                                            <Link
                                                href={route('dashboard')}
                                                className="mt-3 block text-xs bg-[#2E438F] hover:bg-[#091540] text-white font-black py-2 px-3 rounded-xl uppercase tracking-wider transition border border-white/20"
                                            >
                                                Back to Tavern
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Token Chest (Treasure Piles) */}
                                <div className={`rounded-2xl p-5 shadow-lg border-2 transition-colors ${
                                    isDark ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                                }`}>
                                    <h3 className={`text-xs font-black font-mono tracking-widest uppercase mb-3 flex items-center gap-2 ${
                                        isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'
                                    }`}>
                                        <span>🪙</span> Treasure Chest
                                    </h3>
                                    
                                    <div className="grid grid-cols-3 gap-2.5">
                                        {Object.entries(localBoardState.tokens || {}).map(([color, count]) => {
                                            const isSelected = selectedTokens.includes(color);
                                            const countInSelection = selectedTokens.filter(c => c === color).length;
                                            
                                            return (
                                                <button
                                                    key={color}
                                                    onClick={() => handleTokenClick(color)}
                                                    className={`rounded-xl border-2 p-2.5 flex flex-col items-center justify-between transition relative shadow ${
                                                        isSelected
                                                            ? (isDark
                                                                ? 'bg-[#2E438F] border-white scale-95 text-white shadow-lg'
                                                                : 'bg-[#2E438F] border-[#091540] scale-95 text-white shadow-lg')
                                                            : (isDark
                                                                ? 'bg-[#2E438F]/20 border-white/20 hover:border-[#A6B9FF] text-white'
                                                                : 'bg-[#A6B9FF]/10 border-[#2E438F] hover:border-[#091540] text-[#091540]')
                                                    }`}
                                                >
                                                    {countInSelection > 0 && (
                                                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#2E438F] text-white font-mono font-black text-xs rounded-full flex items-center justify-center border-2 border-white shadow">
                                                            +{countInSelection}
                                                        </span>
                                                    )}
                                                    <span className="text-2xl">{gemColors[color].emoji}</span>
                                                    <span className={`text-[10px] mt-1 uppercase font-black tracking-wider ${
                                                        isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'
                                                    }`}>
                                                        {color}
                                                    </span>
                                                    <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-lg mt-1 border ${
                                                        isDark ? 'bg-[#2E438F] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                                                    }`}>
                                                        {count}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Plundering Draft Box */}
                                    {selectedTokens.length > 0 && (
                                        <div className={`mt-4 border-2 p-3.5 rounded-xl text-center ${
                                            isDark ? 'bg-[#2E438F]/30 border-white/20 text-white' : 'bg-[#A6B9FF]/20 border-[#2E438F] text-[#091540]'
                                        }`}>
                                            <p className={`text-[10px] uppercase tracking-widest font-mono font-black ${
                                                isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'
                                            }`}>
                                                Plunder Draft:
                                            </p>
                                            <div className="flex gap-2 justify-center my-2.5">
                                                {selectedTokens.map((color, idx) => (
                                                    <span key={idx} className="text-2xl" title={color}>
                                                        {gemColors[color].emoji}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={submitTakeTokens}
                                                    className={`grow font-black text-xs py-2 px-3 rounded-xl uppercase tracking-wider border-2 transition shadow ${
                                                        isDark
                                                            ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-white/20'
                                                            : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540]'
                                                    }`}
                                                >
                                                    Claim Treasures
                                                </button>
                                                <button
                                                    onClick={clearSelection}
                                                    className={`text-xs font-bold py-2 px-3 rounded-xl border-2 transition ${
                                                        isDark
                                                            ? 'bg-transparent border-white/30 text-white hover:bg-white/10'
                                                            : 'bg-white border-[#2E438F] text-[#2E438F] hover:bg-[#2E438F] hover:text-white'
                                                    }`}
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Scoreboard & Inventory summaries */}
                                <div className={`rounded-2xl p-5 shadow-lg border-2 transition-colors ${
                                    isDark ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                                }`}>
                                    <h3 className={`text-xs font-black font-mono tracking-widest uppercase mb-3 flex items-center gap-2 ${
                                        isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'
                                    }`}>
                                        <span>📜</span> Pirates Infamy Scoreboard
                                    </h3>
                                    
                                    <div className="flex flex-col gap-3">
                                        {gamePlayers.map((gp) => {
                                            const playerState = localBoardState.players?.[gp.user_id];
                                            if (!playerState) return null;
                                            const active = gp.player_index === current_player_index;
                                            
                                            return (
                                                <div
                                                    key={gp.user_id}
                                                    className={`p-3 rounded-xl border-2 text-sm flex flex-col gap-2 transition-colors shadow-sm ${
                                                        active
                                                            ? (isDark
                                                                ? 'bg-[#2E438F]/50 border-white text-white shadow-md'
                                                                : 'bg-[#A6B9FF]/30 border-[#091540] text-[#091540] shadow-md')
                                                            : (isDark
                                                                ? 'bg-[#2E438F]/15 border-white/15 text-white/90'
                                                                : 'bg-white border-[#2E438F]/40 text-[#091540]')
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className={`font-black ${active ? (isDark ? 'text-[#A6B9FF] underline' : 'text-[#091540] underline') : (isDark ? 'text-white' : 'text-[#091540]')}`}>
                                                            {gp.name} {gp.user_id === authUserId ? '(Anda)' : ''}
                                                        </span>
                                                        <span className={`font-mono px-2 py-0.5 rounded-lg font-black text-xs border ${
                                                             isDark ? 'bg-[#2E438F] border-white/20 text-white' : 'bg-[#A6B9FF]/30 border-[#2E438F] text-[#091540]'
                                                         }`}>
                                                             ☠️ {playerState.points} Infamy
                                                         </span>
                                                    </div>

                                                    {/* Bonuses */}
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className={`font-bold ${isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>Bonuses:</span>
                                                        <div className="flex gap-1">
                                                            {Object.entries(playerState.bonuses).map(([color, val]) => (
                                                                <span
                                                                    key={color}
                                                                    className={`px-1.5 py-0.5 rounded text-[10px] font-black font-mono flex items-center border shadow-xs ${gemColors[color].bg} ${gemColors[color].text} ${gemColors[color].border}`}
                                                                >
                                                                    {val}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Tokens */}
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className={`font-bold ${isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>Treasures:</span>
                                                        <div className="flex gap-1.5 items-center">
                                                            <span className={`font-mono font-bold text-xs ${isDark ? 'text-white/80' : 'text-[#091540]/80'}`}>
                                                                {Object.values(playerState.tokens).reduce((a, b) => a + b, 0)}/10
                                                            </span>
                                                            <div className="flex gap-1">
                                                                {Object.entries(playerState.tokens).map(([color, val]) => {
                                                                    if (val === 0) return null;
                                                                    return (
                                                                        <span key={color} className="text-xs flex items-center" title={`${val} ${color}`}>
                                                                            {gemColors[color].emoji}
                                                                            <span className={`font-mono text-[9px] font-black ml-0.5 ${isDark ? 'text-white' : 'text-[#091540]'}`}>{val}</span>
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Reserved count */}
                                                    {playerState.reserved_cards?.length > 0 && (
                                                        <div className="text-xs flex justify-between">
                                                            <span className={`font-bold ${isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>Reserved Maps:</span>
                                                            <span className={`font-mono font-black ${isDark ? 'text-white' : 'text-[#091540]'}`}>
                                                                {playerState.reserved_cards.length}/3
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PERSONAL CABIN: User Stats, Inventory Details, and Reserved cards */}
                    {status === 'playing' && localBoardState.players?.[authUserId] && (
                        <div className={`mt-8 border-2 rounded-2xl p-6 shadow-2xl transition-colors ${
                            isDark ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                        }`}>
                            <h3 className={`text-sm font-black font-mono tracking-widest uppercase mb-4 pb-2 border-b flex items-center gap-2 ${
                                isDark ? 'text-[#A6B9FF] border-white/20' : 'text-[#2E438F] border-[#2E438F]/30'
                            }`}>
                                <span className="text-base">🗺️</span> Captain's Cabin (Yer Inventory & Actions)
                            </h3>

                            <div className="grid gap-6 md:grid-cols-3">
                                
                                {/* Personal Treasures Pile */}
                                <div className={`border-2 p-4 rounded-xl flex flex-col justify-between transition-colors ${
                                    isDark ? 'bg-[#2E438F]/20 border-white/20 text-white' : 'bg-[#A6B9FF]/10 border-[#2E438F] text-[#091540]'
                                }`}>
                                    <h4 className={`text-xs font-black uppercase tracking-wider mb-3 ${
                                        isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'
                                    }`}>
                                        Your Treasure Stash ({Object.values(localBoardState.players[authUserId].tokens).reduce((a, b) => a + b, 0)}/10 max)
                                    </h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.entries(localBoardState.players[authUserId].tokens).map(([color, count]) => (
                                            <div
                                                key={color}
                                                className={`p-2.5 border-2 rounded-xl flex flex-col items-center transition-colors ${
                                                    isDark ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                                                }`}
                                            >
                                                <span className="text-2xl">{gemColors[color].emoji}</span>
                                                <span className={`text-xs font-mono font-black mt-1 ${
                                                    isDark ? 'text-white' : 'text-[#091540]'
                                                }`}>{count}</span>
                                                <span className={`text-[9px] uppercase font-black ${
                                                    isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'
                                                }`}>{color}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Reserved Charts (Cards in Hand) */}
                                <div className={`border-2 p-4 rounded-xl flex flex-col justify-between transition-colors ${
                                    isDark ? 'bg-[#2E438F]/20 border-white/20 text-white' : 'bg-[#A6B9FF]/10 border-[#2E438F] text-[#091540]'
                                }`}>
                                    <h4 className={`text-xs font-black uppercase tracking-wider mb-3 ${
                                        isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'
                                    }`}>
                                        Your Reserved Charts ({localBoardState.players[authUserId].reserved_cards?.length ?? 0}/3)
                                    </h4>
                                    
                                    {(!localBoardState.players[authUserId].reserved_cards || localBoardState.players[authUserId].reserved_cards.length === 0) ? (
                                        <div className={`text-center py-6 text-xs italic grow flex items-center justify-center font-bold ${
                                            isDark ? 'text-white/50' : 'text-[#2E438F]/60'
                                        }`}>
                                            No charts reserved.
                                        </div>
                                    ) : (
                                        <div className="flex gap-3 overflow-x-auto pb-1 grow scrollbar-thin">
                                            {localBoardState.players[authUserId].reserved_cards.map((card) => {
                                                const affordable = isMyTurn && canAffordCard(card);
                                                
                                                const cardBg = isDark
                                                    ? (affordable
                                                        ? 'bg-[#2E438F]/70 border-white ring-2 ring-white/60 text-white'
                                                        : 'bg-[#091540] border-white/20 text-white')
                                                    : (affordable
                                                        ? 'bg-[#A6B9FF]/30 border-[#091540] ring-2 ring-[#2E438F] text-[#091540]'
                                                        : 'bg-white border-[#2E438F] text-[#091540]');

                                                const ptsColor = isDark ? 'text-white' : 'text-[#091540]';
                                                const titleBg = isDark
                                                    ? 'bg-[#091540]/60 border border-white/20'
                                                    : 'bg-[#A6B9FF]/20 border border-[#2E438F]/30';
                                                const titleText = isDark ? 'text-white' : 'text-[#091540]';

                                                const btnBuy = isDark
                                                    ? (affordable
                                                        ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border border-white/30 shadow'
                                                        : 'bg-white/10 text-white/30 border border-white/10 cursor-not-allowed')
                                                    : (affordable
                                                        ? 'bg-[#2E438F] hover:bg-[#091540] text-white border border-[#091540] shadow'
                                                        : 'bg-[#091540]/10 text-[#091540]/40 border border-[#091540]/20 cursor-not-allowed');

                                                return (
                                                    <div key={card.id} className={`border-2 rounded-xl p-2.5 w-32 h-48 shrink-0 flex flex-col justify-between shadow-md transition ${cardBg}`}>
                                                        {/* Top: Points & Bonus */}
                                                        <div className="flex justify-between items-start">
                                                            <span className={`text-[11px] font-mono font-black ${ptsColor}`}>
                                                                {card.points > 0 ? `☠️ ${card.points} PTS` : '0 PTS'}
                                                            </span>
                                                            <span className="text-sm" title={`Permanent Bonus: ${card.bonus}`}>{gemColors[card.bonus].emoji}</span>
                                                        </div>

                                                        {/* Title */}
                                                        <div className={`py-1 my-1 text-center grow flex flex-col justify-center rounded-lg ${titleBg}`}>
                                                            <p className={`text-[9px] font-black uppercase leading-tight truncate px-0.5 ${titleText}`} title={card.name}>
                                                                {card.name}
                                                            </p>
                                                        </div>

                                                        {/* Costs & Action */}
                                                        <div>
                                                            <div className="flex flex-wrap gap-1 justify-center mb-1.5">
                                                                {Object.entries(card.cost).map(([color, amount]) => (
                                                                    <span
                                                                        key={color}
                                                                        className={`text-[9px] font-mono font-black w-4 h-4 rounded-full flex items-center justify-center border shadow-sm ${gemColors[color].bg} ${gemColors[color].text} ${gemColors[color].border}`}
                                                                        title={`${amount} ${gemColors[color].label}`}
                                                                    >
                                                                        {amount}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            {isMyTurn && (
                                                                <button
                                                                    onClick={() => handleBuyCard(card.id, 'tier' + card.tier, true)}
                                                                    disabled={!affordable}
                                                                    className={`text-[9px] font-black py-1 rounded-lg uppercase tracking-wider w-full transition ${btnBuy}`}
                                                                >
                                                                    Buy
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Play Logs (History log) */}
                                <div className={`border-2 p-4 rounded-xl flex flex-col h-48 md:h-auto transition-colors ${
                                    isDark ? 'bg-[#2E438F]/20 border-white/20 text-white' : 'bg-[#A6B9FF]/10 border-[#2E438F] text-[#091540]'
                                }`}>
                                    <h4 className={`text-xs font-black uppercase tracking-wider mb-2 ${
                                        isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'
                                    }`}>
                                        Voyage Journal (Log)
                                    </h4>
                                    <div className={`overflow-y-auto p-2.5 rounded-xl text-xs font-mono grow flex flex-col gap-1.5 max-h-36 border-2 ${
                                        isDark ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
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
                                isDark
                                    ? 'bg-[#091540] border-rose-500 text-white'
                                    : 'bg-white border-rose-500 text-[#091540]'
                            }`}>
                                <div className="flex items-center gap-3 text-rose-500 mb-4">
                                    <span className="text-3xl">🏳️</span>
                                    <h3 className="text-lg font-black font-mono uppercase tracking-wider">Raise the White Flag?</h3>
                                </div>
                                <p className={`text-xs font-bold leading-relaxed mb-6 ${isDark ? 'text-white/80' : 'text-[#091540]/80'}`}>
                                    Are ye sure ye want to surrender and flee this voyage? The remaining player with the highest infamy points will claim immediate victory!
                                </p>
                                <div className="flex justify-end gap-3 font-black text-xs">
                                    <button
                                        onClick={() => setShowSurrenderConfirm(false)}
                                        className={`px-4 py-2 rounded-xl uppercase tracking-wider border-2 transition ${
                                            isDark
                                                ? 'bg-transparent border-white/30 text-white hover:bg-white/10'
                                                : 'bg-white border-[#2E438F] text-[#2E438F] hover:bg-[#2E438F] hover:text-white'
                                        }`}
                                    >
                                        Stay & Fight
                                    </button>
                                    <button
                                        onClick={handleSurrender}
                                        className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-xl uppercase tracking-wider transition shadow-sm border border-rose-800"
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
                                isDark
                                    ? 'bg-[#091540] border-white/20 text-white'
                                    : 'bg-white border-[#2E438F] text-[#091540]'
                            }`}>
                                <div className={`flex justify-between items-center mb-6 pb-3 border-b ${
                                    isDark ? 'border-white/20' : 'border-[#2E438F]/30'
                                }`}>
                                    <h3 className={`text-lg font-black font-mono uppercase tracking-wider flex items-center gap-2 ${
                                        isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'
                                    }`}>
                                        <span>📜</span> Voyage Rules (Aturan Permainan)
                                    </h3>
                                    <button
                                        onClick={() => setShowRules(false)}
                                        className={`font-black text-lg p-1 transition ${
                                            isDark ? 'text-white/60 hover:text-white' : 'text-[#2E438F]/60 hover:text-[#091540]'
                                        }`}
                                    >
                                        ✕
                                    </button>
                                </div>
                                
                                <div className="space-y-5 text-xs leading-relaxed font-bold">
                                    <section>
                                        <h4 className={`font-black uppercase tracking-wider mb-1 ${isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>
                                            1. Tujuan Permainan (Goal)
                                        </h4>
                                        <p className={isDark ? 'text-white/90' : 'text-[#091540]/90'}>
                                            Kumpulkan poin ketenaran (**Infamy Points**) hingga mencapai minimal **15 Poin**. Ketika seorang bajak laut mencapai 15 poin atau lebih, permainan akan diselesaikan setelah semua pemain menyelesaikan jumlah giliran yang sama di ronde tersebut. Pemain dengan poin tertinggi menang. Jika seri, pemain dengan kartu beli tersedikit yang menang.
                                        </p>
                                    </section>

                                    <section>
                                        <h4 className={`font-black uppercase tracking-wider mb-1 ${isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>
                                            2. Giliran Pemain (Player Turn Actions)
                                        </h4>
                                        <p className={isDark ? 'text-white/90' : 'text-[#091540]/90'}>
                                            Di giliran Anda, Anda harus memilih **satu** dari tindakan berikut:
                                        </p>
                                        <ul className={`list-disc list-inside mt-2 space-y-1.5 ${isDark ? 'text-white/90' : 'text-[#091540]/90'}`}>
                                            <li>
                                                <strong className={isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}>Ambil Harta (Draft Treasures):</strong> Ambil **3 koin harta dengan warna berbeda** ATAU ambil **2 koin harta sewarna** (hanya boleh dilakukan jika tumpukan warna tersebut di papan tersisa **minimal 4 koin**).
                                            </li>
                                            <li>
                                                <strong className={isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}>Reservasi Peta (Reserve Chart):</strong> Ambil salah satu kartu ke tangan Anda dan dapatkan **1 koin Emas (Gold/Wildcard)**. Batas maksimal kartu di tangan adalah **3 kartu**. Koin Emas dapat digunakan menggantikan koin warna apa pun saat membeli kartu.
                                            </li>
                                            <li>
                                                <strong className={isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}>Beli Peta (Buy Chart):</strong> Bayar biaya koin harta yang tercantum di kartu (baik dari papan atau dari kartu cadangan di tangan Anda) untuk menambahkannya ke kru Anda.
                                            </li>
                                        </ul>
                                    </section>

                                    <section>
                                        <h4 className={`font-black uppercase tracking-wider mb-1 ${isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>
                                            3. Kapasitas Koin (Token Limit)
                                        </h4>
                                        <p className={isDark ? 'text-white/90' : 'text-[#091540]/90'}>
                                            Seorang bajak laut tidak boleh membawa lebih dari **10 koin harta** di tangannya pada akhir gilirannya. Jika Anda memiliki lebih dari 10 koin setelah melakukan tindakan mengambil koin, Anda harus mengembalikan koin berlebih ke peti harta papan.
                                        </p>
                                    </section>

                                    <section>
                                        <h4 className={`font-black uppercase tracking-wider mb-1 ${isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>
                                            4. Bonus Permanen (Permanent Card Bonuses)
                                        </h4>
                                        <p className={isDark ? 'text-white/90' : 'text-[#091540]/90'}>
                                            Setiap kartu yang Anda beli memberikan satu bonus simbol permata permanen. Bonus ini bertindak sebagai koin diskon permanen untuk pembelian kartu berikutnya (misalnya: jika Anda memiliki 2 bonus Emerald, kartu berikutnya yang berbiaya 3 Emerald dapat Anda beli hanya dengan membayar 1 koin Emerald).
                                        </p>
                                    </section>

                                    <section>
                                        <h4 className={`font-black uppercase tracking-wider mb-1 ${isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>
                                            5. Kunjungan Pirate Lord (Noble Visits)
                                        </h4>
                                        <p className={isDark ? 'text-white/90' : 'text-[#091540]/90'}>
                                            Di akhir giliran Anda, jika kombinasi bonus kartu permanen yang Anda miliki memenuhi persyaratan dari salah satu **Pirate Lord (Nobles)** di papan atas, mereka akan otomatis bergabung dengan kru Anda secara permanen dan memberikan **3 Poin Infamy** tambahan.
                                        </p>
                                    </section>
                                </div>

                                <div className={`mt-8 pt-4 border-t flex justify-end ${
                                    isDark ? 'border-white/20' : 'border-[#2E438F]/30'
                                }`}>
                                    <button
                                        onClick={() => setShowRules(false)}
                                        className={`px-6 py-2.5 rounded-xl uppercase tracking-wider text-xs font-black transition shadow-md border-2 ${
                                            isDark
                                                ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-white/20'
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
        </AuthenticatedLayout>
    );
}

