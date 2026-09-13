"use client";

import { useState } from "react";
import Link from "next/link";
import { checkInBooking, type CheckinResult } from "./actions";

export default function CheckinPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setPending(true);
    setResult(null);
    const res = await checkInBooking(code);
    setResult(res);
    setPending(false);
    setCode("");
  };

  return (
    <div className="min-h-screen bg-[#F7F6FB] text-[#3D3170]">
      <header className="border-b border-[#E4E1F5] bg-white px-8 py-5">
        <p className="text-[11px] font-semibold tracking-wide text-[#6B5FD9]">KIGOO ADMIN</p>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#221B3D]">Boarding Check-in</h1>
          <nav className="flex gap-4 text-sm font-semibold text-[#7A7590]">
            <Link href="/trips" className="hover:text-[#221B3D]">
              Trips
            </Link>
            <Link href="/routes" className="hover:text-[#221B3D]">
              Routes
            </Link>
            <Link href="/verifications" className="hover:text-[#221B3D]">
              Verifications
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-md px-8 py-12">
        <div className="rounded-xl border border-[#E4E1F5] bg-white p-6">
          <p className="mb-4 text-sm text-[#7A7590]">
            Scan the rider&apos;s QR ticket with any scanner app, or type the booking code shown
            below it, then confirm to check them in.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. KG-A1B2C3"
              autoFocus
              className="w-full rounded-lg border border-[#E4E1F5] bg-white px-3 py-3 text-center text-lg font-semibold uppercase tracking-wide text-[#221B3D] focus:outline-none focus:ring-2 focus:ring-[#6B5FD9]"
            />
            <button
              type="submit"
              disabled={pending || !code.trim()}
              className="rounded-lg bg-[#221B3D] py-2.5 text-sm font-semibold text-white hover:bg-[#3D3170] disabled:opacity-50"
            >
              {pending ? "Checking…" : "Check In"}
            </button>
          </form>
        </div>

        {result && (
          <div
            className={`mt-4 rounded-xl border p-5 ${
              result.ok ? "border-[#1B9C6E] bg-[#E4F5EC]" : "border-[#D64545] bg-[#FBE9E7]"
            }`}
          >
            {result.ok ? (
              <>
                <p className="text-sm font-semibold text-[#1B9C6E]">✓ Checked in</p>
                <p className="mt-2 text-lg font-bold text-[#221B3D]">{result.passenger}</p>
                <p className="text-sm text-[#3D3170]">
                  Seat {result.seat} · {result.route}
                </p>
                <p className="text-xs text-[#7A7590]">{result.time}</p>
              </>
            ) : (
              <p className="text-sm font-semibold text-[#D64545]">{result.error}</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
