<?php
// AJAX handler for Instagram API requests
header('Content-Type: application/json');

define('INSTAGRAM_API_KEY', 'b1f91030admsh48c1538e13f45cep183f95jsn26463edb3469');
define('INSTAGRAM_API_HOST', 'instagram-api68.p.rapidapi.com');

function build_instagram_error($defaultMessage, $httpCode, $responseBody) {
    $message = $defaultMessage;
    $decoded = json_decode($responseBody, true);

    if (is_array($decoded)) {
        $candidateKeys = ['message', 'error', 'description', 'detail'];
        foreach ($candidateKeys as $key) {
            if (!empty($decoded[$key]) && is_string($decoded[$key])) {
                $message = $decoded[$key];
                break;
            }
        }

        if (isset($decoded['status']) && !in_array(strtolower((string) $decoded['status']), ['ok', 'success'], true)) {
            $statusMsg = is_string($decoded['status']) ? $decoded['status'] : json_encode($decoded['status']);
            $message = $message !== $defaultMessage ? $message : 'Instagram API status: ' . $statusMsg;
        }
    }

    error_log(sprintf('[Instagram API] HTTP %s: %s', $httpCode, $responseBody));

    return $message;
}

function request_instagram_api($path, $defaultErrorMessage) {
    $curl = curl_init();
    
    $curlOptions = [
        CURLOPT_URL => "https://" . INSTAGRAM_API_HOST . $path,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "GET",
        CURLOPT_HTTPHEADER => [
            "x-rapidapi-host: " . INSTAGRAM_API_HOST,
            "x-rapidapi-key: " . INSTAGRAM_API_KEY
        ],
    ];
    
    // Disable SSL verification for local development
    // Remove these lines in production!
    if (strpos($_SERVER['HTTP_HOST'] ?? '', '.local') !== false || 
        strpos($_SERVER['HTTP_HOST'] ?? '', 'localhost') !== false) {
        $curlOptions[CURLOPT_SSL_VERIFYPEER] = false;
        $curlOptions[CURLOPT_SSL_VERIFYHOST] = false;
    }
    
    curl_setopt_array($curl, $curlOptions);
    
    $response = curl_exec($curl);
    $err = curl_error($curl);
    $http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    
    curl_close($curl);
    
    if ($err) {
        error_log('[Instagram API] cURL Error: ' . $err);
        return [
            'success' => false,
            'error' => 'Connection error: ' . $err
        ];
    }
    
    $data = json_decode($response, true);
    
    // Log raw response for debugging
    error_log('[Instagram API] HTTP Code: ' . $http_code);
    error_log('[Instagram API] Response: ' . substr($response, 0, 500));
    
    if ($http_code !== 200) {
        return [
            'success' => false,
            'error' => build_instagram_error($defaultErrorMessage, $http_code, $response)
        ];
    }
    
    if (!$data) {
        return [
            'success' => false,
            'error' => 'Invalid response from Instagram API'
        ];
    }
    
    // Check if API returned an error status
    if (isset($data['status']) && !in_array(strtolower($data['status']), ['ok', 'success'], true)) {
        $errorMsg = $data['message'] ?? $data['error'] ?? $defaultErrorMessage;
        return [
            'success' => false,
            'error' => $errorMsg
        ];
    }
    
    return [
        'success' => true,
        'data' => $data
    ];
}

function get_instagram_user_info($username) {
    $encodedUsername = urlencode($username);
    return request_instagram_api("/api/user/info?username={$encodedUsername}", 'Failed to fetch user data');
}

function get_instagram_post_detail($post_url) {
    $encodedCode = urlencode($post_url);
    return request_instagram_api("/api/post/detail?code={$encodedCode}", 'Failed to fetch post data');
}

function get_instagram_tab_content($username, $contentType) {
    $username = trim($username);
    if ($username === '') {
        return [
            'success' => false,
            'error' => 'Username is required for tab requests'
        ];
    }

    $contentType = strtolower($contentType);
    $endpointMap = [
        'posts' => '/api/user/posts?username=',
        'stories' => '/api/user/stories?username=',
        'highlights' => '/api/user/highlights?username=',
        'reels' => '/api/user/reels?username=',
    ];

    if (!isset($endpointMap[$contentType])) {
        return [
            'success' => false,
            'error' => 'Unsupported content type requested'
        ];
    }

    $encodedUsername = urlencode($username);
    $path = $endpointMap[$contentType] . $encodedUsername;
    $defaultMessage = 'Failed to fetch ' . $contentType . ' data';

    return request_instagram_api($path, $defaultMessage);
}

function parse_instagram_url($url) {
    $url = trim($url);

    if (empty($url)) {
        return false;
    }

    // Allow users to paste just the shortcode or username (no domain)
    if (strpos($url, 'instagram.com') === false) {
        if (!preg_match('/^[a-z0-9._-]+$/i', $url)) {
            return false;
        }

        $looksLikePost = strlen($url) >= 8 && strpos($url, '.') === false;
        if ($looksLikePost) {
            return ['type' => 'post', 'identifier' => $url];
        }

        return ['type' => 'profile', 'identifier' => $url];
    }

    $parts = parse_url($url);
    if (!$parts || !isset($parts['path'])) {
        return false;
    }

    $path = trim($parts['path'], '/');
    if ($path === '') {
        return false;
    }

    $segments = explode('/', $path);
    $firstSegment = strtolower($segments[0]);

    $postSegments = ['p', 'reel', 'reels', 'tv'];
    if (in_array($firstSegment, $postSegments, true)) {
        $code = $segments[1] ?? '';
        if ($code === '') {
            return false;
        }

        // Remove query params that may be attached directly to the shortcode
        $code = preg_split('/[\?\&]/', $code)[0];
        return ['type' => 'post', 'identifier' => $code];
    }

    // Profile URL, ignore reserved paths
    $reserved = ['stories', 'explore', 'reels', 'reel', 'p', 'tv', 'accounts', 'about', 'developer'];
    if (in_array($firstSegment, $reserved, true) && count($segments) === 1) {
        return false;
    }

    $username = preg_split('/[\?\&]/', $segments[0])[0];
    return ['type' => 'profile', 'identifier' => $username];
}

// Main handler
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['url']) || empty($input['url'])) {
        echo json_encode([
            'success' => false,
            'error' => 'URL is required'
        ]);
        exit;
    }
    
    $url = $input['url'];
    $parsed = parse_instagram_url($url);
    
    if (!$parsed) {
        echo json_encode([
            'success' => false,
            'error' => 'Link format is incorrect'
        ]);
        exit;
    }
    
    if ($parsed['type'] === 'profile') {
        $result = get_instagram_user_info($parsed['identifier']);
    } else {
        $result = get_instagram_post_detail($parsed['identifier']);
    }
    
    echo json_encode($result);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid request method'
    ]);
}
