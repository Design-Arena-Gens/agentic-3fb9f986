"use client";
import { useEffect, useMemo, useState } from "react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const colors = [
  { name: "Green", value: "#5ad67d" },
  { name: "Blue", value: "#66c2ff" },
  { name: "Orange", value: "#ffb86b" },
  { name: "Pink", value: "#ff80bf" },
  { name: "Purple", value: "#b28cff" },
  { name: "Teal", value: "#5eead4" },
  { name: "Red", value: "#ff6b6b" }
];

export default function WorkoutForm({ event, onSave, onCancel }) {
  const isEdit = Boolean(event);

  const [name, setName] = useState(event?.name || "");
  const [day, setDay] = useState(event?.day ?? 0);
  const [startTime, setStartTime] = useState(event?.startTime || "18:00");
  const [durationMin, setDurationMin] = useState(event?.durationMin || 60);
  const [muscleGroup, setMuscleGroup] = useState(event?.muscleGroup || "");
  const [intensity, setIntensity] = useState(event?.intensity || "Moderate");
  const [color, setColor] = useState(event?.color || colors[0].value);
  const [notes, setNotes] = useState(event?.notes || "");

  useEffect(() => {
    if (!isEdit) return;
    setName(event?.name || "");
    setDay(event?.day ?? 0);
    setStartTime(event?.startTime || "18:00");
    setDurationMin(event?.durationMin || 60);
    setMuscleGroup(event?.muscleGroup || "");
    setIntensity(event?.intensity || "Moderate");
    setColor(event?.color || colors[0].value);
    setNotes(event?.notes || "");
  }, [isEdit, event]);

  const disabled = useMemo(() => name.trim().length === 0, [name]);

  function submit(e) {
    e.preventDefault();
    onSave(
      {
        id: event?.id,
        name: name.trim(),
        day: Number(day),
        startTime,
        durationMin: Number(durationMin),
        muscleGroup: muscleGroup.trim(),
        intensity,
        color,
        notes: notes.trim()
      },
      isEdit
    );
    if (!isEdit) {
      setName("");
      setNotes("");
    }
  }

  return (
    <form onSubmit={submit}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontWeight: 800 }}>{isEdit ? "Edit workout" : "Add workout"}</div>
        {isEdit ? <button type="button" className="button secondary" onClick={onCancel}>Done</button> : null}
      </div>
      <div className="form-row" style={{ marginBottom: 12 }}>
        <div className="col-8">
          <label>Name</label>
          <input value={name} placeholder="e.g., Push Day" onChange={e => setName(e.target.value)} />
        </div>
        <div className="col-4">
          <label>Muscle group</label>
          <input value={muscleGroup} placeholder="e.g., Chest" onChange={e => setMuscleGroup(e.target.value)} />
        </div>
      </div>
      <div className="form-row" style={{ marginBottom: 12 }}>
        <div className="col-3">
          <label>Day</label>
          <select value={day} onChange={e => setDay(e.target.value)}>
            {days.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
        </div>
        <div className="col-3">
          <label>Start time</label>
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
        </div>
        <div className="col-3">
          <label>Duration (min)</label>
          <input type="number" min={10} step={5} value={durationMin} onChange={e => setDurationMin(e.target.value)} />
        </div>
        <div className="col-3">
          <label>Intensity</label>
          <select value={intensity} onChange={e => setIntensity(e.target.value)}>
            <option>Easy</option>
            <option>Moderate</option>
            <option>Hard</option>
            <option>Max</option>
          </select>
        </div>
      </div>
      <div className="form-row" style={{ marginBottom: 12 }}>
        <div className="col-6">
          <label>Color</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {colors.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className="chip"
                style={{
                  border: color === c.value ? "2px solid #fff" : "1px solid #223044",
                  background: "#111a27",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                <span className="dot" style={{ background: c.value }} />
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <div className="col-6">
          <label>Notes</label>
          <textarea rows={3} placeholder="Key lifts, target RPE, reminders..." value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="button" disabled={disabled} type="submit">{isEdit ? "Save changes" : "Add workout"}</button>
        {!isEdit ? <button type="button" className="button secondary" onClick={() => {
          setName("");
          setMuscleGroup("");
          setNotes("");
        }}>Reset</button> : null}
      </div>
    </form>
  );
}

