import { useState, useEffect, useRef } from "react";
import { UserProfile } from "./types";
import { auth, db } from "./firebaseConfig";
import { signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import LoginPage, { addOrUpdateRegisteredUser, removeRegisteredUser } from "./components/LoginPage";
import PortfolioHome from "./components/PortfolioHome";

const STORAGE_KEY = "grid_channel_hub_user";
const LOGGED_IN_KEY = "grid_channel_hub_logged_in";

export default function App() {
  // 1. Initialize user state from Local Storage or default
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved user state:", e);
      }
    }
    return {
      name: "",
      email: "",
      avatar: "",
      role: "user",
      isPremium: false,
      savedIds: [],
      completedIds: [],
      notes: {},
      merchCart: {},
    };
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(LOGGED_IN_KEY) === "true";
  });

  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Save state on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    
    // Synchronize user profile into Firestore with debounce
    if (user.uid) {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
      syncTimerRef.current = setTimeout(() => {
        setDoc(doc(db, "users", user.uid), user).catch(e => {
          console.error("Failed to sync user state to Firestore:", e);
        });
        syncTimerRef.current = null;
      }, 1000);
    }

    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, [user]);

  // Flush pending changes before page unload or hide
  useEffect(() => {
    const flushData = () => {
      if (syncTimerRef.current && user.uid) {
        clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
        setDoc(doc(db, "users", user.uid), user).catch(e => {
          console.error("Failed to sync user state to Firestore on unload:", e);
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushData();
      }
    };

    window.addEventListener("beforeunload", flushData);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", flushData);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    setIsLoggedIn(true);
    localStorage.setItem(LOGGED_IN_KEY, "true");
  };

    const handleDeleteAccount = async () => {
    // Clear any pending sync before deleting account
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }

    try {
      // Wait for auth to initialize if it's not ready
      let currentUser = auth.currentUser;
      if (!currentUser) {
        await new Promise<void>(resolve => {
          const unsubscribe = auth.onAuthStateChanged((user) => {
            currentUser = user;
            unsubscribe();
            resolve();
          });
          // Timeout after 3 seconds
          setTimeout(() => {
            unsubscribe();
            resolve();
          }, 3000);
        });
      }
      if (!currentUser) {
        alert("ไม่พบบัญชีที่เข้าสู่ระบบ หรือเซสชั่นหมดอายุ กรุณาออกจากระบบแล้วเข้าใหม่ก่อนทำรายการ");
        return;
      }
      
      // Delete from Firestore
      const { deleteDoc, doc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "users", currentUser.uid));
      
      // Delete from Firebase Auth
      const { deleteUser } = await import("firebase/auth");
      await deleteUser(currentUser);
      
      // Remove from local registered users for quick login
      if (currentUser.email) {
        removeRegisteredUser(currentUser.email);
      }
      
      alert("ลบบัญชีสำเร็จ");
    } catch (e: any) {
      console.error("Delete account error:", e);
      if (e.code === 'auth/requires-recent-login') {
        alert("กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่อีกครั้งเพื่อยืนยันตัวตนก่อนลบบัญชี");
        await handleLogout(true);
      } else {
        alert("เกิดข้อผิดพลาดในการลบบัญชี: " + e.message);
      }
      return; // Don't logout if failed
    }
    
    // Call the logout logic to clear local state
    await handleLogout(true);
  };

  const handleLogout = async (isAccountDeleted = false) => {
    // Flush any pending write before logout
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
      if (user.uid && !isAccountDeleted) {
        await setDoc(doc(db, "users", user.uid), user).catch(e => console.error(e));
      }
    }

    if (!isAccountDeleted && user && user.email && user.email !== "mock@example.com") {
      try {
        addOrUpdateRegisteredUser(user.email, "", user);
      } catch (err) {
        console.error("Error saving quick login", err);
      }
    }

    try {
      await signOut(auth);
    } catch (e) {
      console.error("Sign out error:", e);
    }
    setIsLoggedIn(false);
    localStorage.setItem(LOGGED_IN_KEY, "false");
    localStorage.removeItem(STORAGE_KEY);
    setUser({
      name: "",
      email: "",
      avatar: "",
      role: "user",
      isPremium: false,
      savedIds: [],
      completedIds: [],
      notes: {},
      merchCart: {},
    });
  };

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <PortfolioHome
      user={user}
      onUpdateUser={setUser}
      onLogout={() => handleLogout()}
      onDeleteAccount={handleDeleteAccount}
    />
  );
}
