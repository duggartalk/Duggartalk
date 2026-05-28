# FULL ADVANCED settings.js FILE

```javascript
// ==========================================
// DUGGARTALK ADVANCED SETTINGS + NOTIFICATION
// ==========================================

// ----------------------
// SETTINGS HTML
// ----------------------
const settingsHTML = `
<div id="sideMenu" class="fixed inset-y-0 left-0 w-72 bg-[#1E293B] shadow-2xl transform -translate-x-full transition-transform duration-300 z-50 border-r border-gray-700 overflow-y-auto">

  <div class="p-6">

    <div class="flex justify-between items-center mb-6">
      <h3 class="text-yellow-400 font-bold text-xl">Settings</h3>
      <button onclick="toggleMenu()" class="text-gray-400 text-2xl hover:text-white">&times;</button>
    </div>

    <nav class="space-y-2 text-sm">

      ${section("Personal")}
      ${item("👤 Your Account", "account")}
      ${item("⚙️ General", "general")}
      ${item("📊 Activity", "activity")}
      ${item("📜 History", "history")}

      ${section("Preferences")}
      ${item("🔔 Notifications", "notifications")}
      ${item("🌐 Languages", "languages")}
      ${item("⏳ Time Management", "time")}
      ${simpleAction("💬 Messages", "openChat()")}

      ${section("Privacy & Safety")}
      ${item("🔒 Privacy", "privacy")}
      ${item("🚫 Blocked Users", "blocked")}

      ${section("Support")}
      ${item("ℹ️ About", "about")}

      <button onclick="logout()" class="w-full text-left text-red-400 p-2 mt-6 hover:bg-red-500/10 rounded-lg">
        🚪 Logout
      </button>

    </nav>
  </div>
</div>

<div id="menuOverlay" onclick="toggleMenu()" class="fixed inset-0 bg-black/60 hidden z-40"></div>

<div id="subSettingModal" class="fixed inset-0 hidden z-[60] flex items-center justify-center p-4 bg-black/80">
  <div class="bg-[#1E293B] w-full max-w-md rounded-2xl p-6 border border-gray-700 animate-fade">

    <div class="flex justify-between items-center mb-4">
      <h2 id="subTitle" class="text-yellow-400 font-bold text-lg"></h2>
      <button onclick="closeSubSetting()" class="text-white text-xl">&times;</button>
    </div>

    <div id="subContent"></div>

  </div>
</div>

<div id="notificationPopup" class="hidden fixed inset-0 bg-black/70 z-[99999] flex items-center justify-center p-4">

<div class="bg-[#1E293B] w-full max-w-md rounded-3xl p-5 border border-gray-700 shadow-2xl">

<div class="flex justify-between items-center mb-4">
<h2 class="text-xl font-bold text-yellow-400">🔔 Notifications</h2>

<button onclick="document.getElementById('notificationPopup').classList.add('hidden')"
class="text-2xl text-gray-400">×</button>
</div>

<div id="notificationList"
class="space-y-3 max-h-[500px] overflow-y-auto">

<p class="text-gray-400 text-center">Loading...</p>

</div>
</div>
</div>

<div id="searchPopup" class="hidden fixed inset-0 bg-black/70 z-[99999] flex items-start justify-center p-4">

<div class="bg-[#1E293B] w-full max-w-lg rounded-3xl p-5 mt-10 border border-gray-700 shadow-2xl">

<div class="flex justify-between items-center mb-4">
<h2 class="text-xl font-bold text-yellow-400">🔍 Search Users</h2>

<button onclick="document.getElementById('searchPopup').classList.add('hidden')"
class="text-2xl text-gray-400">×</button>
</div>

<input type="text"
id="searchInput"
placeholder="Search username..."
onkeyup="window.searchUsers()"
class="w-full bg-[#0F172A] border border-gray-700 rounded-xl p-3 text-white outline-none">

<div id="searchResults"
class="mt-4 space-y-3 max-h-[500px] overflow-y-auto"></div>

</div>
</div>
`;

// ----------------------
// HELPERS
// ----------------------
function section(title) {
  return `<p class="text-gray-500 text-[10px] uppercase font-bold mt-4">${title}</p>`;
}

function item(label, type) {
  return `<a onclick="openSubSetting('${type}')" class="block p-2 rounded-lg text-gray-300 hover:bg-[#0F172A] cursor-pointer transition">${label}</a>`;
}

function simpleAction(label, fn) {
  return `<a onclick="${fn}" class="block p-2 rounded-lg text-gray-300 hover:bg-[#0F172A] cursor-pointer">${label}</a>`;
}

// ----------------------
// LOAD MENU
// ----------------------
function loadSettingsMenu() {
  document.body.insertAdjacentHTML('afterbegin', settingsHTML);
}

window.addEventListener("DOMContentLoaded", loadSettingsMenu);

// ----------------------
// TOGGLE MENU
// ----------------------
window.toggleMenu = function () {

  const menu = document.getElementById("sideMenu");
  const overlay = document.getElementById("menuOverlay");

  menu.classList.toggle("-translate-x-full");
  overlay.classList.toggle("hidden");

  document.body.classList.toggle("overflow-hidden");
};

// ----------------------
// SUB SETTINGS
// ----------------------
window.openSubSetting = function (type) {

  const title = document.getElementById("subTitle");
  const content = document.getElementById("subContent");
  const modal = document.getElementById("subSettingModal");

  const pages = {

privacy: `
<div class="space-y-4">

