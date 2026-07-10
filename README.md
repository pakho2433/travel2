# Travel Globe｜我的旅行地球儀

一個可在手機瀏覽器直接使用及安裝到主畫面的 3D 旅行記錄 PWA。

## 手機直接開啟

**https://pakho2433.github.io/travel2/**

### iPhone 加到主畫面

1. 使用 Safari 打開上面的網址。
2. 按「分享」。
3. 選擇「加入主畫面」。
4. 按「新增」。

## 地球與地圖功能

- 不使用 Google API key
- MapLibre 開源 3D 地球
- OpenFreeMap／OpenStreetMap 城市、地點及街道名稱
- Mapterhorn 高程資料顯示山脈及地形凹凸
- 放大至城市後可傾斜觀看 3D 地形
- 放大至約 zoom 15 後顯示可用的 3D 建築
- 可旋轉、縮放、傾斜及回到全球畫面
- 旅行地點以發光圖釘顯示並可點擊

地圖資料需要網絡連線。旅行記錄仍會自動保存在裝置的 IndexedDB，並以 localStorage 作後備。

## 旅行記錄功能

- 新增、查看及刪除旅行地點
- 統計去過的地方及國家／地區數量
- JSON 匯出及匯入備份
- Service Worker PWA 快取
- 支援 iPhone 安全區及直向手機版面

## 資料來源與標示

- 地圖顯示：MapLibre GL JS
- 向量地圖：OpenFreeMap／OpenMapTiles
- 地圖資料：OpenStreetMap contributors
- 高程地形：Mapterhorn

App 會保留地圖供應者要求的 attribution。這個專案不包含、複製或重新分發 Google Earth 模型或 Google 衛星影像。

## 本機開發

```bash
npm install
npm run dev
```

Production build：

```bash
npm run build
npm run preview
```

## 自動部署

每次 push 到 `main`，GitHub Actions 會安裝依賴、執行 `npm run build`，並部署 `dist` 到 GitHub Pages。
