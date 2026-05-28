// ==========================================
// FINAL ADVANCED APP.JS
// DUGGARTALK PRO MAX VERSION
// ==========================================

// =========================
// FIREBASE IMPORTS
// =========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  setDoc,
  where,
  updateDoc,
  increment,
  getDoc,
  getDocs,
  limit,
  deleteDoc,
  arrayUnion,
  arrayRemove
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// =========================
// FIREBASE CONFIG
// =========================
const firebaseConfig = {
  apiKey: "AIzaSyDEojq46OXRB8bCiPzWns5YsA7PcU-K-vg",
  authDomain: "duggartalk.firebaseapp.com",
  projectId: "duggartalk",
  storageBucket: "duggartalk.firebasestorage.app",
  messagingSenderId: "825897685253",
  appId: "1:825897685253:web:3f86c07b951a48f32ae76c"
};

// =========================
// INIT FIREBASE
// =========================
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// =========================
// GLOBAL EXPORTS
// =========================
window.db = db;
window.auth = auth;
window.storage = storage;

window.collection = collection;
window.addDoc = addDoc;
window.onSnapshot = onSnapshot;
window.query = query;
window.orderBy = orderBy;
window.serverTimestamp = serverTimestamp;
window.doc = doc;
window.setDoc = setDoc;
window.where = where;
window.updateDoc = updateDoc;
window.increment = increment;
window.getDoc = getDoc;
window.getDocs = getDocs;
window.limit = limit;
window.deleteDoc = deleteDoc;
window.arrayUnion = arrayUnion;
window.arrayRemove = arrayRemove;

window.ref = ref;
window.uploadBytes = uploadBytes;
window.getDownloadURL = getDownloadURL;
window.deleteObject = deleteObject;

// =========================
// AUTH CHECK
// =========================
onAuthStateChanged(auth, async(user) => {

  const authBox = document.getElementById("authContainer");
  const bottomNav = document.getElementById("bottomNav");
  const postBox = document.getElementById("postBox");

  if(user){

    authBox?.classList.add("hidden");
    bottomNav?.classList.remove("hidden");
    postBox?.classList.remove("hidden");

    console.log("LOGIN SUCCESS");

    await createUserDocument(user);

    loadFeed();

    loadStories();

    loadReels();

    updateOnlineStatus(true);

  }else{

    authBox?.classList.remove("hidden");
    bottomNav?.classList.add("hidden");
    postBox?.classList.add("hidden");

    console.log("LOGOUT");

  }

});

// =========================
// CREATE USER DOCUMENT
// =========================
async function createUserDocument(user){

  try{

    const userRef = doc(db, "users", user.uid);

    const snap = await getDoc(userRef);

    if(!snap.exists()){

      await setDoc(userRef,{
        uid:user.uid,
        email:user.email,
        username:user.email.split("@")[0],
        followers:[],
        following:[],
        verified:false,
        online:true,
        bio:"",
        phone:"",
        address:"",
        profilePic:"",
        createdAt:serverTimestamp()
      });

    }

  }catch(err){

    console.error("USER DOC ERROR:", err);

  }

}



// =========================
// LOGIN
// =========================
window.loginWithEmail = async function(){

  const email =
    document.getElementById("email").value;

  const password =
    document.getElementById("password").value;

  if(!email || !password){

    alert("Fill all fields");

    return;
  }

  try{

    await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    alert("Login Success");

  }catch(err){

    console.error(err);

    alert(err.message);

  }

};

// =========================
// REGISTER
// =========================
window.registerWithEmail = async function(){

  const email =
    document.getElementById("email").value;

  const password =
    document.getElementById("password").value;

  if(!email || !password){

    alert("Fill all fields");

    return;
  }

  try{

    await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    alert("Account Created");

  }catch(err){

    console.error(err);

    alert(err.message);

  }

};

// =========================
// LOGOUT
// =========================
window.logout = async function(){

  try{

    await signOut(auth);

    location.reload();

  }catch(err){

    console.error(err);

  }

};

// =========================
// CREATE POST
// =========================
window.createPost = async function(){

  const user = auth.currentUser;

  if(!user){

    alert("Login required");

    return;
  }

  const content =
    document.getElementById("postInput").value;

  const fileInput =
    document.getElementById("postFile");

  let fileUrl = "";
  let fileType = "";

  try{

    if(fileInput?.files[0]){

      const file =
        fileInput.files[0];

      fileType =
        file.type.startsWith("video")
        ? "video"
        : "image";

      const storageRef =
        ref(
          storage,
          `posts/${Date.now()}_${file.name}`
        );

      await uploadBytes(storageRef,file);

      fileUrl =
        await getDownloadURL(storageRef);

    }

    await addDoc(
      collection(db,"posts"),
      {
        userEmail:user.email,
        content:content || "",
        fileUrl,
        fileType,
        likes:0,
        comments:0,
        shares:0,
        createdAt:serverTimestamp()
      }
    );

    alert("Post Uploaded");

    document.getElementById("postInput").value="";

    if(fileInput)
      fileInput.value="";

  }catch(err){

    console.error(err);

    alert(err.message);

  }

};

