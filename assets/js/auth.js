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

if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  });
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    if (authUser) {
      authUser.textContent = user.displayName || user.email || "Đã đăng nhập";
      authUser.style.display = "inline-flex";
    }
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-flex";

    if (typeof window.showKetNoiForm === "function") {
      window.showKetNoiForm(user);
    }
  } else {
    if (authUser) {
      authUser.textContent = "";
      authUser.style.display = "none";
    }
    if (loginBtn) loginBtn.style.display = "inline-flex";
    if (logoutBtn) logoutBtn.style.display = "none";

    if (typeof window.hideKetNoiForm === "function") {
      window.hideKetNoiForm();
    }
  }
});
