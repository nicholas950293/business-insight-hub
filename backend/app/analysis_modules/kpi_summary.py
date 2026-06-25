import pandas as pd


def analyze_kpi_summary(dataframe: pd.DataFrame) -> dict:
    revenue = None
    total_orders = None
    unique_customers = None
    average_order_value = None

    if "revenue" in dataframe.columns:
        revenue_values = pd.to_numeric(dataframe["revenue"], errors="coerce")
        valid_revenue = revenue_values.dropna()
        if not valid_revenue.empty:
            revenue = round(float(valid_revenue.sum()), 2)

    if "order_id" in dataframe.columns:
        total_orders = int(dataframe["order_id"].dropna().nunique())

    if "customer_id" in dataframe.columns:
        unique_customers = int(dataframe["customer_id"].dropna().nunique())

    if revenue is not None and total_orders:
        average_order_value = round(revenue / total_orders, 2)

    return {
        "total_revenue": revenue,
        "total_orders": total_orders,
        "unique_customers": unique_customers,
        "average_order_value": average_order_value,
    }
