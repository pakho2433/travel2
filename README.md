# Travel Globe｜我的旅行地球儀

一個可在手機瀏覽器直接使用及安裝到主畫面的 3D 旅行記錄 PWA。

## 手機直接開啟

GitHub Pages 部署完成後：

**https://pakho2433.github.io/travel2/**

### iPhone 加到主畫面

1. 使用 Safari 打開上面的網址。
2. 按 Safari 底部的「分享」按鈕。
3. 選擇「加入主畫面」。
4. 按「新增」。
5. 之後可像一般 App 一樣從主畫面開啟。

## 功能

- 可旋轉及縮放的互動式 3D 地球
- 顯示香港、東京、台北示例圖釘
- 新增、查看及刪除旅行地點
- 統計去過的地方及國家／地區數量
- IndexedDB 本機自動儲存
- localStorage 後備儲存
- JSON 匯出及匯入備份
- Service Worker 離線快取
- 支援 iPhone 安全區及直向手機版面
- GitHub Actions 自動部署至 GitHub Pages

## 資料保存說明

旅行資料只保存在目前裝置及瀏覽器內，不會上載至伺服器。重新整理、關閉 Safari 或重新打開 PWA 後，資料仍會保留。

為免因清除 Safari 網站資料或移除 App 而失去紀錄，建議定期使用「匯出備份」保存 JSON 檔案。

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

每次 push 到 `main`，`.github/workflows/deploy-pages.yml` 會：

1. 安裝 Node.js 依賴
2. 執行 `npm run build`
3. 上載 `dist` artifact
4. 部署到 GitHub Pages

如首次部署仍未開始，可到 repository 的 **Actions** 頁面，選擇 `Deploy Travel Globe to GitHub Pages`，再按 `Run workflow`。
