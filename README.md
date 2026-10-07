# بلال كو | Bilal Koo - نظام أرشفة وإدارة المنتجات والباركود

تطبيق ويب وهاتف ذكي (PWA / Android APK) متكامل لأرشفة وإدارة المنتجات، الألوان، الباركود، والمخزون مع إمكانية المشاركة عالية الدقة عبر واتساب، والتخزين المحلي المتقدم والمزامنة السحابية الاختيارية عبر Firebase.

---

## 🌟 المميزات الرئيسية (Key Features)

1. **إدارة المنتجات والأرشفة المتقدمة:**
   - إضافة منتجات بألوان متعددة، أسعار، كميات، باركود/QR، وملاحظات.
   - دعم رفع **صور متعددة لكل قطعة** بدون قيود المساحة التقليدية.

2. **معالجة الذاكرة والصور (Android & Web):**
   - اعتماد **IndexedDB** كمخزن رئيسي فائق السعة للملفات والصور بدلاً من `LocalStorage` المحدود (5 ميجابايت)، مما يمنع نهائياً مشكلة اختفاء الصور أو فشل إضافة القطع التالية على الهواتف.

3. **مشاركة حقيقية عالية الدقة (HD Image Sharing):**
   - خيار مشاركة الصور بصيغة ملفات أصيلة (HD JPEGs) مباشرة إلى **واتساب، تليجرام، وتطبيقات التواصل**.
   - عدم الاكتفاء بنسخ النص، بل إرسال ملف الصورة الحقيقي مباشرة عبر قائمة مشاركة نظام الهاتف Native Share.

4. **تحديد الألوان الذكي والمرن:**
   - منتقي ألوان حديث (Color Picker) + درجات جاهزة ومخصصة مع إمكانية تسمية وتحديد الألوان بكل سهولة.

5. **تخزين محلي + مزامنة سحابية اختيارية (Firebase Cloud Sync):**
   - **الوضع المحلي:** التطبيق يعمل فوراً وبدون أي تسجيل دخول على الهاتف أو الكمبيوتر.
   - **الوضع السحابي (اختياري):** إمكانية ربط حساب **Google** بنقرة واحدة لرفع واستعادة أركيف المنتجات والتنقّل به بين مختلف الأجهزة بكل سلاسة.

6. **ماسح الباركود و الـ QR Code:**
   - قراءة الباركود مباشرة من كاميرا الهاتف والبحث الفوري عن المنتج.

7. **تجهيز كامـل لـ Android APK و PWA:**
   - معدّ ومجهز بالكامل للتحويل إلى تطبيق أندرويد عبر **Capacitor** ومثالي للتحميل والتثبيت المباشر.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Storage:** IndexedDB + LocalStorage fallback
- **Backend & Cloud (Optional):** Firebase Firestore, Firebase Authentication (Google Auth)
- **Mobile Integration:** Capacitor Android (`@capacitor/core`, `@capacitor/android`)
- **PWA:** `vite-plugin-pwa`
- **Barcode Reader:** `html5-qrcode`

---

## 🚀 كيفية التشغيل والتطوير المحلي (Local Setup)

### 1. تثبيت الحزم (Install Dependencies)
```bash
npm install
```

### 2. تشغيل خادم التطوير (Run Dev Server)
```bash
npm run dev
```
افتح المتصفح على: `http://localhost:3000`

### 3. الفحص والتحقق من الأخطاء (Lint & Type Check)
```bash
npm run lint
```

---

## 📱 بناء تطبيق أندرويد (Build Android APK)

التطبيق مجهز بحزم Capacitor للعمل على الهواتف الذكية:

1. **بناء النسخة وبناء ملفات الويب:**
   ```bash
   npm run build
   ```

2. **إضافة منصة أندرويد (في حال عدم وجودها):**
   ```bash
   npx cap add android
   ```

3. **مزامنة الملفات مع أندرويد:**
   ```bash
   npm run cap:build
   ```

4. **فتح المشروع في Android Studio لبناء ملف الـ APK:**
   ```bash
   npx cap open android
   ```
   *من داخل Android Studio: اختر `Build` -> `Build Bundle(s) / APK(s)` -> `Build APK(s)`.*

---

## ☁️ إعدادات Firebase (Firebase Setup)

مشروع Firebase و Firestore مضمن مع قواعد الأمان `firestore.rules` و `firebase-blueprint.json`:
- عند الحاجة لتعديل قواعد Firestore، يتم استخدام `firestore.rules`.
- بيانات الاعتماد محددة تلقائياً في `firebase-applet-config.json`.

---

## 📄 الترخيص (License)

هذا المشروع مخصص لـ **بلال كو - Bilal Koo** لجميع حقوق أرشفة وإدارة المنتجات.
