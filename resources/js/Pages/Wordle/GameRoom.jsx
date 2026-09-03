import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/hooks/useTheme';
import { useState, useEffect, useCallback, useRef } from 'react';
import Modal from '@/Components/Modal';
import InviteFriendModal from '@/Components/InviteFriendModal';

export default function GameRoom({ game, gamePlayers, authUserId }) {
    const { id, uuid, creator_id, status, current_player_index, winner_id, board_state } = game;
    const [actionError, setActionError] = useState('');
    const [localBoardState, setLocalBoardState] = useState(board_state || {});
    const [theme, setTheme] = useTheme();
    const isDark = theme === 'dark';

    // Modals
    const [showRules, setShowRules] = useState(false);
    const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showDisbandModal, setShowDisbandModal] = useState(false);
    const [showUnreadyWarning, setShowUnreadyWarning] = useState(false);
    const [showVictoryModal, setShowVictoryModal] = useState(false);

    // Active typing input for local player
    const [currentGuess, setCurrentGuess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shakeCurrentRow, setShakeCurrentRow] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Polling interval to sync opponent boards
    useEffect(() => {
        const interval = setInterval(() => {
            fetch(route('games.state', uuid))
                .then((res) => {
                    if (res.status === 404) {
                        router.visit(route('dashboard'));
                        return null;
                    }
                    return res.json();
                })
                .then((data) => {
                    if (data && data.status) {
                        if (data.status !== status) {
                            router.reload({ only: ['game', 'gamePlayers'] });
                        }
                        if (data.board_state) {
                            setLocalBoardState(data.board_state);
                        }
                    }
                })
                .catch(() => {});
        }, 1500);

        return () => clearInterval(interval);
    }, [uuid, status]);

    // Keep localBoardState synced with prop updates
    useEffect(() => {
        if (board_state) {
            setLocalBoardState(board_state);
        }
    }, [board_state]);

    // Show victory modal when all players are finished
    useEffect(() => {
        if (status === 'finished') {
            setShowVictoryModal(true);
        }
    }, [status]);

    const playersState = localBoardState?.players || {};
    const myPlayerState = playersState[authUserId] || null;
    const isHost = authUserId === creator_id;
    const maxPlayers = game.max_players || 2;
    const isSolo = maxPlayers === 1;

    // Toast helper
    const showToast = (msg) => {
        setToastMessage(msg);
        setShakeCurrentRow(true);
        setTimeout(() => setShakeCurrentRow(false), 600);
        setTimeout(() => setToastMessage(''), 2500);
    };

    // Ready toggle action
    const handleToggleReady = () => {
        router.post(
            route('games.ready', uuid),
            {},
            {
                preserveScroll: true,
                onError: (errors) => {
                    if (errors.action_error) setActionError(errors.action_error);
                },
            }
        );
    };

    // Disband room
    const handleDisbandRoom = () => {
        router.delete(route('games.destroy', uuid));
    };

    // Kick player
    const handleKickPlayer = (userIdToKick) => {
        router.post(
            route('games.kick', uuid),
            { user_id: userIdToKick },
            { preserveScroll: true }
        );
    };

    // Start game
    const handleStartGame = () => {
        if (!isSolo && gamePlayers.length < 2) {
            setActionError('You need at least 2 pirates to set sail on a crew duel!');
            return;
        }

        const unreadyPlayers = gamePlayers.filter((gp) => gp.user_id !== creator_id && !gp.is_ready);
        if (unreadyPlayers.length > 0) {
            setShowUnreadyWarning(true);
            return;
        }

        router.post(
            route('games.start', uuid),
            {},
            {
                preserveScroll: true,
                onError: (errors) => {
                    if (errors.action_error) setActionError(errors.action_error);
                },
            }
        );
    };

    // Handle character input
    const handleAddLetter = useCallback((letter) => {
        if (status !== 'playing' || !myPlayerState) return;
        if (myPlayerState.solved || myPlayerState.failed || myPlayerState.surrendered) return;

        setCurrentGuess((prev) => {
            if (prev.length < 5) {
                return (prev + letter).toUpperCase();
            }
            return prev;
        });
    }, [status, myPlayerState]);

    // Handle backspace
    const handleDeleteLetter = useCallback(() => {
        if (status !== 'playing' || !myPlayerState) return;
        if (myPlayerState.solved || myPlayerState.failed || myPlayerState.surrendered) return;

        setCurrentGuess((prev) => prev.slice(0, -1));
    }, [status, myPlayerState]);

    // Handle guess submission
    const handleSubmitGuess = useCallback(() => {
        if (status !== 'playing' || !myPlayerState || isSubmitting) return;
        if (myPlayerState.solved || myPlayerState.failed || myPlayerState.surrendered) return;

        if (currentGuess.length !== 5) {
            showToast('Sandi harus tepat 5 huruf!');
            return;
        }

        setIsSubmitting(true);
        router.post(
            route('games.guess', uuid),
            { guess: currentGuess },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setCurrentGuess('');
                    setIsSubmitting(false);
                },
                onError: (errors) => {
                    setIsSubmitting(false);
                    if (errors.action_error) {
                        showToast(errors.action_error);
                    } else if (errors.guess) {
                        showToast(errors.guess);
                    } else {
                        showToast('Kata tidak valid!');
                    }
                },
            }
        );
    }, [status, myPlayerState, isSubmitting, currentGuess, uuid]);

    // Surrender action
    const handleSurrender = () => {
        router.post(
            route('games.surrender', uuid),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowSurrenderConfirm(false);
                },
                onError: (errors) => {
                    if (errors.action_error) setActionError(errors.action_error);
                },
            }
        );
    };

    // Keyboard physical event listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (showRules || showSurrenderConfirm || showInviteModal || showDisbandModal || showVictoryModal) {
                return;
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmitGuess();
            } else if (e.key === 'Backspace') {
                e.preventDefault();
                handleDeleteLetter();
            } else if (/^[a-zA-Z]$/.test(e.key)) {
                e.preventDefault();
                handleAddLetter(e.key.toUpperCase());
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        showRules,
        showSurrenderConfirm,
        showInviteModal,
        showDisbandModal,
        showVictoryModal,
        handleSubmitGuess,
        handleDeleteLetter,
        handleAddLetter,
    ]);

    // Keyboard visual layout
    const keyboardRows = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
    ];

    const getVirtualKeyClass = (key) => {
        const myKeyboard = myPlayerState?.keyboard || {};
        const keyStatus = myKeyboard[key];

        if (key === 'ENTER' || key === '⌫') {
            return isDark
                ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-white/30 text-[11px] font-black'
                : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540] text-[11px] font-black';
        }

        if (keyStatus === 'green') {
            return 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 font-black shadow-md';
        }
        if (keyStatus === 'yellow') {
            return 'bg-amber-500 hover:bg-amber-400 text-white border-amber-300 font-black shadow-md';
        }
        if (keyStatus === 'gray') {
            return isDark
                ? 'bg-[#091540]/80 text-white/30 border-white/10 opacity-60 font-medium'
                : 'bg-[#091540]/20 text-[#091540]/40 border-[#2E438F]/30 opacity-60 font-medium';
        }

        return isDark
            ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-white/20 font-bold'
            : 'bg-white hover:bg-[#A6B9FF]/40 text-[#091540] border-[#2E438F] font-bold';
    };

    // Styling helpers
    const panelBg = isDark
        ? 'bg-[#091540]/90 border-white/20 text-white'
        : 'bg-white border-[#2E438F] text-[#091540] shadow-md';

    const headerBg = isDark
        ? 'bg-[#091540] border-white/20 text-white'
        : 'bg-white border-[#2E438F] text-[#091540] shadow-sm';

    // RENDER: WAITING LOBBY
    if (status === 'waiting') {
        const canStart = isSolo ? true : gamePlayers.length >= 2;
        const myPlayerObj = gamePlayers.find((gp) => gp.user_id === authUserId);
        const myIsReady = myPlayerObj?.is_ready || false;

        return (
            <AuthenticatedLayout>
                <Head title="Sandi Tortuga - Waiting Room" />
                <div className={`min-h-[calc(100vh-4rem)] p-4 md:p-8 ${isDark ? 'bg-[#091540] text-white' : 'bg-[#FFFFFF] text-[#091540]'}`}>
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Top Bar */}
                        <div className={`p-4 md:p-6 rounded-2xl border-2 flex flex-col md:flex-row justify-between items-center gap-4 ${headerBg}`}>
                            <div className="flex items-center gap-3">
                                <Link
                                    href={route('dashboard')}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase font-mono tracking-wider border-2 transition ${
                                        isDark
                                            ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-white/20'
                                            : 'bg-[#A6B9FF]/30 hover:bg-[#2E438F] hover:text-white text-[#091540] border-[#2E438F]'
                                    }`}
                                >
                                    ⚓ Back to Tavern
                                </Link>
                                <div>
                                    <h1 className="text-xl md:text-2xl font-black font-mono tracking-wide flex items-center gap-2">
                                        <span>📜</span> SANDI TORTUGA
                                    </h1>
                                    <p className={`text-xs font-mono tracking-wider ${isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>
                                        Room ID: {uuid.substring(0, 8)} | Mode: {isSolo ? 'Solo Cipher' : `Crew Battle (Max ${maxPlayers} Players)`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowRules(true)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase font-mono tracking-wider border-2 transition ${
                                        isDark
                                            ? 'bg-[#091540] hover:bg-[#2E438F] text-white border-white/20'
                                            : 'bg-white hover:bg-[#A6B9FF]/30 text-[#091540] border-[#2E438F]'
                                    }`}
                                >
                                    📜 Voyage Rules
                                </button>
                                {!isSolo && (
                                    <button
                                        onClick={() => setShowInviteModal(true)}
                                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase font-mono tracking-wider border-2 transition ${
                                            isDark
                                                ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-white/20'
                                                : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540]'
                                        }`}
                                    >
                                        ➕ Invite Crew
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Error Alert */}
                        {actionError && (
                            <div className="p-4 rounded-xl border-2 border-red-400 bg-red-900/40 text-red-200 text-sm font-bold flex justify-between items-center">
                                <span>⚠️ {actionError}</span>
                                <button onClick={() => setActionError('')} className="text-xs uppercase font-mono underline">Dismiss</button>
                            </div>
                        )}

                        {/* Players Deck */}
                        <div className={`p-6 rounded-2xl border-2 ${panelBg}`}>
                            <div className="flex justify-between items-center mb-6 border-b pb-4 border-current/20">
                                <div>
                                    <h3 className="text-base font-black font-mono tracking-widest uppercase">
                                        Pirate Fleet ({gamePlayers.length}/{maxPlayers})
                                    </h3>
                                    <p className="text-xs opacity-75 mt-0.5">
                                        {isSolo
                                            ? 'Ready to crack the secret pirate word alone!'
                                            : 'All pirates must be ready before the Captain gives the order to Set Sail.'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                {gamePlayers.map((gp, idx) => {
                                    const isCaptain = gp.user_id === creator_id;
                                    const isMe = gp.user_id === authUserId;

                                    return (
                                        <div
                                            key={gp.id || idx}
                                            className={`p-4 rounded-xl border-2 flex items-center justify-between transition ${
                                                isDark
                                                    ? 'bg-[#091540] border-white/20'
                                                    : 'bg-[#A6B9FF]/10 border-[#2E438F]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-black font-mono text-base ${
                                                    isDark ? 'bg-[#2E438F] border-white/30 text-white' : 'bg-[#2E438F] border-[#091540] text-white'
                                                }`}>
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm">
                                                            {gp.name || gp.user?.name || `Pirate #${gp.user_id}`}
                                                        </span>
                                                        {isCaptain && (
                                                            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-500 text-[#091540] font-mono">
                                                                👑 Captain
                                                            </span>
                                                        )}
                                                        {isMe && (
                                                            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded font-mono border ${
                                                                isDark ? 'bg-[#2E438F] text-[#A6B9FF] border-white/20' : 'bg-[#A6B9FF]/40 text-[#091540] border-[#2E438F]'
                                                            }`}>
                                                                You
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs font-mono opacity-70 mt-0.5">
                                                        {(gp.username || gp.user?.username) ? `@${gp.username || gp.user?.username}#${gp.hashtag || gp.user?.hashtag || '0000'}` : 'Crew Member'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {isCaptain ? (
                                                    <span className="text-xs font-black font-mono px-3 py-1 rounded-lg bg-emerald-600 text-white">
                                                        HOST
                                                    </span>
                                                ) : gp.is_ready ? (
                                                    <span className="text-xs font-black font-mono px-3 py-1 rounded-lg bg-emerald-600 text-white flex items-center gap-1">
                                                        ✓ READY
                                                    </span>
                                                ) : (
                                                    <span className={`text-xs font-black font-mono px-3 py-1 rounded-lg border ${
                                                        isDark ? 'bg-[#091540] text-white/60 border-white/20' : 'bg-white text-[#091540]/60 border-[#2E438F]/40'
                                                    }`}>
                                                        WAITING
                                                    </span>
                                                )}

                                                {/* Host kick option */}
                                                {isHost && !isCaptain && (
                                                    <button
                                                        onClick={() => handleKickPlayer(gp.user_id)}
                                                        className="text-xs px-2 py-1 rounded bg-red-600 text-white font-mono hover:bg-red-700 transition"
                                                        title="Kick Pirate"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Empty Slots */}
                                {Array.from({ length: maxPlayers - gamePlayers.length }).map((_, idx) => (
                                    <div
                                        key={`empty-${idx}`}
                                        className={`p-4 rounded-xl border-2 border-dashed flex items-center justify-center font-mono text-xs opacity-50 ${
                                            isDark ? 'border-white/20 text-white' : 'border-[#2E438F]/40 text-[#091540]'
                                        }`}
                                    >
                                        ⚓ Empty Berth (Waiting for pirate...)
                                    </div>
                                ))}
                            </div>

                            {/* Action Row */}
                            <div className="mt-8 pt-6 border-t border-current/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div>
                                    {isHost ? (
                                        <button
                                            onClick={() => setShowDisbandModal(true)}
                                            className="text-xs font-mono font-bold text-red-400 hover:text-red-300 underline"
                                        >
                                            ☠️ Disband Fleet Room
                                        </button>
                                    ) : (
                                        <Link
                                            href={route('dashboard')}
                                            className="px-4 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 font-mono tracking-wider transition"
                                        >
                                            ← Abandon Ship & Leave
                                        </Link>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    {!isHost && !isSolo && (
                                        <button
                                            onClick={handleToggleReady}
                                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase font-mono tracking-widest border-2 transition ${
                                                myIsReady
                                                    ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-400 shadow-md'
                                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400 shadow-md'
                                            }`}
                                        >
                                            {myIsReady ? 'Cancel Ready' : 'Set Ready'}
                                        </button>
                                    )}

                                    {isHost && (
                                        <button
                                            onClick={handleStartGame}
                                            disabled={!canStart}
                                            className={`px-8 py-3 rounded-xl text-xs font-black uppercase font-mono tracking-widest border-2 transition shadow-lg ${
                                                canStart
                                                    ? isDark
                                                        ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-white/40'
                                                        : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540]'
                                                    : 'opacity-50 cursor-not-allowed bg-gray-600 text-gray-300 border-gray-500'
                                            }`}
                                        >
                                            ⚔️ Mulai Sandi (Set Sail)
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invite Modal */}
                <InviteFriendModal
                    show={showInviteModal}
                    onClose={() => setShowInviteModal(false)}
                    gameUuid={uuid}
                    joinedPlayerIds={gamePlayers.map((gp) => gp.user_id)}
                />

                {/* Voyage Rules Modal */}
                <Modal show={showRules} onClose={() => setShowRules(false)} maxWidth="md">
                    <div className={`p-6 ${isDark ? 'bg-[#091540] text-white' : 'bg-white text-[#091540]'}`}>
                        <h3 className="text-lg font-black font-mono tracking-widest uppercase mb-4 border-b pb-3 border-current/20">
                            📜 Aturan Sandi Tortuga
                        </h3>
                        <div className="space-y-4 text-xs leading-relaxed">
                            <p>
                                Pecahkan 5 huruf sandi rahasia kapal bajak laut dalam 6 baris kesempatan tebakan sesuai kosakata bahasa Indonesia sehari-hari!
                            </p>
                            <div className="space-y-2 font-mono">
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-600/20 border border-emerald-500">
                                    <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center font-bold">K</div>
                                    <span><strong>HIJAU</strong>: Huruf tepat di posisi yang benar.</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/20 border border-amber-400">
                                    <div className="w-6 h-6 rounded bg-amber-500 text-white flex items-center justify-center font-bold">A</div>
                                    <span><strong>KUNING</strong>: Huruf ada di kata rahasia tapi beda posisi.</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#091540]/40 border border-white/20">
                                    <div className="w-6 h-6 rounded bg-[#091540] text-white/50 border border-white/20 flex items-center justify-center font-bold">P</div>
                                    <span><strong>NAVY / REDUP</strong>: Huruf tidak ada di dalam kata rahasia.</span>
                                </div>
                            </div>
                            <p>
                                Dalam mode pertempuran kru (multiplayer), setiap kapten memiliki kata rahasianya masing-masing. Siapa yang berhasil memecahkan sandi terlebih dahulu akan dinobatkan sebagai Juara #1!
                            </p>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowRules(false)}
                                className={`px-5 py-2 rounded-xl text-xs font-black font-mono uppercase border-2 ${
                                    isDark ? 'bg-[#2E438F] text-white border-white/20' : 'bg-[#2E438F] text-white border-[#091540]'
                                }`}
                            >
                                Mengerti, Kapten!
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Disband Modal */}
                <Modal show={showDisbandModal} onClose={() => setShowDisbandModal(false)} maxWidth="sm">
                    <div className={`p-6 ${isDark ? 'bg-[#091540] text-white' : 'bg-white text-[#091540]'}`}>
                        <h3 className="text-base font-black font-mono tracking-widest uppercase mb-3 text-red-400">
                            ☠️ Bubarkan Room?
                        </h3>
                        <p className="text-xs opacity-80 mb-6">
                            Apakah kapten yakin ingin membubarkan kapal ini? Seluruh kru akan dipulangkan ke tavern.
                        </p>
                        <div className="flex justify-end gap-3 font-mono">
                            <button
                                onClick={() => setShowDisbandModal(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold border border-current/30"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleDisbandRoom}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700"
                            >
                                Bubarkan
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Unready Warning Modal */}
                <Modal show={showUnreadyWarning} onClose={() => setShowUnreadyWarning(false)} maxWidth="sm">
                    <div className={`p-6 ${isDark ? 'bg-[#091540] text-white' : 'bg-white text-[#091540]'}`}>
                        <h3 className="text-base font-black font-mono tracking-widest uppercase mb-3 text-amber-400">
                            ⚠️ Kru Belum Siap!
                        </h3>
                        <p className="text-xs opacity-80 mb-6">
                            Masih ada kru kapal yang belum menyalakan status <strong>READY</strong>. Tunggu mereka bersiap atau beri instruksi!
                        </p>
                        <div className="flex justify-end font-mono">
                            <button
                                onClick={() => setShowUnreadyWarning(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#2E438F] text-white"
                            >
                                Siap, Kapten!
                            </button>
                        </div>
                    </div>
                </Modal>
            </AuthenticatedLayout>
        );
    }

    // RENDER: IN-GAME BATTLE ARENA (1 Board, 2 Boards, or 2x2 Grid)
    const allPlayersList = gamePlayers.map((gp) => {
        const pState = playersState[gp.user_id] || {
            name: gp.name || gp.user?.name || `Pirate #${gp.user_id}`,
            guesses: [],
            solved: false,
            failed: false,
            surrendered: false,
            finish_order: null,
            secret_word: '?????',
        };
        return {
            ...gp,
            ...pState,
            name: pState.name || gp.name || gp.user?.name || `Pirate #${gp.user_id}`,
            isMe: gp.user_id === authUserId,
        };
    });

    const isMyTurnFinished = myPlayerState?.solved || myPlayerState?.failed || myPlayerState?.surrendered;

    // Determine grid columns based on player count
    const totalPlayers = allPlayersList.length;
    let gridLayoutClass = 'grid-cols-1 max-w-lg mx-auto';
    if (totalPlayers === 2) {
        gridLayoutClass = 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto';
    } else if (totalPlayers >= 3) {
        gridLayoutClass = 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto';
    }

    return (
        <AuthenticatedLayout>
            <Head title="Sandi Tortuga - Battle Arena" />
            <div className={`min-h-[calc(100vh-4rem)] p-3 md:p-6 ${isDark ? 'bg-[#091540] text-white' : 'bg-[#FFFFFF] text-[#091540]'}`}>
                <div className="max-w-6xl mx-auto space-y-4">
                    {/* Header Bar */}
                    <div className={`p-3 md:p-4 rounded-2xl border-2 flex justify-between items-center gap-4 ${headerBg}`}>
                        <div className="flex items-center gap-3">
                            <Link
                                href={route('dashboard')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase font-mono tracking-wider border-2 transition ${
                                    isDark
                                        ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-white/20'
                                        : 'bg-[#A6B9FF]/30 hover:bg-[#2E438F] hover:text-white text-[#091540] border-[#2E438F]'
                                }`}
                            >
                                ⚓ Tavern
                            </Link>
                            <div>
                                <h1 className="text-base md:text-lg font-black font-mono tracking-wide flex items-center gap-1.5">
                                    <span>📜</span> SANDI TORTUGA
                                </h1>
                                <p className={`text-[10px] font-mono ${isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>
                                    {isSolo ? 'Mode Solo' : `Arena Duel (${totalPlayers} Kapten)`} | Tebak kata 5-huruf sehari-hari
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowRules(true)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase font-mono border-2 transition ${
                                    isDark
                                        ? 'bg-[#091540] hover:bg-[#2E438F] text-white border-white/20'
                                        : 'bg-white hover:bg-[#A6B9FF]/30 text-[#091540] border-[#2E438F]'
                                }`}
                            >
                                📜 Aturan
                            </button>
                            {!isMyTurnFinished && status === 'playing' && (
                                <button
                                    onClick={() => setShowSurrenderConfirm(true)}
                                    className="px-3 py-1.5 rounded-xl text-xs font-black uppercase font-mono border-2 bg-red-800/60 hover:bg-red-700 text-red-100 border-red-500 transition"
                                >
                                    🏳️ Menyerah
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Floating Toast Notification */}
                    {toastMessage && (
                        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl border-2 border-amber-400 bg-amber-900 text-amber-100 text-xs font-black font-mono shadow-2xl animate-bounce">
                            ⚠️ {toastMessage}
                        </div>
                    )}

                    {/* ARENA BOARDS (2x2 Grid) */}
                    <div className={`grid gap-4 md:gap-6 ${gridLayoutClass}`}>
                        {allPlayersList.map((player) => {
                            const isMe = player.isMe;
                            const guesses = player.guesses || [];
                            const isSolved = player.solved;
                            const isFailed = player.failed;
                            const isSurrendered = player.surrendered;

                            return (
                                <div
                                    key={player.user_id}
                                    className={`relative p-4 md:p-5 rounded-2xl border-2 flex flex-col justify-between transition-all shadow-md ${
                                        isMe
                                            ? isDark
                                                ? 'bg-[#091540] border-[#A6B9FF] ring-2 ring-[#A6B9FF]/40'
                                                : 'bg-white border-[#2E438F] ring-2 ring-[#2E438F]/30'
                                            : isDark
                                            ? 'bg-[#091540]/80 border-white/20'
                                            : 'bg-[#A6B9FF]/10 border-[#2E438F]/40'
                                    }`}
                                >
                                    {/* Player Header */}
                                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-current/20">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base">{isMe ? '👑' : '🏴‍☠️'}</span>
                                            <div>
                                                <h4 className="text-xs md:text-sm font-black font-mono uppercase tracking-wider">
                                                    {player.name || player.user?.name || 'Pirate'} {isMe && '(Anda)'}
                                                </h4>
                                                <p className="text-[10px] font-mono opacity-70">
                                                    Percobaan: {guesses.length}/6
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status Tag */}
                                        <div>
                                            {isSolved && (
                                                <span className="text-[10px] font-black font-mono px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow">
                                                    🏆 JUARA #{player.finish_order || 1}
                                                </span>
                                            )}
                                            {isSurrendered && (
                                                <span className="text-[10px] font-black font-mono px-2.5 py-1 rounded-lg bg-red-600 text-white shadow">
                                                    🏳️ MENYERAH
                                                </span>
                                            )}
                                            {isFailed && !isSolved && (
                                                <span className="text-[10px] font-black font-mono px-2.5 py-1 rounded-lg bg-gray-700 text-gray-200 shadow">
                                                    💀 GAGAL
                                                </span>
                                            )}
                                            {!isSolved && !isFailed && !isSurrendered && (
                                                <span className={`text-[10px] font-black font-mono px-2.5 py-1 rounded-lg border ${
                                                    isDark ? 'bg-[#2E438F] text-[#A6B9FF] border-white/20' : 'bg-[#A6B9FF]/30 text-[#091540] border-[#2E438F]'
                                                }`}>
                                                    ⚔️ MENEBAK...
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status Overlay Banner if player is finished */}
                                    {(isSolved || isSurrendered || isFailed) && (
                                        <div className="absolute inset-x-4 top-16 bottom-4 z-10 rounded-xl bg-[#091540]/85 backdrop-blur-sm border-2 border-white/30 flex flex-col items-center justify-center p-4 text-center text-white">
                                            {isSolved && (
                                                <div className="space-y-2">
                                                    <span className="text-4xl block animate-bounce">🏆</span>
                                                    <h3 className="text-base font-black font-mono uppercase text-emerald-400">
                                                        SELESAI MEMECAHKAN SANDI!
                                                    </h3>
                                                    <p className="text-xs font-mono text-white/80">
                                                        {player.name} berhasil dalam {guesses.length} tebakan (Juara #{player.finish_order || 1})!
                                                    </p>
                                                    {isMe && (
                                                        <p className="text-sm font-black font-mono tracking-widest text-[#A6B9FF] mt-2">
                                                            KATA: {player.secret_word}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {isSurrendered && (
                                                <div className="space-y-2">
                                                    <span className="text-4xl block">🏳️</span>
                                                    <h3 className="text-base font-black font-mono uppercase text-red-400">
                                                        KAPTEN MENYERAH
                                                    </h3>
                                                    <p className="text-xs font-mono text-white/80">
                                                        {player.name} telah mengibarkan bendera putih.
                                                    </p>
                                                    {(status === 'finished' || isMe) && player.secret_word && (
                                                        <p className="text-xs font-mono text-[#A6B9FF]">
                                                            Kata rahasia: {player.secret_word}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {isFailed && (
                                                <div className="space-y-2">
                                                    <span className="text-4xl block">💀</span>
                                                    <h3 className="text-base font-black font-mono uppercase text-amber-400">
                                                        KEHABISAN KESEMPATAN
                                                    </h3>
                                                    <p className="text-xs font-mono text-white/80">
                                                        {player.name} gagal memecahkan 6 baris sandi.
                                                    </p>
                                                    {(status === 'finished' || isMe) && player.secret_word && (
                                                        <p className="text-xs font-mono text-[#A6B9FF]">
                                                            Kata rahasia: {player.secret_word}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 6 Rows x 5 Tiles Wordle Board */}
                                    <div className="flex flex-col items-center gap-1.5 my-2">
                                        {Array.from({ length: 6 }).map((_, rowIndex) => {
                                            const pastGuess = guesses[rowIndex];
                                            const isCurrentTypingRow = isMe && rowIndex === guesses.length && !isMyTurnFinished;

                                            return (
                                                <div
                                                    key={rowIndex}
                                                    className={`flex gap-1.5 ${
                                                        isCurrentTypingRow && shakeCurrentRow ? 'animate-shake' : ''
                                                    }`}
                                                >
                                                    {Array.from({ length: 5 }).map((_, colIndex) => {
                                                        let letter = '';
                                                        let tileColorClass = isDark
                                                            ? 'bg-[#091540] border-white/20 text-white'
                                                            : 'bg-white border-[#2E438F]/40 text-[#091540]';

                                                        if (pastGuess) {
                                                            letter = pastGuess.word?.[colIndex] || '';
                                                            const color = pastGuess.colors?.[colIndex];

                                                            if (color === 'green') {
                                                                tileColorClass = 'bg-emerald-600 border-emerald-400 text-white font-black shadow';
                                                            } else if (color === 'yellow') {
                                                                tileColorClass = 'bg-amber-500 border-amber-300 text-white font-black shadow';
                                                            } else {
                                                                tileColorClass = isDark
                                                                    ? 'bg-[#091540]/80 border-white/10 text-white/40'
                                                                    : 'bg-[#2E438F]/20 border-[#2E438F]/30 text-[#091540]/50';
                                                            }
                                                        } else if (isCurrentTypingRow) {
                                                            letter = currentGuess[colIndex] || '';
                                                            if (letter) {
                                                                tileColorClass = isDark
                                                                    ? 'bg-[#091540] border-[#A6B9FF] text-white font-black scale-105 transition-transform'
                                                                    : 'bg-white border-[#2E438F] text-[#091540] font-black scale-105 transition-transform';
                                                            }
                                                        }

                                                        // Sizing: slightly more compact on multi-board
                                                        const tileSize = totalPlayers > 1
                                                            ? 'w-8 h-8 md:w-11 md:h-11 text-sm md:text-base'
                                                            : 'w-11 h-11 md:w-14 md:h-14 text-base md:text-xl';

                                                        return (
                                                            <div
                                                                key={colIndex}
                                                                className={`${tileSize} rounded-lg border-2 flex items-center justify-center font-mono font-black uppercase select-none ${tileColorClass}`}
                                                            >
                                                                {letter}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* PRIVATE ON-SCREEN KEYBOARD (HANYA TAMPIL UNTUK DIRI SENDIRI) */}
                    {!isMyTurnFinished && status === 'playing' && myPlayerState && (
                        <div className={`p-3 md:p-4 rounded-2xl border-2 max-w-xl mx-auto shadow-lg ${panelBg}`}>
                            <div className="flex justify-between items-center mb-2 px-1">
                                <span className="text-[10px] font-mono uppercase tracking-widest opacity-75">
                                    ⌨️ Keyboard Sandi Kapten
                                </span>
                                <span className="text-[10px] font-mono font-bold text-[#A6B9FF]">
                                    Ketik di layar atau keyboard PC
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5 items-center">
                                {keyboardRows.map((row, rIdx) => (
                                    <div key={rIdx} className="flex gap-1 md:gap-1.5 w-full justify-center">
                                        {row.map((key) => {
                                            const isEnter = key === 'ENTER';
                                            const isBksp = key === '⌫';
                                            const widthClass = isEnter || isBksp
                                                ? 'px-2 md:px-3 flex-1 max-w-[65px]'
                                                : 'w-7 h-10 md:w-10 md:h-12 flex-1 max-w-[42px]';

                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => {
                                                        if (isEnter) handleSubmitGuess();
                                                        else if (isBksp) handleDeleteLetter();
                                                        else handleAddLetter(key);
                                                    }}
                                                    className={`${widthClass} h-10 md:h-12 rounded-lg border-2 flex items-center justify-center font-mono uppercase transition active:scale-95 select-none ${getVirtualKeyClass(
                                                        key
                                                    )}`}
                                                >
                                                    {key}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Surrender Confirmation Modal */}
            <Modal show={showSurrenderConfirm} onClose={() => setShowSurrenderConfirm(false)} maxWidth="sm">
                <div className={`p-6 ${isDark ? 'bg-[#091540] text-white' : 'bg-white text-[#091540]'}`}>
                    <h3 className="text-base font-black font-mono tracking-widest uppercase mb-3 text-red-400">
                        🏳️ Menyerah dari Pertandingan?
                    </h3>
                    <p className="text-xs opacity-80 mb-6">
                        Papan Anda akan ditandai dengan banner menyerah, namun kapten lain di kapal ini tetap dapat melanjutkan memecahkan sandi mereka.
                    </p>
                    <div className="flex justify-end gap-3 font-mono">
                        <button
                            onClick={() => setShowSurrenderConfirm(false)}
                            className="px-4 py-2 rounded-xl text-xs font-bold border border-current/30"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSurrender}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700"
                        >
                            Ya, Menyerah
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Finished Game Summary Modal */}
            <Modal show={showVictoryModal && status === 'finished'} onClose={() => setShowVictoryModal(false)} maxWidth="md">
                <div className={`p-6 border-2 rounded-2xl shadow-2xl ${
                    isDark ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                }`}>
                    <div className="text-center mb-6">
                        <span className="text-5xl block animate-bounce mb-2">🏆</span>
                        <h3 className={`text-lg font-black font-mono tracking-widest uppercase ${
                            isDark ? 'text-emerald-400' : 'text-emerald-700'
                        }`}>
                            Pertandingan Sandi Selesai!
                        </h3>
                        <p className={`text-xs font-mono mt-1 ${isDark ? 'text-white/80' : 'text-[#2E438F]'}`}>
                            Seluruh kapten telah menyelesaikan pelayaran memecahkan sandi Tortuga.
                        </p>
                    </div>

                    <div className="space-y-3 mb-6">
                        {allPlayersList
                            .sort((a, b) => {
                                if (a.solved && !b.solved) return -1;
                                if (!a.solved && b.solved) return 1;
                                return (a.finish_order || 99) - (b.finish_order || 99);
                            })
                            .map((p, idx) => {
                                let rowCardClass = '';
                                if (p.solved) {
                                    rowCardClass = isDark
                                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100'
                                        : 'bg-emerald-50 border-emerald-600 text-emerald-950';
                                } else if (p.surrendered) {
                                    rowCardClass = isDark
                                        ? 'bg-red-950/60 border-red-500 text-red-100'
                                        : 'bg-red-50 border-red-600 text-red-950';
                                } else {
                                    rowCardClass = isDark
                                        ? 'bg-[#2E438F]/30 border-white/20 text-white'
                                        : 'bg-[#A6B9FF]/20 border-[#2E438F]/40 text-[#091540]';
                                }

                                return (
                                    <div
                                        key={p.user_id}
                                        className={`p-3.5 rounded-xl border-2 flex items-center justify-between font-mono text-xs shadow-sm transition ${rowCardClass}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`font-black text-sm px-2 py-0.5 rounded-md ${
                                                isDark ? 'bg-white/10 text-white' : 'bg-[#2E438F]/15 text-[#091540]'
                                            }`}>
                                                #{idx + 1}
                                            </span>
                                            <div>
                                                <p className="font-bold text-sm">
                                                    {p.name || p.user?.name || 'Pirate'} {p.isMe && '(Anda)'}
                                                </p>
                                                <p className={`text-[11px] font-bold mt-0.5 ${
                                                    isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'
                                                }`}>
                                                    Kata Rahasia: <strong className="uppercase underline tracking-wider">{p.secret_word || '???'}</strong>
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            {p.solved ? (
                                                <span className={`font-black px-2.5 py-1 rounded-lg border text-xs ${
                                                    isDark 
                                                        ? 'bg-emerald-600 text-white border-emerald-400' 
                                                        : 'bg-emerald-600 text-white border-emerald-700'
                                                }`}>
                                                    ✓ {p.guesses?.length || 1}/6 Tebakan
                                                </span>
                                            ) : p.surrendered ? (
                                                <span className={`font-black px-2.5 py-1 rounded-lg border text-xs ${
                                                    isDark 
                                                        ? 'bg-red-700 text-white border-red-500' 
                                                        : 'bg-red-600 text-white border-red-700'
                                                }`}>
                                                    🏳️ Menyerah
                                                </span>
                                            ) : (
                                                <span className={`font-black px-2.5 py-1 rounded-lg border text-xs ${
                                                    isDark 
                                                        ? 'bg-gray-800 text-gray-200 border-gray-600' 
                                                        : 'bg-gray-200 text-gray-800 border-gray-400'
                                                }`}>
                                                    💀 Gagal
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>

                    <div className="flex justify-end gap-3 font-mono">
                        <Link
                            href={route('dashboard')}
                            className={`w-full text-center px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition shadow-md ${
                                isDark
                                    ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-white/30'
                                    : 'bg-[#2E438F] hover:bg-[#091540] text-white border-[#091540]'
                            }`}
                        >
                            ⚓ Kembali ke Tavern
                        </Link>
                    </div>
                </div>
            </Modal>

            {/* Voyage Rules Modal */}
            <Modal show={showRules} onClose={() => setShowRules(false)} maxWidth="md">
                <div className={`p-6 ${isDark ? 'bg-[#091540] text-white' : 'bg-white text-[#091540]'}`}>
                    <h3 className="text-lg font-black font-mono tracking-widest uppercase mb-4 border-b pb-3 border-current/20">
                        📜 Aturan Sandi Tortuga
                    </h3>
                    <div className="space-y-4 text-xs leading-relaxed">
                        <p>
                            Pecahkan 5 huruf sandi rahasia kapal bajak laut dalam 6 baris tebakan sesuai kosakata bahasa Indonesia sehari-hari!
                        </p>
                        <div className="space-y-2 font-mono">
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-600/20 border border-emerald-500">
                                <div className="w-6 h-6 rounded bg-emerald-600 text-white flex items-center justify-center font-bold">K</div>
                                <span><strong>HIJAU</strong>: Huruf tepat di posisi yang benar.</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/20 border border-amber-400">
                                <div className="w-6 h-6 rounded bg-amber-500 text-white flex items-center justify-center font-bold">A</div>
                                <span><strong>KUNING</strong>: Huruf ada di kata rahasia tapi beda posisi.</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-[#091540]/40 border border-white/20">
                                <div className="w-6 h-6 rounded bg-[#091540] text-white/50 border border-white/20 flex items-center justify-center font-bold">P</div>
                                <span><strong>NAVY / REDUP</strong>: Huruf tidak ada di dalam kata rahasia.</span>
                            </div>
                        </div>
                        <p>
                            Setiap kapten memiliki kata rahasianya masing-masing. Papan lawan tersinkronisasi secara real-time. Kapten yang paling cepat menebak kata rahasianya menjadi pemenangnya!
                        </p>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => setShowRules(false)}
                            className={`px-5 py-2 rounded-xl text-xs font-black font-mono uppercase border-2 ${
                                isDark ? 'bg-[#2E438F] text-white border-white/20' : 'bg-[#2E438F] text-white border-[#091540]'
                            }`}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
