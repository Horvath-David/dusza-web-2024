<?php
// Backend Django server URL
$backend_url = 'http://localhost:8000';  // Replace with your actual Django server URL

// Get the requested URI
$path = $_SERVER['REQUEST_URI'];
$method = $_SERVER['REQUEST_METHOD'];

// Check if the request is for the API route or the admin route
if (strpos($path, '/api/') === 0 || strpos($path, '/admin/') === 0 ||  strpos($path, '/static/') === 0) {
    // Initialize a cURL session to proxy the request
    $ch = curl_init();

    // Set the full URL to forward the request to
    curl_setopt($ch, CURLOPT_URL, $backend_url . $path);

    // Set the request method (GET, POST, PUT, DELETE, etc.)
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

    // Forward headers from the original request
    $headers = [];
    foreach (getallheaders() as $key => $value) {
        $headers[] = "$key: $value";
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    // Forward any POST data
    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POSTFIELDS, file_get_contents('php://input'));
    }

    // Receive response from backend server
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // Optionally, get the response headers
    curl_setopt($ch, CURLOPT_HEADER, true);

    // Execute the cURL request
    $response = curl_exec($ch);

    // Handle errors in the cURL request
    if ($response === false) {
        http_response_code(502); // Bad Gateway
        echo "Proxy Error: " . curl_error($ch);
    } else {
        // Separate headers from the response body
        $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $headers = substr($response, 0, $header_size); // Extract headers
        $body = substr($response, $header_size); // Extract body

        // Forward the HTTP response code from the backend
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        http_response_code($http_code);

        // Forward the response headers to the client
        // Split the headers into an array and send each one to the client
        $header_lines = explode("\r\n", $headers);
        foreach ($header_lines as $header) {
            if (strpos($header, ':') !== false) {
                header($header);
            }
        }

        // Output the response body
        echo $body;
    }

    // Close the cURL session
    curl_close($ch);
} else {
    // Serve the index.html for non-API and non-admin routes
    if (file_exists('index.html')) {
        echo file_get_contents('index.html');
    } else {
        http_response_code(404);
        echo "Error: index.html not found.";
    }
}

exit;
