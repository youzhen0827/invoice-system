# 發票管理系統

> 網際網路程式設計期末專案
> 使用 Vue + Bootstrap 5 + Node.js + Express 開發

## 📋 專案簡介

這是一個完整的發票管理系統，提供發票記錄、對獎、統計分析等功能，幫助使用者輕鬆管理消費發票。

### 1.網站功能

- **發票管理**：新增、編輯、刪除、查詢發票
- **自動對獎**：輸入開獎號碼，自動比對所有發票
- **統計分析**：視覺化圖表展示消費習慣
- **單頁式應用**：頁面切換不需重新整理


### 2.所使用的前端Framework

- **框架**：Vue
- **路由**：Vue Router
- **UI框架**：Bootstrap 5
- **圖表**：Chart.js
- **HTTP客戶端**：Axios
- **圖示**：Bootstrap Icons


### 3.網頁所使用的組件

- **頁面元件**
  > Home.vue: 系統首頁與統計摘要
  > Invoices.vue: 發票管理頁面
  > Reports.vue: 消費統計與圖表頁面

- **功能元件**
  > InvoiceCard.vue: 單張發票顯示元件
  > InvoiceForm.vue: 新增 / 編輯發票表單
  > LotteryCheck.vue: 發票對獎功能

- **共用模組**
  > api.js: 使用Axios封裝後端API
  > modal.js: 處理Bootstrap Modal關閉畫面清理


### 4.資料儲存方式

- **Server端**：Node.js ＋ Express
- **資料儲存格式**：JSON 檔案
- **前後端分離架構**：Axios呼叫API



---------------------------------------


## 專案啟動方式

### 1️⃣ 啟動後端 Server
node server/server.js

### 2️⃣ 啟動前端 
npm install
npm run dev