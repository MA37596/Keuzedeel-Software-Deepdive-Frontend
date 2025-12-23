"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft, Mail } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "new-password">("email");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function sendOtp() {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) setMessage("Fout: " + error.message);
    else {
      setMessage("✅ 6-cijfer code verstuurd! Check je inbox.");
      setStep("otp");
    }
  }

  async function verifyOtp() {
    setLoading(true);
    // Verify 6-digit code
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'recovery'
    });
    setLoading(false);
    if (error) setMessage("❌ Ongeldige code");
    else {
      setMessage("✅ Code goedgekeurd! Nieuw wachtwoord invullen.");
      setStep("new-password");
    }
  }

  async function updatePassword() {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ 
      password: newPassword 
    });
    setLoading(false);
    if (error) setMessage("Fout: " + error.message);
    else setMessage("✅ Wachtwoord gewijzigd! Terug naar login.");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <motion.div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <a href="/" className="flex items-center text-primary-600 hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug
          </a>

          <h1 className="text-2xl font-bold text-center">
            {step === "email" ? "Wachtwoord resetten" : 
             step === "otp" ? "Code invoeren" : 
             "Nieuw wachtwoord"}
          </h1>

          {step === "email" && (
            <form onSubmit={(e) => {e.preventDefault(); sendOtp()}} className="space-y-4">
              <Input
                type="email"
                placeholder="jouw@email.nl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Versturen..." : "Code sturen"}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={(e) => {e.preventDefault(); verifyOtp()}} className="space-y-4">
              <div>
                <label className="text-sm font-medium">6-cijfer code</label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g,''))}
                  className="text-center text-lg tracking-widest"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || otpCode.length !== 6}>
                {loading ? "Controleren..." : "Code verifiëren"}
              </Button>
            </form>
          )}

          {step === "new-password" && (
            <form onSubmit={(e) => {e.preventDefault(); updatePassword()}} className="space-y-4">
              <Input
                type="password"
                placeholder="Nieuw wachtwoord"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Wijzigen..." : "Wachtwoord wijzigen"}
              </Button>
            </form>
          )}

          {message && (
            <div className={`p-3 rounded-xl text-sm ${
              message.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200" :
              "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {message}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
