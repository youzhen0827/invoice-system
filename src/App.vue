<template>
  <div id="app">
    <!-- 導航列 -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link class="navbar-brand" to="/">
          <i class="bi bi-receipt me-2"></i>發票管理系統
        </router-link>
        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/">
                <i class="bi bi-house-door me-1"></i>首頁
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/invoices">
                <i class="bi bi-list-ul me-1"></i>發票管理
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/reports">
                <i class="bi bi-bar-chart me-1"></i>統計報表
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- 主要內容區 -->
    <main class="main-content">
      <div class="container my-4">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- 頁尾 -->
    <footer class="footer bg-light text-center py-3 mt-auto">
      <div class="container">
        <p class="text-muted mb-0">
          <i class="bi bi-code-slash me-1"></i>
          © 發票管理系統 | 網際網路程式設計期末專案
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* 全域樣式重設 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 讓頁面至少填滿整個視窗 */
html, body {
  height: 100%;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 主要內容區自動撐開 */
.main-content {
  flex: 1;
}

/* 導航列樣式 */
.navbar {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-brand {
  font-weight: bold;
  font-size: 1.3rem;
  transition: transform 0.3s ease;
}

.navbar-brand:hover {
  transform: scale(1.05);
}

.nav-link {
  transition: all 0.3s ease;
  border-radius: 5px;
  margin: 0 5px;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 當前活動頁面的連結樣式 */
.router-link-active {
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.2);
}

/* 頁尾樣式 */
.footer {
  border-top: 1px solid #dee2e6;
  margin-top: 3rem;
}

.footer p {
  font-size: 0.9rem;
}

/* 頁面切換動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}


/* 平滑滾動 */
html {
  scroll-behavior: smooth;
}

/* 自訂捲軸樣式 */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 改善按鈕焦點樣式 */
.btn:focus,
.form-control:focus,
.form-select:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* 卡片通用樣式 */
.card {
  border-radius: 10px;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>