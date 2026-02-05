// 🎯 Example: Multi-Graph with Dynamic Column Configuration

const panel = arguments[0];
const seriesList = panel.series;

console.log("=== MULTI-GRAPH WITH DYNAMIC COLUMNS ===");
console.log("Total series:", seriesList.length);

// Create graphs from series
const graphs = [];

seriesList.forEach((series, index) => {
  const xField = series.fields.find(f => f.name.includes("offset_arcsec"));
  const yField = series.fields.find(f => f.name.includes("power_lin_scale"));

  if (!xField || !yField) return;

  // Get label info for title
  const label = series.fields.find(f => f.labels?.scan_type)?.labels?.scan_type || `Graph ${index}`;

  graphs.push({
    id: `graph-${index}`,
    title: label,
    data: [
      {
        x: xField.values,
        y: yField.values,
        type: "scatter",
        mode: "lines",
        name: label,
        hoverinfo: "x+y"
      }
    ],
    layout: {
      title: label,
      xaxis: { title: "offset_arcsec" },
      yaxis: { title: "power_lin_scale" }
    },
    config: {},
    frames: []
  });
});

console.log("Graphs created:", graphs.length);

// ====================================
// OPTION 1: Equal Columns (auto-distributed)
// ====================================
// return { 
//   graphs,
//   gridConfig: { cols: 2 }  // [50%, 50%]
// };

// ====================================
// OPTION 2: Custom widths for all columns
// ====================================
// return { 
//   graphs,
//   gridConfig: { 
//     cols: 3,
//     widths: [50, 25, 25]  // [50%, 25%, 25%]
//   }
// };

// ====================================
// OPTION 3: Partial widths (smart auto-distribute)
// ====================================
// If you have 4 graphs and want:
// - 1st: 70% (large)
// - 2nd-4th: 10% each (small)
// return { 
//   graphs,
//   gridConfig: { 
//     cols: 4,
//     widths: [70]  // [70%, 10%, 10%, 10%]
//   }
// };

// ====================================
// OPTION 4: Multiple specified widths
// ====================================
// return { 
//   graphs,
//   gridConfig: { 
//     cols: 4,
//     widths: [40, 30]  // [40%, 30%, 15%, 15%]
//   }
// };

// ====================================
// CURRENT: Simple 2-column equal layout
// ====================================
return { 
  graphs,
  gridConfig: { cols: 2 }  // Auto: [50%, 50%]
};
