/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  MapPin, 
  Calendar as CalendarIcon, 
  Moon, 
  Sun, 
  Sunrise, 
  Sunset, 
  CloudSun,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX
} from 'lucide-react';

interface PrayerTimesData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface DateInfo {
  gregorian: string;
  hijri: string;
}

export default function App() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
  const [dateInfo, setDateInfo] = useState<DateInfo | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Fetch prayer times for Damascus
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const response = await fetch(
          'https://api.aladhan.com/v1/timingsByCity?city=Damascus&country=Syria&method=4'
        );
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        
        setPrayerTimes(data.data.timings);
        setDateInfo({
          gregorian: data.data.date.readable,
          hijri: `${data.data.date.hijri.day} ${data.data.date.hijri.month.ar} ${data.data.date.hijri.year}`
        });
        setLoading(false);
      } catch (err) {
        setError('تعذر تحميل أوقات الصلاة. يرجى المحاولة لاحقاً.');
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const prayerNames: Record<keyof PrayerTimesData, string> = {
    Fajr: 'الفجر',
    Sunrise: 'الشروق',
    Dhuhr: 'الظهر',
    Asr: 'العصر',
    Maghrib: 'المغرب',
    Isha: 'العشاء'
  };

  const prayerIcons: Record<keyof PrayerTimesData, any> = {
    Fajr: Moon,
    Sunrise: Sunrise,
    Dhuhr: Sun,
    Asr: CloudSun,
    Maghrib: Sunset,
    Isha: Moon
  };

  // Calculate next prayer
  const nextPrayerInfo = useMemo(() => {
    if (!prayerTimes) return null;

    const now = currentTime;
    const times = Object.entries(prayerTimes)
      .filter(([key]) => key !== 'Imsak' && key !== 'Midnight' && key !== 'Sunset' && key !== 'Firstthird' && key !== 'Lastthird')
      .map(([name, time]) => {
        const [hours, minutes] = time.split(':').map(Number);
        const prayerDate = new Date(now);
        prayerDate.setHours(hours, minutes, 0, 0);
        return { name, time: prayerDate };
      });

    let next = times.find(p => p.time > now);
    
    if (!next) {
      // If no more prayers today, the next is Fajr tomorrow
      const [hours, minutes] = prayerTimes.Fajr.split(':').map(Number);
      const tomorrowFajr = new Date(now);
      tomorrowFajr.setDate(now.getDate() + 1);
      tomorrowFajr.setHours(hours, minutes, 0, 0);
      next = { name: 'Fajr', time: tomorrowFajr };
    }

    const diff = next.time.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      name: prayerNames[next.name as keyof PrayerTimesData],
      countdown: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      key: next.name
    };
  }, [prayerTimes, currentTime]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4 text-center">
        <div className="max-w-md">
          <p className="text-red-500 text-xl font-bold mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans selection:bg-emerald-100">
      {/* Hero Section with Background */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2076&auto=format&fit=crop" 
          alt="Umayyad Mosque" 
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-stone-50" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-4 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20"
          >
            <MapPin size={16} className="text-emerald-400" />
            <span className="text-sm font-medium tracking-wide uppercase">سوريا، دمشق</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-amiri font-bold mb-2"
          >
            أوقات الصلاة
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row items-center gap-4 md:gap-8 mt-4"
          >
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} className="text-emerald-400" />
              <span className="text-lg opacity-90">{dateInfo?.hijri}</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-white/30" />
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-emerald-400" />
              <span className="text-lg opacity-90">{currentTime.toLocaleTimeString('ar-SY', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 -mt-20 relative z-10 pb-20">
        {/* Next Prayer Countdown Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-3xl p-8 md:p-12 mb-12 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="text-center md:text-right">
            <p className="text-stone-500 text-sm font-semibold uppercase tracking-widest mb-2">الصلاة القادمة</p>
            <h2 className="text-4xl md:text-5xl font-amiri font-bold text-stone-800">صلاة {nextPrayerInfo?.name}</h2>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="text-6xl md:text-8xl font-mono font-light tracking-tighter text-emerald-600 mb-2">
              {nextPrayerInfo?.countdown}
            </div>
            <p className="text-stone-400 text-sm font-medium">الوقت المتبقي للأذان</p>
          </div>

          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-4 rounded-full bg-stone-100 text-stone-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </motion.div>

        {/* Prayer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {prayerTimes && Object.entries(prayerNames).map(([key, name], index) => {
            const Icon = prayerIcons[key as keyof PrayerTimesData];
            const time = prayerTimes[key as keyof PrayerTimesData];
            const isNext = nextPrayerInfo?.key === key;
            
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + (index * 0.05) }}
                className={`
                  relative overflow-hidden rounded-2xl p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300
                  ${isNext ? 'prayer-active scale-105 z-10' : 'bg-white border border-stone-200 hover:border-emerald-200 hover:shadow-lg'}
                `}
              >
                <div className={`p-3 rounded-xl ${isNext ? 'bg-white/20' : 'bg-stone-50 text-emerald-600'}`}>
                  <Icon size={24} />
                </div>
                <div className="text-center">
                  <p className={`text-sm font-medium mb-1 ${isNext ? 'text-white/80' : 'text-stone-400'}`}>{name}</p>
                  <p className={`text-2xl font-bold font-mono ${isNext ? 'text-white' : 'text-stone-800'}`}>{time}</p>
                </div>
                {isNext && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-6 px-8 py-4 bg-stone-100 rounded-2xl text-stone-500 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>توقيت دمشق المحلي</span>
            </div>
            <div className="w-px h-4 bg-stone-300" />
            <span>المصدر: Aladhan API</span>
          </div>
          <p className="mt-8 text-stone-400 text-xs leading-relaxed max-w-lg mx-auto">
            يتم تحديث الأوقات تلقائياً بناءً على الموقع الجغرافي لمدينة دمشق. 
            يرجى التأكد من مطابقة الأوقات مع المسجد المحلي.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
