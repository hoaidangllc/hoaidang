import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  where,
  limit,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCF38B9ZVLiekJY3RMvC3FEn2L188dJxM",
  authDomain: "hoaidang-auth.firebaseapp.com",
  projectId: "hoaidang-auth",
  storageBucket: "hoaidang-auth.appspot.com",
  messagingSenderId: "88083628212",
  appId: "1:88083628212:web:c7608e6ef87ce3f4927a21"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const colRef = collection(db, "ketnoi_profiles");

export function waitForAuthUser() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user || null);
    });
  });
}

export async function uploadAvatar(file) {
  const user = await waitForAuthUser();

  if (!user) {
    throw new Error("User chưa đăng nhập Google.");
  }

  if (!file) return "";

  const safeName = file.name.replace(/[^\w.\-]/g, "_");
  const fileRef = ref(storage, `avatars/${user.uid}/${Date.now()}-${safeName}`);

  await uploadBytes(fileRef, file);
  const downloadURL = await getDownloadURL(fileRef);

  return downloadURL;
}

export async function addProfile(data) {
  const user = await waitForAuthUser();

  const payload = {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    uid: user?.uid || "",
    email: user?.email || "",
    googleName: user?.displayName || "",
    avatarUrl: data.avatarUrl || ""
  };

  const docRef = await addDoc(colRef, payload);
  return docRef.id;
}

export async function getProfiles() {
  const q = query(colRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data()
  }));
}

export async function getProfileById(id) {
  const docRef = doc(db, "ketnoi_profiles", id);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    return {
      id: snap.id,
      ...snap.data()
    };
  }

  return null;
}

export async function getMyProfile() {
  const user = await waitForAuthUser();
  if (!user) return null;

  const q = query(
    colRef,
    where("uid", "==", user.uid),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const first = snapshot.docs[0];
  return {
    id: first.id,
    ...first.data()
  };
}

export async function updateMyProfile(data) {
  const myProfile = await getMyProfile();
  if (!myProfile) {
    throw new Error("Không tìm thấy hồ sơ của user hiện tại.");
  }

  const refDoc = doc(db, "ketnoi_profiles", myProfile.id);
  await updateDoc(refDoc, {
    ...data,
    updatedAt: Date.now()
  });

  return myProfile.id;
}

export async function deleteMyProfile() {
  const myProfile = await getMyProfile();
  if (!myProfile) {
    throw new Error("Không tìm thấy hồ sơ để xóa.");
  }

  const refDoc = doc(db, "ketnoi_profiles", myProfile.id);
  await deleteDoc(refDoc);

  return true;
}
