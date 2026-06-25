import pandas as pd


def analyze_category_sales(dataframe: pd.DataFrame) -> list[dict]:
    if "category" not in dataframe.columns or "revenue" not in dataframe.columns:
        return []

    sales_data = dataframe[["category", "revenue"]].copy()
    sales_data["category"] = sales_data["category"].astype("string").str.strip()
    sales_data["revenue"] = pd.to_numeric(sales_data["revenue"], errors="coerce")
    sales_data = sales_data.dropna(subset=["category", "revenue"])
    sales_data = sales_data[sales_data["category"] != ""]

    if sales_data.empty:
        return []

    grouped_sales = (
        sales_data.groupby("category", dropna=True)["revenue"]
        .sum()
        .sort_values(ascending=False)
    )
    total_revenue = grouped_sales.sum()

    if total_revenue <= 0:
        return []

    return [
        {
            "category": category,
            "revenue": round(float(revenue), 2),
            "percentage": round(float(revenue / total_revenue * 100), 1),
        }
        for category, revenue in grouped_sales.items()
    ]
