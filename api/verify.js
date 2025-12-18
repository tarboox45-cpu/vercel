export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }
  
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: 'Password is required'
      });
    }
    
    // الباسوورد الافتراضي (يجب تغييره في Environment Variables)
    const SECRET_PASSWORD = process.env.TARBOO_PASSWORD || "TARBOO_2024_SECURE";
    
    // التحقق من الباسوورد
    if (password !== SECRET_PASSWORD) {
      // تسجيل محاولة فاشلة (يمكنك إضافة منطق logging هنا)
      console.warn(`Failed password attempt: ${new Date().toISOString()}`);
      
      return res.status(401).json({
        success: false,
        error: 'Invalid password'
      });
    }
    
    // إنشاء توكن فريد
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const token = Buffer.from(`${timestamp}:${randomString}`).toString('base64');
    
    // تنظيف التوكن من الأحرف الخاصة
    const cleanToken = token.replace(/[^a-zA-Z0-9]/g, '');
    
    // إرجاع التوكن مع معلومات إضافية
    res.status(200).json({
      success: true,
      token: cleanToken,
      expires_in: 300, // 5 دقائق بالثواني
      generated_at: new Date().toISOString(),
      message: 'Token generated successfully. Use it within 5 minutes.'
    });
    
  } catch (error) {
    console.error('Verification error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}