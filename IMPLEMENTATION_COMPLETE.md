# Multi-Graph Implementation - Complete ✅

## สรุปการแก้ไข

ได้เสร็จสิ้นการเพิ่ม Multi-Graph Mode ให้กับ Grafana Plotly Panel โดยรักษาความเข้ากันได้ทั้งหมด

## ไฟล์ที่แก้ไข/สร้างใหม่

### Core Files
1. **src/types.ts** ✅
   - เพิ่ม `gridCols: number` - จำนวน columns ในแต่ละแถว
   - เพิ่ม `graphs: GraphConfig[]` - array ของกราฟ
   - เพิ่ม `GraphConfig` interface - กำหนดลักษณะแต่ละกราฟ

2. **src/module.ts** ✅
   - เพิ่ม Grid Columns option (min: 1, max: 6)
   - อัปเดต Processing Script description

3. **src/SimplePanel.tsx** ✅
   - เพิ่ม logic ตรวจสอบ multi-graph mode
   - รักษา single-graph mode (backward compatible)
   - รองรับ per-graph scripts

4. **src/MultiGraphPanel.tsx** ✅ (ไฟล์ใหม่)
   - Component สำหรับ render หลาย graphs
   - CSS Grid Layout ที่ responsive
   - Event handling per-graph

5. **src/dataUtils.ts** ✅
   - เพิ่ม `formatGraphValues()` helper function

### Configuration
6. **tsconfig.json** ✅
   - เพิ่ม JSX support (jsx: "react")

### Documentation
7. **MULTI_GRAPH_QUICK_START.md** ✅
   - คู่มือเริ่มต้นด่วน
   - ตัวอย่าง code ทั่วไป

8. **MULTI_GRAPH_GUIDE.md** ✅
   - เอกสารรายละเอียดครบถ้วน
   - API reference
   - Troubleshooting

9. **MULTI_GRAPH_CONFIG_EXAMPLE.yaml** ✅
   - ตัวอย่าง YAML configuration

## วิธีการใช้งาน

### Mode 1: Single Graph (ค่าเริ่มต้น)
ใช้เหมือนเดิม ไม่มีการเปลี่ยนแปลง

```javascript
// Processing Script
return {
  data: [...],
  layout: {...}
}
```

### Mode 2: Multi-Graph
ตั้ง Grid Columns แล้วใช้ Processing Script:

```javascript
// Processing Script
const graphs = [];
data.series.forEach((series, index) => {
  graphs.push({
    id: `graph-${index}`,
    title: series.name,
    data: [{
      x: series.fields[0].values,
      y: series.fields[1].values,
      type: 'scatter',
      mode: 'lines'
    }],
    layout: { title: { text: series.name } },
    config: {},
    frames: []
  });
});

return { graphs };
```

## Features

✅ Display multiple graphs in a grid (1-6 columns)
✅ Each graph can be customized independently
✅ Per-graph processing scripts
✅ Per-graph event handlers
✅ Responsive grid layout
✅ Time synchronization support
✅ Export functionality
✅ Backward compatible with single-graph mode
✅ No JSON config needed - uses JavaScript Processing Script

## Installation & Build

```bash
# Install dependencies
npm install
# or
yarn install

# Build the plugin
npm run build
# or
yarn build

# For development
npm run dev
# or
yarn dev
```

## Next Steps

1. Install dependencies: `npm install` หรือ `yarn install`
2. Build the project: `npm run build` หรือ `yarn build`
3. Read the documentation:
   - `MULTI_GRAPH_QUICK_START.md` - เริ่มต้นด่วน
   - `MULTI_GRAPH_GUIDE.md` - เอกสารเต็ม

## Testing

ตัวอย่างการทดสอบ:

1. ใน Panel Options ตั้ง **Grid Columns** เป็น 2
2. ไปที่ **Processing Script** (ข้างใต้ Script Editor category)
3. Copy code ตัวอย่างจาก MULTI_GRAPH_QUICK_START.md
4. Panel จะแสดงหลาย graphs ในกริด 2 columns

## คำเตือน

- ถ้า graphs array ว่างหรือ property `graphs` ไม่มี → ใช้ single-graph mode เหมือนเดิม
- แต่ละ graph ต้องมี `id`, `title`, และ `data` อย่างน้อย
- ตัวแปร `gridCols` ต้องเป็นค่า 1-6
- Per-graph scripts จะรัน หลังจาก main Processing Script

## Known Limitations

- Grid columns (gridCols) ถูก limit ที่ 1-6 เพื่อประสิทธิภาพ
- ถ้ามี graphs จำนวนมากอาจส่งผลต่อ performance

## Support

หากมีปัญหา:
1. ตรวจสอบ browser console สำหรับ error messages
2. ยืนยันว่า graphs array มี objects ที่ valid
3. ตรวจสอบว่า gridCols อยู่ในช่วง 1-6
