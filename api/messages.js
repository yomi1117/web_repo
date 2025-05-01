const { MongoClient } = require('mongodb');

// MongoDB 连接字符串
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// 处理 GET 请求 - 获取所有留言
async function getMessages(req, res) {
    // 添加 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        console.log('正在连接数据库...');
        await client.connect();
        console.log('数据库连接成功');
        
        const database = client.db('messageboard');
        const messages = database.collection('messages');
        
        console.log('正在获取留言...');
        const allMessages = await messages.find({}).sort({ createdAt: -1 }).toArray();
        console.log(`成功获取 ${allMessages.length} 条留言`);
        
        res.status(200).json(allMessages);
    } catch (error) {
        console.error('获取留言失败:', error);
        res.status(500).json({ error: '获取留言失败', details: error.message });
    } finally {
        await client.close();
    }
}

// 处理 POST 请求 - 添加新留言
async function addMessage(req, res) {
    // 添加 CORS 头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        console.log('收到新留言请求:', req.body);
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            console.log('缺少必填字段');
            return res.status(400).json({ error: '请填写所有必填字段' });
        }

        console.log('正在连接数据库...');
        await client.connect();
        console.log('数据库连接成功');
        
        const database = client.db('messageboard');
        const messages = database.collection('messages');
        
        console.log('正在保存留言...');
        const result = await messages.insertOne({
            name,
            email,
            message,
            createdAt: new Date()
        });
        console.log('留言保存成功:', result);

        res.status(201).json({ success: true, id: result.insertedId });
    } catch (error) {
        console.error('添加留言失败:', error);
        res.status(500).json({ error: '添加留言失败', details: error.message });
    } finally {
        await client.close();
    }
}

// 处理 OPTIONS 请求
async function handleOptions(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
}

// 根据请求方法处理不同的操作
export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return handleOptions(req, res);
    } else if (req.method === 'GET') {
        return getMessages(req, res);
    } else if (req.method === 'POST') {
        return addMessage(req, res);
    } else {
        res.status(405).json({ error: '方法不允许' });
    }
} 