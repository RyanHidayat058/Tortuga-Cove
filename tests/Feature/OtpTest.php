<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OtpTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_creates_user_with_otp_and_redirects(): void
    {
        $response = $this->post('/register', [
            'name' => 'Pirate Jack',
            'username' => 'piratejack',
            'hashtag' => 'JACK',
            'email' => 'jack@pirates.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ]);

        $response->assertRedirect('/verify-otp');
        $this->assertDatabaseHas('users', [
            'name' => 'Pirate Jack',
            'email' => 'jack@pirates.com',
            'is_otp_verified' => false,
        ]);

        $user = User::where('email', 'jack@pirates.com')->first();
        $this->assertNotNull($user->otp_code);
        $this->assertNotNull($user->otp_expires_at);
    }

    public function test_unverified_user_is_redirected_to_otp_screen(): void
    {
        $user = User::factory()->create([
            'is_otp_verified' => false,
        ]);

        $response = $this->actingAs($user)->get('/lobby');

        $response->assertRedirect('/verify-otp');
    }

    public function test_verified_user_can_access_lobby(): void
    {
        $user = User::factory()->create([
            'is_otp_verified' => true,
        ]);

        $response = $this->actingAs($user)->get('/lobby');

        $response->assertStatus(200);
    }

    public function test_user_can_verify_otp_and_unlock_session(): void
    {
        $user = User::factory()->create([
            'otp_code' => '123456',
            'otp_expires_at' => now()->addMinutes(10),
            'is_otp_verified' => false,
        ]);

        $response = $this->actingAs($user)->post('/verify-otp', [
            'code' => '123456',
        ]);

        $response->assertRedirect('/lobby');
        $user->refresh();
        $this->assertTrue($user->is_otp_verified);
        $this->assertNull($user->otp_code);
    }

    public function test_invalid_otp_fails_verification(): void
    {
        $user = User::factory()->create([
            'otp_code' => '123456',
            'otp_expires_at' => now()->addMinutes(10),
            'is_otp_verified' => false,
        ]);

        $response = $this->actingAs($user)->post('/verify-otp', [
            'code' => '000000',
        ]);

        $response->assertSessionHasErrors('code');
        $user->refresh();
        $this->assertFalse($user->is_otp_verified);
    }
}