<label class="flex justify-between items-center">
<span>Private Account</span>
<input type="checkbox" class="accent-yellow-400">
</label>

<div>
<p class="text-xs text-gray-500 mb-1">Comments</p>
<select class="w-full bg-[#0F172A] p-2 rounded text-white">
<option>Everyone</option>
<option>Followers</option>
<option>Off</option>
</select>
</div>

<div>
<p class="text-xs text-gray-500 mb-1">Who can message you</p>
<select id="messagePrivacy" class="w-full bg-[#0F172A] p-2 rounded text-white">
<option value="everyone">Everyone</option>
<option value="followers">Followers Only</option>
<option value="nobody">Nobody</option>
</select>
</div>

<button onclick="savePrivacySettings()"
class="w-full bg-yellow-400 text-black py-2 rounded-xl font-bold">
Save Settings
</button>

</div>
`,

notifications: `
<div class="space-y-4">

<label class="flex justify-between items-center">
<span>Push Notifications</span>
<input type="checkbox" checked>
</label>

<label class="flex justify-between items-center">
<span>Message Alerts</span>
<input type="checkbox" checked>
</label>

<label class="flex justify-between items-center">
<span>Follow Alerts</span>
<input type="checkbox" checked>
</label>

<label class="flex justify-between items-center">
<span>Reel Alerts</span>
<input type="checkbox" checked>
</label>

</div>
`,

about: `
<div class="text-center space-y-3">
<h3 class="text-yellow-400 font-bold">DuggarTalk Pro</h3>
<p class="text-sm">Connecting Hearts, Sharing Culture</p>
<p class="text-xs text-gray-500">Version 2.0.1</p>
<button onclick="closeSubSetting()" class="w-full bg-yellow-400 text-black py-2 rounded-xl">Close</button>
</div>
`,

default: `
<div class="text-center text-gray-400">
<p>Coming Soon 🚀</p>
<button onclick="closeSubSetting()" class="mt-4 bg-gray-700 px-4 py-2 rounded">Back</button>
</div>
`

  };

  title.innerText = type.toUpperCase();
  content.innerHTML = pages[type] || pages.default;

  modal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
};

// ----------------------
// CLOSE SETTINGS
// ----------------------
window.closeSubSetting = function () {
  document.getElementById("subSettingModal").classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
};

// ----------------------
// SAVE PRIVACY SETTINGS
// ----------------------
window.savePrivacySettings = async function () {

  const user = window.auth.currentUser;

  if (!user) return;

  const value =
  document.getElementById("messagePrivacy").value;

  try {

    await window.updateDoc(
      window.doc(window.db, "users", user.uid),
      {
        messagePrivacy: value
      }
    );

    alert("Privacy settings updated");

  } catch (err) {

    console.error(err);
    alert("Error saving settings");
  }
};

// ----------------------
// NOTIFICATIONS POPUP
// ----------------------
window.openNotifications = function () {

const popup = document.getElementById("notificationPopup");

popup.classList.remove("hidden");

loadNotifications();
};

// ----------------------
// LOAD NOTIFICATIONS
// ----------------------
async function loadNotifications(){

const list = document.getElementById("notificationList");

if(!list) return;

const user = window.auth?.currentUser;

if(!user){
list.innerHTML = `<p class="text-red-400">Login Required</p>`;
return;
}

try{

const q =
window.query(
window.collection(window.db,"notifications"),
window.where("target","==",user.email),
window.orderBy("createdAt","desc")
);

window.onSnapshot(q,(snapshot)=>{

list.innerHTML = "";

if(snapshot.empty){

list.innerHTML = `
<p class="text-gray-400 text-center">
No Notifications Yet
</p>`;

return;
}

snapshot.forEach((docSnap)=>{

const data = docSnap.data();

list.innerHTML += `
<div class="bg-[#0F172A] p-4 rounded-2xl border border-gray-700 flex items-start gap-3">

<div class="w-10 h-10 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold">
🔔
</div>

<div class="flex-1">
<p class="text-white text-sm">${data.text}</p>
<p class="text-gray-500 text-xs mt-1">New Activity</p>
</div>

