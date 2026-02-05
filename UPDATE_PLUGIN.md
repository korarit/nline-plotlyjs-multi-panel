# 📝 ขั้นตอนอัปเดต Plugin ใน Grafana

## สำหรับ Docker

```bash
# 1. Copy dist folder ไปยัง Grafana container
docker cp /home/korarit/Desktop/grafana-plotly-multi/dist \
  <grafana-container-id>:/var/lib/grafana/plugins/nline-plotlyjs-panel/

# 2. Restart Grafana container
docker restart <grafana-container-id>

# 3. Verify
docker logs <grafana-container-id> | grep -i plotly
```

## เพื่อหา container ID:

```bash
docker ps | grep grafana
# จะแสดง CONTAINER ID (ตัวแรก)
```

## หลังจาก Restart:

1. **Clear browser cache:**
   ```
   Ctrl+Shift+Delete (Windows/Linux)
   Cmd+Shift+Delete (Mac)
   ```

2. **Reload Grafana dashboard:**
   ```
   F5
   ```

3. **Open browser console (F12)**

4. **Check logs:**
   - ควรเห็น `=== TEST SCRIPT START ===`
   - ควรเห็น `📋 evaluatedScript result:`
   - ควรเห็น `🔍 SimplePanel Debug:`
   - ควรเห็น `📊 MultiGraphCharts processed:`
   - ควรเห็น `🎨 Rendering MultiGraphPanel with:`

## ถ้ายังไม่เห็น logs

ลอง force clear cache:

```bash
# Stop Grafana
docker stop <grafana-container-id>

# Remove plugin cache
docker exec <grafana-container-id> rm -rf /var/lib/grafana/plugin-cache

# Start Grafana
docker start <grafana-container-id>

# Restart (optional, more thorough)
docker restart <grafana-container-id>
```

## ตรวจสอบ dist folder อัปเดต:

```bash
# Check timestamp
stat /home/korarit/Desktop/grafana-plotly-multi/dist/module.js
```

ควรแสดง timestamp ล่าสุด (not old)
