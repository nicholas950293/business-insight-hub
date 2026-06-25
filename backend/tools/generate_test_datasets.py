from pathlib import Path

import numpy as np
import pandas as pd

RANDOM_SEED = 20260625
ROW_COUNT = 3000
CUSTOMER_COUNT = 600
OUTPUT_DIR = Path(__file__).resolve().parents[1] / "test_data"

CATEGORIES = {
    "Electronics": {
        "products": [
            "Wireless Headphones",
            "Smart Watch",
            "Bluetooth Speaker",
            "Laptop Stand",
            "Portable Charger",
            "USB-C Hub",
            "Mechanical Keyboard",
            "Webcam Pro",
        ],
        "prices": [39.99, 59.99, 89.99, 129.99, 199.99, 349.99, 699.99],
        "category_weight": 0.25,
    },
    "Clothing": {
        "products": [
            "Cotton Hoodie",
            "Running Shoes",
            "Denim Jacket",
            "Graphic T-Shirt",
            "Yoga Leggings",
            "Rain Jacket",
            "Polo Shirt",
            "Slim Fit Jeans",
        ],
        "prices": [19.99, 29.99, 44.99, 59.99, 79.99, 99.99],
        "category_weight": 0.22,
    },
    "Home & Kitchen": {
        "products": [
            "Air Fryer",
            "Kitchen Knife Set",
            "Coffee Grinder",
            "Robot Vacuum",
            "Bamboo Cutting Board",
            "Electric Kettle",
            "Bed Sheet Set",
            "Compact Blender",
        ],
        "prices": [14.99, 24.99, 39.99, 74.99, 119.99, 249.99],
        "category_weight": 0.2,
    },
    "Beauty": {
        "products": [
            "Vitamin C Serum",
            "Face Moisturizer",
            "Makeup Brush Set",
            "Hair Dryer",
            "Sunscreen SPF 50",
            "Sheet Mask Bundle",
            "Retinol Night Cream",
            "Body Lotion",
        ],
        "prices": [7.99, 12.99, 18.99, 24.99, 34.99, 59.99],
        "category_weight": 0.14,
    },
    "Sports": {
        "products": [
            "Yoga Mat",
            "Resistance Bands",
            "Insulated Water Bottle",
            "Foam Roller",
            "Adjustable Dumbbell",
            "Basketball",
            "Trail Backpack",
            "Running Waist Pack",
        ],
        "prices": [9.99, 16.99, 24.99, 39.99, 64.99, 119.99],
        "category_weight": 0.11,
    },
    "Books": {
        "products": [
            "Business Strategy Handbook",
            "Modern JavaScript Guide",
            "Healthy Meal Prep",
            "Personal Finance Basics",
            "Data Analytics Primer",
            "Leadership Playbook",
            "Mystery Novel Collection",
            "Python Crash Course",
        ],
        "prices": [6.99, 9.99, 14.99, 18.99, 24.99, 34.99],
        "category_weight": 0.08,
    },
}


def weighted_dates(rng: np.random.Generator) -> pd.Series:
    dates = pd.date_range("2023-01-01", "2024-12-31", freq="D")
    weights = []

    for current_date in dates:
        month_multiplier = 1.0
        if current_date.month == 11:
            month_multiplier = 1.8
        elif current_date.month == 12:
            month_multiplier = 2.1
        elif current_date.month in (1, 7):
            month_multiplier = 1.1
        elif current_date.month in (2, 9):
            month_multiplier = 0.9

        weekend_multiplier = 1.16 if current_date.weekday() >= 5 else 1.0
        growth_multiplier = 1 + (current_date - dates[0]).days / len(dates) * 0.18
        weights.append(month_multiplier * weekend_multiplier * growth_multiplier)

    probabilities = np.array(weights) / np.sum(weights)
    return pd.Series(rng.choice(dates, size=ROW_COUNT, p=probabilities))


def generate_base_dataset(seed: int = RANDOM_SEED) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    category_names = list(CATEGORIES.keys())
    category_weights = [CATEGORIES[name]["category_weight"] for name in category_names]

    categories = rng.choice(category_names, size=ROW_COUNT, p=category_weights)
    order_dates = weighted_dates(rng)
    customer_pool = [f"CUST-{number:04d}" for number in range(1, CUSTOMER_COUNT + 1)]
    customer_weights = np.array([1 / ((index + 1) ** 0.5) for index in range(CUSTOMER_COUNT)])
    customer_weights = customer_weights / customer_weights.sum()

    rows = []
    for index, category in enumerate(categories, start=1):
        config = CATEGORIES[category]
        product_weights = np.array(
            [1 / ((rank + 1) ** 0.9) for rank in range(len(config["products"]))]
        )
        product_weights = product_weights / product_weights.sum()

        product_name = rng.choice(config["products"], p=product_weights)
        customer_id = rng.choice(customer_pool, p=customer_weights)
        quantity = int(rng.choice([1, 2, 3, 4], p=[0.62, 0.25, 0.1, 0.03]))
        base_price = float(rng.choice(config["prices"]))
        unit_price = round(base_price * rng.triangular(0.9, 1.0, 1.18), 2)
        revenue = round(quantity * unit_price, 2)

        rows.append(
            {
                "order_id": f"ORD-{index:06d}",
                "customer_id": customer_id,
                "order_date": order_dates.iloc[index - 1].date().isoformat(),
                "product_name": product_name,
                "category": category,
                "quantity": quantity,
                "unit_price": unit_price,
                "revenue": revenue,
            }
        )

    dataframe = pd.DataFrame(rows).sort_values(["order_date", "order_id"])
    dataframe["order_id"] = [f"ORD-{index:06d}" for index in range(1, len(dataframe) + 1)]
    return dataframe


def apply_missing_values(
    dataframe: pd.DataFrame,
    missing_rates: dict[str, float],
    seed: int,
) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    result = dataframe.copy()

    for column, rate in missing_rates.items():
        missing_count = int(round(len(result) * rate))
        missing_indexes = rng.choice(result.index, size=missing_count, replace=False)
        result.loc[missing_indexes, column] = pd.NA

    return result


def write_dataset(filename: str, dataframe: pd.DataFrame) -> None:
    path = OUTPUT_DIR / filename
    dataframe.to_csv(path, index=False, encoding="utf-8")
    print(f"{filename}: {len(dataframe)} rows | columns: {list(dataframe.columns)}")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    normal = generate_base_dataset()

    light_missing = apply_missing_values(
        normal,
        {"customer_id": 0.05, "quantity": 0.02, "revenue": 0.01},
        RANDOM_SEED + 1,
    )
    heavy_missing = apply_missing_values(
        normal,
        {"customer_id": 0.4, "order_date": 0.25, "revenue": 0.2},
        RANDOM_SEED + 2,
    )
    missing_columns = normal.drop(columns=["customer_id", "product_name"])
    wrong_column_names = normal.rename(
        columns={
            "customer_id": "customer",
            "product_name": "product",
            "order_date": "date",
        }
    )

    datasets = {
        "01_normal.csv": normal,
        "02_missing_values_light.csv": light_missing,
        "03_missing_values_heavy.csv": heavy_missing,
        "04_missing_columns.csv": missing_columns,
        "05_wrong_column_names.csv": wrong_column_names,
    }

    for filename, dataframe in datasets.items():
        write_dataset(filename, dataframe)


if __name__ == "__main__":
    main()
