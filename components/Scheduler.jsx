"use client";
import { useEffect, useMemo, useState } from "react";
import WorkoutForm from "./WorkoutForm";
import { buildICS } from "../lib/ics";

const STORAGE_KEY = "gym-scheduler:v1";
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function parseHashPlan() {
  if (typeof window === "undefined") return null;
  try {
    const hash = window.location.hash;
    if (!hash.startsWith("#plan=")) return null;
    const b64 = decodeURIComponent(hash.slice(6));
    const json = atob(b64);
    const data = JSON.parse(json);
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

function encodePlanToHash(events) {
  const json = JSON.stringify(events);
  const b64 = btoa(json);
  return `#plan=${encodeURIComponent(b64)}`;
}

const defaultEvents = [
  {
    id: cryptoRandomId(),
    name: "Push (Chest/Tris)",
    day: 0,
    startTime: "18:00",
    durationMin: 75,
    muscleGroup: "Chest",
    intensity: "Hard",
    color: "#5ad67d",
    notes: "Barbell bench, incline DB, dips, rope pushdowns"
  },
  {
    id: cryptoRandomId(),
    name: "Pull (Back/Bis)",
    day: 2,
    startTime: "18:00",
    durationMin: 75,
    muscleGroup: "Back",
    intensity: "Hard",
    color: "#66c2ff",
    notes: "Weighted pull-ups, rows, curls"
  },
  {
    id: cryptoRandomId(),
    name: "Legs",
    day: 4,
    startTime: "10:00",
    durationMin: 80,
    muscleGroup: "Legs",
    intensity: "Hard",
    color: "#ffb86b",
    notes: "Squat, RDL, lunges, calves"
  }
];

function cryptoRandomId() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const arr = new Uint32Array(2);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(n => n.toString(36)).join("");
  }
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function toMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function fmtTime(t) {
  return t.padStart(5, "0");
}
function addMinutes(time, mins) {
  const total = toMinutes(time) + mins;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function Scheduler() {
  const [events, setEvents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const imported = parseHashPlan();
    if (imported) {
      setEvents(imported);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
      return;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setEvents(JSON.parse(raw));
        return;
      } catch {}
    }
    setEvents(defaultEvents);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const byDay = useMemo(() => {
    const map = new Map(days.map((_, i) => [i, []]));
    for (const ev of events) {
      map.get(ev.day)?.push(ev);
    }
    for (const list of map.values()) {
      list.sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
    }
    return map;
  }, [events]);

  const legend = useMemo(() => {
    const uniq = new Map();
    events.forEach(e => {
      const key = e.muscleGroup || "Workout";
      if (!uniq.has(key)) uniq.set(key, e.color || "#5ad67d");
    });
    return Array.from(uniq.entries()).map(([label, color]) => ({ label, color }));
  }, [events]);

  function handleSave(newEvent, isEdit = false) {
    if (isEdit) {
      setEvents(prev => prev.map(e => (e.id === newEvent.id ? newEvent : e)));
      setSelectedId(null);
    } else {
      setEvents(prev => [...prev, { ...newEvent, id: cryptoRandomId() }]);
    }
  }
  function handleEdit(id) {
    setSelectedId(id);
  }
  function handleDelete(id) {
    setEvents(prev => prev.filter(e => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  }
  function clearAll() {
    if (confirm("Clear all workouts?")) {
      setEvents([]);
    }
  }
  async function exportJSON() {
    const text = JSON.stringify(events, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      alert("Plan JSON copied to clipboard.");
    } catch {
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gym-plan.json";
      a.click();
      URL.revokeObjectURL(url);
    }
  }
  function importJSONFromFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (Array.isArray(parsed)) {
          setEvents(parsed);
        } else {
          alert("Invalid JSON format.");
        }
      } catch {
        alert("Invalid JSON.");
      }
    };
    reader.readAsText(file);
  }
  function shareLink() {
    const hash = encodePlanToHash(events);
    const url = `${location.origin}${location.pathname}${hash}`;
    navigator.clipboard.writeText(url).then(
      () => alert("Share link copied."),
      () => prompt("Copy this URL:", url)
    );
  }
  function exportICS() {
    const ics = buildICS(events.map(e => ({
      title: e.name,
      day: e.day,
      startTime: e.startTime,
      durationMin: e.durationMin,
      description: `${e.muscleGroup || "Workout"} ? ${e.intensity || ""}\n${e.notes || ""}`.trim()
    })));
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gym-plan.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="panel">
        <div className="card">
          <div className="toolbar">
            <span className="chip">Weekly planner</span>
            <button className="button" onClick={shareLink}>Share link</button>
            <button className="button secondary" onClick={exportJSON}>Export JSON</button>
            <label className="button secondary" style={{ cursor: "pointer" }}>
              Import JSON
              <input type="file" accept="application/json" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && importJSONFromFile(e.target.files[0])} />
            </label>
            <button className="button secondary" onClick={() => window.print()}>Print</button>
            <button className="button" onClick={exportICS}>Export ICS</button>
            <div style={{ flex: 1 }} />
            <button className="button danger" onClick={clearAll}>Clear</button>
          </div>
          <div style={{ marginTop: 12 }} className="legend">
            {legend.length === 0 ? <span className="muted">No workouts yet</span> : legend.map(({ label, color }) => (
              <div key={label} className="legend-item">
                <span className="dot" style={{ background: color }} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="card">
          <WorkoutForm
            key={selectedId || "new"}
            event={events.find(e => e.id === selectedId) || null}
            onCancel={() => setSelectedId(null)}
            onSave={handleSave}
          />
        </div>
      </div>

      <div className="panel" style={{ gap: 16 }}>
        {days.map((d, di) => (
          <div key={d} className="card" style={{ gridColumn: "span 12" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontWeight: 800, letterSpacing: 0.3 }}>{d}</div>
              <div className="muted">{byDay.get(di)?.length || 0} workouts</div>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {(byDay.get(di) || []).map(ev => (
                <div
                  key={ev.id}
                  className="event"
                  style={{
                    position: "relative",
                    background: ev.color || "#5ad67d",
                    color: "#07120a"
                  }}
                  onClick={() => handleEdit(ev.id)}
                >
                  <div className="name">{ev.name}</div>
                  <div className="meta">
                    <span>{fmtTime(ev.startTime)}?{addMinutes(ev.startTime, ev.durationMin)}</span>
                    <span>{ev.muscleGroup || "Workout"}</span>
                    {ev.intensity ? <span>{ev.intensity}</span> : null}
                  </div>
                  {ev.notes ? <div className="notes">{ev.notes}</div> : null}
                  <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 8 }}>
                    <button
                      className="chip"
                      style={{ background: "rgba(255,255,255,0.6)", border: "none", cursor: "pointer" }}
                      onClick={(e) => { e.stopPropagation(); handleEdit(ev.id); }}
                    >Edit</button>
                    <button
                      className="chip"
                      style={{ background: "rgba(0,0,0,0.18)", border: "1px solid rgba(0,0,0,0.25)", cursor: "pointer" }}
                      onClick={(e) => { e.stopPropagation(); handleDelete(ev.id); }}
                    >Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

