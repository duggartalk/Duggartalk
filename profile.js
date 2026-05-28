

let loggedInUser = null;
let isUsernameCheckedAndValid = false;
let isPhoneCheckedAndValid = false;

// HTML Elements mapping
const profileName = document.getElementById("profileName");
const profileUsername = document.getElementById("profileUsername");
const profilePhone = document.getElementById("profilePhone");
const profileAddress = document.getElementById("profileAddress");

const editModal = document.getElementById("editProfileModal");
const editNameInput = document.getElementById("editNameInput");
const editUsernameInput = document.getElementById("editUsername");
const editPhoneInput = document.getElementById("editPhoneInput");
const editAddressInput = document.getElementById("editAddressInput");

// Load Profile Data from Firestore (Window object se window.db aur window.auth use karenge jo app.js se aata hai)
async function loadUserProfile(uid) {
    try {
        if (!window.db || !window.doc || !window.getDoc) {
            // Agar Firebase objects abhi load nahi huye, toh thoda wait karenge
            setTimeout(() => loadUserProfile(uid), 500);
            return;
        }

        const userDocRef = window.doc(window.db, "users", uid);
        const docSnap = await window.getDoc(userDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            if(profileName) profileName.innerText = data.name || "No Name";
            if(profileUsername) profileUsername.innerText = data.username ? "@" + data.username : "@username";
            if(profilePhone) profilePhone.innerText = data.phone || "No Phone";
            if(profileAddress) profileAddress.innerText = data.address || "No Address";

            if(editNameInput) editNameInput.value = data.name || "";
            if(editUsernameInput) editUsernameInput.value = data.username || "";
            if(editPhoneInput) editPhoneInput.value = data.phone || "";
            if(editAddressInput) editAddressInput.value = data.address || "";
            if (data.username) isUsernameCheckedAndValid = true; 

            if (data.phone) isPhoneCheckedAndValid = true;
            

       }

    } catch (error) {
        console.error("Error loading profile:", error);
    }
}

// Global Auth Trigger check karne ke liye dynamic interval
const checkAuthInterval = setInterval(() => {
    if (window.auth && window.auth.currentUser) {
        loadUserProfile(window.auth.currentUser.uid);
        clearInterval(checkAuthInterval);
    }
}, 500);

// Modal Open/Close Controls
window.openEditModal = function() {
    if (editModal) editModal.classList.remove("hidden");
};

window.closeEditModal = function() {
    if (editModal) editModal.classList.add("hidden");
};

// Save Profile Function
window.saveProfile = async function() {
if (!window.db) return alert("System loading, please wait...");
    const user = window.auth ? window.auth.currentUser : null;
    if (!user) {
        alert("User login nahi hai!");
        return;
    }

    const uName = editNameInput ? editNameInput.value.trim() : "";
    const uUsername = editUsernameInput ? editUsernameInput.value.trim() : "";
    const uPhone = editPhoneInput ? editPhoneInput.value.trim() : "";
    const uAddress = editAddressInput ? editAddressInput.value.trim() : "";

    if (!uName || !uUsername) {

        alert("Name aur Username zaroori hain!");
        return;
    }

// 2. Buttons Validation Check
    if (!isUsernameCheckedAndValid) {

        alert("Kripya save karne se pehle Username ke aage 'Check' button daba kar check karein!");

        return;
    
  }

if (!isPhoneCheckedAndValid) {

        alert("Kripya save karne se pehle Mobile Number ke aage 'Verify' button daba kar valid karein!");

        return;
 
   }


    try {
        const userDocRef = window.doc(window.db, "users", user.uid);

        await window.setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            name: uName,
            username: uUsername,
            phone: uPhone,
            address: uAddress
        }, { merge: true });

        if(profileName) profileName.innerText = uName;
        if(profileUsername) profileUsername.innerText = "@" + uUsername;
        if(profilePhone) profilePhone.innerText = uPhone;
        if(profileAddress) profileAddress.innerText = uAddress;

        alert("Profile updated successfully!");
        window.closeEditModal();

    } catch (error) {
        console.error("Error updating profile:", error);
        alert("Error: " + error.message);
    }
};





// Verification flags track karne ke liye global variables



