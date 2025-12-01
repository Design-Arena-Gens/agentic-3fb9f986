"use client";
import "./globals.css";
import Scheduler from "../components/Scheduler";

export default function Page() {
  return (
    <div className="container">
      <div className="header">
        <div>
          <div className="title">Gym Scheduler</div>
          <div className="subtitle">Plan effective weekly workouts. Save, export, print.</div>
        </div>
      </div>
      <Scheduler />
      <div className="footer">
        <span className="muted">Data is stored locally in your browser.</span>
        <a className="muted" href="https://vercel.com" target="_blank" rel="noreferrer">Powered by Next.js on Vercel</a>
      </div>
    </div>
  );
}

