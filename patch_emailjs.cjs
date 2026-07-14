const fs = require('fs');
let content = fs.readFileSync('src/components/PortfolioHome.tsx', 'utf-8');

content = content.replace(
  `          {
            publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "lefcv-GCi4Lf7tJ5cY_Dz",
          }
        );
      } catch (emailErr) {
        console.error("Failed to send email notification (Order was still saved):", emailErr);
      }`,
  `          import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "lefcv-GCi4Lf7tJ5cY_Dz"
        );
      } catch (emailErr: any) {
        console.error("Failed to send email notification (Order was still saved):", emailErr);
        alert("คำสั่งซื้อถูกบันทึกแล้ว แต่การส่งอีเมลล้มเหลว กรุณาตรวจสอบ EmailJS credentials (Service ID, Template ID, Public Key)\\nError: " + (emailErr?.text || emailErr?.message || "Invalid Request"));
      }`
);

fs.writeFileSync('src/components/PortfolioHome.tsx', content);
