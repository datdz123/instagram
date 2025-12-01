<?php
// Test Instagram API
error_reporting(E_ALL);
ini_set('display_errors', 1);

$username = 'p.q.dat_';
$api_key = 'b1f91030admsh48c1538e13f45cep183f95jsn26463edb3469';
$api_host = 'instagram-api68.p.rapidapi.com';

echo "<h2>Testing Instagram API for username: {$username}</h2>";

$curl = curl_init();

$url = "https://{$api_host}/api/user/info?username=" . urlencode($username);
echo "<p><strong>URL:</strong> {$url}</p>";

curl_setopt_array($curl, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "GET",
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_HTTPHEADER => [
        "x-rapidapi-host: {$api_host}",
        "x-rapidapi-key: {$api_key}"
    ],
]);

$response = curl_exec($curl);
$err = curl_error($curl);
$http_code = curl_getinfo($curl, CURLINFO_HTTP_CODE);

curl_close($curl);

echo "<h3>Response Details:</h3>";
echo "<p><strong>HTTP Code:</strong> {$http_code}</p>";

if ($err) {
    echo "<p><strong style='color: red;'>cURL Error:</strong> {$err}</p>";
} else {
    echo "<p><strong style='color: green;'>Success!</strong></p>";
    echo "<h4>Raw Response:</h4>";
    echo "<pre>" . htmlspecialchars($response) . "</pre>";
    
    $data = json_decode($response, true);
    if ($data) {
        echo "<h4>Parsed JSON:</h4>";
        echo "<pre>" . print_r($data, true) . "</pre>";
    } else {
        echo "<p style='color: red;'>Failed to parse JSON</p>";
    }
}
