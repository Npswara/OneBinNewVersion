import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Phone, Clock, Navigation, Filter, Map as MapIcon, Loader2, ExternalLink } from 'lucide-react';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

interface WasteBank {
  id: string | number;
  name: string;
  address: string;
  type: string[];
  phone?: string;
  hours?: string;
  distance: string;
  lat?: number;
  lng?: number;
  url?: string;
}

const initialWasteBanks: WasteBank[] = [
  {
    id: 1,
    name: "Central Green Bank",
    address: "Jl. Sudirman No. 12, Jakarta",
    type: ["Organic", "Plastic", "Paper"],
    phone: "+62 21 555 0123",
    hours: "08:00 - 17:00",
    distance: "1.2 km",
    lat: -6.2234,
    lng: 106.8234
  },
  {
    id: 2,
    name: "EcoCycle Hub",
    address: "Jl. Gatot Subroto No. 45, Jakarta",
    type: ["E-Waste", "Metal", "Glass"],
    phone: "+62 21 555 0456",
    hours: "09:00 - 18:00",
    distance: "2.5 km",
    lat: -6.2345,
    lng: 106.8345
  }
];

const wasteTypes = ["All", "Organic", "Plastic", "Paper", "E-Waste", "Metal", "Glass", "Hazardous"];

const FindWasteBank = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [banks, setBanks] = useState<WasteBank[]>(initialWasteBanks);

  const searchNearbyBanks = async (lat: number, lng: number) => {
    setIsSearching(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Find 5 waste banks or recycling centers near latitude ${lat}, longitude ${lng}. 
        For each, provide the name, address, latitude, and longitude in this exact format:
        [NAME] | [ADDRESS] | [LAT] | [LNG]`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: lat,
                longitude: lng
              }
            }
          }
        },
      });

      const text = response.text || "";
      const lines = text.split('\n');
      const newBanks: WasteBank[] = [];
      
      lines.forEach((line, index) => {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 4) {
          const name = parts[0].replace(/^\[|\]$/g, '');
          const address = parts[1].replace(/^\[|\]$/g, '');
          const bLat = parseFloat(parts[2].replace(/^\[|\]$/g, ''));
          const bLng = parseFloat(parts[3].replace(/^\[|\]$/g, ''));
          
          if (!isNaN(bLat) && !isNaN(bLng)) {
            newBanks.push({
              id: `real-${index}`,
              name,
              address,
              type: ["Recycling"],
              distance: "Calculating...",
              lat: bLat,
              lng: bLng,
              url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + address)}`
            });
          }
        }
      });

      if (newBanks.length > 0) {
        setBanks(newBanks);
      } else {
        // Fallback to grounding chunks if text parsing fails
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
          const fallbackBanks: WasteBank[] = chunks
            .filter(chunk => chunk.maps?.uri)
            .map((chunk, index) => ({
              id: `fallback-${index}`,
              name: chunk.maps?.title || "Waste Bank",
              address: chunk.maps?.uri || "",
              type: ["Recycling"],
              distance: "N/A",
              url: chunk.maps?.uri
            }));
          setBanks(fallbackBanks);
        }
      }
    } catch (error) {
      console.error("Error searching with Google Maps:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          setIsLocating(false);
          searchNearbyBanks(loc.lat, loc.lng);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
          alert("COULD NOT RETRIEVE LOCATION. PLEASE CHECK PERMISSIONS.");
        },
        { 
          enableHighAccuracy: false, // Faster fix
          timeout: 5000, 
          maximumAge: 600000 // Use cached location up to 10 mins old
        }
      );
    } else {
      setIsLocating(false);
      alert("GEOLOCATION IS NOT SUPPORTED BY YOUR BROWSER.");
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const x = deg2rad(lon2 - lon1) * Math.cos(deg2rad((lat1 + lat2) / 2));
    const y = deg2rad(lat2 - lat1);
    return Math.sqrt(x * x + y * y) * R;
  };

  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  const filteredBanks = React.useMemo(() => {
    return banks
      .filter(bank => {
        const matchesSearch = bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bank.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bank.type.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesType = selectedType === "All" || bank.type.includes(selectedType);
        
        return matchesSearch && matchesType;
      })
      .map(bank => {
        if (userLocation && bank.lat && bank.lng) {
          const dist = calculateDistance(userLocation.lat, userLocation.lng, bank.lat, bank.lng);
          return { ...bank, distance: `${dist.toFixed(1)} km` };
        }
        return bank;
      })
      .sort((a, b) => {
        if (userLocation && a.lat && b.lat) {
          return parseFloat(a.distance) - parseFloat(b.distance);
        }
        return 0;
      });
  }, [banks, searchTerm, selectedType, userLocation]);

  return (
    <div className="space-y-16">
      <section>
        <span className="swiss-label mb-4 block">Locator / 01</span>
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter mb-8 md:mb-12">
          FIND A <br />
          WASTE <span className="text-swiss-red italic">BANK.</span>
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="relative flex-grow w-full lg:max-w-2xl">
            <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 opacity-40" />
            <input 
              type="text" 
              placeholder="SEARCH BY NAME, ADDRESS, OR WASTE TYPE..."
              className="w-full bg-swiss-white border-2 border-swiss-black p-4 md:p-6 pl-12 md:pl-16 font-bold uppercase tracking-widest text-[10px] md:text-xs focus:outline-none focus:bg-swiss-black focus:text-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-4 w-full lg:w-auto">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
              <select 
                className="bg-swiss-white border-2 border-swiss-black p-4 md:p-6 pl-12 font-bold uppercase tracking-widest text-[10px] md:text-xs focus:outline-none appearance-none cursor-pointer"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {wasteTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleGetLocation}
              disabled={isLocating || isSearching}
              className="bg-swiss-white border-2 border-swiss-black p-4 md:p-6 font-bold uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-3 hover:bg-swiss-black hover:text-white transition-all disabled:opacity-50"
            >
              {isLocating || isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapIcon className="w-4 h-4" />}
              {userLocation ? "REFRESH NEARBY" : "USE MY LOCATION"}
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-swiss-black border border-swiss-black">
        {filteredBanks.map((bank, i) => (
          <motion.div 
            key={bank.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-swiss-white p-6 md:p-8 lg:p-12 hover:bg-swiss-black hover:text-white transition-colors group"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
              <div className="flex-1">
                <h3 className="text-2xl md:text-3xl font-black tracking-tighter mb-2">{bank.name}</h3>
                <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest break-all">{bank.address}</span>
                </div>
              </div>
              <span className="text-xl md:text-2xl font-black tracking-tighter text-swiss-red shrink-0">{bank.distance}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {bank.type.map(t => (
                <span key={t} className="px-3 py-1 border border-swiss-black group-hover:border-white text-[10px] font-bold uppercase tracking-widest">
                  {t}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 border-t border-swiss-black group-hover:border-white pt-8">
              <div className="space-y-1">
                <span className="swiss-label block opacity-40 group-hover:opacity-60">Contact</span>
                <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold">
                  {bank.phone ? <><Phone className="w-3 h-3" /> {bank.phone}</> : "N/A"}
                </div>
              </div>
              <div className="space-y-1">
                <span className="swiss-label block opacity-40 group-hover:opacity-60">Hours</span>
                <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold">
                  {bank.hours ? <><Clock className="w-3 h-3" /> {bank.hours}</> : "N/A"}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-12">
              <button 
                onClick={() => window.open(bank.url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bank.name + ' ' + bank.address)}`, '_blank')}
                className="flex-1 py-4 bg-swiss-black text-white group-hover:bg-swiss-white group-hover:text-swiss-black font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all"
              >
                <Navigation className="w-4 h-4" /> GET DIRECTIONS
              </button>
              {bank.url && (
                <button 
                  onClick={() => window.open(bank.url, '_blank')}
                  className="px-6 py-4 border-2 border-swiss-black group-hover:border-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all"
                >
                  <ExternalLink className="w-4 h-4" /> VIEW ON MAPS
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </section>

      {filteredBanks.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed border-swiss-black">
          <p className="text-xl font-black tracking-tighter opacity-40">NO WASTE BANKS FOUND IN THIS SECTOR.</p>
        </div>
      )}
    </div>
  );
};

export default FindWasteBank;