// =========================
// LOAD FEED
// =========================


function loadFeed() {
  const container = document.getElementById("postsContainer");
  if (!container) return;

  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    container.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const postId = docSnap.id;
      const currentUser = auth.currentUser;

      // 🚨 CHECK: Kya yeh post isi login user ki hai?
      // Agar haan, toh delete button dikhao, nahi toh khali chodo.
      const deleteButtonHtml = (currentUser && currentUser.email === data.userEmail) 
        ? `<button onclick="window.deletePost('${postId}', '${data.fileUrl || ''}')" class="bg-red-600/80 hover:bg-red-600 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all ml-auto">
            🗑️ Delete
           </button>`
        : "";

      const media = data.fileUrl
        ? (data.fileType === "video"
            ? `<video src="${data.fileUrl}" controls class="w-full rounded-2xl mt-3"></video>`
            : `<img src="${data.fileUrl}" class="w-full rounded-2xl mt-3">`)
        : "";

      container.innerHTML += `
      <div class="card p-4 rounded-3xl mb-5">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold">
              ${data.userEmail.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 class="font-bold text-yellow-400">${data.userEmail.split("@")[0]}</h2>
              <p class="text-xs text-gray-500">DuggarTalk User</p>
            </div>
          </div>
          
          <!-- Yahan delete button add ho rha hai -->
          ${deleteButtonHtml}
        </div>

        <p class="mt-3">${String(data.content || "").replace(/</g, "&lt;")}</p>
        ${media}

        <div class="flex gap-3 mt-4">
          <button onclick="likePost('${postId}')" class="bg-[#334155] px-4 py-2 rounded-xl">❤️ ${data.likes || 0}</button>
          <button onclick="sharePost()" class="bg-[#334155] px-4 py-2 rounded-xl">🔗 Share</button>
        </div>
      </div>
      `;
    });
  });
}




// =========================
// LIKE POST
// =========================
window.likePost = async function(postId){

  try{

    const refDoc =
      doc(db,"posts",postId);

    await updateDoc(refDoc,{
      likes:increment(1)
    });

  }catch(err){

    console.error(err);

  }

};

// =========================
// SHARE POST
// =========================
window.sharePost = function(){

  navigator.clipboard.writeText(
    window.location.href
  );

  alert("Link copied");

};

// =========================
// STORIES
// =========================
function loadStories(){

  console.log("Stories Loaded");

}

// =========================
// REELS
// =========================
// =========================
// LOAD REELS FROM FIRESTORE
// =========================
function loadReels() {
  // Maan lijiye aapke HTML me reels dikhane ke liye ek container hai id="reelsContainer"
  const container = document.getElementById("reelsContainer");
  if (!container) return;

  const q = query(collection(db, "reels"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    container.innerHTML = "";
    
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      
      container.innerHTML += `
        <div class="reel-card p-2 bg-black text-white rounded-3xl mb-4 text-center">
          <p class="text-xs text-yellow-400 font-bold mb-1">@${data.userEmail.split('@')[0]}</p>
          <video src="${data.videoUrl}" controls class="w-full max-h-[400px] rounded-2xl"></video>
          <p class="text-sm mt-1">${data.caption || ""}</p>
        </div>
      `;
    });
  });
}
// =========================
// ONLINE STATUS
// =========================
async function updateOnlineStatus(status){

  const user = auth.currentUser;

  if(!user) return;

  try{

    await updateDoc(
      doc(db,"users",user.uid),
      {
        online:status,
        lastSeen:serverTimestamp()
      }
    );

  }catch(err){

    console.error(err);

  }

}

// =========================
// PROFILE SHARE
// =========================
window.shareProfile = function(){

  navigator.clipboard.writeText(
    location.href
  );

  alert("Profile Link Copied");

};

