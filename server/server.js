import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data', 'invoices.json');

// 中間件
app.use(cors());
app.use(express.json());

// 確保 data 資料夾存在
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// 初始化資料檔案
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ invoices: [] }, null, 2));
}

// 讀取資料
const readData = () => {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
};

// 寫入資料
const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// 取得所有發票
app.get('/api/invoices', (req, res) => {
  try {
    const data = readData();
    res.json(data.invoices);
  } catch (error) {
    res.status(500).json({ error: '讀取資料失敗' });
  }
});

// 取得單一發票
app.get('/api/invoices/:id', (req, res) => {
  try {
    const data = readData();
    const invoice = data.invoices.find(inv => inv.id === req.params.id);
    
    if (invoice) {
      res.json(invoice);
    } else {
      res.status(404).json({ error: '找不到發票' });
    }
  } catch (error) {
    res.status(500).json({ error: '讀取資料失敗' });
  }
});

// 新增發票
app.post('/api/invoices', (req, res) => {
  try {
    const data = readData();
    const newInvoice = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    data.invoices.push(newInvoice);
    writeData(data);
    
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(500).json({ error: '新增發票失敗' });
  }
});

// 更新發票
app.put('/api/invoices/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.invoices.findIndex(inv => inv.id === req.params.id);
    
    if (index !== -1) {
      data.invoices[index] = {
        ...data.invoices[index],
        ...req.body,
        id: req.params.id,
        updatedAt: new Date().toISOString()
      };
      writeData(data);
      res.json(data.invoices[index]);
    } else {
      res.status(404).json({ error: '找不到發票' });
    }
  } catch (error) {
    res.status(500).json({ error: '更新發票失敗' });
  }
});

// 刪除發票
app.delete('/api/invoices/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.invoices.findIndex(inv => inv.id === req.params.id);
    
    if (index !== -1) {
      data.invoices.splice(index, 1);
      writeData(data);
      res.json({ message: '刪除成功' });
    } else {
      res.status(404).json({ error: '找不到發票' });
    }
  } catch (error) {
    res.status(500).json({ error: '刪除發票失敗' });
  }
});

// 對獎功能
app.post('/api/check-lottery', (req, res) => {
  try {
    const w = req.body; // { special, grand, first:[], sixth:[] }
    const data = readData();
    const invoices = data.invoices;

    const winners = [];

    // 工具：把輸入清乾淨，只留數字
    const onlyDigits = (s) => (s ?? '').toString().replace(/\D/g, '');

    const special = onlyDigits(w.special); // 8
    const grand = onlyDigits(w.grand);     // 8
    const firstList = Array.isArray(w.first) ? w.first.map(onlyDigits).filter(x => x.length === 8) : [];
    const extraSixth = Array.isArray(w.sixth) ? w.sixth.map(onlyDigits).filter(x => x.length === 3) : [];

    // 比對：回傳獎別字串或 null
    const matchPrize = (invoiceNumber) => {
      const num = onlyDigits(invoiceNumber);     // 可能是 AB12345678 / 12345678
      const last8 = num.slice(-8);
      if (last8.length !== 8) return null;

      // 1) 特別獎 / 特獎
      if (special && last8 === special) return '特別獎';
      if (grand && last8 === grand) return '特獎';

      // 2) 頭獎~六獎：用頭獎號碼比「末8~末3」
      //    命中就回傳，並且停止（避免被後面的覆蓋）
      for (const f of firstList) {
        if (last8 === f) return '頭獎';
        if (last8.slice(1) === f.slice(1)) return '二獎'; // 末7碼相同
        if (last8.slice(2) === f.slice(2)) return '三獎'; // 末6碼相同
        if (last8.slice(3) === f.slice(3)) return '四獎'; // 末5碼相同
        if (last8.slice(4) === f.slice(4)) return '五獎'; // 末4碼相同
        if (last8.slice(5) === f.slice(5)) return '六獎'; // 末3碼相同
      }

      // 3) 增開六獎：只比末3碼
      const last3 = last8.slice(-3);
      if (extraSixth.includes(last3)) return '增開六獎';

      return null;
    };

    // 每次對獎先清掉舊狀態，避免一直累積
    for (const inv of invoices) {
      const prize = matchPrize(inv.number);
      inv.isWinning = !!prize;
      inv.prize = prize || null;

      if (prize) winners.push(inv);
    }

    writeData({ invoices });
    res.json({ winners, total: winners.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '對獎失敗' });
  }
});



// 統計資料
app.get('/api/invoices/stats/summary', (req, res) => {
  try {
    const data = readData();
    const invoices = data.invoices;
    
    // 總金額
    const totalAmount = invoices.reduce((sum, inv) => sum + (parseFloat(inv.amount) || 0), 0);
    
    // 按分類統計
    const categoryStats = {};
    invoices.forEach(inv => {
      const category = inv.category || '未分類';
      if (!categoryStats[category]) {
        categoryStats[category] = { count: 0, amount: 0 };
      }
      categoryStats[category].count++;
      categoryStats[category].amount += parseFloat(inv.amount) || 0;
    });
    
    // 按月份統計
    const monthStats = {};
    invoices.forEach(inv => {
      if (inv.date) {
        const month = inv.date.substring(0, 7); // YYYY-MM
        if (!monthStats[month]) {
          monthStats[month] = { count: 0, amount: 0 };
        }
        monthStats[month].count++;
        monthStats[month].amount += parseFloat(inv.amount) || 0;
      }
    });
    
    res.json({
      total: invoices.length,
      totalAmount: Math.round(totalAmount),
      winningCount: invoices.filter(inv => inv.isWinning).length,
      categoryStats,
      monthStats
    });
  } catch (error) {
    res.status(500).json({ error: '統計失敗' });
  }
});

// 根路徑
app.get('/api/statistics', (req, res) => {
    const receipts = readData();
    const stats = {
        total: receipts.length,
        totalAmount: receipts.reduce((sum, r) => sum + Number(r.amount), 0),
        winningCount: receipts.filter(r => r.isWinning).length,
        monthStats: {} // 這裡可以簡單寫
    };
    res.json(stats);
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 伺服器運行於 http://localhost:${PORT}`);
  console.log(`📊 資料儲存於 ${DATA_FILE}`);
});
