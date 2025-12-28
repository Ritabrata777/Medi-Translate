'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Activity, Shield, FileText, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden relative selection:bg-cyan-500/30">

      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0a0a] to-[#0a0a0a] pointer-events-none"></div>
      <div className="fixed top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>

      {/* Grid Pattern */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      {/* Hero Section */}
      <main className="relative flex flex-col items-center justify-center min-h-screen px-4 py-20 z-10">

        {/* Badge */}
        <div className="mb-8 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-900/10 backdrop-blur-sm shadow-[0_0_15px_rgba(6,182,212,0.2)] animate-in fade-in slide-in-from-top-5 duration-700">
          <span className="text-sm font-medium text-cyan-400 tracking-wide uppercase flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Next-Gen Medical Translation
          </span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-center mb-6 tracking-tight leading-tight max-w-4xl mx-auto">
          <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
            Decipher Medical
          </span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-x">
            Complexity Instantly
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-400 text-center mb-10 max-w-2xl mx-auto leading-relaxed">
          Transform dense jargon into clear, actionable insights using our advanced AI-driven translation engine.
          <span className="text-gray-200"> Secure, fast, and patient-focused.</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
          <Link href="/dashboard">
            <Button className="h-12 px-8 text-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all transform hover:scale-105">
              Launch Dashboard <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-5xl">
          {[
            { icon: Activity, title: 'Instant Analysis', desc: 'Real-time processing of complex lab reports using BioClinicalBERT.' },
            { icon: Shield, title: 'Privacy First', desc: 'Secure, local-first processing ensures your health data stays private.' },
            { icon: FileText, title: 'Smart Summaries', desc: 'Get clear, sectioned breakdowns of diagnoses and next steps.' }
          ].map((feature, i) => (
            <div key={i} className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-100">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}

    </div>
  );
}
