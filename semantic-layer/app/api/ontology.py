from fastapi import APIRouter
from app.services.ontology_service import ontology_service
from app.schemas.responses import SemanticResponse

router = APIRouter()

@router.get("/classes", response_model=SemanticResponse)
async def get_ontology_classes():
    return await ontology_service.get_ontology_classes()

@router.get("/properties", response_model=SemanticResponse)
async def get_ontology_properties():
    return await ontology_service.get_ontology_properties()
