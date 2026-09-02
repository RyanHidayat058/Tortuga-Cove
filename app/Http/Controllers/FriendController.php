<?php

namespace App\Http\Controllers;

use App\Models\FriendMessage;
use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\JsonResponse;

class FriendController extends Controller
{
    /**
     * Get list of friends and pending requests.
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();

        // 1. Get accepted friends
        $friendsList = $user->friends->map(function ($friend) use ($user) {
            $unreadCount = FriendMessage::where('sender_id', $friend->id)
                ->where('receiver_id', $user->id)
                ->where('is_read', false)
                ->count();

            return [
                'id' => $friend->id,
                'name' => $friend->name,
                'email' => $friend->email,
                'is_online' => $friend->is_online,
                'activity_status' => $friend->activity_status,
                'unread_count' => $unreadCount,
            ];
        })->toArray();

        // 2. Pending Incoming requests (sent to user)
        $incomingRequests = Friendship::where('friend_id', $user->id)
            ->where('status', 'pending')
            ->with('user')
            ->get()
            ->map(function ($friendship) {
                return [
                    'friendship_id' => $friendship->id,
                    'user_id' => $friendship->user->id,
                    'name' => $friendship->user->name,
                    'email' => $friendship->user->email,
                ];
            })->toArray();

        // 3. Pending Outgoing requests (sent by user)
        $outgoingRequests = Friendship::where('user_id', $user->id)
            ->where('status', 'pending')
            ->with('friend')
            ->get()
            ->map(function ($friendship) {
                return [
                    'friendship_id' => $friendship->id,
                    'user_id' => $friendship->friend->id,
                    'name' => $friendship->friend->name,
                    'email' => $friendship->friend->email,
                ];
            })->toArray();

        return response()->json([
            'friends' => $friendsList,
            'incoming' => $incomingRequests,
            'outgoing' => $outgoingRequests,
        ]);
    }

    /**
     * Send a friend request.
     */
    public function sendRequest(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|string',
        ]);

        $user = Auth::user();

        $input = $request->email;
        if (strpos($input, '#') === false) {
            return response()->json(['error' => 'Please provide both Username and Hashtag (e.g. Duke#PMPL).'], 400);
        }

        [$username, $hashtag] = explode('#', $input);

        $friend = User::where('username', $username)->where('hashtag', $hashtag)->first();

        if (! $friend) {
            return response()->json(['error' => 'No pirate found with that name and hashtag.'], 404);
        }

        if ($user->id === $friend->id) {
            return response()->json(['error' => 'Ye cannot add yerself as a crewmate, matey!'], 400);
        }

        // Check existing friendships in any direction
        $existing = Friendship::where(function ($query) use ($user, $friend) {
            $query->where('user_id', $user->id)->where('friend_id', $friend->id);
        })->orWhere(function ($query) use ($user, $friend) {
            $query->where('user_id', $friend->id)->where('friend_id', $user->id);
        })->first();

        if ($existing) {
            if ($existing->status === 'accepted') {
                return response()->json(['error' => 'Ye are already crewmates!'], 400);
            }
            if ($existing->status === 'pending') {
                return response()->json(['error' => 'A pending friend request already exists between you.'], 400);
            }

            return response()->json(['error' => 'Blocked relation exists.'], 400);
        }

        // Create pending request
        Friendship::create([
            'user_id' => $user->id,
            'friend_id' => $friend->id,
            'status' => 'pending',
        ]);

        return response()->json(['success' => 'Friend request sent successfully!']);
    }

    /**
     * Accept a pending friend request.
     */
    public function acceptRequest(int $friendshipId): JsonResponse
    {
        $user = Auth::user();
        $friendship = Friendship::where('id', $friendshipId)
            ->where('friend_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (! $friendship) {
            return response()->json(['error' => 'Pending friendship request not found.'], 404);
        }

        $friendship->forceFill(['status' => 'accepted'])->save();

        return response()->json(['success' => 'Friend request accepted!']);
    }

    /**
     * Decline or remove a friendship.
     */
    public function declineRequest(int $friendshipId): JsonResponse
    {
        $user = Auth::user();

        $friendship = Friendship::where('id', $friendshipId)
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)->orWhere('friend_id', $user->id);
            })->first();

        if (! $friendship) {
            return response()->json(['error' => 'Friendship relation not found.'], 404);
        }

        $friendship->delete();

        return response()->json(['success' => 'Friendship relation removed.']);
    }

    /**
     * Load message history with a friend.
     */
    public function messages(int $friendId): JsonResponse
    {
        $user = Auth::user();

        // Verify they are accepted friends
        $isFriend = Friendship::where('status', 'accepted')
            ->where(function ($query) use ($user, $friendId) {
                $query->where('user_id', $user->id)->where('friend_id', $friendId);
            })->orWhere(function ($query) use ($user, $friendId) {
                $query->where('user_id', $friendId)->where('friend_id', $user->id);
            })->exists();

        if (! $isFriend) {
            return response()->json(['error' => 'Ye are not crewmates with this pirate.'], 403);
        }

        // Get messages
        $messages = FriendMessage::where(function ($query) use ($user, $friendId) {
            $query->where('sender_id', $user->id)->where('receiver_id', $friendId);
        })->orWhere(function ($query) use ($user, $friendId) {
            $query->where('sender_id', $friendId)->where('receiver_id', $user->id);
        })
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($msg) {
                return [
                    'id' => $msg->id,
                    'sender_id' => $msg->sender_id,
                    'receiver_id' => $msg->receiver_id,
                    'message' => $msg->message,
                    'is_read' => $msg->is_read,
                    'time' => $msg->created_at->format('H:i'),
                    'date' => $msg->created_at->format('M d, Y'),
                ];
            })->toArray();

        // Mark incoming messages as read
        FriendMessage::where('sender_id', $friendId)
            ->where('receiver_id', $user->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'messages' => $messages,
        ]);
    }

    /**
     * Send a direct message.
     */
    public function sendMessage(Request $request, int $friendId): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $user = Auth::user();

        // Verify they are accepted friends
        $isFriend = Friendship::where('status', 'accepted')
            ->where(function ($query) use ($user, $friendId) {
                $query->where('user_id', $user->id)->where('friend_id', $friendId);
            })->orWhere(function ($query) use ($user, $friendId) {
                $query->where('user_id', $friendId)->where('friend_id', $user->id);
            })->exists();

        if (! $isFriend) {
            return response()->json(['error' => 'Ye are not crewmates with this pirate.'], 403);
        }

        $msg = FriendMessage::create([
            'sender_id' => $user->id,
            'receiver_id' => $friendId,
            'message' => $request->message,
            'is_read' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => [
                'id' => $msg->id,
                'sender_id' => $msg->sender_id,
                'receiver_id' => $msg->receiver_id,
                'message' => $msg->message,
                'is_read' => $msg->is_read,
                'time' => $msg->created_at->format('H:i'),
                'date' => $msg->created_at->format('M d, Y'),
            ],
        ]);
    }
}
