"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`, // ← later
    });

    setLoading(false);
    if (error) {
      setMessage("Fout: " + error.message);
    } else {
      setMessage("Reset link verstuurd! Check je inbox.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <a href="/" className="flex items-center text-primary-600 hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar login
          </a>

          <h1 className="text-2xl font-bold text-center">Wachtwoord resetten</h1>

          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail</label>
              <Input
                type="email"
                placeholder="Voer je e-mail in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {message && (
              <p className={`text-sm p-2 rounded-md ${message.includes("Fout") ? "text-red-500 bg-red-50" : "text-green-500 bg-green-50"}`}>
                {message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Versturen..." : "Reset link sturen"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
