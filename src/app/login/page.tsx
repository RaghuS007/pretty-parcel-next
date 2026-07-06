"use client";
import { useRef, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getGuestViews, clearGuestViews, toast, useUser } from "@/lib/client-store";

function LoginInner() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";
  const { user, refresh } = useUser();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(0);
  const [msg, setMsg] = useState<React.ReactNode>("");
  const [busy, setBusy] = useState(false);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => { if (user) router.replace("/account"); }, [user, router]);
  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(x => x - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const send = async () => {
    if (name.trim().length < 2) return toast("Please enter your full name");
    if (!/^[6-9]\d{9}$/.test(mobile)) return toast("Please enter a valid 10-digit mobile number");
    setBusy(true);
    const r = await fetch("/api/auth/send-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, mobile })
    });
    const d = await r.json(); setBusy(false);
    if (!r.ok) return toast(d.error || "Could not send OTP");
    setStep(2); setTimer(30); setDigits(Array(6).fill(""));
    toast("OTP sent to +91 " + mobile);
    setTimeout(() => boxes.current[0]?.focus(), 50);
  };

  const onDigit = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "").slice(-1);
    const d = [...digits]; d[i] = clean; setDigits(d);
    if (clean && boxes.current[i + 1]) boxes.current[i + 1]!.focus();
  };
  const onKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && boxes.current[i - 1]) boxes.current[i - 1]!.focus();
  };
  const onPaste = (e: React.ClipboardEvent) => {
    const nums = (e.clipboardData.getData("text").match(/\d/g) || []).slice(0, 6);
    if (!nums.length) return;
    e.preventDefault();
    const d = Array(6).fill(""); nums.forEach((n, j) => d[j] = n); setDigits(d);
    boxes.current[Math.min(nums.length, 5)]?.focus();
  };

  const verify = async () => {
    const otp = digits.join("");
    if (otp.length < 6) return toast("Please enter all 6 digits");
    setBusy(true);
    const r = await fetch("/api/auth/verify-otp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, mobile, otp, guestViews: getGuestViews() }) // guest→account merge
    });
    const d = await r.json(); setBusy(false);
    if (!r.ok) return toast(d.error || "Verification failed");
    clearGuestViews();
    refresh();
    setMsg(<>
      {d.isNew ? <>Welcome to the parcel family, <strong>{name.split(" ")[0]}</strong> — your account has been created.</>
               : <>Welcome back, <strong>{name.split(" ")[0]}</strong>.</>}
      {d.mergedCount > 0 && <><br /><span style={{ fontSize: 12.5, color: "var(--rose-deep)" }}>
        {d.mergedCount} recently viewed item{d.mergedCount > 1 ? "s" : ""} synced to your account ✓</span></>}
    </>);
    setStep(3);
  };

  return (
    <div className="auth-wrap"><div className="auth-card">
      {step === 1 && (<>
        <h1>Welcome back ♡</h1>
        <p className="sub">No passwords here — just your name and number, and we&apos;ll send a one-time code.</p>
        <div className="field"><label htmlFor="n">Full name</label>
          <input id="n" placeholder="e.g. Ananya Sharma" autoComplete="name" value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="field"><label htmlFor="m">Mobile number</label>
          <input id="m" placeholder="10-digit mobile number" inputMode="numeric" maxLength={10} autoComplete="tel"
            value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, ""))} /></div>
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={send} disabled={busy}>
          {busy ? "Sending…" : "Send OTP"}</button>
        <p className="demo-hint">Dev note: without an MSG91 key, the OTP is always <strong>123456</strong> (also logged to the server console).</p>
      </>)}

      {step === 2 && (<>
        <h1>Enter your code</h1>
        <p className="sub">We&apos;ve sent a 6-digit OTP to <strong>+91 {mobile}</strong>.{" "}
          <button className="remove-link" style={{ margin: 0 }} onClick={() => setStep(1)}>Change</button></p>
        <div className="otp-row" onPaste={onPaste}>
          {digits.map((d, i) => (
            <input key={i} maxLength={1} inputMode="numeric" aria-label={`Digit ${i + 1}`} value={d}
              ref={el => { boxes.current[i] = el; }}
              onChange={e => onDigit(i, e.target.value)} onKeyDown={e => onKey(i, e)} />
          ))}
        </div>
        <button className="btn btn-primary" style={{ width: "100%" }} onClick={verify} disabled={busy}>
          {busy ? "Verifying…" : "Verify & Continue"}</button>
        <p className="resend">Didn&apos;t get it?{" "}
          <button disabled={timer > 0} onClick={() => { send(); }}>
            Resend OTP{timer > 0 ? ` (${timer}s)` : ""}</button></p>
        <p className="demo-hint">Dev note: enter <strong>123456</strong> to log in.</p>
      </>)}

      {step === 3 && (<>
        <h1>You&apos;re in! ✓</h1>
        <p className="sub">{msg}</p>
        <button className="btn btn-primary" style={{ width: "100%" }}
          onClick={() => router.push(next)}>Continue shopping</button>
      </>)}
    </div></div>
  );
}

export default function LoginPage() {
  return (<>
    <Header />
    <main className="page"><Suspense><LoginInner /></Suspense></main>
    <Footer />
  </>);
}
