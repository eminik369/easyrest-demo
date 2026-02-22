import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  target?: string;
}

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  steps: TutorialStep[];
  startTutorial: (steps: TutorialStep[]) => void;
  stopTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
}

const TutorialContext = createContext<TutorialContextType | null>(null);

export function useTutorial() {
  return useContext(TutorialContext);
}

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TutorialStep[]>([]);

  const startTutorial = useCallback((newSteps: TutorialStep[]) => {
    setSteps(newSteps);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const stopTutorial = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    setSteps([]);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      stopTutorial();
    }
  }, [currentStep, steps.length, stopTutorial]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  return (
    <TutorialContext.Provider value={{ isActive, currentStep, steps, startTutorial, stopTutorial, nextStep, prevStep }}>
      {children}
      <AnimatePresence>
        {isActive && steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={stopTutorial} />

            {/* Tutorial card */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg mx-4 mb-4 sm:mb-0 bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Progress bar */}
              <div className="h-1 bg-gray-100">
                <motion.div
                  className="h-full bg-accent-gold"
                  animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-accent-gold" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-accent-gold uppercase tracking-wider">
                        Guida — Passo {currentStep + 1} di {steps.length}
                      </p>
                    </div>
                  </div>
                  <button onClick={stopTutorial} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{steps[currentStep].title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{steps[currentStep].description}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between px-8 py-5 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer ${
                    currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Precedente
                </button>
                <div className="flex gap-1.5">
                  {steps.map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === currentStep ? 'bg-accent-gold' : i < currentStep ? 'bg-accent-gold/40' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextStep}
                  className="flex items-center gap-1.5 text-sm font-medium text-accent-gold hover:text-accent-gold-dark transition-colors cursor-pointer"
                >
                  {currentStep === steps.length - 1 ? 'Chiudi' : 'Avanti'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </TutorialContext.Provider>
  );
}
