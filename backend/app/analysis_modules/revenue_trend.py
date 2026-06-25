import pandas as pd


def analyze_revenue_trend(dataframe: pd.DataFrame) -> list[dict]:
    if "order_date" not in dataframe.columns or "revenue" not in dataframe.columns:
        return []

    trend_data = dataframe[["order_date", "revenue"]].copy()
    trend_data["order_date"] = pd.to_datetime(
        trend_data["order_date"],
        errors="coerce",
        format="mixed",
    )
    trend_data["revenue"] = pd.to_numeric(trend_data["revenue"], errors="coerce")
    trend_data = trend_data.dropna(subset=["order_date", "revenue"])

    if trend_data.empty:
        return []

    monthly_revenue = (
        trend_data.groupby(trend_data["order_date"].dt.to_period("M"))["revenue"]
        .sum()
        .sort_index()
    )

    return [
        {
            "month": str(month),
            "revenue": round(float(revenue), 2),
        }
        for month, revenue in monthly_revenue.items()
    ]
