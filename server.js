const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3000;

// 启用 CORS 和 JSON 解析
app.use(cors());
app.use(express.json());

// 创建数据库连接
const db = new sqlite3.Database('messages.db', (err) => {
    if (err) {
        console.error('数据库连接失败:', err);
    } else {
        console.log('已连接到数据库');
        // 创建消息表
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// 处理留言提交
app.post('/api/messages', (req, res) => {
    const { name, email, message } = req.body;
    
    db.run(
        'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)',
        [name, email, message],
        function(err) {
            if (err) {
                console.error('保存消息失败:', err);
                res.status(500).json({ error: '保存消息失败' });
            } else {
                console.log('新消息已保存:', { name, email, message });
                res.json({ success: true, id: this.lastID });
            }
        }
    );
});

// 获取所有留言
app.get('/api/messages', (req, res) => {
    db.all('SELECT * FROM messages ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: '获取消息失败' });
        } else {
            res.json(rows);
        }
    });
});

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
}); 