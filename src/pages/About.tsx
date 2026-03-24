import React from 'react';
import { motion } from 'framer-motion';
import { Info, Leaf, Cpu, BarChart3, Globe } from 'lucide-react';

const About = () => {
  const stemConcepts = [
    {
      icon: <Leaf className="w-6 h-6" />,
      title: "Science (Sains)",
      description: "Kita nggak asal tebak. Kita riset data dekomposisi material. Misalnya, kenapa styrofoam itu 'jahat' banget buat bumi? Kita pake ilmu lingkungan buat edukasi kamu biar nggak salah pilih kemasan."
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "Technology (Teknologi)",
      description: "Bintang utamanya itu Gemini 3 Flash AI. Dia bisa ngenalin ribuan jenis objek sampah cuma lewat foto. Ditambah Google Maps API buat navigasi ke bank sampah terdekat secara real-time."
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Engineering (Rekayasa)",
      description: "Kita bangun pake React + TypeScript biar aplikasinya kenceng dan nggak gampang error. Database-nya pake Firebase Firestore, jadi semua data transaksi dan postingan kamu sinkron di semua device."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Mathematics (Matematika)",
      description: "Ada hitung-hitungan poin yang adil. Kita pake rumus matematika buat konversi berat sampah jadi saldo (earnings) dan nentuin posisi kamu di Leaderboard global secara otomatis."
    }
  ];

  const features = [
    { title: "AI Scanner", desc: "Foto sampahmu, AI langsung kasih tau itu jenis apa dan gimana cara buangnya." },
    { title: "Waste Bank Maps", desc: "Cari bank sampah terdekat biar sampahmu bisa dituker jadi cuan." },
    { title: "Eco-Community", desc: "Tempat ngobrol dan berbagi tips hijau bareng pejuang lingkungan lainnya." },
    { title: "Smart Dashboard", desc: "Pantau terus berapa banyak sampah yang udah kamu selamatkan dari TPA." }
  ];

  return (
    <div className="space-y-16 md:space-y-24">
      <section className="border-b border-swiss-black pb-8 md:pb-12">
        <span className="swiss-label mb-4 block">Kenalan Yuk! / 01</span>
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter uppercase">
          Cerita <br />
          <span className="text-swiss-red italic">OneBin.</span>
        </h1>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        <div className="lg:col-span-5 space-y-8">
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">OneBin itu apa sih?</h2>
          <p className="text-lg md:text-xl font-medium leading-relaxed uppercase tracking-tight">
            OneBin itu asisten pribadi kamu buat urusan sampah. Kita bikin aplikasi yang bisa 'liat' sampah kamu pake AI dan ngasih tau harus dibuang ke mana.
          </p>
          <p className="swiss-label text-gray-500 leading-relaxed">
            Jujur aja, pilah sampah itu ribet. Makanya kita bikin OneBin biar prosesnya jadi seru. Kamu bisa dapet poin, liat peringkat di leaderboard, sampe dapet duit (earning) pas setor ke bank sampah. Semuanya tercatat rapi di dashboard kamu. Nggak ada lagi alasan males pilah sampah!
          </p>
        </div>

        <div className="lg:col-span-7 bg-swiss-black text-white p-8 md:p-16 space-y-8">
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-swiss-red">Kenapa Kita Bikin Ini?</h2>
          <p className="text-xl md:text-2xl font-bold leading-tight uppercase tracking-tight">
            Biar nggak ada lagi sampah yang 'nyasar' ke laut atau numpuk di TPA gara-gara kita nggak tau cara olahnya.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-white/10">
            <div className="space-y-2">
              <span className="text-swiss-red font-black">01. Edukasi Tanpa Ribet</span>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Pake AI Scanner, kamu langsung pinter bedain mana yang organik, plastik, atau kertas dalam sekali jepret.</p>
            </div>
            <div className="space-y-2">
              <span className="text-swiss-red font-black">02. Sampah Jadi Cuan</span>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Kita hubungin kamu ke Bank Sampah. Sampahmu jadi bahan baku baru, kamu dapet saldo. Win-win solution!</p>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-12">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Fitur Jagoan.</h2>
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

      <section className="space-y-12">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase">Rahasia di Balik Layar (STEM).</h2>
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

      <section className="border-t border-swiss-black pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-swiss-red flex items-center justify-center text-white font-black text-xl">1</div>
          <span className="text-xl font-black tracking-tighter uppercase">OneBin: Solusi Sampah Modern.</span>
        </div>
        <span className="swiss-label opacity-40">Dibuat dengan ❤️ untuk Bumi / 2026</span>
      </section>
    </div>
  );
};

export default About;
