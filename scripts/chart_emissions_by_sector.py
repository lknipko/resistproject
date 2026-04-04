#!/usr/bin/env python3
"""Generate horizontal bar chart: Global GHG Emissions by Sector."""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

# Data sorted by value (will reverse for top-to-bottom display)
sectors = [
    ("Energy (electricity & heat)", 25),
    ("Agriculture & land use", 18),
    ("Transport", 16),
    ("Manufacturing & construction", 12),
    ("Industry (chemicals, cement, etc.)", 11),
    ("Buildings (heating, cooling)", 6),
    ("Fugitive emissions (leaks)", 6),
    ("Waste", 3),
    ("Other", 3),
]

labels = [s[0] for s in sectors]
values = [s[1] for s in sectors]

# Reverse so largest is at top
labels = labels[::-1]
values = values[::-1]

# Color spectrum: dark red (highest) to light orange (lowest)
# We'll create a gradient from light orange to dark red, then reverse to match order
from matplotlib.colors import LinearSegmentedColormap
cmap = LinearSegmentedColormap.from_list("", ["#FDBE70", "#E8772E", "#C0392B", "#8B1A1A"])
n = len(values)
# Colors mapped so highest value = darkest
colors = [cmap(i / (n - 1)) for i in range(n)]

fig, ax = plt.subplots(figsize=(10, 6), dpi=150)

bars = ax.barh(labels, values, color=colors, edgecolor='white', linewidth=0.5)

# Add percentage labels at end of each bar
for bar, val in zip(bars, values):
    ax.text(bar.get_width() + 0.4, bar.get_y() + bar.get_height() / 2,
            f'{val}%', va='center', ha='left', fontsize=10, fontfamily='sans-serif',
            fontweight='bold', color='#333333')

# Styling
ax.set_xlabel('% of Global Emissions', fontsize=11, fontfamily='sans-serif', color='#444444')
ax.set_xlim(0, 30)
ax.xaxis.grid(True, linestyle='-', alpha=0.3, color='lightgray')
ax.set_axisbelow(True)
ax.tick_params(axis='y', labelsize=10)
ax.tick_params(axis='x', labelsize=9, colors='#666666')
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)
ax.spines['bottom'].set_color('#cccccc')
ax.spines['left'].set_color('#cccccc')

for label in ax.get_yticklabels():
    label.set_fontfamily('sans-serif')
    label.set_color('#333333')

# Title and subtitle
fig.suptitle('Global Greenhouse Gas Emissions by Sector',
             fontsize=15, fontfamily='sans-serif', fontweight='bold',
             color='#222222', y=0.97)
fig.text(0.5, 0.915, 'Source: Climate Watch / World Resources Institute',
         ha='center', fontsize=9, fontfamily='sans-serif', color='#888888')

plt.subplots_adjust(top=0.88, bottom=0.10, left=0.30, right=0.92)

out = r'C:\Users\lknip\Documents\civic-action-wiki\resistproject\public\environment\charts\emissions-by-sector.png'
fig.savefig(out, dpi=150, bbox_inches=None)
plt.close(fig)
print(f"Saved: {out}")
