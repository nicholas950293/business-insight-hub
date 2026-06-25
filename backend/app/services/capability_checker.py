MODULE_REQUIREMENTS = {
    "dataset_overview": [],
    "revenue_trend": ["order_date", "revenue"],
    "category_sales": ["category", "revenue"],
    "top_products": ["product_name", "revenue"],
    "aov": ["order_id", "revenue"],
    "repeat_customer": ["customer_id", "order_date"],
}


def check_available_modules(columns: list[str]) -> tuple[list[str], list[dict[str, str]]]:
    normalized_columns = {column.strip().lower() for column in columns}
    available_modules = []
    skipped_modules = []

    for module_name, required_columns in MODULE_REQUIREMENTS.items():
        missing_columns = [
            column for column in required_columns if column not in normalized_columns
        ]

        if missing_columns:
            skipped_modules.append(
                {
                    "module": module_name,
                    "reason": (
                        "Missing required columns: " + ", ".join(missing_columns)
                    ),
                }
            )
        else:
            available_modules.append(module_name)

    return available_modules, skipped_modules
