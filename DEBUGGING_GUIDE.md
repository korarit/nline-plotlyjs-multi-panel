# Debugging Multi-Graph Issues in Grafana

## ปัญหา: "No data" or "Data is empty or not an array of traces"

### สาเหตุที่พบบ่อย

#### 1. ❌ ใช้ `arguments[0]` แทน `data`
```javascript
// ❌ WRONG - arguments ไม่ได้รับ panel object ใน Grafana
const panel = arguments[0];
const seriesList = panel.series;

// ✅ CORRECT - ใช้ตัวแปร data ที่ Grafana ส่งมา
const seriesList = data.series;
```

#### 2. ❌ ไม่ตรวจสอบว่า data มีข้อมูลหรือไม่
```javascript
// ❌ WRONG - จะ error ถ้า data.series ว่าง
const seriesList = data.series;

// ✅ CORRECT - ตรวจสอบก่อน
if (!data || !data.series || data.series.length === 0) {
  console.warn("No data available");
  return { graphs: [] };
}
const seriesList = data.series;
```

#### 3. ❌ ไม่ return object ที่ถูกต้อง
```javascript
// ❌ WRONG - ถ้า graphs ว่างจะเกิด error
return graphs;  // ต้อง return object ที่มี graphs property

// ✅ CORRECT
return { graphs };
```

#### 4. ❌ Field name ไม่ตรงกับข้อมูล
```javascript
// ❌ WRONG - field อาจชื่ออื่น
const xField = series.fields.find(f => f.name.includes("offset_arcsec"));

// ✅ CORRECT - ตรวจสอบชื่อ field ก่อน
console.log("Available fields:", series.fields.map(f => f.name));
const xField = series.fields.find(f => f.name && f.name.includes("offset_arcsec"));
```

### วิธีการแก้ไข

#### Step 1: ตรวจสอบ Data Structure
เพิ่มโค้ด debug ในตอนต้นของ script:

```javascript
// Debug: ดูว่า data มีอะไรบ้าง
console.log("Data structure:", data);
console.log("Series count:", data.series.length);
console.log("First series fields:", data.series[0].fields.map(f => ({
  name: f.name,
  type: f.type,
  labels: f.labels,
  values_count: f.values.length
})));
```

จากนั้นเปิด Browser DevTools (F12) และดู Console tab เพื่อดูข้อมูล

#### Step 2: ตรวจสอบ Field Names
```javascript
// ดูชื่อ field ทั้งหมด
const series = data.series[0];
const fieldNames = series.fields.map(f => f.name);
console.log("Field names:", fieldNames);

// ใช้ชื่อที่ถูกต้อง
const xField = series.fields.find(f => f.name === "offset_arcsec");
const yField = series.fields.find(f => f.name === "power_lin_scale");
```

#### Step 3: ตรวจสอบ Labels
```javascript
// ดู labels ของ fields
const series = data.series[0];
series.fields.forEach(f => {
  console.log(`Field: ${f.name}, Labels:`, f.labels);
});
```

#### Step 4: ตรวจสอบ Graph Creation
```javascript
// ก่อน return ให้ log graphs
console.log("Created graphs:", graphs);
console.log("Graph count:", graphs.length);
graphs.forEach(g => {
  console.log(`Graph ${g.id}:`, {
    title: g.title,
    traces: g.data.length,
    data_points: g.data.map(t => t.x.length)
  });
});

return { graphs };
```

### ตัวอย่าง: Script ที่สมบูรณ์พร้อม Debug

```javascript
// ✅ Proper Multi-Graph Script with Debug

// 1. ตรวจสอบ data
if (!data || !data.series || data.series.length === 0) {
  console.error("ERROR: No data available");
  return { graphs: [] };
}

console.log("Data received. Series count:", data.series.length);

// 2. ดูชื่อ field ของ series แรก
const firstSeries = data.series[0];
console.log("First series fields:", firstSeries.fields.map(f => f.name));

// 3. สร้าง function สำหรับ build trace
function buildTrace(series) {
  try {
    // ค้นหา fields
    const xField = series.fields.find(f => f.name === "offset_arcsec");
    const yField = series.fields.find(f => f.name === "power_lin_scale");
    
    if (!xField || !yField) {
      console.warn("Missing required fields");
      return null;
    }
    
    const xVals = xField.values || [];
    const yVals = yField.values || [];
    
    if (xVals.length === 0) {
      console.warn("No data points in fields");
      return null;
    }
    
    return {
      x: xVals,
      y: yVals,
      type: 'scatter',
      mode: 'lines+markers',
      name: series.name || 'Series'
    };
  } catch (e) {
    console.error("Error building trace:", e);
    return null;
  }
}

// 4. สร้าง graphs
const traces = data.series
  .map(buildTrace)
  .filter(Boolean);

console.log("Traces created:", traces.length);

// 5. สร้าง graph object
const graphs = [];
if (traces.length > 0) {
  graphs.push({
    id: "main-graph",
    title: "Data Visualization",
    data: traces,
    layout: {
      title: "Plotly Chart",
      xaxis: { title: "X Axis" },
      yaxis: { title: "Y Axis" }
    },
    config: {},
    frames: []
  });
}

console.log("Graphs created:", graphs.length);

// 6. Return result
return { graphs };
```

### Checklist สำหรับ Debugging

- [ ] ✅ ใช้ `data` ไม่ใช่ `arguments[0]`
- [ ] ✅ ตรวจสอบ `data.series` มีข้อมูลหรือไม่
- [ ] ✅ ดู field names ของ series
- [ ] ✅ ดู field labels
- [ ] ✅ ตรวจสอบว่า traces มีข้อมูลหรือไม่
- [ ] ✅ ตรวจสอบว่า graphs array มี items หรือไม่
- [ ] ✅ Return object ที่ถูกต้อง: `{ graphs }`
- [ ] ✅ เปิด Console เพื่อดู debug logs
- [ ] ✅ ทำความสะอาดให้เหลือ logs ที่สำคัญตัวเดียว

### Common Console Output

**✅ SUCCESS:**
```
Data received. Series count: 3
First series fields: ["time", "offset_arcsec", "power_lin_scale", "scan_type"]
Traces created: 3
Graphs created: 1
```

**❌ ERROR:**
```
ERROR: No data available
// → Return early ด้วย { graphs: [] }
```

### Resources

- ดู `MULTI_GRAPH_GUIDE.md` - API reference เต็ม
- ดู `EXAMPLE_AZIMUTH_ELEVATION.js` - ตัวอย่าง complete script
- ตรวจสอบ Grafana logs: `journalctl -u grafana-server -f`

### Contact

หากยังมีปัญหา:
1. Copy console logs ทั้งหมด (F12 → Console)
2. ตรวจสอบชื่อ field ว่า match กับข้อมูลจริง
3. ลองใช้ simple script ก่อน แล้วค่อย add complexity
