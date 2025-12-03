<?php
/**
 * Video Download Proxy
 * Downloads video from Instagram CDN and serves it with proper headers for download
 */

header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="video.mp4"');

// Get video URL from query parameter
$videoUrl = $_GET['url'] ?? '';

if (empty($videoUrl)) {
    http_response_code(400);
    echo 'Video URL is required';
    exit;
}

// Validate URL
if (!filter_var($videoUrl, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo 'Invalid video URL';
    exit;
}

// Check if it's an Instagram/Facebook CDN URL
if (!preg_match('/https?:\/\/(.*\.)?(fbcdn|cdninstagram|instagram)\.(net|com)/i', $videoUrl)) {
    http_response_code(403);
    echo 'Only Instagram/Facebook CDN URLs are allowed';
    exit;
}

// Set headers for download
$filename = basename(parse_url($videoUrl, PHP_URL_PATH));
if (empty($filename) || !preg_match('/\.(mp4|webm|mov)$/i', $filename)) {
    $filename = 'video_' . time() . '.mp4';
}

header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Content-Transfer-Encoding: binary');
header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
header('Pragma: public');

// Download and stream the video
$ch = curl_init($videoUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => false, // Stream directly
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 5,
    CURLOPT_TIMEOUT => 300, // 5 minutes for large videos
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    CURLOPT_HTTPHEADER => [
        'Accept: video/mp4, video/*, */*',
        'Referer: https://www.instagram.com/',
    ],
    CURLOPT_WRITEFUNCTION => function($ch, $data) {
        echo $data;
        flush();
        return strlen($data);
    },
]);

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(500);
    error_log('[Video Download] cURL Error: ' . $error);
    echo 'Error downloading video';
    exit;
}

if ($httpCode !== 200) {
    http_response_code($httpCode);
    error_log(sprintf('[Video Download] HTTP %d for URL: %s', $httpCode, $videoUrl));
    echo 'Error downloading video';
    exit;
}

