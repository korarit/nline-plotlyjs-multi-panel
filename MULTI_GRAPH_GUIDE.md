## Multi-Graph Mode Documentation

### Overview
The Plotly Panel now supports displaying multiple graphs simultaneously in a configurable grid layout. You can customize each graph independently while maintaining all the original features like custom scripts, event handling, and time synchronization.

### How to Use Multi-Graph Mode

#### 1. Configuration
Multi-graph mode is activated when you add graph configurations to the panel options:
- Set **Grid Columns**: Choose how many columns per row (1-6)
- Each graph will be automatically sized to fit the grid

#### 2. Adding Graphs
To add graphs, you need to configure them programmatically through:
- **Panel Options**: Use the UI to configure basic options
- **Processing Script**: Use the script editor to dynamically create and configure multiple graphs

#### 3. Processing Script Example - Single Graph Mode (Default)
```javascript
// Basic timeseries plot
let series = data.series[0];
let x = series.fields[0];
let y = series.fields[1];

return {
  data: [{
    x: x.values || x.values.buffer,
    y: y.values || y.values.buffer,
    type: 'scatter',
    mode: 'lines',
    name: y.name
  }],
  layout: {
    xaxis: { title: x.name },
    yaxis: { title: y.name }
  }
}
```

#### 4. Processing Script Example - Multi-Graph Mode
```javascript
// Create multiple graphs from data series
const graphs = [];

data.series.forEach((series, index) => {
  const xField = series.fields[0];
  const yField = series.fields[1];
  
  if (yField) {
    graphs.push({
      id: `graph-${index}`,
      title: yField.name,
      data: [{
        x: xField.values || xField.values.buffer,
        y: yField.values || yField.values.buffer,
        type: 'scatter',
        mode: 'lines',
        name: yField.name
      }],
      layout: {
        xaxis: { title: xField.name },
        yaxis: { title: yField.name },
        title: { text: yField.name }
      },
      config: {},
      frames: [],
      script: '', // Optional: per-graph processing script
      onclick: ''  // Optional: per-graph event handler
    });
  }
});

return { graphs };
```

#### 5. Available Variables in Script
All standard variables are available:
- `data`: Processed panel data with all series
- `variables`: Dashboard template variables
- `options`: Panel options including gridCols
- `utils`: Utility functions (timeZone, dayjs, etc.)

#### 6. Graph Configuration Object
Each graph in the `graphs` array should have:
```typescript
{
  id: string;              // Unique identifier
  title: string;           // Display title
  data: any[];            // Plotly data traces
  layout: object;         // Plotly layout configuration
  config: object;         // Plotly config
  frames: any[];          // Animation frames (optional)
  script: string;         // Per-graph processing script (optional)
  onclick: string;        // Per-graph event handler (optional)
}
```

#### 7. Per-Graph Scripts
Each graph can have its own script that runs after the main processing script:
```javascript
// Available variables are the same as main script
// Plus: graph (the current graph configuration)

// Modify specific graph data
if (data.series.length > 2) {
  return {
    data: [{
      x: data.series[2].fields[0].values,
      y: data.series[2].fields[1].values,
      type: 'scatter',
      mode: 'markers'
    }]
  };
}
return {};
```

#### 8. Event Handling
The On-event Trigger script receives an additional `graphId` in the event data:
```javascript
try {
  const { type: eventType, data: eventData } = event;
  
  if (eventData.graphId) {
    console.log('Event from graph:', eventData.graphId);
  }
  
  if (eventType === 'zoom') {
    console.log('Zoom range:', eventData['xaxis.range']);
  }
} catch (error) {
  console.error('Error handling event:', error);
}
```

### Switching Between Modes

**Single Graph Mode** (default):
- Leave the `graphs` array empty or don't include it
- Use the standard Data, Layout, and Config editors

**Multi-Graph Mode**:
- Return an object with a `graphs` array from the Processing Script
- The grid will automatically render all graphs with the specified column layout

### Tips & Best Practices

1. **Dynamic Graph Generation**: Use the Processing Script to dynamically create graphs based on available data series
2. **Consistent Styling**: Use the allData editor to apply common settings to all traces across all graphs
3. **Performance**: For many graphs, consider limiting the number of data points or using more efficient rendering options
4. **Responsive Layout**: The grid automatically adjusts to the panel size and number of columns
5. **Error Handling**: Check console for individual graph processing errors

### Example: Dashboard Metrics
```javascript
// Display multiple metrics in a 2-column grid
const metrics = ['cpu', 'memory', 'disk', 'network'];
const graphs = [];

metrics.forEach(metric => {
  const series = data.series.find(s => s.refId === metric);
  if (series && series.fields.length > 1) {
    graphs.push({
      id: metric,
      title: `${metric.toUpperCase()} Usage`,
      data: [{
        x: series.fields[0].values,
        y: series.fields[1].values,
        type: 'scatter',
        mode: 'lines',
        fill: 'tozeroy'
      }],
      layout: {
        title: { text: metric.toUpperCase() },
        yaxis: { title: 'Percentage' }
      },
      config: {},
      frames: []
    });
  }
});

return { graphs };
```

### Troubleshooting

- **Graphs not appearing**: Check the Processing Script for errors in the console
- **Grid layout is wrong**: Verify gridCols value matches your desired layout
- **Event handling not working**: Make sure event handlers are defined in On-event Trigger
- **Performance issues**: Reduce number of graphs or data points, enable sampling
