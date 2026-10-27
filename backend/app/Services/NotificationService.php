<?php

namespace App\Services;

use App\Config\BusinessConfig;
use App\Config\Config;
use App\Support\Logger;

class NotificationService
{
    /**
     * Send Transactional Email
     */
    public static function sendEmail(string $to, string $subject, string $htmlBody): bool
    {
        $mailConfig = Config::mail();
        $business = BusinessConfig::get();

        if (!$mailConfig['is_configured']) {
            Logger::info("Email notification simulated (Mail not configured): To [{$to}], Subject [{$subject}]");
            return true; // Graceful non-blocking return
        }

        try {
            $from = $mailConfig['from_address'] ?: $business['contact']['email'];
            $fromName = $mailConfig['from_name'] ?: $business['brand']['name'];

            $headers = [
                'MIME-Version: 1.0',
                'Content-type: text/html; charset=utf-8',
                "From: {$fromName} <{$from}>",
                "Reply-To: {$business['contact']['email']}",
                'X-Mailer: PHP/' . phpversion()
            ];

            $success = @mail($to, $subject, $htmlBody, implode("\r\n", $headers));
            if ($success) {
                Logger::info("Email sent successfully to {$to}");
            } else {
                Logger::warning("Mail function returned false for {$to}");
            }
            return $success;
        } catch (\Throwable $e) {
            Logger::error("Email delivery failed: " . $e->getMessage(), ['to' => $to, 'subject' => $subject]);
            return false;
        }
    }

    /**
     * Send SMS notification
     */
    public static function sendSms(string $phone, string $message): bool
    {
        $smsConfig = Config::sms();
        if (!$smsConfig['is_configured'] || $smsConfig['provider'] === 'none') {
            Logger::info("SMS notification skipped (SMS not configured): To [{$phone}], Message: [{$message}]");
            return true;
        }

        try {
            if ($smsConfig['provider'] === 'msg91') {
                $url = 'https://api.msg91.com/api/v5/flow/';
                $payload = json_encode([
                    'template_id' => $smsConfig['template_id'],
                    'short_url' => '1',
                    'recipients' => [
                        ['mobiles' => $phone, 'message' => $message]
                    ]
                ]);

                $ch = curl_init($url);
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
                curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
                curl_setopt($ch, CURLOPT_HTTPHEADER, [
                    'authkey: ' . $smsConfig['auth_key'],
                    'content-type: application/json'
                ]);
                $response = curl_exec($ch);
                curl_close($ch);

                Logger::info("MSG91 SMS sent to {$phone}");
                return true;
            }
        } catch (\Throwable $e) {
            Logger::error("SMS sending failed: " . $e->getMessage());
        }

        return false;
    }

    /**
     * Send Order Confirmation Email
     */
    public static function sendOrderConfirmation(array $order, array $items): void
    {
        $b = BusinessConfig::get();
        $subject = "Your {$b['brand']['name']} Order #{$order['order_number']} is Confirmed!";

        $itemsHtml = '';
        foreach ($items as $item) {
            $itemsHtml .= sprintf(
                "<tr><td style='padding:8px;border-bottom:1px solid #eee;'>%s (x%d)</td><td style='padding:8px;border-bottom:1px solid #eee;text-align:right;'>%s %.2f</td></tr>",
                htmlspecialchars($item['product_name']),
                $item['quantity'],
                $b['commerce']['currency_symbol'],
                $item['total_price']
            );
        }

        $html = "
        <div style='font-family:sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e2e8f0;border-radius:8px;'>
            <h2 style='color:#ea580c;'>{$b['brand']['name']} — Order Confirmed</h2>
            <p>Hi <strong>" . htmlspecialchars($order['customer_name']) . "</strong>,</p>
            <p>Thank you for choosing smart snacking! We have received your order <strong>#{$order['order_number']}</strong> and our team is preparing it with care.</p>
            
            <table style='width:100%;border-collapse:collapse;margin:20px 0;'>
                <thead>
                    <tr style='background:#f8fafc;'><th style='padding:8px;text-align:left;'>Item</th><th style='padding:8px;text-align:right;'>Total</th></tr>
                </thead>
                <tbody>{$itemsHtml}</tbody>
                <tfoot>
                    <tr><td style='padding:8px;font-weight:bold;'>Total Paid:</td><td style='padding:8px;font-weight:bold;text-align:right;'>{$b['commerce']['currency_symbol']} {$order['total_amount']}</td></tr>
                </tfoot>
            </table>

            <p style='color:#64748b;font-size:14px;'>Delivering to Delhi NCR. Need assistance? WhatsApp us at {$b['contact']['whatsapp']}.</p>
        </div>";

        self::sendEmail($order['customer_email'], $subject, $html);
        self::sendSms($order['customer_phone'], "OfficeFuel: Your order #{$order['order_number']} of INR {$order['total_amount']} is confirmed! Track anytime on officefuel.in");
    }

    /**
     * Send Password Reset Email
     */
    public static function sendPasswordReset(string $email, string $resetToken): void
    {
        $b = BusinessConfig::get();
        $appConfig = Config::app();
        $resetUrl = rtrim($appConfig['frontend_url'], '/') . "/reset-password?token=" . urlencode($resetToken) . "&email=" . urlencode($email);

        $subject = "Reset your {$b['brand']['name']} account password";
        $html = "
        <div style='font-family:sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #e2e8f0;border-radius:8px;'>
            <h2 style='color:#ea580c;'>Password Reset Request</h2>
            <p>We received a request to reset your password for your {$b['brand']['name']} account.</p>
            <p>Click the link below to set a new password. This link is valid for 1 hour.</p>
            <p style='margin:25px 0;'><a href='{$resetUrl}' style='background:#ea580c;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;'>Reset Password</a></p>
            <p style='font-size:12px;color:#94a3b8;'>If you did not request a password reset, you can safely ignore this email.</p>
        </div>";

        self::sendEmail($email, $subject, $html);
    }
}
