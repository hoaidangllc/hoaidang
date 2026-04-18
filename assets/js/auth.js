import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
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

if (loginBtn) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loginBtn.innerHTML = user.photoURL
        ? `<img src="${user.photoURL}" alt="User" style="width:26px;height:26px;border-radius:50%;object-fit:cover;">`
        : "Logout";

      loginBtn.onclick = async () => {
        try {
          await signOut(auth);
          location.reload();
        } catch (error) {
          console.error("Logout failed:", error);
        }
      };
    } else {
      loginBtn.innerHTML = "Login";
      loginBtn.onclick = async () => {
        try {
          await signInWithPopup(auth, provider);
        } catch (error) {
          console.error("Login failed:", error);
          alert("Login failed: " + error.message);
        }
      };
    }
  });
}
