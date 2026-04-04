import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

years = list(range(1979, 2024))
extent = [
    7.2, 7.7, 7.25, 7.45, 7.5, 7.2, 6.9, 7.5, 7.5, 7.5,
    7.05, 6.2, 6.55, 7.55, 6.5, 7.18, 6.13, 7.88, 6.74, 6.56,
    6.24, 6.32, 6.75, 5.96, 6.15, 6.05, 5.57, 5.92, 4.17, 4.67,
    5.36, 4.90, 4.61, 3.41, 5.10, 5.03, 4.41, 4.14, 4.74, 4.59,
    4.14, 3.74, 4.72, 4.67, 4.23
]

fig, ax = plt.subplots(figsize=(10, 5))

# Shade area under line
ax.fill_between(years, extent, alpha=0.15, color='#1565C0')

# Main line
ax.plot(years, extent, color='#1565C0', linewidth=2, zorder=3)

# Trend line
z = np.polyfit(years, extent, 1)
p = np.poly1d(z)
trend_y = p(np.array(years))
ax.plot(years, trend_y, color='#C62828', linewidth=1.5, linestyle='--', label='Trend line')

# Annotate 2012 record low
idx_2012 = years.index(2012)
ax.annotate(
    '2012 record low\n3.41 million sq km',
    xy=(2012, extent[idx_2012]),
    xytext=(2005, 3.8),
    arrowprops=dict(arrowstyle='->', color='#C62828', lw=1.5),
    fontsize=9,
    color='#C62828',
    fontweight='bold'
)

# "~13% per decade decline" annotation
ax.text(1980, 4.5, '~13% per decade decline', fontsize=9.5, color='#C62828',
        fontstyle='italic')

ax.set_xlabel('Year', fontsize=11)
ax.set_ylabel('Million sq km', fontsize=11)
ax.set_xlim(1979, 2023)
ax.set_ylim(2.5, 8.5)
ax.grid(axis='y', linestyle='--', alpha=0.4)
ax.legend(fontsize=9, loc='upper right')

plt.suptitle('Arctic Sea Ice Minimum Extent (1979–2023)', fontsize=14, fontweight='bold', y=1.02)
fig.text(0.5, 0.92, 'September sea ice minimum is declining at ~13% per decade',
         ha='center', fontsize=11, color='#555555')
fig.subplots_adjust(top=0.82)
plt.figtext(0.5, 0.01, 'Source: NSIDC Sea Ice Index', ha='center', fontsize=9, color='#888888')

out_path = r'C:\Users\lknip\Documents\civic-action-wiki\resistproject\public\environment\charts\arctic-sea-ice.png'
plt.savefig(out_path, dpi=150, bbox_inches='tight')
plt.close()
print(f"Saved: {out_path}")
