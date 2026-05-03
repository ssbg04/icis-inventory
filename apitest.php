<?php 

$url = "https://icis-inventory.free.nf/includes/api/api.php?action=update_po_status";

$data = [
    "po_id" => 16,
    "status" => "Approved"
];

$options = [
    "http" => [
        "header"  => "Content-type: application/x-www-form-urlencoded",
        "method"  => "POST",
        "content" => http_build_query($data),
    ]
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);

echo $response;
?>