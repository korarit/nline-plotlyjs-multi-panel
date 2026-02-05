# 🎯 Dynamic Column Configuration - Multi-Graph Guide

## ✨ New Features

### 1. Configure Column Count in Script
ตอนนี้สามารถระบุจำนวน columns ได้ใน script แทนการใช้ panel option

```javascript
return { 
  graphs,
  gridConfig: { cols: 3 }
};
```

### 2. Custom Column Widths (%)
กำหนดความกว้างของแต่ละ column เป็น percentage

```javascript
return { 
  graphs,
  gridConfig: { 
    cols: 3,
    widths: [50, 30, 20]  // [50%, 30%, 20%]
  }
};
```

### 3. Smart Auto-Distribution
ถ้าระบุแค่บางอัน ที่เหลือจะแบ่งเท่า ๆ กัน

```javascript
return { 
  graphs,
  gridConfig: { 
    cols: 3,
    widths: [70]  // → [70%, 15%, 15%]
  }
};
```

## 📋 gridConfig Object

```typescript
interface GridConfig {
  cols: number;        // จำนวน columns (1-6)
  widths?: number[];   // Array of percentages (optional)
}
```

### cols (Required)
- Type: `number`
- Range: `1-6`
- Default: `1`
- Description: จำนวน columns ต่อแถว

### widths (Optional)
- Type: `number[]`
- Description: ความกว้างของแต่ละ column เป็น percentage
- Behavior:
  - ถ้าไม่ระบุ → แบ่งเท่า ๆ กัน
  - ถ้าระบุบางส่วน → อันที่เหลือแบ่งเท่า ๆ กัน
  - ถ้าระบุทั้งหมด → ใช้ตามที่ระบุ

## 💡 Examples

### Example 1: 2 Columns Equal Width (50% / 50%)
```javascript
const graphs = [];
data.series.forEach((series, index) => {
  graphs.push({
    id: `graph-${index}`,
    title: series.name,
    data: [...],
    layout: {...},
    config: {},
    frames: []
  });
});

return { 
  graphs,
  gridConfig: { cols: 2 }  // Auto: [50%, 50%]
};
```

### Example 2: 3 Columns Custom Widths (70% / 15% / 15%)
```javascript
return { 
  graphs,
  gridConfig: { 
    cols: 3,
    widths: [70]  // First: 70%, rest auto: [70%, 15%, 15%]
  }
};
```

### Example 3: 3 Columns All Custom (50% / 30% / 20%)
```javascript
return { 
  graphs,
  gridConfig: { 
    cols: 3,
    widths: [50, 30, 20]  // Exact: [50%, 30%, 20%]
  }
};
```

### Example 4: 4 Columns Partial (25% / 25% / 25% / 25%)
```javascript
return { 
  graphs,
  gridConfig: { 
    cols: 4,
    widths: [40, 20]  // → [40%, 20%, 20%, 20%]
  }
};
```

## 🔄 Backward Compatibility

ยังสามารถใช้ `gridCols` panel option ได้ (fallback)

```javascript
// ถ้าไม่ส่ง gridConfig จะใช้ panel option
return { graphs };  // ใช้ options.gridCols
```

## ⚙️ Calculation Algorithm

```
Input: cols=3, widths=[70]

Step 1: Calculate specified width
- Specified: [70]
- Sum: 70%

Step 2: Calculate remaining width
- Remaining: 100 - 70 = 30%
- Remaining cols: 3 - 1 = 2

Step 3: Distribute remaining equally
- Per col: 30 / 2 = 15%

Result: [70%, 15%, 15%]
```

## 📊 Validation

Script จะ validate gridConfig:

```javascript
// ✅ Valid
{ cols: 2 }
{ cols: 3, widths: [50, 30, 20] }
{ cols: 3, widths: [70] }

// ❌ Invalid
{ cols: 0 }           // cols must be 1-6
{ cols: 7 }           // cols must be 1-6
{ cols: 3, widths: [-10] }  // widths must be positive
{ cols: 3, widths: "50%" }  // widths must be array
```

## 🎨 Real-World Example

### Monitoring Dashboard with Different Panel Sizes

```javascript
const graphs = [];

// Large graph (main metrics)
graphs.push({
  id: "main-metrics",
  title: "Main Metrics",
  data: [{
    x: timestamps,
    y: mainValues,
    type: "scatter",
    mode: "lines",
    name: "Main"
  }],
  layout: { title: "Main Metrics" },
  config: {},
  frames: []
});

// 2 smaller graphs (secondary metrics)
graphs.push({
  id: "secondary-1",
  title: "Secondary 1",
  data: [{
    x: timestamps,
    y: secondary1Values,
    type: "scatter",
    mode: "lines",
    name: "Sec1"
  }],
  layout: { title: "Secondary 1" },
  config: {},
  frames: []
});

graphs.push({
  id: "secondary-2",
  title: "Secondary 2",
  data: [{
    x: timestamps,
    y: secondary2Values,
    type: "scatter",
    mode: "lines",
    name: "Sec2"
  }],
  layout: { title: "Secondary 2" },
  config: {},
  frames: []
});

return { 
  graphs,
  gridConfig: { 
    cols: 2,
    widths: [70, 30]  // Main: 70%, Secondary: 30% each (left to right)
  }
};
```

Output:
```
┌────────────────────────────────┬──────────────┐
│                                │              │
│       Main Metrics (70%)        │ Secondary 1  │
│                                │ (30%)        │
├────────────────────────────────┼──────────────┤
│                                │              │
│       [Next row graphs]         │ Secondary 2  │
│                                │ (30%)        │
└────────────────────────────────┴──────────────┘
```

## ⚡ Performance Tips

1. **ส่ง gridConfig ใน script** มากกว่าใช้ panel option
2. **กำหนด widths อย่างชัดเจน** สำหรับ layout ที่แน่นอน
3. **ใช้ auto-distribution** เมื่อ columns เท่ากันหมด

## 🐛 Troubleshooting

### widths ไม่ทำงาน
```javascript
// ❌ Wrong - not in gridConfig
return { 
  graphs,
  widths: [70, 15, 15]  // This won't work!
};

// ✅ Correct
return { 
  graphs,
  gridConfig: { 
    cols: 3,
    widths: [70, 15, 15]
  }
};
```

### cols ไม่ตรงกับจำนวน graphs
```javascript
const graphs = [...];  // 4 graphs

return { 
  graphs,
  gridConfig: { 
    cols: 3  // Smaller cols OK - wraps to next row
  }
};
```

### widths ไม่รวมถึง 100%
```javascript
// ✅ OK - ผลรวมไม่ต้องเป็น 100
return { 
  graphs,
  gridConfig: { 
    cols: 3,
    widths: [40, 30, 20]  // 90% - OK!
  }
};

// ✅ OK - auto-distribution handles remainder
return { 
  graphs,
  gridConfig: { 
    cols: 3,
    widths: [70]  // 30% auto-distributed
  }
};
```

## 📚 References

- [types.ts](./types.ts) - GridConfig interface
- [dataUtils.ts](./dataUtils.ts) - calculateColumnWidths function
- [MultiGraphPanel.tsx](./MultiGraphPanel.tsx) - Grid rendering
- [SimplePanel.tsx](./SimplePanel.tsx) - gridConfig extraction
