const fs = require('fs');
let code = fs.readFileSync('src/components/PortfolioHome.tsx', 'utf8');

// 1. Add imports
const importTarget = `import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";`;
const importReplacement = `import { collection, query, where, getDocs, doc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
import emailjs from '@emailjs/browser';
import AdminOrderNotifications from './AdminOrderNotifications';`;
code = code.replace(importTarget, importReplacement);

// 2. Add handleSubmitOrder function
const submitTarget = `  const handleCopyEstimator = () => {`;
const submitReplacement = `  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const handleSubmitOrder = async () => {
    if (!estCustomerName || !estItems.length) {
      alert("กรุณากรอกชื่อลูกค้าและเพิ่มรายการพรรณไม้อย่างน้อย 1 รายการ");
      return;
    }
    
    setIsSubmittingOrder(true);
    try {
      // 1. Save to Firestore
      await addDoc(collection(db, "orders"), {
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
          orderItemsText += \`- \${item.name} (\${item.quantity} \${item.unit} x \${item.price.toLocaleString()} บ.) = \${(item.quantity * item.price).toLocaleString()} บ.\\n\`;
        });
        
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            customer_name: estCustomerName,
            location: estLocation,
            order_items: orderItemsText,
            total_amount: estGrandTotal.toLocaleString()
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
      } catch (emailErr) {
        console.error("Failed to send email notification (Order was still saved):", emailErr);
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

  const handleCopyEstimator = () => {`;
code = code.replace(submitTarget, submitReplacement);

// 3. Add Submit button
const btnTarget = `                      <button 
                        onClick={handleCopyEstimator}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        คัดลอกใบเสนอราคาเต็มรูปแบบลง Clipboard
                      </button>`;
const btnReplacement = `                      <div className="flex flex-col gap-3">
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
                      </div>`;
code = code.replace(btnTarget, btnReplacement);

// 4. Add Bell component
const badgeTarget = `            {/* Profile badge & logout */}
            <div className="flex items-center gap-2 border-l pl-3 ml-1 border-[#F4F3F0] dark:border-white/10">`;
const badgeReplacement = `            {/* Admin Notifications */}
            {user.role === 'admin' && <AdminOrderNotifications />}
            
            {/* Profile badge & logout */}
            <div className="flex items-center gap-2 border-l pl-3 ml-1 border-[#F4F3F0] dark:border-white/10">`;
code = code.replace(badgeTarget, badgeReplacement);

fs.writeFileSync('src/components/PortfolioHome.tsx', code, 'utf8');
