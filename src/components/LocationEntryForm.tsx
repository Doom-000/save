import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ImagePlus, Camera, Trash, Crosshair, CheckCircle, Navigation, UploadCloud, X, Loader2, AlertTriangle } from 'lucide-react';
import exifr from 'exifr';

interface GeoData {
  id: number;
  provinceCode: number;
  provinceNameEn: string;
  provinceNameTh: string;
  districtCode: number;
  districtNameEn: string;
  districtNameTh: string;
  subdistrictCode: number;
  subdistrictNameEn: string;
  subdistrictNameTh: string;
  postalCode: number;
}

interface LocationEntryFormProps {
  onSaveLocation?: (location: string) => void;
}

export default function LocationEntryForm({ onSaveLocation }: LocationEntryFormProps) {
  const [geoData, setGeoData] = useState<GeoData[]>([]);
  const [provinces, setProvinces] = useState<string[]>([]);
  
  const [selectedProvince, setSelectedProvince] = useState('');
  const [districts, setDistricts] = useState<string[]>([]);
  
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [subdistricts, setSubdistricts] = useState<GeoData[]>([]);
  
  const [selectedSubdistrictId, setSelectedSubdistrictId] = useState<number | null>(null);
  
  const [addressDetail, setAddressDetail] = useState('');
  const [postalCode, setPostalCode] = useState('');
  
  const [photos, setPhotos] = useState<{id: string, url: string, coords?: {lat: number, lng: number}}[]>([]);
  const [manualCoordinates, setManualCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/geography.json')
      .then(res => res.json())
      .then((data: GeoData[]) => {
        setGeoData(data);
        const uniqueProvinces = Array.from(new Set(data.map(item => item.provinceNameTh))).sort();
        setProvinces(uniqueProvinces);
      })
      .catch(err => console.error("Failed to load geography data", err));
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      const filtered = geoData.filter(item => item.provinceNameTh === selectedProvince);
      const uniqueDistricts = Array.from(new Set(filtered.map(item => item.districtNameTh))).sort();
      setDistricts(uniqueDistricts);
      setSelectedDistrict('');
      setSubdistricts([]);
      setSelectedSubdistrictId(null);
      setPostalCode('');
    }
  }, [selectedProvince, geoData]);

  useEffect(() => {
    if (selectedDistrict) {
      const filtered = geoData.filter(
        item => item.provinceNameTh === selectedProvince && item.districtNameTh === selectedDistrict
      );
      // Remove duplicates by name
      const uniqueSub = Array.from(new Map<string, GeoData>(filtered.map((item: GeoData) => [item.subdistrictNameTh, item] as [string, GeoData])).values());
      uniqueSub.sort((a: GeoData, b: GeoData) => a.subdistrictNameTh.localeCompare(b.subdistrictNameTh));
      
      setSubdistricts(uniqueSub);
      setSelectedSubdistrictId(null);
      setPostalCode('');
    }
  }, [selectedDistrict, selectedProvince, geoData]);

  const handleSubdistrictChange = (idStr: string) => {
    const id = parseInt(idStr);
    setSelectedSubdistrictId(id);
    const sub = subdistricts.find(s => s.id === id);
    if (sub) {
      setPostalCode(sub.postalCode.toString().padStart(5, '0'));
    }
  };

  const getDistanceMeters = (a: {lat: number, lng: number}, b: {lat: number, lng: number}) => {
    const R = 6371000;
    const toRad = (deg: number) => deg * Math.PI / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  // --- DERIVED STATE FOR GPS & WARNINGS ---
  const photosWithCoords = photos.filter(p => p.coords);
  const firstPhotoCoords = photosWithCoords.length > 0 ? photosWithCoords[0].coords : null;

  const coordinates = manualCoordinates || firstPhotoCoords;
  const coordinateSource = manualCoordinates ? 'manual' : (firstPhotoCoords ? 'image' : null);

  let distanceWarning: number | null = null;
  if (coordinates) {
    let maxDist = 0;
    for (const p of photosWithCoords) {
      if (p.coords) {
        const dist = getDistanceMeters(coordinates, p.coords);
        if (dist > maxDist) maxDist = dist;
      }
    }
    if (maxDist > 500) {
      distanceWarning = Math.round(maxDist);
    }
  }
  // ----------------------------------------

  const handleGetLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setManualCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location", error);
          alert("ไม่สามารถดึงพิกัดได้ (" + error.message + ") โปรดตรวจสอบการอนุญาตใช้งานตำแหน่ง หรือลองเปิดแอปนี้ในหน้าต่างใหม่ (New Tab) หากใช้งานผ่านหน้าต่างจำลอง");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("เบราว์เซอร์ของคุณไม่รองรับการดึงพิกัด GPS");
      setIsLocating(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    // Check limit
    if (photos.length + files.length > 5) {
      alert("สามารถแนบรูปภาพได้สูงสุด 5 รูปเท่านั้น");
      return;
    }

    const newPhotosWithCoords = await Promise.all(files.map(async (file: File) => {
      // Basic size validation (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`ไฟล์ ${file.name} มีขนาดใหญ่เกิน 5MB`);
        return null;
      }
      
      let coords: {lat: number, lng: number} | undefined = undefined;
      try {
        const gps = await exifr.gps(file);
        if (gps && gps.latitude != null && gps.longitude != null) {
          coords = { lat: gps.latitude, lng: gps.longitude };
        }
      } catch (err) {
        console.error("Failed to parse EXIF:", err);
      }
      
      return {
        id: Math.random().toString(36).substring(2, 9),
        url: URL.createObjectURL(file),
        coords
      };
    }));

    const validPhotos = newPhotosWithCoords.filter(Boolean) as {id: string, url: string, coords?: {lat: number, lng: number}}[];
    setPhotos(prev => [...prev, ...validPhotos]);
    
    // Reset inputs
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvince || !selectedDistrict || !selectedSubdistrictId || !addressDetail) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน");
      return;
    }
    
    const sub = subdistricts.find(s => s.id === selectedSubdistrictId);
    const subName = sub ? sub.subdistrictNameTh : '';
    const fullAddress = `${addressDetail} ต.${subName} อ.${selectedDistrict} จ.${selectedProvince} ${postalCode}`;
    
    if (onSaveLocation) {
      onSaveLocation(fullAddress);
    }
    
    setIsSubmitting(true);
    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      
      // Auto dismiss success message
      setTimeout(() => {
        setSuccess(false);
        // Reset form
        setSelectedProvince("");
        setAddressDetail("");
        setPhotos([]);
        setManualCoordinates(null);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="bg-white dark:bg-[#121614] rounded-2xl shadow-xl border border-slate-200 dark:border-white/5 overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/10">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-slate-800 dark:text-white">เพิ่มข้อมูลสถานที่ (Location Entry)</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">ระบุที่อยู่และพิกัดสำหรับจุดปฏิบัติงานหรือสถานที่จัดสวน</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Cascading Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">จังหวัด (Province) <span className="text-rose-500">*</span></label>
              <select 
                value={selectedProvince}
                onChange={e => setSelectedProvince(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
              >
                <option value="">-- เลือกจังหวัด --</option>
                {provinces.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">อำเภอ/เขต (District) <span className="text-rose-500">*</span></label>
              <select 
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                disabled={!selectedProvince}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">-- เลือกอำเภอ/เขต --</option>
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">ตำบล/แขวง (Sub-district) <span className="text-rose-500">*</span></label>
              <select 
                value={selectedSubdistrictId || ''}
                onChange={e => handleSubdistrictChange(e.target.value)}
                disabled={!selectedDistrict}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">-- เลือกตำบล/แขวง --</option>
                {subdistricts.map(s => (
                  <option key={s.id} value={s.id}>{s.subdistrictNameTh}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">รหัสไปรษณีย์ (Postal Code)</label>
              <input 
                type="text"
                readOnly
                value={postalCode}
                placeholder="ออโต้ฟิลล์"
                className="w-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-400 outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">รายละเอียดที่อยู่เพิ่มเติม (Address Detail) <span className="text-rose-500">*</span></label>
            <textarea 
              value={addressDetail}
              onChange={e => setAddressDetail(e.target.value)}
              placeholder="บ้านเลขที่, หมู่, ซอย, ถนน, จุดสังเกต..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all resize-none"
            />
          </div>

          <div className="p-5 rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/10 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-blue-500" />
                    พิกัด GPS
                  </h3>
                  {coordinateSource === 'manual' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold">จากปุ่ม GPS</span>
                  )}
                  {coordinateSource === 'image' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold">จากรูปภาพ</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {coordinates 
                    ? `Lat: ${coordinates.lat.toFixed(6)}, Lng: ${coordinates.lng.toFixed(6)}` 
                    : "ยังไม่ได้ระบุพิกัด (ไม่บังคับ)"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-800/60 text-blue-700 dark:text-blue-300 font-semibold text-sm transition-colors"
              >
                {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
                {coordinates ? "ดึงพิกัดใหม่" : "ดึงพิกัดปัจจุบัน"}
              </button>
            </div>
            <AnimatePresence>
              {distanceWarning !== null && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg p-3 flex items-start gap-3 text-amber-800 dark:text-amber-400 overflow-hidden"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-relaxed">
                    ⚠️ พิกัดที่ปักกับตำแหน่งในรูปภาพห่างกันประมาณ {(distanceWarning / 1000).toFixed(2)} กม. กรุณาตรวจสอบความถูกต้อง
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">ภาพถ่ายสถานที่</label>
                <p className="text-xs text-slate-500">รองรับสูงสุด 5 รูป (ขนาดไม่เกิน 5MB/รูป)</p>
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400">
                {photos.length} / 5
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {photos.map(photo => (
                <div key={photo.id} className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
                  <img src={photo.url} alt="Location" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="p-2 bg-rose-500 text-white rounded-full hover:scale-110 transition-transform"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {photos.length < 5 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                  >
                    <ImagePlus className="w-6 h-6" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">เลือกรูป</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                  >
                    <Camera className="w-6 h-6" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">ถ่ายรูป</span>
                  </button>
                </div>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              multiple 
              className="hidden" 
              onChange={handleImageUpload} 
            />
            <input 
              type="file" 
              ref={cameraInputRef} 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={handleImageUpload} 
            />
          </div>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: 10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 flex items-center gap-3 text-emerald-700 dark:text-emerald-400"
              >
                <CheckCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-semibold">บันทึกข้อมูลสถานที่สำเร็จ!</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isSubmitting || success}
            className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <UploadCloud className="w-5 h-5" />
                บันทึกข้อมูลสถานที่
              </>
            )}
          </button>
          
        </form>
      </div>
    </div>
  );
}
