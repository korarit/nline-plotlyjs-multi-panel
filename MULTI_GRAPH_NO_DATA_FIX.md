# 🔧 ปัญหา & วิธีแก้ - Multi-Graph "No Data"

## ปัญหาที่พบ

```
Script returns: { graphs: [...] }  ✅
Console shows: 2 graphs with 4 traces each ✅
But Panel shows: "No data"  ❌
```

## Root Cause

**SimplePanel.tsx ลำดับที่ผิด:**

1. `useChartConfig()` ตัวอักษร merge:
   - `options.data` (from panel options)
   - `evaluatedScript.data` (from script return)

2. Script ส่งคืน `{ graphs: [...] }` ไม่ใช่ `{ data: [...] }`

3. `useChartConfig()` ได้รับ `evaluatedScript` ซึ่งไม่มี `.data`

4. ผลมาจาก `useChartConfig()` เป็น `null` → panel แสดง "No data"

## วิธีแก้

### ✅ เปลี่ยนแปลง 1: ตรวจสอบ chartConfig ก่อนใช้
```tsx
// ก่อน ❌
const { isEmpty, message } = emptyData(chartConfig!.data);

// หลัง ✅
if (!chartConfig) {
  return <ErrorDisplay message="No chart configuration available" title="Data Error" isNoData={true} />;
}
const { isEmpty, message } = emptyData(chartConfig.data);
```

### ✅ เปลี่ยนแปลง 2: ไม่ส่ง evaluatedScript ไปยัง useChartConfig เมื่อ multi-graph
```tsx
// ก่อน ❌
const chartConfig = !isMultiGraphMode
  ? useChartConfig(options, evaluatedScript, replaceVariables, width, height, theme, data)
  : null;

// หลัง ✅
const chartConfig = !isMultiGraphMode
  ? useChartConfig(
      options,
      isMultiGraphMode ? null : evaluatedScript,  // ← ส่ง null เมื่อ multi-graph
      replaceVariables,
      width,
      height,
      theme,
      data
    )
  : null;
```

## ข้อมูลการไหลผลลัพธ์

### ❌ เก่า (ไม่ทำงาน)
```
Script: { graphs: [...] }
    ↓
evaluatedScript = { graphs: [...] }
    ↓
useChartConfig ตามหา evaluatedScript.data (ไม่มี!)
    ↓
chartConfig.data = undefined/null
    ↓
emptyData() → "No data" ❌
```

### ✅ ใหม่ (ทำงาน)
```
Script: { graphs: [...] }
    ↓
evaluatedScript = { graphs: [...] }
    ↓
isMultiGraphMode = true
    ↓
chartConfig = null (ไม่ใช้ useChartConfig)
    ↓
multiGraphCharts = process each graph from evaluatedScript.graphs
    ↓
MultiGraphPanel renders all graphs ✅
```

## Files Updated

- ✅ `src/SimplePanel.tsx` - Fixed chartConfig logic

## Build Status

✅ `webpack 5.102.1 compiled with 3 warnings in 55873 ms`

## Next Steps

1. Copy `dist/` to Grafana plugins folder
2. Restart Grafana
3. Test with script:
   ```javascript
   return { graphs: [...] };  // ✅ Correct format
   ```
4. Should see **2 graphs** displayed correctly! 🎉

## Testing Your Script

```javascript
const panel = arguments[0];
const seriesList = panel.series;

function buildTraceForSeries(s, axisType) {
  // ... your code ...
}

const graphs = [];

// Azimuth Graph
const azTraces = seriesList
  .map(s => buildTraceForSeries(s, "Azimuth"))
  .filter(Boolean);

if (azTraces.length > 0) {
  graphs.push({
    id: "azimuth-graph",
    title: "Azimuth Scan",
    data: azTraces,
    layout: { ... }
  });
}

// Elevation Graph
const elTraces = seriesList
  .map(s => buildTraceForSeries(s, "Elevation"))
  .filter(Boolean);

if (elTraces.length > 0) {
  graphs.push({
    id: "elevation-graph",
    title: "Elevation Scan",
    data: elTraces,
    layout: { ... }
  });
}

return { graphs };  // ✅ This is correct!
```

## Verification Checklist

- [x] `isMultiGraphMode` checks `evaluatedScript.graphs`
- [x] `chartConfig` is null when multi-graph
- [x] `multiGraphCharts` processes `evaluatedScript.graphs`
- [x] `MultiGraphPanel` renders all graphs
- [x] Build successful
- [ ] Test in Grafana (next step)
