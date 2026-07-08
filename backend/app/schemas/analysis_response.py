from pydantic import BaseModel


class SkippedModule(BaseModel):
    module: str
    reason: str


class DateRange(BaseModel):
    start_date: str | None
    end_date: str | None


class DatasetOverview(BaseModel):
    total_rows: int
    total_columns: int
    column_names: list[str]
    missing_values_total: int
    missing_values_rate: float
    duplicate_rows: int
    date_range: DateRange


class RevenueTrendPoint(BaseModel):
    month: str
    revenue: float


class CategorySalesPoint(BaseModel):
    category: str
    revenue: float
    percentage: float


class TopProductPoint(BaseModel):
    product_name: str
    revenue: float


class KpiSummary(BaseModel):
    total_revenue: float | None = None
    total_orders: int | None = None
    unique_customers: int | None = None
    average_order_value: float | None = None


class AnalysisResponse(BaseModel):
    filename: str
    columns: list[str]
    total_rows: int
    available_modules: list[str]
    skipped_modules: list[SkippedModule]
    dataset_overview: DatasetOverview
    revenue_trend: list[RevenueTrendPoint] | None = None
    category_sales: list[CategorySalesPoint] | None = None
    top_products: list[TopProductPoint] | None = None
    kpi_summary: KpiSummary
    filterable_records: list[dict] | None = None
    filterable_records_truncated: bool = False
