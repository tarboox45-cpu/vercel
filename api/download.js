export default function handler(req, res) {
  try {
    // سجل طلب الدخول للمساعدة في التتبع
    console.log('[TARBOO] Download endpoint called');
    
    const { token } = req.query;
    
    // 1. تحقق بسيط من وجود التوكن
    if (!token || token.length < 10) {
      console.log('[TARBOO] Invalid token - returning 401');
      return res.status(401).send(`#!/bin/bash
echo "========================================="
echo "ERROR: UNAUTHORIZED ACCESS"
echo "========================================="
echo "Invalid or missing installation token."
echo ""
echo "Please go back to:"
echo "https://vercel-ncp1.vercel.app"
echo "And generate a new token with your password."
echo "========================================="
exit 1`);
    }
    
    console.log(`[TARBOO] Token validated: ${token.substring(0, 15)}...`);
    
    // 2. النص الأساسي للمثبت - بدون أي مشاكل في بناء الجملة
    // تأكد من أن جميع التعابير ${...} مكتملة
    const currentDate = new Date().toISOString();
    
    const shellScript = `#!/bin/bash
# TARBOO Installer
# Generated: ${currentDate}
# Token: ${token}

echo "========================================="
echo "TARBOO Management Suite - Installer"
echo "========================================="
echo ""
echo "STATUS: Authorized"
echo "TOKEN: ${token}"
echo ""

# Check root privileges
if [ "\$EUID" -ne 0 ]; then 
  echo "ERROR: This script requires root privileges"
  echo "Please run as root: sudo -i"
  echo "Then execute this script again"
  exit 1
fi

echo "SUCCESS: Running with root privileges"
echo ""
echo "System check completed successfully."
echo ""
echo "The installer is now ready to proceed."
echo "Next steps will be guided interactively."
echo ""
echo "========================================="
exit 0`;

    // 3. إرسال الرد
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    
    console.log('[TARBOO] Sending installer script');
    res.status(200).send(shellScript);
    
  } catch (error) {
    // 4. معالجة الأخطاء
    console.error('[TARBOO] Server Error:', error.message, error.stack);
    
    res.status(500).send(`#!/bin/bash
echo "========================================="
echo "SERVER CONFIGURATION ERROR"
echo "========================================="
echo "The installer service encountered an issue."
echo ""
echo "Error details: ${error.message}"
echo ""
echo "Please try the following:"
echo "1. Generate a new token"
echo "2. Try again in 2 minutes"
echo "3. Contact support if issue persists"
echo "========================================="
exit 1`);
  }
}