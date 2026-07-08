import pandas as pd


MAX_FILTERABLE_RECORDS = 20_000
SUPPORTED_FIELDS = [
    "order_date",
    "revenue",
    "order_id",
    "customer_id",
    "category",
    "product_name",
    "quantity",
    "unit_price",
]
REQUIRED_FIELDS = {"order_date", "revenue"}


def _to_json_safe(value):
    if pd.isna(value):
        return None

    if hasattr(value, "item"):
        return value.item()

    return value


def analyze_filterable_records(
    dataframe: pd.DataFrame,
    detected_columns: list[str],
) -> tuple[list[dict] | None, bool]:
    if not REQUIRED_FIELDS.issubset(set(detected_columns)):
        return None, False

    included_fields = [
        field
        for field in SUPPORTED_FIELDS
        if field in detected_columns and field in dataframe.columns
    ]
    records_data = dataframe[included_fields].copy()
    records_data["order_date"] = pd.to_datetime(
        records_data["order_date"],
        errors="coerce",
        format="mixed",
    )
    records_data["revenue"] = pd.to_numeric(records_data["revenue"], errors="coerce")
    records_data = records_data.dropna(subset=["order_date", "revenue"])

    if records_data.empty:
        return [], False

    truncated = len(records_data) > MAX_FILTERABLE_RECORDS
    records_data = records_data.head(MAX_FILTERABLE_RECORDS)
    records_data["order_date"] = records_data["order_date"].dt.strftime("%Y-%m-%d")

    return [
        {
            field: _to_json_safe(value)
            for field, value in record.items()
        }
        for record in records_data.to_dict(orient="records")
    ], truncated
