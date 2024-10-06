
# HyperDrive

## مقدمة - Introduction

**HyperDrive** هو نظام إدارة شامل مصمم خصيصًا لمدارس تعليم القيادة. يتيح لك إدارة جميع جوانب عملياتك اليومية بسهولة من خلال واجهة مستخدم بسيطة وسهلة الاستخدام، مع دعم كامل للغة العربية والوضع غير المتصل بالإنترنت. HyperDrive يتيح إدارة العملاء، المدفوعات، الامتحانات، وعمليات الأرشفة.

**HyperDrive** is a comprehensive management system specifically designed for driving schools. It allows you to manage all aspects of your daily operations through a simple, user-friendly interface with full Arabic language support and offline capabilities. HyperDrive provides client management, payments tracking, exams, and archiving operations.

---

## المميزات - Features

### إدارة العملاء - Client Management

* تسجيل وتعديل بيانات العملاء بشكل سريع وسهل.
* البحث عن العملاء باستخدام الفلاتر حسب الاسم، السنة، الشهر، وأكثر.

 **Client Management** :

* Quickly register and edit client data.
* Search clients using filters by name, year, month, and more.

### إدارة المدفوعات - Payment Management

* عرض وتتبع المدفوعات الكاملة والغير مدفوعة للعملاء.
* استخراج تقارير المدفوعات بصيغة Excel.

 **Payment Management** :

* View and track full and unpaid client payments.
* Export payment reports in Excel format.

### إدارة الامتحانات - Exam Management

* إدارة وتنظيم امتحانات القيادة، ومتابعة حالة كل متدرب.
* تصفية المتدربين حسب الاختبارات التي اجتازوها أو التي لم يجتازوها.

 **Exam Management** :

* Organize driving exams and track each client’s exam status.
* Filter clients based on the tests they passed or failed.

### الأرشيف - Archive

* نقل العملاء الذين أكملوا جميع الاختبارات والمدفوعات إلى الأرشيف.
* إمكانية إلغاء الأرشفة عند الحاجة.

 **Archive** :

* Move clients who have completed all tests and payments to the archive.
* Option to unarchive clients if needed.

### استخراج التقارير - Reports

* تصدير البيانات الخاصة بالعملاء والمدفوعات بصيغة Excel لمزيد من التحليل.

 **Reports** :

* Export client and payment data to Excel for further analysis.

---

## تثبيت المشروع - Installation

### المتطلبات - Requirements

* **Node.js** : إصدار 14 أو أعلى
* **npm** : مدير الحزم المثبت مع Node.js
* **Electron.js** : لتشغيل التطبيق كبرنامج سطح المكتب
* **MongoDB أو NeDB** : قاعدة بيانات NoSQL لإدارة البيانات.

 **Requirements** :

* **Node.js** : Version 14 or higher
* **npm** : Package manager installed with Node.js
* **Electron.js** : To run the application as a desktop app
* **MongoDB or NeDB** : NoSQL database for data management.

### خطوات التثبيت - Installation Steps

1. قم باستنساخ المشروع من GitHub:
   <pre class="!overflow-visible"><div class="dark bg-gray-950 contain-inline-size rounded-md border-[0.5px] border-token-border-medium relative"><div class="flex items-center text-token-text-secondary bg-token-main-surface-secondary px-4 py-2 text-xs font-sans justify-between rounded-t-md h-9">bash</div><div class="sticky top-9 md:top-[5.75rem]"><div class="absolute bottom-0 right-2 flex h-9 items-center"><div class="flex items-center rounded bg-token-main-surface-secondary px-2 font-sans text-xs text-token-text-secondary"><span class="" data-state="closed"><button class="flex gap-1 items-center py-1"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path></svg>Copy code</button></span></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="!whitespace-pre hljs language-bash">git clone https://github.com/jeogo/HyperDrive.git
   </code></div></div></pre>
