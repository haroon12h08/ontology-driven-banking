import time
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.services.graph_service import graph_service
from app.api import (
    health,
    customers,
    accounts,
    transactions,
    products,
    recommendations,
    policies,
    events,
    reasoning,
    ontology,
    operations
)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SemanticQueryLayer")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic: Connect to Neo4j database
    logger.info("Initializing Ontology Service Layer...")
    try:
        graph_service.connect()
        logger.info("Semantic Query Layer is ready to serve queries.")
    except Exception as e:
        logger.error(f"Failed to connect to Neo4j during startup: {e}")
    
    yield
    
    # Shutdown logic: Close Neo4j driver
    logger.info("Shutting down Ontology Service Layer...")
    graph_service.close()
    logger.info("Shutdown completed.")

app = FastAPI(
    title="SBI Enterprise Banking Semantic Query & Reasoning Service",
    description="Unified semantic gateway API that abstracts graph representation into formal banking domain concepts for AI agents.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for agent integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request execution timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = time.perf_counter() - start_time
    response.headers["X-Process-Time-Ms"] = f"{process_time * 1000:.2f}"
    logger.info(f"Path: {request.url.path} | Method: {request.method} | Elapsed: {process_time * 1000:.2f}ms")
    return response

# Register API routers
app.include_router(health.router, prefix="/api/health", tags=["System Health"])
app.include_router(customers.router, prefix="/api/customers", tags=["Customer Intelligence"])
app.include_router(accounts.router, prefix="/api/accounts", tags=["Account Information"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transaction Operations"])
app.include_router(products.router, prefix="/api/products", tags=["Product Catalog"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Product Recommendations"])
app.include_router(policies.router, prefix="/api/policies", tags=["Policy & Rule Knowledge"])
app.include_router(events.router, prefix="/api/events", tags=["Event Streams & Logs"])
app.include_router(reasoning.router, prefix="/api/reasoning", tags=["Semantic Reasoning Engine"])
app.include_router(ontology.router, prefix="/api/ontology", tags=["Ontology Schema Navigator"])
app.include_router(operations.router, prefix="/api/operations", tags=["Banking Operations"])

@app.get("/")
def read_root():
    return {
        "service": "SBI Banking Semantic Query & Reasoning Service",
        "status": "operational",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
