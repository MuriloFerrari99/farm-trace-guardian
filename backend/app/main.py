
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import Base, engine
from app.api import auth, financial, crm

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Sistema de Gestão Agrícola - API Backend completa substituindo Supabase"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(financial.router, prefix="/api")
app.include_router(crm.router, prefix="/api")

@app.get("/")
async def root():
    return JSONResponse({
        "message": "FarmTrace API - Backend Python funcionando!",
        "version": settings.VERSION,
        "status": "active"
    })

@app.get("/health")
async def health_check():
    return JSONResponse({
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z"
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
