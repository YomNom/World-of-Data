import pandas as pd

# Read the poverty data
poverty_df = pd.read_csv('data/share-of-population-in-extreme-poverty.csv')

# Find countries with no poverty data (completely empty share values)
countries_with_no_data = poverty_df[poverty_df['Share of population in poverty ($3 a day)'].isna()]['Entity'].unique()

print(f"Countries with no poverty data ($3 a day): {len(countries_with_no_data)}")
print("\nCountries:")
for country in sorted(countries_with_no_data):
    print(f"  - {country}")

# Save to output file
output_df = poverty_df[poverty_df['Share of population in poverty ($3 a day)'].isna()]
print(f"\nTotal rows with missing poverty data: {len(output_df)}")
