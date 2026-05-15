'use client';

import { useApp } from '@/context/AppContext';
import { WelcomeScreen } from '@/components/screens/WelcomeScreen';
import { OnboardingLevelScreen } from '@/components/screens/OnboardingLevelScreen';
import { OnboardingBeginnerScreen } from '@/components/screens/OnboardingBeginnerScreen';
import { OnboardingAdvancedScreen } from '@/components/screens/OnboardingAdvancedScreen';
import { ProfileSetupScreen } from '@/components/screens/ProfileSetupScreen';
import { CheckInScreen } from '@/components/screens/CheckInScreen';
import { DashboardScreen } from '@/components/screens/DashboardScreen';
import { WorkoutPreviewScreen } from '@/components/screens/WorkoutPreviewScreen';
import { EnergyCheckScreen } from '@/components/screens/EnergyCheckScreen';
import { WorkoutScreen } from '@/components/screens/WorkoutScreen';
import { HistoryScreen } from '@/components/screens/HistoryScreen';
import { ChatScreen } from '@/components/screens/ChatScreen';
import { ProfileScreen } from '@/components/screens/ProfileScreen';
import { NutritionScreen } from '@/components/screens/NutritionScreen';
import { WeeklyCheckInScreen } from '@/components/screens/WeeklyCheckInScreen';

export default function Home() {
  const { screen, showWeeklyCheckIn } = useApp();

  // Show weekly check-in if needed
  if (showWeeklyCheckIn) {
    return (
      <main className="min-h-screen">
        <WeeklyCheckInScreen />
      </main>
    );
  }

  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'onboarding-level':
        return <OnboardingLevelScreen />;
      case 'onboarding-beginner':
        return <OnboardingBeginnerScreen />;
      case 'onboarding-advanced':
        return <OnboardingAdvancedScreen />;
      case 'profile-setup':
        return <ProfileSetupScreen />;
      case 'check-in':
        return <CheckInScreen />;
      case 'dashboard':
        return <DashboardScreen />;
      case 'workout-preview':
        return <WorkoutPreviewScreen />;
      case 'energy-check':
        return <EnergyCheckScreen />;
      case 'workout':
        return <WorkoutScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'chat':
        return <ChatScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'nutrition':
        return <NutritionScreen />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <main className="min-h-screen">
      {renderScreen()}
    </main>
  );
}
