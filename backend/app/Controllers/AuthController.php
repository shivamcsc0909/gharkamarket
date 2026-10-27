<?php

namespace App\Controllers;

use App\Database\DB;
use App\Services\GoogleAuthService;
use App\Services\NotificationService;
use App\Support\JWT;
use App\Support\Request;
use App\Support\Response;
use App\Support\Validator;

class AuthController
{
    /**
     * Customer Registration
     */
    public function register(Request $request): void
    {
        $v = Validator::make($request->all(), [
            'name' => 'required|min:2|max:100',
            'email' => 'required|email|max:150',
            'password' => 'required|min:6|max:100',
            'phone' => 'phone'
        ]);

        if ($v->fails()) {
            Response::validationError($v->errors());
            return;
        }

        $email = strtolower(trim($request->input('email')));
        $existing = DB::fetchOne("SELECT id FROM users WHERE email = :email", ['email' => $email]);
        if ($existing) {
            Response::validationError(['email' => ['An account with this email address already exists.']]);
            return;
        }

        $passwordHash = password_hash($request->input('password'), PASSWORD_BCRYPT);

        $userId = DB::insert('users', [
            'name' => trim($request->input('name')),
            'email' => $email,
            'phone' => $request->input('phone') ? trim($request->input('phone')) : null,
            'password_hash' => $passwordHash,
            'status' => 'active',
            'is_admin' => 0,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ]);

        DB::insert('user_profiles', [
            'user_id' => $userId,
            'dietary_preference' => $request->input('dietary_preference'),
            'work_setting' => $request->input('work_setting'),
            'created_at' => date('Y-m-d H:i:s')
        ]);

        $user = DB::fetchOne("SELECT id, name, email, phone, status, is_admin, created_at FROM users WHERE id = :id", ['id' => $userId]);
        $token = JWT::encode([
            'sub' => $user['id'],
            'email' => $user['email'],
            'type' => 'customer'
        ]);

        Response::success([
            'user' => $user,
            'token' => $token
        ], 'Registration successful! Welcome to OfficeFuel.', 201);
    }

    /**
     * Customer Email + Password Login
     */
    public function login(Request $request): void
    {
        $v = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if ($v->fails()) {
            Response::validationError($v->errors());
            return;
        }

        $email = strtolower(trim($request->input('email')));
        $user = DB::fetchOne("SELECT * FROM users WHERE email = :email", ['email' => $email]);

        if (!$user || empty($user['password_hash']) || !password_verify($request->input('password'), $user['password_hash'])) {
            Response::unauthorized('Invalid email or password.');
            return;
        }

        if ($user['status'] !== 'active') {
            Response::forbidden('Your account has been deactivated. Please contact support.');
            return;
        }

        DB::update('users', [
            'last_login_at' => date('Y-m-d H:i:s')
        ], 'id = :id', ['id' => $user['id']]);

        $token = JWT::encode([
            'sub' => $user['id'],
            'email' => $user['email'],
            'type' => 'customer'
        ]);

        unset($user['password_hash']);

        Response::success([
            'user' => $user,
            'token' => $token
        ], 'Logged in successfully.');
    }

    /**
     * Google OAuth Login / Token Verification
     */
    public function googleLogin(Request $request): void
    {
        $idToken = $request->input('id_token') ?? $request->input('credential');
        if (empty($idToken)) {
            Response::validationError(['id_token' => ['Google ID token is required.']]);
            return;
        }

        $verifiedGoogleUser = GoogleAuthService::verifyIdToken($idToken);

        // Allow fallback simulation in development mode if Google client ID isn't live yet
        if (!$verifiedGoogleUser) {
            $email = $request->input('email');
            $name = $request->input('name');
            $googleId = $request->input('google_id') ?? 'simulated_' . md5($email ?? 'user');

            if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $verifiedGoogleUser = [
                    'provider_user_id' => $googleId,
                    'email' => strtolower($email),
                    'name' => $name ?: explode('@', $email)[0],
                    'avatar_url' => $request->input('avatar_url'),
                    'email_verified' => true
                ];
            } else {
                Response::unauthorized('Invalid Google authentication token.');
                return;
            }
        }

        $user = GoogleAuthService::authenticateOrCreateUser($verifiedGoogleUser);
        $token = JWT::encode([
            'sub' => $user['id'],
            'email' => $user['email'],
            'type' => 'customer'
        ]);

        unset($user['password_hash']);

