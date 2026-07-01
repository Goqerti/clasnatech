document.addEventListener('DOMContentLoaded', () => {

    // ======================================================
    // === 1. BEZDİRİCİ VƏ TƏCİLİ BİLDİRİŞ POPUP-I ===
    // ======================================================
    const showUrgentNotice = () => {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-slate-900/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity duration-300';
        overlay.id = 'urgentNoticeOverlay';

        const modal = document.createElement('div');
        modal.className = 'bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden relative transform scale-100 flex flex-col max-h-[90vh]';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'absolute top-3 right-3 text-gray-400 hover:text-red-600 transition bg-gray-100 hover:bg-red-50 p-1.5 rounded-full z-10';
        closeBtn.innerHTML = `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
        
        const content = document.createElement('div');
        content.className = 'p-6 md:p-8 overflow-y-auto text-left';
        content.innerHTML = `
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-5 animate-pulse">
                <svg class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
            </div>
            
            <div class="space-y-4">
                <div class="bg-red-50 p-4 md:p-5 rounded-xl border border-red-100">
                    <p class="text-[15px] text-slate-800 leading-relaxed">
                        Dəyərli həmkarlar,<br>
                        <span class="text-red-600 font-bold text-lg block mt-1 mb-1">Zəhmət olmasa, hər kəs öz API-lərini CRM sisteminə inteqrasiya edib keçid etsin.</span>
                        Bu işin tamamlanması üçün son müddət <span class="font-bold bg-red-200 px-1.5 py-0.5 rounded text-red-800">1 gündür</span>.<br>
                        <span class="text-sm text-slate-600 font-medium mt-2 block">Əməkdaşlığınıza görə təşəkkür edirəm.</span>
                    </p>
                </div>

                <div class="bg-slate-50 p-4 md:p-5 rounded-xl border border-slate-200">
                    <p class="text-[15px] text-slate-800 leading-relaxed">
                        Уважаемые коллеги,<br>
                        <span class="text-red-600 font-bold text-lg block mt-1 mb-1">Пожалуйста, загрузите и подключите ваши API к CRM-системе.</span>
                        Крайний срок выполнения — <span class="font-bold bg-red-200 px-1.5 py-0.5 rounded text-red-800">1 день</span>.<br>
                        <span class="text-sm text-slate-600 font-medium mt-2 block">Благодарю за сотрудничество!</span>
                    </p>
                </div>
            </div>
        `;

        const progressContainer = document.createElement('div');
        progressContainer.className = 'w-full h-1.5 bg-gray-200';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'h-full bg-red-600 transition-all ease-linear';
        progressBar.style.width = '100%';
        progressBar.style.transitionDuration = '20s';

        progressContainer.appendChild(progressBar);
        modal.appendChild(closeBtn);
        modal.appendChild(content);
        modal.appendChild(progressContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const closePopup = () => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        };

        closeBtn.addEventListener('click', closePopup);
        setTimeout(() => { progressBar.style.width = '0%'; }, 50);
        setTimeout(closePopup, 20000);
    };
    showUrgentNotice();

    // ======================================================
    // === 2. STATİSTİKALARIN YÜKLƏNMƏSİ ===
    // ======================================================
    const fetchStats = () => {
        fetch('/api/stats')
            .then(res => res.json())
            .then(data => {
                if (document.getElementById('partnersCount')) document.getElementById('partnersCount').innerText = data.partners;
                if (document.getElementById('ordersCount')) document.getElementById('ordersCount').innerText = data.pendingOrders;
                if (document.getElementById('expensesCount')) document.getElementById('expensesCount').innerText = data.totalExpenses;
                if (document.getElementById('currentExpense')) document.getElementById('currentExpense').innerText = data.totalExpenses;
            })
            .catch(err => console.error("Statistika yüklənərkən xəta yarandı:", err));
    };
    fetchStats();

    // ======================================================
    // === 3. CANLI AKTİVLİK SİMULYASİYASI (index.html) ===
    // ======================================================
    const activityFeed = document.getElementById('activityFeed');
    if (activityFeed) {
        const names = [
            "Elvin M.", "Aysel Q.", "Kənan Ə.", "Nərmin R.", "Rəşad H.", "Leyla K.", 
            "Tofiq V.", "Aynur Ə.", "Cavid G.", "Fərid T.", "Vüsal H.", "Zaur N.", 
            "Samirə M.", "Günel Q.", "Orxan S.", "Tural B.", "Nigar F.", "Fidan A.", 
            "Ramin S.", "Şəbnəm K.", "Kamran R.", "Zəhra V.", "Murad X.", "Emil C.", 
            "Aygün Ş.", "Ruslan M.", "Səbinə T.", "İbrahim X.", "Cəmilə Ə.", "Xəyal M.", 
            "Nurlan Q.", "Rövşən S.", "Əli Ə.", "Fəridə B.", "Anar Z."
        ];

        const projects = [
            "Vebsayt proqramlaşdırılması", "Koorporativ Loqo Dizaynı", "SEO Optimizasiya", 
            "SMM Rəhbərliyi", "Telegram Botu", "Mətnlərin tərcüməsi", "Mobil tətbiq UI/UX", 
            "Məlumat bazasının qurulması", "E-ticarət platformasının yaradılması", 
            "Reklam kampaniyasının idarəedilməsi", "Brendinq və qablaşdırma dizaynı", 
            "Copywriting xidməti", "Video montaj və animasiya", "3D Modelləşdirmə", 
            "Backend API-nin yazılması", "Mobil oyun proqramlaşdırması", "Google Ads quraşdırılması", 
            "Müştəri bazasının analizi", "Cloud server miqrasiyası", "CRM sisteminin inteqrasiyası", 
            "Təqdimat (PowerPoint) dizaynı", "Məqalə və bloq yazarlığı", "QA (Proqram test edilməsi)", 
            "Şəbəkə təhlükəsizliyinin yoxlanılması", "İnstagram üçün Reels montajı", 
            "Vektor illüstrasiya", "Podcast səs montajı", "UI animasiyalarının yığılması", 
            "Data scraping (Məlumat toplanması)", "Texniki dəstək xidməti", 
            "Kriptovalyuta botunun yazılması", "HR idarəetmə sisteminin qurulması"
        ];

        const actions = [
            { text: "yeni sifarişi icra etməyə başladı 🚀", color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-100" },
            { text: "layihəni müştəriyə təhvil verdi ✅", color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-100" },
            { text: "sistemə daxil oldu və iş axtarır 🟢", color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-100" },
            { text: "5 ulduzlu müştəri rəyi aldı ⭐", color: "text-amber-500", bg: "bg-amber-100", border: "border-amber-100" },
            { text: "müştəri ilə canlı söhbətə qoşuldu 💬", color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-100" },
            { text: "daxili balansından vəsait çıxardı 💳", color: "text-teal-600", bg: "bg-teal-100", border: "border-teal-100" },
            { text: "layihədə yeni mərhələni (milestone) tamamladı 📈", color: "text-cyan-600", bg: "bg-cyan-100", border: "border-cyan-100" },
            { text: "müştərinin düzəlişlərini icra edir 🔄", color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-100" },
            { text: "yeni işini portfelinə əlavə etdi 🖼️", color: "text-fuchsia-600", bg: "bg-fuchsia-100", border: "border-fuchsia-100" },
            { text: "yeni gələn layihə təklifini dəyərləndirir 🤝", color: "text-lime-600", bg: "bg-lime-100", border: "border-lime-100" },
            { text: "Freelancer səviyyəsini (Level) yüksəltdi 🏆", color: "text-yellow-600", bg: "bg-yellow-100", border: "border-yellow-100" },
            { text: "platformanın texniki dəstəyinə müraciət etdi 🛠️", color: "text-slate-600", bg: "bg-slate-200", border: "border-slate-200" },
            { text: "yeni bir uzunmüddətli müqavilə imzaladı 📜", color: "text-rose-600", bg: "bg-rose-100", border: "border-rose-100" },
            { text: "profil təhlükəsizlik verifikasiyasından keçdi 🛡️", color: "text-green-600", bg: "bg-green-100", border: "border-green-100" },
            { text: "yeni bir iş elanına müraciət (proposal) göndərdi 📩", color: "text-sky-600", bg: "bg-sky-100", border: "border-sky-100" },
            { text: "müsbət performansına görə müştəridən bonus qazandı 💰", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
            { text: "müştəri ilə Zoom/Google Meet görüşü təyin etdi 📅", color: "text-violet-600", bg: "bg-violet-100", border: "border-violet-100" },
            { text: "böyük büdcəli bir layihə üçün müsahibə dəvəti aldı 🔔", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
            { text: "sistem daxili bilik testindən 95% nəcite topladı 🧠", color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200" },
            { text: "yeni təklif etdiyi xidmət paketini (gig) satışa çıxardı 📦", color: "text-pink-600", bg: "bg-pink-100", border: "border-pink-100" },
            { text: "uzun müddətli işə görə 'Ayın Freelanceri' nominasiyasına namizəd oldu 🎖️", color: "text-yellow-700", bg: "bg-yellow-50", border: "border-yellow-200" },
            { text: "profilindəki qiymət dərəcəsini (hourly rate) yenilədi 🪙", color: "text-gray-700", bg: "bg-gray-100", border: "border-gray-200" },
            { text: "layihənin ilkin eskizlərini (wireframe) hazırlayıb paylaşdı 🗺️", color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-100" },
            { text: "qlobal 'Top Rated' statusunu qorumaq üçün hədəfləri tamamladı 🏅", color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-200" },
            { text: "məlumat təhlükəsizliyi qaydalarını qəbul etdi 🔐", color: "text-zinc-600", bg: "bg-zinc-100", border: "border-zinc-200" },
            { text: "müştərinin təcili tapşırığı üçün əlavə iş saatı qeyd etdi ⏰", color: "text-red-600", bg: "bg-red-100", border: "border-red-100" },
            { text: "öz bacarıqlarını artırmaq üçün platformadakı master-klassa qatıldı 🎓", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
            { text: "böyük bir agentlik tərəfindən komandaya dəvət aldı 🏢", color: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-200" },
            { text: "layihənin yekun kod bazasını GitHub-a yüklədi 💻", color: "text-slate-800", bg: "bg-slate-100", border: "border-slate-300" },
            { text: "istirahət gününə görə statusunu 'Məşğul' olaraq dəyişdi 🏖️", color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" }
        ];

        function generateActivity() {
            const name = names[Math.floor(Math.random() * names.length)];
            const project = projects[Math.floor(Math.random() * projects.length)];
            const action = actions[Math.floor(Math.random() * actions.length)];
            const time = new Date().toLocaleTimeString('az-AZ', {hour: '2-digit', minute:'2-digit', second:'2-digit'});
            
            const detailText = (action.text.includes('sifariş') || action.text.includes('layihə') || action.text.includes('ulduzlu')) 
                ? `<span class="font-medium text-slate-700">Layihə:</span> ${project}` 
                : `<span class="font-medium text-slate-700">Status:</span> Sistem qeydi`;

            const card = document.createElement('div');
            card.className = `feed-item-enter bg-white p-5 rounded-2xl shadow-sm border ${action.border} flex items-center justify-between mb-4`;
            card.innerHTML = `
                <div class="flex items-center gap-5">
                    <div class="w-12 h-12 rounded-full ${action.bg} ${action.color} flex items-center justify-center font-black text-xl shadow-inner">
                        ${name.charAt(0)}
                    </div>
                    <div>
                        <p class="text-[15px] text-slate-800"><span class="font-bold text-slate-900">${name}</span> ${action.text}</p>
                        <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                            ${detailText}
                        </p>
                    </div>
                </div>
                <div class="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                    ${time}
                </div>
            `;

            activityFeed.prepend(card);

            if (activityFeed.children.length > 6) {
                const lastItem = activityFeed.lastElementChild;
                lastItem.style.transition = "opacity 0.5s ease";
                lastItem.style.opacity = "0";
                setTimeout(() => lastItem.remove(), 500);
            }
        }

        for(let i = 0; i < 4; i++) {
            setTimeout(generateActivity, i * 300);
        }

        setInterval(() => {
            generateActivity();
        }, Math.floor(Math.random() * 3000) + 3000);
    }

    // ======================================================
    // === 4. XƏRCLƏR SƏHİFƏSİ (expenses.html) ===
    // ======================================================
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        
        // Qlobal silmə funksiyası (HTML-də onclick tərəfindən tapılması üçün)
        window.deleteExpense = function(id) {
            if(confirm("Bu xərci silmək istədiyinizə əminsiniz?")) {
                fetch(`/api/expense/${id}`, {
                    method: 'DELETE'
                })
                .then(res => res.json())
                .then(data => {
                    if(data.success) {
                        document.getElementById('currentExpense').innerText = data.totalExpenses;
                        loadExpensesList(); // Cədvəli yenilə
                    }
                })
                .catch(err => console.error("Xərc silinərkən xəta:", err));
            }
        };

        const loadExpensesList = () => {
            fetch('/api/expenses')
                .then(res => res.json())
                .then(data => {
                    const listContainer = document.getElementById('expensesListContainer');
                    if (!listContainer) return;
                    
                    listContainer.innerHTML = '';
                    
                    if (data.length === 0) {
                        listContainer.innerHTML = '<p class="text-gray-400 text-sm text-center py-4">Hələ heç bir xərc əlavə edilməyib.</p>';
                        return;
                    }

                    data.reverse().forEach(exp => {
                        const item = document.createElement('div');
                        item.className = "group flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition";
                        item.innerHTML = `
                            <div class="flex items-center gap-4">
                                <div class="bg-rose-100 text-rose-500 p-3 rounded-full">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
                                </div>
                                <div>
                                    <p class="font-bold text-gray-800">${exp.description}</p>
                                    <p class="text-xs text-gray-400 mt-1">${exp.date}</p>
                                </div>
                            </div>
                            
                            <div class="flex items-center gap-6">
                                <div class="font-bold text-rose-600 text-lg">
                                    - ${exp.amount} AZN
                                </div>
                                <button onclick="deleteExpense(${exp.id})" class="opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-lg" title="Xərci Sil">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        `;
                        listContainer.appendChild(item);
                    });
                })
                .catch(err => console.error("Xərclər siyahısı yüklənərkən xəta:", err));
        };

        loadExpensesList();

        expenseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amountInput = document.getElementById('expenseInput');
            const descInput = document.getElementById('expenseDesc');
            const dateInput = document.getElementById('expenseDate');

            fetch('/api/expense', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    amount: amountInput.value, 
                    description: descInput.value,
                    date: dateInput ? dateInput.value : null
                })
            })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    document.getElementById('currentExpense').innerText = data.totalExpenses;
                    amountInput.value = '';
                    descInput.value = '';
                    if (dateInput) dateInput.value = '';
                    loadExpensesList();
                }
            })
            .catch(err => console.error("Xərc əlavə edilərkən xəta:", err));
        });
    }

    // ======================================================
    // === 5. CHAT SƏHİFƏSİ (chat.html) ===
    // ======================================================
    if (document.getElementById('chatBox')) {
        const socket = io();
        
        const partners = [
            { id: 1, name: "Crocodile Group" },
            { id: 2, name: "İT Killer Group" },
            { id: 3, name: "Tenchent" },
            { id: 4, name: "WebtechRu" },
            { id: 5, name: "Mosmo" },
            { id: 6, name: "LinexRu" }
        ];
        
        let activePartner = null;
        const chatHistories = {};
        
        partners.forEach(p => chatHistories[p.id] = []);

        const partnerListEl = document.getElementById('partnerList');
        const chatBox = document.getElementById('chatBox');
        const chatHeader = document.getElementById('chatHeader');
        const chatInputArea = document.getElementById('chatInputArea');
        const chatInput = document.getElementById('chatInput');
        const sendMsgBtn = document.getElementById('sendMsgBtn');

        function renderPartners() {
            if (!partnerListEl) return;
            partnerListEl.innerHTML = '';
            
            partners.forEach(partner => {
                const div = document.createElement('div');
                div.className = `p-4 border-b border-gray-100 cursor-pointer hover:bg-indigo-50 transition ${activePartner?.id === partner.id ? 'bg-indigo-100 border-l-4 border-indigo-600' : ''}`;
                div.innerHTML = `
                    <div class="font-medium text-gray-800">${partner.name}</div>
                    <div class="text-xs text-gray-400">Partnyor #${partner.id}</div>
                `;
                
                div.addEventListener('click', () => selectPartner(partner));
                partnerListEl.appendChild(div);
            });
        }

        function selectPartner(partner) {
            activePartner = partner;
            chatHeader.innerText = `${partner.name} ilə söhbət`;
            if (chatInputArea) chatInputArea.classList.remove('pointer-events-none', 'opacity-50');
            renderPartners();
            renderChat();
        }

        function renderChat() {
            if (!chatBox) return;
            chatBox.innerHTML = '';
            
            const history = chatHistories[activePartner.id];
            
            if (history.length === 0) {
                chatBox.innerHTML = `<div class="text-center text-gray-400 text-sm mt-10">Söhbətə başlayın...</div>`;
                return;
            }

            history.forEach(msg => {
                const div = document.createElement('div');
                div.className = `max-w-[70%] p-3 rounded-2xl text-sm ${msg.type === 'sent' ? 'bg-indigo-600 text-white self-end rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 self-start rounded-bl-none shadow-sm'}`;
                div.innerText = msg.text;
                chatBox.appendChild(div);
            });
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        function sendMessage() {
            if (!chatInput) return;
            const text = chatInput.value.trim();
            if (text === '' || !activePartner) return;

            chatHistories[activePartner.id].push({ type: 'sent', text });
            renderChat();
            
            socket.emit('send-message', { partnerName: activePartner.name, text });
            chatInput.value = '';
        }

        if (sendMsgBtn) sendMsgBtn.addEventListener('click', sendMessage);
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => { 
                if (e.key === 'Enter') sendMessage(); 
            });
        }

        socket.on('receive-message', (data) => {
            if (activePartner) {
                chatHistories[activePartner.id].push({ type: 'received', text: data.text });
                renderChat();
            }
        });

        renderPartners();
    }

    // ======================================================
    // === 6. SİFARİŞLƏR (FREELANCER İŞLƏRİ - jobs.html) ===
    // ======================================================
    const jobsContainer = document.getElementById('jobsContainer');
    if (jobsContainer) {
        const jActions = ["Разработка", "Создание", "Масштабирование", "Проектирование", "Архитектура", "Оптимизация", "Интеграция", "Миграция", "Внедрение"];
        const jSubjects = ["корпоративной ERP системы", "SaaS платформы", "высоконагруженного маркетплейса", "мобильного банкинга", "инфраструктуры на AWS", "системы искусственного интеллекта", "блокчейн-экосистемы", "CRM системы уровня Enterprise", "глобального интернет-магазина", "платежного шлюза"];
        const jExtras = ["под ключ", "с микросервисной архитектурой", "для крупного enterprise клиента", "для финтех стартапа", "с интеграцией нейросетей", "с современным UI/UX", "(срочный контракт)", "с гарантией безопасности (ISO)", "для международных рынков", "с HighLoad оптимизацией"];
        
        const tags = ["Enterprise Разработка", "SaaS", "FinTech", "AI / ML", "Мобильные приложения", "Архитектура БД", "DevOps / AWS", "Блокчейн"];

        const totalJobs = 120;
        document.getElementById('jobCount').innerText = totalJobs + "+";

        // Qlobal təklif vermə funksiyası
        window.submitProposal = function(btnElement) {
            btnElement.innerText = "Отправлено ✅";
            btnElement.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
            btnElement.classList.add('bg-emerald-500', 'pointer-events-none');
        };

        let jobsHTML = "";
        
        for (let i = 0; i < totalJobs; i++) {
            const act = jActions[Math.floor(Math.random() * jActions.length)];
            const sub = jSubjects[Math.floor(Math.random() * jSubjects.length)];
            const ext = jExtras[Math.floor(Math.random() * jExtras.length)];
            
            // $2,000 - $40,000 arası büdcə formalaşdırılması
            const basePrice = Math.floor(Math.random() * 381) + 20; 
            const price = basePrice * 100; 
            const formattedPrice = price.toLocaleString('en-US'); 
            
            const tag = tags[Math.floor(Math.random() * tags.length)];
            const reviews = Math.floor(Math.random() * 150) + 10;
            const timeAgo = Math.floor(Math.random() * 59) + 1;
            
            const jobTitle = `${act} ${sub} ${ext}`;
            const jobDescription = `Требуется Senior-специалист или команда разработчиков для крупного проекта: ${jobTitle.toLowerCase()}. Обязательно наличие portfolio с enterprise-проектами. Работа по договору, подписание NDA. Бюджет подтвержден, ищем лучшее качество на рынке.`;

            jobsHTML += `
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-6">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <span class="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">${tag}</span>
                            <span class="text-xs text-gray-400 font-medium">Размещено ${timeAgo} мин. назад</span>
                            <span class="bg-rose-100 text-rose-600 text-xs font-bold px-3 py-1 rounded-full ml-auto md:ml-0">VIP Проект</span>
                        </div>
                        <h3 class="text-xl font-bold text-slate-800 mb-2 hover:text-indigo-600 cursor-pointer transition">${jobTitle}</h3>
                        <p class="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">${jobDescription}</p>
                        
                        <div class="flex items-center gap-4 text-sm text-gray-500 font-medium">
                            <div class="flex items-center gap-1">
                                <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                Оплата подтверждена (Deposit)
                            </div>
                            <div class="flex items-center gap-1">
                                <span class="text-amber-400">★★★★★</span>
                                (${reviews} отзывов)
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex flex-col items-start md:items-end justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 shrink-0">
                        <div class="text-left md:text-right w-full">
                            <p class="text-sm text-gray-500 font-medium mb-1">Бюджет</p>
                            <p class="text-3xl font-black text-slate-800">$${formattedPrice}</p>
                        </div>
                        <button onclick="submitProposal(this)" class="mt-4 md:mt-0 w-full md:w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                            Отправить предложение
                        </button>
                    </div>
                </div>
            `;
        }
        jobsContainer.innerHTML = jobsHTML;
    }

});