2. انتقل إلى مجلد المشروع وقم بتثبيت الاعتمادات:
   <pre class="!overflow-visible"><div class="dark bg-gray-950 contain-inline-size rounded-md border-[0.5px] border-token-border-medium relative"><div class="flex items-center text-token-text-secondary bg-token-main-surface-secondary px-4 py-2 text-xs font-sans justify-between rounded-t-md h-9">bash</div><div class="sticky top-9 md:top-[5.75rem]"><div class="absolute bottom-0 right-2 flex h-9 items-center"><div class="flex items-center rounded bg-token-main-surface-secondary px-2 font-sans text-xs text-token-text-secondary"><span class="" data-state="closed"><button class="flex gap-1 items-center py-1"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path></svg>Copy code</button></span></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="!whitespace-pre hljs language-bash">cd HyperDrive
   npm install
   </code></div></div></pre>
3. لتشغيل التطبيق:
   <pre class="!overflow-visible"><div class="dark bg-gray-950 contain-inline-size rounded-md border-[0.5px] border-token-border-medium relative"><div class="flex items-center text-token-text-secondary bg-token-main-surface-secondary px-4 py-2 text-xs font-sans justify-between rounded-t-md h-9">bash</div><div class="sticky top-9 md:top-[5.75rem]"><div class="absolute bottom-0 right-2 flex h-9 items-center"><div class="flex items-center rounded bg-token-main-surface-secondary px-2 font-sans text-xs text-token-text-secondary"><span class="" data-state="closed"><button class="flex gap-1 items-center py-1"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path></svg>Copy code</button></span></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="!whitespace-pre hljs language-bash">npm start
   </code></div></div></pre>

 **Installation Steps** :

1. Clone the repository from GitHub:
   <pre class="!overflow-visible"><div class="dark bg-gray-950 contain-inline-size rounded-md border-[0.5px] border-token-border-medium relative"><div class="flex items-center text-token-text-secondary bg-token-main-surface-secondary px-4 py-2 text-xs font-sans justify-between rounded-t-md h-9">bash</div><div class="sticky top-9 md:top-[5.75rem]"><div class="absolute bottom-0 right-2 flex h-9 items-center"><div class="flex items-center rounded bg-token-main-surface-secondary px-2 font-sans text-xs text-token-text-secondary"><span class="" data-state="closed"><button class="flex gap-1 items-center py-1"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path></svg>Copy code</button></span></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="!whitespace-pre hljs language-bash">git clone https://github.com/jeogo/HyperDrive.git
   </code></div></div></pre>
2. Navigate to the project directory and install dependencies:
   <pre class="!overflow-visible"><div class="dark bg-gray-950 contain-inline-size rounded-md border-[0.5px] border-token-border-medium relative"><div class="flex items-center text-token-text-secondary bg-token-main-surface-secondary px-4 py-2 text-xs font-sans justify-between rounded-t-md h-9">bash</div><div class="sticky top-9 md:top-[5.75rem]"><div class="absolute bottom-0 right-2 flex h-9 items-center"><div class="flex items-center rounded bg-token-main-surface-secondary px-2 font-sans text-xs text-token-text-secondary"><span class="" data-state="closed"><button class="flex gap-1 items-center py-1"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path></svg>Copy code</button></span></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="!whitespace-pre hljs language-bash">cd HyperDrive
   npm install
   </code></div></div></pre>
