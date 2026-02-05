// ✅ Multi-Graph Mode สำหรับข้อมูล scan_type ใน labels
// Fixed: ใช้ตัวแปร data ที่ Grafana ส่งมาแทน arguments

// ฟังก์ชันสร้าง traces สำหรับแต่ละ series
function buildTraceForSeries(series, axisType) {
  // ค้นหา field ที่มี labels.scan_type
  const scanTypeField = series.fields.find(f => f.labels?.scan_type);
  if (!scanTypeField) return null;
  
  const scanType = scanTypeField.labels.scan_type;
  if (!scanType || !scanType.includes(axisType)) return null;

  // ค้นหา xField และ yField
  const xField = series.fields.find(f => f.name && f.name.includes("offset_arcsec"));
  const yField = series.fields.find(f => f.name && f.name.includes("power_lin_scale"));

  if (!xField || !yField) return null;

  const xVals = xField.values || [];
  const yVals = yField.values || [];

  if (xVals.length === 0 || yVals.length === 0) return null;

  // สร้าง hover text
  const hoverText = xVals.map((x, i) =>
    `scan_type: ${scanType}<br>offset_arcsec: ${x.toFixed(4)}<br>power_lin_scale: ${yVals[i].toFixed(4)}`
  );

  const isFitting = scanType.endsWith("Fitting");

  // ✅ เลือกสี
  let traceColor;

  if (axisType === "Azimuth") {
    if (scanType.includes("Azimuth_H")) {
      traceColor = isFitting ? "red" : "lightskyblue";
    } else if (scanType.includes("Azimuth_V")) {
      traceColor = isFitting ? "gray" : "greenyellow";
    } else {
      traceColor = isFitting ? "darkgray" : "gray";
    }
  } else if (axisType === "Elevation") {
    if (scanType.includes("Elevation_H")) {
      traceColor = isFitting ? "red" : "lightskyblue";
    } else if (scanType.includes("Elevation_V")) {
      traceColor = isFitting ? "gray" : "greenyellow";
    } else {
      traceColor = isFitting ? "darkgray" : "gray";
    }
  }

  const modeValue = isFitting ? "lines" : "markers";
  const traceStyle = isFitting
    ? { line: { width: 2, color: traceColor } }
    : { marker: { size: 7, color: traceColor } };

  return {
    x: xVals,
    y: yVals,
    type: "scatter",
    mode: modeValue,
    name: scanType,
    text: hoverText,
    hoverinfo: "text",
    ...traceStyle
  };
}

// ตรวจสอบว่า data มีข้อมูลหรือไม่
if (!data || !data.series || data.series.length === 0) {
  console.warn("No data available");
  return { graphs: [] };
}

const seriesList = data.series;
const graphs = [];

// ----------------------
// ✅ Graph 1: Azimuth
// ----------------------
const azTraces = seriesList
  .map(s => buildTraceForSeries(s, "Azimuth"))
  .filter(Boolean);

if (azTraces.length > 0) {
  graphs.push({
    id: "azimuth-graph",
    title: "Azimuth Scan",
    data: azTraces,
    layout: {
      title: "Azimuth: offset_arcsec vs power_lin_scale",
      xaxis: { title: "offset_arcsec", automargin: true },
      yaxis: { title: "power_lin_scale", automargin: true },
      hovermode: "closest",
      showlegend: true
    },
    config: {},
    frames: []
  });
}

// ----------------------
// ✅ Graph 2: Elevation
// ----------------------
const elTraces = seriesList
  .map(s => buildTraceForSeries(s, "Elevation"))
  .filter(Boolean);

if (elTraces.length > 0) {
  graphs.push({
    id: "elevation-graph",
    title: "Elevation Scan",
    data: elTraces,
    layout: {
      title: "Elevation: offset_arcsec vs power_lin_scale",
      xaxis: { title: "offset_arcsec", automargin: true },
      yaxis: { title: "power_lin_scale", automargin: true },
      hovermode: "closest",
      showlegend: true
    },
    config: {},
    frames: []
  });
}

// Debug log เพื่อดูสถานะ
console.log("Azimuth traces:", azTraces.length);
console.log("Elevation traces:", elTraces.length);
console.log("Total graphs:", graphs.length);

// ถ้าไม่มี graphs ให้ return error
if (graphs.length === 0) {
  console.warn("No graphs were created. Check data structure.");
  return { graphs: [] };
}

// 🔍 Debug: Log graphs ที่สร้าง
graphs.forEach((g, idx) => {
  console.log(`Graph ${idx}:`, {
    id: g.id,
    title: g.title,
    traces: g.data.length,
    data_points: g.data.map(t => t.x.length)
  });
});

console.log("✅ Returning graphs:", JSON.stringify(graphs, (key, value) => {
  if (key === 'x' || key === 'y') return `[Array(${value.length})]`;
  if (key === 'text') return '[Array]';
  return value;
}));

return { graphs };
