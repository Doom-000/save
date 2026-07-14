import React, { useState, useEffect } from "react";
import { UserProfile, PortfolioProject, ContactInfo, StickyNote, ProjectComment } from "../types";
import { CHANNELS, CONTENT_CARDS } from "../data/contentData";
import LocationEntryForm from "./LocationEntryForm";
import { 
  Heart, MessageSquare, Send, Check, Copy, ExternalLink, 
  Plus, Trash2, Pencil, Mail, Phone, MessageCircle, 
  Facebook, Instagram, Smile, Music, Volume2, 
  VolumeX, Moon, Sun, LogOut, Search, Calculator, 
  ShieldCheck, Map, BookOpen, Clock, Tag, Award, 
  Printer, ChevronRight, ChevronLeft, RefreshCw, X, Play, Pause, Bookmark, CheckCircle2, QrCode, Palette, MapPin
, Minus, FileText, Leaf} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, doc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
import emailjs from '@emailjs/browser';
import AdminOrderNotifications from './AdminOrderNotifications';

interface PortfolioHomeProps {
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

// Predefined list of past case studies based on Chapter 5
const INITIAL_SURAPA_PROJECTS: PortfolioProject[] = [
  {
    id: "proj-1",
    title: "สถานที่ทำงานโรงพยาบาลราชพิพัฒน์",
    description: "ผู้ว่าจ้าง บริษัท สยามกรกิจ. รับเหมาจัดสวน ปลูกต้นไม้ และดูแลงานเกี่ยวกับการปรับภูมิทัศน์ (Landscape) ทั้งหมดภายในบริเวณโรงพยาบาลราชพิพัฒน์",
    fullDetail: `### โรงพยาบาลราชพิพัฒน์
    
**ผู้ว่าจ้าง:** บริษัท สยามกรกิจ
**สถานที่ทำงาน:** โรงพยาบาลราชพิพัฒน์

#### ขอบเขตงานทั้งหมด (Scope of Work)
รับเหมาจัดสวน ปลูกต้นไม้ และดูแลงานเกี่ยวกับการปรับภูมิทัศน์ (Landscape) ทั้งหมด เพื่อเพิ่มพื้นที่สีเขียวและความร่มรื่นให้กับผู้ป่วยและบุคลากรทางการแพทย์`,
    category: "ศูนย์ราชการ/โรงพยาบาล",
    images: [
      "/images/Picture1.jpg",
      "/images/Picture2.jpg",
      "/images/Picture3.jpg",
      "/images/Picture4.jpg",
      "/images/Picture5.jpg",
      "/images/Picture6.jpg",
      "/images/Picture7.jpg",
      "/images/Picture8.jpg"
    ],
    tags: ["โรงพยาบาล", "ภูมิทัศน์", "สยามกรกิจ", "ปลูกต้นไม้", "ราชพิพัฒน์"],
    likes: 128,
    likedBy: [],
    comments: [],
    dateString: "ล่าสุด"
  },
    {
    id: "proj-2",
    title: "สถานที่ทำงานมหาวิทยาลัยเกษตรศาสตร์",
    description: "รับเหมาจัดสวน ปลูกต้นไม้ และปรับภูมิทัศน์ทั้งหมด",
    fullDetail: `### มหาวิทยาลัยเกษตรศาสตร์

**ผู้ว่าจ้าง:** บริษัท หจก.จำกัดภูมิพัฒน์ คอนสตร์คชั้นแอนด์ทราฟฟิค
**สถานที่ทำงาน:** มหาวิทยาลัยเกษตรศาสตร์

#### ขอบเขตงานทั้งหมด (Scope of Work)
รับเหมาจัดสวน ปลูกต้นไม้ และดูแลงานเกี่ยวกับการปรับภูมิทัศน์ (Landscape) ทั้งหมด`,
    category: "บริษัทเอกชน",
    images: [
      "/img2/Pict1.jpg",
      "/img2/Pict2.jpg",
      "/img2/Pict3.jpg",
      "/img2/Pict4.jpg",
      "/img2/Pict5.jpg",
      "/img2/Pict6.jpg",
      "/img2/Pict7.jpg",
      "/img2/Pict8.jpg"
    ],
    tags: ["สวนดาดฟ้า", "Living Wall", "ระบบน้ำหยดอัตโนมัติ", "ไม้มวลเบา"],
    likes: 35,
    likedBy: [],
    comments: [],
    dateString: "10 มิ.ย. 2026"
  },
  {
    id: "proj-3",
    title: "สถานที่ทำงาน โครงการ PANARA บางปลา 10",
    description: "รับเหมาจัดสวน ปลูกต้นไม้ และดูแลงานเกี่ยวกับการปรับภูมิทัศน์ (Landscape)",
    fullDetail: `### โครงการ PANARA บางปลา 10

**ผู้ว่าจ้าง:** บริษัท แคลลิสโต้โฮลดิ้ง จำกัด
**สถานที่ทำงาน:** โครงการ PANARA บางปลา 10

#### ขอบเขตงานทั้งหมด (Scope of Work)
รับเหมาจัดสวน ปลูกต้นไม้ และดูแลงานเกี่ยวกับการปรับภูมิทัศน์ (Landscape) ทั้งหมด`,
    category: "บริษัทเอกชน",
    images: [
      "/img3/Pix1.jpg",
      "/img3/Pix2.jpg",
      "/img3/Pix3.jpg",
      "/img3/Pix4.jpg",
      "/img3/Pix5.jpg",
      "/img3/Pix6.jpg",
      "/img3/Pix7.jpg",
      "/img3/Pix8.jpg"
    ],
    tags: ["โครงการหมู่บ้าน", "PANARA", "จัดสวน", "ปรับภูมิทัศน์"],
    likes: 56,
    likedBy: [],
    comments: [],
    dateString: "1 มิ.ย. 2026"
  }
];

// Predefined feedback sticky notes from Chapter 6
const INITIAL_GARDEN_STICKY_NOTES: StickyNote[] = [
  {
    id: "note-1",
    authorName: "คุณสมชาย",
    text: "ราคาดีและประเมินตรงไปตรงมา ไม่มีบวกเพิ่มทีหลัง 💯",
    color: "green",
    dateString: "20 มิ.ย. 2026",
    rotation: -2
  },
  {
    id: "note-2",
    authorName: "คุณวรรณา",
    text: "ทีมช่างปลูกเก่งมาก ให้คำแนะนำการดูแลต้นไม้ดีเยี่ยม 🌿",
    color: "yellow",
    dateString: "15 มิ.ย. 2026",
    rotation: 3
  },
  {
    id: "note-3",
    authorName: "คุณหมอสุมาลี",
    text: "รับประกันต้นไม้ 3 เดือน ต้นไหนตายเปลี่ยนให้จริง ไม่ทิ้งงาน 👍",
    color: "pink",
    dateString: "1 มิ.ย. 2026",
    rotation: -1
  },
  {
    id: "note-4",
    authorName: "เจ้าหน้าที่ดูแลอาคาร",
    text: "แบบสวนสวยตรงปก วัสดุและพรรณไม้ตรงตามที่ตกลงไว้ทุกอย่าง",
    color: "blue",
    dateString: "28 พ.ค. 2026",
    rotation: 1.5
  },
  {
    id: "note-5",
    authorName: "คุณกิตติ",
    text: "ส่งงานตรงเวลา บริหารจัดการพื้นที่หน้างานสะอาดเรียบร้อย ✨",
    color: "purple",
    dateString: "12 พ.ค. 2026",
    rotation: -2.5
  },
  {
    id: "note-6",
    authorName: "คุณสิริพร",
    text: "ตอบแชทไว ให้คำปรึกษาก่อนเริ่มงานชัดเจน มืออาชีพสุดๆ",
    color: "green",
    dateString: "5 พ.ค. 2026",
    rotation: 2
  }
];

export default function PortfolioHome({ user, onUpdateUser, onLogout, onDeleteAccount }: PortfolioHomeProps) {
  // Theme state: default natural warm light, support toggling
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("surapa_dark_theme") === "true";
  });

  // Theme Color states
  const [themeColor, setThemeColor] = useState<string>(() => {
    return localStorage.getItem("surapa_theme_color") || "green";
  });
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Admin Management States
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adminStatusMsg, setAdminStatusMsg] = useState({ text: "", type: "" });
  // Admin Functions
  const handleGrantAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;
    
    setAdminStatusMsg({ text: "กำลังค้นหาและอัปเดต...", type: "loading" });
    try {
      const q = query(collection(db, "users"), where("email", "==", newAdminEmail.trim()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setAdminStatusMsg({ text: "ไม่พบบัญชีผู้ใช้นี้ในระบบ", type: "error" });
        return;
      }
      
      let updated = false;
      querySnapshot.forEach(async (userDoc) => {
        await setDoc(doc(db, "users", userDoc.id), { role: "admin" }, { merge: true });
        updated = true;
      });
      
      if (updated) {
        setAdminStatusMsg({ text: "แต่งตั้ง Admin สำเร็จ", type: "success" });
        setNewAdminEmail("");
      }
    } catch (err: any) {
      console.error(err);
      setAdminStatusMsg({ text: "เกิดข้อผิดพลาด: " + err.message, type: "error" });
    }
  };

  useEffect(() => {
    localStorage.setItem("surapa_theme_color", themeColor);
    
    let hex = '#10b981'; // default green
    switch (themeColor) {
      case 'green': hex = '#10b981'; break;
      case 'white': hex = '#71717a'; break; // zinc
      case 'gray': hex = '#6b7280'; break; // gray
      case 'yellow': hex = '#eab308'; break; // yellow
      case 'red': hex = '#ef4444'; break; // red
      case 'blue': hex = '#3b82f6'; break; // blue
      default: hex = themeColor; // custom hex
    }

    const shades = {
      50: `color-mix(in srgb, ${hex} 10%, white)`,
      100: `color-mix(in srgb, ${hex} 20%, white)`,
      200: `color-mix(in srgb, ${hex} 40%, white)`,
      300: `color-mix(in srgb, ${hex} 60%, white)`,
      400: `color-mix(in srgb, ${hex} 80%, white)`,
      500: hex,
      600: `color-mix(in srgb, ${hex} 80%, black)`,
      700: `color-mix(in srgb, ${hex} 60%, black)`,
      800: `color-mix(in srgb, ${hex} 40%, black)`,
      900: `color-mix(in srgb, ${hex} 20%, black)`,
      950: `color-mix(in srgb, ${hex} 10%, black)`,
    };
    
    Object.keys(shades).forEach(shade => {
      document.documentElement.style.setProperty(`--color-emerald-${shade}`, shades[shade as unknown as keyof typeof shades]);
    });
  }, [themeColor]);

  // Data states
  const [projects, setProjects] = useState<PortfolioProject[]>(() => {
    const saved = localStorage.getItem("surapa_projects_v8");
    return saved ? JSON.parse(saved) : INITIAL_SURAPA_PROJECTS;
  });

  // Force reset if needed
  useEffect(() => {
    const currentVersion = localStorage.getItem("surapa_version");
    if (currentVersion !== "v8") {
      setProjects(INITIAL_SURAPA_PROJECTS);
      localStorage.setItem("surapa_projects_v8", JSON.stringify(INITIAL_SURAPA_PROJECTS));
      localStorage.setItem("surapa_version", "v8");
    }
  }, []);

  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>(() => {
    const saved = localStorage.getItem("surapa_sticky_notes");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length < 6) return INITIAL_GARDEN_STICKY_NOTES;
        return parsed;
      } catch (e) {
        return INITIAL_GARDEN_STICKY_NOTES;
      }
    }
    return INITIAL_GARDEN_STICKY_NOTES;
  });

  // Search & Filters in Library
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"library" | "estimator" | "projects" | "feedback" | "package">("library");

  // Estimator States
  const [estCustomerName, setEstCustomerName] = useState("โครงการบ้านจัดสรรแสนสุข");
  const [estLocation, setEstLocation] = useState("ต.บางบัวทอง จ.นนทบุรี");
  const [estItems, setEstItems] = useState([
    { id: "p1", name: "ต้นชมพูพันธุ์ทิพย์ (สูง 2.5 ม.)", type: "ไม้ใหญ่ขุดล้อม", price: 1500, unit: "ต้น", quantity: 10 },
    { id: "p6", name: "หญ้านวลน้อยปูเรียบ", type: "หญ้าสนาม", price: 80, unit: "ตารางเมตร", quantity: 200 },
    { id: "p2", name: "ต้นไทรเกาหลี (สูง 2.0 ม.)", type: "ไม้ใหญ่ขุดล้อม", price: 800, unit: "ต้น", quantity: 5 },
  ]);
  const [estLaborCost, setEstLaborCost] = useState(8000);
  const [estTransportCost, setEstTransportCost] = useState(3500);

  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");
  const [customItemQty, setCustomItemQty] = useState("1");
  const [customItemUnit, setCustomItemUnit] = useState("ต้น");

  const DEFAULT_PLANTS = [
    { id: "p1", name: "ต้นชมพูพันธุ์ทิพย์ (สูง 2.5 ม.)", type: "ไม้ใหญ่ขุดล้อม | ไม้ดอกร่มเงาสวยพาสเทลยอดนิยม", price: 1500, unit: "ต้น" },
    { id: "p2", name: "ต้นไทรเกาหลี (สูง 2.0 ม.)", type: "ไม้ใหญ่ขุดล้อม | พุ่มใบหนาแน่นสำหรับทำกำแพงกั้นบังตา", price: 800, unit: "ต้น" },
    { id: "p3", name: "ต้นหูกวางร่มเงา (สูง 3.5 ม.)", type: "ไม้ใหญ่ขุดล้อม | แผ่กิ่งพุ่มทรงร่มเงากว้างใหญ่", price: 2500, unit: "ต้น" },
    { id: "p4", name: "ต้นลั่นทมลีลา (สูง 1.5 ม.)", type: "ไม้ใหญ่ขุดล้อม | กิ่งก้านลีลาอ่อนช้อย ดอกหอมขาวสะอาด", price: 500, unit: "ต้น" },
    { id: "p5", name: "ต้นปาล์มขวดสวย (สูง 3.0 ม.)", type: "ปาล์มประดับ | สง่างาม เหมาะสำหรับหน้าอาคารสโมสร", price: 3000, unit: "ต้น" },
    { id: "p6", name: "หญ้านวลน้อยปูเรียบ", type: "หญ้าสนาม | ทนแดดร้อน ทนเหยียบย่ำ ดูแลง่าย", price: 80, unit: "ตารางเมตร" },
    { id: "p7", name: "หญ้าญี่ปุ่นใบละเอียด", type: "หญ้าสนาม | ใบละเอียดสีเขียวเข้มพรีเมียม", price: 100, unit: "ตารางเมตร" },
    { id: "p8", name: "ไม้พุ่มประดับ (คละสายพันธุ์)", type: "ไม้พุ่มเตี้ย | พุ่มดอก ช้อนเงินทอง เฟิร์นตกแต่งคละ", price: 150, unit: "ต้น" },
  ];

  const handleAddDefaultPlant = (plant) => {
    setEstItems(prev => {
      const existing = prev.find(p => p.id === plant.id);
      if (existing) {
        return prev.map(p => p.id === plant.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { id: plant.id, name: plant.name, type: plant.type.split(" | ")[0], price: plant.price, unit: plant.unit, quantity: 1 }];
    });
  };

  const handleAddCustomItem = () => {
    if (!customItemName || !customItemPrice || !customItemQty) return;
    setEstItems(prev => [
      ...prev,
      {
        id: "c" + Date.now(),
        name: customItemName,
        type: "รายการเพิ่มเติม",
        price: Number(customItemPrice),
        unit: customItemUnit,
        quantity: Number(customItemQty)
      }
    ]);
    setCustomItemName("");
    setCustomItemPrice("");
    setCustomItemQty("1");
  };

  const updateEstItemQty = (id, newQty) => {
    if (newQty < 1) return;
    setEstItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  const removeEstItem = (id) => {
    setEstItems(prev => prev.filter(item => item.id !== id));
  };

  const itemsTotal = estItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const estGrandTotal = itemsTotal + estLaborCost + estTransportCost;

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const handleSubmitOrder = async () => {
    if (!estCustomerName || !estItems.length) {
      alert("กรุณากรอกชื่อลูกค้าและเพิ่มรายการพรรณไม้อย่างน้อย 1 รายการ");
      return;
    }
    
    setIsSubmittingOrder(true);
    try {
      // 1. Save to Firestore
      const docRef = await addDoc(collection(db, "orders"), {
        customerName: estCustomerName,
        location: estLocation,
        items: estItems,
        laborCost: estLaborCost,
        deliveryCost: estTransportCost,
        totalAmount: estGrandTotal,
        status: "new",
        createdAt: serverTimestamp(),
        read: false
      });

      // 2. Send Email via EmailJS
      try {
        let orderItemsText = "";
        estItems.forEach(item => {
          orderItemsText += `- ${item.name} (${item.quantity} ${item.unit} x ${item.price.toLocaleString()} บ.) = ${(item.quantity * item.price).toLocaleString()} บ.\n`;
        });
        
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_wzh4phm",
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_2dcgv0o",
          {
            order_id: docRef.id,
            name: estCustomerName,
            customer_name: estCustomerName,
            email: "",
            location: estLocation,
            order_items: orderItemsText,
            orders: orderItemsText,
            price: estGrandTotal,
            total_amount: estGrandTotal.toLocaleString(),
            units: estItems.reduce((acc, item) => acc + item.quantity, 0),
            cost_shipping: estTransportCost,
            'cost.shipping': estTransportCost,
            cost_labor: estLaborCost,
            'cost.tax': 0
          },
          {
            publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "B_wPHDcDEJ1FyAOGF",
          }
        );
      } catch (emailErr: any) {
        console.error("Failed to send email notification (Order was still saved):", emailErr);
        alert("คำสั่งซื้อถูกบันทึกแล้ว แต่การส่งอีเมลล้มเหลว กรุณาตรวจสอบ EmailJS credentials (Service ID, Template ID, Public Key)\nError: " + (emailErr?.text || emailErr?.message || "Invalid Request"));
      }

      // Success feedback
      alert("ส่งคำสั่งซื้อเรียบร้อย ทีมงานจะติดต่อกลับเร็วๆ นี้");
      
      // Clear form
      setEstCustomerName("");
      setEstLocation("");
      setEstItems([]);
      setEstLaborCost(8000);
      setEstTransportCost(3500);

    } catch (err) {
      console.error("Failed to submit order:", err);
      alert("เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ โปรดลองอีกครั้ง");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleCopyEstimator = () => {
    let text = `SURAPA GARDEN\nใบประเมินราคากลางและประมาณการค่าปลูก\n\n`;
    text += `ผู้สั่งจ้าง: ${estCustomerName}\nสถานที่: ${estLocation}\n\n`;
    estItems.forEach(item => {
      text += `- ${item.name} (${item.quantity} ${item.unit} x ${item.price.toLocaleString()} บ.) = ${(item.quantity * item.price).toLocaleString()} บ.\n`;
    });
    text += `\nค่าแรงและดำเนินการปลูก: ${estLaborCost.toLocaleString()} บ.\n`;
    text += `ค่าจัดส่ง: ${estTransportCost.toLocaleString()} บ.\n`;
    text += `\nยอดสุทธิรวม: ${estGrandTotal.toLocaleString()} บาท\n`;
    
    navigator.clipboard.writeText(text);
    alert("คัดลอกใบเสนอราคาแล้ว!");
  };


  // Active Reading Pane State
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);

  // Add Project Modal States
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState("");
  const [newProjDesc, setNewProjDesc] = useState("");
  const [newProjFull, setNewProjFull] = useState("");
  const [newProjCat, setNewProjCat] = useState("บ้านจัดสรร");
  const [newProjTags, setNewProjTags] = useState("");
  const [newProjImgUrl, setNewProjImgUrl] = useState("");

  // Email & Line Modal States
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showLineModal, setShowLineModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [selectedProjectForPhotos, setSelectedProjectForPhotos] = useState<PortfolioProject | null>(null);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null || !selectedProjectForPhotos?.images) return;
      const totalImages = selectedProjectForPhotos.images.length;
      if (e.key === "Escape") {
        setLightboxIndex(null);
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : totalImages - 1));
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev! < totalImages - 1 ? prev! + 1 : 0));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, selectedProjectForPhotos]);

  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailCopied, setEmailCopied] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);

  // Feedback note creator states
  const [noteAuthor, setNoteAuthor] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteColor, setNoteColor] = useState<"yellow" | "pink" | "blue" | "green" | "purple">("green");
  const [isModerating, setIsModerating] = useState(false);
  const [noteError, setNoteError] = useState("");

  const getFormToneClasses = (color: "yellow" | "pink" | "blue" | "green" | "purple") => {
    switch (color) {
      case "green":
        return {
          container: "bg-emerald-50/95 dark:bg-emerald-950/25 border-emerald-300 dark:border-emerald-800/40 shadow-sm",
          heading: "text-emerald-900 dark:text-emerald-300",
          label: "text-emerald-950 dark:text-emerald-200",
          input: "bg-white dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-700/60 text-emerald-950 dark:text-emerald-100 placeholder:text-[#4A5D53]/50 dark:placeholder:text-emerald-400/30 focus:border-emerald-600 focus:ring-[#5B6F64]/20",
          charCount: "text-emerald-700/80 dark:text-emerald-400/60",
          button: "bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white shadow-sm shadow-emerald-700/15 focus:ring-[#5B6F64]/30",
          pickerLabel: "text-emerald-900 dark:text-emerald-300"
        };
      case "yellow":
        return {
          container: "bg-amber-50/95 dark:bg-amber-950/25 border-amber-300 dark:border-amber-800/40 shadow-sm",
          heading: "text-amber-950 dark:text-amber-300",
          label: "text-amber-950 dark:text-amber-200",
          input: "bg-white dark:bg-amber-950/60 border-amber-400 dark:border-amber-700/60 text-amber-950 dark:text-amber-100 placeholder:text-amber-600/50 dark:placeholder:text-amber-400/30 focus:border-amber-600 focus:ring-amber-500/20",
          charCount: "text-amber-700/80 dark:text-amber-400/60",
          button: "bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white shadow-sm shadow-amber-700/15 focus:ring-amber-500/30",
          pickerLabel: "text-amber-950 dark:text-amber-300"
        };
      case "pink":
        return {
          container: "bg-rose-50/95 dark:bg-rose-950/25 border-rose-300 dark:border-rose-800/40 shadow-sm",
          heading: "text-rose-900 dark:text-rose-300",
          label: "text-rose-950 dark:text-rose-200",
          input: "bg-white dark:bg-rose-950/60 border-rose-400 dark:border-rose-700/60 text-rose-950 dark:text-rose-100 placeholder:text-rose-600/50 dark:placeholder:text-rose-400/30 focus:border-rose-600 focus:ring-rose-500/20",
          charCount: "text-rose-700/80 dark:text-rose-400/60",
          button: "bg-rose-700 hover:bg-rose-800 active:bg-rose-900 text-white shadow-sm shadow-rose-700/15 focus:ring-rose-500/30",
          pickerLabel: "text-rose-900 dark:text-rose-300"
        };
      case "blue":
        return {
          container: "bg-blue-50/95 dark:bg-blue-950/25 border-blue-300 dark:border-blue-800/40 shadow-sm",
          heading: "text-blue-900 dark:text-blue-300",
          label: "text-blue-950 dark:text-blue-200",
          input: "bg-white dark:bg-blue-950/60 border-blue-400 dark:border-blue-700/60 text-blue-950 dark:text-blue-100 placeholder:text-blue-600/50 dark:placeholder:text-blue-400/30 focus:border-blue-600 focus:ring-blue-500/20",
          charCount: "text-blue-700/80 dark:text-blue-400/60",
          button: "bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white shadow-sm shadow-blue-700/15 focus:ring-blue-500/30",
          pickerLabel: "text-blue-900 dark:text-blue-300"
        };
      case "purple":
      default:
        return {
          container: "bg-purple-50/95 dark:bg-purple-950/25 border-purple-300 dark:border-purple-800/40 shadow-sm",
          heading: "text-purple-900 dark:text-purple-300",
          label: "text-purple-950 dark:text-purple-200",
          input: "bg-white dark:bg-purple-950/60 border-purple-400 dark:border-purple-700/60 text-purple-950 dark:text-purple-100 placeholder:text-purple-600/50 dark:placeholder:text-purple-400/30 focus:border-purple-600 focus:ring-purple-500/20",
          charCount: "text-purple-700/80 dark:text-purple-400/60",
          button: "bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white shadow-sm shadow-purple-700/15 focus:ring-purple-500/30",
          pickerLabel: "text-purple-900 dark:text-purple-300"
        };
    }
  };

  // Ambient Sounds / LoFi controller
  const [isPlayingSounds, setIsPlayingSounds] = useState(false);
  const [soundMode, setSoundMode] = useState<"birds" | "rain" | "lofi">("birds");
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Sync states to local storage
  useEffect(() => {
    localStorage.setItem("surapa_projects_v4", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("surapa_sticky_notes", JSON.stringify(stickyNotes));
  }, [stickyNotes]);

  useEffect(() => {
    localStorage.setItem("surapa_dark_theme", String(isDarkMode));
    const root = document.getElementById("root");
    if (root) {
      if (isDarkMode) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Handle ambient background noises
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    let audioUrl = "";
    if (soundMode === "birds") {
      audioUrl = "https://assets.mixkit.co/active_storage/sfx/2034/2034-84.wav"; // Birds chirping
    } else if (soundMode === "rain") {
      audioUrl = "https://assets.mixkit.co/active_storage/sfx/2526/2526-84.wav"; // Soft Rain shower
    } else {
      audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; // Instrumental LoFi vibe
    }

    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.volume = soundMode === "lofi" ? 0.15 : 0.4;
    audioRef.current = audio;

    if (isPlayingSounds) {
      audio.play().catch(err => console.log("Audio autoplay restricted:", err));
    }

    return () => {
      audio.pause();
    };
  }, [soundMode, isPlayingSounds]);

  // Handle Article Likes
  const [likedArticles, setLikedArticles] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("surapa_liked_articles");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleLikeArticle = (id: string) => {
    setLikedArticles(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      localStorage.setItem("surapa_liked_articles", JSON.stringify(updated));
      return updated;
    });
  };

  // Article Workbook Saving
  const [articleNotes, setArticleNotes] = useState<Record<string, Record<number, string>>>(() => {
    return user.notes ? JSON.parse(JSON.stringify(user.notes)) : {};
  });

  const handleSaveWorkbookAnswer = (articleId: string, questionIndex: number, text: string) => {
    const updatedNotes = {
      ...articleNotes,
      [articleId]: {
        ...(articleNotes[articleId] || {}),
        [questionIndex]: text
      }
    };
    setArticleNotes(updatedNotes);
    onUpdateUser({
      ...user,
      notes: updatedNotes as any
    });
  };

  // Add Project Submit
  const handleAddProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjTitle.trim() || !newProjDesc.trim()) return;

    const newProj: PortfolioProject = {
      id: `proj-${Date.now()}`,
      title: newProjTitle,
      description: newProjDesc,
      fullDetail: newProjFull || `### ${newProjTitle}\n\nไม่มีรายละเอียดเพิ่มเติม`,
      category: newProjCat,
      images: [
        newProjImgUrl.trim() || "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80"
      ],
      tags: newProjTags.split(",").map(t => t.trim()).filter(t => t.length > 0),
      likes: 0,
      likedBy: [],
      comments: [],
      dateString: "วันนี้"
    };

    setProjects(prev => [newProj, ...prev]);
    setShowAddProject(false);
    
    // reset fields
    setNewProjTitle("");
    setNewProjDesc("");
    setNewProjFull("");
    setNewProjImgUrl("");
    setNewProjTags("");
  };

  const handleLikeProject = (id: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        const liked = p.likedBy.includes(user.email);
        return {
          ...p,
          likedBy: liked ? p.likedBy.filter(e => e !== user.email) : [...p.likedBy, user.email],
          likes: p.likes + (liked ? -1 : 1)
        };
      }
      return p;
    }));
  };

  // Sticky feedback notes creator
  const handleAddStickyNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setNoteError("");
    setIsModerating(true);

    try {
      const res = await fetch("/api/gemini/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: noteText })
      });
      const data = await res.json();
      
      if (data.action_recommended === "delete") {
        setNoteError(`ข้อความไม่เหมาะสม (ถูกตรวจพบว่าเป็น ${data.category}): ${data.reason}`);
        setIsModerating(false);
        return;
      }
      
      if (data.action_recommended === "hide_for_review") {
        setNoteError(`ข้อความของคุณถูกส่งเพื่อรอการตรวจสอบจากผู้ดูแลระบบ`);
        // We'll still add it locally for now or just skip, but requirement is to moderate it
        // Depending on actual app flow, maybe we don't add it. For now, let's just show the error and return.
        // Wait, if it says "ส่งเพื่อรอ", maybe just return.
        setIsModerating(false);
        return;
      }

      // If allow
      const thMonths = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
      const now = new Date();
      const formattedDate = `${now.getDate()} ${thMonths[now.getMonth()]} 2026`;
  
      const newNote: StickyNote = {
        id: `note-${Date.now()}`,
        authorName: noteAuthor.trim() || "คุณผู้ใช้งานทั่วไป",
        authorEmail: user.email,
        isAdmin: user.role === 'admin',
        text: noteText,
        color: noteColor,
        dateString: formattedDate,
        rotation: (Math.random() * 6) - 3 // slight cozy rotation between -3 and 3 degrees
      };
  
      setStickyNotes(prev => [newNote, ...prev]);
      setNoteAuthor("");
      setNoteText("");
    } catch (err) {
      console.error("Moderation check failed:", err);
      // Fallback
    } finally {
      setIsModerating(false);
    }
  };

  const handleDeleteStickyNote = (id: string) => {
    setStickyNotes(prev => prev.filter(n => n.id !== id));
  };

  // Filtering CONTENT_CARDS
  const filteredCards = CONTENT_CARDS.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          card.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          card.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesChannel = selectedChannel === "all" || card.channelId === selectedChannel;
    const matchesDiff = selectedDifficulty === "all" || card.difficulty === selectedDifficulty;

    return matchesSearch && matchesChannel && matchesDiff;
  });

  const activeArticleObj = CONTENT_CARDS.find(c => c.id === selectedArticle);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? "bg-[#080C0A] text-[#F3F4F1]" : "bg-[#F9F8F6] text-[#1C201E]"
    }`}>
      
      {/* 🌿 BRAND HEADER */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
        isDarkMode ? "bg-[#0D120F]/90 border-white/5" : "bg-[#ffffff] border-[#EAE8E2] shadow-sm"
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#4A5D53] flex items-center justify-center text-white shadow-sm shadow-emerald-700/20 overflow-hidden border border-[#EAE8E2] dark:border-white/10">
              <img src="/images/Logo1.jpg" alt="Surapa Garden Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold font-display tracking-tight text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                SURAPA GARDEN
                <span className="text-sm px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-normal font-sans">
                  ผู้รับเหมาจัดสวนครบวงจร
                </span>
              </h1>
              <p className="text-sm text-[#727875] dark:text-slate-400 font-sans font-normal mt-0.5">
                &quot;รับงานจัดสวนทุกประเภท — ติดต่อทีมงานระดับบริหารผู้มีประสบการณ์ตรง&quot;
              </p>
            </div>
          </div>

          {/* Right Controls: Ambient sound select & toggle themes */}
          <div className="flex items-center gap-4 flex-wrap justify-center">

            {/* Theme Color Selector */}
            <div className="relative">
              <button 
                onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                className="p-2 rounded-full bg-[#F4F3F0] dark:bg-slate-800 hover:bg-[#EAE8E2] dark:hover:bg-slate-700 transition-colors"
                title="เปลี่ยนสีโทน"
              >
                <Palette className="w-4 h-4 text-[#4A5D53] dark:text-emerald-400" />
              </button>
              
              <AnimatePresence>
                {showThemeDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 bg-white dark:bg-[#121614] border border-[#F4F3F0] dark:border-white/5 rounded-xl shadow-xl w-48 p-2 z-50 flex flex-col gap-1"
                  >
                    {[
                      { id: 'green', name: 'สีเขียว', hex: '#10b981' },
                      { id: 'white', name: 'สีขาว (สว่าง)', hex: '#71717a' },
                      { id: 'gray', name: 'สีเทา', hex: '#6b7280' },
                      { id: 'yellow', name: 'สีเหลือง', hex: '#eab308' },
                      { id: 'red', name: 'สีแดง', hex: '#ef4444' },
                      { id: 'blue', name: 'สีฟ้า', hex: '#3b82f6' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => { setThemeColor(t.id); setShowThemeDropdown(false); }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white dark:hover:bg-emerald-950/30 transition-colors ${themeColor === t.id ? 'bg-[#F4F3F0] dark:bg-emerald-900/40 font-semibold' : ''}`}
                      >
                        <span className="w-4 h-4 rounded-full border border-[#EAE8E2] dark:border-emerald-700" style={{ backgroundColor: t.hex }}></span>
                        <span className="text-[#3E4341] dark:text-slate-300">{t.name}</span>
                      </button>
                    ))}
                    
                    <div className="border-t border-[#F9F8F6] dark:border-white/5 my-1 pt-1">
                      <label className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-white dark:hover:bg-emerald-950/30 transition-colors cursor-pointer">
                        <input 
                          type="color" 
                          value={themeColor.startsWith('#') ? themeColor : '#10b981'}
                          onChange={(e) => setThemeColor(e.target.value)}
                          className="w-4 h-4 rounded-full overflow-hidden border-0 p-0 cursor-pointer"
                        />
                        <span className="text-[#3E4341] dark:text-slate-300">สีที่กำหนดเอง</span>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Dark Mode Toggle Button */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-[#F4F3F0] dark:bg-slate-800 hover:bg-[#EAE8E2] dark:hover:bg-slate-700 transition-colors"
              title={isDarkMode ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
              aria-label={isDarkMode ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#4A5D53]" />
              )}
            </button>

            {/* Admin Notifications */}
            {user.role === 'admin' && <AdminOrderNotifications />}
            
            {/* Profile badge & logout */}
            <div className="flex items-center gap-2 border-l pl-3 ml-1 border-[#F4F3F0] dark:border-white/10">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-8 h-8 rounded-full border border-emerald-500/30 object-cover"
              />
              <span className="text-sm font-semibold max-w-[80px] truncate hidden sm:inline text-[#3E4341] dark:text-slate-300">
                {user.name}
              </span>
              {user.role === 'admin' && (
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 mr-1 hidden sm:inline-block">
                  ADMIN
                </span>
              )}
              
              <div className="relative">
                <button 
                  onClick={() => { setShowLogoutMenu(!showLogoutMenu); setConfirmDelete(false); }}
                  className="p-2 rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1"
                  title="ตัวเลือกบัญชี"
                >
                  <LogOut className="w-4 h-4" />
                </button>
                <div className={`absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700 z-50 transition-all ${showLogoutMenu ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                   {user.role === 'admin' && (
                     <button 
                       onClick={() => { setShowAdminModal(true); setShowLogoutMenu(false); setAdminStatusMsg({text: "", type: ""}); setNewAdminEmail(""); }}
                       className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-t-lg transition-colors flex items-center gap-2 border-b border-gray-100 dark:border-slate-700"
                     >
                       <ShieldCheck className="w-4 h-4 text-emerald-500" />
                       <span>จัดการ Admin</span>
                     </button>
                   )}
                   <button 
                     onClick={onLogout}
                     className={`w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${user.role !== 'admin' ? 'rounded-t-lg' : ''}`}
                   >
                     <LogOut className="w-4 h-4" />
                     <span>ออกจากระบบ</span>
                   </button>
                   {!confirmDelete ? (
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         setConfirmDelete(true);
                       }}
                       className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-b-lg transition-colors flex items-center justify-between"
                     >
                       <span>ลบบัญชีออก</span>
                       <Trash2 className="w-4 h-4" />
                     </button>
                   ) : (
                     <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-b-lg border-t border-rose-100 dark:border-rose-900/30">
                       <p className="text-xs text-rose-600 dark:text-rose-400 mb-2 font-semibold text-center leading-tight">
                         ยืนยันการลบบัญชี?<br/><span className="font-normal text-[10px]">ข้อมูลทั้งหมดจะหายไป</span>
                       </p>
                       <div className="flex gap-2">
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             onDeleteAccount();
                           }}
                           className="flex-1 py-1 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs transition-colors"
                         >
                           ยืนยัน
                         </button>
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             setConfirmDelete(false);
                           }}
                           className="flex-1 py-1 px-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 rounded text-xs transition-colors"
                         >
                           ยกเลิก
                         </button>
                       </div>
                     </div>
                   )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* 🏡 COVER HERO SPOTLIGHT */}
      <section className={`relative py-20 px-4 border-b overflow-hidden transition-all ${
        isDarkMode ? "bg-gradient-to-b from-emerald-950/20 via-[#0d1611] to-[#0b120e] border-white/5" : "bg-gradient-to-b from-emerald-50 via-white to-[#f4f7f5] border-[#EAE8E2]"
      }`}>
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute top-10 left-10 w-52 h-52 rounded-full bg-[#4A5D53] blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-teal-500 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200/40 dark:border-white/5 text-sm text-emerald-800 dark:text-emerald-300 mb-4 font-mono"
          >
            <Award className="w-3.5 h-3.5" /> รับเหมาจัดสวนครบวงจร | ปลูกต้นไม้ | ปรับภูมิทัศน์ (Landscape)
          </motion.div>
          
          <h2 className="font-display text-5xl md:text-7xl tracking-tight leading-[1.1] font-display font-extrabold tracking-tight leading-tight max-w-3xl mx-auto mb-4 text-[#1C201E] dark:text-white">
            ทำธุรกิจรับเหมาจัดสวน ปลูกต้นไม้
            <span className="text-emerald-700 dark:text-emerald-400 block mt-2 font-display font-black">และดูแลปรับภูมิทัศน์ทั้งหมด</span>
          </h2>
          
          <p className="text-base md:text-lg text-[#3E4341] dark:text-slate-300 font-sans font-normal leading-relaxed max-w-2xl mx-auto mb-8">
            บริการรับเหมาจัดสวน ปลูกต้นไม้ และดูแลงานเกี่ยวกับการปรับภูมิทัศน์ (Landscape) ทั้งหมดอย่างครบวงจร เนรมิตพื้นที่สีเขียวที่สวยงามและสมบูรณ์แบบ
          </p>

          {/* Quick Contact Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
            
            <button 
              onClick={() => setShowLineModal(true)}
              className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-[#121614] border border-[#EAE8E2] dark:border-white/5 hover:shadow-sm hover:border-emerald-500 transition-all text-left w-full focus:outline-none"
            >
              <span className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                <MessageCircle className="w-4 h-4" />
              </span>
              <div>
                <p className="text-sm text-[#565B59] dark:text-slate-400 font-semibold">Line Official</p>
                <p className="text-sm font-semibold font-mono">@surapagarden</p>
              </div>
            </button>

            <a 
              href="https://www.facebook.com/SurapaGarden1" 
              onClick={(e) => {
                e.preventDefault();
                const target = window.innerWidth < 768 ? '_self' : '_blank';
                window.open("https://www.facebook.com/SurapaGarden1", target);
              }}
              rel="noreferrer" 
              className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-[#121614] border border-[#EAE8E2] dark:border-white/5 hover:shadow-sm hover:border-emerald-500 transition-all text-left cursor-pointer"
            >
              <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Facebook className="w-4 h-4" />
              </span>
              <div>
                <p className="text-sm text-[#565B59] dark:text-slate-400 font-semibold">Facebook Page</p>
                <p className="text-sm font-semibold">Surapa Garden</p>
              </div>
            </a>

            <button 
              onClick={() => {
                navigator.clipboard.writeText("0815814717");
                setPhoneCopied(true);
                setTimeout(() => setPhoneCopied(false), 2000);
              }}
              className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-[#121614] border border-[#EAE8E2] dark:border-white/5 hover:shadow-sm hover:border-emerald-500 transition-all text-left w-full focus:outline-none"
            >
              <span className="w-8 h-8 rounded-lg bg-[#5B6F64]/10 flex items-center justify-center text-[#5B6F64]">
                {phoneCopied ? <CheckCircle2 className="w-4 h-4 text-[#5B6F64]" /> : <Phone className="w-4 h-4" />}
              </span>
              <div>
                <p className={`text-sm font-semibold transition-colors ${phoneCopied ? 'text-[#4A5D53] dark:text-emerald-400' : 'text-[#565B59] dark:text-slate-400'}`}>
                  {phoneCopied ? "คัดลอกแล้ว" : "เบอร์โทรศัพท์ติดต่อ"}
                </p>
                <p className="text-sm font-semibold font-mono">081-581-4717</p>
              </div>
            </button>

            <button 
              onClick={() => setShowEmailModal(true)}
              className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-[#121614] border border-[#EAE8E2] dark:border-white/5 hover:shadow-sm hover:border-emerald-500 transition-all text-left w-full focus:outline-none"
            >
              <span className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Mail className="w-4 h-4" />
              </span>
              <div>
                <p className="text-sm text-[#565B59] dark:text-slate-400 font-semibold">อีเมลติดต่อบริษัท</p>
                <p className="text-sm font-semibold font-mono truncate max-w-[110px]">info@surapa...</p>
              </div>
            </button>

            <div className="col-span-2 md:col-span-4 lg:col-span-1 flex items-center gap-2 p-3 rounded-xl bg-[#4A5D53] text-white hover:bg-[#3D4C44] transition-all text-left shadow-sm">
              <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <p className="text-sm text-emerald-100">นโยบายพิเศษ</p>
                <p className="text-sm font-semibold">รับประกันคุณภาพ 3 เดือน</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 🧭 NAVIGATION TABS */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex overflow-x-auto gap-2 pb-2 border-b border-[#F4F3F0]/60 dark:border-white/10/60 scrollbar-none">
          
          <button
            onClick={() => setActiveTab("library")}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-base font-semibold font-display whitespace-nowrap transition-all ${
              activeTab === "library" 
                ? "bg-white dark:bg-[#121614] text-emerald-700 dark:text-emerald-400 border-t-2 border-emerald-600 shadow-sm" 
                : "text-[#727875] dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            ข้อมูลบริการจัดสวน
          </button>
          
          <button
            onClick={() => setActiveTab("estimator")}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-base font-semibold font-display whitespace-nowrap transition-all ${
              activeTab === "estimator" 
                ? "bg-white dark:bg-[#121614] text-emerald-700 dark:text-emerald-400 border-t-2 border-emerald-600 shadow-sm" 
                : "text-[#727875] dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300"
            }`}
          >
            <Calculator className="w-4 h-4" />
            การสั่งซื้อต้นไม้และการติดต่อเพิ่มเติม
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-base font-semibold font-display whitespace-nowrap transition-all ${
              activeTab === "projects" 
                ? "bg-white dark:bg-[#121614] text-emerald-700 dark:text-emerald-400 border-t-2 border-emerald-600 shadow-sm" 
                : "text-[#727875] dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300"
            }`}
          >
            <Map className="w-4 h-4" />
            ผลงานที่ผ่านมา
          </button>

          <button
            onClick={() => setActiveTab("feedback")}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-base font-semibold font-display whitespace-nowrap transition-all ${
              activeTab === "feedback" 
                ? "bg-white dark:bg-[#121614] text-emerald-700 dark:text-emerald-400 border-t-2 border-emerald-600 shadow-sm" 
                : "text-[#727875] dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300"
            }`}
          >
            <Smile className="w-4 h-4" />
            ความคิดเห็นลูกค้า
          </button>
          
          <button
            onClick={() => setActiveTab("package")}
            className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-base font-semibold font-display whitespace-nowrap transition-all ${
              activeTab === "package" 
                ? "bg-white dark:bg-[#121614] text-emerald-700 dark:text-emerald-400 border-t-2 border-emerald-600 shadow-sm" 
                : "text-[#727875] dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-300"
            }`}
          >
            <Award className="w-4 h-4" />
            สมัครแพ็คเกจ
          </button>

        </div>
      </div>

      {/* 🌿 MAIN BODY / TABS ROUTER */}
      <main className="max-w-7xl mx-auto px-4 py-16 relative">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: LIBRARY */}
          {activeTab === "library" && (
            <motion.div
              key="library-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Grid with Left-Side Main Content (8 cols) and Right-Side Widgets (4 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Article Search / Cards Container */}
                <div className="lg:col-span-8 space-y-6">
                
                  {/* Search & Difficulty Filter Row */}
                  <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-[#121614] p-4 rounded-xl border border-[#EAE8E2] dark:border-white/5 shadow-sm">
                    
                    {/* Search Bar */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-[#565B59] dark:text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="ค้นหาบริการจัดสวน, ต้นไม้, หรือการปรับภูมิทัศน์..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-base rounded-xl bg-white dark:bg-slate-900/50 border border-[#EAE8E2] dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-[#5B6F64] text-[#1C201E] dark:text-white placeholder:text-[#727875]"
                      />
                    </div>

                    {/* Difficulty Select Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#2A2E2C] dark:text-slate-400 font-semibold whitespace-nowrap">ระดับผู้เรียน:</span>
                      <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="text-sm px-3 py-2 rounded-xl bg-white dark:bg-slate-900/50 border border-[#EAE8E2] dark:border-white/5 focus:outline-none focus:ring-1 focus:ring-[#5B6F64] text-[#1C201E] dark:text-slate-200 font-semibold"
                      >
                        <option value="all">ทั้งหมด (All Levels)</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                  </div>

                {/* Grid of Manual Cards */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCards.length > 0 ? (
                    filteredCards.map((card) => {
                      const channelObj = CHANNELS.find(ch => ch.id === card.channelId);
                      const isLiked = likedArticles[card.id];
                      
                      return (
                        <div 
                          key={card.id}
                          className={`p-5 rounded-xl border transition-all hover:scale-[1.01] hover:shadow-sm cursor-pointer flex flex-col justify-between ${
                            selectedArticle === card.id 
                              ? "bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-600 ring-2 ring-[#5B6F64]/10" 
                              : "bg-white dark:bg-[#121614] border-[#EAE8E2] dark:border-emerald-900/20 shadow-sm"
                          }`}
                          onClick={() => setSelectedArticle(card.id)}
                        >
                          <div>
                            {/* Card top badges */}
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <span className={`text-sm uppercase font-semibold tracking-widest px-2.5 py-1 rounded-full ${
                                card.difficulty === "Beginner" ? "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300" :
                                card.difficulty === "Intermediate" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" :
                                "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                              }`}>
                                {card.difficulty}
                              </span>

                              <span className="text-sm text-[#727875] dark:text-slate-400 font-mono font-medium">
                                {card.readTime}
                              </span>
                            </div>

                            {/* Main Title & Channel */}
                            <h3 className="font-display text-base md:text-lg font-semibold font-display text-[#1C201E] dark:text-slate-100 line-clamp-2 hover:text-[#4A5D53] mb-1.5 leading-snug">
                              {card.title}
                            </h3>

                            {/* Channel parent identifier */}
                            <p className="text-sm text-emerald-700 dark:text-emerald-400 font-semibold font-display mb-3 flex items-center gap-1">
                              <Tag className="w-3 h-3" /> {channelObj?.name || "ความรู้อื่นๆ"}
                            </p>

                            <p className="text-sm text-[#565B59] dark:text-slate-300 font-sans font-normal line-clamp-3 mb-4 leading-relaxed">
                              {card.description}
                            </p>
                          </div>

                          {/* Footer Likes, Views & action button */}
                          <div className="flex items-center justify-between pt-3 border-t border-[#F9F8F6] dark:border-white/5 mt-auto">
                            <span className="text-sm text-[#727875] dark:text-slate-400 font-mono font-medium">
                              {card.views || "120 views"}
                            </span>
                            
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLikeArticle(card.id);
                                }}
                                className={`flex items-center gap-1 p-1 rounded-full text-sm hover:bg-[#F4F3F0] dark:hover:bg-slate-800 transition-all ${
                                  isLiked ? "text-rose-500" : "text-[#727875] dark:text-slate-400"
                                }`}
                              >
                                <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                                <span className="font-mono">{isLiked ? "1" : "0"}</span>
                              </button>

                              <span className="text-sm font-semibold text-[#4A5D53] dark:text-emerald-400 flex items-center gap-0.5 hover:underline">
                                อ่านต่อ <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>

                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-2 text-center py-20 bg-white dark:bg-[#121614] rounded-xl border border-[#F4F3F0]/40 border-dashed">
                      <p className="text-[#565B59] dark:text-slate-400 text-base font-semibold">ไม่พบบริการหรือผลงานตรงตามที่ค้นหา</p>
                      <button 
                        onClick={() => { setSearchQuery(""); setSelectedChannel("all"); setSelectedDifficulty("all"); }}
                        className="text-[#4A5D53] dark:text-emerald-400 font-semibold text-sm mt-2 underline"
                      >
                        รีเซ็ตการกรองทั้งหมด
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Channels Navigation & Article Detail Panel */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* 1. Category channels list */}
                <div className="bg-white dark:bg-[#121614] p-5 rounded-xl border border-[#EAE8E2] dark:border-white/5 shadow-sm">
                  <h3 className="font-display text-sm uppercase tracking-widest text-[#3E4341] dark:text-slate-400 font-black mb-4 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    หมวดบริการ 3 หมวดหลัก
                  </h3>

                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedChannel("all")}
                      className={`w-full text-left p-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-all ${
                        selectedChannel === "all" 
                          ? "bg-emerald-700 text-white" 
                          : "bg-[#F4F3F0] dark:bg-slate-900/50 text-[#1C201E] dark:text-slate-300 hover:bg-[#EAE8E2] dark:hover:bg-slate-800"
                      }`}
                    >
                      <span>📂 ดูทุกหมวดคู่มือธุรกิจ</span>
                      <span className="font-mono text-sm opacity-90">12 บท</span>
                    </button>

                    {CHANNELS.map((ch) => {
                      const count = CONTENT_CARDS.filter(c => c.channelId === ch.id).length;
                      return (
                        <button
                          key={ch.id}
                          onClick={() => setSelectedChannel(ch.id)}
                          className={`w-full text-left p-3 rounded-xl border transition-all text-sm flex flex-col gap-1 ${
                            selectedChannel === ch.id 
                              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-600 text-emerald-800 dark:text-emerald-300 font-semibold" 
                              : "bg-white dark:bg-transparent border-[#EAE8E2] dark:border-white/5 text-[#1C201E] dark:text-slate-300 hover:bg-white dark:hover:bg-emerald-950/10 font-semibold"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-[#1C201E] dark:text-slate-100">{ch.name}</span>
                            <span className="font-mono text-sm text-emerald-800 dark:text-emerald-400 font-semibold">{count} บทเรียน</span>
                          </div>
                          <p className="text-sm text-[#3E4341] dark:text-slate-400 truncate max-w-[260px] font-normal">
                            {ch.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Interactive Plant Warranty Rule highlights */}
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-emerald-950/20 dark:to-teal-950/10 p-5 rounded-xl border border-teal-200 dark:border-teal-900/40 shadow-sm">
                  <h4 className="text-sm font-semibold text-teal-800 dark:text-teal-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    🛡️ นโยบายรับประกันพรรณไม้ 3 เดือน
                  </h4>
                  <p className="text-sm text-[#2A2E2C] dark:text-slate-300 leading-relaxed mb-3">
                    ต้นไม้ใหญ่และหญ้าสนามที่ปลูกโดยทีมงาน Surapa Garden จะได้รับการรับประกันคุณภาพเปลี่ยนต้นใหม่ให้ทันทีหากเสียหายจากการปลูกไม่ตรงตามเกณฑ์มาตรฐาน!
                  </p>
                  <button 
                    onClick={() => { setSelectedArticle("sg-04"); }}
                    className="text-sm text-teal-700 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    อ่านนโยบายคุ้มครองเพิ่มเติม <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div> {/* Close Right Column */}

            </div> {/* Close grid columns */}

             {/* CLIENT FEEDBACK BOARD */}
             <div className="space-y-6 pt-6 border-t border-[#F4F3F0]/40 dark:border-emerald-900/20">
               
               {/* Board Header Section with Pin Emoji */}
               <div className="flex items-center gap-3 text-left py-2">
                 <span className="text-3xl" role="img" aria-label="pin">📌</span>
                 <h2 className="font-display text-2xl md:text-3xl font-black tracking-tight text-[#2A2E2C] dark:text-white uppercase">
                   ความคิดเห็นจากลูกค้า / CLIENT FEEDBACK BOARD
                 </h2>
               </div>
 
               {/* 2-Column Grid Layout: Input Form (Left) and Sticky Notes Board (Right) */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                 
                 {/* Left Side: Sticker Creator Form */}
                 <div className={`lg:col-span-4 border rounded-xl p-5 shadow-xl text-left space-y-4 transition-all duration-300 ${getFormToneClasses(noteColor).container}`}>
                   <div className="flex items-center gap-2">
                     <span className="text-xl">😊</span>
                     <h3 className={`font-display font-semibold text-base md:text-lg transition-colors ${getFormToneClasses(noteColor).heading}`}>
                       ฝากความคิดเห็นถึงเราได้นะครับ!
                     </h3>
                   </div>
 
                   <form onSubmit={handleAddStickyNote} className="space-y-4">
                     {/* Author Name */}
                     <div>
                       <label className={`block text-sm md:text-base font-semibold mb-1.5 transition-colors ${getFormToneClasses(noteColor).label}`}>
                         ชื่อผู้ฝากข้อความ
                       </label>
                       <input 
                         type="text" 
                         required
                         placeholder="เช่น คุณสมชาย, บริษัท ABC..."
                         value={noteAuthor}
                         onChange={(e) => setNoteAuthor(e.target.value)}
                         className={`w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 transition-all duration-300 ${getFormToneClasses(noteColor).input}`}
                       />
                     </div>
 
                     {/* Note Content */}
                     <div>
                       <label className={`block text-sm md:text-base font-semibold mb-1.5 transition-colors ${getFormToneClasses(noteColor).label}`}>
                         ข้อความในโน้ต (ตัวอักษรไม่เกิน 80 ตัว)
                       </label>
                       <textarea 
                         required
                         maxLength={80}
                         placeholder="เขียนรีวิวหรือฝากความคิดเห็นสั้นๆ ถึงเรา..."
                         rows={3}
                         value={noteText}
                         onChange={(e) => setNoteText(e.target.value)}
                         className={`w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 transition-all duration-300 ${getFormToneClasses(noteColor).input}`}
                       />
                       <div className={`text-right text-sm mt-1 transition-colors ${getFormToneClasses(noteColor).charCount}`}>
                         {noteText.length}/80 ตัวอักษร
                       </div>
                     </div>
 
                     {/* Color Picker circles */}
                     <div>
                       <label className={`block text-sm md:text-base font-semibold mb-2 transition-colors ${getFormToneClasses(noteColor).label}`}>
                         เลือกสีสติ๊กเกอร์
                       </label>
                       <div className="flex items-center gap-2.5">
                         {[
                           { value: "yellow", class: "bg-[#fef9c3] border-amber-300", accent: "ring-2 ring-amber-400" },
                           { value: "pink", class: "bg-[#fce7f3] border-rose-300", accent: "ring-2 ring-rose-400" },
                           { value: "blue", class: "bg-[#dbeafe] border-blue-300", accent: "ring-2 ring-blue-400" },
                           { value: "green", class: "bg-[#dcfce7] border-emerald-300", accent: "ring-2 ring-emerald-400" },
                           { value: "purple", class: "bg-[#f3e8ff] border-purple-300", accent: "ring-2 ring-purple-400" }
                         ].map((col) => (
                           <button
                             key={col.value}
                             type="button"
                             onClick={() => setNoteColor(col.value as any)}
                             className={`w-7 h-7 rounded-full transition-all border ${col.class} ${
                               noteColor === col.value 
                                 ? `${col.accent} scale-110 shadow-sm` 
                                 : "hover:scale-[1.03] opacity-80"
                             }`}
                             title={`สี${col.value}`}
                           />
                         ))}
                       </div>
                     </div>
 
                    {noteError && (
                      <div className="text-rose-500 text-sm bg-rose-50 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50 p-3 rounded-lg flex items-start gap-2">
                        <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                        <span>{noteError}</span>
                      </div>
                    )}

                     {/* Submit Button */}
                     <button 
                       type="submit" 
                       disabled={isModerating}
                       className={`w-full font-semibold text-sm py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow-lg flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${getFormToneClasses(noteColor).button}`}
                     >
                       {isModerating ? (
                         <>
                           <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                           กำลังตรวจสอบข้อความ...
                         </>
                       ) : (
                         <>
                           <Send className="w-3.5 h-3.5" />
                           แปะกระดานโน้ต
                         </>
                       )}
                     </button>
                   </form>
                 </div>

                {/* Right Side: The Dotted Board container */}
                <div className="lg:col-span-8 border-dashed border-2 border-[#EAE8E2] dark:border-slate-700/50 rounded-xl p-5 md:p-6 min-h-[440px] relative bg-transparent text-left">
                  
                  {stickyNotes.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#727875] space-y-2">
                      <Smile className="w-8 h-8 opacity-30" />
                      <p className="text-sm">กระดานว่างเปล่า ยินดีต้อนรับฟีดแบกแรกของคุณ!</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
                    <AnimatePresence>
                      {stickyNotes.map((note) => {
                        // Map colors to vibrant sticky post-it styles
                        const isYellow = note.color === "yellow";
                        const isPink = note.color === "pink";
                        const isBlue = note.color === "blue";
                        const isGreen = note.color === "green";

                        const styleMap = 
                          isGreen ? { bg: "bg-[#dcfce7]", text: "text-[#064e3b]", border: "border-emerald-200/50", authorColor: "text-emerald-800" } :
                          isYellow ? { bg: "bg-[#fef9c3]", text: "text-[#78350f]", border: "border-amber-200/50", authorColor: "text-amber-800" } :
                          isPink ? { bg: "bg-[#fce7f3]", text: "text-[#9d174d]", border: "border-rose-200/50", authorColor: "text-rose-800" } :
                          isBlue ? { bg: "bg-[#dbeafe]", text: "text-[#1e3a8a]", border: "border-blue-200/50", authorColor: "text-blue-800" } :
                          { bg: "bg-[#f3e8ff]", text: "text-[#581c87]", border: "border-purple-200/50", authorColor: "text-purple-800" };

                        // Clean stacked date splits to match the design (e.g. "20 มิ.ย. 2026")
                        const dateParts = note.dateString.split(" ");
                        const formattedDayMonth = dateParts.length >= 2 ? `${dateParts[0]} ${dateParts[1]}` : note.dateString;
                        const formattedYear = dateParts.length >= 3 ? dateParts[2] : "";

                        return (
                          <motion.div
                            key={note.id}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ rotate: `${note.rotation || 0}deg` }}
                            className={`p-5 rounded-lg border shadow-lg relative flex flex-col justify-between min-h-[190px] hover:scale-[1.03] hover:shadow-xl transition-all duration-300 group ${styleMap.bg} ${styleMap.border} ${styleMap.text}`}
                          >
                            {/* Pin decoration */}
                            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#f43f5e] shadow-sm border border-white/60 z-10"></div>

                            {/* Delete Button - Show only for admin or creator */}
                            {(user.role === 'admin' || (note.authorEmail && note.authorEmail === user.email)) && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteStickyNote(note.id);
                                }}
                                className="absolute top-2.5 right-2.5 text-rose-600 hover:text-white hover:bg-rose-600 transition-all p-1.5 rounded-full bg-white/95 dark:bg-[#0c120e]/80 shadow-sm border border-rose-200/50 dark:border-rose-950/40 z-20 flex items-center justify-center cursor-pointer"
                                title="ดึงโน้ตนี้ออก"
                              >
                                <X className="w-3.5 h-3.5 stroke-[3px]" />
                              </button>
                            )}

                            {/* Content text */}
                            <div className="flex-1 flex items-center pt-2">
                              <p className="text-sm md:text-base font-semibold text-left leading-relaxed font-sans whitespace-pre-line">
                                &quot;{note.text}&quot;
                              </p>
                            </div>

                            {/* Footer */}
                            <div className={`flex items-end justify-between border-t border-black/5 pt-2.5 mt-3 text-sm ${styleMap.authorColor}`}>
                              <div className="text-left font-sans flex flex-col min-w-0 flex-1 pr-2">
                                <div className="font-semibold truncate">From: {note.authorName}</div>
                                {note.isAdmin && (
                                  <div className="mt-0.5"><span className="text-[10px] font-bold bg-black/10 px-1.5 py-0.5 rounded-sm uppercase">Admin</span></div>
                                )}
                                {user.role === 'admin' && note.authorEmail && (
                                  <div className="text-[9px] opacity-70 mt-0.5 truncate">{note.authorEmail}</div>
                                )}
                              </div>
                              <div className="text-right font-mono font-semibold leading-tight flex flex-col items-end shrink-0 opacity-80">
                                <div>{formattedDayMonth}</div>
                                {formattedYear && <div className="text-[8px] opacity-75">{formattedYear}</div>}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                </div>

              </div>

            </div>

          </motion.div>
          )}

          {/* TAB 2: INTERACTIVE QUOTE ESTIMATOR */}
          {activeTab === "estimator" && (
            <motion.div
              key="estimator-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* 🚨 DEMO NOTICE BANNER */}
              <div className="bg-rose-500 text-white p-4 rounded-2xl text-sm md:text-base font-semibold flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm border border-rose-600/50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <span className="text-left">ระบบนี้เป็นแค่ตัวอย่างเท่านั้น หากสนใจอยากใช้งานระบบจริง หรือต้องการสอบถามเพิ่มเติม โปรดติดต่อทางเพจ Facebook นะครับ</span>
                </div>
                <a 
                  href="https://www.facebook.com/SurapaGarden1"
                  onClick={(e) => {
                    e.preventDefault();
                    const target = window.innerWidth < 768 ? '_self' : '_blank';
                    window.open("https://www.facebook.com/SurapaGarden1", target);
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-xl transition-colors shadow-sm whitespace-nowrap font-bold shrink-0"
                >
                  <Facebook className="w-5 h-5" />
                  ติดต่อเพจ Facebook
                </a>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column: Form & Selection */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Customer Info */}
                  <div className="bg-[#121614] border border-white/5 rounded-2xl p-6 space-y-4 shadow-sm">
                    <h3 className="font-display text-base font-bold text-emerald-400 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      ข้อมูลเบื้องต้นของลูกค้าสำหรับงานเสนอราคา
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">ชื่อลูกค้า / โครงการที่ต้องการจัดสวน:</label>
                        <input 
                          type="text" 
                          value={estCustomerName}
                          onChange={(e) => setEstCustomerName(e.target.value)}
                          className="w-full bg-[#1A1F1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">สถานที่พิกัดดำเนินโครงการ:</label>
                        <input 
                          type="text" 
                          value={estLocation}
                          onChange={(e) => setEstLocation(e.target.value)}
                          className="w-full bg-[#1A1F1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Standard Plants Selection */}
                  <div className="bg-[#121614] border border-white/5 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex justify-between items-end border-b border-white/5 pb-3">
                      <div>
                        <h3 className="font-display text-base font-bold text-emerald-400 flex items-center gap-2">
                          <Leaf className="w-5 h-5" />
                          พรรณไม้อ้างอิงมาตรฐาน (ราคากลางปี 2026)
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">คลิกปุ่มสีเขียวเพื่อเพิ่มพันธุ์ไม้ดังกล่าวเข้าไปในสลิปประเมินราคาด้านข้าง</p>
                      </div>
                      <div className="hidden sm:block text-xs font-mono text-indigo-400 opacity-80">SG-06 Database</div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {DEFAULT_PLANTS.map((plant) => (
                        <div key={plant.id} className="bg-[#1A1F1C] border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                          <div className="space-y-1 flex-1 pr-3">
                            <h4 className="text-sm font-bold text-white">{plant.name}</h4>
                            <p className="text-[10px] text-slate-400 line-clamp-2">{plant.type}</p>
                            <p className="text-xs font-mono text-emerald-400 font-semibold pt-1">{plant.price.toLocaleString()} บ. / {plant.unit}</p>
                          </div>
                          <button 
                            onClick={() => handleAddDefaultPlant(plant)}
                            className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Item Form */}
                  <div className="bg-[#121614] border border-white/5 rounded-2xl p-6 space-y-4 shadow-sm">
                    <h3 className="font-display text-base font-bold text-emerald-400 flex items-center gap-2 border-b border-white/5 pb-3">
                      <Plus className="w-5 h-5" />
                      เพิ่มพรรณไม้อื่นๆ หรือบริการเพิ่มเติมแบบกำหนดเอง (Custom Item)
                    </h3>
                    <div className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-12 sm:col-span-5 space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">ชื่อรายการ:</label>
                        <input 
                          type="text" 
                          placeholder="เช่น ต้นทองกวาวฟอร์มสวย 4 เมตร"
                          value={customItemName}
                          onChange={(e) => setCustomItemName(e.target.value)}
                          className="w-full bg-[#1A1F1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-3 space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">ราคาต่อชิ้น (บ.):</label>
                        <input 
                          type="number" 
                          placeholder="0"
                          value={customItemPrice}
                          onChange={(e) => setCustomItemPrice(e.target.value)}
                          className="w-full bg-[#1A1F1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">จำนวนหน่วย:</label>
                        <input 
                          type="number" 
                          min="1"
                          value={customItemQty}
                          onChange={(e) => setCustomItemQty(e.target.value)}
                          className="w-full bg-[#1A1F1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-2 flex items-center gap-2">
                         <div className="space-y-1.5 flex-1">
                          <label className="text-xs font-semibold text-slate-300">หน่วย:</label>
                          <input 
                            type="text" 
                            value={customItemUnit}
                            onChange={(e) => setCustomItemUnit(e.target.value)}
                            className="w-full bg-[#1A1F1C] border border-white/10 rounded-lg px-2 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                       <button 
                          onClick={handleAddCustomItem}
                          disabled={!customItemName || !customItemPrice}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                          เพิ่ม
                        </button>
                    </div>
                  </div>

                </div>

                {/* Right Column: Receipt / Bill */}
                <div className="lg:col-span-5 relative">
                  <div className="sticky top-6 bg-[#121614] border border-white/5 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-3rem)]">
                    
                    {/* Bill Header */}
                    <div className="p-6 bg-gradient-to-br from-[#0c120e] to-[#121614] border-b border-emerald-900/50 relative overflow-hidden">
                      <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                      <h2 className="font-display text-xl font-black text-emerald-400 flex items-center gap-2 relative z-10">
                        <Leaf className="w-6 h-6" />
                        SURAPA GARDEN
                      </h2>
                      <p className="text-xs text-slate-400 mt-1 relative z-10">ใบประเมินราคาพรรณไม้เบื้องต้น</p>
                    </div>

                    {/* Bill Items */}
                    <div className="flex-1 overflow-y-auto min-h-0 p-6 custom-scrollbar">
                      {estItems.length === 0 ? (
                        <div className="text-center text-slate-500 text-sm py-8 border border-dashed border-white/10 rounded-xl">
                          ยังไม่มีรายการพรรณไม้<br/>กรุณาเพิ่มรายการจากด้านซ้าย
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {estItems.map((item) => (
                            <div key={item.id} className="group relative pr-8">
                              <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                  <div className="text-sm font-bold text-white">{item.name}</div>
                                  <div className="text-[10px] text-slate-400">{item.type}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center bg-[#1A1F1C] rounded-md border border-white/10">
                                      <button onClick={() => updateEstItemQty(item.id, item.quantity - 1)} className="px-2 py-0.5 text-slate-400 hover:text-white">-</button>
                                      <span className="text-xs font-mono w-6 text-center">{item.quantity}</span>
                                      <button onClick={() => updateEstItemQty(item.id, item.quantity + 1)} className="px-2 py-0.5 text-slate-400 hover:text-white">+</button>
                                    </div>
                                    <span className="text-xs text-slate-400">x {item.price.toLocaleString()} บ. / {item.unit}</span>
                                  </div>
                                </div>
                                <div className="text-sm font-mono font-semibold text-emerald-300 shrink-0 mt-1">
                                  {(item.quantity * item.price).toLocaleString()} บ.
                                </div>
                              </div>
                              <button 
                                onClick={() => removeEstItem(item.id)}
                                className="absolute top-1 right-0 p-1.5 text-rose-500/70 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bill Footer & Totals */}
                    <div className="p-6 bg-[#0D120F] border-t border-white/5 flex flex-col gap-6">
                      
                      {/* Labor & Transport */}
                      <div className="flex flex-col gap-6">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between text-xs font-semibold text-slate-300 gap-2">
                            <span className="leading-relaxed">ค่าแรงลมดิน พรวน และดำเนินการปลูก:</span>
                            <span className="font-mono text-emerald-400 shrink-0">{estLaborCost.toLocaleString()} บ.</span>
                          </div>
                          <input 
                            type="range" min="0" max="50000" step="1000"
                            value={estLaborCost} onChange={(e) => setEstLaborCost(Number(e.target.value))}
                            className="w-full accent-emerald-500 h-1.5 bg-[#1A1F1C] rounded-full appearance-none cursor-pointer"
                          />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-start justify-between text-xs font-semibold text-slate-300 gap-2">
                            <span className="leading-relaxed">ค่าจัดส่งและยานพาหนะเครื่องจักรล้อม:</span>
                            <span className="font-mono text-emerald-400 shrink-0">{estTransportCost.toLocaleString()} บ.</span>
                          </div>
                          <input 
                            type="range" min="0" max="30000" step="500"
                            value={estTransportCost} onChange={(e) => setEstTransportCost(Number(e.target.value))}
                            className="w-full accent-emerald-500 h-1.5 bg-[#1A1F1C] rounded-full appearance-none cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Summary box */}
                      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 space-y-2">
                        <div className="flex items-start gap-2 text-xs font-bold text-blue-400 mb-3">
                          <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">เงื่อนไขการชำระเงินตามสัดส่วนความเสี่ยง (SG-03):</span>
                        </div>
                        <div className="flex justify-between items-center gap-2 text-[11px] text-slate-300">
                          <span className="truncate">งวดที่ 1 (มัดจำแรกเข้า 30%):</span>
                          <span className="font-mono font-bold shrink-0">{(estGrandTotal * 0.3).toLocaleString()} บ.</span>
                        </div>
                        <div className="flex justify-between items-center gap-2 text-[11px] text-slate-300">
                          <span className="truncate">งวดที่ 2 (ส่งของลงดิน 40%):</span>
                          <span className="font-mono font-bold shrink-0">{(estGrandTotal * 0.4).toLocaleString()} บ.</span>
                        </div>
                        <div className="flex justify-between items-center gap-2 text-[11px] text-slate-300">
                          <span className="truncate">งวดที่ 3 (ส่งมอบสมบูรณ์ 30%):</span>
                          <span className="font-mono font-bold shrink-0">{(estGrandTotal * 0.3).toLocaleString()} บ.</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 pb-2 border-t border-white/10 gap-2">
                        <div className="text-sm font-bold text-slate-200">ยอดสุทธิรวมพรรณไม้และค่าแรงปลูก:</div>
                        <div className="text-xl sm:text-2xl font-display font-black text-emerald-400">{estGrandTotal.toLocaleString()} บาท</div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <button 
                          onClick={handleCopyEstimator}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          คัดลอกใบเสนอราคาเต็มรูปแบบลง Clipboard
                        </button>
                        <button 
                          onClick={handleSubmitOrder}
                          disabled={isSubmittingOrder}
                          className="w-full py-3 bg-[#4A5D53] hover:bg-[#3E4341] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                          {isSubmittingOrder ? (
                            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          ส่งคำสั่งซื้อ / Submit Order
                        </button>
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 3: PAST CASE STUDIES */}
          {activeTab === "projects" && (
            <motion.div
              key="projects-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-[#2A2E2C] dark:text-slate-100 flex items-center gap-1.5">
                    <Map className="w-5 h-5 text-[#4A5D53]" />
                    บทที่ 5 — ผลงานโครงการภูมิทัศน์จัดสวนที่ผ่านมา
                  </h3>
                  <p className="text-sm text-[#727875]">รวม 3 ผลงานชิ้นเอกที่สะท้อนคุณภาพงานบ้านจัดสรร สำนักงาน และ Healing Garden</p>
                </div>

                {user.role === 'admin' && (
                  <button
                    onClick={() => setShowAddProject(!showAddProject)}
                    className="px-4 py-2 bg-[#4A5D53] text-white text-sm font-semibold rounded-xl flex items-center gap-1.5 hover:bg-[#3D4C44] transition-all"
                  >
                    <Plus className="w-4 h-4" /> บันทึกรายงานผลงานเพิ่ม
                  </button>
                )}
              </div>

              {/* Add project form modal / panel */}
              {user.role === 'admin' && showAddProject && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-white dark:bg-[#121614] p-5 rounded-xl border border-emerald-500/30 shadow-sm text-left space-y-4"
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="text-sm font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">กรอกประวัติผลงานโครงการใหม่</h4>
                    <button onClick={() => setShowAddProject(false)} className="text-[#727875] dark:text-slate-400 hover:text-[#565B59] dark:hover:text-slate-300"><X className="w-4 h-4" /></button>
                  </div>

                  <form onSubmit={handleAddProjectSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#565B59] dark:text-slate-400 font-semibold mb-1">ชื่อโครงการ:</label>
                      <input 
                        type="text" 
                        required
                        placeholder="เช่น เดอะคอนเนค ทาวน์โฮม - รั้วต้นไม้ขุดล้อม"
                        value={newProjTitle}
                        onChange={(e) => setNewProjTitle(e.target.value)}
                        className="w-full text-sm px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-[#F4F3F0] dark:border-white/10 text-[#2A2E2C] dark:text-white focus:ring-1 focus:ring-[#5B6F64] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#565B59] dark:text-slate-400 font-semibold mb-1">หมวดหมู่โครงการ:</label>
                      <select 
                        value={newProjCat}
                        onChange={(e) => setNewProjCat(e.target.value)}
                        className="w-full text-sm px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-[#F4F3F0] dark:border-white/10 text-[#2A2E2C] dark:text-slate-300 focus:ring-1 focus:ring-[#5B6F64] focus:outline-none font-semibold"
                      >
                        <option value="บ้านจัดสรร">บ้านจัดสรร / ที่พักอาศัย</option>
                        <option value="บริษัทเอกชน">บริษัทเอกชน / โรงงานอุตสาหกรรม</option>
                        <option value="ศูนย์ราชการ">ศูนย์ราชการ / โรงพยาบาลรัฐ</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm text-[#565B59] dark:text-slate-400 font-semibold mb-1">คำอธิบายภาพรวมย่อ:</label>
                      <input 
                        type="text" 
                        required
                        placeholder="อธิบายสรุปสั้นๆ สำหรับแสดงหน้าแรก"
                        value={newProjDesc}
                        onChange={(e) => setNewProjDesc(e.target.value)}
                        className="w-full text-sm px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-[#F4F3F0] dark:border-white/10 text-[#2A2E2C] dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm text-[#565B59] dark:text-slate-400 font-semibold mb-1">รายละเอียดและขอบเขตงานฉบับเต็ม (Full Detail):</label>
                      <textarea 
                        placeholder="ระบุ สเปคพรรณไม้, ขนาดหน้าดิน, ความเห็นของลูกค้าโครงการ"
                        rows={4}
                        value={newProjFull}
                        onChange={(e) => setNewProjFull(e.target.value)}
                        className="w-full text-sm px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-[#F4F3F0] dark:border-white/10 text-[#2A2E2C] dark:text-white font-mono focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#565B59] dark:text-slate-400 font-semibold mb-1">คีย์เวิร์ดแท็ก (คั่นด้วยคอมมา):</label>
                      <input 
                        type="text" 
                        placeholder="เช่น ไม้ขุดล้อม, ปูหญ้า, ค้ำยัน, จัดสวนดาดฟ้า"
                        value={newProjTags}
                        onChange={(e) => setNewProjTags(e.target.value)}
                        className="w-full text-sm px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-[#F4F3F0] dark:border-white/10 text-[#2A2E2C] dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-[#565B59] dark:text-slate-400 font-semibold mb-1">ลิงก์ URL รูปภาพหน้างาน (Unsplash):</label>
                      <input 
                        type="text" 
                        placeholder="https://images.unsplash.com/..."
                        value={newProjImgUrl}
                        onChange={(e) => setNewProjImgUrl(e.target.value)}
                        className="w-full text-sm px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-[#F4F3F0] dark:border-white/10 text-[#2A2E2C] dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setShowAddProject(false)}
                        className="px-4 py-2 text-sm rounded-lg border text-[#727875] hover:bg-[#F4F3F0] dark:hover:bg-slate-800"
                      >
                        ยกเลิก
                      </button>
                      <button 
                        type="submit" 
                        className="px-4 py-2 text-sm rounded-lg bg-[#4A5D53] text-white font-semibold hover:bg-[#3D4C44]"
                      >
                        บันทึกขึ้นระบบ
                      </button>
                    </div>

                  </form>
                </motion.div>
              )}

              {/* Grid of Projects */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {projects.map((proj) => {
                  const hasLiked = proj.likedBy.includes(user.email);
                  return (
                    <div 
                      key={proj.id}
                      className="bg-white dark:bg-[#121614] rounded-xl border border-[#F4F3F0]/50 dark:border-white/5 overflow-hidden hover:shadow-sm hover:scale-[1.01] transition-all flex flex-col justify-between"
                    >
                      <div 
                        className="cursor-pointer group"
                        onClick={() => setSelectedProjectForPhotos(proj)}
                      >
                        {/* Img carousel */}
                        <div className="relative h-48 w-full bg-[#F4F3F0] dark:bg-slate-800 overflow-hidden">
                          {proj.images && proj.images.length > 0 ? (
                            <img 
                              src={proj.images[0]} 
                              alt={proj.title} 
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#727875] dark:text-slate-400">
                              <span className="text-sm font-semibold">ไม่มีรูปภาพประกอบ</span>
                            </div>
                          )}
                          <span className="absolute top-3 left-3 px-2.5 py-1 text-sm font-semibold tracking-widest rounded-md bg-[#4A5D53]/90 text-white shadow-sm">
                            {proj.category}
                          </span>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-emerald-800 text-sm font-semibold px-3 py-1.5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5">
                              <Search className="w-4 h-4" /> ดูรูปผลงาน
                            </span>
                          </div>
                        </div>

                        {/* Title & Desc */}
                        <div className="p-6 space-y-3">
                          <h4 className="font-semibold text-base md:text-lg text-[#2A2E2C] dark:text-slate-100 leading-snug line-clamp-2">
                            {proj.title}
                          </h4>
                          <p className="text-sm text-[#727875] dark:text-slate-400 line-clamp-3 leading-relaxed">
                            {proj.description}
                          </p>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {proj.tags.map((tag, idx) => (
                              <span key={idx} className="text-sm px-2 py-0.5 rounded-full bg-[#F4F3F0] dark:bg-emerald-950/40 text-[#565B59] dark:text-emerald-300">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Footer comments count and like toggles */}
                      <div className="px-5 py-4 border-t border-[#F9F8F6] dark:border-white/5 bg-white/50 dark:bg-emerald-950/10 flex items-center justify-between text-sm">
                        <span className="text-sm text-[#727875] dark:text-slate-400 font-mono">
                          ส่งมอบ: {proj.dateString}
                        </span>

                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleLikeProject(proj.id)}
                            className={`flex items-center gap-1 hover:scale-[1.03] transition-transform ${
                              hasLiked ? "text-rose-500" : "text-[#727875] dark:text-slate-400 hover:text-rose-500"
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${hasLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                            <span className="font-mono font-semibold">{proj.likes}</span>
                          </button>

                          <div className="flex items-center gap-1 text-[#727875] dark:text-slate-400">
                            <MessageSquare className="w-4 h-4" />
                            <span className="font-mono font-semibold">{proj.comments.length}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </motion.div>
          )}

          {/* TAB 4: CLIENT FEEDBACK BOARD */}
          {activeTab === "feedback" && (
            <motion.div
              key="feedback-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              
              {/* Board Header Section with Pin Emoji */}
              <div className="flex items-center gap-3 text-left py-2">
                <span className="text-3xl" role="img" aria-label="pin">📌</span>
                <h2 className="font-display text-2xl md:text-3xl font-black tracking-tight text-[#2A2E2C] dark:text-white uppercase">
                  ความคิดเห็นจากลูกค้า / CLIENT FEEDBACK BOARD
                </h2>
              </div>

              {/* 2-Column Grid Layout: Input Form (Left) and Sticky Notes Board (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Side: Sticker Creator Form */}
                <div className={`lg:col-span-4 border rounded-xl p-5 shadow-xl text-left space-y-4 transition-all duration-300 ${getFormToneClasses(noteColor).container}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">😊</span>
                    <h3 className={`font-display font-semibold text-base md:text-lg transition-colors ${getFormToneClasses(noteColor).heading}`}>
                      ฝากความคิดเห็นถึงเราได้นะครับ!
                    </h3>
                  </div>

                  <form onSubmit={handleAddStickyNote} className="space-y-4">
                    {/* Author Name */}
                    <div>
                      <label className={`block text-sm md:text-base font-semibold mb-1.5 transition-colors ${getFormToneClasses(noteColor).label}`}>
                        ชื่อผู้ฝากข้อความ
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="เช่น คุณสมชาย, บริษัท ABC..."
                        value={noteAuthor}
                        onChange={(e) => setNoteAuthor(e.target.value)}
                        className={`w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 transition-all duration-300 ${getFormToneClasses(noteColor).input}`}
                      />
                    </div>

                    {/* Note Content */}
                    <div>
                      <label className={`block text-sm md:text-base font-semibold mb-1.5 transition-colors ${getFormToneClasses(noteColor).label}`}>
                        ข้อความในโน้ต (ตัวอักษรไม่เกิน 80 ตัว)
                      </label>
                      <textarea 
                        required
                        maxLength={80}
                        placeholder="เขียนรีวิวหรือฝากความคิดเห็นสั้นๆ ถึงเรา..."
                        rows={3}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className={`w-full text-sm px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-1 transition-all duration-300 ${getFormToneClasses(noteColor).input}`}
                      />
                      <div className={`text-right text-sm mt-1 transition-colors ${getFormToneClasses(noteColor).charCount}`}>
                        {noteText.length}/80 ตัวอักษร
                      </div>
                    </div>

                    {/* Color Picker circles */}
                    <div>
                      <label className={`block text-sm md:text-base font-semibold mb-2 transition-colors ${getFormToneClasses(noteColor).label}`}>
                        เลือกสีสติ๊กเกอร์
                      </label>
                      <div className="flex items-center gap-2.5">
                        {[
                          { value: "yellow", class: "bg-[#fef9c3] border-amber-300", accent: "ring-2 ring-amber-400" },
                          { value: "pink", class: "bg-[#fce7f3] border-rose-300", accent: "ring-2 ring-rose-400" },
                          { value: "blue", class: "bg-[#dbeafe] border-blue-300", accent: "ring-2 ring-blue-400" },
                          { value: "green", class: "bg-[#dcfce7] border-emerald-300", accent: "ring-2 ring-emerald-400" },
                          { value: "purple", class: "bg-[#f3e8ff] border-purple-300", accent: "ring-2 ring-purple-400" }
                        ].map((col) => (
                          <button
                            key={col.value}
                            type="button"
                            onClick={() => setNoteColor(col.value as any)}
                            className={`w-7 h-7 rounded-full transition-all border ${col.class} ${
                              noteColor === col.value 
                                ? `${col.accent} scale-110 shadow-sm` 
                                : "hover:scale-[1.03] opacity-80"
                            }`}
                            title={`สี${col.value}`}
                          />
                        ))}
                      </div>
                    </div>

                    {noteError && (
                      <div className="text-rose-500 text-sm bg-rose-50 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-900/50 p-3 rounded-lg flex items-start gap-2">
                        <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                        <span>{noteError}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button 
                      type="submit" 
                      disabled={isModerating}
                      className={`w-full font-semibold text-sm py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow-lg flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed ${getFormToneClasses(noteColor).button}`}
                    >
                      {isModerating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          กำลังตรวจสอบข้อความ...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          แปะกระดานโน้ต
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Right Side: The Dotted Board container */}
                <div className="lg:col-span-8 border-dashed border-2 border-[#EAE8E2] dark:border-slate-700/50 rounded-xl p-5 md:p-6 min-h-[440px] relative bg-transparent">
                  
                  {stickyNotes.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#727875] space-y-2">
                      <Smile className="w-8 h-8 opacity-30" />
                      <p className="text-sm">กระดานว่างเปล่า ยินดีต้อนรับฟีดแบกแรกของคุณ!</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
                    <AnimatePresence>
                      {stickyNotes.map((note) => {
                        // Map colors to vibrant sticky post-it styles
                        const isYellow = note.color === "yellow";
                        const isPink = note.color === "pink";
                        const isBlue = note.color === "blue";
                        const isGreen = note.color === "green";

                        const styleMap = 
                          isGreen ? { bg: "bg-[#dcfce7]", text: "text-[#064e3b]", border: "border-emerald-200/50", authorColor: "text-emerald-800" } :
                          isYellow ? { bg: "bg-[#fef9c3]", text: "text-[#78350f]", border: "border-amber-200/50", authorColor: "text-amber-800" } :
                          isPink ? { bg: "bg-[#fce7f3]", text: "text-[#9d174d]", border: "border-rose-200/50", authorColor: "text-rose-800" } :
                          isBlue ? { bg: "bg-[#dbeafe]", text: "text-[#1e3a8a]", border: "border-blue-200/50", authorColor: "text-blue-800" } :
                          { bg: "bg-[#f3e8ff]", text: "text-[#581c87]", border: "border-purple-200/50", authorColor: "text-purple-800" };

                        // Clean stacked date splits to match the design (e.g. "20 มิ.ย. 2026")
                        const dateParts = note.dateString.split(" ");
                        const formattedDayMonth = dateParts.length >= 2 ? `${dateParts[0]} ${dateParts[1]}` : note.dateString;
                        const formattedYear = dateParts.length >= 3 ? dateParts[2] : "";

                        return (
                          <motion.div
                            key={note.id}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ rotate: `${note.rotation || 0}deg` }}
                            className={`p-5 rounded-lg border shadow-lg relative flex flex-col justify-between min-h-[190px] hover:scale-[1.03] hover:shadow-xl transition-all duration-300 group ${styleMap.bg} ${styleMap.border} ${styleMap.text}`}
                          >
                            {/* Pin decoration */}
                            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#f43f5e] shadow-sm border border-white/60 z-10"></div>

                            {/* Delete Button - Show only for admin or creator */}
                            {(user.role === 'admin' || (note.authorEmail && note.authorEmail === user.email)) && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteStickyNote(note.id);
                                }}
                                className="absolute top-2.5 right-2.5 text-rose-600 hover:text-white hover:bg-rose-600 transition-all p-1.5 rounded-full bg-white/95 dark:bg-[#0c120e]/80 shadow-sm border border-rose-200/50 dark:border-rose-950/40 z-20 flex items-center justify-center cursor-pointer"
                                title="ดึงโน้ตนี้ออก"
                              >
                                <X className="w-3.5 h-3.5 stroke-[3px]" />
                              </button>
                            )}

                            {/* Content text */}
                            <div className="flex-1 flex items-center pt-2">
                              <p className="text-sm md:text-base font-semibold text-left leading-relaxed font-sans whitespace-pre-line">
                                &quot;{note.text}&quot;
                              </p>
                            </div>

                            {/* Footer */}
                            <div className={`flex items-end justify-between border-t border-black/5 pt-2.5 mt-3 text-sm ${styleMap.authorColor}`}>
                              <div className="text-left font-sans flex flex-col min-w-0 flex-1 pr-2">
                                <div className="font-semibold truncate">From: {note.authorName}</div>
                                {note.isAdmin && (
                                  <div className="mt-0.5"><span className="text-[10px] font-bold bg-black/10 px-1.5 py-0.5 rounded-sm uppercase">Admin</span></div>
                                )}
                                {user.role === 'admin' && note.authorEmail && (
                                  <div className="text-[9px] opacity-70 mt-0.5 truncate">{note.authorEmail}</div>
                                )}
                              </div>
                              <div className="text-right font-mono font-semibold leading-tight flex flex-col items-end shrink-0 opacity-80">
                                <div>{formattedDayMonth}</div>
                                {formattedYear && <div className="text-[8px] opacity-75">{formattedYear}</div>}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 5: PACKAGE */}
          {activeTab === "package" && (
            <motion.div
              key="package-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="max-w-md mx-auto mt-10">
                <div className="bg-white dark:bg-[#121614] border-2 border-emerald-500 dark:border-emerald-600 rounded-2xl p-8 text-center shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                    แนะนำ
                  </div>
                  <h3 className="font-display text-2xl font-bold text-[#1C201E] dark:text-slate-100 mb-2">
                    สมัครแพ็คเกจแบบรายเดือน
                  </h3>
                  <div className="flex items-center justify-center gap-1 mb-6">
                    <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">฿67</span>
                    <span className="text-[#727875] dark:text-slate-400 font-medium">/ เดือน</span>
                  </div>
                  
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4 mb-8 text-left border border-emerald-100 dark:border-emerald-900/50">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-emerald-900 dark:text-emerald-300 leading-relaxed font-medium">
                          ได้รับสิทธิพิเศษรายการส่งเรื่องการจัดการสั่งซื้อต้นไม้แบบไวและมีฟังก์ชันอื่นๆอีกในอนาคต
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold shadow-sm transition-all focus:ring-4 focus:ring-emerald-600/20">
                    สมัครแพ็คเกจ
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* 📖 ARTICLE FULL-DETAIL READ MODAL OVERLAY */}
      <AnimatePresence>
        {selectedArticle && activeArticleObj && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full sm:max-w-xl md:max-w-3xl mx-4 sm:mx-auto rounded-xl shadow-2xl overflow-hidden text-left flex flex-col justify-between max-h-[85vh] ${
                isDarkMode ? "bg-[#121614] text-[#F3F4F1]" : "bg-white text-[#1C201E] border border-[#EAE8E2]"
              }`}
            >
              
              {/* Modal Banner Top */}
              <div className="p-6 border-b border-[#F4F3F0]/60 dark:border-white/10/60 flex items-center justify-between gap-4 sticky top-0 bg-inherit z-10">
                <div>
                  <span className="text-sm font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {activeArticleObj.badge}
                  </span>
                  <h3 className="font-display text-lg md:text-2xl font-extrabold font-display mt-2 text-[#1C201E] dark:text-white">
                    {activeArticleObj.title}
                  </h3>
                </div>
                
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="p-1.5 rounded-full bg-[#F4F3F0] dark:bg-slate-800 hover:bg-[#EAE8E2] dark:hover:bg-slate-700 text-[#727875] dark:text-slate-400 hover:text-[#565B59] dark:hover:text-slate-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Core Content Scroll */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 text-[#3E4341] dark:text-slate-200 leading-relaxed font-sans text-sm md:text-base">
                
                {/* Formatted Content block parser simulating a cozy paper book */}
                <div className="prose dark:prose-invert prose-emerald max-w-none text-left space-y-4">
                  
                  {activeArticleObj.fullContent ? (
                    activeArticleObj.fullContent.split("\n\n").map((chunk, index) => {
                      if (chunk.startsWith("###")) {
                        return <h3 key={index} className="font-display text-lg md:text-xl font-light tracking-wide font-semibold text-emerald-800 dark:text-emerald-400 pt-3 border-b pb-1 dark:border-white/5">{chunk.replace("###", "").trim()}</h3>;
                      }
                      if (chunk.startsWith("####")) {
                        return <h4 key={index} className="text-base md:text-lg font-semibold font-display text-[#2A2E2C] dark:text-slate-100 pt-2">{chunk.replace("####", "").trim()}</h4>;
                      }
                      if (chunk.startsWith("*") || chunk.startsWith("-")) {
                        return (
                          <ul key={index} className="list-disc pl-5 space-y-1.5 text-[#565B59] dark:text-slate-300 my-2">
                            {chunk.split("\n").map((li, lidx) => (
                              <li key={lidx}>{li.replace(/^[\*\-]\s*/, "").trim()}</li>
                            ))}
                          </ul>
                        );
                      }
                      if (chunk.startsWith("1.")) {
                        return (
                          <ol key={index} className="list-decimal pl-5 space-y-1.5 text-[#565B59] dark:text-slate-300 my-2">
                            {chunk.split("\n").map((li, lidx) => (
                              <li key={lidx}>{li.replace(/^\d+\.\s*/, "").trim()}</li>
                            ))}
                          </ol>
                        );
                      }
                      if (chunk.includes("|")) {
                        // Render simple tables beautifully
                        const rows = chunk.split("\n").filter(r => r.trim().length > 0);
                        return (
                          <div key={index} className="overflow-x-auto my-4 rounded-xl border border-[#F4F3F0] dark:border-white/10">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-emerald-950 text-left text-sm">
                              <tbody className="divide-y divide-slate-100 dark:divide-emerald-950/60 bg-white/50 dark:bg-slate-900/10">
                                {rows.map((row, rIdx) => {
                                  const cells = row.split("|").map(c => c.trim()).filter((_, cidx) => cidx > 0 && cidx < row.split("|").length - 1);
                                  if (row.includes("---")) return null; // separator row
                                  return (
                                    <tr key={rIdx} className={rIdx === 0 ? "bg-[#F4F3F0] dark:bg-emerald-950/50 font-semibold" : ""}>
                                      {cells.map((cell, cIdx) => (
                                        <td key={cIdx} className="px-4 py-2 text-[#3E4341] dark:text-slate-200">{cell}</td>
                                      ))}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      }
                      
                      return <p key={index} className="leading-relaxed whitespace-pre-line text-[#565B59] dark:text-slate-300">{chunk}</p>;
                    })
                  ) : (
                    <p className="text-[#727875] dark:text-slate-400">เนื้อหาบทเรียนว่างเปล่า</p>
                  )}

                </div>

                {/* Interactive workbook questionnaire answers section (SG-01, SG-02, etc.) */}
                {activeArticleObj.workbookQuestions && activeArticleObj.workbookQuestions.length > 0 && (
                  <div className="mt-8 pt-6 border-t-2 border-dashed border-[#F4F3F0] dark:border-white/10/60 space-y-4 bg-amber-50/40 dark:bg-emerald-950/10 p-5 rounded-xl border border-amber-100/40 dark:border-emerald-900/20">
                    <h4 className="text-sm font-semibold uppercase tracking-widest text-amber-800 dark:text-emerald-400 flex items-center gap-1">
                      <Bookmark className="w-4 h-4" />
                      สมุดบันทึกผู้เรียน (Interactive Workbook Exercises)
                    </h4>
                    <p className="text-sm text-[#727875]">พิมพ์คำตอบและจดบันทึกของคุณเพื่อสรุปความเข้าใจ ระบบจะเซ็กและเซฟบันทึกลงโปรไฟล์โดยอัตโนมัติ</p>

                    <div className="space-y-4">
                      {activeArticleObj.workbookQuestions.map((q, idx) => {
                        const savedAnswer = (articleNotes[activeArticleObj.id] && articleNotes[activeArticleObj.id][idx]) || "";
                        return (
                          <div key={idx} className="space-y-1 text-left">
                            <label className="block text-sm font-semibold text-[#3E4341] dark:text-slate-300">
                              คำถามที่ {idx + 1}: {q.q}
                            </label>
                            <input 
                              type="text"
                              value={savedAnswer}
                              onChange={(e) => handleSaveWorkbookAnswer(activeArticleObj.id, idx, e.target.value)}
                              placeholder={q.placeholder}
                              className="w-full text-sm px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-[#F4F3F0] dark:border-white/10 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B6F64]"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer Controls */}
              <div className="p-4 bg-white dark:bg-[#0E1210] border-t border-[#F4F3F0]/60 dark:border-white/10/60 flex items-center justify-between">
                <span className="text-sm text-[#727875] dark:text-slate-400 font-mono">
                  บทเรียนเขียนโดยกองวิชาการ Surapa Garden
                </span>
                
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-white font-semibold text-sm hover:bg-emerald-800 transition-colors"
                >
                  ศึกษาบทถัดไป
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📧 EMAIL CONTACT MODAL */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className={`w-full max-w-md rounded-xl shadow-xl overflow-hidden relative ${
                isDarkMode ? "bg-[#121614] border border-white/5 text-slate-200" : "bg-white border border-[#F4F3F0] text-[#2A2E2C]"
              }`}
            >
              {/* Header */}
              <div className={`px-6 py-4 border-b flex items-center justify-between ${
                isDarkMode ? "border-white/5 bg-[#0D120F]" : "border-[#F9F8F6] bg-white"
              }`}>
                <h3 className="font-display font-display font-semibold text-xl text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Mail className="w-5 h-5" /> ติดต่ออีเมลบริษัท
                </h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="p-1 rounded-lg text-[#727875] dark:text-slate-400 hover:text-[#3E4341] dark:hover:text-slate-300 hover:bg-[#EAE8E2] dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                
                {/* Copy Email Action */}
                <div className={`p-4 rounded-xl border flex flex-col gap-3 ${
                  isDarkMode ? "bg-[#0D120F]/50 border-white/5" : "bg-white border-[#F4F3F0]"
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#727875] dark:text-slate-400 mb-1">อีเมลฝ่ายประสานงาน</p>
                      <p className="text-base font-mono font-semibold">info@surapagarden.com</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("info@surapagarden.com");
                        setEmailCopied(true);
                        setTimeout(() => setEmailCopied(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-white dark:bg-emerald-950 border border-[#EAE8E2] dark:border-white/10 hover:bg-[#F4F3F0] dark:hover:bg-emerald-900 transition-colors"
                    >
                      {emailCopied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-[#5B6F64]" />
                          <span className="text-[#4A5D53] dark:text-emerald-400">คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-[#727875]" />
                          <span>คัดลอกอีเมล</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Send Request Form */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#F4F3F0] dark:border-white/5">
                    <Send className="w-4 h-4 text-[#4A5D53] dark:text-[#5B6F64]" />
                    <h4 className="text-base font-semibold">ส่งคำร้องติดต่อ</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-[#727875] dark:text-slate-400 mb-1">
                        เรื่องที่ติดต่อ (Subject)
                      </label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="เช่น สอบถามประเมินราคา, นำเสนอผลงาน..."
                        className="w-full px-3 py-2 text-base rounded-lg border border-[#EAE8E2] dark:border-white/5 bg-white dark:bg-[#0D120F] focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#727875] dark:text-slate-400 mb-1">
                        รายละเอียด (Message)
                      </label>
                      <textarea
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        placeholder="พิมพ์ข้อความของคุณที่นี่..."
                        rows={4}
                        className="w-full px-3 py-2 text-base rounded-lg border border-[#EAE8E2] dark:border-white/5 bg-white dark:bg-[#0D120F] focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 resize-none"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      const mailtoLink = `mailto:info@surapagarden.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
                      window.open(mailtoLink, '_blank');
                      setShowEmailModal(false);
                      setEmailSubject("");
                      setEmailBody("");
                    }}
                    className="w-full py-2.5 rounded-lg bg-[#4A5D53] hover:bg-[#3D4C44] text-white text-base font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    ส่งอีเมลด้วยแอปพลิเคชันของคุณ
                  </button>
                </div>
                
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🟢 LINE CONTACT MODAL */}
      <AnimatePresence>
        {showLineModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto py-10"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className={`w-full max-w-2xl rounded-xl shadow-xl overflow-hidden relative my-auto ${
                isDarkMode ? "bg-[#121614] border border-white/5 text-slate-200" : "bg-white border border-[#F4F3F0] text-[#2A2E2C]"
              }`}
            >
              {/* Header */}
              <div className={`px-6 py-4 border-b flex items-center justify-between ${
                isDarkMode ? "border-white/5 bg-[#0D120F]" : "border-[#F9F8F6] bg-white"
              }`}>
                <h3 className="font-display font-display font-semibold text-lg text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-green-500/10 flex items-center justify-center text-green-500">
                    <MessageCircle className="w-4 h-4" />
                  </span>
                  ติดต่อผ่าน Line / ทีมงาน
                </h3>
                <button
                  onClick={() => setShowLineModal(false)}
                  className="p-1 rounded-lg text-[#727875] dark:text-slate-400 hover:text-[#3E4341] dark:hover:text-slate-300 hover:bg-[#EAE8E2] dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                
                {/* Contact Card 1 */}
                <div className={`p-5 rounded-xl border flex flex-col md:flex-row items-center gap-6 justify-between ${
                  isDarkMode ? "bg-[#0D120F]/50 border-white/5" : "bg-white border-green-200 shadow-sm"
                }`}>
                  <div className="space-y-3 flex-1 w-full">
                    <h4 className="text-lg font-semibold text-[#1C201E] dark:text-white">นางสาว สุรภา ลีนะกิตติ</h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold w-16">EMAIL :</span>
                        <a href="mailto:sutisalee2016@gmail.com" className="text-[#4A5D53] dark:text-emerald-400 hover:underline font-medium">sutisalee2016@gmail.com</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold w-16">Mobile :</span>
                        <a href="tel:0815814717" className="text-[#3E4341] dark:text-slate-300 font-medium">081-5814717</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold w-16">Line :</span>
                        <span className="font-semibold text-[#1C201E] dark:text-white font-mono">0815814717</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`shrink-0 w-32 h-32 rounded-xl border flex flex-col items-center justify-center p-2 ${
                    isDarkMode ? "bg-white border-slate-700" : "bg-white border-[#F4F3F0]"
                  }`}>
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fline.me%2Fti%2Fp%2F~0815814717" 
                      alt="Line QR Code 0815814717" 
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

                {/* Contact Card 2 */}
                <div className={`p-5 rounded-xl border flex flex-col md:flex-row items-center gap-6 justify-between ${
                  isDarkMode ? "bg-[#0D120F]/50 border-white/5" : "bg-white border-green-200 shadow-sm"
                }`}>
                  <div className="space-y-3 flex-1 w-full">
                    <h4 className="text-lg font-semibold text-[#1C201E] dark:text-white">นาย วรยศ ลีนะกิตติ</h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold w-16">EMAIL :</span>
                        <a href="mailto:mgworayot@gmail.com" className="text-[#4A5D53] dark:text-emerald-400 hover:underline font-medium">mgworayot@gmail.com</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold w-16">Mobile :</span>
                        <a href="tel:0945606669" className="text-[#3E4341] dark:text-slate-300 font-medium">094-5606669</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold w-16">Line :</span>
                        <span className="font-semibold text-[#1C201E] dark:text-white font-mono">bomluvii</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`shrink-0 w-32 h-32 rounded-xl border flex flex-col items-center justify-center p-2 ${
                    isDarkMode ? "bg-white border-slate-700" : "bg-white border-[#F4F3F0]"
                  }`}>
                    <img 
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fline.me%2Fti%2Fp%2F~bomluvii" 
                      alt="Line QR Code bomluvii" 
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🖼️ PROJECT PHOTOS MODAL (LINE OFFICIAL STYLE) */}
      <AnimatePresence>
        {selectedProjectForPhotos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-md overflow-y-auto"
            onClick={() => setSelectedProjectForPhotos(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`w-full sm:max-w-xl md:max-w-3xl mx-4 sm:mx-auto rounded-xl shadow-2xl overflow-hidden relative my-auto flex flex-col max-h-[90vh] ${
                isDarkMode ? "bg-[#121614] border border-white/5" : "bg-white border border-[#F4F3F0]"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`px-6 py-4 flex items-center justify-between border-b ${
                isDarkMode ? "border-white/5 bg-[#0D120F]" : "border-[#F9F8F6] bg-white"
              }`}>
                <h3 className="font-display font-display font-semibold text-xl text-[#1C201E] dark:text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-[#5B6F64]/10 flex items-center justify-center text-[#4A5D53] dark:text-emerald-400">
                    <Search className="w-4 h-4" />
                  </span>
                  รูป ผลงาน
                </h3>
                <button
                  onClick={() => setSelectedProjectForPhotos(null)}
                  className="p-2 rounded-full text-[#727875] dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-[#EAE8E2] dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Photos Content */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-semibold text-[#2A2E2C] dark:text-slate-100 mb-2">{selectedProjectForPhotos.title}</h4>
                  <p className="text-[#727875] dark:text-slate-400">{selectedProjectForPhotos.description}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedProjectForPhotos.images && selectedProjectForPhotos.images.length > 0 ? selectedProjectForPhotos.images.map((imgUrl, idx) => (
                    <div key={idx} onClick={() => setLightboxIndex(idx)} className="cursor-pointer relative rounded-xl overflow-hidden shadow-sm border border-[#F4F3F0]/50 dark:border-emerald-900/20 group">
                      <img 
                        src={imgUrl} 
                        alt={`ผลงานรูปที่ ${idx + 1}`} 
                        className="w-full h-auto object-cover hover:scale-[1.03] transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-md">
                        {idx + 1} / {selectedProjectForPhotos.images.length}
                      </div>
                    </div>
                  )) : (
                    <div className="col-span-1 sm:col-span-2 text-center py-8 text-[#727875] dark:text-slate-400">
                      ไม่มีรูปภาพประกอบสำหรับผลงานนี้
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      
      <AnimatePresence>
        {lightboxIndex !== null && selectedProjectForPhotos?.images && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
              className="absolute top-4 right-4 text-white hover:text-emerald-400 z-[110] bg-black/50 p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="absolute top-4 right-16 text-white text-sm font-semibold bg-black/50 px-3 py-1.5 rounded-md z-[110]">
              {lightboxIndex + 1} / {selectedProjectForPhotos.images.length}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : selectedProjectForPhotos.images!.length - 1));
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-emerald-400 z-[110] bg-black/50 hover:bg-black/80 p-3 rounded-full hidden sm:block transition-all"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev! < selectedProjectForPhotos.images!.length - 1 ? prev! + 1 : 0));
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-emerald-400 z-[110] bg-black/50 hover:bg-black/80 p-3 rounded-full hidden sm:block transition-all"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              src={selectedProjectForPhotos.images[lightboxIndex]}
              alt={`รูปภาพเต็ม ${lightboxIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain select-none"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Mobile controls */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 sm:hidden z-[110]">
               <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : selectedProjectForPhotos.images!.length - 1));
                }}
                className="text-white hover:text-emerald-400 bg-black/60 hover:bg-black/80 p-3 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
               <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev! < selectedProjectForPhotos.images!.length - 1 ? prev! + 1 : 0));
                }}
                className="text-white hover:text-emerald-400 bg-black/60 hover:bg-black/80 p-3 rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Management Modal */}
      <AnimatePresence>
        {showAdminModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAdminModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    ระบบจัดการ Admin
                  </h2>
                  <button onClick={() => setShowAdminModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleGrantAdmin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      อีเมลผู้ใช้ที่ต้องการแต่งตั้งเป็น Admin
                    </label>
                    <input 
                      type="email" 
                      required
                      placeholder="เช่น user@example.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  
                  {adminStatusMsg.text && (
                    <div className={`p-3 rounded-lg text-sm font-medium ${
                      adminStatusMsg.type === 'error' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                      adminStatusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {adminStatusMsg.text}
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <button 
                      type="submit"
                      disabled={adminStatusMsg.type === 'loading'}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" /> แต่งตั้งเป็น Admin
                    </button>
                  </div>
                  
                  <p className="text-xs text-center text-gray-500 dark:text-slate-400 mt-4">
                    * ผู้ใช้ที่ถูกแต่งตั้งจะสามารถเพิ่ม/แก้ไขข้อมูลผลงาน และแต่งตั้ง Admin คนอื่นต่อได้
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🌿 FOOTER BRAND STAMP */}

      <footer className={`py-20 border-t text-center mt-12 transition-colors ${
        isDarkMode ? "bg-[#080C0A] border-white/5 text-[#727875]" : "bg-[#f8faf8] border-emerald-200 text-[#3E4341]"
      }`}>
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="font-display font-extrabold tracking-widest text-emerald-800 dark:text-emerald-400">SURAPA GARDEN</span>
          </div>
          <p className="text-sm">
            © 2026 บริษัท สุรภา การ์เด้น จำกัด — ผู้รับเหมาจัดสวนครบวงจร รับจัดสวนโครงการบ้านจัดสรร • บริษัทเอกชน • ศูนย์ราชการ
          </p>
          <p className="text-sm font-mono opacity-80">
            Surapa Garden | boom28123@gmail.com | 081-581-4717
          </p>
        </div>
      </footer>

    </div>
  );
}