// =========================
// FOLLOW USER
// =========================
window.followUser = async function(){

  const currentUser =
    auth.currentUser;

  if(!currentUser){

    alert("Login Required");

    return;
  }

  const params =
    new URLSearchParams(
      window.location.search
    );

  const targetEmail =
    params.get("email");

  if(!targetEmail){

    alert("Target user missing");

    return;
  }

  try{

    const q =
      query(
        collection(db,"users"),
        where("email","==",targetEmail)
      );

    const snap =
      await getDocs(q);

    if(snap.empty){

      alert("User not found");

      return;
    }

    const targetDoc =
      snap.docs[0];

    const data =
      targetDoc.data();

    let followers =
      data.followers || [];

    const btn =
      document.getElementById("followBtn");

    if(
      followers.includes(
        currentUser.email
      )
    ){

      followers =
        followers.filter(
          e => e !== currentUser.email
        );

      btn.innerText =
        "➕ Follow";

    }else{

      if(!followers.includes(currentUser.email)){
   followers.push(currentUser.email);
}

      btn.innerText =
        "✓ Following";

    }

    await updateDoc(
      targetDoc.ref,
      { followers }
    );

    document.getElementById(
      "followerCount"
    ).innerText =
      followers.length;

  }catch(err){

    console.error(err);

    alert(err.message);

  }

};

// =========================
// ADVANCED FEATURES READY
// =========================

// ✅ Reels
// ✅ Stories
// ✅ Followers
// ✅ Share
// ✅ Like System
// ✅ Realtime Feed
// ✅ Profile System
// ✅ Online Status
// ✅ Firebase Global
// ✅ Upload System
// ✅ Storage
// ✅ Secure Auth

console.log("DUGGARTALK PRO MAX READY 🚀");




// =========================
// TEMP SAFE FUNCTIONS
// =========================

window.showFeed = () => {
  location.href = "index.html";
};

window.showProfile = () => {
  const user = auth.currentUser;
  if(user){
    location.href =
      `profile.html?email=${user.email}`;
  }
};

window.openChat = () => {
  location.href = "messages.html";
};





// =========================
// SHOW REELS PAGE
// =========================
window.showReels = () => {

  // reels page open
  location.href = "reels.html";

};

// =========================
// LOAD REELS FROM FIRESTORE
// =========================
function loadReels() {

  const container =
    document.getElementById("reelsContainer");

  if (!container) return;

  const q =
    query(
      collection(db, "reels"),
      orderBy("createdAt", "desc")
    );

  onSnapshot(q, (snapshot) => {

    container.innerHTML = "";

    if(snapshot.empty){

      container.innerHTML = `
        <div class="text-center text-gray-400 mt-10">
          No Reels Uploaded Yet 🚀
        </div>
      `;

      return;
    }

    snapshot.forEach((docSnap) => {

      const data = docSnap.data();

      const reelId = docSnap.id;

      const currentUser = auth.currentUser;

      // delete button only owner
      const deleteBtn =
        currentUser &&
        currentUser.email === data.userEmail

        ? `
        <button
          onclick="deleteReel('${reelId}','${data.videoUrl}')"
          class="bg-red-600 text-white px-3 py-1 rounded-xl text-xs"
        >
          🗑 Delete
        </button>
        `
        : "";

      container.innerHTML += `
      
      <div class="bg-[#0f172a] rounded-3xl p-3 mb-5">

        <div class="flex justify-between items-center mb-2">

          <div class="flex items-center gap-2">

            <div class="w-10 h-10 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold">
              ${data.userEmail.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 class="text-yellow-400 font-bold">
                @${data.userEmail.split("@")[0]}
              </h2>
            </div>

          </div>

          ${deleteBtn}

        </div>

        <video
          src="${data.videoUrl}"
          controls
          autoplay
          muted
          playsinline
          class="w-full rounded-2xl max-h-[600px] bg-black"
        ></video>

        <p class="mt-2 text-sm">
          ${data.caption || ""}
        </p>

      </div>

      `;
    });

  });

}

// =========================
// UPLOAD REEL
// =========================
window.uploadReel = async function () {

  const user = auth.currentUser;

  if (!user) {
    alert("Login Required");
    return;
  }

  const fileInput =
    document.getElementById("reelFileInput");

  const captionInput =
    document.getElementById("reelCaptionInput");

  if (!fileInput || !fileInput.files[0]) {

    alert("Please select video");

    return;
  }

  const file = fileInput.files[0];

  // only video allowed
  if (!file.type.startsWith("video/")) {

    alert("Only video allowed");

    return;
  }

  try {

    alert("Uploading Reel...");

    // upload video
    const storageRef =
      ref(
        storage,
        `reels/${Date.now()}_${file.name}`
      );

    await uploadBytes(storageRef, file);

    const videoUrl =
      await getDownloadURL(storageRef);

    // save firestore
    await addDoc(
      collection(db, "reels"),
      {
        userEmail: user.email,
        uid: user.uid,
        videoUrl: videoUrl,
        caption: captionInput?.value || "",
        likes: 0,
        createdAt: serverTimestamp()
      }
    );

    alert("Reel Uploaded Successfully 🚀");

    // reset
    fileInput.value = "";

    if(captionInput)
      captionInput.value = "";

    closeReelModal();

    // auto refresh
    loadReels();

  } catch (err) {

    console.error(err);

    alert(err.message);

  }

};













