import os
import shutil
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from processor import FinancialProcessor
from analyzer import AIAnalyzer
from sqlalchemy.orm import Session
import database, models, auth_utils

# Initialize central AI components
processor = FinancialProcessor()
ai_analyzer = AIAnalyzer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("FinxtractAPI")

# Initialize database
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Finxtract AI - Professional Financial Intelligence")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error caught: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"error": "An internal processing error occurred. Please ensure the document is a valid financial PDF."}
    )

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(request: Request, db: Session = Depends(get_db)):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    
    token = auth_header.split(" ")[1]
    payload = auth_utils.decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    email = payload.get("sub")
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "output"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

processor = FinancialProcessor()

@app.post("/auth/signup")
async def signup(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password required")
    
    existing_user = db.query(models.User).filter(models.User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = auth_utils.get_password_hash(password)
    new_user = models.User(email=email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    
    token = auth_utils.create_access_token(data={"sub": email})
    return {"token": token, "email": email}

@app.post("/auth/login")
async def login(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    email = data.get("email")
    password = data.get("password")
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user or not auth_utils.verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = auth_utils.create_access_token(data={"sub": email})
    return {"token": token, "email": email}

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...), current_user: models.User = Depends(get_current_user)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file format. Only PDF documents are supported.")
    
    logger.info(f"User {current_user.email} initiating PDF processing: {file.filename}")
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Process PDF to Excel
        result_excel = processor.process_pdf(file_path, OUTPUT_DIR)
        logger.info(f"Successfully synthesized Excel for: {file.filename}")
        
        return FileResponse(
            path=result_excel,
            filename=os.path.basename(result_excel),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        
    except Exception as e:
        logger.error(f"Error in /upload-pdf: {str(e)}")
        raise e

@app.post("/upload-pdf-data")
async def upload_pdf_data(file: UploadFile = File(...), current_user: models.User = Depends(get_current_user)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file format. Only PDF documents are supported.")
    
    logger.info(f"User {current_user.email} initiating neural extraction: {file.filename}")
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Could not save uploaded file: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save the uploaded file.")
    
    # Extract — always returns something, never raises
    result = processor.get_extracted_data(file_path)
    
    warning = result.pop("warning", None)
    data = result

    has_data = any(len(rows) > 0 for rows in data.values())
    
    if has_data:
        ai_summary = ai_analyzer.generate_summary(data)
        logger.info(f"Neural mapping and AI analysis complete for: {file.filename}")
    else:
        ai_summary = warning or (
            "No readable financial data found. "
            "This document may contain scanned images or unsupported formatting."
        )
        logger.warning(f"No extractable data in: {file.filename}")
    
    return {
        "data": data,
        "summary": ai_summary
    }

@app.post("/download-excel")
async def download_excel(request: Request, current_user: models.User = Depends(get_current_user)):
    """
    Accepts extracted data as JSON and returns a downloadable Excel file.
    The frontend sends the data it already has — no re-upload needed.
    """
    try:
        body = await request.json()
        data = body.get("data", {})

        import io
        import openpyxl
        from fastapi.responses import StreamingResponse

        wb = openpyxl.Workbook()
        wb.remove(wb.active)  # remove the default blank sheet

        sheets = {
            "Balance Sheet": data.get("Balance Sheet", []),
            "Profit and Loss": data.get("Profit and Loss", []),
        }

        for sheet_name, rows in sheets.items():
            ws = wb.create_sheet(title=sheet_name)
            ws.append(["Description", "Value"])  # Header row
            for row in rows:
                ws.append([row.get("Description", ""), row.get("Value", "")])

        # Stream directly from memory — no temp file needed
        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)

        filename = "Finxtract_Export.xlsx"
        headers = {
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers=headers
        )

    except Exception as e:
        logger.error(f"Excel download error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate Excel file.")

@app.get("/health")
def health_check():
    return {"status": "operational", "system": "Finxtract AI Core"}

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Finxtract API Services...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
