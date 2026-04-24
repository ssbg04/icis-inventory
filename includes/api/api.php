<?php
session_start();
// ==========================================
// SESSION TIMEOUT LOGIC (Idle Timer)
// ==========================================
$timeout_duration = 43200; // 43200 seconds = 12 hours. (Use 3600 for 1 hour, 86400 for 24 hours)

if (isset($_SESSION['user_id'])) {
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > $timeout_duration) {
        // The user was idle for too long. Destroy the session!
        session_unset();
        session_destroy();
        
        // If the frontend is quietly checking auth, tell it the session died
        if (isset($_GET['action']) && $_GET['action'] === 'check_auth') {
            echo json_encode(['status' => 'timeout', 'message' => 'Session expired.']);
            exit;
        }
    } else {
        // The user is active! Reset the timer back to zero.
        $_SESSION['last_activity'] = time();
    }
}

header('Content-Type: application/json');
require_once dirname(__DIR__) . '/db/db.php'; // Ensure your db.php from the previous step is still present

$action = isset($_GET['action']) ? $_GET['action'] : '';

// Protect actions - require login for everything except login and checking auth
// $public_actions = ['login', 'check_auth'];
// if (!in_array($action, $public_actions) && !isset($_SESSION['user_id'])) {
//     echo json_encode(['status' => 'error', 'message' => 'Unauthorized access. Please log in.']);
//     exit;
// }

