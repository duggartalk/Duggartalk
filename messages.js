import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

function getDB() {
    if (!window.db) console.warn("Database not yet initialized!");
    return window.db;
}

function getAuth(){
    return window.auth;
}

// =========================
// CHAT SYSTEM UI
// =========================
let currentChatUser = null;
let unsubscribeMessages = null;
window.messagesHTML = `
<div id="chatModal" class="fixed inset-0 hidden bg-[#0F172A] z-[99999] flex flex-col">
    <div class="flex items-center justify-between p-4 bg-[#1E293B] border-b border-gray-700">
        <h2 class="text-white font-bold text-lg">
            Messages
        </h2>
        <button onclick="closeChat()" class="text-white text-2xl">
            ×
        </button>
    </div>

    <div id="followersList" class="flex-1 overflow-y-auto">
    </div>

    <div id="personalChat" class="hidden flex flex-col h-full">
        <div class="flex items-center gap-3 p-4 bg-[#1E293B]">
            <button onclick="backToUsers()" class="text-white">
                ←
            </button>
            <h3 id="chatUserName" class="text-white font-bold">
            </h3>
        </div>

        <div id="chatMessages" class="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0F172A]">
        </div>

        <div class="p-3 bg-[#1E293B] flex gap-2">
            <input type="text" id="msgInput" placeholder="Message..." class="flex-1 bg-[#0F172A] text-white rounded-full px-4 py-2 outline-none">
            <button onclick="sendMessage()" class="bg-[#FACC15] text-black px-5 rounded-full font-bold">
                Send
            </button>
        </div>
    </div>

</div>`; 



// HTML को तुरंत बॉडी में डालें
if (!document.getElementById("chatModal")) {
    if (window.messagesHTML) {
        document.body.insertAdjacentHTML("beforeend", window.messagesHTML);
    }
}






// डायरेक्ट चैट वाला लॉजिक अलग रखें
window.addEventListener("load", () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openDirectChat') === 'true') {
        setTimeout(() => {
            const directEmail = localStorage.getItem("directChatEmail");
            if (directEmail && typeof window.openChat === "function") {
                window.openChat();
                if (typeof window.openPersonalChat === "function") {
                    window.openPersonalChat(directEmail, directEmail.split('@')[0]);
                }
                // URL साफ़ करें
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }, 1500); 
    }
});








// =========================
// OPEN CHAT
// =========================
window.openChat = function(){
    const modal = document.getElementById("chatModal");
    if(modal) {
        modal.classList.remove("hidden");
    }
    window.loadFollowers(); // <--- "window." लगा दिया, अब एरर नहीं आएगा
}

// =========================
// CLOSE CHAT
// =========================
window.closeChat = function(){
    const modal = document.getElementById("chatModal");
    if(modal) {
        modal.classList.add("hidden");
    }
}






// =========================
// LOAD FOLLOWERS (ALL REGISTERED USERS)
// =========================
window.loadFollowers = async function(){
    const list = document.getElementById("followersList");
    if(!list) return;

    list.innerHTML = `<div class="text-center text-gray-400 p-5 text-sm">Loading users...</div>`;

    try {
        const snapshot = await getDocs(collection(getDB(), "users"));
        const currentUser = getAuth().currentUser;
        
        list.innerHTML = ""; 

        let userCount = 0;

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (currentUser && data.email === currentUser.email) return;

            let displayName = data.username || data.name || data.email || "DuggarTalk User";
            let displayEmail = data.email || "";

            userCount++;

            list.innerHTML += `
            <div onclick="openPersonalChat('${displayEmail}','${displayName}')"
                 class="flex items-center gap-3 p-4 border-b border-gray-800 cursor-pointer hover:bg-[#1E293B] transition-all">
                <div class="w-12 h-12 rounded-full bg-[#FACC15] flex items-center justify-center font-bold text-black">
                    ${displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3 class="text-white font-bold">
                        ${displayName}
                    </h3>
                    <p class="text-gray-400 text-sm">
                        Tap to chat
                    </p>
                </div>
            </div>
            `;
        });

        if(userCount === 0) {
            list.innerHTML = `<div class="text-center text-gray-500 p-5 text-sm">Abhi tak koi dusra user register nahi hua hai.</div>`;
        }

    } catch (error) {
        console.error("Error loading chat users:", error);
    }
}

window.openPersonalChat = function(email, name){
    document.getElementById("followersList").classList.add("hidden");
    document.getElementById("personalChat").classList.remove("hidden");
    document.getElementById("chatUserName").innerText = name;

    currentChatUser = email;

    document.getElementById("chatMessages").innerHTML = `
        <div class="text-gray-400 text-center text-sm mt-4">
            Start chatting with ${name}
        </div>
    `;

    loadMessages();
}

// =========================
// BACK
// =========================
window.backToUsers = function(){
    document.getElementById("followersList").classList.remove("hidden");
    document.getElementById("personalChat").classList.add("hidden");
}

// =========================
// SEND MESSAGE
// =========================
window.sendMessage = async function(){
    const input = document.getElementById("msgInput");
    if(!input || !input.value.trim()) return;

    const currentUser = getAuth().currentUser;
    if(!currentUser) return;

    try {
        await addDoc(collection(getDB(),"messages"),{
            text: input.value.trim(),
            sender: currentUser.email,
            receiver: currentChatUser,
            timestamp: serverTimestamp()
        });
        input.value = "";
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

// =========================
// LOAD REALTIME MESSAGES
// =========================
function loadMessages(){
    if(unsubscribeMessages){
        unsubscribeMessages();
    }

    const currentUser = getAuth().currentUser;
    const box = document.getElementById("chatMessages");
    if(!box) return;

    const q = query(
    collection(getDB(), "messages"),
    where("chatId", "==", generateChatId(currentUser.email, targetUserEmail)), // एक यूनिक Chat ID बनाएं
    orderBy("timestamp", "asc")
);

    unsubscribeMessages = onSnapshot(q, (snapshot)=>{
        box.innerHTML = "";

        snapshot.forEach((docSnap)=>{
            const data = docSnap.data();

            const isMyChat =
            (
                data.sender === currentUser.email &&
                data.receiver === currentChatUser
            )
            ||
            (
                data.sender === currentChatUser &&
                data.receiver === currentUser.email
            );

            if(!isMyChat) return;

            const mine = data.sender === currentUser.email;

            box.innerHTML += `
            <div class="flex ${mine ? 'justify-end' : 'justify-start'}">
                <div class="${mine ? 'bg-[#FACC15] text-black' : 'bg-[#1E293B] text-white'} px-4 py-2 rounded-2xl max-w-[75%] break-words">
                    ${data.text}
                </div>
            </div>
            `;
        });

        box.scrollTop = box.scrollHeight;
    });  
}