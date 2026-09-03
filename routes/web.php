<?php

use App\Http\Controllers\FriendController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth'])->group(function () {
    // Lobby, Deck, Crew
    Route::get('/lobby', [GameController::class, 'index'])->name('lobby');
    Route::get('/dashboard', [GameController::class, 'index'])->name('dashboard');
    Route::get('/deck', [GameController::class, 'indexDeck'])->name('deck');
    Route::get('/crew', [GameController::class, 'indexCrew'])->name('crew');

    // Game Room lifecycle
    Route::post('/games', [GameController::class, 'create'])->name('games.create');
    Route::get('/games/{uuid}', [GameController::class, 'show'])->name('games.show');
    Route::post('/games/{uuid}/join', [GameController::class, 'join'])->name('games.join');
    Route::post('/games/{uuid}/start', [GameController::class, 'start'])->name('games.start');
    Route::post('/games/{uuid}/kick', [GameController::class, 'kick'])->name('games.kick');
    Route::post('/games/{uuid}/ready', [GameController::class, 'ready'])->name('games.ready');
    Route::delete('/games/{uuid}', [GameController::class, 'destroy'])->name('games.destroy');

    // Game Actions
    Route::post('/games/{uuid}/take-tokens', [GameController::class, 'takeTokens'])->name('games.take-tokens');
    Route::post('/games/{uuid}/reserve-card', [GameController::class, 'reserveCard'])->name('games.reserve-card');
    Route::post('/games/{uuid}/buy-card', [GameController::class, 'buyCard'])->name('games.buy-card');
    Route::post('/games/{uuid}/surrender', [GameController::class, 'surrender'])->name('games.surrender');
    Route::post('/games/{uuid}/roll-die', [GameController::class, 'rollDie'])->name('games.roll-die');
    Route::post('/games/{uuid}/guess', [GameController::class, 'submitGuess'])->name('games.guess');

    // Poll State
    Route::get('/games/{uuid}/state', [GameController::class, 'state'])->name('games.state');
    Route::get('/games/{uuid}/check', [GameController::class, 'check'])->name('games.check');

    // Friends and Social relations
    Route::get('/friends', [FriendController::class, 'index'])->name('friends.index');
    Route::post('/friends/request', [FriendController::class, 'sendRequest'])->name('friends.request');
    Route::post('/friends/{id}/accept', [FriendController::class, 'acceptRequest'])->name('friends.accept');
    Route::post('/friends/{id}/decline', [FriendController::class, 'declineRequest'])->name('friends.decline');

    // Direct Chat Messaging
    Route::get('/friends/chat/{friendId}', [FriendController::class, 'messages'])->name('friends.messages');
    Route::post('/friends/chat/{friendId}/send', [FriendController::class, 'sendMessage'])->name('friends.send');

    // Profile Settings
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
