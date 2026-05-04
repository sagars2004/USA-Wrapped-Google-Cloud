import pandas as pd
import json
import hashlib
import os
import datetime

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# USA WRAPPED - ETL SCRIPT (COMPLIANCE FIREWALL)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# This script processes raw Olympic/Paralympic historical data into a 
# compliance-safe JSON file for the USA Wrapped application.
# It enforces strict rules: US athletes only, no individual names, no finish times.

# Ensure pandas is installed: pip install pandas

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_FILE = os.path.join(SCRIPT_DIR, "kaggle_dataset", "raw_athlete_data.csv")
OUTPUT_FILE = os.path.join(os.path.dirname(SCRIPT_DIR), "data", "usa_athletes.json")

def generate_hash(row):
    # Create a unique hash for each athlete/event without exposing their name
    # Using sport, year, and a combination of other attributes to ensure uniqueness
    # without retaining PII.
    unique_string = f"{row.get('Name', '')}_{row.get('Sport', '')}_{row.get('Year', '')}_{row.get('Event', '')}"
    return hashlib.md5(unique_string.encode()).hexdigest()

def clean_medal(medal):
    if pd.isna(medal) or medal == "NA":
        return "Participated"
    return medal

CITY_INFO = {
    "Albertville": {"state": "Auvergne-Rhone-Alpes", "region": "Europe"},
    "Amsterdam": {"state": "North Holland", "region": "Europe"},
    "Antwerpen": {"state": "Flanders", "region": "Europe"},
    "Athina": {"state": "Attica", "region": "Europe"},
    "Atlanta": {"state": "Georgia", "region": "North America"},
    "Barcelona": {"state": "Catalonia", "region": "Europe"},
    "Beijing": {"state": "Beijing", "region": "Asia"},
    "Berlin": {"state": "Berlin", "region": "Europe"},
    "Calgary": {"state": "Alberta", "region": "North America"},
    "Chamonix": {"state": "Auvergne-Rhone-Alpes", "region": "Europe"},
    "Cortina d'Ampezzo": {"state": "Veneto", "region": "Europe"},
    "Garmisch-Partenkirchen": {"state": "Bavaria", "region": "Europe"},
    "Grenoble": {"state": "Auvergne-Rhone-Alpes", "region": "Europe"},
    "Helsinki": {"state": "Uusimaa", "region": "Europe"},
    "Innsbruck": {"state": "Tyrol", "region": "Europe"},
    "Lake Placid": {"state": "New York", "region": "North America"},
    "Lillehammer": {"state": "Innlandet", "region": "Europe"},
    "London": {"state": "England", "region": "Europe"},
    "Los Angeles": {"state": "California", "region": "North America"},
    "Melbourne": {"state": "Victoria", "region": "Oceania"},
    "Mexico City": {"state": "Mexico City", "region": "North America"},
    "Montreal": {"state": "Quebec", "region": "North America"},
    "Moskva": {"state": "Moscow", "region": "Europe"},
    "Munich": {"state": "Bavaria", "region": "Europe"},
    "Nagano": {"state": "Nagano", "region": "Asia"},
    "Oslo": {"state": "Oslo", "region": "Europe"},
    "Paris": {"state": "Ile-de-France", "region": "Europe"},
    "Rio de Janeiro": {"state": "Rio de Janeiro", "region": "South America"},
    "Roma": {"state": "Lazio", "region": "Europe"},
    "Salt Lake City": {"state": "Utah", "region": "North America"},
    "Sankt Moritz": {"state": "Grisons", "region": "Europe"},
    "Sapporo": {"state": "Hokkaido", "region": "Asia"},
    "Sarajevo": {"state": "Sarajevo", "region": "Europe"},
    "Seoul": {"state": "Seoul", "region": "Asia"},
    "Sochi": {"state": "Krasnodar Krai", "region": "Europe"},
    "Squaw Valley": {"state": "California", "region": "North America"},
    "St. Louis": {"state": "Missouri", "region": "North America"},
    "Stockholm": {"state": "Stockholm", "region": "Europe"},
    "Sydney": {"state": "New South Wales", "region": "Oceania"},
    "Tokyo": {"state": "Tokyo", "region": "Asia"},
    "Torino": {"state": "Piedmont", "region": "Europe"},
    "Vancouver": {"state": "British Columbia", "region": "North America"}
}

def process_data():
    if not os.path.exists(INPUT_FILE):
        print(f"Error: {INPUT_FILE} not found.")
        print("Please download the Kaggle '120 years of Olympic history' dataset or equivalent.")
        print("Expected columns: Team/NOC, Name, Sport, Event, Year, Season, Medal, Height, Weight, etc.")
        return

    print("Loading raw data...")
    df = pd.read_csv(INPUT_FILE)
    
    # 1. Filter to US only
    # Depending on the dataset, the column might be 'Team', 'NOC', or 'Country'
    team_col = 'Team' if 'Team' in df.columns else 'NOC' if 'NOC' in df.columns else None
    
    if team_col:
        us_aliases = ['USA', 'United States', 'United States of America']
        df_us = df[df[team_col].isin(us_aliases)].copy()
    else:
        # Fallback if we don't know the exact column name for teams
        print("Warning: Could not find Team/NOC column. Proceeding without US filter (Make sure dataset is already US only).")
        df_us = df.copy()
    print(f"Filtered to US athletes only: {len(df_us)} records found.")

    # 2. Filter to USA-hosted events
    US_HOST_CITIES = ['Atlanta', 'Lake Placid', 'Los Angeles', 'Salt Lake City', 'Squaw Valley', 'St. Louis']
    df_us = df_us[df_us['City'].isin(US_HOST_CITIES)].copy()
    print(f"Filtered to USA-hosted events: {len(df_us)} records found.")

    # 3. Extract and transform permitted fields
    # Ensure all names, raw IDs, and performance times are DROPPED.
    athletes_data = []
    
    for _, row in df_us.iterrows():
        city = row.get('City', 'Unknown')
        city_info = CITY_INFO.get(city, {"state": "Unknown", "region": "Unknown"})

        athlete_record = {
            "id": generate_hash(row),
            "sport": row.get('Sport', 'Unknown'),
            "discipline": row.get('Event', 'Unknown'),
            "games_year": int(row['Year']) if 'Year' in row and pd.notna(row['Year']) else None,
            "games_season": row.get('Season', 'Unknown'),
            "games_type": "Paralympic" if "Paralympic" in str(row.get('Event', '')) or "Para" in str(row.get('Sport', '')) else "Olympic",
            "medal": clean_medal(row.get('Medal', None)),
            "city": city,
            "state": city_info["state"],
            "region": city_info["region"],
            "height_cm": float(row['Height']) if 'Height' in df.columns and pd.notna(row['Height']) else None,
            "weight_kg": float(row['Weight']) if 'Weight' in df.columns and pd.notna(row['Weight']) else None,
            "wingspan_cm": None, # Typically not in Kaggle dataset; kept null for schema compliance
            "para_classification": None # Set if applicable
        }
        athletes_data.append(athlete_record)

    # 4. Create JSON payload with schema
    output_payload = {
        "athletes": athletes_data,
        "metadata": {
            "last_updated": datetime.datetime.now().strftime("%Y-%m-%d"),
            "total_records": len(athletes_data),
            "source": "Kaggle 120yr Olympics filtered",
            "compliance_version": "1.0"
        }
    }

    # 5. Save to JSON
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(output_payload, f, indent=2)

    print(f"Success! {len(athletes_data)} compliance-safe records written to {OUTPUT_FILE}")

if __name__ == "__main__":
    process_data()
