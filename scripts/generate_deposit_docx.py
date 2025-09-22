# -*- coding: utf-8 -*-
"""
سكربت لتوليد ملف Word (ملف الإيداع) من قالب باستخدام docxtpl.

يدعم:
1. التحميل من JSON أو قائمة افتراضية.
2. وضعان للقالب:
     - mode=block : القالب يحتوي صف جدول (أو فقرة) بداخلها حقول متكررة Jinja2 داخل حلقة.
     - mode=flat  : القالب يحتوي placeholder نصي واحد هو {{ candidates_block }} أو {{ candidates_text }}.
3. حساب النقاط (dots) للحفاظ على عرض السطر بهدف محاذاة يدوية.
4. خيار ضبط العرض المستهدف TARGET_LINE_WIDTH عبر وسيط --width (القيمة الافتراضية 70).
5. خيار تحويل الناتج إلى PDF (--pdf) إن توفرت docx2pdf.
6. استعراض قائمة الـ placeholders المتاحة (--placeholders) بدون توليد ملف.

Placeholders:
    - في وضع block داخل الصف المتكرر: {{ index }}, {{ fullName }}, {{ dots }}
    - مشترك: {{ total }} (عدد المتدربين)
    - في وضع flat / داخل فقرة واحدة: {{ candidates_block }} أو {{ candidates_text }} (قائمة الأسطر كاملة)

أمثلة الاستخدام (PowerShell):
    python scripts/generate_deposit_docx.py --mode flat --width 72 \
            --template resources/templates/"ملف الإيداع.docx" \
            --output output/"ملف الإيداع.docx"

    python scripts/generate_deposit_docx.py --json data/candidates.json --mode block --pdf

عرض placeholders فقط:
    python scripts/generate_deposit_docx.py --placeholders

إذا لم يُمرر JSON تُستخدم قائمة افتراضية لأغراض الاختبار.
"""
from __future__ import annotations
import argparse
import json
import os
import sys
from typing import List, Dict, Any
from pathlib import Path

try:
    # محاولة استيراد docx2pdf (يتطلب Word على Windows أو استخدام ماك)
    from docx2pdf import convert as docx2pdf_convert
    DOCX2PDF_AVAILABLE = True
except Exception:
    DOCX2PDF_AVAILABLE = False

try:
    from docxtpl import DocxTemplate
except ImportError:
    print("[ERROR] تحتاج لتثبيت المكتبة docxtpl أولاً: pip install docxtpl", file=sys.stderr)
    sys.exit(1)

# -----------------------------
# دالة طباعة آمنة (تجنب UnicodeEncodeError في cp1252)
# -----------------------------
def safe_print(*args, **kwargs):
    text = ' '.join(str(a) for a in args)
    # إزالة الرموز غير المدعومة (مثل الإيموجي) أو استبدالها
    replacements = {
        '✅': '[OK]',
        '⚠️': '[WARN]',
        '❌': '[ERROR]'
    }
    for k, v in replacements.items():
        text = text.replace(k, v)
    try:
        print(text, **kwargs)
    except UnicodeEncodeError:
        # fallback strip non-ASCII
        ascii_text = text.encode('ascii', 'ignore').decode('ascii')
        print(ascii_text, **kwargs)

# -----------------------------
# منطق حساب النقاط
# -----------------------------
DEFAULT_WIDTH = 70
SUFFIX = " (ب)"  # النص الثابت في آخر كل سطر


def calc_dots(index: int, full_name: str, target_width: int) -> str:
    base = f"{index} - {full_name}".strip()
    # الطول المنطقي للحروف
    logical_length = len(base) + len(SUFFIX)
    dots_needed = max(3, target_width - logical_length)
    return "." * dots_needed


# -----------------------------
# تحميل المرشحين
# -----------------------------

def load_candidates_from_json(path: str) -> List[Dict[str, Any]]:
    if not os.path.exists(path):
        raise FileNotFoundError(f"JSON غير موجود: {path}")
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    # توقع أحد الشكلين: list of dict أو list of names
    candidates: List[Dict[str, str]] = []
    for item in data:
        if isinstance(item, dict):
            first = item.get('first_name') or item.get('first_name_ar') or ''
            last = item.get('last_name') or item.get('last_name_ar') or ''
            full = f"{first} {last}".strip()
        else:
            full = str(item)
        candidates.append({'fullName': full})
    return candidates


def default_candidates() -> List[Dict[str, str]]:
    return [
        {'fullName': 'أحمد بن صالح'},
        {'fullName': 'ليلى مرابط'},
        {'fullName': 'يوسف قريشي'},
    ]


# -----------------------------
# بناء البيانات للسياق
# -----------------------------

def build_context(candidates: List[Dict[str, str]], target_width: int, mode: str):
    enriched = []
    flat_lines = []
    for i, c in enumerate(candidates, start=1):
        full = c['fullName']
        dots = calc_dots(i, full, target_width)
        enriched.append({
            'index': i,
            'fullName': full,
            'dots': dots,
        })
        flat_lines.append(f"{i} - {full} {dots}{SUFFIX}")
    context = {
        'candidates': enriched,  # يُستخدم في وضع block (تكرار صفوف)
        'candidates_block': '\n'.join(flat_lines),  # يُستخدم في وضع flat
        'total': len(enriched)
    }
    if mode == 'flat':
        # نافع للعرض النصي
        context['candidates_text'] = context['candidates_block']
    return context


