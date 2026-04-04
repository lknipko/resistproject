import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

years = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2019]
production = [2, 7, 30, 65, 120, 210, 310, 460]

fig, ax = plt.subplots(figsize=(10, 5))

ax.fill_between(years, production, alpha=0.15, color='#1565C0')
ax.plot(years, production, color='#1565C0', linewidth=2.5, marker='o',
        markersize=6, zorder=3, label='Annual plastic production')

ax.set_xlabel('Year', fontsize=11)
ax.set_ylabel('Million metric tons', fontsize=11)
ax.set_xlim(1948, 2021)
ax.set_ylim(0, 520)
ax.set_xticks(years)
ax.grid(axis='y', linestyle='--', alpha=0.4)

# Annotate stat box
box_text = (
    "Of all plastic ever produced:\n"
    "  • 9% recycled\n"
    "  • 12% incinerated\n"
    "  • 79% in landfills or environment"
)
ax.text(
    1951, 380,
    box_text,
    fontsize=9.5,
    color='#333333',
    verticalalignment='top',
    bbox=dict(boxstyle='round,pad=0.5', facecolor='#FFF9C4', edgecolor='#F9A825', alpha=0.95)
)

ax.legend(fontsize=10, loc='lower right')

plt.suptitle('Global Plastic Production vs. Recycling (1950–2019)', fontsize=14, fontweight='bold', y=1.02)
fig.text(0.5, 0.92,
         "Of the 9.2 billion tons of plastic ever produced, only 9% has been recycled",
         ha='center', fontsize=11, color='#555555')
fig.subplots_adjust(top=0.82)
plt.figtext(0.5, 0.01, 'Source: Geyer et al., Science Advances, 2017',
            ha='center', fontsize=9, color='#888888')

out_path = r'C:\Users\lknip\Documents\civic-action-wiki\resistproject\public\environment\charts\plastic-waste.png'
plt.savefig(out_path, dpi=150, bbox_inches='tight')
plt.close()
print(f"Saved: {out_path}")
