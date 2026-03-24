import React, { useState } from 'react';
import { BookOpen, Recycle, Trash2, Leaf, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Quiz Data
const quizzes = {
  Organic: [
    {
      question: "Which of the following is organic waste?",
      options: ["Plastic Bottle", "Banana Peel", "Glass Jar", "Battery"],
      correct: 1
    },
    {
      question: "What is the best way to process organic waste at home?",
      options: ["Burning", "Composting", "Throwing in river", "Burying in plastic"],
      correct: 1
    },
    {
      question: "How long does a banana peel take to decompose?",
      options: ["2 years", "2-10 days", "2-5 weeks", "Forever"],
      correct: 2
    }
  ],
  Recyclable: [
    {
      question: "Which symbol represents recycling?",
      options: ["Red Stop Sign", "Green Mobius Loop", "Yellow Triangle", "Blue Circle"],
      correct: 1
    },
    {
      question: "Which of these items is typically recyclable?",
      options: ["Used Pizza Box (greasy)", "Plastic Water Bottle", "Broken Mirror", "Ceramics"],
      correct: 1
    },
    {
      question: "What should you do before recycling a plastic bottle?",
      options: ["Fill it with water", "Crush it", "Rinse it out", "Paint it"],
      correct: 2
    }
  ],
  Hazardous: [
    {
      question: "Why are batteries considered hazardous waste?",
      options: ["They smell bad", "They contain toxic heavy metals", "They are sharp", "They are too heavy"],
      correct: 1
    },
    {
      question: "Where should you dispose of old paint?",
      options: ["Down the drain", "In the regular trash", "Hazardous waste facility", "In the garden"],
      correct: 2
    },
    {
      question: "Which of these is E-waste?",
      options: ["Old Newspaper", "Broken Smartphone", "Banana Peel", "Cardboard Box"],
      correct: 1
    }
  ],
  Residual: [
    {
      question: "What is residual waste?",
      options: ["Waste that can be recycled", "Waste that can be composted", "Waste that cannot be reused or recycled", "Hazardous waste"],
      correct: 2
    },
    {
      question: "Which of these is residual waste?",
      options: ["Aluminum Can", "Dirty Diaper", "Cardboard Box", "Apple Core"],
      correct: 1
    },
    {
      question: "What is the best way to reduce residual waste?",
      options: ["Buying more plastic", "Choosing reusable items", "Burning it", "Throwing it in the ocean"],
      correct: 1
    }
  ]
};

const QuizModal = ({ type, onClose }: { type: string, onClose: () => void }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const questions = quizzes[type as keyof typeof quizzes];

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === questions[currentQuestion].correct) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
        setIsAnswered(false);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-swiss-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="bg-swiss-white p-6 md:p-12 max-w-2xl w-full border-t-8 border-swiss-red"
      >
        {!showResult ? (
          <>
            <div className="flex justify-between items-baseline mb-8 md:mb-12 border-b border-swiss-black pb-4">
              <h3 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">{type}.</h3>
              <span className="swiss-label">Question {currentQuestion + 1} / {questions.length}</span>
            </div>
            
            <p className="text-xl md:text-2xl font-bold tracking-tight mb-8 md:mb-12 leading-tight uppercase">{questions[currentQuestion].question}</p>
            
            <div className="grid grid-cols-1 gap-px bg-swiss-black border border-swiss-black">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={isAnswered}
                  className={`w-full p-6 text-left transition-all font-bold uppercase tracking-widest text-xs ${
                    isAnswered 
                      ? index === questions[currentQuestion].correct 
                        ? "bg-swiss-red text-white"
                        : index === selectedOption 
                          ? "bg-swiss-black text-white"
                          : "bg-swiss-white opacity-30"
                      : "bg-swiss-white hover:bg-swiss-black hover:text-white"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{option}</span>
                    {isAnswered && index === questions[currentQuestion].correct && <CheckCircle className="w-4 h-4" />}
                    {isAnswered && index === selectedOption && index !== questions[currentQuestion].correct && <XCircle className="w-4 h-4" />}
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center space-y-8 md:space-y-12 py-8 md:py-12">
            <div>
              <span className="swiss-label block mb-4">Results</span>
              <h3 className="text-6xl md:text-8xl font-black tracking-tighter mb-4">{score}/{questions.length}</h3>
              <p className="text-xs uppercase font-bold tracking-[0.3em] opacity-60">Quiz Completed Successfully.</p>
            </div>
            <button 
              onClick={onClose}
              className="swiss-button w-full"
            >
              Return to Education
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const Education = () => {
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);

  return (
    <div className="space-y-24">
      <div className="flex flex-col md:flex-row justify-between items-baseline border-b border-swiss-black pb-4 gap-4">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter">EDUCATION.</h1>
        <span className="swiss-label">Knowledge / Impact</span>
      </div>

      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-12 lg:col-span-6">
          <p className="text-xl sm:text-2xl md:text-4xl font-black tracking-tighter uppercase leading-none">
            Learn how to properly sort your waste and make a positive impact on our environment.
          </p>
        </div>
        <div className="col-span-12 lg:col-span-6 flex items-end lg:justify-end">
          <span className="swiss-label max-w-xs lg:text-right">
            Objective functionality meets environmental responsibility. Sorting is the first step towards a circular economy.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-1 border-t border-swiss-black bg-swiss-black">
        {/* Organic Waste */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="col-span-12 md:col-span-6 bg-swiss-white p-8 md:p-12 space-y-8 group hover:bg-swiss-black hover:text-white transition-colors"
        >
          <div className="flex justify-between items-start">
            <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">Organic.</h2>
            <span className="text-5xl md:text-6xl font-black text-swiss-red group-hover:text-white opacity-20">01</span>
          </div>
          <p className="text-lg md:text-xl font-bold tracking-tight uppercase">
            Biodegradable waste that comes from either a plant or an animal.
          </p>
          <div className="space-y-4">
            <h3 className="swiss-label">Examples:</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-black uppercase tracking-tighter">
              <li>• Fruit peels</li>
              <li>• Leftover food</li>
              <li>• Eggshells</li>
              <li>• Coffee grounds</li>
              <li>• Garden waste</li>
            </ul>
          </div>
          <div className="pt-8 border-t border-gray-100 group-hover:border-gray-800 flex justify-between items-center">
            <span className="swiss-label text-swiss-red group-hover:text-white">Tip: Can be composted.</span>
            <button 
              onClick={() => setActiveQuiz('Organic')}
              className="px-4 py-2 border border-swiss-black group-hover:border-white font-bold uppercase tracking-widest text-[10px] transition-colors"
            >
              Take Quiz
            </button>
          </div>
        </motion.div>

        {/* Recyclable Waste */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="col-span-12 md:col-span-6 bg-swiss-white p-8 md:p-12 space-y-8 group hover:bg-swiss-black hover:text-white transition-colors"
        >
          <div className="flex justify-between items-start">
            <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">Recyclable.</h2>
            <span className="text-5xl md:text-6xl font-black text-swiss-red group-hover:text-white opacity-20">02</span>
          </div>
          <p className="text-lg md:text-xl font-bold tracking-tight uppercase">
            Items that can be processed and used to make new products.
          </p>
          <div className="space-y-4">
            <h3 className="swiss-label">Examples:</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-black uppercase tracking-tighter">
              <li>• Plastic bottles</li>
              <li>• Paper & Card</li>
              <li>• Glass jars</li>
              <li>• Aluminum cans</li>
              <li>• Metal tins</li>
            </ul>
          </div>
          <div className="pt-8 border-t border-gray-100 group-hover:border-gray-800 flex justify-between items-center">
            <span className="swiss-label text-swiss-red group-hover:text-white">Tip: Rinse containers.</span>
            <button 
              onClick={() => setActiveQuiz('Recyclable')}
              className="px-4 py-2 border border-swiss-black group-hover:border-white font-bold uppercase tracking-widest text-[10px] transition-colors"
            >
              Take Quiz
            </button>
          </div>
        </motion.div>

        {/* Hazardous Waste */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="col-span-12 md:col-span-6 bg-swiss-white p-8 md:p-12 space-y-8 group hover:bg-swiss-black hover:text-white transition-colors"
        >
          <div className="flex justify-between items-start">
            <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">Hazardous.</h2>
            <span className="text-5xl md:text-6xl font-black text-swiss-red group-hover:text-white opacity-20">03</span>
          </div>
          <p className="text-lg md:text-xl font-bold tracking-tight uppercase">
            Waste that poses substantial threats to public health or environment.
          </p>
          <div className="space-y-4">
            <h3 className="swiss-label">Examples:</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-black uppercase tracking-tighter">
              <li>• Batteries</li>
              <li>• Light bulbs</li>
              <li>• Paint & Solvents</li>
              <li>• Chemicals</li>
              <li>• Medical waste</li>
            </ul>
          </div>
          <div className="pt-8 border-t border-gray-100 group-hover:border-gray-800 flex justify-between items-center">
            <span className="swiss-label text-swiss-red group-hover:text-white">Tip: Use collection points.</span>
            <button 
              onClick={() => setActiveQuiz('Hazardous')}
              className="px-4 py-2 border border-swiss-black group-hover:border-white font-bold uppercase tracking-widest text-[10px] transition-colors"
            >
              Take Quiz
            </button>
          </div>
        </motion.div>

        {/* Residual Waste */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="col-span-12 md:col-span-6 bg-swiss-white p-8 md:p-12 space-y-8 group hover:bg-swiss-black hover:text-white transition-colors"
        >
          <div className="flex justify-between items-start">
            <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase">Residual.</h2>
            <span className="text-5xl md:text-6xl font-black text-swiss-red group-hover:text-white opacity-20">04</span>
          </div>
          <p className="text-lg md:text-xl font-bold tracking-tight uppercase">
            Non-hazardous waste that cannot be reused or recycled.
          </p>
          <div className="space-y-4">
            <h3 className="swiss-label">Examples:</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-black uppercase tracking-tighter">
              <li>• Diapers</li>
              <li>• Ceramics</li>
              <li>• Dirty packaging</li>
              <li>• Styrofoam</li>
              <li>• Broken glass</li>
            </ul>
          </div>
          <div className="pt-8 border-t border-gray-100 group-hover:border-gray-800 flex justify-between items-center">
            <span className="swiss-label text-swiss-red group-hover:text-white">Tip: Choose reusables.</span>
            <button 
              onClick={() => setActiveQuiz('Residual')}
              className="px-4 py-2 border border-swiss-black group-hover:border-white font-bold uppercase tracking-widest text-[10px] transition-colors"
            >
              Take Quiz
            </button>
          </div>
        </motion.div>
      </div>

      <div className="border border-swiss-black p-6 md:p-16 space-y-12">
        <h2 className="text-2xl md:text-5xl font-black tracking-tighter uppercase text-center">Why Sorting Matters?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div className="space-y-4">
            <span className="text-4xl font-black text-swiss-red">01.</span>
            <h3 className="text-2xl font-black tracking-tighter uppercase">Reduces Landfill.</h3>
            <p className="swiss-label text-gray-500">Proper sorting diverts waste from landfills, reducing pollution and greenhouse gas emissions.</p>
          </div>
          <div className="space-y-4">
            <span className="text-4xl font-black text-swiss-red">02.</span>
            <h3 className="text-2xl font-black tracking-tighter uppercase">Saves Energy.</h3>
            <p className="swiss-label text-gray-500">Recycling materials requires less energy than producing new products from raw materials.</p>
          </div>
          <div className="space-y-4">
            <span className="text-4xl font-black text-swiss-red">03.</span>
            <h3 className="text-2xl font-black tracking-tighter uppercase">Economic Value.</h3>
            <p className="swiss-label text-gray-500">Recycling creates jobs and turns waste into valuable resources for new products.</p>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      <AnimatePresence>
        {activeQuiz && (
          <QuizModal type={activeQuiz} onClose={() => setActiveQuiz(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Education;
