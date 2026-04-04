import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

years = list(range(2013, 2024))
costs = [672, 588, 373, 273, 214, 160, 156, 137, 132, 151, 139]

fig, ax = plt.subplots(figsize=(10, 5))

bars = ax.bar(years, costs, color='#2E7D32', width=0.6, zorder=3)

# Value labels on top of each bar
for bar, val in zip(bars, costs):
    ax.text(
        bar.get_x() + bar.get_width() / 2,
        bar.get_height() + 8,
        f'${val}',
        ha='center', va='bottom', fontsize=8.5, color='#333333', fontweight='bold'
    )

# Annotate 2023 bar with arrow
ax.annotate(
    '82% drop\nsince 2013',
    xy=(2023, costs[-1]),
    xytext=(2020.5, 350),
    arrowprops=dict(arrowstyle='->', color='#C62828', lw=1.5),
    fontsize=9.5,
    color='#C62828',
    fontweight='bold',
    ha='center'
)

ax.set_xlabel('Year', fontsize=11)
ax.set_ylabel('$/kWh (nominal)', fontsize=11)
ax.set_xticks(years)
ax.set_ylim(0, 780)
ax.grid(axis='y', linestyle='--', alpha=0.4)

plt.suptitle('Lithium-Ion Battery Pack Costs (2013–2023)', fontsize=14, fontweight='bold', y=1.02)
fig.text(0.5, 0.92, 'Costs have fallen 82% since 2013 — making clean energy storage increasingly competitive',
         ha='center', fontsize=11, color='#555555')
fig.subplots_adjust(top=0.82)
plt.figtext(0.5, 0.01, 'Source: BloombergNEF Energy Storage Summit 2024', ha='center', fontsize=9, color='#888888')

out_path = r'C:\Users\lknip\Documents\civic-action-wiki\resistproject\public\environment\charts\battery-storage-costs.png'
plt.savefig(out_path, dpi=150, bbox_inches='tight')
plt.close()
print(f"Saved: {out_path}")
