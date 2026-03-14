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

    case 'update_item':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = $_POST['inventory_id'];
            $name = $_POST['name'];
            $description = $_POST['description'];
            $quantity = $_POST['quantity'];
            $unit_price = $_POST['unit_price'];
            $reorder_level = $_POST['reorder_level'];
            $supplier_id = $_POST['supplier_id'];

            try {
                $stmt = $pdo->prepare("UPDATE inventory_items SET name=?, description=?, quantity=?, unit_price=?, reorder_level=?, supplier_id=? WHERE inventory_id=?");
                $stmt->execute([$name, $description, $quantity, $unit_price, $reorder_level, $supplier_id, $id]);
                echo json_encode(['status' => 'success', 'message' => 'Item updated successfully']);
            } catch (Exception $e) {
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            }
        }
        break;

    case 'delete_item':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = $_POST['inventory_id'];
            try {
                $stmt = $pdo->prepare("DELETE FROM inventory_items WHERE inventory_id=?");
                $stmt->execute([$id]);
                echo json_encode(['status' => 'success', 'message' => 'Item deleted successfully']);
            } catch (PDOException $e) {
                // Error 23000 is a Foreign Key Constraint violation
                if ($e->getCode() == '23000') {
                    echo json_encode(['status' => 'error', 'message' => 'Cannot delete: This item is part of an existing Purchase Order.']);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Failed to delete: ' . $e->getMessage()]);
                }
            }
        }
        break;

    case 'issue_item':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = $_POST['inventory_id'];
            $issue_qty = (int)$_POST['issue_qty'];

            try {
                // Subtracts the quantity, but prevents it from dropping below 0
                $stmt = $pdo->prepare("UPDATE inventory_items SET quantity = GREATEST(0, quantity - ?) WHERE inventory_id = ?");
                $stmt->execute([$issue_qty, $id]);
                
                echo json_encode(['status' => 'success', 'message' => "Successfully issued $issue_qty item(s)."]);
            } catch (Exception $e) {
                echo json_encode(['status' => 'error', 'message' => 'Failed to issue item: ' . $e->getMessage()]);
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

                    // 4. 🔥 FINANCE INTEGRATION: Generate Vendor Payment (Invoice) 🔥
                    // Fetch the supplier and total amount from the PO
                    $stmtPo = $pdo->prepare("SELECT supplier_id, total_amount FROM purchase_orders WHERE po_id = ?");
                    $stmtPo->execute([$po_id]);
                    $poData = $stmtPo->fetch();

                    // Insert the invoice into the Finance team's vendor_payments table
                    $stmtFinance = $pdo->prepare("INSERT INTO vendor_payments (supplier_id, po_id, pay_date, amount) VALUES (?, ?, ?, ?)");
                    $stmtFinance->execute([
                        $poData['supplier_id'], 
                        $po_id, 
                        date('Y-m-d'), // Logs today as the invoice date
                        $poData['total_amount']
                    ]);

                    $pdo->commit();
                    echo json_encode(['status' => 'success', 'message' => 'PO Received! Stock updated & Finance invoiced.']);
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
        // 1. Stock Valuations & Item Count
        $stmt1 = $pdo->query("SELECT SUM(quantity * unit_price) as total_value, COUNT(inventory_id) as total_items FROM inventory_items");
        $inv_stats = $stmt1->fetch();

        // 2. Identify Shortages (Low Stock)
        $stmt2 = $pdo->query("SELECT COUNT(inventory_id) as low_stock FROM inventory_items WHERE quantity <= reorder_level");
        $shortages = $stmt2->fetch();

        // 3. Identify Overstock (If current stock is 3x higher than the reorder level)
        $stmt3 = $pdo->query("SELECT COUNT(inventory_id) as overstock FROM inventory_items WHERE quantity > (reorder_level * 3) AND reorder_level > 0");
        $overstock = $stmt3->fetch();

        // 4. Total Spend
        $stmt4 = $pdo->query("SELECT SUM(total_amount) as total_spend FROM purchase_orders WHERE status = 'Received'");
        $po_stats = $stmt4->fetch();

        // 5. Inventory Turnover Ratio (Approx: Total Received PO Spend / Current Inventory Value)
        $total_value = $inv_stats['total_value'] ?? 0;
        $total_spend = $po_stats['total_spend'] ?? 0;
        $turnover_ratio = ($total_value > 0) ? ($total_spend / $total_value) : 0;

        // 6. Spend by Category (Using Supplier as the Category constraint)
        $stmt5 = $pdo->query("
            SELECT s.name as category_name, SUM(po.total_amount) as category_spend 
            FROM purchase_orders po 
            JOIN suppliers s ON po.supplier_id = s.supplier_id 
            WHERE po.status = 'Received'
            GROUP BY s.supplier_id
        ");
        $spend_by_category = $stmt5->fetchAll();

        // 7. Valuation by Supplier (Existing Bar Chart)
        $stmt6 = $pdo->query("
            SELECT s.name as supplier_name, SUM(i.quantity * i.unit_price) as supplier_value 
            FROM inventory_items i 
            JOIN suppliers s ON i.supplier_id = s.supplier_id 
            GROUP BY s.supplier_id
        ");
        $valuation_data = $stmt6->fetchAll();

        echo json_encode([
            'status' => 'success', 
            'data' => [
                'total_value' => $total_value,
                'total_items' => $inv_stats['total_items'] ?? 0,
                'low_stock' => $shortages['low_stock'] ?? 0,
                'overstock' => $overstock['overstock'] ?? 0,
                'total_spend' => $total_spend,
                'turnover_ratio' => round($turnover_ratio, 2),
                'spend_by_category' => $spend_by_category,
                'valuation_data' => $valuation_data
            ]
        ]);
        break;

    default:
        echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
        break;
}
?>