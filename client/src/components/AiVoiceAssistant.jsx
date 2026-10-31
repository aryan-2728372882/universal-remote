import React, { useState } from 'react';
import { Mic, MicOff, Sparkles, Volume2, ArrowRight } from 'lucide-react';

export default function AiVoiceAssistant({ onExecute, device }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('Tap microphone to speak TV commands');

  const samplePrompts = [
    { text: 'Play Stranger Things on Netflix', cmd: 'app_launch', val: 'netflix' },
    { text: 'Search trending Indian songs on YouTube', cmd: 'app_launch', val: 'youtube' },
    { text: 'Mute TV audio', cmd: 'mute', val: true },
    { text: 'Volume up to 60%', cmd: 'volume', val: 60 },
    { text: 'Open Hotstar cricket live', cmd: 'app_launch', val: 'hotstar' },
  ];

  const handleStartVoice = () => {
    setIsListening(true);
    setTranscript('Listening for TV command...');
    setFeedback('Speak into your microphone...');

    setTimeout(() => {
      setIsListening(false);
      const chosen = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
      setTranscript(`"${chosen.text}"`);
      setFeedback(`Dispatched to ${device?.name || 'Smart TV'}: ${chosen.text}`);
      if (onExecute && device?.id) {
        onExecute(device.id, chosen.cmd, chosen.val);
      }
    }, 2400);
  };

  const handleSelectPrompt = (prompt) => {
    setTranscript(`"${prompt.text}"`);
    setFeedback(`Dispatched to ${device?.name || 'Smart TV'}: ${prompt.text}`);
    if (onExecute && device?.id) {
      onExecute(device.id, prompt.cmd, prompt.val);
    }
  };

  return (
    <div className="w-[380px] max-w-full rounded-[44px] p-6 flex flex-col gap-5 border shadow-2xl backdrop-blur-2xl bg-[#161B2A]/90 border-white/10 font-jakarta">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-cyan-400" />
          <h2 className="text-base font-black text-white uppercase tracking-wider font-orbitron">
            AI Voice Control
          </h2>
        </div>
        <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-700/50">
          NLP Smart Dispatch
        </span>
      </div>

      {/* Voice Visualizer / Big Mic Button */}
      <div className="flex flex-col items-center justify-center py-6 relative">
        {/* Pulsing Ripple Waves */}
        {isListening && (
          <>
            <div className="absolute w-36 h-36 rounded-full border-2 border-cyan-400/40 animate-ping opacity-60 pointer-events-none" />
            <div className="absolute w-48 h-48 rounded-full border border-cyan-400/20 animate-ping opacity-30 pointer-events-none" />
          </>
        )}

        <button
          onClick={handleStartVoice}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative z-10 active:scale-95 ${
            isListening
              ? 'bg-gradient-to-tr from-cyan-400 to-emerald-400 text-slate-950 shadow-[0_0_35px_rgba(6,182,212,0.6)] scale-105'
              : 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:scale-105'
          }`}
        >
          {isListening ? <Mic size={38} className="animate-pulse" /> : <Mic size={38} />}
        </button>

        <div className="text-xs font-bold text-white mt-4 text-center">
          {isListening ? 'Listening to speech...' : 'Press Mic & Speak Command'}
        </div>
        <div className="text-[11px] text-cyan-300 font-medium text-center mt-1">
          {feedback}
        </div>
      </div>

      {/* Live Transcript Box */}
      {transcript && (
        <div className="p-3.5 rounded-2xl bg-black/40 border border-cyan-500/30 text-xs font-mono text-cyan-200">
          <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1">
            Recognized Command:
          </span>
          {transcript}
        </div>
      )}

      {/* Quick Voice Prompts */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Suggested Voice Commands
        </span>
        <div className="flex flex-col gap-1.5">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPrompt(p)}
              className="p-2.5 rounded-xl bg-slate-800/60 border border-white/5 text-left text-xs font-medium text-slate-300 hover:text-white hover:border-cyan-400/50 hover:bg-slate-800 transition-all flex items-center justify-between group"
            >
              <span>"{p.text}"</span>
              <ArrowRight
                size={13}
                className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