# -----------------------------
# توليد المستند
# -----------------------------

def render_doc(template_path: str, output_path: str, context: Dict[str, Any]):
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"القالب غير موجود: {template_path}")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc = DocxTemplate(template_path)
    doc.render(context)
    doc.save(output_path)


# -----------------------------
# CLI
# -----------------------------

def parse_args():
    parser = argparse.ArgumentParser(description='Generate Deposit Word File from template (Arabic).')
    parser.add_argument('--template', default='resources/templates/ملف الإيداع.docx', help='مسار القالب.')
    parser.add_argument('--output', default='output/ملف الإيداع.docx', help='مسار الإخراج.')
    parser.add_argument('--json', dest='json_path', help='ملف JSON للمرشحين (اختياري).')
    parser.add_argument('--width', type=int, default=DEFAULT_WIDTH, help='TARGET_LINE_WIDTH')
    parser.add_argument('--mode', choices=['flat', 'block'], default='flat', help='وضع القالب: flat نص واحد أو block تكرار صف.')
    parser.add_argument('--pdf', action='store_true', help='تحويل الناتج إلى PDF (يتطلب docx2pdf)')
    parser.add_argument('--placeholders', action='store_true', help='عرض قائمة الحقول (placeholders) المتاحة ثم الخروج.')
    parser.add_argument('--pdf-only', action='store_true', help='إنتاج PDF فقط (يحذف ملف DOCX بعد نجاح التحويل).')
    parser.add_argument('--skip-if-exists', action='store_true', help='يتخطى التوليد إذا كان الملف الهدف (و PDF عند طلبه) موجوداً بالفعل.')
    return parser.parse_args()


def main():
    args = parse_args()

    if args.placeholders:
        safe_print("[INFO] Placeholders:")
        safe_print("  (block)   {{ index }}, {{ fullName }}, {{ dots }}  -- داخل الصف أو الفقرة المتكررة")
        safe_print("  (any)     {{ total }}  -- العدد الإجمالي")
        safe_print("  (flat)    {{ candidates_block }} أو {{ candidates_text }}")
        safe_print("\nملاحظات:")
        safe_print("- dots: سلسلة من النقاط لتعبئة الفراغ قبل اللاحقة ' (ب)'.")
        safe_print("- يمكنك تعديل العرض المستهدف بالنطاق --width.")
        safe_print("- في وضع block ضع حلقة Jinja2 مثل: {% for c in candidates %} |{{ c.index }} - {{ c.fullName }} {{ c.dots }} (ب)| {% endfor %}")
        return

    if args.json_path:
        try:
            candidates = load_candidates_from_json(args.json_path)
        except Exception as e:
            safe_print(f"[WARN] فشل تحميل JSON: {e}. سيتم استخدام قائمة افتراضية.")
            candidates = default_candidates()
    else:
        candidates = default_candidates()

    context = build_context(candidates, args.width, args.mode)

    output_exists = os.path.exists(args.output)
    pdf_target_path = Path(args.output).with_suffix('.pdf')
    pdf_wanted = (args.pdf or args.pdf_only)
    pdf_exists = pdf_target_path.exists()

    if args.skip_if_exists and output_exists and (not pdf_wanted or (pdf_wanted and pdf_exists)):
        safe_print('[SKIP] الملفات موجودة مسبقاً وتم تجاوز إعادة التوليد (--skip-if-exists).')
        if pdf_wanted and pdf_exists:
            print(f"PDF_PATH={pdf_target_path}")
        return

    try:
        render_doc(args.template, args.output, context)
    except Exception as e:
        safe_print(f"[ERROR] فشل إنشاء الملف: {e}")
        sys.exit(1)
    safe_print("[OK] تم إنشاء الملف بنجاح:", args.output)

    if args.pdf or args.pdf_only:
        if not DOCX2PDF_AVAILABLE:
            safe_print("[WARN] تم طلب PDF ولكن مكتبة docx2pdf غير مثبّتة أو غير صالحة هنا.")
            print("PDF_PATH=", '')
            return
        try:
            output_path = Path(args.output).resolve()
            pdf_path = output_path.with_suffix('.pdf')
            docx2pdf_convert(str(output_path), str(pdf_path))
            safe_print("[OK] تم إنشاء ملف PDF:", pdf_path)
            print(f"PDF_PATH={pdf_path}")
            if getattr(args, 'pdf_only', False):
                try:
                    output_path.unlink(missing_ok=True)  # Python 3.8+ safe removal
                    safe_print("[INFO] تم حذف ملف DOCX (وضع PDF فقط).")
                except Exception as del_err:
                    safe_print(f"[WARN] تعذر حذف ملف DOCX: {del_err}")
        except Exception as e:
            safe_print(f"[WARN] فشل التحويل إلى PDF: {e}")
            print("PDF_PATH=", '')


if __name__ == '__main__':
    main()
