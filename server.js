require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// TELEGRAM BOT AYARLARI
const token = process.env.BOT_TOKEN;
const adminChatId = process.env.ADMIN_CHAT_ID;

let bot;
if (token && token !== 'sizin_bot_tokeniniz_bura_yazilacaq') {
    bot = new TelegramBot(token, { polling: false });
    // DİQQƏT: Render üçün polling:false etdik ki, xəta verməsin. 
    // Əgər lokal kompüterdəsinizsə və botun cavab verməsini istəyirsinizsə, polling: true edə bilərsiniz.
} else {
    console.warn("⚠️ Telegram BOT_TOKEN tapılmadı.");
}

// --- MƏLUMAT BAZASI (db.json) ---
const dbPath = path.join(__dirname, 'db.json');

if (!fs.existsSync(dbPath)) {
    const defaultData = {
        stats: { partners: 24, pendingOrders: 8, totalExpenses: 0 },
        expensesList: [],
        chatHistory: { "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] }
    };
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
}

function readDB() {
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    if (!db.chatHistory) {
        db.chatHistory = { "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] };
        writeDB(db);
    }
    return db;
}

function writeDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// API Endpoints
app.get('/api/stats', (req, res) => res.json(readDB().stats));
app.get('/api/expenses', (req, res) => res.json(readDB().expensesList || []));
app.get('/api/chats', (req, res) => res.json(readDB().chatHistory)); // Yeni: Yazışmaları gətir

// Xərc əlavə et
app.post('/api/expense', (req, res) => {
    const { amount, description, date } = req.body;
    const db = readDB();
    if (!db.expensesList) db.expensesList = [];

    let finalDate = new Date().toLocaleString('az-AZ'); 
    if (date && !isNaN(new Date(date))) finalDate = new Date(date).toLocaleString('az-AZ');

    const newExpense = { id: Date.now(), description, amount: parseFloat(amount), date: finalDate };
    db.expensesList.push(newExpense);
    db.stats.totalExpenses += parseFloat(amount);
    
    writeDB(db);
    res.json({ success: true, totalExpenses: db.stats.totalExpenses, newExpense });
});

// Xərc sil
app.delete('/api/expense/:id', (req, res) => {
    const db = readDB();
    const expenseToDelete = db.expensesList.find(exp => exp.id === parseInt(req.params.id));
    if (expenseToDelete) {
        db.stats.totalExpenses = Math.max(0, db.stats.totalExpenses - expenseToDelete.amount);
        db.expensesList = db.expensesList.filter(exp => exp.id !== parseInt(req.params.id));
        writeDB(db);
        res.json({ success: true, totalExpenses: db.stats.totalExpenses });
    } else {
        res.status(404).json({ success: false });
    }
});

// Qlobal dəyişən: Adminin kimə cavab verəcəyini bilmək üçün ən son yazan partnyoru yadda saxlayır
let lastActivePartnerId = null;

// WEBSOCKET: Canlı Yazışma İdarəetməsi
io.on('connection', (socket) => {
    socket.on('send-message', (data) => {
        lastActivePartnerId = data.partnerId; // Ən sonuncu partnyoru qeyd et
        
        const db = readDB();
        if(!db.chatHistory[data.partnerId]) db.chatHistory[data.partnerId] = [];
        
        const newMsg = { type: 'sent', text: data.text };
        db.chatHistory[data.partnerId].push(newMsg);
        writeDB(db);

        // Mesajı saytdakı *digər bütün ziyarətçilərə* canlı göndər
        socket.broadcast.emit('update-chat', { partnerId: data.partnerId, msg: newMsg });

        // Telegram-a göndər
        if (bot && adminChatId) {
            bot.sendMessage(adminChatId, `👤 *Kiminlə:* ${data.partnerName}\n💬 *Mesaj:* ${data.text}`, { parse_mode: 'Markdown' })
               .catch(err => console.error(err.message));
        }
    });
});

// TELEGRAM: Telegram-dan sayta cavab gəldikdə
if (bot) {
    bot.on('message', (msg) => {
        if (msg.chat.id.toString() === adminChatId && msg.text && lastActivePartnerId) {
            const db = readDB();
            const replyMsg = { type: 'received', text: msg.text };
            
            db.chatHistory[lastActivePartnerId].push(replyMsg);
            writeDB(db);

            // Saytdakı *hər kəsə* canlı olaraq Adminin cavabını göstər
            io.emit('update-chat', { partnerId: lastActivePartnerId, msg: replyMsg });
        }
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server aktivdir: http://localhost:${PORT}`));
