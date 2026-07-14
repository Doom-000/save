import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as nodemailer from "nodemailer";

// ดึงค่า environment variables จาก Firebase (หรือกำหนดค่าคงที่)
// แนะนำให้ตั้งค่าผ่าน firebase functions:secrets:set SMTP_PASSWORD
// หรือ firebase functions:config:set email.user="your_email" email.pass="your_password"
const SMTP_USER = process.env.SMTP_USER || "your-email@gmail.com";
const SMTP_PASS = process.env.SMTP_PASS || "your-app-password"; 
const NOTIFY_EMAIL = "supawit.duna@sbac.ac.th";

// สร้าง transporter สำหรับ Nodemailer (ตัวอย่างใช้ Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const sendOrderNotificationEmail = onDocumentCreated("orders/{orderId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    logger.log("No data associated with the event");
    return;
  }

  const orderData = snapshot.data();

  // ตรวจสอบว่ามี status = "new" หรือไม่ (เพื่อป้องกันการส่งซ้ำกรณีแก้ data ปกติ)
  if (orderData.status !== "new") {
    logger.log("Order status is not new, skipping email notification.");
    return;
  }

  // สร้างรายการสินค้า (HTML)
  let itemsHtml = "";
  if (orderData.items && Array.isArray(orderData.items)) {
    itemsHtml = orderData.items.map((item: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity} ${item.unit}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">฿${(item.price || 0).toLocaleString()}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">฿${((item.quantity || 0) * (item.price || 0)).toLocaleString()}</td>
      </tr>
    `).join('');
  }

  // สร้างเนื้อหาอีเมล HTML
  const mailOptions = {
    from: `"ระบบแจ้งเตือนคำสั่งซื้อ" <${SMTP_USER}>`,
    to: NOTIFY_EMAIL,
    subject: `🎉 มีคำสั่งซื้อใหม่จาก: ${orderData.customerName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #059669; border-bottom: 2px solid #10b981; padding-bottom: 10px;">รายการคำสั่งซื้อใหม่</h2>
        
        <p><strong>ผู้สั่งจ้าง:</strong> ${orderData.customerName}</p>
        <p><strong>สถานที่ปลูก / จัดส่ง:</strong> ${orderData.location || "- ไม่ได้ระบุ -"}</p>
        
        <h3 style="margin-top: 20px; color: #059669;">รายการพรรณไม้</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f3f4f6; text-align: left;">
              <th style="padding: 8px; border-bottom: 2px solid #ddd;">ชื่อรายการ</th>
              <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: center;">จำนวน</th>
              <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">ราคา/หน่วย</th>
              <th style="padding: 8px; border-bottom: 2px solid #ddd; text-align: right;">รวม</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>ค่าแรงลมดิน พรวน และดำเนินการปลูก:</span>
            <strong>฿${(orderData.laborCost || 0).toLocaleString()}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span>ค่าจัดส่งและยานพาหนะเครื่องจักรล้อม:</span>
            <strong>฿${(orderData.deliveryCost || 0).toLocaleString()}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 1.2em; border-top: 1px solid #ddd; padding-top: 10px; color: #059669;">
            <strong>ยอดสุทธิรวม:</strong>
            <strong>฿${(orderData.totalAmount || 0).toLocaleString()}</strong>
          </div>
        </div>
        
        <p style="color: #6b7280; font-size: 0.85em; margin-top: 30px; text-align: center;">
          นี่คืออีเมลอัตโนมัติจากระบบ โปรดอย่าตอบกลับอีเมลนี้
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.log("Email sent successfully: " + info.messageId);
  } catch (error) {
    logger.error("Error sending email:", error);
  }
});
