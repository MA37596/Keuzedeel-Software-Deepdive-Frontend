"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Eye, EyeOff, Github, Mail } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/lib/supabaseClient"; // <-- TOEGEVOEGD

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // <-- TOEGEVOEGD
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // <-- TOEGEVOEGD

  // <-- TOEGEVOEGD: Supabase login functie
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    // Redirect naar dashboard of iets dergelijks
    window.location.href = "/dashboard";
    console.log("Ingelogd:", data.user);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter">
              MediaCollege CMS Login
            </h1>
            <p className="text-gray-500">
              Welkom Terug, voer je gegevens in!
            </p>
          </div>

          {/* <-- GEWIJZIGD: onSubmit={handleSubmit} */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* E-mail */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Voer je e-mail in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Wachtwoord + oog icoon */}
            <div className="space-y-2">
              <label htmlFor="wachtwoord" className="text-sm font-medium">
                Wachtwoord
              </label>
              <div className="relative">
                <Input
                  id="wachtwoord"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Wachtwoord"
                  required
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={
                    showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"
                  }
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <p className="text-sm text-red-500 p-2 bg-red-50 rounded-md">
                {errorMsg}
              </p>
            )}

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <label htmlFor="remember">Onthoud mij</label>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Inloggen..." : "Inloggen"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