switch ($action) {
    case 'check_auth':
        if (isset($_SESSION['user_id'])) {
            echo json_encode([
                'status' => 'success', 
                'username' => $_SESSION['username'],
                'role' => $_SESSION['role'],
                'full_name' => $_SESSION['full_name']
            ]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
        }
        break;

    case 'login':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            
            // --- 1. COOLDOWN CHECK ---
            // If the user is currently locked out, reject the request immediately
            if (isset($_SESSION['lockout_time']) && time() < $_SESSION['lockout_time']) {
                $remaining = $_SESSION['lockout_time'] - time();
                echo json_encode([
                    'status' => 'locked', 
                    'message' => "Too many failed attempts. Locked out.", 
                    'remaining' => $remaining
                ]);
                exit;
            }

            $username = $_POST['username'] ?? '';
            $password = $_POST['password'] ?? '';

            $stmt = $pdo->prepare("
                SELECT u.id, u.username, u.password, u.role, e.first_name, e.last_name 
                FROM users u
                LEFT JOIN employees e ON u.employee_id = e.employee_id
                WHERE u.username = :username
            ");
            $stmt->execute([':username' => $username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // --- 2. VERIFY PASSWORD ---
            if ($user && password_verify($password, $user['password'])) {
                // SUCCESS: Reset the penalty counters
                unset($_SESSION['login_attempts']);
                unset($_SESSION['lockout_time']);

                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['role'] = $user['role'];
                $_SESSION['full_name'] = $user['first_name'] ? $user['first_name'] . ' ' . $user['last_name'] : 'Administrator';

                // START THE TIMEOUT CLOCK!
                $_SESSION['last_activity'] = time();

                echo json_encode(['status' => 'success', 'message' => 'Login successful']);
            } else {
                // FAILURE: Increase the strike counter
                $_SESSION['login_attempts'] = isset($_SESSION['login_attempts']) ? $_SESSION['login_attempts'] + 1 : 1;
                $max_free_attempts = 3;

                if ($_SESSION['login_attempts'] >= $max_free_attempts) {
                    // Progressive Math: 30s, then 60s, then 120s, then 240s...
                    $multiplier = $_SESSION['login_attempts'] - $max_free_attempts;
                    $penalty_seconds = 30 * pow(2, $multiplier); 
                    
                    $_SESSION['lockout_time'] = time() + $penalty_seconds;

                    echo json_encode([
                        'status' => 'locked', 
                        'message' => "Too many failed attempts.", 
                        'remaining' => $penalty_seconds
                    ]);
                } else {
                    $attempts_left = $max_free_attempts - $_SESSION['login_attempts'];
                    echo json_encode([
                        'status' => 'error', 
                        'message' => "Invalid credentials. $attempts_left attempt(s) remaining."
                    ]);
                }
            }
        }
        break;

    case 'logout':
        session_unset();
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

    case 'get_available_items':
        try {
            // Only fetch items where quantity is greater than 0
            $stmt = $pdo->query("
                SELECT inventory_id, name, description, quantity, unit_price 
                FROM inventory_items 
                WHERE quantity > 0 
                ORDER BY name ASC
            ");
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['status' => 'success', 'data' => $items]);
        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => 'Failed to fetch items: ' . $e->getMessage()]);
        }
        break; 

    case 'get_suppliers':
        // UPDATED: Now fetches ALL columns so the edit modal gets the email, phone, etc.
        $stmt = $pdo->query("SELECT * FROM suppliers ORDER BY name ASC");
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

    case 'get_issued_items':
        try {
            // Join transactions with inventory to get the item names
            $stmt = $pdo->query("
                SELECT 
                    t.transaction_id, 
                    t.transaction_date, 
                    t.qty_issued, 
                    i.inventory_id, 
                    i.name, 
                    i.description 
                FROM inventory_transactions t
                JOIN inventory_items i ON t.inventory_id = i.inventory_id
                ORDER BY t.transaction_date DESC
            ");
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['status' => 'success', 'data' => $data]);
        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    // ---------------------------------------------------------
    // NEW VENDOR MANAGEMENT ENDPOINTS
    // ---------------------------------------------------------

    case 'get_vendor_history':
        $supplier_id = $_GET['supplier_id'] ?? 0;
        try {
            $stmt = $pdo->prepare("SELECT po_id, order_date, total_amount, status FROM purchase_orders WHERE supplier_id = ? ORDER BY order_date DESC");
            $stmt->execute([$supplier_id]);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['status' => 'success', 'data' => $data]);
        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'add_supplier':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $name = $_POST['name'] ?? '';
            $person = $_POST['contact_person'] ?? '';
            $phone = $_POST['phone'] ?? '';
            $email = $_POST['email'] ?? '';
            $address = $_POST['address'] ?? '';

            try {
                $stmt = $pdo->prepare("INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$name, $person, $phone, $email, $address]);
                echo json_encode(['status' => 'success', 'message' => 'Vendor added successfully.']);
            } catch (Exception $e) {
                echo json_encode(['status' => 'error', 'message' => 'Failed to add vendor: ' . $e->getMessage()]);
            }
        }
        break;

    case 'update_supplier':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = $_POST['supplier_id'] ?? '';
            $name = $_POST['name'] ?? '';
            $person = $_POST['contact_person'] ?? '';
            $phone = $_POST['phone'] ?? '';
            $email = $_POST['email'] ?? '';
            $address = $_POST['address'] ?? '';

            try {
                $stmt = $pdo->prepare("UPDATE suppliers SET name=?, contact_person=?, phone=?, email=?, address=? WHERE supplier_id=?");
                $stmt->execute([$name, $person, $phone, $email, $address, $id]);
                echo json_encode(['status' => 'success', 'message' => 'Vendor updated successfully.']);
            } catch (Exception $e) {
                echo json_encode(['status' => 'error', 'message' => 'Failed to update vendor: ' . $e->getMessage()]);
            }
        }
        break;

    case 'delete_supplier':
        if ($_SESSION['role'] !== 'admin') {
            echo json_encode(['status' => 'error', 'message' => 'Access Denied: Admins only.']);
            break;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = $_POST['supplier_id'] ?? '';
            try {
                $stmt = $pdo->prepare("DELETE FROM suppliers WHERE supplier_id = ?");
                $stmt->execute([$id]);
                echo json_encode(['status' => 'success', 'message' => 'Vendor deleted successfully.']);
            } catch (PDOException $e) {
                // Catches Foreign Key constraint if supplier has active inventory/POs
                if ($e->getCode() == '23000') {
                    echo json_encode(['status' => 'error', 'message' => 'Cannot delete: Vendor is tied to existing items or Purchase Orders.']);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Failed to delete: ' . $e->getMessage()]);
                }
            }
        }
        break;

    // ---------------------------------------------------------
    // END VENDOR MANAGEMENT ENDPOINTS
    // ---------------------------------------------------------

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
        if ($_SESSION['role'] !== 'admin') {
            echo json_encode(['status' => 'error', 'message' => 'Access Denied: Admins only.']);
            break;
        }

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
            $id = $_POST['inventory_id'] ?? null;
            $issue_qty = (int)($_POST['issue_qty'] ?? 0);

            if (!$id || $issue_qty <= 0) {
                echo json_encode(['status' => 'error', 'message' => 'Invalid ID or Quantity.']);
                break;
            }

            try {
                $pdo->beginTransaction();
                
                // 1. Check current stock before deducting
                $stmtCheck = $pdo->prepare("SELECT name, quantity FROM inventory_items WHERE inventory_id = ?");
                $stmtCheck->execute([$id]);
                $item = $stmtCheck->fetch(PDO::FETCH_ASSOC);

                if (!$item) {
                    throw new Exception("Item not found in the database.");
                }
                
                // 2. Prevent negative inventory
                if ($item['quantity'] < $issue_qty) {
                    throw new Exception("Insufficient stock! You requested $issue_qty, but only {$item['quantity']} are available.");
                }

                // 3. Subtract the quantity safely
                $stmt = $pdo->prepare("UPDATE inventory_items SET quantity = quantity - ? WHERE inventory_id = ?");
                $stmt->execute([$issue_qty, $id]);
                
                // 4. Log the transaction for the predictive engine
                $logStmt = $pdo->prepare("INSERT INTO inventory_transactions (inventory_id, qty_issued) VALUES (?, ?)");
                $logStmt->execute([$id, $issue_qty]);

                $pdo->commit();
                echo json_encode([
                    'status' => 'success', 
                    'message' => "Successfully issued $issue_qty unit(s) of {$item['name']}."
                ]);
                
            } catch (Exception $e) {
                $pdo->rollBack();
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            }
        }
        break;

        case 'get_po_details':
        $po_id = $_GET['po_id'] ?? 0;
        try {
            // Join purchase_items with inventory_items to get the actual item name
            $stmt = $pdo->prepare("
                SELECT pi.quantity, pi.unit_price, i.name 
                FROM purchase_items pi
                JOIN inventory_items i ON pi.inventory_id = i.inventory_id
                WHERE pi.po_id = ?
            ");
            $stmt->execute([$po_id]);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['status' => 'success', 'data' => $data]);
        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;
    
    case 'get_pos':
        try {
            $stmt = $pdo->query("
                SELECT 
                    po.po_id, po.order_date, s.name as supplier_name, 
                    po.total_amount, po.status, i.name as item_name,
                    pi.quantity as item_qty, pi.unit_price, s.supplier_id
                FROM purchase_orders po
                JOIN suppliers s ON po.supplier_id = s.supplier_id
                LEFT JOIN purchase_items pi ON po.po_id = pi.po_id
                LEFT JOIN inventory_items i ON pi.inventory_id = i.inventory_id
                ORDER BY po.po_id DESC
            ");
            $pos = $stmt->fetchAll();
            echo json_encode(['status' => 'success', 'data' => $pos]);
        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        }
        break;

    case 'auto_restock':
        try {
            $stmt = $pdo->query("SELECT * FROM inventory_items WHERE quantity <= reorder_level");
            $low_stock_items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (count($low_stock_items) === 0) {
                echo json_encode(['status' => 'error', 'message' => 'All stock levels are currently healthy. Nothing to restock.']);
                exit;
            }

            $pdo->beginTransaction();
            $po_created_count = 0;

            foreach ($low_stock_items as $item) {
                $order_qty = ($item['reorder_level'] > 0) ? $item['reorder_level'] : 10;
                $total_amount = $order_qty * $item['unit_price'];

                // 1. Create the Main Order Wrapper
                $insertPo = $pdo->prepare("
                    INSERT INTO purchase_orders (supplier_id, order_date, total_amount, status) 
                    VALUES (?, NOW(), ?, 'Pending')
                ");
                $insertPo->execute([$item['supplier_id'], $total_amount]);
                $new_po_id = $pdo->lastInsertId();

                // 2. Insert the actual Item details into purchase_items
                $insertItem = $pdo->prepare("
                    INSERT INTO purchase_items (po_id, inventory_id, quantity, unit_price) 
                    VALUES (?, ?, ?, ?)
                ");
                $insertItem->execute([$new_po_id, $item['inventory_id'], $order_qty, $item['unit_price']]);
                
                $po_created_count++;
            }

            $pdo->commit();
            echo json_encode(['status' => 'success', 'message' => "Successfully generated $po_created_count individual Purchase Order(s)."]);

        } catch (Exception $e) {
            $pdo->rollBack();
            echo json_encode(['status' => 'error', 'message' => 'System Error: ' . $e->getMessage()]);
        }
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
                // Changed 'Ordered' to 'Pending'
                $stmt = $pdo->prepare("INSERT INTO purchase_orders (supplier_id, order_date, total_amount, status) VALUES (?, ?, ?, 'Pending')");
                $stmt->execute([$supplier_id, $order_date, $total_amount]);
                $po_id = $pdo->lastInsertId();

                $stmt2 = $pdo->prepare("INSERT INTO purchase_items (po_id, inventory_id, quantity, unit_price) VALUES (?, ?, ?, ?)");
                $stmt2->execute([$po_id, $inventory_id, $quantity, $unit_price]);

                $pdo->commit();
                echo json_encode(['status' => 'success', 'message' => 'Purchase Order created and sent to Finance for approval.']);
            } catch (Exception $e) {
                $pdo->rollBack();
                echo json_encode(['status' => 'error', 'message' => 'Failed to create PO: ' . $e->getMessage()]);
            }
        }
        break;

    case 'update_po_qty':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $po_id = $_POST['po_id'];
            $new_quantity = (int)$_POST['new_quantity'];

            try {
                $pdo->beginTransaction();

                // 1. Get the unit price for this PO item
                $stmt1 = $pdo->prepare("SELECT unit_price FROM purchase_items WHERE po_id = ?");
                $stmt1->execute([$po_id]);
                $item = $stmt1->fetch();

                if (!$item) throw new Exception("PO Item not found.");

                $unit_price = $item['unit_price'];
                $new_total = $new_quantity * $unit_price;

                // 2. Update Quantity in purchase_items
                $stmt2 = $pdo->prepare("UPDATE purchase_items SET quantity = ? WHERE po_id = ?");
                $stmt2->execute([$new_quantity, $po_id]);

                // 3. Update Total Amount in purchase_orders (Ensure it's still Pending)
                $stmt3 = $pdo->prepare("UPDATE purchase_orders SET total_amount = ? WHERE po_id = ? AND status = 'Pending'");
                $stmt3->execute([$new_total, $po_id]);

                if ($stmt3->rowCount() == 0) throw new Exception("Cannot update. PO might already be approved by Finance.");

                $pdo->commit();
                echo json_encode(['status' => 'success', 'message' => 'PO Quantity and Total Price updated successfully.']);
            } catch (Exception $e) {
                $pdo->rollBack();
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            }
        }
        break;

    case 'update_po_status':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $po_id = $_POST['po_id'] ?? null;
            $new_status = $_POST['status'] ?? '';

            // 1. Strict Validation: Match your database ENUM exactly
            $allowed_statuses = ['Pending', 'Approved', 'Received', 'Missing', 'Issues', 'Cancelled'];

            if (!$po_id || !in_array($new_status, $allowed_statuses)) {
                echo json_encode(['status' => 'error', 'message' => 'Invalid Purchase Order ID or Status.']);
                break;
            }

            try {
                // 2. Prevent status changes if the PO is already permanently finalized
                $stmt = $pdo->prepare("
                    UPDATE purchase_orders 
                    SET status = ? 
                    WHERE po_id = ? AND status NOT IN ('Received', 'Cancelled')
                ");
                $stmt->execute([$new_status, $po_id]);

                // 3. Verify that the database actually made a change
                if ($stmt->rowCount() > 0) {
                    echo json_encode([
                        'status' => 'success', 
                        'message' => "Purchase Order #$po_id successfully updated to '$new_status'."
                    ]);
                } else {
                    echo json_encode([
                        'status' => 'error', 
                        'message' => "Could not update. PO #$po_id may not exist or is already finalized."
                    ]);
                }

            } catch (PDOException $e) {
                echo json_encode(['status' => 'error', 'message' => 'Database Error: ' . $e->getMessage()]);
            } catch (Exception $e) {
                echo json_encode(['status' => 'error', 'message' => 'System Error: ' . $e->getMessage()]);
            }
        }
        break;

    case 'receive_po':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $po_id = $_POST['po_id'];

            try {
                $pdo->beginTransaction();

                // 1. Explicitly check the current status in the database first
                $checkStmt = $pdo->prepare("SELECT status FROM purchase_orders WHERE po_id = ?");
                $checkStmt->execute([$po_id]);
                $current_po = $checkStmt->fetch(PDO::FETCH_ASSOC);

                if (!$current_po) {
                    throw new Exception("Purchase Order #$po_id not found in the database.");
                }

                if ($current_po['status'] === 'Received') {
                    throw new Exception("This PO has already been received and added to inventory.");
                }

                // Make sure it matches exactly (Case sensitive)
                if (strtolower($current_po['status']) !== 'approved') {
                    throw new Exception("Cannot receive. The database says this PO is currently '" . $current_po['status'] . "', but it must be 'Approved'.");
                }

                // 2. Update PO status to Received
                $stmt = $pdo->prepare("UPDATE purchase_orders SET status = 'Received' WHERE po_id = ?");
                $stmt->execute([$po_id]);

                // 3. Get the items from this PO
                $stmtItems = $pdo->prepare("SELECT inventory_id, quantity FROM purchase_items WHERE po_id = ?");
                $stmtItems->execute([$po_id]);
                $items = $stmtItems->fetchAll();

                // 4. Loop through items and update inventory stock
                $updateStock = $pdo->prepare("UPDATE inventory_items SET quantity = quantity + ? WHERE inventory_id = ?");
                foreach ($items as $item) {
                    $updateStock->execute([$item['quantity'], $item['inventory_id']]);
                }

                // 5. 🔥 FINANCE INTEGRATION: Generate Vendor Payment (Invoice) 🔥
                $stmtPo = $pdo->prepare("SELECT supplier_id, total_amount FROM purchase_orders WHERE po_id = ?");
                $stmtPo->execute([$po_id]);
                $poData = $stmtPo->fetch();

                $stmtFinance = $pdo->prepare("INSERT INTO vendor_payments (supplier_id, po_id, pay_date, amount) VALUES (?, ?, ?, ?)");
                $stmtFinance->execute([
                    $poData['supplier_id'], 
                    $po_id, 
                    date('Y-m-d'), 
                    $poData['total_amount']
                ]);

                $pdo->commit();
                echo json_encode(['status' => 'success', 'message' => 'PO Received! Stock updated & Finance invoiced.']);
                
            } catch (Exception $e) {
                $pdo->rollBack();
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            }
        }
        break;

    case 'cancel_po':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $po_id = $_POST['po_id'];
            try {
                // Only allow cancellation if it hasn't been received yet!
                $stmt = $pdo->prepare("UPDATE purchase_orders SET status = 'Cancelled' WHERE po_id = ? AND status != 'Received'");
                $stmt->execute([$po_id]);
                
                if($stmt->rowCount() > 0) {
                    echo json_encode(['status' => 'success', 'message' => 'Purchase Order Cancelled.']);
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Cannot cancel this PO.']);
                }
            } catch (Exception $e) {
                echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
            }
        }
        break;

    case 'issue_item':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = $_POST['inventory_id'];
            $issue_qty = (int)$_POST['issue_qty'];

            try {
                $pdo->beginTransaction();

                // 1. Subtract the quantity
                $stmt = $pdo->prepare("UPDATE inventory_items SET quantity = GREATEST(0, quantity - ?) WHERE inventory_id = ?");
                $stmt->execute([$issue_qty, $id]);
                
                // 2. NEW: Log the transaction so we can predict future burn rates
                $logStmt = $pdo->prepare("INSERT INTO inventory_transactions (inventory_id, qty_issued) VALUES (?, ?)");
                $logStmt->execute([$id, $issue_qty]);

                $pdo->commit();
                echo json_encode(['status' => 'success', 'message' => "Successfully issued $issue_qty item(s)."]);
            } catch (Exception $e) {
                $pdo->rollBack();
                echo json_encode(['status' => 'error', 'message' => 'Failed to issue item: ' . $e->getMessage()]);
            }
        }
        break;

    case 'get_inventory':
        // NEW: We join the last 30 days of transactions to calculate the Burn Rate
        $stmt = $pdo->query("
            SELECT 
                i.*, 
                s.name as supplier_name,
                COALESCE(SUM(t.qty_issued), 0) as issued_last_30_days
            FROM inventory_items i 
            LEFT JOIN suppliers s ON i.supplier_id = s.supplier_id
            LEFT JOIN inventory_transactions t ON i.inventory_id = t.inventory_id 
                AND t.transaction_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY i.inventory_id
            ORDER BY i.name ASC
        ");
        
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Calculate Predictive Metrics in PHP
        foreach($items as &$item) {
            // Average per day over the last 30 days
            $daily_burn = $item['issued_last_30_days'] / 30;
            $item['daily_burn_rate'] = round($daily_burn, 2);
            
            // Forecast: How many days until we hit 0?
            if ($daily_burn > 0) {
                $item['days_to_stockout'] = floor($item['quantity'] / $daily_burn);
            } else {
                // If 0 burn rate, they have a "Safe" 999 days
                $item['days_to_stockout'] = 999; 
            }
        }

        echo json_encode(['status' => 'success', 'data' => $items]);
        break;

    case 'get_analytics':
        try {
            // 1. DESCRIPTIVE: Valuations & Item Count
            $stmt1 = $pdo->query("SELECT SUM(quantity * unit_price) as total_value, COUNT(inventory_id) as total_items FROM inventory_items");
            $inv_stats = $stmt1->fetch(PDO::FETCH_ASSOC);

            // 2. DIAGNOSTIC: Total Spend & Turnover
            $stmt4 = $pdo->query("SELECT SUM(total_amount) as total_spend FROM purchase_orders WHERE status = 'Received'");
            $po_stats = $stmt4->fetch(PDO::FETCH_ASSOC);

            $total_value = $inv_stats['total_value'] ?? 0;
            $total_spend = $po_stats['total_spend'] ?? 0;
            $turnover_ratio = ($total_value > 0) ? ($total_spend / $total_value) : 0;

            // Strict-Mode Safe: Added s.name to GROUP BY
            $stmt5 = $pdo->query("
                SELECT s.name as category_name, SUM(po.total_amount) as category_spend 
                FROM purchase_orders po 
                JOIN suppliers s ON po.supplier_id = s.supplier_id 
                WHERE po.status = 'Received'
                GROUP BY s.supplier_id, s.name
            ");
            $spend_by_category = $stmt5->fetchAll(PDO::FETCH_ASSOC);

            // Strict-Mode Safe: Added s.name to GROUP BY
            $stmt6 = $pdo->query("
                SELECT s.name as supplier_name, SUM(i.quantity * i.unit_price) as supplier_value 
                FROM inventory_items i 
                JOIN suppliers s ON i.supplier_id = s.supplier_id 
                GROUP BY s.supplier_id, s.name
            ");
            $valuation_data = $stmt6->fetchAll(PDO::FETCH_ASSOC);

            // 3. PREDICTIVE: Calculate Burn Rates (100% Strict-Mode Safe)
            $stmtPredict = $pdo->query("
                SELECT 
                    i.inventory_id,
                    i.name, 
                    i.quantity, 
                    (COALESCE(SUM(t.qty_issued), 0) / 30) as daily_burn
                FROM inventory_items i
                LEFT JOIN inventory_transactions t ON i.inventory_id = t.inventory_id 
                    AND t.transaction_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY i.inventory_id, i.name, i.quantity
                HAVING (COALESCE(SUM(t.qty_issued), 0) / 30) > 0 
                   AND (i.quantity / (COALESCE(SUM(t.qty_issued), 0) / 30)) <= 7
                ORDER BY (i.quantity / (COALESCE(SUM(t.qty_issued), 0) / 30)) ASC
                LIMIT 5
            ");
            $predictive_data = $stmtPredict->fetchAll(PDO::FETCH_ASSOC);

            $issuedStmt = $pdo->query("
                SELECT COALESCE(SUM(qty_issued), 0) as total_issued 
                FROM inventory_transactions 
                WHERE transaction_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
            ");
            $issued_30_days = $issuedStmt->fetch(PDO::FETCH_ASSOC)['total_issued'];

            // Calculate explicit days for the JSON payload
            foreach($predictive_data as &$pred) {
                $pred['days_left'] = floor($pred['quantity'] / $pred['daily_burn']);
            }

            // 4. PRESCRIPTIVE: Find exact number of low stock items
            $stmt2 = $pdo->query("SELECT COUNT(inventory_id) as low_stock FROM inventory_items WHERE quantity <= reorder_level");
            $shortages = $stmt2->fetch(PDO::FETCH_ASSOC);

            // Send perfect JSON back to the browser
            echo json_encode([
                'status' => 'success', 
                'data' => [
                    'total_value' => $total_value,
                    'total_items' => $inv_stats['total_items'] ?? 0,
                    'low_stock' => $shortages['low_stock'] ?? 0,
                    'total_spend' => $total_spend,
                    'turnover_ratio' => round($turnover_ratio, 2),
                    'issued_30_days' => $issued_30_days,
                    'spend_by_category' => $spend_by_category,
                    'valuation_data' => $valuation_data,
                    'predictions' => $predictive_data
                ]
            ]);

        } catch (PDOException $e) {
            // 🔥 THE SAFETY NET: If the database fails, it tells us EXACTLY why instead of a 500 error!
            echo json_encode(['status' => 'error', 'message' => 'Database Error: ' . $e->getMessage()]);
        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => 'System Error: ' . $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
        break;
}
?>