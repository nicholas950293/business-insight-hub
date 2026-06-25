import pandas as pd


def analyze_top_products(dataframe: pd.DataFrame, limit: int = 5) -> list[dict]:
    if "product_name" not in dataframe.columns or "revenue" not in dataframe.columns:
        return []

    product_data = dataframe[["product_name", "revenue"]].copy()
    product_data["product_name"] = product_data["product_name"].astype("string").str.strip()
    product_data["revenue"] = pd.to_numeric(product_data["revenue"], errors="coerce")
    product_data = product_data.dropna(subset=["product_name", "revenue"])
    product_data = product_data[product_data["product_name"] != ""]

    if product_data.empty:
        return []

    top_products = (
        product_data.groupby("product_name", dropna=True)["revenue"]
        .sum()
        .sort_values(ascending=False)
        .head(limit)
    )

    return [
        {
            "product_name": product_name,
            "revenue": round(float(revenue), 2),
        }
        for product_name, revenue in top_products.items()
    ]
