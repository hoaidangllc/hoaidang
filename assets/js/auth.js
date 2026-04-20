import { auth, provider } from "/assets/js/firebase-config.js";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authUser = document.getElementById("authUser");

async function loginGoogle() {
  try {
    await setPersistence(auth, browserLocalPersistence);
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Login failed:", error);
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
  loginBtn.addEventListener("click", loginGoogle);
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", logoutGoogle);
}

onAuthStateChanged(auth, (user) => {
  if (authUser) {
    authUser.textContent = user ? (user.displayName || user.email || "Đã đăng nhập") : "";
    authUser.style.display = user ? "inline-flex" : "none";
  }

  if (loginBtn) loginBtn.style.display = user ? "none" : "inline-flex";
  if (logoutBtn) logoutBtn.style.display = user ? "inline-flex" : "none";

  if (typeof window.showKetNoiForm === "function") {
    if (user) window.showKetNoiForm(user);
  }

  if (typeof window.hideKetNoiForm === "function") {
    if (!user) window.hideKetNoiForm();
  }
});
