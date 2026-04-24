<!-- LOGIN -->

<div id="loginSection" class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="card shadow border-0" style="width: 100%; max-width: 400px; border-radius: 20px;">
    <div class="card-body p-5">
        <div class="text-center mb-4">
        <div class="bg-primary bg-opacity-10 text-primary d-inline-flex p-3 rounded-circle mb-3">
            <i class="bi bi-shield-lock fs-1"></i>
        </div>
        <h3 class="fw-bold text-dark">Welcome Back</h3>
        <p class="text-muted small">Please sign in to ICIS Inventory
            <!-- <?php echo password_hash("john123", PASSWORD_DEFAULT)?> -->

        </p>
        </div>
        
        <div id="loginAlert"></div>
        
        <form id="loginForm">
        <div class="form-floating mb-3">
            <input type="text" class="form-control bg-light border-0" id="username" name="username" placeholder="Username" required>
            <label for="username" class="text-muted"><i class="bi bi-person me-2"></i>Username</label>
        </div>
        <div class="form-floating mb-4">
            <input type="password" class="form-control bg-light border-0" id="password" name="password" placeholder="Password" required>
            <label for="password" class="text-muted"><i class="bi bi-key me-2"></i>Password</label>
        </div>
        <button type="submit" class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm">
            Sign In <i class="bi bi-arrow-right ms-2"></i>
        </button>
        </form>
    </div>
    </div>
</div>