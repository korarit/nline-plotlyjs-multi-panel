// 🔍 DEBUG: ตรวจสอบข้อมูลที่ได้รับจาก panel

const panel = arguments[0];
const seriesList = panel.series;

console.log("=== PANEL DATA DEBUG ===");
console.log("panel object:", panel);
console.log("series length:", seriesList?.length);
console.log("series:", seriesList);

if (!seriesList || seriesList.length === 0) {
  console.error("❌ No series data available!");
  return { graphs: [] };
}

// ตรวจสอบแต่ละ series
seriesList.forEach((s, idx) => {
  console.log(`\n--- Series ${idx} ---`);
  console.log("fields:", s.fields);
  console.log("fields length:", s.fields?.length);
  
  if (s.fields) {
    s.fields.forEach((f, fIdx) => {
      console.log(`  Field ${fIdx}: name="${f.name}", labels=`, f.labels);
    });
  }
});

console.log("\n=== END DEBUG ===");

// Return empty to prevent error
return { graphs: [] };
