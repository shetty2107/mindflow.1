import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface CloakedFigureProps {
  stage: "button" | "journey" | "hidden";
  onComplete?: () => void;
}

export function CloakedFigure({ stage, onComplete }: CloakedFigureProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (stage === "journey") {
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

  if (stage === "hidden" || !show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={
        stage === "button"
          ? { opacity: 1, scale: 1, y: 0 }
          : {
              opacity: [1, 1, 0],
              scale: [1, 1.1, 0.9],
              y: [0, -10, 0],
            }
      }
      transition={
        stage === "button"
          ? { duration: 0.5, ease: "easeOut" }
          : { duration: 2.5, times: [0, 0.6, 1] }
      }
      className="absolute pointer-events-none z-50"
      style={
        stage === "button"
          ? { bottom: "120%", left: "50%", transform: "translateX(-50%)" }
          : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
      }
    >
      <div className="relative w-20 h-24 md:w-24 md:h-32">
        {/* Hood */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-b from-slate-900 to-slate-800 dark:from-black dark:to-slate-900 rounded-full shadow-2xl" />
        
        {/* Hood Shadow (face area) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-6 md:w-10 md:h-7 bg-black/90 rounded-full" />
        
        {/* Cloak Body */}
        <div className="absolute top-12 md:top-14 left-1/2 -translate-x-1/2 w-16 h-16 md:w-20 md:h-20 bg-gradient-to-b from-slate-800 to-slate-900 dark:from-slate-900 dark:to-black rounded-b-full shadow-2xl" style={{ clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)" }} />
        
        {/* Mysterious Glow */}
        {stage === "journey" && (
          <motion.div
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: 1,
              ease: "easeInOut",
            }}
            className="absolute -inset-4 bg-purple-500/20 dark:bg-purple-400/30 rounded-full blur-xl"
          />
        )}
        
        {/* Eyes Glow (only when standing in pride) */}
        {stage === "journey" && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.5, times: [0, 0.2, 0.7, 1] }}
              className="absolute top-6 md:top-7 left-1/2 -translate-x-1/2 flex gap-2"
            >
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-lg shadow-cyan-500/50" />
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-lg shadow-cyan-500/50" />
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  );
}