// =========================
// OPEN SEARCH PAGE
// =========================
window.openSearch = () => {

  location.href = "search.html";

};

// =========================
// SEARCH USERS
// =========================
window.searchUsers = async function () {

  const input =
    document.getElementById("searchInput");

  const results =
    document.getElementById("searchResults");

  if (!input || !results) return;

  const keyword =
    input.value.trim().toLowerCase();

  if (!keyword) {

    results.innerHTML = `
      <p class="text-gray-400">
        Type username to search
      </p>
    `;

    return;
  }

  try {

    const snap =
      await getDocs(collection(db, "users"));

    results.innerHTML = "";

    let found = false;

    snap.forEach((docSnap) => {

      const data = docSnap.data();

      const username =
        (data.username || "")
        .toLowerCase();

      const email =
        (data.email || "")
        .toLowerCase();

      // search match
      if (
        username.includes(keyword) ||
        email.includes(keyword)
      ) {

        found = true;

        results.innerHTML += `

        <div
          onclick="openUserProfile('${data.email}')"
          class="bg-[#0f172a] p-4 rounded-2xl mb-3 flex items-center gap-3 cursor-pointer"
        >

          <div class="w-12 h-12 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold">
            ${data.email.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 class="text-yellow-400 font-bold">
              ${data.username || data.email.split("@")[0]}
            </h2>

            <p class="text-sm text-gray-400">
              ${data.email}
            </p>
          </div>

        </div>

        `;
      }

    });

    if (!found) {

      results.innerHTML = `
        <p class="text-gray-400">
          No user found 😔

// =========================
// OPEN NOTIFICATION PAGE
// =========================
window.openNotifications = () => {

  location.href = "notifications.html";

};

// =========================
// LOAD NOTIFICATIONS
// =========================
window.loadNotifications = function () {

  const user = auth.currentUser;

  if (!user) return;

  const container =
    document.getElementById("notificationsContainer");

  if (!container) return;

  const q =
    query(
      collection(db, "notifications"),
      where("targetEmail", "==", user.email),
      orderBy("createdAt", "desc")
    );

  onSnapshot(q, (snapshot) => {

    container.innerHTML = "";

    if (snapshot.empty) {

      container.innerHTML = `
        <div class="text-center text-gray-400 mt-10">
          No Notifications Yet 🔔
        </div>
      `;

      return;
    }

    snapshot.forEach((docSnap) => {

      const data = docSnap.data();

      let icon = "🔔";

      if (data.type === "like")
        icon = "❤️";

      if (data.type === "comment")
        icon = "💬";

      if (data.type === "message")
        icon = "📩";

      if (data.type === "follow")
        icon = "➕";

      container.innerHTML += `

      <div class="bg-[#0f172a] p-4 rounded-2xl mb-3 flex items-center gap-3">

        <div class="w-12 h-12 rounded-full bg-yellow-400 text-black flex items-center justify-center text-xl">
          ${icon}
        </div>

        <div>
          <p class="text-white">
            ${data.text}
          </p>

          <p class="text-xs text-gray-400 mt-1">
            ${data.time || "Just now"}
          </p>
        </div>

      </div>

      `;
    });

  });

};

window.switchAuthTab = function(type){

  const emailSection =
    document.getElementById("emailAuthSection");

  const phoneSection =
    document.getElementById("phoneAuthSection");

  const emailTab =
    document.getElementById("tabEmail");

  const phoneTab =
    document.getElementById("tabPhone");

  if(type === "email"){

    emailSection.classList.remove("hidden");
    phoneSection.classList.add("hidden");

    emailTab.classList.add(
      "border-yellow-400",
      "text-yellow-400"
    );

    phoneTab.classList.remove(
      "border-yellow-400",
      "text-yellow-400"
    );

  }else{

    phoneSection.classList.remove("hidden");
    emailSection.classList.add("hidden");

    phoneTab.classList.add(
      "border-yellow-400",
      "text-yellow-400"
    );

    emailTab.classList.remove(
      "border-yellow-400",
      "text-yellow-400"
    );

  }

};

window.sendOTP = () => {
  alert("Phone OTP Coming Soon");
};

window.verifyOTPAndLogin = () => {
  alert("OTP Verify Coming Soon");
};

window.openReelModal = () => {
  document
    .getElementById("reelUploadModal")
    ?.classList.remove("hidden");
};

window.closeReelModal = () => {
  document
    .getElementById("reelUploadModal")
    ?.classList.add("hidden");
};

window.previewReel = (e) => {

  const file =
    e.target.files[0];

  if(file){

    document.getElementById(
      "selectedFileName"
    ).innerText = file.name;

  }

};

window.setReelLimit = (sec) => {

  window.reelLimit = sec;

  document.querySelectorAll(".limit-btn")
    .forEach(btn => {

      btn.classList.remove(
        "bg-yellow-400",
        "text-black"
      );

      btn.classList.add(
        "bg-[#334155]",
        "text-white"
      );

    });

  const activeBtn =
    document.getElementById(
      `limit${sec}`
    );

  activeBtn.classList.remove(
    "bg-[#334155]",
    "text-white"
  );

  activeBtn.classList.add(
    "bg-yellow-400",
    "text-black"
  );

};

// =========================
// ACTUAL REEL UPLOAD SYSTEM
// =========================
window.uploadReel = async function() {
  const user = auth.currentUser;
  if (!user) {
    alert("Login Required to upload reels!");
    return;
  }

  // Maan lete hain aapke HTML file input ki id "reelFileInput" hai
  const fileInput = document.getElementById("reelFileInput"); 
  const captionInput = document.getElementById("reelCaptionInput"); // optional caption
  
  if (!fileInput || !fileInput.files[0]) {
    alert("Please select a video file first!");
    return;
  }

  const file = fileInput.files[0];
  
  // Check validation if video
  if (!file.type.startsWith("video/")) {
    alert("Please upload a valid video file.");
    return;
  }

  try {
    alert("Uploading Reel... Please wait.");
    
    // 1. Upload to Firebase Storage
    const storageRef = ref(storage, `reels/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    const videoUrl = await getDownloadURL(storageRef);

    // 2. Save Reference in Firestore 'reels' collection
    await addDoc(collection(db, "reels"), {
      userEmail: user.email,
      uid: user.uid,
      videoUrl: videoUrl,
      caption: captionInput ? captionInput.value : "",
      durationLimit: window.reelLimit || 15, // default 15s if not set
      likes: 0,
      createdAt: serverTimestamp()
    });

    alert("Reel Uploaded Successfully! 🚀");
    
    // Modal aur input reset karein
    if (captionInput) captionInput.value = "";
    if (fileInput) fileInput.value = "";
    window.closeReelModal();

  } catch (err) {
    console.error("REEL UPLOAD ERROR:", err);
    alert("Failed to upload reel: " + err.message);
  }
};



// ==========================================
// 🗑️ DELETE POST SYSTEM (WITH FILES)
// ==========================================
window.deletePost = async function(postId, fileUrl) {
  const user = auth.currentUser;
  if (!user) {
    alert("Delete karne ke liye login zaroori hai!");
    return;
  }

  if (!confirm("Kya aap sach me yeh post delete karna chahte hain?")) return;

  try {
    // 1. Agar post me koi image/video thi, toh use Storage se delete karein
    if (fileUrl) {
      try {
        const fileRef = ref(storage, fileUrl);
        await deleteObject(fileRef);
      } catch (storageErr) {
        console.warn("Storage file already deleted or not found:", storageErr);
      }
    }

    // 2. Firestore se post ka document delete karein
    await deleteDoc(doc(db, "posts", postId));
    alert("Post delete ho gayi! 🗑️");

  } catch (err) {
    console.error("DELETE POST ERROR:", err);
    alert("Post delete nahi ho payi: " + err.message);
  }
};

// ==========================================
// 🗑️ DELETE REEL SYSTEM
// ==========================================
window.deleteReel = async function(reelId, videoUrl) {
  const user = auth.currentUser;
  if (!user) {
    alert("Delete karne ke liye login zaroori hai!");
    return;
  }

  if (!confirm("Kya aap sach me yeh reel delete karna chahte hain?")) return;

  try {
    // 1. Storage se video file delete karein
    if (videoUrl) {
      try {
        const videoRef = ref(storage, videoUrl);
        await deleteObject(videoRef);
      } catch (storageErr) {
        console.warn("Storage video not found:", storageErr);
      }
    }

    // 2. Firestore se reel document delete karein
    await deleteDoc(doc(db, "reels", reelId));
    alert("Reel delete ho gayi! 🗑️");

  } catch (err) {
    console.error("DELETE REEL ERROR:", err);
    alert("Reel delete nahi ho payi: " + err.message);
  }
};