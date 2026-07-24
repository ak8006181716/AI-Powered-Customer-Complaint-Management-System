# AI-Powered Pharmaceutical Customer Complaint Management System

Enterprise-grade AI Customer Complaint Intake and Risk Intelligence System built for pharmaceutical manufacturing (API & Finished Dosage Forms).

Built with **React 19**, **Redux Toolkit**, **JavaScript (JSX/JS)**, **FastAPI**, **SQLAlchemy**, **SQLite/PostgreSQL**, **LangGraph**, and **Gemma 2 9B IT** via the Groq API.

---

## 🌟 Key Architecture & Features

### 1. Dual Panel User Interface
- **Left Panel (Log Customer Complaint)**:
  - Automatically populated by the AI Assistant / Document Parser.
  - Read-only fields to enforce audit integrity and prevent manual tampering.
  - Form Sections:
    1. **1. ORIGIN & CUSTOMER DETAILS**: Complaint Source, Customer Name
    2. **2. PRODUCT & BATCH IDENTIFICATION**: Product Name, Product Strength/Grade, Batch/Lot Number, Manufacturing Date, Expiry Date, Quantity Affected
    3. **3. COMPLAINT DETAILS**: Complaint Type, Complaint Date, Detailed Complaint Description
    4. **4. AI COPILOT RISK ASSESSMENT**: Auto-calculated Severity (Suggested), Suggested Next Action, Initial Risk Assessment summary.
  - **Action Buttons**: `Reset Form` (resets intake state) and `Commit to QMS Ledger` (saves complaint).

- **Right Panel (AI Complaint Intake Assistant)**:
  - **Drag & Drop Document Upload**: Supports PDF, DOCX, TXT, and EML files with automatic text parsing and LangGraph extraction.
  - **Extraction Progress Bar**: Animates intake parsing steps (`10%` to `100%`).
  - **AI Chat Assistant**: Supports interactive complaint intake and targeted natural language edits (*"sorry the batch number is BMX240602 and affected quantity is 48 capcules"*).

---

## 🛠 Tech Stack

- **Frontend**: React 19, Redux Toolkit, JavaScript (ES6+ JSX), Tailwind CSS, Axios, Lucide Icons.
- **Backend**: Python 3.12/3.14, FastAPI, SQLAlchemy 2.0 (Async), SQLite / PostgreSQL.
- **AI Engine**: LangGraph `StateGraph(ComplaintState)`, Groq API (`gemma2-9b-it` model) with zero-failure heuristic fallbacks.

---

## 📦 Project Folder Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/          # REST API endpoints (chat.py, upload.py, complaints.py) & router
│   │   ├── database/     # SQLAlchemy async session & database initialization
│   │   ├── langgraph/    # LangGraph StateGraph, nodes, and state definitions
│   │   ├── models/       # Database ORM entities (Complaint, Document, Assessment, etc.)
│   │   ├── prompts/      # Pharma domain system prompts
│   │   ├── repositories/ # Data Access Layer
│   │   ├── schemas/      # Pydantic V2 schemas
│   │   ├── services/     # Groq LLM service, document parser, complaint service
│   │   └── config.py     # Application configuration settings
│   ├── main.py           # FastAPI entry point
│   ├── requirements.txt  # Python dependencies
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── assistant/ # AIAssistant.jsx, DragDropUpload.jsx, ExtractionProgress.jsx, ChatContainer.jsx
    │   │   └── complaint/ # ComplaintForm.jsx (with AI Copilot Risk Assessment Card)
    │   ├── pages/         # Dashboard.jsx
    │   ├── redux/         # Redux store and slices (complaintSlice.js, chatSlice.js, uploadSlice.js)
    │   ├── services/      # Axios API service (api.js)
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup (FastAPI & LangGraph)

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Set your Groq API Key in backend/.env
# GROQ_API_KEY=gsk_...

# Start FastAPI dev server
uvicorn main:app --reload --port 8000
```
*Backend runs on `http://127.0.0.1:8000`. Swagger API docs available at `http://127.0.0.1:8000/docs`.*

---

### 2. Frontend Setup (React 19 & JavaScript)

```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🔬 Key Demo Scenarios

1. **Natural Language Complaint Intake**:
   - Paste prompt: `"Apollo Pharmacy reported discolored capsules in Amoxicillin Capsules 500 mg. Batch number AMX240602. Manufacturing date March 2026. Expiry date February 2028. Please log this complaint"`
   - Observe auto-population of all 10 fields, Manufacturing Date (`March 2026`), Expiry Date (`February 2028`), and AI Copilot Risk Assessment.

2. **Targeted Natural Language Edits**:
   - Type prompt: `"ah sorry the batch number is BMX240602 and affected quantity is 48 capcules"`
   - Batch Number updates to `BMX240602` and Quantity updates to `48 capcules` while preserving Manufacturing and Expiry dates.

3. **PDF Document Report Parsing**:
   - Drag & drop a customer complaint PDF into the upload zone.
   - Key-value extraction isolates table labels and populates fields without string corruptions.
