#!/bin/bash

set -e

echo "=============================="
echo " AWS Ubuntu Root Auto Setup "
echo "=============================="

# تأكد إنك root
if [ "$EUID" -ne 0 ]; then
  echo "❌ شغّل الاسكربت كـ root فقط"
  exit 1
fi

# طلب باسورد root
echo ""
echo "🔐 ادخل باسورد جديد للـ root:"
passwd root

# تغيير hostname
HOSTNAME_NEW="Server"
echo ""
echo "🖥️ تغيير اسم السيرفر إلى: $HOSTNAME_NEW"
hostnamectl set-hostname "$HOSTNAME_NEW"

# تعديل /etc/hosts
echo "📝 تحديث /etc/hosts"
sed -i "s/127.0.1.1.*/127.0.1.1 $HOSTNAME_NEW/g" /etc/hosts || true
grep -q "127.0.1.1" /etc/hosts || echo "127.0.1.1 $HOSTNAME_NEW" >> /etc/hosts

# نسخة احتياطية من sshd_config
echo "📦 أخذ نسخة احتياطية من sshd_config"
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak.$(date +%F_%T)

# تعديل إعدادات SSH
echo "🔧 تعديل إعدادات SSH"
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/^#\?PubkeyAuthentication.*/PubkeyAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/^#\?KbdInteractiveAuthentication.*/KbdInteractiveAuthentication yes/' /etc/ssh/sshd_config

# تحقق من صحة ملف SSH
echo "🧪 فحص إعدادات SSH"
sshd -t

# إعادة تشغيل SSH
echo "🔄 إعادة تشغيل SSH"
systemctl restart ssh || systemctl restart sshd

echo ""
echo "✅ تم التنفيذ بنجاح"
echo "--------------------------------"
echo "🔑 يمكنك الآن الدخول باستخدام:"
echo "ssh root@IP"
echo ""
echo "🖥️ سيظهر البرومبت:"
echo "root@Server:~#"
echo "--------------------------------"
