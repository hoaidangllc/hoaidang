import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCF38B9ZVLiekJY3RMvC3FEn2L188dJxM",
  authDomain: "hoaidang-auth.firebaseapp.com",
  projectId: "hoaidang-auth",
  storageBucket: "hoaidang-auth.appspot.com",
  messagingSenderId: "88083628212",
  appId: "1:88083628212:web:c7608e6ef87ce3f4927a21"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const colRef = collection(db, "ketnoi_profiles");

// 👉 thêm hồ sơ
export async function addProfile(data) {
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: Date.now()
  });
  return docRef.id;
}

// 👉 lấy tất cả hồ sơ
export async function getProfiles() {
  const q = query(colRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// 👉 lấy 1 hồ sơ theo id
export async function getProfileById(id) {
  const docRef = doc(db, "ketnoi_profiles", id);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
}
