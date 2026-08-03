require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

// TelegramBot-u düzgün yüklə
let TelegramBot;
try {
    const telegramModule = require('node-telegram-bot-api');
    TelegramBot = telegramModule.TelegramBot || telegramModule;
} catch (err) {
    console.error("❌ node-telegram-bot-api paketi yüklənə bilmədi:", err.message);
    TelegramBot = null;
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());

// ====================== STATİK FAYLLAR ======================
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// TELEGRAM BOT AYARLARI
const token = process.env.BOT_TOKEN;
const adminChatId = process.env.ADMIN_CHAT_ID;
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || process.env.RENDER_URL;

let bot = null;

if (token && token !== 'sizin_bot_tokeniniz_bura_yazilacaq' && typeof TelegramBot === 'function') {
    try {
        // Webhook rejimi
        bot = new TelegramBot(token, { polling: false });

        // Webhook-u qur
        if (RENDER_URL) {
            const webhookUrl = `${RENDER_URL}/bot${token}`;
            bot.setWebHook(webhookUrl)
                .then(() => {
                    console.log("✅ Webhook uğurla quruldu:", webhookUrl);
                })
                .catch(err => {
                    console.error("❌ Webhook qurularkən xəta:", err.message);
                });
        } else {
            console.warn("⚠️ RENDER_EXTERNAL_URL tapılmadı. Webhook qurulmadı.");
        }

        console.log("✅ Telegram bot Webhook rejimində aktivdir");
    } catch (err) {
        console.error("❌ Bot yaradıla bilmədi:", err.message);
        bot = null;
    }
} else {
    console.warn("⚠️ Telegram BOT_TOKEN tapılmadı və ya paket düzgün yüklənmədi.");
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

// ====================== API Endpoints ======================
app.get('/api/stats', (req, res) => res.json(readDB().stats));
app.get('/api/expenses', (req, res) => res.json(readDB().expensesList || []));
app.get('/api/chats', (req, res) => res.json(readDB().chatHistory));

// Xərc əlavə et
app.post('/api/expense', (req, res) => {
    const { amount, description, date } = req.body;
    const db = readDB();
    if (!db.expensesList) db.expensesList = [];

    let finalDate = new Date().toLocaleString('az-AZ');
    if (date && !isNaN(new Date(date))) {
        finalDate = new Date(date).toLocaleString('az-AZ');
    }

    const newExpense = {
        id: Date.now(),
        description,
        amount: parseFloat(amount),
        date: finalDate
    };

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

// ====================== WEBHOOK ENDPOINT ======================
app.post(`/bot${token}`, (req, res) => {
    if (bot) {
        bot.processUpdate(req.body);
    }
    res.sendStatus(200);
});

// ====================== WEBSOCKET + TELEGRAM ======================
let lastActivePartnerId = null;

io.on('connection', (socket) => {
    socket.on('send-message', (data) => {
        if (!data.partnerId || !data.text) return;

        lastActivePartnerId = String(data.partnerId);

        const db = readDB();
        if (!db.chatHistory[data.partnerId]) {
            db.chatHistory[data.partnerId] = [];
        }

        const newMsg = { type: 'sent', text: data.text };
        db.chatHistory[data.partnerId].push(newMsg);
        writeDB(db);

        socket.broadcast.emit('update-chat', {
            partnerId: data.partnerId,
            msg: newMsg
        });

        // Telegram-a göndər
        if (bot && adminChatId) {
            bot.sendMessage(
                adminChatId,
                `👤 *Kiminlə:* ${data.partnerName || 'Naməlum'}\n🆔 Partner ID: ${data.partnerId}\n💬 *Mesaj:* ${data.text}`,
                { parse_mode: 'Markdown' }
            ).catch(err => console.error("Telegram göndərmə xətası:", err.message));
        }
    });
});

// Telegram-dan gələn cavablar
if (bot) {
    bot.on('message', (msg) => {
        console.log("📩 Telegram-dan mesaj gəldi:", {
            chatId: msg.chat.id,
            text: msg.text,
            lastActivePartnerId
        });

        if (String(msg.chat.id) !== String(adminChatId)) {
            console.log("❌ Bu mesaj admin chat-dən deyil");
            return;
        }

        if (!msg.text) return;

        if (!lastActivePartnerId) {
            console.log("❌ lastActivePartnerId boşdur. Əvvəlcə saytdan mesaj yazın.");
            return;
        }

        const db = readDB();

        if (!db.chatHistory[lastActivePartnerId]) {
            db.chatHistory[lastActivePartnerId] = [];
        }

        const replyMsg = { type: 'received', text: msg.text };
        db.chatHistory[lastActivePartnerId].push(replyMsg);
        writeDB(db);

        console.log("✅ Cavab sayta göndərildi → Partner:", lastActivePartnerId);

        io.emit('update-chat', {
            partnerId: lastActivePartnerId,
            msg: replyMsg
        });
    });
}

// ====================== 404 və HTML fallback ======================
app.get('*', (req, res) => {
    if (req.path.endsWith('.html')) {
        const filePath = path.join(__dirname, req.path);
        if (fs.existsSync(filePath)) {
            return res.sendFile(filePath);
        }
    }
    res.status(404).send('Səhifə tapılmadı');
});

// ====================== SERVER START ======================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server aktivdir: http://localhost:${PORT}`);
});