3. To run the application:
   <pre class="!overflow-visible"><div class="dark bg-gray-950 contain-inline-size rounded-md border-[0.5px] border-token-border-medium relative"><div class="flex items-center text-token-text-secondary bg-token-main-surface-secondary px-4 py-2 text-xs font-sans justify-between rounded-t-md h-9">bash</div><div class="sticky top-9 md:top-[5.75rem]"><div class="absolute bottom-0 right-2 flex h-9 items-center"><div class="flex items-center rounded bg-token-main-surface-secondary px-2 font-sans text-xs text-token-text-secondary"><span class="" data-state="closed"><button class="flex gap-1 items-center py-1"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-sm"><path fill-rule="evenodd" clip-rule="evenodd" d="M7 5C7 3.34315 8.34315 2 10 2H19C20.6569 2 22 3.34315 22 5V14C22 15.6569 20.6569 17 19 17H17V19C17 20.6569 15.6569 22 14 22H5C3.34315 22 2 20.6569 2 19V10C2 8.34315 3.34315 7 5 7H7V5ZM9 7H14C15.6569 7 17 8.34315 17 10V15H19C19.5523 15 20 14.5523 20 14V5C20 4.44772 19.5523 4 19 4H10C9.44772 4 9 4.44772 9 5V7ZM5 9C4.44772 9 4 9.44772 4 10V19C4 19.5523 4.44772 20 5 20H14C14.5523 20 15 19.5523 15 19V10C15 9.44772 14.5523 9 14 9H5Z" fill="currentColor"></path></svg>Copy code</button></span></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="!whitespace-pre hljs language-bash">npm start
   </code></div></div></pre>

---

## الاستخدام - Usage

### إدارة العملاء

* لاستخدام خاصية إضافة العملاء، قم بالانتقال إلى صفحة  **تسجيل عميل جديد** ، وأدخل بيانات العميل بما في ذلك الاسم ورقم الهاتف وتاريخ الميلاد.
* يمكن إدارة العملاء من خلال قائمة العملاء حيث يمكنك تعديل وحذف بيانات العملاء حسب الحاجة.

 **Client Management** :

* To add a client, navigate to  **Register New Client** , and enter client information such as name, phone number, and birth date.
* Clients can be managed through the  **Clients List** , where you can edit or delete client information as needed.

### المدفوعات

* من خلال صفحة  **إدارة المدفوعات** ، يمكنك متابعة المدفوعات الكاملة والغير مدفوعة لكل عميل.
* استخدم الفلاتر لتحديد العملاء بناءً على المبالغ المدفوعة أو المتبقية.

 **Payments** :

* From the **Payments Management** page, you can track full and unpaid payments for each client.
* Use filters to focus on clients based on amounts paid or remaining.

### الأرشيف

* يمكن نقل العملاء إلى الأرشيف عندما يكملون جميع الاختبارات والمدفوعات. يمكن إلغاء الأرشفة إذا لزم الأمر.

 **Archive** :

* Clients can be moved to the archive once they complete all tests and payments. Unarchiving is also available if needed.

---

## المساهمة - Contribution

**مرحبًا بأي مساهمات!** إذا كنت ترغب في المساهمة في المشروع، يرجى اتباع الخطوات التالية:

1. قم بعمل Fork للمشروع.
2. أنشئ فرع جديد: `git checkout -b feature/اسم-الميزة`
3. قم بعمل التعديلات المطلوبة، ثم ارفع التغييرات: `git push origin feature/اسم-الميزة`
4. قم بفتح  **Pull Request** .

 **Contribution** :

* Feel free to contribute! If you wish to contribute to the project, follow these steps:
  1. Fork the repository.
  2. Create a new branch: `git checkout -b feature/your-feature-name`
  3. Make your changes and push them: `git push origin feature/your-feature-name`
  4. Open a  **Pull Request** .

---

## الدعم - Support

إذا كنت بحاجة إلى أي مساعدة أو لديك أي استفسارات، لا تتردد في التواصل معي عبر البريد الإلكتروني أو فتح **Issue** في المشروع.

 **Support** :

* If you need any assistance or have any questions, feel free to reach out via email or open an **Issue** in the project.

---

## الترخيص - License

هذا المشروع مرخص تحت  **MIT License** .

This project is licensed under the  **MIT License** .

---

This README file will make your project more approachable for both Arabic-speaking users and international contributors.
