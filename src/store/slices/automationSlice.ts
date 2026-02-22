import type { AutomationSlice, SliceCreator } from '../types';
import { defaultAutomationSettings, defaultPlatformCredentials } from '../defaults';

export const createAutomationSlice: SliceCreator<AutomationSlice> = (set) => ({
  automationSettings: defaultAutomationSettings,
  updateAutomationSettings: (settings) =>
    set((state) => ({
      automationSettings: { ...state.automationSettings, ...settings },
    })),

  platformCredentials: defaultPlatformCredentials,
  updatePlatformCredential: (platform, updates) =>
    set((state) => ({
      platformCredentials: state.platformCredentials.map((p) =>
        p.platform === platform ? { ...p, ...updates } : p
      ),
    })),

  activities: [],
  addActivity: (activity) =>
    set((state) => ({
      activities: [activity, ...state.activities].slice(0, 50),
    })),
  clearActivities: () => set({ activities: [] }),

  isAutonomousModeActive: true,
  emergencyStopTriggeredAt: null,
  triggerEmergencyStop: () =>
    set((state) => ({
      isAutonomousModeActive: false,
      emergencyStopTriggeredAt: new Date().toISOString(),
      automationSettings: {
        ...state.automationSettings,
        autoPostDiscovery: false,
        aiImageSynthesis: false,
        smartScheduling: false,
        autoEngagement: false,
      },
    })),
  resumeAutonomousMode: () =>
    set({
      isAutonomousModeActive: true,
      emergencyStopTriggeredAt: null,
    }),
});
