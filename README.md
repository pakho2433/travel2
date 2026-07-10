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

- Google 官方 3D 衛星地球模式
- Google 3D 建築、地形及衛星影像
- 無 Google API 金鑰時自動使用標準 3D 地球後備模式
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

## 啟用 Google 官方 3D 地球

Google 3D Maps 需要 Google Maps Platform API 金鑰，不能把 Google Earth 的模型檔直接複製到 repository。

### 方法一：在 App 內設定

1. 打開 Travel Globe。
2. 在地球左上角按 `Google 3D`。
3. 按齒輪按鈕。
4. 貼上 Google Maps JavaScript API 金鑰。
5. 金鑰只會儲存在目前瀏覽器的 localStorage。

### 方法二：使用 GitHub Actions Secret

1. 在 Google Cloud 建立專案及 API 金鑰。
2. 啟用 **Maps JavaScript API**，並確認可使用 **3D Maps**。
3. 在 GitHub repository 開啟：
   `Settings → Secrets and variables → Actions → New repository secret`
4. Secret 名稱填：
   `GOOGLE_MAPS_API_KEY`
5. Secret 值貼上 Google API 金鑰。
6. 重新執行 `Deploy Travel Globe to GitHub Pages` workflow。

### API 金鑰安全設定

瀏覽器地圖金鑰會出現在前端程式中，因此必須在 Google Cloud 將 Application restrictions 設為 **Websites / HTTP referrers**，只允許：

```text
https://pakho2433.github.io/travel2/*
```

API restrictions 應只允許此 App 所需的 Maps JavaScript API／3D Maps 服務。不要使用沒有網域限制的金鑰。

## 資料保存說明

旅行資料只保存在目前裝置及瀏覽器內，不會上載至伺服器。重新整理、關閉 Safari 或重新打開 PWA 後，資料仍會保留。

為免因清除 Safari 網站資料或移除 App 而失去紀錄，建議定期使用「匯出備份」保存 JSON 檔案。

Google 地圖影像需要網絡連線；旅行記錄及標準後備地球仍可使用本機儲存。

## 本機開發

```bash
npm install
npm run dev
```

如要在本機以環境變數載入 Google 3D 地球，可建立 `.env.local`：

```text
VITE_GOOGLE_MAPS_API_KEY=你的GoogleMapsAPIKey
```

Production build：

```bash
npm run build
npm run preview
```

## 自動部署

每次 push 到 `main`，`.github/workflows/deploy-pages.yml` 會：

1. 安裝 Node.js 依賴
2. 讀取可選的 `GOOGLE_MAPS_API_KEY` GitHub Secret
3. 執行 `npm run build`
4. 上載 `dist` artifact
5. 部署到 GitHub Pages

如首次部署仍未開始，可到 repository 的 **Actions** 頁面，選擇 `Deploy Travel Globe to GitHub Pages`，再按 `Run workflow`。
