# HyperDrive Scripts Documentation

## نظرة عامة (Overview)

This directory contains Python scripts for automated document generation and template filling for the Auto School Manager application. The scripts handle Arabic text processing, DOCX template filling, and PDF generation.

## متطلبات النظام (System Requirements)

### Python Requirements

- Python 3.7 or higher
- Compatible with Windows, macOS, and Linux

### Required Python Packages

Create a `requirements.txt` file and install:

```bash
# Install all required packages
pip install -r requirements.txt
```

**requirements.txt:**

```
python-docx>=0.8.11
docxtpl>=0.16.7
docx2pdf>=0.1.8
pathlib
```

### Alternative Installation Commands:

```bash
# Core packages (required)
pip install python-docx docxtpl

# PDF conversion (optional but recommended)
pip install docx2pdf

# For Windows users (if docx2pdf doesn't work):
# Make sure Microsoft Word is installed for PDF conversion
```

## الملفات والسكريبتات (Scripts Overview)

### 1. `fill_candidate_follow_up_card.py`

**الوصف:** ملء بطاقة المتابعة للمترشح بالتواريخ والساعات

**Features:**

- Fills personal information placeholders
- Generates 30 lesson dates for theory table (Table 2)
- Generates 30 lesson dates + hours for practical table (Table 3)
- Smart hour scheduling with reservation system
- Avoids weekends (Friday/Saturday)
- Font formatting: Arial 8pt Bold
- Unicode path handling

**Usage:**

```bash
python scripts/fill_candidate_follow_up_card.py \
  --input "resources/templates/بطاقة المتابعة للمترشح.docx" \
  --output "output/candidate_follow_up.docx" \
  --start-date 2025-09-20 \
  --fullName "محمد أحمد علي" \
  --client-id "client_123" \
  --table1-dates 30 \
  --table2-dates 30 \
  --pdf
```

**Parameters:**

- `--input`: Template file path
- `--output`: Output file path
- `--start-date`: Start date (YYYY-MM-DD format)
- `--fullName`: Student full name
- `--client-id`: Unique client identifier
- `--table1-dates`: Number of dates for first table (default: 30)
- `--table2-dates`: Number of dates for second table (default: 30)
- `--pdf`: Generate PDF output
- `--pdf-only`: Generate only PDF (skip DOCX)

### 2. `fill_traffic_law_lessons_card.py`

**الوصف:** ملء بطاقة دروس قانون المرور

**Features:**

- Fills placeholders in document header
- Fills 30 lesson dates in table
- Skips weekends
- Font formatting: Arial 8pt Bold
- JSON data support

**Usage:**

```bash
python scripts/fill_traffic_law_lessons_card.py \
  --input "resources/templates/بطاقة خاصة بدروس قانون المرور .docx" \
  --output "output/traffic_law_lessons.docx" \
  --start-date 2025-09-20 \
  --data "data/student_info.json" \
  --sessions 30 \
  --has-header \
  --pdf
```

**JSON Data Format:**

```json
{
  "schoolName": "مدرسة تعليم سياقة النجاح",
  "fullName": "أحمد بن صالح",
  "birthDate": "2000/05/12",
  "birthPlace": "المسيلة",
  "address": "حي النصر، المسيلة",
  "registrationDate": "2025/01/10"
}
```

### 3. `generate_deposit_docx.py`

**الوصف:** توليد ملف الإيداع من قائمة المترشحين

**Features:**

- Two modes: block and flat template filling
- Dynamic dot calculation for alignment
- Candidate list processing
- PDF conversion support
- Customizable line width

**Usage:**

```bash
python scripts/generate_deposit_docx.py \
  --template "resources/templates/ملف الإيداع.docx" \
  --output "output/deposit_file.docx" \
  --json "data/candidates.json" \
  --mode flat \
  --width 70 \
  --pdf
```

**Candidates JSON Format:**

```json
[
  {
    "first_name": "محمد",
    "last_name": "أحمد"
  },
  {
    "first_name": "فاطمة",
    "last_name": "علي"
  }
]
```

## ملفات القوالب (Template Files)

Place your DOCX templates in `resources/templates/`:

```
resources/templates/
├── بطاقة المتابعة للمترشح.docx
├── بطاقة خاصة بدروس قانون المرور .docx
├── ملف الإيداع.docx
└── [other template files]
```

## ملفات الإخراج (Output Structure)

```
output/
├── candidate_follow_up/
├── traffic_law_lessons/
├── deposit_files/
└── temp/
```

