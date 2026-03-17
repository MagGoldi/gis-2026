import json
import os

filepath = r'd:\worka\gis-2026\lab1\map.geojson'

with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

data['features'] = [
    f for f in data['features']
    if f.get('properties', {}).get('user') == 'MagGoldi'
]

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)
