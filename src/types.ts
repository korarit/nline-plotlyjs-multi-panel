export interface SimpleOptions {
  imgFormat: 'svg' | 'png' | 'jpeg' | 'webp';
  exportWidth: number | null;
  exportHeight: number | null;
  resScale: number;
  timeCol: string;
  syncTimeRange: boolean;
  title: string;
  allData: object;
  data: any[];
  layout: object;
  config: object;
  frames: any[];
  script: string;
  onclick: string;
  gridCols: number;
  graphs: GraphConfig[];
}

/**
 * Multi-graph configuration for displaying multiple Plotly charts in a grid.
 * When the 'graphs' array has items, the panel will render in multi-graph mode.
 * Each graph can have its own data, layout, config, and processing script.
 * 
 * To use multi-graph mode:
 * 1. Return { graphs: [...], gridConfig: { cols: 3, widths: [70, 15, 15] } }
 * 2. gridConfig is optional - if not provided, will auto-distribute equally
 * 3. widths are percentages and should sum to 100 for optimal layout
 * 4. Each graph can have its own script for custom processing
 * 5. The Panel Processing Script will be applied first to all data
 * 6. Each graph's individual script will then process its specific data
 */
export interface GraphConfig {
  id: string;
  title: string;
  data: any[];
  layout: object;
  config: object;
  frames: any[];
  script: string;
  onclick: string;
}

/**
 * Grid layout configuration for multi-graph mode
 * cols: number of columns per row (1-6)
 * widths: array of column widths in percentage (e.g., [50, 30, 20])
 *         - Optional: if not provided, columns will be distributed equally
 *         - Can specify widths for some columns only (others will auto-distribute)
 *         - Example: [70] with 3 cols → [70%, 15%, 15%]
 */
export interface GridConfig {
  cols: number;
  widths?: number[];
}

export interface SimpleBase {
  allData: object;
  data: any[];
  layout: object;
  config: object;
  frames: any[];
}

export type EditorCodeType = string | undefined;

export type EditorLanguageType = 'javascript' | 'html' | 'yaml' | undefined;

const defaultLayout = {
  font: {
    family: 'Inter, Helvetica, Arial, sans-serif',
  },
  xaxis: {
    type: 'date',
    autorange: true,
    automargin: true,
  },
  yaxis: {
    autorange: true,
    automargin: true,
  },
  title: {
    automargin: true,
  },
  margin: {
    l: 0,
    r: 0,
    b: 0,
    t: 0,
  },
};

// Defaults that Plotly falls back to
export const base: SimpleBase = {
  allData: {},
  data: [],
  layout: defaultLayout,
  config: {},
  frames: [],
};

// Defaults that Plotly begins with as an example
export const inits: SimpleOptions = {
  imgFormat: 'png',
  exportWidth: null,
  exportHeight: null,
  resScale: 2,
  timeCol: '',
  syncTimeRange: true,
  title: 'Plotly panel',
  allData: {},
  data: [],
  layout: defaultLayout,
  config: {},
  frames: [],
  gridCols: 1,
  graphs: [],
  script: `\
// Single Graph Mode Example:
// Create a basic timeseries plot
/*
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

// Multi-Graph Mode Example 1 - Equal Columns:
// Auto-distribute columns equally
const graphs = [];
data.series.forEach((series, index) => {
  const xField = series.fields[0];
  const yField = series.fields[1];
  if (yField) {
    graphs.push({
      id: \`graph-\${index}\`,
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
        yaxis: { title: yField.name }
      },
      config: {},
      frames: []
    });
  }
});

return { 
  graphs,
  gridConfig: { cols: 2 }  // Auto-distribute: [50%, 50%]
};

// Multi-Graph Mode Example 2 - Custom Column Widths:
// Specify widths for some/all columns
const graphs = [];
data.series.forEach((series, index) => {
  // ... create graphs
});

return { 
  graphs,
  gridConfig: { 
    cols: 3,
    widths: [70]  // First column 70%, others auto: [70%, 15%, 15%]
  }
};

// Multi-Graph Mode Example 3 - Custom Widths for All:
return { 
  graphs,
  gridConfig: { 
    cols: 3,
    widths: [50, 30, 20]  // Exact: [50%, 30%, 20%]
  }
};
*/

return {}
  `,
  onclick: `\
// Event handling
/*
const { type: eventType, data: eventData } = event;
const { timeZone, dayjs, locationService, getTemplateSrv } = utils;

// Multi-graph mode includes graphId in eventData
if (eventData.graphId) {
  console.log('Event from graph:', eventData.graphId);
}

switch (eventType) {
  case 'click':
    console.log('Click event:', eventData.points);
    break;
  case 'select':
    console.log('Selection event:', eventData.range);
    break;
  case 'zoom':
    console.log('Zoom event:', eventData);
    break;
  default:
    console.log('Unhandled event type:', eventType, eventData);
}
*/
  `,
};
