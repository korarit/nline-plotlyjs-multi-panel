# Multi-Graph Not Displaying - FIXED ✅

## ปัญหา
Script create 4 traces และ 2 graphs แต่ graph ไม่แสดงบน panel

## สาเหตุ
`isMultiGraphMode` ตรวจสอบ `options.graphs` (อพชัน) ไม่ใช่ `evaluatedScript.graphs` (จาก script)

## วิธีแก้ ✅
อัปเดท SimplePanel.tsx ให้ตรวจสอบ `evaluatedScript.graphs` แทน

### Change Log
```diff
- const isMultiGraphMode = options.graphs && options.graphs.length > 0;
+ const isMultiGraphMode = evaluatedScript?.graphs && evaluatedScript.graphs.length > 0;

- const cols = Math.max(1, Math.min(options.gridCols || 1, options.graphs.length));
+ const cols = Math.max(1, Math.min(options.gridCols || 1, evaluatedScript.graphs.length));

- return options.graphs.map((graph) => {
+ return evaluatedScript.graphs.map((graph) => {

- }, [isMultiGraphMode, options.graphs, options.gridCols, width, height, scriptVars, evaluateScript]);
+ }, [isMultiGraphMode, evaluatedScript, options.gridCols, width, height, scriptVars, evaluateScript]);
```

## How It Works

### ❌ เก่า (ไม่ทำงาน)
```
User Script → returns { graphs: [...] }
                            ↓
                    evaluatedScript.graphs
                            ↓
                    But SimplePanel checked options.graphs
                            ↓
                        ❌ Empty → No render
```

### ✅ ใหม่ (ทำงาน)
```
User Script → returns { graphs: [...] }
                            ↓
                    evaluatedScript.graphs
                            ↓
                    SimplePanel checks evaluatedScript.graphs
                            ↓
                        ✅ Found → Render MultiGraphPanel
```

## Testing Steps

1. **Build plugin:**
   ```bash
   npm run build
   ```

2. **Copy to Grafana:**
   ```bash
   cp -r dist/ /var/lib/grafana/plugins/nline-plotlyjs-panel
   ```

3. **Restart Grafana:**
   ```bash
   sudo systemctl restart grafana-server
   ```

4. **In Grafana Dashboard:**
   - Add Plotly panel
   - Set **Grid Columns** to 2
   - Paste script from `EXAMPLE_AZIMUTH_ELEVATION.js`
   - Check console (F12) for logs
   - Should see:
     ```
     Azimuth traces: 4
     Elevation traces: 4
     Total graphs: 2
     ✅ Returning graphs: [...]
     ```

5. **Verify graph renders:**
   - Should see 2 graphs side by side (2 columns)
   - Graph 1: Azimuth Scan
   - Graph 2: Elevation Scan

## Debug Checklist

- [x] Script creates graphs (logs show "Total graphs: 2")
- [x] evaluatedScript.graphs gets the data from script
- [x] SimplePanel checks the right variable
- [x] MultiGraphPanel renders with correct dimensions
- [x] gridCols is set (default: 1, can be 1-6)
- [x] Each graph has id, title, data, layout

## Expected Console Output

```
✅ Returning graphs: [{
  "id": "azimuth-graph",
  "title": "Azimuth Scan",
  "data": [{
    "x": "[Array(100)]",
    "y": "[Array(100)]",
    "type": "scatter",
    "mode": "lines",
    "name": "Azimuth_H"
  }, ...],
  "layout": {
    "title": "Azimuth: offset_arcsec vs power_lin_scale",
    "xaxis": {...},
    "yaxis": {...},
    "hovermode": "closest",
    "showlegend": true
  },
  "config": {},
  "frames": []
}, ...]
```

## ถ้ายังไม่ขึ้น

1. **Clear browser cache:** Ctrl+Shift+Delete
2. **Reload dashboard:** F5
3. **Check console:** F12 → Console
4. **Check Grafana logs:** `journalctl -u grafana-server -f`
5. **Verify gridCols:** Must be 1-6
6. **Verify script returns:** `{ graphs: [...] }`

## Files Updated

- ✅ `src/SimplePanel.tsx` - Fixed isMultiGraphMode check
- ✅ `EXAMPLE_AZIMUTH_ELEVATION.js` - Added better debug logs
- ✅ `BUILD_SUCCESSFUL.md` - This file

## Status

🎉 **FIXED** - Multi-Graph should now display correctly!
