import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import InviteFriendModal from '@/Components/InviteFriendModal';
import { useTheme } from '@/hooks/useTheme';

export default function GameRoom({
    game = {},
    gamePlayers = [],
    authUserId,
}) {
    const [theme] = useTheme();
    const isDark = theme === 'dark';

    const {
        uuid,
        status = 'waiting',
        board_state,
        creator_id,
        difficulty = 'normal',
        max_players = 4,
    } = game;

    // Room local states
    const [localBoardState, setLocalBoardState] = useState(board_state || null);
    const [selectedCell, setSelectedCell] = useState([0, 0]); // [row, col]
    const [showRules, setShowRules] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showDisbandModal, setShowDisbandModal] = useState(false);
    const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false);
    const [showVictoryModal, setShowVictoryModal] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isHost = creator_id === authUserId;
    const isSolo = max_players === 1;

    // Toast helper
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    // Polling interval
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
                            if (data.status === 'playing') {
                                setShowVictoryModal(false);
                            }
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

    // Keep board state synced
    useEffect(() => {
        if (board_state) {
            setLocalBoardState(board_state);
        }
    }, [board_state]);

    // Open victory modal when game finishes
    useEffect(() => {
        if (status === 'finished') {
            setShowVictoryModal(true);
        }
    }, [status]);

    // Board data extraction
    const playersMap = localBoardState?.players || {};
    const myPlayerState = playersMap[authUserId] || null;
    const initialBoard = localBoardState?.initial_board || Array(9).fill(Array(9).fill(0));
    const solutionBoard = localBoardState?.solution_board || Array(9).fill(Array(9).fill(0));
    const myCurrentBoard = myPlayerState?.current_board || initialBoard;

    // Rematch state
    const rematchVotes = localBoardState?.rematch_votes || [];
    const hasVotedRematch = rematchVotes.includes(authUserId);
    const rematchDeclined = localBoardState?.rematch_declined || false;
    const declinedBy = localBoardState?.declined_by || 'Seorang kapten';

    // Ready status
    const isMyReady = gamePlayers.find((gp) => gp.user_id === authUserId)?.is_ready || false;
    const allReady = gamePlayers.length > 0 && gamePlayers.every((p) => p.is_ready || p.user_id === creator_id);

    // List of all active players
    const allPlayersList = useMemo(() => {
        return gamePlayers.map((gp) => {
            const pState = playersMap[gp.user_id] || {};
            return {
                ...gp,
                ...pState,
                name: pState.name || gp.name || gp.user?.name || `Pirate #${gp.user_id}`,
                isMe: gp.user_id === authUserId,
            };
        });
    }, [gamePlayers, playersMap, authUserId]);

    // Fill / erase cell action
    const handleNumberInput = useCallback((num) => {
        if (status !== 'playing' || !selectedCell || myPlayerState?.solved || myPlayerState?.surrendered) {
            return;
        }

        const [r, c] = selectedCell;
        if (initialBoard[r][c] !== 0) {
            showToast('Angka petunjuk awal tidak bisa diubah!');
            return;
        }

        // Optimistic UI update
        const nextBoard = myCurrentBoard.map((rowArr, rowIdx) =>
            rowArr.map((cellVal, colIdx) => (rowIdx === r && colIdx === c ? num : cellVal))
        );

        setLocalBoardState((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                players: {
                    ...prev.players,
                    [authUserId]: {
                        ...prev.players[authUserId],
                        current_board: nextBoard,
                    },
                },
            };
        });

        // Send to backend
        router.post(
            route('games.sudoku.fill', uuid),
            { row: r, col: c, val: num },
            {
                preserveScroll: true,
                preserveState: true,
                onError: (err) => {
                    if (err?.action_error) showToast(err.action_error);
                },
            }
        );
    }, [status, selectedCell, myPlayerState, initialBoard, myCurrentBoard, uuid, authUserId]);

    // Keyboard event listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (showRules || showSurrenderConfirm || showInviteModal || showDisbandModal || showVictoryModal) {
                return;
            }

            const [r, c] = selectedCell;

            if (e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                handleNumberInput(parseInt(e.key));
            } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
                e.preventDefault();
                handleNumberInput(0);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedCell([Math.max(0, r - 1), c]);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedCell([Math.min(8, r + 1), c]);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setSelectedCell([r, Math.max(0, c - 1)]);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                setSelectedCell([r, Math.min(8, c + 1)]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        selectedCell,
        showRules,
        showSurrenderConfirm,
        showInviteModal,
        showDisbandModal,
        showVictoryModal,
        handleNumberInput,
    ]);

    // Ready toggle
    const handleToggleReady = () => {
        router.post(route('games.ready', uuid), {}, { preserveScroll: true });
    };

    // Start game
    const handleStartGame = () => {
        router.post(route('games.start', uuid));
    };

    // Surrender
    const handleSurrender = () => {
        router.post(route('games.surrender', uuid), {}, {
            preserveScroll: true,
            onSuccess: () => setShowSurrenderConfirm(false),
            onError: (err) => {
                if (err?.action_error) showToast(err.action_error);
            },
        });
    };

    // Rematch actions
    const handleRematch = () => {
        setIsSubmitting(true);
        router.post(route('games.rematch', uuid), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                if (isSolo) {
                    setShowVictoryModal(false);
                    showToast('⚓ Ronde baru dimulai! Papan teka-teki baru telah disiapkan.');
                } else {
                    showToast('🗳️ Suara rematch dikirim! Menunggu persetujuan seluruh kru...');
                }
            },
            onError: (err) => {
                setIsSubmitting(false);
                if (err?.action_error) showToast(err.action_error);
            },
        });
    };

    const handleDeclineRematch = () => {
        router.post(route('games.decline-rematch', uuid), {}, {
            onSuccess: () => router.visit(route('dashboard')),
        });
    };

    // Difficulty label & badge
    const difficultyInfo = useMemo(() => {
        const diff = (difficulty || 'normal').toLowerCase();
        switch (diff) {
            case 'easy':
                return { label: 'Mudah', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500' };
            case 'hard':
                return { label: 'Sulit', color: 'bg-amber-500/20 text-amber-400 border-amber-500' };
            case 'extreme':
                return { label: 'Ekstrem', color: 'bg-red-500/20 text-red-400 border-red-500' };
            default:
                return { label: 'Sedang', color: 'bg-blue-500/20 text-blue-400 border-blue-500' };
        }
    }, [difficulty]);

    // Theme styles
    const bgMain = isDark ? 'bg-[#091540] text-white' : 'bg-[#FFFFFF] text-[#091540]';
    const cardBg = isDark ? 'bg-[#091540] border-white/20' : 'bg-white border-[#2E438F]';
    const headerBg = isDark ? 'bg-[#091540] border-white/20' : 'bg-white border-[#2E438F]';

    // -------------------------------------------------------------
    // 1. WAITING / RECRUITING LOBBY
    // -------------------------------------------------------------
    if (status === 'waiting') {
        return (
            <AuthenticatedLayout>
                <Head title={`Sudoku Tortuga (${difficultyInfo.label}) - Lobby`} />
                <div className={`min-h-[calc(100vh-4rem)] p-4 md:p-8 ${bgMain}`}>
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Header Banner */}
                        <div className={`p-6 rounded-2xl border-2 flex flex-col md:flex-row justify-between items-center gap-4 ${headerBg}`}>
                            <div className="flex items-center gap-4">
                                <Link
                                    href={route('dashboard')}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase font-mono tracking-wider border-2 transition ${
                                        isDark
                                            ? 'bg-[#2E438F] hover:bg-[#A6B9FF] hover:text-[#091540] text-white border-white/20'
                                            : 'bg-[#A6B9FF]/30 hover:bg-[#2E438F] hover:text-white text-[#091540] border-[#2E438F]'
                                    }`}
                                >
                                    ⚓ Tavern
                                </Link>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-xl font-black font-mono tracking-wide">
                                            🧩 SUDOKU TORTUGA
                                        </h1>
                                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${difficultyInfo.color}`}>
                                            {difficultyInfo.label}
                                        </span>
                                    </div>
                                    <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>
                                        Room ID: <span className="font-bold">{uuid.substring(0, 8)}</span> • {isSolo ? 'Mode Solo' : `Multiplayer (${gamePlayers.length}/${max_players} Kapten)`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowRules(true)}
                                    className={`px-3 py-2 rounded-xl text-xs font-black uppercase font-mono border-2 transition ${
                                        isDark
                                            ? 'bg-[#091540] hover:bg-[#2E438F] text-white border-white/20'
                                            : 'bg-white hover:bg-[#A6B9FF]/30 text-[#091540] border-[#2E438F]'
                                    }`}
                                >
                                    📜 Aturan
                                </button>
                                {!isSolo && (
                                    <button
                                        onClick={() => setShowInviteModal(true)}
                                        className="px-4 py-2 rounded-xl text-xs font-black uppercase font-mono border-2 bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 transition"
                                    >
                                        ➕ Invite Kru
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Crew Slots */}
                        <div className={`p-6 rounded-2xl border-2 ${cardBg}`}>
                            <h2 className="text-sm font-black font-mono uppercase tracking-widest mb-4">
                                ⚓ Kru Kapal ({gamePlayers.length}/{max_players})
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {gamePlayers.map((player) => {
                                    const isMe = player.user_id === authUserId;
                                    const isPlayerHost = player.user_id === creator_id;
                                    const ready = player.is_ready || isPlayerHost;

                                    return (
                                        <div
                                            key={player.id}
                                            className={`p-4 rounded-xl border-2 flex items-center justify-between transition ${
                                                isMe
                                                    ? isDark
                                                        ? 'bg-[#2E438F]/40 border-[#A6B9FF]'
                                                        : 'bg-[#A6B9FF]/20 border-[#2E438F]'
                                                    : isDark
                                                    ? 'bg-[#091540] border-white/10'
                                                    : 'bg-slate-50 border-slate-200'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[#2E438F] text-white flex items-center justify-center font-black text-sm border-2 border-white/20">
                                                    {player.user?.name ? player.user.name[0].toUpperCase() : '🏴‍☠️'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold flex items-center gap-1.5">
                                                        <span>{player.user?.name || `Pirate #${player.user_id}`}</span>
                                                        {isMe && <span className="text-[10px] opacity-75">(Anda)</span>}
                                                        {isPlayerHost && <span className="text-[10px] text-amber-400">👑 Host</span>}
                                                    </p>
                                                    <p className="text-[10px] opacity-70 font-mono">
                                                        Index: #{player.player_index + 1}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <span
                                                    className={`px-3 py-1 rounded-lg text-xs font-black uppercase font-mono tracking-wider border ${
                                                        ready
                                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                                                            : 'bg-amber-500/20 text-amber-400 border-amber-500'
                                                    }`}
                                                >
                                                    {ready ? '✓ SIAP' : '⏳ BELUM'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {Array.from({ length: Math.max(0, max_players - gamePlayers.length) }).map((_, i) => (
                                    <div
                                        key={`empty-${i}`}
                                        className={`p-4 rounded-xl border-2 border-dashed flex items-center justify-center text-xs font-mono font-bold ${
                                            isDark ? 'border-white/20 text-white/40' : 'border-slate-300 text-slate-400'
                                        }`}
                                    >
                                        ⚓ Slot Kosong ({gamePlayers.length + i + 1})
                                    </div>
                                ))}
                            </div>

                            {/* Lobby Actions */}
                            <div className="mt-8 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-4 border-current/20">
                                {isHost ? (
                                    <button
                                        onClick={() => setShowDisbandModal(true)}
                                        className="text-xs font-mono font-bold text-red-400 hover:text-red-300 transition"
                                    >
                                        💥 Bubarkan Kapal
                                    </button>
                                ) : (
                                    <Link
                                        href={route('dashboard')}
                                        className="text-xs font-mono font-bold text-red-400 hover:text-red-300 transition"
                                    >
                                        ← Keluar dari Kapal
                                    </Link>
                                )}

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    {!isHost && !isSolo && (
                                        <button
                                            onClick={handleToggleReady}
                                            className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-xs font-black uppercase font-mono tracking-widest border-2 transition ${
                                                isMyReady
                                                    ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400'
                                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                                            }`}
                                        >
                                            {isMyReady ? 'Batalkan Siap' : '✓ Saya Siap!'}
                                        </button>
                                    )}

                                    {isHost && (
                                        <button
                                            onClick={handleStartGame}
                                            disabled={!allReady && !isSolo}
                                            className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-xs font-black uppercase font-mono tracking-widest border-2 transition shadow-lg ${
                                                allReady || isSolo
                                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 cursor-pointer scale-105'
                                                    : 'bg-slate-700 text-slate-400 border-slate-600 cursor-not-allowed opacity-60'
                                            }`}
                                        >
                                            🚀 Mulai Berlayar (Start)
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
                    gameType="Sudoku Tortuga"
                    isDark={isDark}
                />

                {/* Disband Modal */}
                <Modal show={showDisbandModal} onClose={() => setShowDisbandModal(false)} maxWidth="sm">
                    <div className={`p-6 ${isDark ? 'bg-[#091540] text-white' : 'bg-white text-[#091540]'}`}>
                        <h3 className="text-base font-bold font-mono uppercase mb-3">💥 Bubarkan Kapal?</h3>
                        <p className="text-xs mb-6 opacity-80 leading-relaxed">
                            Seluruh kru akan dikeluarkan dan ruangan Sudoku ini akan dihapus dari perairan Tortuga.
                        </p>
                        <div className="flex justify-end gap-3 font-mono">
                            <button
                                onClick={() => setShowDisbandModal(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-700 text-white"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => router.delete(route('games.destroy', uuid))}
                                className="px-4 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white"
                            >
                                Ya, Bubarkan
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Rules Modal */}
                <Modal show={showRules} onClose={() => setShowRules(false)} maxWidth="md">
                    <div className={`p-6 ${isDark ? 'bg-[#091540] text-white' : 'bg-white text-[#091540]'}`}>
                        <h3 className="text-lg font-black font-mono tracking-widest uppercase mb-4 border-b pb-3 border-current/20">
                            📜 Aturan Sudoku Tortuga
                        </h3>
                        <div className="space-y-4 text-xs leading-relaxed">
                            <p>
                                Pecahkan teka-teki angka 9x9 dengan mengisi angka 1 hingga 9 ke dalam setiap kotak kosong sesuai aturan klasik!
                            </p>
                            <div className="space-y-2 font-mono">
                                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                    <strong>1. Baris:</strong> Setiap baris horisontal harus memuat angka 1-9 tanpa ada yang kembar.
                                </div>
                                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                    <strong>2. Kolom:</strong> Setiap kolom vertikal harus memuat angka 1-9 tanpa ada yang kembar.
                                </div>
                                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                                    <strong>3. Kotak 3x3:</strong> Setiap blok kotak 3x3 harus memuat angka 1-9 secara lengkap.
                                </div>
                            </div>
                            <p className="opacity-80">
                                Dalam mode Multiplayer, Anda bertanding secara realtime melawan kapten lain. Kapten pertama yang berhasil menyelesaikan Sudoku 100% dengan benar menjadi pemenang!
                            </p>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowRules(false)}
                                className="px-5 py-2 rounded-xl text-xs font-black uppercase font-mono bg-[#2E438F] text-white"
                            >
                                Mengerti, Kapten!
                            </button>
                        </div>
                    </div>
                </Modal>
            </AuthenticatedLayout>
        );
    }

    // -------------------------------------------------------------
    // 2. IN-GAME ARENA (SOLO & MULTIPLAYER 2x2)
    // -------------------------------------------------------------
    const [selectedRow, selectedCol] = selectedCell;
    const selectedNum = myCurrentBoard[selectedRow]?.[selectedCol] || 0;

    return (
        <AuthenticatedLayout>
            <Head title={`Sudoku Tortuga (${difficultyInfo.label}) - Arena`} />
            <div className={`min-h-[calc(100vh-4rem)] p-3 md:p-6 ${bgMain}`}>
                <div className="max-w-7xl mx-auto space-y-4">
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
                                <div className="flex items-center gap-2">
                                    <h1 className="text-base md:text-lg font-black font-mono tracking-wide flex items-center gap-1.5">
                                        <span>🧩</span> SUDOKU TORTUGA
                                    </h1>
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${difficultyInfo.color}`}>
                                        {difficultyInfo.label}
                                    </span>
                                </div>
                                <p className={`text-[10px] font-mono ${isDark ? 'text-[#A6B9FF]' : 'text-[#2E438F]'}`}>
                                    {isSolo ? 'Mode Solo' : `Arena Duel (${allPlayersList.length} Kapten)`}
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
                            {status === 'finished' && (
                                <button
                                    onClick={() => setShowVictoryModal(true)}
                                    className="px-3 py-1.5 rounded-xl text-xs font-black uppercase font-mono border-2 bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 transition flex items-center gap-1 shadow-md animate-pulse"
                                >
                                    🏆 Hasil & Rematch
                                </button>
                            )}
                            {!myPlayerState?.solved && !myPlayerState?.surrendered && status === 'playing' && (
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

                    {/* ARENA CONTENT */}
                    <div className={isSolo ? 'max-w-xl mx-auto space-y-4' : 'grid grid-cols-1 lg:grid-cols-12 gap-6 items-start'}>
                        {/* MAIN PLAYER INTERACTIVE SUDOKU BOARD */}
                        <div className={isSolo ? 'w-full' : 'lg:col-span-7 xl:col-span-8'}>
                            <div className={`p-4 md:p-6 rounded-2xl border-2 ${cardBg} shadow-xl relative`}>
                                {/* Player Info & Stats Header */}
                                <div className="flex justify-between items-center mb-4 pb-3 border-b border-current/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-[#2E438F] text-white flex items-center justify-center font-black text-sm border-2 border-white/20">
                                            {myPlayerState?.name ? myPlayerState.name[0].toUpperCase() : '⚓'}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm font-mono flex items-center gap-1.5">
                                                {myPlayerState?.name || 'Kapten'} (Papan Anda)
                                            </p>
                                            <p className="text-[11px] font-mono opacity-80">
                                                💀 Kesalahan: <strong className="text-red-400">{myPlayerState?.mistakes_count || 0}</strong>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right font-mono">
                                        <span className="text-xs font-black uppercase text-emerald-400">
                                            Progress: {myPlayerState?.progress || 0}%
                                        </span>
                                        <div className="w-28 h-2 rounded-full bg-slate-700 overflow-hidden mt-1 border border-white/20">
                                            <div
                                                className="h-full bg-emerald-500 transition-all duration-300"
                                                style={{ width: `${myPlayerState?.progress || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Solved / Surrendered Overlay */}
                                {(myPlayerState?.solved || myPlayerState?.surrendered) && (
                                    <div className="absolute inset-x-4 top-20 bottom-4 z-20 rounded-2xl bg-[#091540]/90 backdrop-blur-sm border-2 border-white/30 flex flex-col items-center justify-center p-6 text-center text-white">
                                        {myPlayerState.solved ? (
                                            <div className="space-y-3">
                                                <span className="text-5xl block animate-bounce">🏆</span>
                                                <h3 className="text-lg font-black font-mono uppercase text-emerald-400">
                                                    SUDOKU SELESAI DIPECAHKAN!
                                                </h3>
                                                <p className="text-xs font-mono text-white/80">
                                                    Selamat Kapten! Anda berhasil menaklukkan teka-teki Sudoku ini (Juara #{myPlayerState.finish_order || 1}).
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <span className="text-5xl block">🏳️</span>
                                                <h3 className="text-lg font-black font-mono uppercase text-red-400">
                                                    KAPTEN MENYERAH
                                                </h3>
                                                <p className="text-xs font-mono text-white/80">
                                                    Anda telah mengibarkan bendera putih.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 9x9 Sudoku Board Grid */}
                                <div
                                    className={`aspect-square w-full max-w-[430px] mx-auto border-4 rounded-2xl overflow-hidden shadow-2xl select-none transition-all ${
                                        isDark
                                            ? 'border-slate-700 bg-[#0f172a]'
                                            : 'border-[#2E438F] bg-slate-100'
                                    }`}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(9, minmax(0, 1fr))',
                                        gridTemplateRows: 'repeat(9, minmax(0, 1fr))',
                                    }}
                                >
                                    {myCurrentBoard.map((rowArr, r) =>
                                        rowArr.map((cellVal, c) => {
                                            const isInitial = initialBoard[r][c] !== 0;
                                            const isSelected = selectedRow === r && selectedCol === c;
                                            const isSameRowOrCol = selectedRow === r || selectedCol === c;
                                            const isSameBox =
                                                Math.floor(selectedRow / 3) === Math.floor(r / 3) &&
                                                Math.floor(selectedCol / 3) === Math.floor(c / 3);
                                            const isSameNumber = selectedNum !== 0 && cellVal === selectedNum;

                                            // Thick borders between 3x3 blocks
                                            const borderRight =
                                                (c + 1) % 3 === 0 && c !== 8
                                                    ? isDark
                                                        ? 'border-r-2 border-r-indigo-400/60'
                                                        : 'border-r-2 border-r-[#2E438F]'
                                                    : isDark
                                                    ? 'border-r border-r-slate-700/60'
                                                    : 'border-r border-r-slate-300/80';

                                            const borderBottom =
                                                (r + 1) % 3 === 0 && r !== 8
                                                    ? isDark
                                                        ? 'border-b-2 border-b-indigo-400/60'
                                                        : 'border-b-2 border-b-[#2E438F]'
                                                    : isDark
                                                    ? 'border-b border-b-slate-700/60'
                                                    : 'border-b border-b-slate-300/80';

                                            let cellBg = isDark ? 'bg-[#131d35]' : 'bg-white';
                                            if (isSelected) {
                                                cellBg = 'bg-blue-600 text-white ring-2 ring-amber-400 z-10 shadow-lg';
                                            } else if (isSameNumber) {
                                                cellBg = isDark
                                                    ? 'bg-amber-400/20 text-amber-300 font-black'
                                                    : 'bg-amber-100 text-amber-900 font-black';
                                            } else if (isSameRowOrCol || isSameBox) {
                                                cellBg = isDark ? 'bg-[#1a2646]' : 'bg-blue-50/70';
                                            }

                                            return (
                                                <button
                                                    key={`${r}-${c}`}
                                                    type="button"
                                                    onClick={() => setSelectedCell([r, c])}
                                                    className={`w-full h-full p-0 m-0 flex items-center justify-center font-mono font-black text-sm sm:text-base md:text-xl select-none transition-colors ${borderRight} ${borderBottom} ${cellBg} ${
                                                        isInitial
                                                            ? isDark
                                                                ? 'text-white'
                                                                : 'text-[#091540]'
                                                            : cellVal !== 0
                                                            ? isDark
                                                                ? 'text-cyan-400 font-bold'
                                                                : 'text-blue-600 font-bold'
                                                            : ''
                                                    }`}
                                                >
                                                    {cellVal !== 0 ? cellVal : ''}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Virtual Keypad Controls */}
                                <div className="mt-6 space-y-2.5 max-w-[430px] mx-auto">
                                    <div
                                        className="gap-1.5 font-mono"
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(9, minmax(0, 1fr))',
                                        }}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => handleNumberInput(num)}
                                                className={`py-3 rounded-xl text-base font-black border-2 transition-all active:scale-95 shadow flex items-center justify-center ${
                                                    isDark
                                                        ? 'bg-slate-800 hover:bg-blue-600 text-white border-slate-600 hover:border-blue-400 shadow-slate-900/50'
                                                        : 'bg-white hover:bg-[#2E438F] hover:text-white text-[#091540] border-[#2E438F]'
                                                }`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 font-mono">
                                        <button
                                            type="button"
                                            onClick={() => handleNumberInput(0)}
                                            className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow ${
                                                isDark
                                                    ? 'bg-red-950/40 hover:bg-red-900/70 text-red-200 border-red-500/40'
                                                    : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-300'
                                            }`}
                                        >
                                            <span>⌫</span> Hapus Angka
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* OPPONENT CAPTAINS' MINI BOARDS (MULTIPLAYER 2x2) */}
                        {!isSolo && (
                            <div className="lg:col-span-5 xl:col-span-4 space-y-4">
                                <h3 className="text-xs font-black font-mono uppercase tracking-widest px-1 text-current/80">
                                    ⚔️ Papan Armada Lawan
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                                    {allPlayersList
                                        .filter((p) => !p.isMe)
                                        .map((opp) => {
                                            const oppBoard = opp.current_board || initialBoard;
                                            const oppSolved = opp.solved;
                                            const oppSurrendered = opp.surrendered;

                                            return (
                                                <div
                                                    key={opp.user_id}
                                                    className={`p-4 rounded-2xl border-2 relative transition ${
                                                        isDark ? 'bg-[#091540] border-white/20' : 'bg-white border-[#2E438F]'
                                                    }`}
                                                >
                                                    {/* Opponent Header */}
                                                    <div className="flex justify-between items-center mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-lg bg-[#2E438F] text-white flex items-center justify-center font-bold text-xs">
                                                                {opp.name ? opp.name[0].toUpperCase() : '🏴‍☠️'}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold font-mono">
                                                                    {opp.name}
                                                                </p>
                                                                <p className="text-[10px] font-mono text-red-400">
                                                                    💀 {opp.mistakes_count || 0} Error
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <span className="text-[11px] font-black font-mono text-emerald-400">
                                                                {opp.progress || 0}%
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Opponent Status Overlay */}
                                                    {(oppSolved || oppSurrendered) && (
                                                        <div className="absolute inset-x-2 top-14 bottom-2 z-10 rounded-xl bg-[#091540]/85 backdrop-blur-sm border border-white/20 flex flex-col items-center justify-center p-2 text-center text-white">
                                                            {oppSolved ? (
                                                                <div>
                                                                    <span className="text-2xl block animate-bounce">🏆</span>
                                                                    <p className="text-xs font-black font-mono text-emerald-400 uppercase">
                                                                        SELESAI #{opp.finish_order || 1}
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <span className="text-2xl block">🏳️</span>
                                                                    <p className="text-xs font-black font-mono text-red-400 uppercase">
                                                                        MENYERAH
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Opponent Mini 9x9 Grid */}
                                                    <div
                                                        className="aspect-square w-full max-w-[200px] mx-auto border-2 border-[#2E438F] rounded-lg overflow-hidden bg-black/10 select-none"
                                                        style={{
                                                            display: 'grid',
                                                            gridTemplateColumns: 'repeat(9, minmax(0, 1fr))',
                                                            gridTemplateRows: 'repeat(9, minmax(0, 1fr))',
                                                        }}
                                                    >
                                                        {oppBoard.map((rArr, r) =>
                                                            rArr.map((val, c) => {
                                                                const isInit = initialBoard[r][c] !== 0;
                                                                const bRight = (c + 1) % 3 === 0 && c !== 8 ? 'border-r border-r-[#2E438F]' : '';
                                                                const bBottom = (r + 1) % 3 === 0 && r !== 8 ? 'border-b border-b-[#2E438F]' : '';

                                                                return (
                                                                    <div
                                                                        key={`opp-${r}-${c}`}
                                                                        className={`w-full h-full flex items-center justify-center font-mono text-[9px] ${bRight} ${bBottom} ${
                                                                            isInit
                                                                                ? 'bg-current/10 font-bold'
                                                                                : val !== 0
                                                                                ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                                                                                : ''
                                                                        }`}
                                                                    >
                                                                        {val !== 0 ? val : ''}
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Surrender Confirmation Modal */}
            <Modal show={showSurrenderConfirm} onClose={() => setShowSurrenderConfirm(false)} maxWidth="sm">
                <div className={`p-6 ${isDark ? 'bg-[#091540] text-white' : 'bg-white text-[#091540]'}`}>
                    <h3 className="text-base font-black font-mono uppercase mb-3 text-red-400">
                        🏳️ Kibarkan Bendera Putih?
                    </h3>
                    <p className="text-xs mb-6 opacity-80 leading-relaxed font-mono">
                        Apakah Anda yakin ingin menyerah dari pertandingan Sudoku ini?
                    </p>
                    <div className="flex justify-end gap-3 font-mono">
                        <button
                            onClick={() => setShowSurrenderConfirm(false)}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-700 text-white"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSurrender}
                            className="px-4 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white"
                        >
                            Ya, Saya Menyerah
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Finished Game Summary Modal (Podium & Rematch) */}
            <Modal show={showVictoryModal && status === 'finished'} onClose={() => setShowVictoryModal(false)} maxWidth="md">
                <div className={`p-6 border-2 rounded-2xl shadow-2xl ${
                    isDark ? 'bg-[#091540] border-white/20 text-white' : 'bg-white border-[#2E438F] text-[#091540]'
                }`}>
                    <div className="text-center mb-6">
                        <span className="text-5xl block animate-bounce mb-2">🏆</span>
                        <h3 className={`text-lg font-black font-mono tracking-widest uppercase ${
                            isDark ? 'text-emerald-400' : 'text-emerald-700'
                        }`}>
                            Pertandingan Sudoku Selesai!
                        </h3>
                        <p className={`text-xs font-mono mt-1 ${isDark ? 'text-white/80' : 'text-[#2E438F]'}`}>
                            Teka-teki Sudoku Tortuga ({difficultyInfo.label}) telah dituntaskan!
                        </p>
                    </div>

                    {/* Rankings List */}
                    <div className="space-y-3 mb-6">
                        {allPlayersList
                            .sort((a, b) => {
                                if (a.solved && !b.solved) return -1;
                                if (!a.solved && b.solved) return 1;
                                if (a.solved && b.solved) {
                                    return (a.finish_order || 99) - (b.finish_order || 99);
                                }
                                return (b.progress || 0) - (a.progress || 0);
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
                                                    Progress: <strong>{p.progress || 0}%</strong> • Error: <strong>{p.mistakes_count || 0}</strong>
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
                                                    ✓ Selesai #{p.finish_order || 1}
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
                                                    {p.progress || 0}% Selesai
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>

                    {rematchDeclined && (
                        <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500 text-red-300 font-mono text-xs text-center animate-pulse">
                            ⚠️ Kapten <strong>{declinedBy}</strong> telah meninggalkan kapal. Rematch dibatalkan.
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-end gap-3 font-mono">
                        <button
                            type="button"
                            onClick={handleDeclineRematch}
                            className={`flex-1 text-center px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition shadow-md ${
                                isDark
                                    ? 'bg-red-950/40 hover:bg-red-900/60 text-red-200 border-red-500/40'
                                    : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-300'
                            }`}
                        >
                            ⚓ Kembali ke Tavern
                        </button>

                        {!rematchDeclined && (
                            <button
                                type="button"
                                disabled={isSubmitting || (hasVotedRematch && !isSolo)}
                                onClick={handleRematch}
                                className={`flex-1 text-center px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition shadow-md flex items-center justify-center gap-2 ${
                                    hasVotedRematch && !isSolo
                                        ? 'bg-amber-600/30 text-amber-300 border-amber-500/50 cursor-not-allowed animate-pulse'
                                        : isDark
                                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-800'
                                }`}
                            >
                                {isSolo ? (
                                    <span>🔄 Main Lagi (Papan Baru)</span>
                                ) : hasVotedRematch ? (
                                    <span>⏳ Menunggu Kru... ({rematchVotes.length}/{allPlayersList.length})</span>
                                ) : (
                                    <span>🔄 Setuju Rematch ({rematchVotes.length}/{allPlayersList.length})</span>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
