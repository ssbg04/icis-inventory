<?php
session_start();
header('Content-Type: application/json');
require_once 'db.php'; // Ensure your db.php from the previous step is still present

$action = isset($_GET['action']) ? $_GET['action'] : '';

// Protect actions - require login for everything except login and checking auth
$public_actions = ['login', 'check_auth'];
if (!in_array($action, $public_actions) && !isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized access. Please log in.']);
    exit;
}

switch ($action) {
    case 'check_auth':
        if (isset($_SESSION['user_id'])) {
            echo json_encode(['status' => 'success', 'username' => $_SESSION['username']]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
        }
        break;

    case 'login':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $username = $_POST['username'] ?? '';
            $password = $_POST['password'] ?? '';

            $stmt = $pdo->prepare("SELECT id, username, password FROM users WHERE username = :username");
            $stmt->execute([':username' => $username]);
            $user = $stmt->fetch();

            // Verify password hash
            if ($user && password_verify($password, $user['password'])) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                echo json_encode(['status' => 'success', 'message' => 'Login successful', 'username' => $user['username']]);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Invalid username or password']);
            }
        }
        break;

    case 'logout':
        session_destroy();
        echo json_encode(['status' => 'success', 'message' => 'Logged out successfully']);
        break;

    case 'get_inventory':
        $stmt = $pdo->query("
            SELECT i.*, s.name as supplier_name 
            FROM inventory_items i 
            LEFT JOIN suppliers s ON i.supplier_id = s.supplier_id
            ORDER BY i.name ASC
        ");
        $items = $stmt->fetchAll();
        echo json_encode(['status' => 'success', 'data' => $items]);
        break;

    case 'get_suppliers':
        $stmt = $pdo->query("SELECT supplier_id, name FROM suppliers ORDER BY name ASC");
        $suppliers = $stmt->fetchAll();
        echo json_encode(['status' => 'success', 'data' => $suppliers]);
        break;

    case 'get_supplier_items':
        $supplier_id = $_GET['supplier_id'] ?? 0;
        
        // Fetch only items that belong to the selected supplier
        $stmt = $pdo->prepare("SELECT inventory_id, name, quantity, unit_price FROM inventory_items WHERE supplier_id = ? ORDER BY name ASC");
        $stmt->execute([$supplier_id]);
        $items = $stmt->fetchAll();
        
        echo json_encode(['status' => 'success', 'data' => $items]);
        break;

    case 'add_item':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $name = $_POST['name'] ?? '';
            $description = $_POST['description'] ?? '';
            $quantity = $_POST['quantity'] ?? 0;
            $unit_price = $_POST['unit_price'] ?? 0.00;
            $reorder_level = $_POST['reorder_level'] ?? 0;
            $supplier_id = $_POST['supplier_id'] ?? null;

            try {
                $sql = "INSERT INTO inventory_items (name, description, quantity, unit_price, reorder_level, supplier_id) 
                        VALUES (:name, :description, :quantity, :unit_price, :reorder_level, :supplier_id)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    ':name' => $name,
                    ':description' => $description,
                    ':quantity' => $quantity,
                    ':unit_price' => $unit_price,
                    ':reorder_level' => $reorder_level,
                    ':supplier_id' => $supplier_id
                ]);
                echo json_encode(['status' => 'success', 'message' => 'Item added successfully']);
            } catch (Exception $e) {
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            }
        }
        break;
    
    case 'get_pos':
        // Fetch all purchase orders and the associated supplier
        $stmt = $pdo->query("
            SELECT po.*, s.name as supplier_name 
            FROM purchase_orders po 
            LEFT JOIN suppliers s ON po.supplier_id = s.supplier_id
            ORDER BY po.order_date DESC, po.po_id DESC
        ");
        echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll()]);
        break;

    case 'create_po':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $supplier_id = $_POST['supplier_id'];
            $inventory_id = $_POST['inventory_id'];
            $quantity = $_POST['quantity'];
            $unit_price = $_POST['unit_price'];
            $total_amount = $quantity * $unit_price;
            $order_date = date('Y-m-d');

            try {
                $pdo->beginTransaction();

                // 1. Create the Purchase Order
                $stmt = $pdo->prepare("INSERT INTO purchase_orders (supplier_id, order_date, total_amount, status) VALUES (?, ?, ?, 'Ordered')");
                $stmt->execute([$supplier_id, $order_date, $total_amount]);
                $po_id = $pdo->lastInsertId();

                // 2. Add the item to the PO (Simplified for 1 item per PO in this prototype)
                $stmt2 = $pdo->prepare("INSERT INTO purchase_items (po_id, inventory_id, quantity, unit_price) VALUES (?, ?, ?, ?)");
                $stmt2->execute([$po_id, $inventory_id, $quantity, $unit_price]);

                $pdo->commit();
                echo json_encode(['status' => 'success', 'message' => 'Purchase Order created successfully']);
            } catch (Exception $e) {
                $pdo->rollBack();
                echo json_encode(['status' => 'error', 'message' => 'Failed to create PO: ' . $e->getMessage()]);
            }
        }
        break;

    case 'receive_po':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $po_id = $_POST['po_id'];

            try {
                $pdo->beginTransaction();

                // 1. Update PO status to Received
                $stmt = $pdo->prepare("UPDATE purchase_orders SET status = 'Received' WHERE po_id = ? AND status != 'Received'");
                $stmt->execute([$po_id]);

                // Ensure we actually updated something (prevents double-receiving)
                if ($stmt->rowCount() > 0) {
                    // 2. Get the items from this PO
                    $stmtItems = $pdo->prepare("SELECT inventory_id, quantity FROM purchase_items WHERE po_id = ?");
                    $stmtItems->execute([$po_id]);
                    $items = $stmtItems->fetchAll();

                    // 3. Loop through items and update inventory stock
                    $updateStock = $pdo->prepare("UPDATE inventory_items SET quantity = quantity + ? WHERE inventory_id = ?");
                    foreach ($items as $item) {
                        $updateStock->execute([$item['quantity'], $item['inventory_id']]);
                    }

                    $pdo->commit();
                    echo json_encode(['status' => 'success', 'message' => 'PO Received! Inventory stock has been updated.']);
                } else {
                    $pdo->rollBack();
                    echo json_encode(['status' => 'error', 'message' => 'PO already received or not found.']);
                }
            } catch (Exception $e) {
                $pdo->rollBack();
                echo json_encode(['status' => 'error', 'message' => 'Failed to receive PO: ' . $e->getMessage()]);
            }
        }
        break;

    case 'get_analytics':
        // 1. Total Inventory Value & Item Count
        $stmt1 = $pdo->query("SELECT SUM(quantity * unit_price) as total_value, COUNT(inventory_id) as total_items FROM inventory_items");
        $inventory_stats = $stmt1->fetch();

        // 2. Low Stock Alerts Count
        $stmt2 = $pdo->query("SELECT COUNT(inventory_id) as low_stock_count FROM inventory_items WHERE quantity <= reorder_level");
        $low_stock = $stmt2->fetch();

        // 3. Total Spend on Received POs
        $stmt3 = $pdo->query("SELECT SUM(total_amount) as total_spend FROM purchase_orders WHERE status = 'Received'");
        $po_stats = $stmt3->fetch();

        // 4. Inventory Valuation Grouped by Supplier (for the Chart)
        $stmt4 = $pdo->query("
            SELECT s.name as supplier_name, SUM(i.quantity * i.unit_price) as supplier_value 
            FROM inventory_items i 
            JOIN suppliers s ON i.supplier_id = s.supplier_id 
            GROUP BY s.supplier_id
        ");
        $chart_data = $stmt4->fetchAll();

        echo json_encode([
            'status' => 'success', 
            'data' => [
                'total_value' => $inventory_stats['total_value'] ?? 0,
                'total_items' => $inventory_stats['total_items'] ?? 0,
                'low_stock_count' => $low_stock['low_stock_count'] ?? 0,
                'total_spend' => $po_stats['total_spend'] ?? 0,
                'chart_data' => $chart_data
            ]
        ]);
        break;

    default:
        echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
        break;
}
?>