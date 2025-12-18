import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/download', '/api/download'],
};

export default function middleware(request) {
  // الحصول على عنوان IP للمستخدم
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  // التحقق من معدل الطلبات (Rate Limiting)
  const rateLimitKey = `rate_limit_${ip}`;
  
  // هنا يمكنك إضافة منطق Rate Limiting إذا أردت
  
  return NextResponse.next();
}