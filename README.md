# Financial PDF Extractor

A full-stack web application that extracts structured financial data from Balance Sheets and Profit & Loss statements in PDF format.

The system processes raw financial documents and converts them into organized datasets, enabling easier analysis and reporting.

---

## Overview

This project focuses on automating financial document parsing using Python-based data processing and a modern web interface. It handles semi-structured PDF data and converts it into machine-readable formats such as Excel.

---

## Features

* Extracts data from Balance Sheets and P&L statements
* Converts unstructured PDF content into structured tables
* Exports processed data to Excel (XLSX)
* Web-based interface for uploading and processing documents
* Backend API for handling file processing and data extraction

---

## Tech Stack

**Frontend**

* React
* Vite

**Backend**

* FastAPI

**Libraries**

* Pandas
* pdfplumber
* PyPDF2

---

## Project Structure

```
project-root/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
└── README.md
```

---

## Installation & Setup

### Prerequisites

* Python 3.10+
* Node.js 20+

---

### Backend Setup

```
cd backend
pip install -r requirements.txt
python main.py
```

---

### Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

## Usage

1. Open the frontend in your browser
2. Upload a financial PDF
3. The system processes and extracts key data
4. Download the structured Excel output

---

## Future Improvements

* Improved accuracy using machine learning models
* Support for additional financial document formats
* Deployment using Docker and cloud services
* Dashboard for analytics and visualization

---

## Notes

This project is intended for learning and demonstration purposes. Accuracy may vary depending on PDF structure and formatting.

---

## License

This project is open-source and available under the MIT License.
