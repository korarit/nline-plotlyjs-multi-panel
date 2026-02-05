# 🔍 Console Debug Guide - ขั้นตอนตรวจสอบ

## Script ส่ง graphs ได้ ✅

```
=== TEST SCRIPT START ===
seriesList length: 8
graphs array created: Array(2)
graphs length: 2
returning { graphs }
```

นี่หมายความว่า script ทำงานถูกต้อง

## ที่ต้องตรวจสอบต่อ

### 1️⃣ ดู SimplePanel logs

ใน browser console (F12) ค้นหา:

```
📋 evaluatedScript result: 
```

**ถ้าเห็น:**
```javascript
📋 evaluatedScript result: {graphs: Array(2)}
```
→ ✅ evaluatedScript ได้ graphs แล้ว

**ถ้าไม่เห็น:**
→ ❌ evaluatedScript ยังไม่ได้ graphs

### 2️⃣ ดู isMultiGraphMode

ค้นหา:
```
🔍 SimplePanel Debug:
```

ควรเห็น:
```javascript
🔍 SimplePanel Debug: {
  evaluatedScript: {graphs: Array(2)},
  hasGraphs: true,
  graphsLength: 2,
  isMultiGraphMode: true  ← ต้องเป็น true
}
```

**ถ้า isMultiGraphMode: false:**
→ ❌ ปัญหาอยู่ที่ detection logic

### 3️⃣ ดู MultiGraphCharts processing

ค้นหา:
```
📊 MultiGraphCharts processed:
```

ควรเห็น:
```javascript
📊 MultiGraphCharts processed: {
  count: 2,
  cols: 1,
  rows: 2,
  charts: [
    {id: "test-graph-1", title: "Test Graph 1", dataLength: 1, hasLayout: true},
    {id: "test-graph-2", title: "Test Graph 2", dataLength: 1, hasLayout: true}
  ]
}
```

**ถ้าไม่เห็น:**
→ ❌ multiGraphCharts ไม่ execute

### 4️⃣ ดู MultiGraphPanel rendering

ค้นหา:
```
🎨 Rendering MultiGraphPanel with:
```

ควรเห็น:
```javascript
🎨 Rendering MultiGraphPanel with: {
  multiGraphChartsLength: 2,
  gridCols: 1
}
```

**ถ้าไม่เห็น:**
→ ❌ isMultiGraphMode ยังเป็น false

## การหา Logs ใน Console

### วิธี 1: Scroll ขึ้นไป
```
Console แสดง logs ล่าสุดก่อน
Scroll ขึ้นไปหาคำว่า 📋, 🔍, 📊, 🎨
```

### วิธี 2: Filter
```
Click Filter icon ในคำว่า "SimplePanel"
จะแสดง log ที่มี SimplePanel เท่านั้น
```

### วิธี 3: Ctrl+F ใน Console
```
F12 → Console
Ctrl+F (or Cmd+F on Mac)
พิมพ์: 📋
กด Enter เพื่อค้นหา
```

## ถ้าไม่เห็น SimplePanel logs

**อาจเป็นเพราะ:**

1. **Panel ยังใช้เวอร์ชันเก่า**
   ```bash
   # Restart Grafana
   sudo systemctl restart grafana-server
   
   # Clear browser cache
   Ctrl+Shift+Delete
   
   # Reload page
   F5
   ```

2. **dist/ folder ไม่ได้อัปเดต**
   ```bash
   # Verify build
   ls -la dist/module.js
   
   # Check timestamp
   stat dist/module.js | grep Modify
   ```

3. **Grafana cache**
   ```bash
   # Clear Grafana cache
   sudo rm -rf /var/lib/grafana/plugin-cache
   sudo systemctl restart grafana-server
   ```

## Error Cases

### ❌ Case 1: evaluatedScript is null

**Log:**
```
📋 evaluatedScript result: null
```

**สาเหตุ:**
- Script ไม่ return ข้อมูล
- Script มี error

**วิธีแก้:**
```javascript
// ตรวจสอบ return statement
return { graphs };  // ← ต้องมี return

// ตรวจสอบ syntax error
console.log("before return");
return { graphs };
```

### ❌ Case 2: isMultiGraphMode = false

**Log:**
```
🔍 SimplePanel Debug: {
  hasGraphs: false,  ← ต้องเป็น true
  isMultiGraphMode: false
}
```

**สาเหตุ:**
- evaluatedScript.graphs ไม่มี
- graphs array เป็น empty

**วิธีแก้:**
```javascript
// ตรวจสอบ return format
return { graphs: [...] };  // ← ต้องมี graphs property

// ตรวจสอบ graphs ไม่ว่าง
console.log("graphs length:", graphs.length);
if (graphs.length > 0) {
  return { graphs };
}
```

### ❌ Case 3: multiGraphCharts ไม่ execute

**สาเหตุ:**
- isMultiGraphMode = false
- multiGraphCharts dependency array มีปัญหา

**วิธีแก้:**
ดู case 2

### ❌ Case 4: multiGraphChartsLength = 0

**Log:**
```
📊 MultiGraphCharts processed: {
  count: 0  ← ต้องเป็น 2
}
```

**สาเหตุ:**
- evaluatedScript.graphs ว่าง
- map() ส่งคืน empty array

**วิธีแก้:**
```javascript
// ตรวจสอบ data ในแต่ละ graph
graphs[0].data;  // ← ต้องเป็น array กับ traces
```

## Summary

| Log | Status | Meaning |
|-----|--------|---------|
| `=== TEST SCRIPT START ===` | ✅ | Script execute |
| `graphs length: 2` | ✅ | graphs array created |
| `📋 evaluatedScript result: {graphs: Array(2)}` | ✅ | SimplePanel got graphs |
| `🔍 ... isMultiGraphMode: true` | ✅ | Multi-graph mode activated |
| `📊 MultiGraphCharts processed: {count: 2}` | ✅ | Charts processed |
| `🎨 Rendering MultiGraphPanel with: {multiGraphChartsLength: 2}` | ✅ | Rendering multi-graph |
| **Graphs displayed** | ✅ | **Success!** |

## ขั้นตอนถัดไป

ให้ตรวจสอบ console logs แล้วบอกว่า:
1. เห็น logs อะไรบ้าง
2. logs ไหนหายไป
3. เห็นหรือไม่เห็น graphs บน panel
