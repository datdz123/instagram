<?php
/**
 * Serve Image Endpoint
 * Downloads and serves Instagram images on-demand
 * Caches images for 3 minutes then auto-deletes
 */

define('IMAGE_CACHE_DIR', __DIR__ . '/images');
define('IMAGE_CACHE_TTL', 180); // 3 minutes

// Ensure cache directory exists
if (!file_exists(IMAGE_CACHE_DIR)) {
    if (!mkdir(IMAGE_CACHE_DIR, 0755, true)) {
        error_log('[Serve Image] Failed to create cache directory: ' . IMAGE_CACHE_DIR);
        http_response_code(500);
        die('Failed to create cache directory');
    }
}

// Check if directory is writable
if (!is_writable(IMAGE_CACHE_DIR)) {
    error_log('[Serve Image] Cache directory is not writable: ' . IMAGE_CACHE_DIR);
    http_response_code(500);
    die('Cache directory is not writable');
}

// Get URL from query string
$imageUrl = isset($_GET['url']) ? $_GET['url'] : '';

if (empty($imageUrl)) {
    http_response_code(400);
    die('Missing URL parameter');
}

// Decode URL
$imageUrl = urldecode($imageUrl);

// Validate URL
if (!filter_var($imageUrl, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    die('Invalid URL');
}

// Security: Only allow Instagram CDN URLs
$allowedPatterns = [
    '/^https?:\/\/(scontent|cdninstagram)\./i',
    '/^https?:\/\/.*\.cdninstagram\.com/i',
    '/^https?:\/\/.*\.fbcdn\.net/i',
];

$isAllowed = false;
foreach ($allowedPatterns as $pattern) {
    if (preg_match($pattern, $imageUrl)) {
        $isAllowed = true;
        break;
    }
}

if (!$isAllowed) {
    http_response_code(403);
    die('URL not allowed');
}

// Generate cache filename
$hash = md5($imageUrl);
$extension = 'jpg';

$urlPath = parse_url($imageUrl, PHP_URL_PATH);
if ($urlPath) {
    $pathInfo = pathinfo($urlPath);
    if (!empty($pathInfo['extension'])) {
        $ext = strtolower($pathInfo['extension']);
        if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4'])) {
            $extension = $ext;
        }
    }
}

$localPath = IMAGE_CACHE_DIR . '/' . $hash . '.' . $extension;

// Check if cached and not expired
$needsDownload = true;
if (file_exists($localPath)) {
    $fileTime = filemtime($localPath);
    if ((time() - $fileTime) < IMAGE_CACHE_TTL) {
        $needsDownload = false;
    } else {
        // Expired, delete it
        @unlink($localPath);
    }
}

// Download if needed
if ($needsDownload) {
    $ch = curl_init($imageUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_TIMEOUT => 15,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        CURLOPT_HTTPHEADER => [
            'Accept: image/webp,image/apng,image/*,*/*;q=0.8',
            'Referer: https://www.instagram.com/',
        ],
    ]);

    $imageData = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error || $httpCode !== 200 || empty($imageData)) {
        // Failed to download, redirect to original URL as fallback
        header('Location: ' . $imageUrl);
        exit;
    }

    // Save to cache
    $bytesWritten = file_put_contents($localPath, $imageData);
    if ($bytesWritten === false) {
        error_log('[Serve Image] Failed to save image to: ' . $localPath);
        // Fallback: redirect to original URL
        header('Location: ' . $imageUrl);
        exit;
    }
}

// Serve the file
$mimeTypes = [
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'gif' => 'image/gif',
    'webp' => 'image/webp',
    'mp4' => 'video/mp4',
];

$mimeType = $mimeTypes[$extension] ?? 'application/octet-stream';

// Set headers
header('Content-Type: ' . $mimeType);
header('Content-Length: ' . filesize($localPath));
header('Cache-Control: public, max-age=' . IMAGE_CACHE_TTL);
header('X-Cache: ' . ($needsDownload ? 'MISS' : 'HIT'));

// Output file
readfile($localPath);

// Cleanup old files occasionally (10% chance)
if (rand(1, 10) === 1) {
    $files = glob(IMAGE_CACHE_DIR . '/*');
    $now = time();
    foreach ($files as $file) {
        if (is_file($file) && ($now - filemtime($file)) > IMAGE_CACHE_TTL) {
            @unlink($file);
        }
    }
}
