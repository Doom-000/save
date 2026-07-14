import React, { useState, useEffect, useRef } from "react";
import { Mail, Lock, User, ArrowRight, Sparkles, ShieldCheck, Check, KeyRound, AlertCircle, Database, CheckCircle, Info, Eye, EyeOff, Trash2, Plus, Pencil, X } from "lucide-react";
import { UserProfile } from "../types";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, deleteUser, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";

interface LoginPageProps {
  onLoginSuccess: (profile: UserProfile) => void;
}

interface RegisteredUser {
  email: string;
  passwordHash: string;
  profile: UserProfile;
}

const googleAvatar1 = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#1A73E8"/><circle cx="50" cy="50" r="36" fill="#4285F4"/><path d="M25 70 L50 35 L75 70 Z" fill="#FFFFFF" opacity="0.85"/><path d="M45 70 L60 50 L75 70 Z" fill="#E8EAED" opacity="0.9"/><circle cx="70" cy="35" r="6" fill="#F9AB00"/></svg>`)}`;

const googleAvatar2 = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#137333"/><circle cx="50" cy="50" r="36" fill="#1E8E3E"/><circle cx="50" cy="50" r="16" fill="#FFFFFF"/><ellipse cx="50" cy="50" rx="28" ry="6" fill="none" stroke="#E8F0FE" stroke-width="4" transform="rotate(-15 50 50)"/><circle cx="35" cy="35" r="3" fill="#E8F0FE"/><circle cx="68" cy="62" r="2" fill="#E8F0FE"/></svg>`)}`;

const googleAvatar3 = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#B06000"/><circle cx="50" cy="50" r="36" fill="#F9AB00"/><circle cx="50" cy="42" r="14" fill="#FFFFFF"/><path d="M20 62 C 30 55, 40 68, 50 62 C 60 55, 70 68, 80 62 L 80 80 L 20 80 Z" fill="#FFFFFF" opacity="0.5"/><path d="M20 68 C 30 62, 40 74, 50 68 C 60 62, 70 74, 80 68 L 80 80 L 20 80 Z" fill="#FFFFFF" opacity="0.8"/></svg>`)}`;

const googleAvatar4 = `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#C5221F"/><circle cx="50" cy="50" r="36" fill="#EA4335"/><circle cx="50" cy="50" r="18" fill="#FFFFFF" opacity="0.9"/><circle cx="50" cy="32" r="10" fill="#FFFFFF" opacity="0.4"/><circle cx="50" cy="68" r="10" fill="#FFFFFF" opacity="0.4"/><circle cx="32" cy="50" r="10" fill="#FFFFFF" opacity="0.4"/><circle cx="68" cy="50" r="10" fill="#FFFFFF" opacity="0.4"/></svg>`)}`;

const AVATAR_TEMPLATES = [googleAvatar1, googleAvatar2, googleAvatar3, googleAvatar4];

const generateLetterAvatar = (name: string): string => {
  const letter = name && name.trim() ? name.trim().charAt(0).toUpperCase() : "G";
  const colors = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6"];
  const charCode = letter.charCodeAt(0);
  const color = colors[charCode % colors.length];
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <rect width="100" height="100" fill="${color}"/>
    <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="48" fill="#ffffff">${letter}</text>
  </svg>`;
  
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const REGISTERED_USERS_KEY = "grid_hub_registered_users";

export const getRegisteredUsers = (): RegisteredUser[] => {
  const data = localStorage.getItem(REGISTERED_USERS_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error(e);
    }
  }
  return [];
};

export const saveRegisteredUsers = (users: RegisteredUser[]) => {
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
};

export const addOrUpdateRegisteredUser = (email: string, passwordHash: string, profile: UserProfile) => {
  const users = getRegisteredUsers();
  const cleanEmail = email.trim().toLowerCase();
  const existingIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);
  if (existingIndex >= 0) {
    users[existingIndex].profile = profile;
    if (passwordHash) {
      users[existingIndex].passwordHash = passwordHash;
    }
  } else {
    users.push({ email: cleanEmail, passwordHash, profile });
  }
  saveRegisteredUsers(users);
  return users;
};

