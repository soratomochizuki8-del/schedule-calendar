"use client";
import { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const COLORS = [
  { hex: "#ef4444", name: "赤" },
  { hex: "#f97316", name: "オレンジ" },
  { hex: "#eab308", name: "黄" },
  { hex: "#22c55e", name: "緑" },
  { hex: "#3b82f6", name: "青" },
  { hex: "#8b5cf6", name: "紫" },
  { hex: "#ec4899", name: "ピンク" },
  { hex: "#14b8a6", name: "青緑" },
  { hex: "#64748b", name: "グレー" },
  { hex: "#a16207", name: "茶" },
];

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

function getCalendarId(): string {
  if (typeof window === "undefined") return "default";
  const params = new URLSearchParams(window.location.search);
  return params.get("id") || "default";
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${month}-${day}`;
}

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [userName, setUserName] = useState("");
  const [userColor, setUserColor] = useState(COLORS[0].hex);
  const [totalCount, setTotalCount] = useState(4);
  const [marks, setMarks] = useState<{[key: string]: {name: string; color: string}[]}>({});
  const [calendarId] = useState(getCalendarId);
  const [nameAlert, setNameAlert] = useState(false);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const ref = doc(db, "calendars", calendarId);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setMarks(data.marks || {});
        setTotalCount(data.totalCount || 4);
      }
      setSynced(true);
    });
    return () => unsub();
  }, [calendarId]);

  const saveToFirestore = useCallback(async (newMarks: {[key: string]: {name: string; color: string}[]}, newTotal: number) => {
    const ref = doc(db, "calendars", calendarId);
    await setDoc(ref, { marks: newMarks, totalCount: newTotal, updatedAt: Date.now() }, { merge: true });
  }, [calendarId]);

  const toggleDay = useCallback(async (key: string) => {
    if (!userName.trim()) { setNameAlert(true); return; }
    setNameAlert(false);
    const arr = [...(marks[key] || [])];
    const idx = arr.findIndex((e) => e.name === userName);
    const newArr = idx >= 0 ? arr.filter((_, i) => i !== idx) : [...arr, { name: userName, color: userColor }];
    const newMarks = { ...marks };
    if (newArr.length === 0) { delete newMarks[key]; } else { newMarks[key] = newArr; }
    setMarks(newMarks);
    await saveToFirestore(newMarks, totalCount);
  }, [marks, userName, userColor, totalCount, saveToFirestore]);

  const handleTotalCount = async (v: number) => {
    setTotalCount(v);
    await saveToFirestore(marks, v);
  };

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  const cells: {day: number; type: "prev"|"cur"|"next"}[] = [];
  for (let i = 0; i < firstDow; i++) cells.push({ day: daysInPrev - firstDow + 1 + i, type: "prev" });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, type: "cur" });
  const rem = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= rem; d++) cells.push({ day: d, type: "next" });

  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
  const monthLabel = new Date(year, month, 1).toLocaleDateString("ja-JP", { year: "numeric", month: "long" });

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
          共有URL: <span className="font-mono select-all">{typeof window !== "undefined" ? window.location.href : ""}</span>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 shadow-sm">
          <div className="flex flex-wrap gap-3 items-center mb-3">
            <span className="text-sm text-gray-400 w-20">名前</span>
            <input className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="あなたの名前" maxLength={10} value={userName} onChange={(e) => { setUserName(e.target.value); setNameAlert(false); }} />
            {nameAlert && <span className="text-amber-500 text-xs">名前を入力してください</span>}
          </div>
          <div className="flex flex-wrap gap-3 items-center mb-3">
            <span className="text-sm text-gray-400 w-20">色</span>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c.hex} title={c.name} onClick={() => setUserColor(c.hex)} className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${userColor === c.hex ? "ring-2 ring-offset-2 ring-gray-400" : ""}`} style={{ backgroundColor: c.hex }} />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center mb-3">
            <span className="text-sm text-gray-400 w-20">参加人数</span>
            <input type="number" min={1} max={20} value={totalCount} onChange={(e) => handleTotalCount(Math.max(1, parseInt(e.target.value) || 1))} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-16 focus:outline-none focus:ring-2 focus:ring-blue-200" />
            <span className="text-sm text-gray-400">人</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 w-20">選択中</span>
            <span className="flex items-center gap-2 px-3 py-1 rounded-full text-sm border border-gray-100 bg-gray-50">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: userColor }} />
              {userName || "（名前未設定）"}
            </span>
            {synced && <span className="text-xs text-green-500 ml-2">● リアルタイム同期中</span>}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => { setMonth((m) => { const nm = m - 1; if (nm < 0) { setYear((y) => y - 1); return 11; } return nm; }); }} className="text-gray-400 hover:text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-50 transition text-lg">‹</button>
            <span className="text-base font-medium text-gray-700">{monthLabel}</span>
            <button onClick={() => { setMonth((m) => { const nm = m + 1; if (nm > 11) { setYear((y) => y + 1); return 0; } return nm; }); }} className="text-gray-400 hover:text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-50 transition text-lg">›</button>
          </div>
          <div className="grid grid-cols-7 mb-1">
            {DOW.map((d, i) => (
              <div key={d} className={`text-center text-xs py-1 font-medium ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"}`}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, idx) => {
              const key = dateKey(year, month, cell.day);
              const entries = cell.type === "cur" ? (marks[key] || []) : [];
              const count = entries.length;
              const ratio = count / totalCount;
              const isToday = cell.type === "cur" && key === todayKey;
              const isFull = count >= totalCount && count > 0;
              let bgStyle: React.CSSProperties = {};
              if (cell.type === "cur" && count > 0) {
                if (isFull) { bgStyle = { backgroundColor: "rgba(74,222,128,0.15)" }; }
                else { const alpha = Math.min(0.07 + ratio * 0.18, 0.25); bgStyle = { backgroundColor: `rgba(74,222,128,${alpha.toFixed(2)})` }; }
              }
              return (
                <div key={idx} onClick={() => cell.type === "cur" && toggleDay(key)} style={bgStyle} className={`min-h-[68px] rounded-xl p-1.5 flex flex-col ${cell.type !== "cur" ? "opacity-25 pointer-events-none" : "cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"} ${isToday ? "ring-1 ring-blue-400" : ""}`}>
                  <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? "bg-blue-500 text-white" : "text-gray-700"}`}>{cell.day}</div>
                  <div className="flex flex-wrap gap-0.5">
                    {entries.map((e, i) => (<span key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} title={e.name} />))}
                  </div>
                  {count > 0 && <div className="mt-auto text-[10px] text-gray-400 leading-none">{count}/{totalCount}</div>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-3 flex gap-4 text-xs text-gray-400 justify-center">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ backgroundColor: "rgba(74,222,128,0.4)" }} />全員OK</span>
          <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded ring-1 ring-blue-400" />今日</span>
        </div>
      </div>
    </div>
  );
}
