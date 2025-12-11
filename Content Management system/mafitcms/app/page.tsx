'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Github, Mail } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';


export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="=w-full max-w-md"
      >


        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold trcaking-tighter">MediaCollege CMS Login</h1>
            <p className="text-gray-500"> Welkom Terug Voer Je Gegevens In!</p>
          </div>

    <form className="space-y-4">
      <div className="space-y-2">
    <label htmlFor="email">E-mail</label>
    <Input
      id="email"
      type="email"
      placeholder="voer je e-mail in"
      />
      </div>  
    </form>

      <div className="space-y-2">
    <label htmlFor="wachtwoord">Wachtwoord</label>
    <div className="relative">
    <Input
      id="Wachtwoord"
      type="Wachtwoord"
      value={password} required
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Wachtwoord"
      />
      <button
      type="button"
      onClick={()=> setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
        {showPassword ? <EyeOff size={20}/> : <Eye size={20} />}
      </button>
      </div>  
</div>

        </div>
      </motion.div>
    </div>
  );
}
