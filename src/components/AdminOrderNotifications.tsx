import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Bell, CheckCircle, X, MapPin, Package, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface OrderData {
  id: string;
  customerName: string;
  location: string;
  items: any[];
  laborCost: number;
  deliveryCost: number;
  totalAmount: number;
  status: string;
  createdAt: any;
  read: boolean;
}

export default function AdminOrderNotifications() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'orders'), where('status', '==', 'new'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newOrders: OrderData[] = [];
      snapshot.forEach((doc) => {
        newOrders.push({ id: doc.id, ...doc.data() } as OrderData);
      });
      // Sort by createdAt descending (newest first). 
      newOrders.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : Date.now();
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : Date.now();
        return timeB - timeA;
      });
      setOrders(newOrders);
      setUnreadCount(newOrders.filter(o => !o.read).length);
    });
    return () => unsubscribe();
  }, []);

  const markAsRead = async (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        read: true,
        status: 'acknowledged'
      });
      if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
      }
    } catch (err) {
      console.error("Error marking order as read:", err);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen && unreadCount > 0) {
              orders.forEach(async (order) => {
                if (!order.read) {
                  try {
                    const orderRef = doc(db, 'orders', order.id);
                    await updateDoc(orderRef, { read: true });
                  } catch (e) {}
                }
              });
            }
          }}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors relative"
        >
          <Bell className="w-5 h-5 text-[#3E4341] dark:text-slate-300" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">
              {unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#121614] border border-[#EAE8E2] dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-[#EAE8E2] dark:border-white/10 bg-[#F9F8F6] dark:bg-black/20">
                <h3 className="font-semibold text-sm text-[#1C201E] dark:text-slate-200">การแจ้งเตือนคำสั่งซื้อใหม่</h3>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {orders.length === 0 ? (
                  <div className="p-6 text-center text-sm text-[#727875] dark:text-slate-400">
                    ไม่มีคำสั่งซื้อใหม่
                  </div>
                ) : (
                  <div className="divide-y divide-[#EAE8E2] dark:divide-white/10">
                    {orders.map((order) => {
                      const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date();
                      const formattedDate = date.toLocaleString('th-TH', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      });
                      
                      return (
                        <div 
                          key={order.id} 
                          onClick={async () => {
                            setSelectedOrder(order);
                            setIsOpen(false);
                            if (!order.read) {
                              try {
                                const orderRef = doc(db, 'orders', order.id);
                                await updateDoc(orderRef, { read: true });
                              } catch(e) {}
                            }
                          }}
                          className="p-3 hover:bg-[#F9F8F6] dark:hover:bg-black/20 transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                              {order.customerName.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#1C201E] dark:text-slate-200 truncate">
                              {order.customerName}
                            </p>
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                              ฿{order.totalAmount.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-[#727875] dark:text-slate-400 mt-1">
                              {formattedDate}
                            </p>
                          </div>
                          <button
                            onClick={(e) => markAsRead(order.id, e)}
                            title="ทำเครื่องหมายว่าอ่านแล้ว"
                            className="p-1.5 text-[#727875] dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors shrink-0"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {createPortal(
        <AnimatePresence>
          {selectedOrder && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedOrder(null)}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-lg bg-white dark:bg-[#121614] rounded-2xl shadow-2xl border border-[#EAE8E2] dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh]"
              >
              <div className="flex items-center justify-between p-4 border-b border-[#EAE8E2] dark:border-white/10">
                <h3 className="font-semibold text-[#1C201E] dark:text-slate-200 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  รายละเอียดคำสั่งซื้อ
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[#727875] dark:text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold text-base">
                        {selectedOrder.customerName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1C201E] dark:text-slate-200 mb-0.5">ผู้สั่งจ้าง</h4>
                      <p className="text-base font-bold text-emerald-700 dark:text-emerald-400">{selectedOrder.customerName}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-sm">
                    <MapPin className="w-5 h-5 text-[#727875] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[#1C201E] dark:text-slate-200 block mb-1">สถานที่ปลูก / จัดส่ง</span>
                      <span className="text-[#727875] dark:text-slate-400 leading-relaxed">{selectedOrder.location || "- ไม่ได้ระบุ -"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#1C201E] dark:text-slate-200 border-b border-[#EAE8E2] dark:border-white/10 pb-2">
                    <Package className="w-4 h-4 text-emerald-600" />
                    รายการพรรณไม้
                  </div>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-start gap-4">
                        <div>
                          <div className="text-sm font-bold text-[#1C201E] dark:text-slate-200">{item.name}</div>
                          <div className="text-xs text-[#727875] dark:text-slate-400 mt-0.5">
                            {item.quantity} {item.unit} x ฿{item.price?.toLocaleString() || 0}
                          </div>
                        </div>
                        <div className="text-sm font-mono font-semibold text-[#3E4341] dark:text-slate-300">
                          ฿{((item.quantity || 0) * (item.price || 0)).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 border-t border-[#EAE8E2] dark:border-white/10 pt-4">
                  <div className="flex justify-between text-xs text-[#727875] dark:text-slate-400">
                    <span>ค่าแรงลมดิน พรวน และดำเนินการปลูก</span>
                    <span className="font-mono">฿{selectedOrder.laborCost?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#727875] dark:text-slate-400">
                    <span>ค่าจัดส่งและยานพาหนะเครื่องจักรล้อม</span>
                    <span className="font-mono">฿{selectedOrder.deliveryCost?.toLocaleString() || 0}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                  <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">ยอดสุทธิรวม</span>
                  <span className="text-xl font-display font-black text-emerald-600 dark:text-emerald-400">
                    ฿{selectedOrder.totalAmount?.toLocaleString() || 0}
                  </span>
                </div>
              </div>

              <div className="p-4 border-t border-[#EAE8E2] dark:border-white/10 bg-[#F9F8F6] dark:bg-black/20 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-[#727875] dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  ปิดหน้าต่าง
                </button>
                <button
                  onClick={(e) => markAsRead(selectedOrder.id, e)}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  ทำเครื่องหมายว่ารับทราบแล้ว
                </button>
              </div>
            </motion.div>
          </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
