"use client";
import { FormEvent, useMemo, useState } from "react";

const SCRIPT_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL ?? "";
const LOCATIONS = ["BMO Soccer Centre", "Dartmouth Sportsplex", "Harbour East All-Weather Field", "Other"];
type Status = "idle" | "submitting" | "success" | "error";

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [receipt, setReceipt] = useState("");
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  async function submitHours(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const location = data.get("location") === "Other" ? String(data.get("otherLocation") ?? "").trim() : String(data.get("location") ?? "").trim();
    const hours = Number(data.get("hours"));
    if (!SCRIPT_URL || SCRIPT_URL.includes("PASTE_YOUR")) { setStatus("error"); setMessage("This form has not been connected to its spreadsheet yet."); return; }
    if (!location || !Number.isFinite(hours) || hours <= 0 || hours > 24) { setStatus("error"); setMessage("Please check the location and enter hours between 0.25 and 24."); return; }
    setStatus("submitting"); setMessage("");
    const submissionId = crypto.randomUUID();
    const payload = { submissionId, name:String(data.get("name")??"").trim(), email:String(data.get("email")??"").trim(), location, coachingDate:String(data.get("coachingDate")??""), hours, notes:String(data.get("notes")??"").trim(), website:String(data.get("website")??"") };
    try {
      await fetch(SCRIPT_URL, { method:"POST", mode:"no-cors", headers:{"Content-Type":"text/plain;charset=utf-8"}, body:JSON.stringify(payload) });
      setReceipt(submissionId.slice(0,8).toUpperCase()); setStatus("success"); form.reset(); setSelectedLocation("");
    } catch { setStatus("error"); setMessage("The submission could not be sent. Check your connection and try again."); }
  }

  return <main>
    <header className="site-header"><a className="brand" href="#top"><span className="ball">⚽</span><span>Coaching Hours</span></a><span className="secure-note">Quick · Private · Mobile-friendly</span></header>
    <section className="hero" id="top">
      <div className="intro"><p className="eyebrow">Volunteer coaching tracker</p><h1>Log your time.<br/>Keep the game moving.</h1><p className="lede">Record each soccer coaching session in under a minute. Your hours are added directly to the team spreadsheet.</p><div className="steps"><div><b>1</b><span>Enter session details</span></div><div><b>2</b><span>Submit your hours</span></div><div><b>3</b><span>Totals update automatically</span></div></div></div>
      <div className="form-card">{status === "success" ? <div className="success-panel" role="status"><div className="check">✓</div><p className="eyebrow">Submission received</p><h2>Thank you for coaching.</h2><p>Your session has been sent to the coaching-hours spreadsheet.</p><p className="receipt">Confirmation: <strong>{receipt}</strong></p><button className="primary" onClick={()=>setStatus("idle")}>Log another session</button></div> :
      <form onSubmit={submitHours}><div className="form-heading"><div><p className="eyebrow">New entry</p><h2>Coaching session</h2></div><span>All fields marked * are required</span></div>
        <label>Coach name *<input name="name" type="text" autoComplete="name" maxLength={80} required placeholder="Full name"/></label>
        <label>Email <span className="optional">(optional, for corrections)</span><input name="email" type="email" autoComplete="email" maxLength={120} placeholder="name@example.com"/></label>
        <div className="row"><label>Coaching date *<input name="coachingDate" type="date" max={today} required/></label><label>Total hours *<input name="hours" type="number" min="0.25" max="24" step="0.25" inputMode="decimal" required placeholder="1.5"/></label></div>
        <label>Training location *<select name="location" required value={selectedLocation} onChange={e=>setSelectedLocation(e.target.value)}><option value="" disabled>Select a location</option>{LOCATIONS.map(x=><option key={x}>{x}</option>)}</select></label>
        {selectedLocation === "Other" && <label>Other location *<input name="otherLocation" type="text" maxLength={100} required placeholder="Enter the training location"/></label>}
        <label>Notes <span className="optional">(optional)</span><textarea name="notes" rows={3} maxLength={300} placeholder="Team, age group, or anything the coordinator should know"/></label>
        <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"/>{status === "error" && <p className="error" role="alert">{message}</p>}
        <button className="primary" disabled={status === "submitting"}>{status === "submitting" ? "Submitting…" : "Submit coaching hours"}</button><p className="privacy">Only authorized coordinators can view the spreadsheet.</p>
      </form>}</div>
    </section><footer>Coaching Hours Tracker · Built for the people behind the game</footer>
  </main>;
}
