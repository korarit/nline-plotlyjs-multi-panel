// 🧪 TEST SCRIPT - ตรวจสอบว่า script ส่งคืนข้อมูล graphs ได้หรือไม่

const panel = arguments[0];
const seriesList = panel.series;

console.log("=== TEST SCRIPT START ===");
console.log("seriesList length:", seriesList.length);

// Simple test: create minimal graph
const graphs = [];

// Test graph 1
graphs.push({
  id: "test-graph-1",
  title: "Test Graph 1",
  data: [
    {
      x: [1, 2, 3, 4, 5],
      y: [10, 20, 30, 40, 50],
      type: "scatter",
      mode: "lines",
      name: "Test Trace 1"
    }
  ],
  layout: {
    title: "Test Graph 1",
    xaxis: { title: "X Axis" },
    yaxis: { title: "Y Axis" }
  },
  config: {},
  frames: []
});

// Test graph 2
graphs.push({
  id: "test-graph-2",
  title: "Test Graph 2",
  data: [
    {
      x: [1, 2, 3, 4, 5],
      y: [50, 40, 30, 20, 10],
      type: "scatter",
      mode: "markers",
      name: "Test Trace 2"
    }
  ],
  layout: {
    title: "Test Graph 2",
    xaxis: { title: "X Axis" },
    yaxis: { title: "Y Axis" }
  },
  config: {},
  frames: []
});

console.log("graphs array created:", graphs);
console.log("graphs length:", graphs.length);
console.log("returning { graphs }");

return { graphs };
