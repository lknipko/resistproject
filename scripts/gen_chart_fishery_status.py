import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

years = [1974, 1979, 1984, 1989, 1994, 1999, 2004, 2009, 2014, 2019, 2021]

underfished  = [40, 38, 35, 30, 27, 25, 20, 15, 13, 10,  8]
sustainable  = [50, 52, 52, 55, 55, 57, 60, 60, 57, 57, 57]
overfished   = [10, 10, 13, 15, 18, 18, 20, 25, 30, 33, 35]

fig, ax = plt.subplots(figsize=(10, 5))

ax.stackplot(
    years,
    overfished, sustainable, underfished,
    labels=['Overfished', 'Sustainable', 'Underfished / recovering'],
    colors=['#C62828', '#00838F', '#2E7D32'],
    alpha=0.85
)

ax.set_xlabel('Year', fontsize=11)
ax.set_ylabel('Percentage of fish stocks (%)', fontsize=11)
ax.set_xlim(1974, 2021)
ax.set_ylim(0, 100)
ax.set_xticks(years)
ax.grid(axis='y', linestyle='--', alpha=0.3)

# Legend — place inside plot, upper left
handles, labels = ax.get_legend_handles_labels()
ax.legend(handles[::-1], labels[::-1], loc='upper left', fontsize=9, framealpha=0.9)

plt.suptitle('Global Marine Fishery Status (1974–2021)', fontsize=14, fontweight='bold', y=1.02)
fig.text(0.5, 0.92, 'The share of overfished stocks has tripled since 1974 — from 10% to over 35%',
         ha='center', fontsize=11, color='#555555')
fig.subplots_adjust(top=0.82)
plt.figtext(0.5, 0.01, 'Source: FAO State of World Fisheries and Aquaculture 2022',
            ha='center', fontsize=9, color='#888888')

out_path = r'C:\Users\lknip\Documents\civic-action-wiki\resistproject\public\environment\charts\fishery-status.png'
plt.savefig(out_path, dpi=150, bbox_inches='tight')
plt.close()
print(f"Saved: {out_path}")