export const removeRegisteredUser = (email: string) => {
  const users = getRegisteredUsers();
  const cleanEmail = email.trim().toLowerCase();
  const updatedList = users.filter((u) => u.email.toLowerCase() !== cleanEmail);
  saveRegisteredUsers(updatedList);
  return updatedList;
};

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_TEMPLATES[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registeredList, setRegisteredList] = useState<RegisteredUser[]>(getRegisteredUsers);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [hiddenEmails, setHiddenEmails] = useState<string[]>(() => {
    try {
      const data = localStorage.getItem("grid_hub_hidden_emails");
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  });

  const saveHiddenEmails = (emails: string[]) => {
    setHiddenEmails(emails);
    localStorage.setItem("grid_hub_hidden_emails", JSON.stringify(emails));
  };

  const [customAvatars, setCustomAvatars] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("grid_hub_custom_avatars");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isEditingAvatars, setIsEditingAvatars] = useState(false);
  const [editingAvatarIndex, setEditingAvatarIndex] = useState<number | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Crop & sizing states matching the user's uploaded sample
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropIndex, setCropIndex] = useState<number | null>(null);
  const [cropZoom, setCropZoom] = useState<number>(1.0);
  const [cropOffsetX, setCropOffsetX] = useState<number>(0);
  const [cropOffsetY, setCropOffsetY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState<{ width: number; height: number } | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size too large. Please select an image under 2MB. / รูปภาพมีขนาดใหญ่เกินไป กรุณาใช้รูปไม่เกิน 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setCropImageSrc(base64);
        setCropIndex(null);
        setCropZoom(1.0);
        setCropOffsetX(0);
        setCropOffsetY(0);
        setImageNaturalSize(null);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be selected again
    e.target.value = "";
  };

  const handleReplaceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || editingAvatarIndex === null) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size too large. Please select an image under 2MB. / รูปภาพมีขนาดใหญ่เกินไป กรุณาใช้รูปไม่เกิน 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setCropImageSrc(base64);
        setCropIndex(editingAvatarIndex);
        setCropZoom(1.0);
        setCropOffsetX(0);
        setCropOffsetY(0);
        setImageNaturalSize(null);
        setEditingAvatarIndex(null);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input
    e.target.value = "";
  };

  const handleDeleteAvatar = (idx: number) => {
    const avatarToDelete = customAvatars[idx];
    const updated = customAvatars.filter((_, i) => i !== idx);
    setCustomAvatars(updated);
    localStorage.setItem("grid_hub_custom_avatars", JSON.stringify(updated));
    
    if (selectedAvatar === avatarToDelete) {
      setSelectedAvatar("letter_avatar");
    }

    if (updated.length === 0) {
      setIsEditingAvatars(false);
    }
  };

  const handleImageLoaded = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setCropZoom(1.0);
    setCropOffsetX(0);
    setCropOffsetY(0);
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setDragStart({ x: clientX - cropOffsetX, y: clientY - cropOffsetY });
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setCropOffsetX(clientX - dragStart.x);
    setCropOffsetY(clientY - dragStart.y);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomStep = 0.05;
    const delta = e.deltaY < 0 ? zoomStep : -zoomStep;
    setCropZoom(prev => Math.max(1.0, Math.min(3.0, prev + delta)));
  };

  const handleCropSave = () => {
    if (!cropImageSrc) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 184;
      canvas.height = 184;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fill canvas background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 184, 184);

      // Apply high quality scaling settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Viewport properties
      const cx = 500 / 2;
      const cy = 340 / 2;
      const cropX = cx - 92; // 158
      const cropY = cy - 92; // 78

      let currentInitialWidth = 320;
      let currentInitialHeight = 320;
      if (img.naturalWidth && img.naturalHeight) {
        const ratio = img.naturalWidth / img.naturalHeight;
        if (ratio >= 1) {
          currentInitialHeight = 250;
          currentInitialWidth = 250 * ratio;
        } else {
          currentInitialWidth = 250;
          currentInitialHeight = 250 / ratio;
        }
      }

      const w = currentInitialWidth * cropZoom;
      const h = currentInitialHeight * cropZoom;

      const imgX = cx + cropOffsetX - w / 2;
      const imgY = cy + cropOffsetY - h / 2;

      // Draw relative to canvas
      const dx = imgX - cropX;
      const dy = imgY - cropY;

      ctx.drawImage(img, dx, dy, w, h);

      const croppedBase64 = canvas.toDataURL("image/jpeg", 0.9);

      if (cropIndex !== null) {
        const updated = [...customAvatars];
        const oldAvatar = updated[cropIndex];
        updated[cropIndex] = croppedBase64;
        setCustomAvatars(updated);
        localStorage.setItem("grid_hub_custom_avatars", JSON.stringify(updated));
        if (selectedAvatar === oldAvatar) {
          setSelectedAvatar(croppedBase64);
        }
      } else {
        const updated = [croppedBase64, ...customAvatars].slice(0, 5);
        setCustomAvatars(updated);
        localStorage.setItem("grid_hub_custom_avatars", JSON.stringify(updated));
        setSelectedAvatar(croppedBase64);
      }

      setCropImageSrc(null);
      setCropIndex(null);
    };
    img.src = cropImageSrc;
  };

  let initialWidth = 320;
  let initialHeight = 320;
  if (imageNaturalSize) {
    const { width, height } = imageNaturalSize;
    const ratio = width / height;
    if (ratio >= 1) {
      initialHeight = 250;
      initialWidth = 250 * ratio;
    } else {
      initialWidth = 250;
      initialHeight = 250 / ratio;
    }
  }

  const renderPreview = (renderSize: number, labelText: string) => {
    const scale = renderSize / 184;
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div 
          style={{ width: renderSize, height: renderSize }} 
          className="rounded-full overflow-hidden relative border border-slate-700 bg-slate-900 shadow-lg shrink-0"
        >
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 500,
              height: 340,
              transform: `translate(-50%, -50%) scale(${scale})`,
              transformOrigin: 'center',
            }}
          >
            <img
              src={cropImageSrc || undefined}
              alt=""
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: initialWidth,
                height: initialHeight,
                transform: `translate(calc(-50% + ${cropOffsetX}px), calc(-50% + ${cropOffsetY}px)) scale(${cropZoom})`,
                transformOrigin: 'center',
              }}
            />
          </div>
        </div>
        <span className="font-mono text-xs text-gray-400 font-bold">{labelText}</span>
      </div>
    );
  };

  useEffect(() => {
    setRegisteredList(getRegisteredUsers());
  }, []);

  const handleQuickLogin = async (user: RegisteredUser) => {
    setLoading(true);
    try {
      // Check if Firebase Auth is already active for this user (Google style)
      if (auth.currentUser && auth.currentUser.email?.toLowerCase() === user.email.toLowerCase()) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          profile.uid = auth.currentUser.uid;
          onLoginSuccess(profile);
          setLoading(false);
          return;
        }
      }

      if (user.passwordHash) {
        const userCredential = await signInWithEmailAndPassword(auth, user.email, user.passwordHash);
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          profile.uid = userCredential.user.uid;
          onLoginSuccess(profile);
        } else {
          setError("Profile not found.");
        }
      } else {
        // It's likely a Google account (empty passwordHash), trigger Google Sign-In with login_hint
        try {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ 
            prompt: 'select_account',
            login_hint: user.email 
          });
          const result = await signInWithPopup(auth, provider);
          const userDocRef = doc(db, "users", result.user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const profile = userDoc.data() as UserProfile;
            profile.uid = result.user.uid;
            
            // Re-save to update local data if necessary
            const users = addOrUpdateRegisteredUser(profile.email, "", profile);
            setRegisteredList(users);
            
            onLoginSuccess(profile);
          } else {
            setError("User profile not found in database.");
          }
        } catch (ssoErr: any) {
          console.error("SSO Quick Login error:", ssoErr);
          if (ssoErr.code === 'auth/popup-closed-by-user' || ssoErr.code === 'auth/cancelled-popup-request') {
             setError(""); // Just ignore
          } else if (ssoErr.code === 'auth/operation-not-allowed') {
             setError("ระบบล็อกอินด้วย Google ยังไม่เปิดใช้งานใน Firebase / Google sign-in is not enabled");
          } else {
             setError(ssoErr.message || "Google Sign-In failed.");
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("Quick login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please fill in all standard credentials. / กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    if (isSignUp && !name.trim()) {
      setError("Please provide your profile name to register. / กรุณากรอกชื่อของคุณ");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Please specify a realistic, well-formed email address. / รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }

    if (isSignUp && password.length < 8) {
      setError("Security safeguard: Password must contain at least 8 characters. / รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match. / รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);

    const domain = cleanEmail.split('@')[1];
    const invalidDomains = ['test.com', 'abc.com', 'dummy.com', 'fake.com', '123.com', 'example.com'];

    if (invalidDomains.includes(domain)) {
      setError("Domain verification failed. Please use a valid email provider. / ไม่พบโดเมนอีเมลนี้ กรุณาใช้อีเมลที่มีอยู่จริง");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Sign Up (Create account)
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const finalAvatar = selectedAvatar === "letter_avatar" ? generateLetterAvatar(name) : selectedAvatar;

        const newUserProfile: UserProfile = {
          uid: userCredential.user.uid,
          name: name.trim(),
          email: cleanEmail,
          avatar: finalAvatar,
          role: cleanEmail.toLowerCase() === "supawit.duna@sbac.ac.th" ? "admin" : "user",
          savedIds: [],
          completedIds: [],
          notes: {},
          merchCart: {}
        };

        // Save to Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), newUserProfile);
        alert("สมัครสมาชิกสำเร็จ / Registration successful");
        
        // Save to local registered list for quick login
        const users = addOrUpdateRegisteredUser(cleanEmail, password, newUserProfile);
        setRegisteredList(users);
        
        onLoginSuccess(newUserProfile);
      } else {
        // Sign In
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        
        if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          profile.uid = userCredential.user.uid;
          if (!profile.email) {
            profile.email = cleanEmail;
          }
          // Enforce super admin role
          if (profile.email.toLowerCase() === "supawit.duna@sbac.ac.th" && profile.role !== "admin") {
            profile.role = "admin";
            await setDoc(doc(db, "users", userCredential.user.uid), { role: "admin" }, { merge: true });
          } else if (!profile.role) {
            profile.role = "user";
            await setDoc(doc(db, "users", userCredential.user.uid), { role: "user" }, { merge: true });
          }

          // Save to local registered list for quick login
          const users = addOrUpdateRegisteredUser(cleanEmail, password, profile);
          setRegisteredList(users);
          
          onLoginSuccess(profile);
        } else {
          setError("User profile not found in database. / ไม่พบข้อมูลโปรไฟล์ในระบบ");
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setIsSignUp(false);
        setError("This email is already registered. Please sign in instead. / อีเมลนี้มีในระบบแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านของคุณ");
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid credentials. Please verify your clearance codes. / อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("ระบบล็อกอินด้วยอีเมลยังไม่เปิดใช้งานใน Firebase / Email sign-in is not enabled");
      } else {
        setError(err.message || "An error occurred during authentication.");
      }
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="relative min-h-screen bg-[#040905] text-white flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden font-sans">
      
      {/* Dynamic Background Mesh Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] rounded-full bg-emerald-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] rounded-full bg-lime-500/10 blur-[100px] animate-pulse delay-75" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-8">
        
        {/* Left Column: Premium App Brand Presentation (Anti-AI-Slop Minimalist design) */}
        <div className="lg:col-span-5 text-center lg:text-left space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5"
          >
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-lime-300">LANDSCAPE & GARDEN SERVICES</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-3"
          >
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-emerald-100 to-lime-400 bg-clip-text text-transparent uppercase">
              SURAPA GARDEN
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed max-w-md mx-auto lg:mx-0">
              ทำธุรกิจรับเหมาจัดสวน ปลูกต้นไม้ และดูแลงานเกี่ยวกับการปรับภูมิทัศน์ (Landscape) ทั้งหมด
            </p>
          </motion.div>

          {/* Quick Stats Indicator Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-3 gap-3 pt-4 max-w-md mx-auto lg:mx-0"
          >
            <div className="p-3.5 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm">
              <p className="font-mono text-xs font-black text-emerald-400">100+</p>
              <p className="font-sans text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">ผลงานจัดสวน</p>
            </div>
            <div className="p-3.5 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm">
              <p className="font-mono text-xs font-black text-lime-400">3</p>
              <p className="font-sans text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">บริการหลัก</p>
            </div>
            <div className="p-3.5 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm">
              <p className="font-mono text-xs font-black text-emerald-500">100%</p>
              <p className="font-sans text-[11px] text-gray-400 uppercase tracking-wider mt-0.5">คุณภาพและมาตรฐาน</p>
            </div>
          </motion.div>

          {/* Persistent Local Accounts Directory Information Panel */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-5 rounded-2xl border border-emerald-500/15 bg-gradient-to-b from-[#07140b]/80 to-transparent backdrop-blur-md space-y-4 max-w-md mx-auto lg:mx-0 text-left"
          >
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-emerald-400" />
              <h3 className="font-mono text-[10px] font-black uppercase tracking-wider text-lime-400">Active Profiles on Device / บัญชีในเครื่องนี้</h3>
            </div>
            
            <p className="font-sans text-xs text-gray-400 leading-relaxed">
              คลิกที่บัญชีด้านล่างเพื่อเข้าสู่ระบบทันทีโดยไม่ต้องกรอกข้อมูลซ้ำ หรือกรอกแบบฟอร์มด้านขวาเพื่อสมัครใหม่
            </p>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
              {(() => {
                const visibleRegisteredList = registeredList.filter(
                  (u) => !hiddenEmails.some((h) => h.toLowerCase() === u.email.toLowerCase())
                );
                
                if (visibleRegisteredList.length === 0) {
                  return (
                    <div className="text-center py-6 text-gray-500 font-sans text-xs">
                      ไม่มีบัญชีที่ลงทะเบียนในเครื่องนี้ / No profiles found on this device
                    </div>
                  );
                }

                return visibleRegisteredList.map((user) => {
                  const isDeleting = deletingEmail === user.email;
                  return (
                    <div
                      key={user.email}
                      className={`w-full flex flex-col p-2.5 rounded-xl border transition-all ${
                        isDeleting
                          ? "border-rose-500/30 bg-rose-950/30"
                          : "border-white/5 bg-gradient-to-r from-emerald-950/10 to-transparent hover:border-emerald-500/15"
                      }`}
                    >
                      {isDeleting ? (
                        <div className="w-full text-left space-y-2 p-1">
                          <p className="font-sans text-[10px] text-rose-300 font-bold leading-normal">
                            เลือกรูปแบบการลบสำหรับบัญชี "{user.profile.name}"
                          </p>
                          <div className="space-y-1.5">
                            <button
                              type="button"
                              onClick={async () => {
                                if (user.passwordHash) {
                                  setLoading(true);
                                  try {
                                    // 1. Sign in to Firebase to get token for deletion
                                    const userCred = await signInWithEmailAndPassword(auth, user.email, user.passwordHash);
                                    // 2. Delete Firestore document
                                    await deleteDoc(doc(db, "users", userCred.user.uid));
                                    // 3. Delete Firebase Auth user
                                    await deleteUser(userCred.user);
                                    
                                    // 4. Remove from local quick login list
                                    const updatedList = removeRegisteredUser(user.email);
                                    setRegisteredList(updatedList);
                                    setDeletingEmail(null);
                                    alert("ลบบัญชีและข้อมูลทั้งหมดสำเร็จ");
                                  } catch (e: any) {
                                    console.error("Firebase deletion failed:", e);
                                    alert("ลบไม่สำเร็จ กรุณาเข้าสู่ระบบใหม่แล้วลบผ่านหน้าโปรไฟล์\nสาเหตุ: " + e.message);
                                  } finally {
                                    setLoading(false);
                                  }
                                } else {
                                  alert("ไม่สามารถลบได้เนื่องจากไม่ได้บันทึกรหัสผ่านไว้ กรุณาเข้าสู่ระบบด้วยรหัสผ่านแล้วทำรายการลบผ่านหน้าโปรไฟล์");
                                }
                              }}
                              className="w-full rounded bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-200 hover:text-white py-1.5 px-2 text-left font-sans text-[9px] font-bold transition-all flex items-center justify-between cursor-pointer group"
                            >
                              <span>1. ลบข้อมูลและบัญชีทั้งหมดออกถาวร / Delete Account & Data</span>
                              <span className="font-mono text-[9px] bg-rose-950 px-1 py-0.5 rounded text-rose-400 group-hover:bg-rose-900 transition-colors shrink-0">ลบทั้งหมด</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedHidden = [...hiddenEmails, user.email.toLowerCase()];
                                saveHiddenEmails(updatedHidden);
                                setDeletingEmail(null);
                              }}
                              className="w-full rounded bg-amber-600/20 hover:bg-amber-600 border border-amber-500/30 text-amber-200 hover:text-black py-1.5 px-2 text-left font-sans text-[9px] font-bold transition-all flex items-center justify-between cursor-pointer group"
                            >
                              <span>2. ลบแค่หน้า login (ข้อมูลบัญชียังบันทึกอยู่) / Hide Profile Only</span>
                              <span className="font-mono text-[7px] bg-amber-950 px-1 py-0.5 rounded text-amber-400 group-hover:bg-amber-900 transition-colors shrink-0">ลบแค่ทางเข้า</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingEmail(null)}
                              className="w-full rounded bg-white/5 border border-white/10 text-gray-400 py-1.5 text-center font-sans text-[9px] hover:text-white transition-all uppercase tracking-wider cursor-pointer"
                            >
                              ยกเลิก / Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full flex items-center justify-between">
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleQuickLogin(user)}
                            className="flex-1 flex items-center gap-2 min-w-0 text-left cursor-pointer"
                          >
                            <img
                              src={user.profile.avatar}
                              alt={user.profile.name}
                              referrerPolicy="no-referrer"
                              className="h-7 w-7 rounded-full border border-emerald-500/20 object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1 ml-1">
                              <h4 className="font-sans text-sm font-bold text-white hover:text-emerald-400 transition-colors truncate max-w-[100px] sm:max-w-[130px]">
                                {user.profile.name}
                              </h4>
                              <p className="font-mono text-[10px] text-gray-500 truncate max-w-[100px] sm:max-w-[130px]">
                                {user.email}
                              </p>
                            </div>
                          </button>
                          
                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => handleQuickLogin(user)}
                              className="font-mono text-[8px] text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded border border-emerald-500/20 transition-all uppercase tracking-wider shrink-0 cursor-pointer"
                            >
                              Sign In
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingEmail(user.email)}
                              className="p-1 rounded border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all cursor-pointer shrink-0"
                              title="ลบบัญชีนี้ออกจากเครื่องนี้ / Delete from device"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
 
            <div className="border-t border-white/5 pt-3 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                <p className="font-sans text-[10px] text-gray-400 leading-normal">
                  <strong className="text-white">เชื่อมต่ออัตโนมัติ</strong>: ประวัติการเรียนรู้, สถิติ และการบันทึกข้อมูลจะถูกจดจำไว้ตลอดกาล
                </p>
              </div>
              {confirmClearAll ? (
                <div className="rounded border border-rose-500/30 bg-rose-950/20 p-2.5 space-y-2">
                  <p className="font-sans text-[10px] text-rose-300 leading-normal">
                    คำเตือน: การกดปุ่มนี้จะลบข้อมูลการเข้าสู่ระบบทั้งหมดที่เคยลงอีเมลไว้ และลบบัญชีพร้อมข้อมูลออกจากระบบอย่างถาวร
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={async () => {
                        setLoading(true);
                        try {
                          // Iterate and delete all local accounts from Firebase
                          for (const user of registeredList) {
                            if (user.passwordHash) {
                              try {
                                const userCred = await signInWithEmailAndPassword(auth, user.email, user.passwordHash);
                                await deleteDoc(doc(db, "users", userCred.user.uid));
                                await deleteUser(userCred.user);
                              } catch (e) {
                                console.error(`Failed to delete user ${user.email} from system:`, e);
                              }
                            }
                          }
                          await signOut(auth);
                        } catch (e) {
                          console.error("Sign out error:", e);
                        } finally {
                          // Clear everything locally
                          localStorage.clear();
                          sessionStorage.clear();
                          window.location.reload();
                        }
                      }}
                      className="flex-1 rounded bg-rose-600 text-white py-1 text-center font-sans text-[10px] font-bold hover:bg-rose-500 transition-all uppercase tracking-wider cursor-pointer disabled:opacity-50"
                    >
                      ใช่, ลบทั้งหมด / Clear Website Data
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClearAll(false)}
                      className="flex-1 rounded bg-white/5 border border-white/10 text-gray-400 py-1 text-center font-sans text-[10px] hover:text-white transition-all uppercase tracking-wider cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(true)}
                  className="w-full mt-1.5 rounded border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 py-1.5 text-center font-mono text-[9px] font-bold text-rose-400 hover:text-rose-300 transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                >
                  <Database className="h-3 w-3" />
                  <span>ลบข้อมูลทั้งหมดออกจากเว็บไซต์ / Clear Website Data</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Secure Interactive Portal Container */}
        <div className="lg:col-span-7 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#050b06]/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Glossy overlay effect */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

            {/* Portal Tab Header Toggle */}
            <div className="flex border-b border-white/5 pb-4 mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setError("");
                }}
                className={`flex-1 pb-2 text-center font-sans text-base font-bold tracking-tight transition-all relative ${
                  !isSignUp ? "text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Sign In
                {!isSignUp && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                  />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setError("");
                }}
                className={`flex-1 pb-2 text-center font-sans text-sm font-bold tracking-tight transition-all relative ${
                  isSignUp ? "text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Create Account
                {isSignUp && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
                  />
                )}
              </button>
            </div>

            {/* Main Form content */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Full Name Input Field */}
                    <div className="space-y-1">
                      <label className="block font-mono text-[9px] font-black uppercase tracking-widest text-gray-400">
                        Profile Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Supawit Duna"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded border border-white/10 bg-white/5 py-2.5 pr-4 pl-10 text-xs font-sans text-white placeholder-gray-600 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                        />
                      </div>
                    </div>

                    {/* Avatar Selection Grid */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="block font-mono text-[9px] font-black uppercase tracking-widest text-gray-400">
                          Choose Profile Avatar / เลือกรูปโปรไฟล์
                        </label>
                        {customAvatars.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setIsEditingAvatars(!isEditingAvatars)}
                            className={`flex items-center justify-center h-8 w-8 rounded-full border transition-all cursor-pointer ${
                              isEditingAvatars
                                ? "bg-amber-500 text-slate-900 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.45)] scale-110"
                                : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:border-emerald-500/30 hover:text-emerald-300 hover:scale-105"
                            }`}
                            title={isEditingAvatars ? "เสร็จสิ้น / Done" : "แก้ไขหรือลบรูปภาพทั้งหมด / Edit or Delete Images"}
                          >
                            <Pencil className={`h-4.5 w-4.5 ${isEditingAvatars ? "text-slate-950 stroke-[2.5]" : "text-gray-300"}`} />
                          </button>
                        )}
                      </div>
                      
                      {isEditingAvatars && (
                        <div className="text-[10px] text-amber-300/90 font-sans flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded px-2.5 py-1">
                          <Info className="h-3 w-3 shrink-0 text-amber-400" />
                          <span>คุณสามารถเปลี่ยนรูปหรือลบรูปประวัติของคุณได้ที่ด้านล่าง / You can now replace or delete your avatars below</span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3.5 items-center pt-1 pb-1">
                        {/* 1. Letter Avatar Option */}
                        <button
                          type="button"
                          onClick={() => setSelectedAvatar("letter_avatar")}
                          className={`relative rounded-full overflow-hidden border-2 h-10 w-10 transition-all shrink-0 ${
                            selectedAvatar === "letter_avatar" ? "border-emerald-500 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                          title="ใช้ตัวอักษรแรกของชื่อ / Use Letter Avatar"
                        >
                          <img src={generateLetterAvatar(name)} alt="Letter avatar" className="h-full w-full object-cover" />
                          <div className="absolute bottom-0 right-0 bg-emerald-500 text-[8px] text-white px-0.5 font-bold uppercase rounded-tl scale-90">A</div>
                          {selectedAvatar === "letter_avatar" && (
                            <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center">
                              <Check className="h-4 w-4 text-white font-bold" />
                            </div>
                          )}
                        </button>

                        {/* 2. Standard Templates */}
                        {AVATAR_TEMPLATES.map((avatar) => (
                          <button
                            key={avatar}
                            type="button"
                            onClick={() => setSelectedAvatar(avatar)}
                            className={`relative rounded-full overflow-hidden border-2 h-10 w-10 transition-all shrink-0 ${
                              selectedAvatar === avatar ? "border-emerald-500 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                          >
                            <img src={avatar} alt="Avatar option" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                            {selectedAvatar === avatar && (
                              <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center">
                                <Check className="h-4 w-4 text-white font-bold" />
                              </div>
                            )}
                          </button>
                        ))}

                        {/* 3. Custom Uploaded History */}
                        {customAvatars.map((avatar, idx) => {
                          const isSelected = selectedAvatar === avatar;
                          return (
                            <div key={`custom-${idx}`} className="relative h-10 w-10 shrink-0 group">
                              <button
                                type="button"
                                onClick={() => setSelectedAvatar(avatar)}
                                className={`relative rounded-full overflow-hidden border-2 h-full w-full transition-all ${
                                  isSelected ? "border-emerald-500 scale-105" : "border-transparent opacity-80 hover:opacity-100"
                                }`}
                                title="รูปภาพของคุณ / Your Custom Avatar"
                              >
                                <img src={avatar} alt="Custom avatar" className="h-full w-full object-cover" />
                                {isSelected && (
                                  <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                                    <Check className="h-3 w-3 text-white font-bold" />
                                  </div>
                                )}
                              </button>
                              
                              {/* Pencil Edit button overlay - visible on hover or if isEditingAvatars is true */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingAvatarIndex(idx);
                                  setTimeout(() => {
                                    replaceFileInputRef.current?.click();
                                  }, 50);
                                }}
                                className={`absolute -bottom-1 -left-1 h-5.5 w-5.5 bg-slate-800 border hover:bg-emerald-950/90 rounded-full flex items-center justify-center text-gray-300 hover:text-white transition-all shadow-md cursor-pointer z-10 ${
                                  isEditingAvatars 
                                    ? "scale-110 border-amber-500 text-amber-300 animate-pulse" 
                                    : "scale-90 border-white/20 opacity-0 group-hover:opacity-100"
                                }`}
                                title="แก้ไขรูปภาพนี้ / Replace this image"
                              >
                                <Pencil className="h-2.5 w-2.5" />
                              </button>

                              {/* Delete button overlay - visible on hover or if isEditingAvatars is true */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAvatar(idx);
                                }}
                                className={`absolute -top-1 -right-1 h-5.5 w-5.5 bg-rose-950/95 border hover:bg-rose-600 rounded-full flex items-center justify-center text-rose-300 hover:text-white transition-all shadow-md cursor-pointer z-10 ${
                                  isEditingAvatars 
                                    ? "scale-110 border-rose-500 animate-pulse" 
                                    : "scale-90 border-rose-500/30 opacity-0 group-hover:opacity-100"
                                }`}
                                title="ลบรูปภาพนี้ / Delete this image"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          );
                        })}

                        {/* 4. Upload PLUS Button */}
                        <label
                          className="relative rounded-full overflow-hidden border-2 border-dashed border-white/20 hover:border-emerald-500/40 h-10 w-10 flex items-center justify-center cursor-pointer opacity-60 hover:opacity-100 transition-all bg-white/5 shrink-0"
                          title="อัปโหลดรูปภาพใหม่ / Upload Custom Avatar"
                        >
                          <Plus className="h-4 w-4 text-gray-400" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                          />
                        </label>

                        {/* Hidden replacement file input */}
                        <input
                          type="file"
                          ref={replaceFileInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={handleReplaceImageUpload}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Input Field */}
              <div className="space-y-1">
                <label className="block font-mono text-[9px] font-black uppercase tracking-widest text-gray-400">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <input
                    type="email"
                    placeholder="supawit.duna@sbac.ac.th"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded border border-white/10 bg-white/5 py-2.5 pr-4 pl-10 text-xs font-sans text-white placeholder-gray-600 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Password Input Field */}
              <div className="space-y-1">
                <label className="block font-mono text-[9px] font-black uppercase tracking-widest text-gray-400">
                  Secret Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded border border-white/10 bg-white/5 py-2.5 pr-10 pl-10 text-xs font-sans text-white placeholder-gray-600 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors focus:outline-none"
                    title={showPassword ? "Conceal Password / ซ่อนรหัสผ่าน" : "Reveal Password / แสดงรหัสผ่าน"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-1 overflow-hidden"
                  >
                    <label className="block font-mono text-[9px] font-black uppercase tracking-widest text-gray-400">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded border border-white/10 bg-white/5 py-2.5 pr-10 pl-10 text-xs font-sans text-white placeholder-gray-600 focus:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error messages feedback line */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="flex items-center gap-2 rounded border border-red-500/15 bg-red-500/5 p-3 text-red-400 text-xs font-sans"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Terms and secure check subtext */}
              <div className="flex items-center gap-2 pt-1">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span className="font-sans text-[10px] text-gray-500 leading-none">
                  Authenticated secure login protocol with active encryption.
                </span>
              </div>

              {/* Submit Trigger Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 rounded-xl bg-emerald-600 text-white py-3 text-xs font-black hover:bg-emerald-500 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Handshake...</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? "Initialize Account Connection" : "Secure System Entry"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-white/10"></div>
                <span className="px-3 font-mono text-[9px] uppercase tracking-wider text-gray-500">OR</span>
                <div className="flex-1 border-t border-white/10"></div>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  setError("");
                  try {
                    const provider = new GoogleAuthProvider();
                    provider.setCustomParameters({ prompt: 'select_account' });
                    const result = await signInWithPopup(auth, provider);
                    const userDocRef = doc(db, "users", result.user.uid);
                    const userDoc = await getDoc(userDocRef);
                    let profile: UserProfile;
                    if (userDoc.exists()) {
                      profile = userDoc.data() as UserProfile;
                      profile.uid = result.user.uid;
                      if (!profile.email) {
                        profile.email = result.user.email || "";
                      }
                      
                      // Enforce super admin role
                      if (profile.email.toLowerCase() === "supawit.duna@sbac.ac.th" && profile.role !== "admin") {
                        profile.role = "admin";
                        await setDoc(userDocRef, { role: "admin" }, { merge: true });
                      } else if (!profile.role) {
                        profile.role = "user";
                        await setDoc(userDocRef, { role: "user" }, { merge: true });
                      }
                      
                    } else {
                      // Registering a new Google user
                      const userEmail = result.user.email || "";
                      profile = {
                        uid: result.user.uid,
                        name: result.user.displayName || "Google User",
                        email: userEmail,
                        avatar: result.user.photoURL || generateLetterAvatar(result.user.displayName || "G"),
                        role: userEmail.toLowerCase() === "supawit.duna@sbac.ac.th" ? "admin" : "user",
                        savedIds: [],
                        completedIds: [],
                        notes: {},
                        merchCart: {}
                      };
                      await setDoc(userDocRef, profile);
                    }
                    // Save to local registered list for quick login (with empty password hash for Google Auth)
                    if (profile.email) {
                      const users = addOrUpdateRegisteredUser(profile.email, "", profile);
                      setRegisteredList(users);
                    }
                    onLoginSuccess(profile);
                  } catch (err: any) {
                    console.error("SSO Auth error:", err);
                    if (err.code === 'auth/unauthorized-domain') {
                      setError("โดเมนปัจจุบันยังไม่ได้รับอนุญาตให้ใช้ SSO โปรดเพิ่ม URL ลงใน Firebase Console -> Authentication -> Settings -> Authorized domains");
                    } else if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
                      setError(""); // Ignore popup cancellation
                    } else if (err.code === 'auth/operation-not-allowed') {
                      setError("ระบบล็อกอินด้วย Google ยังไม่เปิดใช้งานใน Firebase / Google sign-in is not enabled");
                    } else {
                      setError(err.message || "SSO Authentication failed.");
                    }
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full rounded-md bg-white text-gray-700 py-2.5 px-4 text-sm font-medium hover:bg-gray-50 hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-sm border border-gray-300"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>ล็อกอินด้วย Google</span>
              </button>
            </form>

            <div className="mt-6 border-t border-white/5 pt-4 text-center">
              <p className="font-sans text-[10px] text-gray-500">
                Authorized development workspace. Intended exclusively for supawit.duna@sbac.ac.th
              </p>
            </div>

          </motion.div>
        </div>

      </div>

      {cropImageSrc && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-700/50 rounded-xl max-w-2xl w-full p-6 text-white shadow-2xl overflow-hidden flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Top section: Previews & Info */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between border-b border-slate-700/50 pb-5">
              {/* Previews */}
              <div className="flex items-end gap-6">
                {renderPreview(110, "184px")}
                {renderPreview(64, "64px")}
                {renderPreview(32, "32px")}
              </div>

              {/* Info Text */}
              <div className="text-right flex-1 flex flex-col gap-1.5">
                <h3 className="text-lg font-sans font-bold text-slate-100 flex items-center gap-2 justify-end">
                  <span>อัปโหลดภาพแทนตัว</span>
                </h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed ml-auto">
                  อัปโหลดไฟล์จากอุปกรณ์ของคุณ ภาพควรเป็นสี่เหลี่ยมจัตุรัสและมีขนาดอย่างน้อย 184px x 184px
                </p>
              </div>
            </div>

            {/* Middle section: Interactive Viewport */}
            <div className="flex flex-col items-center gap-4">
              <div 
                style={{ width: 500, height: 340 }}
                className="relative bg-slate-950 border border-slate-800 rounded-lg overflow-hidden cursor-move select-none shadow-inner"
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
                onWheel={handleWheel}
              >
                {/* The Image under crop */}
                <img
                  src={cropImageSrc}
                  alt="To crop"
                  onLoad={handleImageLoaded}
                  className="max-w-none max-h-none pointer-events-none select-none"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: initialWidth,
                    height: initialHeight,
                    transform: `translate(calc(-50% + ${cropOffsetX}px), calc(-50% + ${cropOffsetY}px)) scale(${cropZoom})`,
                    transformOrigin: 'center',
                  }}
                />

                {/* SVG Overlaid circular Mask & guidelines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none select-none">
                  <defs>
                    <mask id="cropCircleMask">
                      <rect width="100%" height="100%" fill="white" />
                      <circle cx="250" cy="170" r="92" fill="black" />
                    </mask>
                  </defs>
                  
                  {/* Semi-transparent mask area */}
                  <rect width="100%" height="100%" fill="#020617" fillOpacity="0.75" mask="url(#cropCircleMask)" />
                  
                  {/* Circular crop boundary with precise styling */}
                  <circle cx="250" cy="170" r="92" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                  <circle cx="250" cy="170" r="92" fill="none" stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 3" />

                  {/* Gridlines/Crosshair guidelines inside the circle */}
                  <line x1={250 - 92} y1={170 - 30} x2={250 + 92} y2={170 - 30} stroke="white" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1={250 - 92} y1={170 + 30} x2={250 + 92} y2={170 + 30} stroke="white" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 2" />
                  
                  <line x1={250 - 30} y1={170 - 92} x2={250 - 30} y2={170 + 92} stroke="white" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1={250 + 30} y1={170 - 92} x2={250 + 30} y2={170 + 92} stroke="white" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2 2" />
                  
                  {/* Measurement anchors */}
                  <rect x={250 - 95} y={170 - 3} width="6" height="6" fill="#60a5fa" />
                  <rect x={250 + 89} y={170 - 3} width="6" height="6" fill="#60a5fa" />
                  <rect x={250 - 3} y={170 - 95} width="6" height="6" fill="#60a5fa" />
                  <rect x={250 - 3} y={170 + 89} width="6" height="6" fill="#60a5fa" />
                </svg>

                {/* Dynamic pixel dimension measurement badge */}
                <div className="absolute top-3 left-3 bg-slate-950/80 border border-slate-700/50 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono text-blue-400 font-bold shadow flex items-center gap-1.5 select-none">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span>184px x 184px (Circular Crop Boundary)</span>
                </div>

                {/* Instruction tooltip overlay */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-sans text-slate-400 pointer-events-none select-none">
                  ลากเพื่อปรับตำแหน่ง / เลื่อนเมาส์หรือใช้สองนิ้วเพื่อซูม
                </div>
              </div>

              {/* Slider Zoom Controller */}
              <div className="w-full max-w-md flex items-center gap-3">
                <span className="text-xs text-slate-400 font-medium">Zoom</span>
                <input
                  type="range"
                  min="1.0"
                  max="3.0"
                  step="0.01"
                  value={cropZoom}
                  onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
                />
                <span className="text-[11px] font-mono text-slate-300 w-10 text-right">
                  {Math.round(cropZoom * 100)}%
                </span>
              </div>
            </div>

            {/* Bottom Actions: Cancel & Save */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-700/50 pt-4">
              <button
                type="button"
                onClick={() => {
                  setCropImageSrc(null);
                  setCropIndex(null);
                }}
                className="px-6 py-2 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/50 rounded-lg text-xs font-sans font-bold text-slate-200 hover:text-white transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleCropSave}
                className="px-8 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-sans font-bold text-white shadow-lg shadow-blue-600/20 active:scale-98 transition-all cursor-pointer"
              >
                บันทึก
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
