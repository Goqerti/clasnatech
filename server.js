require('dotenv').config(); // .env faylından tokenləri oxumaq üçün
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { TelegramBot } = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // public qovluğunu vebə açır

// TELEGRAM BOT AYARLARI (.env faylından oxunur)
const token = process.env.BOT_TOKEN;
const adminChatId = process.env.ADMIN_CHAT_ID;

let bot;
// Əgər token yazılıbsa botu işə salırıq, yoxsa sadəcə xəbərdarlıq edirik ki, server çökməsin
if (token && token !== 'sizin_bot_tokeniniz_bura_yazilacaq') {
    // polling-i false edin və webhook-dan istifadəyə hazırlaşın
const bot = new TelegramBot(token, { polling: false });

// Server başladıqdan sonra webhook-u aktivləşdirin
const url = "https://clasnatech.onrender.com"; // Render-dəki URL-iniz
bot.setWebHook(`${url}/bot${token}`);

// Və express üçün xüsusi bir endpoint əlavə edin:
app.post(`/bot${token}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});
} else {
    console.warn("⚠️ Telegram BOT_TOKEN tapılmadı və ya səhvdir. Bot xidməti aktiv deyil.");
}

// --- MƏLUMAT BAZASI (db.json) YOXLANILMASI VƏ YARADILMASI ---
const dbPath = path.join(__dirname, 'db.json');

// Əgər db.json yoxdursa, ilkin məlumatlarla avtomatik yarat
if (!fs.existsSync(dbPath)) {
    console.log("⚠️ db.json faylı tapılmadı! Avtomatik olaraq yenisi yaradılır...");
    const defaultData = {
        stats: {
            partners: 24,
            pendingOrders: 8,
            totalExpenses: 0
        },
        expensesList: [] // Xərclər siyahısı
    };
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
    console.log("✅ db.json uğurla yaradıldı!");
}

// Baza oxuma və yazma funksiyaları
function readDB() {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function writeDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}
// -----------------------------------------------------------

// API: Ümumi statistikaları gətir
app.get('/api/stats', (req, res) => {
    res.json(readDB().stats);
});

// API: Xərclər siyahısını gətir
app.get('/api/expenses', (req, res) => {
    const db = readDB();
    res.json(db.expensesList || []);
});

// API: Yeni xərc əlavə et (Formadan gələn məlumatlar)
app.post('/api/expense', (req, res) => {
    const { amount, description, date } = req.body;
    if (!amount || isNaN(amount) || !description) return res.status(400).send("Məlumat tam deyil");

    const db = readDB();
    if (!db.expensesList) db.expensesList = []; // Köhnə baza üçün yoxlanış

    // Tarixin formalaşdırılması: Əgər istifadəçi tarix seçibsə onu, seçməyibsə indiki vaxtı götürürük
    let finalDate = new Date().toLocaleString('az-AZ'); 
    if (date) {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate)) {
            finalDate = parsedDate.toLocaleString('az-AZ');
        }
    }

    // Xərc obyekti
    const newExpense = {
        id: Date.now(),
        description: description,
        amount: parseFloat(amount),
        date: finalDate // Təyin olunmuş tarix
    };

    db.expensesList.push(newExpense);
    db.stats.totalExpenses += parseFloat(amount);
    
    writeDB(db); // Bazanı yeniləyirik
    
    res.json({ success: true, totalExpenses: db.stats.totalExpenses, newExpense });
});

// API: Xərc silmək
app.delete('/api/expense/:id', (req, res) => {
    const expenseId = parseInt(req.params.id);
    const db = readDB();
    
    if (!db.expensesList) return res.status(404).send("Xərc tapılmadı");

    // Silinəcək xərci tapırıq ki, məbləğini ümumi xərcdən çıxaq
    const expenseToDelete = db.expensesList.find(exp => exp.id === expenseId);
    
    if (expenseToDelete) {
        // Ümumi xərci azaldırıq (Amma 0-dan aşağı düşməsinə icazə vermirik)
        db.stats.totalExpenses -= expenseToDelete.amount;
        if (db.stats.totalExpenses < 0) db.stats.totalExpenses = 0;

        // Siyahıdan həmin obyekti silirik
        db.expensesList = db.expensesList.filter(exp => exp.id !== expenseId);
        
        writeDB(db); // Bazanı yeniləyirik
        res.json({ success: true, totalExpenses: db.stats.totalExpenses });
    } else {
        res.status(404).json({ success: false, message: "Belə bir xərc tapılmadı" });
    }
});

// TELEGRAM: Telegram-dan gələn cavab (Admin -> Vebsayt)
if (bot) {
    bot.on('message', (msg) => {
        // Yalnız Admin-in yazdıqlarını sayta göndəririk
        if (msg.chat.id.toString() === adminChatId && msg.text) {
            io.emit('receive-message', { sender: 'admin', text: msg.text });
        }
    });
}

// WEBSOCKET: Vebsaytdan serverə (və oradan Telegrama) gələn mesajlar
io.on('connection', (socket) => {
    socket.on('send-message', (data) => {
        const messageText = `👤 *Kiminlə:* ${data.partnerName}\n💬 *Mesaj:* ${data.text}`;
        
        // Əgər bot və admin ID mövcuddursa, mesajı göndər
        if (bot && adminChatId) {
            bot.sendMessage(adminChatId, messageText, { parse_mode: 'Markdown' })
               .catch(err => console.error("Telegram göndərmə xətası:", err.message));
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`🚀 Server http://localhost:${PORT} adresində uğurla işə düşdü!`));
