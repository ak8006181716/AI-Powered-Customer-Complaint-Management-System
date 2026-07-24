# AI-Powered Pharmaceutical Customer Complaint Management System

Production-quality, enterprise-grade AI Customer Complaint Intake and Risk Intelligence System tailored for pharmaceutical manufacturing.

Built with **React 19**, **Redux Toolkit**, **FastAPI**, **SQLAlchemy**, **PostgreSQL**, **LangGraph**, and **Gemma 2 9B IT** via the Groq API.

---

## 🌟 Key Architecture & Features

### 1. Dual Panel User Interface
- **Left Panel (AI-Driven Complaint Form)**:
  - Automatically populated by the AI Assistant.
  - Read-only to enforce cGMP audit integrity and prevent manual tampering.
  - Form Sections:
    - **Origin**: Complaint Source, Customer/Institution Name
    - **Product**: Product Name, Strength/Dosage, Batch Number, Manufacturing Date, Expiry Date
    - **Complaint**: Quantity Affected, Complaint Defect Type, Narrative Description
    - **AI Risk Assessment & CAPA**: Auto-calculated Severity (Critical/Major/Minor), Priority (High/Medium/Low), Complaint Summary, Possible Root Cause, Recommended CAPA actions.
  - **Metrics & Controls**: Live Data Completeness score gauge (0-100%), Duplicate Batch Warning indicator, Form Reset and Database Save actions.

- **Right Panel (AI Complaint Intake Assistant)**:
  - **Drag & Drop Document Upload**: Supports PDF, DOCX, TXT, and EML files with automatic text parsing and LangGraph extraction.
  - **Real-Time Extraction Progress Tracker**: Animates intake steps: `Uploading` → `Extracting` → `Analyzing` → `Generating Risk Assessment` → `Completed`.
  - **AI Chat Assistant**: Supports interactive complaint creation and targeted natural language edits.
  - **Quick Prompts**: One-click actions for quick testing and validation.

---

## 🛠 Tech Stack

- **Frontend**: React 19, Redux Toolkit, Tailwind CSS, Axios, Lucide Icons, Google Inter Font.
- **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.0 (Async), PostgreSQL (with zero-config SQLite fallback).
- **AI Engine**: LangGraph State Graph, LangChain, Groq API (`gemma2-9b-it` model).

---

## 📦 Project Folder Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/          # REST API endpoints (Chat, Upload, Complaints CRUD)
│   │   ├── database/     # SQLAlchemy async session & engine management
│   │   ├── langgraph/    # LangGraph State Graph & Node functions
│   │   ├── models/       # Database ORM entities (User, Complaint, Document, History, Assessment)
│   │   ├── prompts/      # cGMP pharma system prompts
│   │   ├── repositories/ # Data Access Objects (DAO)
│   │   ├── schemas/      # Pydantic V2 request/response and LLM payload schemas
│   │   ├── services/     # Groq LLM service, document parser, complaint service
│   │   └── config.py     # Environment settings
│   ├── main.py           # FastAPI app entry point
│   ├── requirements.txt  # Dependencies
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── assistant/ # AIAssistant, DragDropUpload, ExtractionProgress, ChatContainer
    │   │   └── complaint/ # ComplaintForm, Risk Assessment view
    │   ├── pages/         # Dashboard layout
    │   ├── redux/         # Redux Toolkit store and slices (complaint, chat, upload)
    │   ├── services/      # Axios API wrapper
    │   ├── types/         # TypeScript definitions
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    └── vite.config.ts
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup (FastAPI & LangGraph)

```bash
cd backend

# Create virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# (Optional) Set your Groq API Key in .env
# GROQ_API_KEY=gsk_...

# Run FastAPI server
uvicorn main:app --reload --port 8000
```
*Backend runs on `http://127.0.0.1:8000`. API docs available at `http://127.0.0.1:8000/docs`.*

### 2. Frontend Setup (React 19 & Redux)

```bash
cd frontend

# Install Node modules
npm install

# Start Vite dev server
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🔬 Testing Key Features

1. **Feature 1 - Create Complaint via Chat**:
   - Type or click prompt: `"Customer received 20 damaged bottles of Paracetamol 500mg from Batch BT102."`
   - Observe the Left Panel auto-populating all 10 fields, Severity, Priority, Summary, Root Cause, and CAPA.

2. **Feature 2 - Targeted Edits**:
   - Type: `"Change quantity to 50."`
   - Only the Quantity field updates to `50 bottles`. All other fields remain unchanged.
   - Type: `"The batch number is BT205."`
   - Only the Batch field updates to `BT205`.

3. **Feature 3 & 4 - Document Upload & Progress**:
   - Drag and drop any PDF, DOCX, TXT, or EML file into the upload box.
   - Observe progress steps: `Uploading` → `Extracting` → `Analyzing` → `Generating Risk Assessment` → `Completed`.
   - The complaint form is auto-populated with extracted details.
