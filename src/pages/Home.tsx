import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, Recycle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-bold uppercase tracking-widest text-xs">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-24 md:space-y-32">
      {/* Hero Section - Massive Typography & Unexpected Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
        <div className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="swiss-label mb-4 block">Introduction / 01</span>
            <h1 className="text-[15vw] lg:text-[10vw] leading-[0.85] font-black tracking-tighter mb-8 md:mb-12">
              WASTE <br />
              IS <span className="text-swiss-red italic">VALUE.</span>
            </h1>
          </motion.div>
        </div>
        
        <div className="lg:col-span-4 lg:mt-32">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 md:space-y-8"
          >
            <p className="text-lg md:text-xl font-medium leading-tight tracking-tight">
              OneBin is a systematic approach to waste management. We prioritize objective functionality over aesthetic fluff.
            </p>
            <p className="text-xs leading-relaxed opacity-60">
              Categorize, track, and monetize your waste through a strict mathematical framework. Join a community of eco-warriors dedicated to measurable impact.
            </p>
            <div className="pt-4 md:pt-8">
              <Link to="/dashboard" className="swiss-button w-full sm:w-auto inline-flex items-center justify-center gap-4 group">
                Start Tracking <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Waste Types Section - Strict Grid Cards */}
      <section>
        <div className="mb-12 md:mb-24">
          <span className="swiss-label block mb-4">Categories / 02</span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">KNOW YOUR WASTE.</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-swiss-black border border-swiss-black">
          {[
            { 
              type: 'Organic', 
              icon: Leaf, 
              desc: 'Biodegradable waste like food scraps and garden trimmings. Perfect for composting.',
              color: 'hover:bg-green-500'
            },
            { 
              type: 'Recyclable', 
              icon: Recycle, 
              desc: 'Paper, plastic, glass, and metal that can be processed and used again.',
              color: 'hover:bg-blue-500'
            },
            { 
              type: 'Hazardous', 
              icon: AlertTriangle, 
              desc: 'Dangerous materials like batteries and electronics that need special handling.',
              color: 'hover:bg-swiss-red'
            },
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ backgroundColor: '#000', color: '#fff' }}
              className="bg-swiss-white p-8 md:p-12 flex flex-col h-[400px] md:h-[500px] transition-colors duration-500 group"
            >
              <div className="flex justify-between items-start mb-8 md:mb-12">
                <span className="text-3xl md:text-4xl font-black opacity-20 group-hover:opacity-100">0{i+1}</span>
                <item.icon className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h3 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 md:mb-6">{item.type}</h3>
              <p className="text-sm leading-relaxed opacity-60 group-hover:opacity-100 mb-8 md:mb-12 flex-grow">
                {item.desc}
              </p>
              <Link 
                to="/education"
                className="w-full py-4 border border-swiss-black font-bold uppercase tracking-widest text-[10px] group-hover:border-white transition-colors text-center"
              >
                Learn More
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* New Features Section - Find Waste Bank & AI Scanner */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-swiss-black border border-swiss-black">
        <div className="bg-swiss-white p-8 md:p-12 lg:p-24 flex flex-col justify-between h-[500px] md:h-[600px] group hover:bg-swiss-black hover:text-white transition-colors duration-500">
          <div>
            <span className="swiss-label block mb-4">Feature / 03</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 md:mb-8">FIND A <br />WASTE BANK.</h2>
            <p className="text-sm leading-relaxed opacity-60 group-hover:opacity-100 max-w-sm">
              Locate the nearest systematic waste collection point. Filter by waste type and get real-time directions.
            </p>
          </div>
          <Link to="/find-waste-bank" className="swiss-button w-full text-center group-hover:bg-white group-hover:text-black mt-8">
            Open Locator
          </Link>
        </div>

        <div className="bg-swiss-white p-8 md:p-12 lg:p-24 flex flex-col justify-between h-[500px] md:h-[600px] group hover:bg-swiss-red hover:text-white transition-colors duration-500">
          <div>
            <span className="swiss-label block mb-4 text-swiss-red group-hover:text-white">Feature / 04</span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 md:mb-8">AI WASTE <br />SCANNER.</h2>
            <p className="text-sm leading-relaxed opacity-60 group-hover:opacity-100 max-w-sm">
              Unsure how to recycle an item? Use our neural network to identify and categorize waste instantly.
            </p>
          </div>
          <Link to="/ai-scanner" className="swiss-button w-full text-center bg-swiss-red group-hover:bg-white group-hover:text-swiss-red border-none mt-8">
            Launch Scanner
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
