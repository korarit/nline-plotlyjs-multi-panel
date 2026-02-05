# Multi-Graph Mode - Quick Start Guide

## Overview
The Plotly Panel now supports displaying multiple graphs simultaneously! Configure gridCols and use the Processing Script to create and customize multiple charts dynamically.

## Key Features
✅ Display multiple graphs in a configurable grid (1-6 columns)
✅ Each graph can be customized independently
✅ Use JavaScript Processing Script to dynamically generate graphs
✅ Support for per-graph custom scripts and event handlers
✅ Maintains all original features (time sync, exports, etc.)

## Quick Start

### 1. Switch to Multi-Graph Mode
In the Processing Script, return an object with a `graphs` array:

```javascript
const graphs = [];
data.series.forEach((series, index) => {
  const xField = series.fields[0];
  const yField = series.fields[1];
  
  if (yField) {
    graphs.push({
      id: `graph-${index}`,
      title: yField.name,
      data: [{
        x: xField.values,
        y: yField.values,
        type: 'scatter',
        mode: 'lines'
      }],
      layout: { title: { text: yField.name } },
      config: {},
      frames: []
    });
  }
});

return { graphs };
```

### 2. Configure Grid Layout
Set **Grid Columns** to control layout:
- **1 column**: Single column (default)
- **2 columns**: 2 graphs per row
- **3 columns**: 3 graphs per row
- etc.

### 3. (Optional) Add Per-Graph Scripts
Each graph can have its own processing script:

```javascript
// Individual graph script runs after main Processing Script
// Available: data, variables, options, utils (same as main script)

return {
  data: [{ /* modified data */ }],
  layout: { /* modified layout */ }
}
```

## Graph Configuration Object

```typescript
interface GraphConfig {
  id: string;              // Unique ID for the graph
  title: string;          // Graph title (displayed)
  data: any[];           // Plotly data (traces array)
  layout: object;        // Plotly layout configuration
  config: object;        // Plotly config (responsive, etc.)
  frames: any[];         // Animation frames (optional)
  script: string;        // Per-graph processing script (optional)
  onclick: string;       // Per-graph event handler (optional)
}
```

## Common Use Cases

### Display Multiple Metrics
```javascript
const metrics = [];
['cpu', 'memory', 'disk', 'network'].forEach(metric => {
  const series = data.series.find(s => s.name.includes(metric));
  if (series && series.fields[1]) {
    metrics.push({
      id: metric,
      title: metric.toUpperCase(),
      data: [{
        x: series.fields[0].values,
        y: series.fields[1].values,
        type: 'scatter',
        mode: 'lines',
        fill: 'tozeroy'
      }],
      layout: { yaxis: { title: 'Percentage' } },
      config: {},
      frames: []
    });
  }
});

return { graphs: metrics };
```

### Grouped Data (2 Columns)
```javascript
// If you have 4 series, display them in 2x2 grid
// Set gridCols = 2
const graphs = data.series.map((series, i) => ({
  id: `metric-${i}`,
  title: series.name,
  data: [{
    x: series.fields[0].values,
    y: series.fields[1].values,
    type: 'bar'
  }],
  layout: {},
  config: {},
  frames: []
}));

return { graphs };
```

### Time Series with Annotations
```javascript
const graphs = [];
data.series.forEach(series => {
  const xField = series.fields[0];
  const yField = series.fields[1];
  
  graphs.push({
    id: series.refId,
    title: `${series.name} - ${yField.name}`,
    data: [{
      x: xField.values,
      y: yField.values,
      type: 'scatter',
      mode: 'lines+markers'
    }],
    layout: {
      xaxis: { type: 'date' },
      annotations: [
        { x: xField.values[0], text: 'Start', showarrow: true }
      ]
    },
    config: {},
    frames: []
  });
});

return { graphs };
```

## Switching Back to Single Graph Mode
Simply remove the return statement that returns `{ graphs }` or return an empty `graphs` array. The panel will automatically switch to single-graph mode.

## Available Variables in Script
- **data**: Panel data with all series
- **variables**: Dashboard template variables
- **options**: Panel options (gridCols, etc.)
- **utils**: {
    - timeZone
    - dayjs (date library)
    - matchTimezone
    - locationService
    - getTemplateSrv
    - replaceVariables
  }

## Event Handling in Multi-Graph Mode
```javascript
// In On-event Trigger script
const { type: eventType, data: eventData } = event;

// Multi-graph mode includes graphId
if (eventData.graphId) {
  console.log('Graph ID:', eventData.graphId);
}

if (eventType === 'zoom') {
  // Handle zoom
}
```

## Tips & Troubleshooting

**Graphs not showing?**
- Check browser console for script errors
- Verify graphs array has valid objects
- Ensure each graph has an id, title, and data

**Grid layout wrong?**
- Verify gridCols value (1-6)
- Check number of graphs matches expected layout

**Performance issues?**
- Reduce number of data points
- Use sampling on large datasets
- Limit number of simultaneous graphs

**Events not working?**
- Verify On-event Trigger script is defined
- Check event handler syntax in per-graph onclick

## See Also
- `MULTI_GRAPH_GUIDE.md` - Detailed documentation
- `MULTI_GRAPH_CONFIG_EXAMPLE.yaml` - YAML configuration examples
