#!/usr/bin/env python3
"""Generate donut chart: Global CO2 Emissions by Country."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

# Data
countries = [
    ("China", 30),
    ("United States", 14),
    ("India", 8),
    ("EU-27", 7),
    ("Russia", 5),
    ("Japan", 3),
    ("South Korea", 2),
    ("Iran", 2),
    ("Saudi Arabia", 2),
    ("Canada", 2),
    ("Rest of World", 25),
]

labels = [c[0] for c in countries]
values = [c[1] for c in countries]

# Custom colors per spec
colors = [
    '#8B1A1A',   # China - dark red
    '#C0392B',   # US - medium red
    '#E67E22',   # India - orange
    '#2C3E7B',   # EU-27 - dark blue
    '#7F8C8D',   # Russia - gray
    '#5DADE2',   # Japan - light blue
    '#85C1E9',   # South Korea - lighter blue
    '#A3D9A5',   # Iran - light green
    '#F7DC6F',   # Saudi Arabia - golden
    '#D4A574',   # Canada - tan
    '#BDC3C7',   # Rest of World - light gray
]

fig, ax = plt.subplots(figsize=(8, 8), dpi=150)

# Create donut chart
wedges, texts, autotexts = ax.pie(
    values,
    labels=None,
    autopct=lambda pct: f'{pct:.0f}%' if pct >= 3 else '',
    startangle=90,
    colors=colors,
    pctdistance=0.82,
    wedgeprops=dict(width=0.38, edgecolor='white', linewidth=1.5),
)

# Style the percentage labels
for autotext in autotexts:
    autotext.set_fontsize(9)
    autotext.set_fontfamily('sans-serif')
    autotext.set_fontweight('bold')
    autotext.set_color('#222222')

# Center donut hole with text
centre_circle = plt.Circle((0, 0), 0.62, fc='white')
ax.add_artist(centre_circle)
ax.text(0, 0.04, 'Global CO\u2082\nEmissions\nby Country',
        ha='center', va='center', fontsize=12, fontfamily='sans-serif',
        fontweight='bold', color='#333333', linespacing=1.4)

# Legend on the right
legend = ax.legend(
    wedges, [f'{l}  ({v}%)' for l, v in zip(labels, values)],
    title='',
    loc='center left',
    bbox_to_anchor=(1.0, 0.5),
    fontsize=9,
    frameon=False,
)
for text in legend.get_texts():
    text.set_fontfamily('sans-serif')
    text.set_color('#333333')

ax.set_aspect('equal')

# Title and subtitle
fig.suptitle('Who Emits the Most CO\u2082?',
             fontsize=16, fontfamily='sans-serif', fontweight='bold',
             color='#222222', y=0.96)
fig.text(0.5, 0.91, 'Current annual emissions  \u2022  Source: Global Carbon Project',
         ha='center', fontsize=9.5, fontfamily='sans-serif', color='#888888')

plt.subplots_adjust(top=0.88, bottom=0.05, left=0.05, right=0.68)

out = r'C:\Users\lknip\Documents\civic-action-wiki\resistproject\public\environment\charts\emissions-by-source.png'
fig.savefig(out, dpi=150, bbox_inches=None)
plt.close(fig)
print(f"Saved: {out}")
