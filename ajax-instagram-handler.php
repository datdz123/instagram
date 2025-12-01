<?php
// AJAX handler for Instagram API requests (RapidAPI - instagram120)
header('Content-Type: application/json');

define('INSTAGRAM_API_KEY', 'b1f91030admsh48c1538e13f45cep183f95jsn26463edb3469');
define('INSTAGRAM_API_HOST', 'instagram120.p.rapidapi.com');

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

/**
 * Gửi request POST JSON tới RapidAPI
 *
 * @param string $path   Đường dẫn endpoint, ví dụ: '/api/instagram/userInfo'
 * @param array  $body   Payload JSON (sẽ được json_encode)
 * @param string $defaultErrorMessage  Thông báo mặc định khi có lỗi
 */
function request_instagram_api($path, array $body, $defaultErrorMessage) {
    $curl = curl_init();

    $jsonBody = json_encode($body);

    $curlOptions = [
        CURLOPT_URL => "https://" . INSTAGRAM_API_HOST . $path,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "POST",
        CURLOPT_POSTFIELDS => $jsonBody,
        CURLOPT_HTTPHEADER => [
            "x-rapidapi-host: " . INSTAGRAM_API_HOST,
            "x-rapidapi-key: " . INSTAGRAM_API_KEY,
            "Content-Type: application/json"
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
        $builtError = build_instagram_error($defaultErrorMessage, $http_code, $response);

        $errorPayload = [
            'success' => false,
            'error'   => $builtError,
            'httpCode'=> $http_code,
        ];

        // Trong môi trường local, trả thêm raw response để tiện debug
        if (instagram_is_local_env()) {
            $errorPayload['raw'] = substr($response, 0, 1000);
        }

        return $errorPayload;
    }
    
    if (!$data) {
        $errorPayload = [
            'success' => false,
            'error'   => 'Invalid response from Instagram API',
        ];

        if (instagram_is_local_env()) {
            $errorPayload['raw'] = substr($response, 0, 1000);
        }

        return $errorPayload;
    }
    
    // API mới có thể không dùng field "status", nên chỉ check basic thôi
    return [
        'success' => true,
        'data' => $data,
    ];
}

/**
 * Lấy thông tin user (avatar, stats, ...)
 * Endpoint: POST https://instagram120.p.rapidapi.com/api/instagram/userInfo
 * Body: { "username": "..." }
 */
function get_instagram_user_info($username) {
    $username = trim($username);
    if ($username === '') {
        return [
            'success' => false,
            'error'   => 'Username is required',
        ];
    }

    return request_instagram_api('/api/instagram/userInfo', [
        'username' => $username,
    ], 'Failed to fetch user data');
}

/**
 * Lấy chi tiết post (1 media) theo shortcode
 * Endpoint: POST https://instagram120.p.rapidapi.com/api/instagram/mediaByShortcode
 * Body: { "shortcode": "..." }
 */
function get_instagram_post_detail($shortcode) {
    $shortcode = trim($shortcode);
    if ($shortcode === '') {
        return [
            'success' => false,
            'error'   => 'Shortcode is required',
        ];
    }

    return request_instagram_api('/api/instagram/mediaByShortcode', [
        'shortcode' => $shortcode,
    ], 'Failed to fetch post data');
}

/**
 * Lấy dữ liệu cho các tab: posts, stories, highlights, reels
 * Theo docs API mới: truyền username + maxId (phân trang, tạm thời để rỗng)
 *
 * Endpoint ví dụ:
 *  - /api/instagram/posts
 *  - /api/instagram/stories
 *  - /api/instagram/highlights
 *  - /api/instagram/reels
 *
 * Body: { "username": "...", "maxId": "" }
 */
function get_instagram_tab_content($username, $contentType, $maxId = '') {
    $username = trim($username);
    if ($username === '') {
        return [
            'success' => false,
            'error' => 'Username is required for tab requests'
        ];
    }

    $contentType = strtolower($contentType);
    $endpointMap = [
        'posts'      => '/api/instagram/posts',
        'stories'    => '/api/instagram/stories',
        'highlights' => '/api/instagram/highlights',
        'reels'      => '/api/instagram/reels',
    ];

    if (!isset($endpointMap[$contentType])) {
        return [
            'success' => false,
            'error' => 'Unsupported content type requested'
        ];
    }

    $path = $endpointMap[$contentType];
    $defaultMessage = 'Failed to fetch ' . $contentType . ' data';

    return request_instagram_api($path, [
        'username' => $username,
        'maxId'    => (string) $maxId,
    ], $defaultMessage);
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

function instagram_is_local_env() {
    $host = $_SERVER['HTTP_HOST'] ?? '';
    return (strpos($host, '.local') !== false) || (strpos($host, 'localhost') !== false);
}

// Main handler
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);

    if (instagram_is_local_env()) {
        error_log('[Instagram API] Incoming payload: ' . $rawInput);
    }

    // Tab content request (posts / stories / highlights / reels)
    if (isset($input['contentType'], $input['username']) && !isset($input['url'])) {
        if (instagram_is_local_env()) {
            error_log(sprintf('[Instagram API] Tab request: contentType=%s, username=%s, maxId=%s', $input['contentType'], $input['username'], $input['maxId'] ?? ''));
        }

        $maxId = isset($input['maxId']) ? (string) $input['maxId'] : '';
        $result = get_instagram_tab_content($input['username'], $input['contentType'], $maxId);
        echo json_encode($result);
        exit;
    }
    
    if (!isset($input['url']) || empty($input['url'])) {
        echo json_encode([
            'success' => false,
            'error' => 'URL is required'
        ]);
        exit;
    }
    
    $url = $input['url'];
    $parsed = parse_instagram_url($url);

    if (instagram_is_local_env()) {
        error_log('[Instagram API] Parsed URL result: ' . var_export($parsed, true));
    }
    
    if (!$parsed) {
        echo json_encode([
            'success' => false,
            'error' => 'Link format is incorrect'
        ]);
        exit;
    }

    if ($parsed['type'] === 'profile') {
        $result = get_instagram_user_info($parsed['identifier']);

        // Chuẩn hoá cấu trúc dữ liệu để phía JS luôn thấy field "user"
        if (!empty($result['success']) && isset($result['data']) && !isset($result['data']['user'])) {
            $result['data'] = [
                'user' => $result['data'],
            ];
        }
    } else {
        $result = get_instagram_post_detail($parsed['identifier']);

        // Chuẩn hoá cấu trúc dữ liệu để phía JS luôn thấy field "media"
        if (!empty($result['success']) && isset($result['data']) && !isset($result['data']['media'])) {
            $result['data'] = [
                'media' => $result['data'],
            ];
        }
    }

    echo json_encode($result);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid request method'
    ]);
}
