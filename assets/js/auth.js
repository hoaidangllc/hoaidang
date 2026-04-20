import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  browserLocalPersistence,
  setPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDf38B9zvUiekWY3BMvC3FFn2L188d-JxM",
  authDomain: "hoaidang-auth.firebaseapp.com",
  projectId: "hoaidang-auth",
  storageBucket: "hoaidang-auth.firebasestorage.app",
  messagingSenderId: "880038628212",
  appId: "1:880038628212:web:c7608e6ef87ce3f4927a21"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authUser = document.getElementById("authUser");
const authAvatar = document.getElementById("authAvatar");
const authName = document.getElementById("authName");

function hasHomepageUI() {
  return !!(authUser && authAvatar && authName && logoutBtn && loginBtn);
}

function showHomepageLoggedOut() {
  authUser.style.display = "none";
  logoutBtn.style.display = "none";
  loginBtn.style.display = "inline-flex";
  loginBtn.innerHTML = `
    <span class="auth-btn-icon">G</span>
    <span class="auth-label">Login</span>
  `;
}

function showHomepageLoggedIn(user) {
  authUser.style.display = "inline-flex";
  logoutBtn.style.display = "inline-flex";
  loginBtn.style.display = "none";

  authName.textContent = user.displayName || "User";
  authAvatar.src = user.photoURL || "/profile.jpeg";
  authAvatar.alt = user.displayName || "User avatar";
}

function showSimpleLoggedOut() {
  if (!loginBtn) return;
  loginBtn.style.display = "inline-flex";
  loginBtn.innerHTML = "Login";
}

function showSimpleLoggedIn(user) {
  if (!loginBtn) return;
  loginBtn.style.display = "inline-flex";
  loginBtn.innerHTML = user.photoURL
    ? `<img src="${user.photoURL}" alt="User" style="width:26px;height:26px;border-radius:50%;object-fit:cover;">`
    : "Logout";
}

async function loginGoogle() {
  try {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Login failed:", error);

    // 👇 thêm đoạn này để tránh alert khi user tự đóng popup
    if (error.code === "auth/popup-closed-by-user") {
      return;
    }

    alert("Login failed: " + error.message);
  }
}

async function logoutGoogle() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
  }
}

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const currentUser = auth.currentUser;

    if (hasHomepageUI()) {
      if (!currentUser) {
        await loginGoogle();
      }
      return;
    }

    if (currentUser) {
      await logoutGoogle();
    } else {
      await loginGoogle();
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", logoutGoogle);
}

onAuthStateChanged(auth, (user) => {
  if (hasHomepageUI()) {
    if (user) {
      showHomepageLoggedIn(user);
    } else {
      showHomepageLoggedOut();
    }
    return;
  }

  if (user) {
    showSimpleLoggedIn(user);
  } else {
    showSimpleLoggedOut();
  }
});
