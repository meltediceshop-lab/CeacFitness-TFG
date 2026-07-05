'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Plus } from 'lucide-react';
import type { BiologicalProfile, AgeRange } from '@/types/user';

const SPORTS = [
  'Running', 'Ciclismo', 'Natación', 'Boxeo', 'Yoga',
  'Pilates', 'CrossFit', 'Fútbol', 'Baloncesto', 'Tenis',
  'Padel', 'Artes marciales', 'Escalada', 'Baile'
];

const COMMON_INJURIES = [
  'Rodilla', 'Espalda baja', 'Hombro', 'Codo',
  'Muñeca', 'Cuello', 'Cadera', 'Tobillo'
];

const AGE_RANGES: { id: AgeRange; label: string }[] = [
  { id: 'under-25', label: 'Menos de 25' },
  { id: '25-34', label: '25-34' },
  { id: '35-44', label: '35-44' },
  { id: '45-54', label: '45-54' },
  { id: '55+', label: '55+' },
];

export function ProfileSetupScreen() {
  const { setScreen, userProfile, setUserProfile, userLevel, completeOnboarding } = useApp();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(userProfile.name || '');
  const [biologicalProfile, setBiologicalProfile] = useState<BiologicalProfile | null>(
    userProfile.biologicalProfile || null
  );
  const [weight, setWeight] = useState(userProfile.weight?.toString() || '');
  const [height, setHeight] = useState(userProfile.height?.toString() || '');
  const [ageRange, setAgeRange] = useState<AgeRange | null>(userProfile.ageRange || null);
  const [selectedSports, setSelectedSports] = useState<string[]>(userProfile.otherSports || []);
  const [sportsDays, setSportsDays] = useState(userProfile.otherSportsDays?.toString() || '0');
  const [selectedInjuries, setSelectedInjuries] = useState<string[]>(userProfile.injuries || []);
  const [customInjury, setCustomInjury] = useState('');
  const [excludedExercises, setExcludedExercises] = useState(
    userProfile.excludedExercises?.join(', ') || ''
  );

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      setScreen(userLevel === 'beginner' ? 'onboarding-beginner' : 'onboarding-advanced');
    }
  };

  const handleStep1 = () => {
    if (!name.trim() || !biologicalProfile || !weight || !height || !ageRange) return;

    setUserProfile({
      ...userProfile,
      name: name.trim(),
      biologicalProfile,
      weight: parseFloat(weight),
      height: parseFloat(height),
      ageRange,
    });
    setStep(2);
  };

  const toggleSport = (sport: string) => {
    if (selectedSports.includes(sport)) {
      setSelectedSports(selectedSports.filter(s => s !== sport));
    } else {
      setSelectedSports([...selectedSports, sport]);
    }
  };

  const handleStep2 = () => {
    setUserProfile({
      ...userProfile,
      otherSports: selectedSports,
      otherSportsDays: parseInt(sportsDays) || 0,
    });
    setStep(3);
  };

  const toggleInjury = (injury: string) => {
    if (selectedInjuries.includes(injury)) {
      setSelectedInjuries(selectedInjuries.filter(i => i !== injury));
    } else {
      setSelectedInjuries([...selectedInjuries, injury]);
    }
  };

  const addCustomInjury = () => {
    if (customInjury.trim() && !selectedInjuries.includes(customInjury.trim())) {
      setSelectedInjuries([...selectedInjuries, customInjury.trim()]);
      setCustomInjury('');
    }
  };

  const handleComplete = () => {
    const finalProfile = {
      ...userProfile,
      injuries: selectedInjuries,
      excludedExercises: excludedExercises.split(',').map(e => e.trim()).filter(Boolean),
    };
    setUserProfile(finalProfile);
    completeOnboarding(finalProfile);
  };

  return (
    <div className="min-h-dvh glass-bg flex flex-col px-6 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        <button
          onClick={handleBack}
          className="p-2 rounded-xl glass-btn shadow-sm hover:shadow-md transition-shadow"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </button>
        <div className="flex-1">
          <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        <span className="text-sm text-stone-400 font-medium">{step}/{totalSteps}</span>
      </motion.div>

      {/* Content */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-stone-900">
                  Cuéntanos un poco sobre ti
                </h2>
                <p className="text-stone-500">
                  Esto nos ayuda a personalizar tu experiencia
                </p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-stone-700">
                    ¿Cómo quieres que te llamemos?
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="glass-input py-5 px-4 rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-stone-700">Perfil biológico</Label>
                  <p className="text-stone-400 text-sm">Para ajustar las cargas de entrenamiento</p>
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => setBiologicalProfile('male')}
                      className={`flex-1 py-4 rounded-xl font-medium transition-all ${
                        biologicalProfile === 'male'
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                          : 'bg-white text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      Masculino
                    </button>
                    <button
                      onClick={() => setBiologicalProfile('female')}
                      className={`flex-1 py-4 rounded-xl font-medium transition-all ${
                        biologicalProfile === 'female'
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                          : 'bg-white text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      Femenino
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-stone-700">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="70"
                      className="glass-input py-5 px-4 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-stone-700">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="175"
                      className="glass-input py-5 px-4 rounded-xl"
                    />
                  </div>
                </div>

                {/* Age Range - New Field */}
                <div className="space-y-2">
                  <Label className="text-stone-700">Rango de edad</Label>
                  <p className="text-stone-400 text-sm">Nos ayuda a ajustar la intensidad del entrenamiento</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {AGE_RANGES.map(range => (
                      <button
                        key={range.id}
                        onClick={() => setAgeRange(range.id)}
                        className={`px-4 py-3 rounded-xl font-medium transition-all ${
                          ageRange === range.id
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                            : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleStep1}
                disabled={!name.trim() || !biologicalProfile || !weight || !height || !ageRange}
                className="w-full py-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 mt-4"
              >
                Continuar
              </Button>
            </motion.div>
          )}

          {/* Step 2: Other Sports */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-stone-900">
                  ¿Practicas otros deportes?
                </h2>
                <p className="text-stone-500">
                  Selecciona los que practiques regularmente (opcional)
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {SPORTS.map(sport => (
                  <button
                    key={sport}
                    onClick={() => toggleSport(sport)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedSports.includes(sport)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>

              {selectedSports.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-stone-700">
                    ¿Cuántos días a la semana entrenas otros deportes?
                  </Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setSportsDays(n.toString())}
                        className={`w-12 h-12 rounded-xl font-medium transition-all ${
                          sportsDays === n.toString()
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                            : 'bg-white text-stone-600 hover:bg-stone-100'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleStep2}
                className="w-full py-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 mt-4"
              >
                Continuar
              </Button>
            </motion.div>
          )}

          {/* Step 3: Injuries and Limitations */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 pb-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-stone-900">
                  Lesiones o limitaciones
                </h2>
                <p className="text-stone-500">
                  Esto nos ayuda a adaptar los ejercicios (opcional)
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {COMMON_INJURIES.map(injury => (
                    <button
                      key={injury}
                      onClick={() => toggleInjury(injury)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedInjuries.includes(injury)
                          ? 'bg-amber-500 text-white'
                          : 'bg-white text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {injury}
                    </button>
                  ))}
                </div>

                {/* Selected custom injuries */}
                {selectedInjuries.filter(i => !COMMON_INJURIES.includes(i)).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedInjuries
                      .filter(i => !COMMON_INJURIES.includes(i))
                      .map(injury => (
                        <Badge
                          key={injury}
                          variant="secondary"
                          className="bg-amber-100 text-amber-700 px-3 py-1 gap-1"
                        >
                          {injury}
                          <button
                            onClick={() => toggleInjury(injury)}
                            className="ml-1 hover:text-amber-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    value={customInjury}
                    onChange={(e) => setCustomInjury(e.target.value)}
                    placeholder="Otra lesión..."
                    className="glass-input py-3 px-4 rounded-xl"
                    onKeyDown={(e) => e.key === 'Enter' && addCustomInjury()}
                  />
                  <Button
                    onClick={addCustomInjury}
                    variant="outline"
                    className="px-4 rounded-xl"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-stone-700">
                  ¿Hay ejercicios que no puedas o no quieras hacer?
                </Label>
                <Textarea
                  value={excludedExercises}
                  onChange={(e) => setExcludedExercises(e.target.value)}
                  placeholder="Ej: Peso muerto, sentadillas profundas..."
                  className="glass-input rounded-xl min-h-[80px]"
                />
                <p className="text-stone-400 text-xs">Separa los ejercicios con comas</p>
              </div>

              <Button
                onClick={handleComplete}
                className="w-full py-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-200 mt-4"
              >
                Completar perfil
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