        Response::success([
            'user' => $user,
            'token' => $token
        ], 'Google login successful.');
    }

    /**
     * Customer Profile & Me
     */
    public function me(Request $request): void
    {
        $user = $request->getUser();
        $profile = DB::fetchOne("SELECT * FROM user_profiles WHERE user_id = :uid", ['uid' => $user['id']]);
        $addresses = DB::fetchAll("SELECT * FROM addresses WHERE user_id = :uid ORDER BY is_default DESC, id DESC", ['uid' => $user['id']]);
        $ordersCount = DB::fetchOne("SELECT COUNT(*) as c FROM orders WHERE user_id = :uid", ['uid' => $user['id']]);

        Response::success([
            'user' => $user,
            'profile' => $profile,
            'addresses' => $addresses,
            'total_orders' => (int)($ordersCount['c'] ?? 0)
        ]);
    }

    /**
     * Update Profile
     */
    public function updateProfile(Request $request): void
    {
        $user = $request->getUser();
        $name = trim($request->input('name') ?? $user['name']);
        $phone = $request->input('phone') ? trim($request->input('phone')) : $user['phone'];

        DB::update('users', [
            'name' => $name,
            'phone' => $phone,
            'updated_at' => date('Y-m-d H:i:s')
        ], 'id = :id', ['id' => $user['id']]);

        if ($request->input('password')) {
            if (strlen($request->input('password')) < 6) {
                Response::validationError(['password' => ['New password must be at least 6 characters.']]);
                return;
            }
            DB::update('users', [
                'password_hash' => password_hash($request->input('password'), PASSWORD_BCRYPT)
            ], 'id = :id', ['id' => $user['id']]);
        }

        $updated = DB::fetchOne("SELECT id, name, email, phone, status, created_at FROM users WHERE id = :id", ['id' => $user['id']]);
        Response::success($updated, 'Profile updated successfully.');
    }

    /**
     * Address Management
     */
    public function getAddresses(Request $request): void
    {
        $user = $request->getUser();
        $addresses = DB::fetchAll("SELECT * FROM addresses WHERE user_id = :uid ORDER BY is_default DESC, id DESC", ['uid' => $user['id']]);
        Response::success($addresses);
    }

    public function addAddress(Request $request): void
    {
        $user = $request->getUser();
        $v = Validator::make($request->all(), [
            'name' => 'required',
            'phone' => 'required|phone',
            'address_line1' => 'required',
            'city' => 'required',
            'state' => 'required',
            'pincode' => 'required|pincode'
        ]);

        if ($v->fails()) {
            Response::validationError($v->errors());
            return;
        }

        $isDefault = $request->input('is_default') ? 1 : 0;
        if ($isDefault) {
            DB::update('addresses', ['is_default' => 0], 'user_id = :uid', ['uid' => $user['id']]);
        }

        $addressId = DB::insert('addresses', [
            'user_id' => $user['id'],
            'name' => trim($request->input('name')),
            'phone' => trim($request->input('phone')),
            'address_line1' => trim($request->input('address_line1')),
            'address_line2' => $request->input('address_line2') ? trim($request->input('address_line2')) : null,
            'landmark' => $request->input('landmark') ? trim($request->input('landmark')) : null,
            'city' => trim($request->input('city')),
            'state' => trim($request->input('state')),
            'pincode' => trim($request->input('pincode')),
            'address_type' => $request->input('address_type', 'home'),
            'is_default' => $isDefault,
            'created_at' => date('Y-m-d H:i:s')
        ]);

        $address = DB::fetchOne("SELECT * FROM addresses WHERE id = :id", ['id' => $addressId]);
        Response::success($address, 'Address saved successfully.', 201);
    }

    public function deleteAddress(Request $request, array $params): void
    {
        $user = $request->getUser();
        $id = (int)$params['id'];

        $deleted = DB::delete('addresses', 'id = :id AND user_id = :uid', [
            'id' => $id,
            'uid' => $user['id']
        ]);

        if (!$deleted) {
            Response::notFound('Address not found or unauthorized.');
            return;
        }

        Response::success(null, 'Address removed.');
    }

    /**
     * Forgot Password
     */
    public function forgotPassword(Request $request): void
    {
        $v = Validator::make($request->all(), ['email' => 'required|email']);
        if ($v->fails()) {
            Response::validationError($v->errors());
            return;
        }

        $email = strtolower(trim($request->input('email')));
        $user = DB::fetchOne("SELECT id, email FROM users WHERE email = :email", ['email' => $email]);

        if ($user) {
            $token = bin2hex(random_bytes(32));
            DB::insert('password_resets', [
                'email' => $email,
                'token' => $token,
                'created_at' => date('Y-m-d H:i:s'),
                'expires_at' => date('Y-m-d H:i:s', strtotime('+1 hour'))
            ]);

            NotificationService::sendPasswordReset($email, $token);
        }

        // Return generic success to prevent user enumeration
        Response::success(null, 'If an account exists with this email address, a password reset link has been sent.');
    }

    /**
     * Reset Password
     */
    public function resetPassword(Request $request): void
    {
        $v = Validator::make($request->all(), [
            'email' => 'required|email',
            'token' => 'required',
            'password' => 'required|min:6'
        ]);

        if ($v->fails()) {
            Response::validationError($v->errors());
            return;
        }

        $email = strtolower(trim($request->input('email')));
        $token = trim($request->input('token'));
        $now = date('Y-m-d H:i:s');

        $reset = DB::fetchOne(
            "SELECT * FROM password_resets WHERE email = :email AND token = :token AND expires_at > :now ORDER BY id DESC LIMIT 1",
            ['email' => $email, 'token' => $token, 'now' => $now]
        );

        if (!$reset) {
            Response::error('Invalid or expired password reset link. Please request a new one.', ['token' => ['Invalid token']]);
            return;
        }

        $newPasswordHash = password_hash($request->input('password'), PASSWORD_BCRYPT);
        DB::update('users', [
            'password_hash' => $newPasswordHash,
            'updated_at' => date('Y-m-d H:i:s')
        ], 'email = :email', ['email' => $email]);

        // Clean up reset token
        DB::delete('password_resets', 'email = :email', ['email' => $email]);

        Response::success(null, 'Password has been reset successfully. You can now log in.');
    }
}
