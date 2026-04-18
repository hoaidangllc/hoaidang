import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById("loginBtn");

loginBtn.onclick = async () => {
  await signInWithPopup(auth, provider);
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBtn.innerHTML = `
      <img src="${user.photoURL}" style="width:32px;border-radius:50%">
    `;
    loginBtn.onclick = () => signOut(auth);
  } else {
    loginBtn.innerText = "Login";
  }
});
