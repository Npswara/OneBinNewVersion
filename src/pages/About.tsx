import React from 'react';
import { motion } from 'motion/react';
import { Leaf, Cpu, BarChart3, Globe } from 'lucide-react';

const About = () => {
  const stemConcepts = [
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "Science",
      description: "We don't just guess. We research material decomposition data. For example, why is styrofoam so harmful to the earth? We use environmental science to educate you so you don't choose the wrong packaging."
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "Technology",
      description: "The main star is the Gemini 3 Flash AI. It can recognize thousands of types of waste objects just through a photo. Plus, the Google Maps API provides real-time navigation to the nearest waste bank."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Engineering",
      description: "We built this using React + TypeScript to ensure the application is fast and robust. The database uses Firebase Firestore, so all transaction data and your posts are synced across all devices."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Mathematics",
      description: "We use fair point calculations. Our mathematical formulas convert waste weight into earnings and automatically determine your position on the global leaderboard."
    }
  ];

  const features = [
    { title: "AI Scanner", desc: "Photograph your waste, and the AI will instantly tell you what type it is and how to dispose of it." },
    { title: "Waste Bank Maps", desc: "Find the nearest waste bank so your trash can be exchanged for cash." },
    { title: "Eco-Community", desc: "A place to chat and share green tips with fellow environmental warriors." },
    { title: "Smart Dashboard", desc: "Monitor exactly how much waste you have saved from the landfill." }
  ];

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Header Section */}
      <section className="border-b border-swiss-black pb-8 md:pb-12">
        <span className="swiss-label mb-4 block">Get to know us! / 01</span>
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter uppercase">
          The <br />
          <span className="text-swiss-red italic">OneBin</span> Story.
        </h1>
      </section>

      {/* Introduction Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        <div className="lg:col-span-5 space-y-8">
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">What is OneBin?</h2>
          <p className="text-lg md:text-xl font-medium leading-relaxed uppercase tracking-tight">
            OneBin is your personal assistant for waste management. We created an app that can 'see' your waste using AI and tell you where it should go.
          </p>
          <p className="swiss-label text-gray-500 leading-relaxed">
            Let's be honest, sorting waste is a hassle. That's why we built OneBin—to make the process fun. You can earn points, climb the leaderboard, and even get paid (earnings) when you deposit to a waste bank. Everything is neatly recorded on your dashboard. No more excuses for not sorting!
          </p>
        </div>

        <div className="lg:col-span-7 bg-swiss-black text-white p-8 md:p-16 space-y-8">
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-swiss-red">Why did we build this?</h2>
          <p className="text-xl md:text-2xl font-bold leading-tight uppercase tracking-tight">
            To ensure no more waste 'gets lost' in the ocean or piles up in landfills simply because we didn't know how to process it.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-white/10">
            <div className="space-y-2">
              <span className="text-swiss-red font-black">01. Hassle-Free Education</span>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                With the AI Scanner, you instantly learn to distinguish between organic, plastic, or paper in a single snap.
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-swiss-red font-black">02. Waste into Cash</span>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                We connect you to Waste Banks. Your waste becomes new raw material, and you get a balance. A win-win solution!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="space-y-12">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Core Features.</h2>
          <div className="h-px bg-swiss-black flex-grow"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f) => (
            <div key={f.title} className="border border-swiss-black p-6 space-y-4">
              <h3 className="text-xl font-black tracking-tighter uppercase text-swiss-red">{f.title}</h3>
              <p className="text-xs font-bold uppercase tracking-tight leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STEM Section */}
      <section className="space-y-12">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">The Secret Behind the Scenes (STEM).</h2>
          <div className="h-px bg-swiss-black flex-grow"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-swiss-black border border-swiss-black">
          {stemConcepts.map((concept, index) => (
            <motion.div 
              key={concept.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-swiss-white p-8 space-y-6 hover:bg-swiss-red hover:text-white transition-colors group"
            >
              <div className="w-12 h-12 border border-swiss-black group-hover:border-white flex items-center justify-center">
                {concept.icon}
              </div>
              <h3 className="text-xl font-black tracking-tighter uppercase">{concept.title}</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed opacity-60 group-hover:opacity-100">
                {concept.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer Branding */}
      <section className="border-t border-swiss-black pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-swiss-red flex items-center justify-center text-white font-black text-xl">1</div>
          <span className="text-xl font-black tracking-tighter uppercase">OneBin: Modern Waste Solution.</span>
        </div>
        <span className="swiss-label opacity-40">Made with ❤️ for the Earth / 2026</span>
      </section>
    </div>
  );
};

export default About;
