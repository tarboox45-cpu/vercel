export default function handler(req, res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TARBOO Suite - Protected Installer</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }
        
        body {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #e2e8f0;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .container {
            width: 100%;
            max-width: 500px;
            background: rgba(30, 41, 59, 0.8);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .logo-icon {
            font-size: 42px;
            color: #3b82f6;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        h1 {
            font-size: 32px;
            font-weight: 700;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 8px;
        }
        
        .subtitle {
            color: #94a3b8;
            font-size: 14px;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        
        .version {
            display: inline-block;
            background: rgba(59, 130, 246, 0.2);
            color: #3b82f6;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 10px;
        }
        
        .password-section {
            margin-bottom: 30px;
        }
        
        .form-group {
            margin-bottom: 25px;
        }
        
        label {
            display: block;
            margin-bottom: 10px;
            color: #cbd5e1;
            font-weight: 500;
            font-size: 14px;
        }
        
        .password-input {
            position: relative;
        }
        
        input[type="password"] {
            width: 100%;
            padding: 16px 20px;
            background: rgba(15, 23, 42, 0.6);
            border: 2px solid #334155;
            border-radius: 12px;
            color: #f1f5f9;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        
        input[type="password"]:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        
        input[type="password"]::placeholder {
            color: #64748b;
        }
        
        .toggle-password {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #94a3b8;
            cursor: pointer;
            font-size: 18px;
        }
        
        .verify-btn {
            width: 100%;
            padding: 16px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        
        .verify-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
        }
        
        .verify-btn:active {
            transform: translateY(0);
        }
        
        .error-message {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fecaca;
            padding: 12px 20px;
            border-radius: 10px;
            margin-top: 20px;
            display: none;
            align-items: center;
            gap: 10px;
            font-size: 14px;
        }
        
        .success-section {
            display: none;
            margin-top: 30px;
        }
        
        .command-box {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 25px;
            position: relative;
        }
        
        .command-label {
            display: block;
            color: #94a3b8;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }
        
        .command {
            font-family: 'Courier New', monospace;
            background: #0f172a;
            color: #10b981;
            padding: 15px;
            border-radius: 8px;
            font-size: 14px;
            word-break: break-all;
            border: 1px solid #1e293b;
        }
        
        .copy-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(59, 130, 246, 0.2);
            color: #3b82f6;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .copy-btn:hover {
            background: rgba(59, 130, 246, 0.3);
        }
        
        .instructions {
            background: rgba(6, 95, 70, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 12px;
            padding: 20px;
        }
        
        .instructions h3 {
            color: #10b981;
            margin-bottom: 15px;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .instructions ol {
            margin-left: 20px;
            color: #cbd5e1;
        }
        
        .instructions li {
            margin-bottom: 10px;
            line-height: 1.5;
        }
        
        .token-info {
            background: rgba(139, 92, 246, 0.1);
            border: 1px solid rgba(139, 92, 246, 0.2);
            border-radius: 8px;
            padding: 12px;
            margin-top: 15px;
            font-size: 12px;
            color: #c4b5fd;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #64748b;
            font-size: 12px;
            border-top: 1px solid #334155;
            padding-top: 20px;
        }
        
        .hidden {
            display: none;
        }
        
        @media (max-width: 600px) {
            .container {
                padding: 25px;
            }
            
            h1 {
                font-size: 28px;
            }
            
            input[type="password"], .verify-btn {
                padding: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <i class="fas fa-server logo-icon"></i>
                <div>
                    <h1>TARBOO Suite</h1>
                    <p class="subtitle">Server Management Platform</p>
                </div>
            </div>
            <span class="version">v6.0</span>
        </div>
        
        <div class="password-section" id="passwordSection">
            <div class="form-group">
                <label for="password">
                    <i class="fas fa-key"></i> Installation Password
                </label>
                <div class="password-input">
                    <input 
                        type="password" 
                        id="password" 
                        placeholder="Enter the secret password"
                        autocomplete="off"
                        autofocus
                    >
                    <button type="button" class="toggle-password" id="togglePassword">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
                <p style="color: #64748b; font-size: 12px; margin-top: 8px;">
                    Contact the administrator to get the password
                </p>
            </div>
            
            <button class="verify-btn" onclick="verifyPassword()">
                <i class="fas fa-shield-check"></i>
                Verify & Generate Installer
            </button>
            
            <div class="error-message" id="errorMessage">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Invalid password. Please try again.</span>
            </div>
        </div>
        
        <div class="success-section" id="successSection">
            <div class="command-box">
                <span class="command-label">
                    <i class="fas fa-terminal"></i> Installation Command
                </span>
                <pre class="command" id="installCommand"></pre>
                <button class="copy-btn" onclick="copyCommand()">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
            
            <div class="token-info">
                <i class="fas fa-clock"></i>
                <span id="tokenTimer">This token expires in <strong>5:00</strong> minutes</span>
            </div>
            
            <div class="instructions">
                <h3><i class="fas fa-book"></i> How to Install</h3>
                <ol>
                    <li>Copy the command above</li>
                    <li>Open your terminal as <strong>root user</strong></li>
                    <li>Paste and execute the command</li>
                    <li>Follow the interactive installation wizard</li>
                    <li>The installer will handle everything automatically</li>
                </ol>
            </div>
            
            <div class="footer">
                <p>
                    <i class="fas fa-lock"></i> Secure Installation • 
                    <i class="fas fa-cube"></i> All-in-One Suite • 
                    <i class="fas fa-bolt"></i> Automated Setup
                </p>
                <p style="margin-top: 10px; color: #475569;">
                    © 2024 TARBOO Team • This installer is password protected
                </p>
            </div>
        </div>
    </div>

    <script>
        let countdownInterval;
        let expirationTime;
        
        // Toggle password visibility
        document.getElementById('togglePassword').addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
        
        // Allow Enter key to submit
        document.getElementById('password').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                verifyPassword();
            }
        });
        
        async function verifyPassword() {
            const password = document.getElementById('password').value.trim();
            const errorMessage = document.getElementById('errorMessage');
            
            if (!password) {
                showError('Please enter the password');
                return;
            }
            
            // Show loading state
            const verifyBtn = document.querySelector('.verify-btn');
            const originalText = verifyBtn.innerHTML;
            verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
            verifyBtn.disabled = true;
            
            try {
                const response = await fetch('/api/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Success
                    document.getElementById('passwordSection').style.display = 'none';
                    document.getElementById('successSection').style.display = 'block';
                    
                    // Generate installation command with token
                    const command = \`bash <(curl -fsSL "\${window.location.origin}/download?token=\${data.token}")\`;
                    document.getElementById('installCommand').textContent = command;
                    
                    // Start countdown timer
                    expirationTime = Date.now() + (data.expires_in * 1000);
                    startCountdown();
                    
                    // Auto-scroll to command
                    document.getElementById('successSection').scrollIntoView({ 
                        behavior: 'smooth' 
                    });
                } else {
                    showError(data.error || 'Invalid password');
                }
            } catch (error) {
                showError('Network error. Please try again.');
            } finally {
                // Restore button
                verifyBtn.innerHTML = originalText;
                verifyBtn.disabled = false;
            }
        }
        
        function showError(message) {
            const errorElement = document.getElementById('errorMessage');
            errorElement.querySelector('span').textContent = message;
            errorElement.style.display = 'flex';
            
            // Hide error after 5 seconds
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
        
        function copyCommand() {
            const command = document.getElementById('installCommand').textContent;
            navigator.clipboard.writeText(command).then(() => {
                // Show success feedback
                const copyBtn = document.querySelector('.copy-btn');
                const originalHtml = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                copyBtn.style.background = 'rgba(16, 185, 129, 0.2)';
                copyBtn.style.color = '#10b981';
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalHtml;
                    copyBtn.style.background = 'rgba(59, 130, 246, 0.2)';
                    copyBtn.style.color = '#3b82f6';
                }, 2000);
            });
        }
        
        function startCountdown() {
            function updateTimer() {
                const now = Date.now();
                const timeLeft = expirationTime - now;
                
                if (timeLeft <= 0) {
                    clearInterval(countdownInterval);
                    document.getElementById('tokenTimer').innerHTML = 
                        '<i class="fas fa-exclamation-triangle"></i> Token expired. Please regenerate.';
                    return;
                }
                
                const minutes = Math.floor(timeLeft / 60000);
                const seconds = Math.floor((timeLeft % 60000) / 1000);
                
                document.getElementById('tokenTimer').innerHTML = 
                    \`<i class="fas fa-clock"></i> This token expires in <strong>\${minutes}:\${seconds.toString().padStart(2, '0')}</strong> minutes\`;
            }
            
            updateTimer();
            countdownInterval = setInterval(updateTimer, 1000);
        }
        
        // Clear interval on page unload
        window.addEventListener('beforeunload', () => {
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
        });
    </script>
</body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}