// 1. USERNAME CHECK FUNCTION
window.checkUsernameAvailability = async function() {
    const usernameInput = document.getElementById("editUsername");
    const statusSpan = document.getElementById("usernameStatus");
    const user = window.auth ? window.auth.currentUser : null;

    if (!usernameInput || !usernameInput.value.trim()) {
        alert("Kripya pehle koi username type karein!");
        return;
    }

    const cleanUsername = usernameInput.value.trim().toLowerCase().replace(/\s+/g, '');
    usernameInput.value = cleanUsername; // Input box mein space hatakar lowercase set karega

    try {
        if (!window.collection || !window.query || !window.where || !window.getDocs) {
            alert("Firebase tools abhi load ho rahe hain, ek second baad try karein.");
            return;
        }

        // Khudd ka document check karne ke liye logic
        const userDocRef = window.doc(window.db, "users", user.uid);
        const currentDocSnap = await window.getDoc(userDocRef);
        let mySavedUsername = currentDocSnap.exists() ? (currentDocSnap.data().username || "").toLowerCase() : "";

        if (cleanUsername === mySavedUsername) {
            statusSpan.innerText = "✓ Yeh aapka hi current username hai.";
            statusSpan.className = "text-xs block mt-1 text-green-400";
            statusSpan.classList.remove("hidden");
            isUsernameCheckedAndValid = true;
            return;
        }

        // Database mein unique check
        const usersRef = window.collection(window.db, "users");
        const q = window.query(usersRef, window.where("username", "==", cleanUsername));
        const querySnapshot = await window.getDocs(q);

        let taken = false;
        querySnapshot.forEach((docSnap) => {
            if (docSnap.id !== user.uid) { taken = true; }
        });

        if (taken) {
            statusSpan.innerText = "✗ Yeh username pehle se occupied hai!";
            statusSpan.className = "text-xs block mt-1 text-red-400";
            statusSpan.classList.remove("hidden");
            isUsernameCheckedAndValid = false;
        } else {
            statusSpan.innerText = "✓ Username available hai!";
            statusSpan.className = "text-xs block mt-1 text-green-400";
            statusSpan.classList.remove("hidden");
            isUsernameCheckedAndValid = true;
        }
    } catch (err) {
        console.error(err);
        alert("Error: " + err.message);
    }
};

// 2. MOBILE NUMBER VALIDATION FUNCTION
window.verifyMobileNumber = function() {
    const phoneInput = document.getElementById("editPhoneInput");
    const statusSpan = document.getElementById("phoneStatus");

    if (!phoneInput || !phoneInput.value.trim()) {
        alert("Kripya mobile number daalein!");
        return;
    }

    const phoneValue = phoneInput.value.trim();
    // 10 digits Indian number rule check karne ke liye regex
    const phonePattern = /^[6-9]\d{9}$/;

    if (phonePattern.test(phoneValue)) {
        statusSpan.innerText = "✓ Number Format Sahi Hai (Verified).";
        statusSpan.className = "text-xs block mt-1 text-green-400";
        statusSpan.classList.remove("hidden");
        isPhoneCheckedAndValid = true;
    } else {
        statusSpan.innerText = "✗ Invalid Number! 10-digit sahi number dalein.";
        statusSpan.className = "text-xs block mt-1 text-red-400";
        statusSpan.classList.remove("hidden");
        isPhoneCheckedAndValid = false;
        alert("Kripya sahi format wala 10-digit number dalein!");
    }
};


// Is poore block ko apni file ke bilkul aakhri (end) mein paste kar lijiye
setTimeout(() => {
    const uInput = document.getElementById("editUsername");
    const pInput = document.getElementById("editPhoneInput");
    
    if(uInput) {
        uInput.addEventListener("input", () => {
            isUsernameCheckedAndValid = false;
            const statusSpan = document.getElementById("usernameStatus");
            if(statusSpan) statusSpan.classList.add("hidden");
        });
    }
    if(pInput) {
        pInput.addEventListener("input", () => {
            isPhoneCheckedAndValid = false;
            const statusSpan = document.getElementById("phoneStatus");
            if(statusSpan) statusSpan.classList.add("hidden");
        });
    }
}, 1000);