## نظام الحجوزات (Reservation System)

The scripts use `schedule_reservations.json` to track hour assignments:

```json
{
  "2025-09-20": {
    "07:00-08:00": ["client_123"],
    "08:00-09:00": ["client_456"],
    "client_memory": {
      "client_123": "07:00-08:00",
      "client_456": "08:00-09:00"
    }
  }
}
```

## معالجة الأخطاء (Error Handling)

### Common Issues and Solutions:

1. **Permission Denied Error:**

   ```
   Solution: Close any open DOCX/PDF files and run again
   ```

2. **Unicode Path Issues:**

   ```
   Solution: Scripts automatically handle Unicode paths with fallback
   ```

3. **Missing Template File:**

   ```
   Solution: Ensure template files are in correct directory
   ```

4. **docx2pdf Not Working:**
   ```bash
   # Install alternative PDF converter
   pip install python-docx2pdf
   # OR ensure Microsoft Word is installed (Windows)
   ```

## تثبيت في جهاز جديد (New PC Installation)

### Step 1: Install Python

```bash
# Download and install Python 3.7+ from python.org
# Make sure to add Python to PATH during installation
```

### Step 2: Install Required Packages

```bash
# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate     # Windows

# Install packages
pip install python-docx docxtpl docx2pdf
```

### Step 3: Verify Installation

```bash
python -c "import docx, docxtpl; print('All packages installed successfully')"
```

### Step 4: Test Scripts

```bash
# Test with sample data
python scripts/fill_candidate_follow_up_card.py --help
```

## الاستخدام مع التطبيق (Integration with App)

The scripts are called from the Electron app through:

- `src/main/ipcHandlers.js` - IPC handlers
- `src/main/pdfHandler/` - PDF generation handlers
- `src/renderer/src/components/Print/Print.jsx` - Frontend integration

## تحديثات الخط (Font Updates)

All scripts now use:

- **Font:** Arial
- **Size:** 8pt (increased from 7pt)
- **Style:** Bold
- **Applied to:** All table content

## ميزات خاصة (Special Features)

### Smart Hour Scheduling

- Automatic hour assignment (07:00-17:00)
- Client memory for consistent scheduling
- Weekend avoidance
- Full day detection

### Unicode Support

- Safe Unicode path handling
- Arabic text processing
- Encoding error fallbacks

### PDF Generation

- Optional PDF conversion
- Multiple output formats
- Error handling for PDF failures

## استكشاف الأخطاء (Troubleshooting)

### Debug Mode

Add `--verbose` flag to any script for detailed output:

```bash
python scripts/fill_candidate_follow_up_card.py --verbose [other args]
```

### Log Files

Check application logs in:

- Windows: `%APPDATA%/autoschoolmanger/logs/`
- macOS: `~/Library/Application Support/autoschoolmanger/logs/`
- Linux: `~/.config/autoschoolmanger/logs/`

## التحديثات الأخيرة (Recent Updates)

### Version 1.1 (September 2025)

- ✅ Upgraded font size from 7pt to 8pt
- ✅ Added bold font styling
- ✅ Fixed Unicode path handling
- ✅ Updated table filling to 30+30 rows
- ✅ Fixed duplicate table configuration
- ✅ Enhanced error handling and fallbacks

### Breaking Changes

- Font size changed from 7pt to 8pt
- Both lesson tables now fill 30 rows each
- Enhanced reservation system

## الدعم (Support)

For issues or questions:

1. Check error messages in console output
2. Verify template file format and location
3. Ensure all dependencies are installed
4. Check file permissions and paths

## ملاحظات التطوير (Development Notes)

### Code Structure

- Unicode-safe printing with `safe_print()`
- Robust error handling for file operations
- Modular design for easy maintenance
- Comprehensive logging system

### Testing

Test files are generated in `temp/` directory:

- `test_follow_up_30x30.docx`
- `test_unicode_fix.docx`
- `test_both_tables.docx`

---

## English Summary

This documentation covers Python scripts for Arabic document generation in an auto school management system. Key features include:

- **Template-based DOCX generation** with Arabic text support
- **Smart scheduling system** for lesson times and dates
- **PDF conversion capabilities** with fallback options
- **Unicode path handling** for international file names
- **Font standardization** at Arial 8pt Bold
- **Weekend avoidance** in date generation
- **Error resilience** with multiple fallback mechanisms

The scripts integrate with an Electron-based desktop application and provide automated document generation for driving school administrative tasks.
