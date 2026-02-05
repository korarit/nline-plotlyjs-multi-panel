# 🔍 ขั้นตอนการแก้ไขปัญหา Multi-Graph "No Data"

## โซ่การไหล

```
Script: { graphs: [...] }
    ↓
evaluatedScript = { graphs: [...] }
    ↓
isMultiGraphMode = true/false
    ↓
multiGraphCharts = process each graph
    ↓
MultiGraphPanel renders
```

## ขั้นตอนการ Debug

### 1. เปิด Browser Console (F12)

ในหน้า Grafana Dashboard:
```
Press F12 → Console tab
```

### 2. เปิด Plugin Panel

กดปุ่ม Refresh / Reload panel

### 3. ดู Console Logs

ค้นหา log ที่มีลักษณะนี้:

```javascript
🔍 SimplePanel Debug: {
  evaluatedScript: {...},
  hasGraphs: true/false,
  graphsLength: 2,
  isMultiGraphMode: true/false
}
```

```javascript
📊 MultiGraphCharts processed: {
  count: 2,
  cols: 1,
  rows: 2,
  charts: [...]
}
```

```javascript
🎨 Rendering MultiGraphPanel with: {
  multiGraphChartsLength: 2,
  gridCols: 1
}
```

## Debugging Checklist

### ✅ Script ส่งคืนข้อมูลแล้ว
- [ ] ดู console มี `graphs` array
- [ ] ตรวจสอบ `graphs.length > 0`
- [ ] ตรวจสอบแต่ละ graph มี `data`, `layout`, `id`

**ถ้า ❌ ไม่มี:**
```
const graphs = [];
graphs.push({
  id: "azimuth-graph",
  title: "Azimuth Scan",
  data: [...],  // ← ต้อง array
  layout: {...}
});
return { graphs };  // ← ต้อง object กับ graphs property
```

### ✅ SimplePanel detect isMultiGraphMode = true
- [ ] ดู log `🔍 SimplePanel Debug`
- [ ] Check `hasGraphs: true`
- [ ] Check `graphsLength: 2` (or your number)
- [ ] Check `isMultiGraphMode: true`

**ถ้า ❌ isMultiGraphMode = false:**
```javascript
// ตรวจสอบ script ว่า return format ถูกหรือไม่
console.log("Script returns:", arguments[0]);
return { graphs };  // ← ต้องมี graphs property
```

### ✅ multiGraphCharts ประมวลผลสำเร็จ
- [ ] ดู log `📊 MultiGraphCharts processed`
- [ ] Check `count: 2` (or your number)
- [ ] Check ทุก chart มี `dataLength > 0`
- [ ] Check ทุก chart มี `hasLayout: true`

**ถ้า ❌ dataLength = 0:**
```javascript
// ตรวจสอบ graph.data ในแต่ละ graph
graphs[0].data.forEach((trace, i) => {
  console.log(`Trace ${i}:`, {
    name: trace.name,
    xLength: trace.x?.length,
    yLength: trace.y?.length,
    type: trace.type,
  });
});
```

### ✅ MultiGraphPanel render
- [ ] ดู log `🎨 Rendering MultiGraphPanel`
- [ ] Check `multiGraphChartsLength: 2`
- [ ] ลองดู HTML structure ว่ามี element หรือไม่

**ถ้า ❌ multiGraphChartsLength = 0 or undefined:**
```
มีปัญหาที่ useMemo dependency array
ตรวจสอบว่า isMultiGraphMode, evaluatedScript อัปเดตแล้ว
```

## Common Issues & Fixes

### ❌ isMultiGraphMode = false แม้ script ส่ง graphs
**สาเหตุ:** Script ส่ง format ผิด

**ตรวจสอบ:**
```javascript
// ✅ ถูก
return { graphs: [...] };

// ❌ ผิด
return { data: [...] };  // ← ไม่มี graphs property
return [...];  // ← ไม่เป็น object
```

### ❌ dataLength = 0
**สาเหตุ:** Traces ไม่ถูกสร้าง

**ตรวจสอบ:**
```javascript
const traces = seriesList.map(s => buildTrace(s, "Azimuth")).filter(Boolean);
console.log("Traces created:", traces.length);  // ← ต้อง > 0

graphs.push({
  data: traces,  // ← traces array
  layout: {...},
  id: "...",
  title: "..."
});
```

### ❌ "No data is empty or not an array of traces"
**สาเหตุ:** PlotlyChart ได้รับ data ที่ invalid

**ตรวจสอบ:**
```javascript
// ✅ ถูก
graph.data = [
  { x: [...], y: [...], type: "scatter", ... },
  { x: [...], y: [...], type: "scatter", ... }
];

// ❌ ผิด
graph.data = { ... };  // ← object แทน array
graph.data = null;
graph.data = [];  // ← empty array
```

## ถ้ายังหาไม่เจอ

1. **Search for any console error:**
   ```
   F12 → Console
   Look for red error messages
   ```

2. **Check Network tab:**
   ```
   F12 → Network
   Look for 4xx/5xx errors
   ```

3. **Check Grafana server logs:**
   ```bash
   docker logs -f grafana  # if using docker
   # or
   journalctl -u grafana-server -f
   ```

4. **Verify Plugin Installation:**
   ```bash
   # Check if dist/ folder copied to plugins
   ls -la /var/lib/grafana/plugins/nline-plotlyjs-panel/dist/
   ```

5. **Force Reload Plugin:**
   ```bash
   # Restart Grafana
   sudo systemctl restart grafana-server
   
   # Then clear browser cache
   Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   ```

## Debug Script - Insert into panel

```javascript
const panel = arguments[0];
const seriesList = panel.series;

console.log("=== DEBUG ===");
console.log("series count:", seriesList.length);
console.log("series[0] fields:", seriesList[0]?.fields);

// Your graph building code here...

console.log("graphs created:", graphs.length);
console.log("graphs data:", graphs);

return { graphs };
```

## Expected Output

✅ ถ้าทุกอย่างถูกต้อง ควรเห็น:

```
🔍 SimplePanel Debug: {
  evaluatedScript: {graphs: Array(2)},
  hasGraphs: true,
  graphsLength: 2,
  isMultiGraphMode: true
}

📊 MultiGraphCharts processed: {
  count: 2,
  cols: 1,
  rows: 2,
  charts: Array(2)
}

🎨 Rendering MultiGraphPanel with: {
  multiGraphChartsLength: 2,
  gridCols: 1
}
```

และบน panel ควรเห็น **2 graphs** แสดงออกมา! 🎉
