<?php
/**
 * Image Proxy Handler for Instagram Images
 * Downloads images from Instagram CDN and serves them locally
 * Auto-cleans up images older than 3 minutes
 */

define('IMAGE_CACHE_DIR', __DIR__ . '/images');
define('IMAGE_CACHE_TTL', 180); // 3 minutes in seconds

// Ensure cache directory exists
if (!file_exists(IMAGE_CACHE_DIR)) {
    if (!mkdir(IMAGE_CACHE_DIR, 0755, true)) {
        error_log('[Image Proxy] Failed to create cache directory: ' . IMAGE_CACHE_DIR);
    }
}

// Check if directory is writable (only log, don't die)
if (file_exists(IMAGE_CACHE_DIR) && !is_writable(IMAGE_CACHE_DIR)) {
    error_log('[Image Proxy] Cache directory is not writable: ' . IMAGE_CACHE_DIR);
}

/**
 * Clean up old cached images (older than TTL)
 * Run this periodically, not on every request
 */
function cleanup_old_images() {
    if (!is_dir(IMAGE_CACHE_DIR)) {
        return;
    }

    // Only run cleanup 10% of the time to reduce overhead
    if (rand(1, 10) !== 1) {
        return;
    }

    $files = glob(IMAGE_CACHE_DIR . '/*');
    $now = time();
    $deleted = 0;

    foreach ($files as $file) {
        if (is_file($file)) {
            $fileTime = filemtime($file);
            if (($now - $fileTime) > IMAGE_CACHE_TTL) {
                @unlink($file);
                $deleted++;
            }
        }
    }

    if ($deleted > 0 && instagram_is_local_env()) {
        error_log(sprintf('[Image Proxy] Cleaned up %d old image(s)', $deleted));
    }
}

/**
 * Download image from URL and save to cache
 * 
 * @param string $imageUrl Original Instagram image URL
 * @return string|false Local file path or false on failure
 */
function download_instagram_image($imageUrl) {
    if (empty($imageUrl) || !filter_var($imageUrl, FILTER_VALIDATE_URL)) {
        return false;
    }

    // Generate unique filename from URL hash
    $hash = md5($imageUrl);
    $extension = 'jpg'; // Default extension
    
    // Try to detect extension from URL
    $urlPath = parse_url($imageUrl, PHP_URL_PATH);
    if ($urlPath) {
        $pathInfo = pathinfo($urlPath);
        if (!empty($pathInfo['extension'])) {
            $ext = strtolower($pathInfo['extension']);
            // Only allow safe image extensions
            if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                $extension = $ext;
            }
        }
    }

    $localPath = IMAGE_CACHE_DIR . '/' . $hash . '.' . $extension;

    // If file already exists and is not expired, return it
    if (file_exists($localPath)) {
        $fileTime = filemtime($localPath);
        if ((time() - $fileTime) < IMAGE_CACHE_TTL) {
            return $localPath;
        }
        // File expired, delete it
        @unlink($localPath);
    }

    // Download the image with shorter timeout
    $ch = curl_init($imageUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_TIMEOUT => 10, // Shorter timeout
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
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        error_log('[Image Proxy] cURL Error: ' . $error);
        return false;
    }

    if ($httpCode !== 200 || empty($imageData)) {
        error_log(sprintf('[Image Proxy] Failed to download image: HTTP %d', $httpCode));
        return false;
    }

    // Save to cache without verifying (faster)
    if (file_put_contents($localPath, $imageData) === false) {
        error_log('[Image Proxy] Failed to save image to cache');
        return false;
    }

    return $localPath;
}

/**
 * Check if URL is already a local/proxied URL
 */
function is_local_proxy_url($url) {
    if (empty($url)) {
        return false;
    }
    
    if (strpos($url, '/') === 0 && strpos($url, '//') !== 0) {
        return true;
    }
    
    if (strpos($url, '/wp-content/themes/instagram/') !== false) {
        return true;
    }
    
    $host = $_SERVER['HTTP_HOST'] ?? '';
    if (!empty($host) && strpos($url, $host) !== false) {
        return true;
    }
    
    return false;
}

/**
 * Check if a URL is an Instagram image URL
 */
function is_instagram_image_url($url) {
    if (empty($url) || !is_string($url)) {
        return false;
    }
    
    $patterns = [
        '/https?:\/\/(scontent|cdninstagram)\./i',
        '/https?:\/\/.*\.cdninstagram\.com/i',
        '/https?:\/\/.*\.fbcdn\.net/i',
    ];
    
    foreach ($patterns as $pattern) {
        if (preg_match($pattern, $url)) {
            return true;
        }
    }
    
    return false;
}

/**
 * Get proxy URL for image - KHÔNG download, chỉ tạo proxy URL
 * Browser sẽ request qua endpoint serve-image.php
 */
function get_image_proxy_url($imageUrl) {
    if (empty($imageUrl)) {
        return '';
    }

    if (is_local_proxy_url($imageUrl)) {
        return $imageUrl;
    }

    // Tạo proxy URL - browser sẽ request endpoint này để lấy ảnh
    // get_template_directory_uri() đã trả về full URL (bao gồm protocol và domain)
    if (function_exists('get_template_directory_uri')) {
        $proxyUrl = get_template_directory_uri() . '/serve-image.php?url=' . urlencode($imageUrl);
    } 
    
    return $proxyUrl;
}

/**
 * Proxy all image URLs in data structure recursively
 * CHỈ thay thế URL, KHÔNG download
 */
function proxy_all_image_urls($data) {
    if (is_array($data)) {
        foreach ($data as $key => $value) {
            $data[$key] = proxy_all_image_urls($value);
        }
    } elseif (is_object($data)) {
        foreach ($data as $key => $value) {
            $data->$key = proxy_all_image_urls($value);
        }
    } elseif (is_string($data)) {
        if (is_local_proxy_url($data)) {
            return $data;
        }
        
        if (is_instagram_image_url($data)) {
            return get_image_proxy_url($data);
        }
    }

    return $data;
}

/**
 * Check if running in local environment
 */
if (!function_exists('instagram_is_local_env')) {
    function instagram_is_local_env() {
        $host = $_SERVER['HTTP_HOST'] ?? '';
        return (strpos($host, '.local') !== false) || (strpos($host, 'localhost') !== false);
    }
}

/**
 * API endpoint to get MD5 hash of URL (for JavaScript)
 */
if (isset($_GET['action']) && $_GET['action'] === 'hash' && isset($_GET['url'])) {
    header('Content-Type: application/json');
    $url = urldecode($_GET['url']);
    $hash = md5($url);
    
    $extension = 'jpg';
    $urlPath = parse_url($url, PHP_URL_PATH);
    if ($urlPath) {
        $pathInfo = pathinfo($urlPath);
        if (!empty($pathInfo['extension'])) {
            $ext = strtolower($pathInfo['extension']);
            if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
                $extension = $ext;
            }
        }
    }
    
    echo json_encode([
        'hash' => $hash,
        'extension' => $extension,
        'path' => '/wp-content/themes/instagram/images/' . $hash . '.' . $extension
    ]);
    exit;
}

// Run cleanup occasionally
cleanup_old_images();

