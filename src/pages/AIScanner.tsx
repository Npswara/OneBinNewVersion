import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Loader2, CheckCircle2, AlertCircle, Info, Recycle, Trash2, Leaf, Zap, StopCircle, X, HelpCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const AIScanner = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isAnalyzingLive, setIsAnalyzingLive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
        setIsLiveMode(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startLiveMode = async () => {
    setIsCameraStarting(true);
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(mediaStream);
      setIsLiveMode(true);
      setImage(null);
      setResult(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("CAMERA ACCESS DENIED. PLEASE ENABLE PERMISSIONS.");
    } finally {
      setIsCameraStarting(false);
    }
  };

  useEffect(() => {
    if (isLiveMode && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error("Video play failed:", e));
    }
  }, [isLiveMode, stream]);

  const stopLiveMode = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (liveIntervalRef.current) {
      clearInterval(liveIntervalRef.current);
      liveIntervalRef.current = null;
    }
    setIsLiveMode(false);
    setIsAnalyzingLive(false);
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Use actual video dimensions
      const width = video.videoWidth;
      const height = video.videoHeight;
      
      if (width === 0 || height === 0) return null;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        return canvas.toDataURL('image/jpeg', 0.8);
      }
    }
    return null;
  };

  const analyzeFrame = async (frameData: string) => {
    setIsAnalyzingLive(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      const base64Data = frameData.split(',')[1];
      
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { text: "Identify the waste item in this image. Provide the following in JSON format: { 'item': string, 'category': 'Organic' | 'Recyclable' | 'Hazardous' | 'Non-Recyclable' | 'Not Identified', 'instructions': string, 'impact': string, 'points': number }. If you cannot identify the item or it is not waste, set category to 'Not Identified' and item to 'Unknown Item'. Be concise and objective." },
              { inlineData: { mimeType: "image/jpeg", data: base64Data } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || "{}");
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingLive(false);
    }
  };

  const toggleLiveAnalysis = () => {
    // Removed Auto-Scan as per user request to simplify live scan to a capture feature
  };

  const captureAndAnalyze = () => {
    if (!isAnalyzingLive) {
      const frame = captureFrame();
      if (frame) {
        setImage(frame);
        stopLiveMode();
        // The analysis will be triggered by the analyzeWaste call or we can call it directly
        setTimeout(() => analyzeWasteFromImage(frame), 100);
      }
    }
  };

  const analyzeWasteFromImage = async (imageData: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      const base64Data = imageData.split(',')[1];
      
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { text: "Identify the waste item in this image. Provide the following in JSON format: { 'item': string, 'category': 'Organic' | 'Recyclable' | 'Hazardous' | 'Non-Recyclable' | 'Not Identified', 'instructions': string, 'impact': string, 'points': number }. If you cannot identify the item or it is not waste, set category to 'Not Identified' and item to 'Unknown Item'. Be concise and objective." },
              { inlineData: { mimeType: "image/jpeg", data: base64Data } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || "{}");
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("ANALYSIS FAILED. PLEASE TRY AGAIN.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (liveIntervalRef.current) clearInterval(liveIntervalRef.current);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const analyzeWaste = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const base64Data = image.split(',')[1];
      
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            parts: [
              { text: "Identify the waste item in this image. Provide the following in JSON format: { 'item': string, 'category': 'Organic' | 'Recyclable' | 'Hazardous' | 'Non-Recyclable' | 'Not Identified', 'instructions': string, 'impact': string, 'points': number }. If you cannot identify the item or it is not waste, set category to 'Not Identified' and item to 'Unknown Item'. Be concise and objective." },
              { inlineData: { mimeType: "image/jpeg", data: base64Data } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const data = JSON.parse(response.text || "{}");
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("ANALYSIS FAILED. PLEASE TRY AGAIN WITH A CLEARER IMAGE.");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Organic': return <Leaf className="w-8 h-8 text-green-600" />;
      case 'Recyclable': return <Recycle className="w-8 h-8 text-blue-600" />;
      case 'Hazardous': return <AlertCircle className="w-8 h-8 text-swiss-red" />;
      case 'Non-Recyclable': return <Trash2 className="w-8 h-8 text-gray-600" />;
      case 'Not Identified': return <HelpCircle className="w-8 h-8 text-orange-600" />;
      default: return <Trash2 className="w-8 h-8 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-16">
      <section>
        <div className="flex justify-between items-end mb-8 md:mb-12">
          <div>
            <span className="swiss-label mb-4 block">AI Scanner / 02</span>
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tighter">
              IDENTIFY <br />
              WASTE <span className="text-swiss-red italic">INSTANTLY.</span>
            </h1>
          </div>
          <div className="hidden md:block">
            <button 
              onClick={isLiveMode ? stopLiveMode : startLiveMode}
              disabled={isCameraStarting}
              className={`swiss-button flex items-center gap-3 ${isLiveMode ? 'bg-swiss-red text-white' : ''}`}
            >
              {isCameraStarting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isLiveMode ? (
                <StopCircle className="w-4 h-4" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {isCameraStarting ? 'STARTING...' : isLiveMode ? 'STOP LIVE' : 'LIVE SCANNER'}
            </button>
          </div>
        </div>
        <p className="text-sm leading-relaxed opacity-60 max-w-xl">
          Upload a photo or use the real-time scanner to identify waste items. Our neural network will categorize them and provide systematic disposal instructions.
        </p>
        <div className="mt-8 md:hidden">
          <button 
            onClick={isLiveMode ? stopLiveMode : startLiveMode}
            disabled={isCameraStarting}
            className={`swiss-button w-full flex items-center justify-center gap-3 ${isLiveMode ? 'bg-swiss-red text-white' : ''}`}
          >
            {isCameraStarting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLiveMode ? (
              <StopCircle className="w-4 h-4" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {isCameraStarting ? 'STARTING...' : isLiveMode ? 'STOP LIVE' : 'LIVE SCANNER'}
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-swiss-black border border-swiss-black">
        <div className="bg-swiss-white p-6 md:p-8 lg:p-12 flex flex-col items-center justify-center min-h-[400px]">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          
          {!image && !isLiveMode ? (
            <div className="flex flex-col gap-8 items-center">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="group flex flex-col items-center gap-6"
              >
                <div className="w-24 h-24 md:w-32 md:h-32 border-2 border-dashed border-swiss-black flex items-center justify-center group-hover:bg-swiss-black group-hover:text-white transition-all">
                  <Camera className="w-8 h-8 md:w-12 md:h-12" />
                </div>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Select Image for Analysis</span>
              </button>
              <div className="flex items-center gap-4 w-full">
                <div className="h-px bg-swiss-black opacity-20 flex-grow"></div>
                <span className="text-[10px] font-bold opacity-40">OR</span>
                <div className="h-px bg-swiss-black opacity-20 flex-grow"></div>
              </div>
              <button 
                onClick={startLiveMode}
                className="swiss-button flex items-center gap-3"
              >
                <Zap className="w-4 h-4" /> START LIVE SCANNER
              </button>
            </div>
          ) : isLiveMode ? (
            <div className="w-full space-y-8">
              <div className="aspect-square w-full border-2 border-swiss-black overflow-hidden relative bg-black">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-swiss-red text-white px-3 py-1 text-[10px] font-bold tracking-widest z-10">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  LIVE PREVIEW
                </div>
                {isAnalyzingLive && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={captureAndAnalyze}
                  disabled={isAnalyzingLive}
                  className="swiss-button flex items-center justify-center gap-3 bg-swiss-black text-white hover:bg-swiss-red transition-colors"
                >
                  <Camera className="w-5 h-5" /> CAPTURE
                </button>
                <button 
                  onClick={stopLiveMode}
                  className="swiss-button border-swiss-red text-swiss-red hover:bg-swiss-red hover:text-white flex items-center justify-center gap-3"
                >
                  <StopCircle className="w-5 h-5" /> STOP LIVE
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-8">
              <div className="aspect-square w-full border-2 border-swiss-black overflow-hidden relative">
                <img src={image!} alt="Waste" className="w-full h-full object-cover" />
                <button 
                  onClick={() => {
                    setImage(null);
                    setResult(null);
                  }}
                  className="absolute top-4 right-4 bg-swiss-black text-white p-2 hover:bg-swiss-red transition-colors z-20"
                  title="Clear Image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={analyzeWaste}
                disabled={loading}
                className="swiss-button w-full flex items-center justify-center gap-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> ANALYZING...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" /> START ANALYSIS
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="bg-swiss-white p-6 md:p-8 lg:p-12 flex flex-col min-h-[400px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-grow flex flex-col items-center justify-center text-center space-y-8"
              >
                <div className="w-16 h-16 md:w-24 md:h-24 border-t-4 border-swiss-red rounded-full animate-spin" />
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-40">Processing Neural Data...</p>
              </motion.div>
            ) : result ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8 md:space-y-12"
              >
                <div className="flex justify-between items-start border-b border-swiss-black pb-8 relative">
                  <div className="flex-1">
                    <span className="swiss-label block mb-2">Identification</span>
                    <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase break-words">{result.item}</h3>
                  </div>
                  <div className="shrink-0 ml-4 flex items-start gap-4">
                    {getCategoryIcon(result.category)}
                    <button 
                      onClick={() => {
                        setImage(null);
                        setResult(null);
                      }}
                      className="p-1 hover:text-swiss-red transition-colors"
                      title="Close Result"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-2">
                    <span className="swiss-label block opacity-40">Category</span>
                    <span className="text-lg md:text-xl font-black tracking-tighter uppercase">{result.category}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="swiss-label block opacity-40">Potential Points</span>
                    <span className="text-lg md:text-xl font-black tracking-tighter text-swiss-red">+{result.points}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    <span className="swiss-label">Disposal Instructions</span>
                  </div>
                  <p className="text-sm leading-relaxed font-medium">
                    {result.instructions}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="swiss-label">Environmental Impact</span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-60 italic">
                    {result.impact}
                  </p>
                </div>

                <div className="pt-8">
                  <button 
                    onClick={() => {
                      setImage(null);
                      setResult(null);
                    }}
                    className="swiss-button w-full bg-swiss-black text-white hover:bg-swiss-red transition-all"
                  >
                    NEW SCAN
                  </button>
                </div>
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-grow flex flex-col items-center justify-center text-center space-y-8"
              >
                <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-swiss-red" />
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-swiss-red">{error}</p>
              </motion.div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center opacity-20">
                <Camera className="w-24 h-24 md:w-32 md:h-32 mb-8" />
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Awaiting Input Data</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default AIScanner;