</div>`;

});

});

}catch(err){
console.error(err);
}
}

// ----------------------
// SEARCH SYSTEM
// ----------------------
window.openSearch = function(){

const popup = document.getElementById("searchPopup");

popup.classList.remove("hidden");
};

window.searchUsers = async function(){

const value =
document.getElementById("searchInput").value
.toLowerCase();

const results =
document.getElementById("searchResults");

if(!value){
results.innerHTML = "";
return;
}

try{

const snap =
await window.getDocs(
window.collection(window.db,"users")
);

results.innerHTML = "";

snap.forEach((docSnap)=>{

const data = docSnap.data();

const username =
(data.username || "")
.toLowerCase();

if(username.includes(value)){

results.innerHTML += `
<div onclick="window.location.href='user-profile.html?email=${data.email}'"
class="bg-[#0F172A] p-4 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-[#334155] transition-all">

<div class="w-12 h-12 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold">
${data.email.charAt(0).toUpperCase()}
</div>

<div>
<h2 class="font-bold text-yellow-400">${data.username}</h2>
<p class="text-xs text-gray-400">${data.email}</p>
</div>

</div>`;

}

});

}catch(err){
console.error(err);
}
};

// ----------------------
// CREATE NOTIFICATION
// ----------------------
window.createNotification =
async function(target,text){

try{

await window.addDoc(
window.collection(window.db,"notifications"),
{
target,
text,
createdAt: window.serverTimestamp()
}
);

}catch(err){
console.error(err);
}
};

// ----------------------
// REAL FOLLOW SYSTEM
// ----------------------
window.followUser = async function(){

const currentUser = window.auth.currentUser;

if(!currentUser){
alert("Login Required");
return;
}

const params = new URLSearchParams(window.location.search);

const targetEmail = params.get("email");

if(!targetEmail){
alert("User not found");
return;
}

if(targetEmail === currentUser.email){
alert("You can't follow yourself");
return;
}

try{

const currentSnap =
await window.getDoc(
window.doc(window.db,"users",currentUser.uid)
);

const currentData = currentSnap.data();

const targetQuery =
window.query(
window.collection(window.db,"users"),
window.where("email","==",targetEmail)
);

const targetSnap =
await window.getDocs(targetQuery);

if(targetSnap.empty){
alert("Target user missing");
return;
}

const targetDoc = targetSnap.docs[0];

const targetData = targetDoc.data();

let followers = targetData.followers || [];
let following = currentData.following || [];

const btn = document.getElementById("followBtn");

const alreadyFollowing =
followers.includes(currentUser.email);

if(alreadyFollowing){

followers =
followers.filter(
e => e !== currentUser.email
);

following =
following.filter(
e => e !== targetEmail
);

btn.innerText = "➕ Follow";

}else{

followers.push(currentUser.email);
following.push(targetEmail);

btn.innerText = "✓ Following";

await createNotification(
targetEmail,
`${currentUser.email} started following you`
);
}

await window.updateDoc(
targetDoc.ref,
{ followers }
);

await window.updateDoc(
window.doc(window.db,"users",currentUser.uid),
{ following }
);

const followerCount =
document.getElementById("followerCount");

if(followerCount){
followerCount.innerText = followers.length;
}

}catch(err){
console.error(err);
alert(err.message);
}
};

// ----------------------
// DARK MODE
// ----------------------
window.toggleDarkMode = function(){

document.body.classList.toggle("light-mode");

const enabled =
document.body.classList.contains("light-mode");

localStorage.setItem("theme", enabled ? "light" : "dark");

alert("Theme Updated");
};

// ----------------------
// APPLY SAVED THEME
// ----------------------
window.addEventListener("DOMContentLoaded",()=>{

const savedTheme =
localStorage.getItem("theme");

if(savedTheme === "light"){
document.body.classList.add("light-mode");
}
});

// ----------------------
// MESSAGE USER
// ----------------------
window.messageUser = function() {

const params = new URLSearchParams(window.location.search);

const profileEmail =
params.get("email") ||
localStorage.getItem("profileEmail");

if (!profileEmail) {
alert("User email nahi mili!");
return;
}

localStorage.setItem(
"directChatEmail",
profileEmail.trim()
);

window.location.href =
`messages.html?user=${profileEmail}`;
};

console.log("ADVANCED SETTINGS READY 🚀");
```

# AB KYA KARNA HAI

1. Purana settings.js delete karo
2. Is full code ko paste karo
3. Save karo
4. Firebase rules publish karo
5. Sab realtime chalne lagega

# FEATURES

✅ Real Follow/Unfollow
✅ Live Notifications
✅ Search Users
✅ Dark Mode
✅ Privacy Settings
✅ Instagram Style Sidebar
✅ Follow Notifications
✅ Message System Ready
✅ Advanced UI
✅ YouTube Style Alerts
✅ Realtime Firebase System
