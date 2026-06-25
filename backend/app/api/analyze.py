from fastapi import APIRouter, UploadFile

from app.analysis_modules.category_sales import analyze_category_sales
from app.analysis_modules.dataset_overview import analyze_dataset_overview
from app.analysis_modules.kpi_summary import analyze_kpi_summary
from app.analysis_modules.revenue_trend import analyze_revenue_trend
from app.analysis_modules.top_products import analyze_top_products
from app.schemas.analysis_response import AnalysisResponse
from app.services.capability_checker import check_available_modules
from app.services.column_detector import detect_columns
from app.services.csv_reader import read_csv_upload

router = APIRouter(tags=["analysis"])


@router.post("/analyze-csv", response_model=AnalysisResponse)
async def analyze_csv(file: UploadFile):
    dataframe = await read_csv_upload(file)
    columns = detect_columns(dataframe)
    available_modules, skipped_modules = check_available_modules(columns)
    dataset_overview = analyze_dataset_overview(dataframe)
    kpi_summary = analyze_kpi_summary(dataframe)
    revenue_trend = None
    category_sales = None
    top_products = None

    if "revenue_trend" in available_modules:
        revenue_trend = analyze_revenue_trend(dataframe)

    if "category_sales" in available_modules:
        category_sales = analyze_category_sales(dataframe)

    if "top_products" in available_modules:
        top_products = analyze_top_products(dataframe)

    return AnalysisResponse(
        filename=file.filename or "uploaded.csv",
        columns=columns,
        total_rows=len(dataframe),
        available_modules=available_modules,
        skipped_modules=skipped_modules,
        dataset_overview=dataset_overview,
        revenue_trend=revenue_trend,
        category_sales=category_sales,
        top_products=top_products,
        kpi_summary=kpi_summary,
    )
