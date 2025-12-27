/**
 * Usage Tracking Integration for Actor Studio
 * 
 * This module integrates with the Polar License Manager usage tracking system
 * to collect anonymous usage data for improving the module.
 */

import { MODULE_ID } from '~/src/helpers/constants';
import { safeGetSetting } from '~/src/helpers/Utility';
import pkg from '../package.json' assert { type: "json" };

class UsageTracker {
  constructor() {
    this.moduleKey = 'actor_studio_v2';
    this.moduleName = 'Actor Studio';
    this.moduleVersion = '2.0.0-beta.7';
    // Select API URL based on env in package.json
    const env = pkg.env;
    if (env === 'dev') {
      this.apiUrl = 'http://localhost:4000/api/v1';
    } else {
      this.apiUrl = 'https://polaris.aardvark.games/api/v1';
    }
    this.sessionId = this.generateSessionId();
    this.consentGranted = false;
    this.offlineEvents = [];
    this.maxOfflineEvents = 50;
    this.initialized = false;
    
    console.log('[UsageTracker] Usage tracker created, waiting for initialization...');
  }

  /**
   * Initialize the usage tracker when settings are ready
   */
  initialize() {
    if (this.initialized) return;
    
    console.log('[UsageTracker] Initializing usage tracker...');
    
    // Initialize consent from module settings
    this.initializeConsent();
    
    // Set up periodic sync for offline events
    this.setupOfflineSync();
    
    // Track module loaded
    this.trackModuleLoaded();
    
    this.initialized = true;
    console.log('[UsageTracker] Usage tracker initialized successfully');
  }

  /**
   * Initialize consent from module settings
   */
  initializeConsent() {
    try {
      // Safely read consent setting (may not be registered in all environments)
      this.consentGranted = safeGetSetting(MODULE_ID, 'usage-tracking', false);
      console.log('[UsageTracker] Consent setting found or defaulted:', this.consentGranted);
    } catch (error) {
      console.warn('[UsageTracker] Error initializing consent:', error);
      this.consentGranted = false;
    }
  }



  /**
   * Generate a unique session ID
   */
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Track a usage event
   */
  async trackEvent(eventType, eventData = null) {
    if (!this.consentGranted) {
      console.log(`[UsageTracker] Tracking disabled - user consent required for ${this.moduleKey}`);
      return;
    }

    const event = {
      module_id: this.moduleKey,
      module_version: this.moduleVersion,
      foundry_version: game.version || 'unknown',
      session_id: this.sessionId,
      event_type: eventType,
      event_data: eventData ? JSON.stringify(eventData) : null
    };

    try {
      await this.sendEvent(event);
      console.log(`[UsageTracker] Event tracked successfully: ${eventType}`);
    } catch (error) {
      console.warn(`[UsageTracker] Failed to send event, storing offline:`, error);
      this.storeOfflineEvent(event);
    }
  }

  /**
   * Send event to API
   */
  async sendEvent(event) {
    const response = await fetch(`${this.apiUrl}/usage/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-module-api-key': this.moduleKey
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Store event for offline sync
   */
  storeOfflineEvent(event) {
    this.offlineEvents.push({
      ...event,
      timestamp: Date.now()
    });

    // Limit offline events to prevent memory issues
    if (this.offlineEvents.length > this.maxOfflineEvents) {
      this.offlineEvents.shift();
    }

    // Store in localStorage for persistence
    this.saveOfflineEvents();
  }

  /**
   * Save offline events to localStorage
   */
  saveOfflineEvents() {
    try {
      localStorage.setItem(`usage-tracker-${this.moduleKey}`, JSON.stringify(this.offlineEvents));
    } catch (error) {
      console.warn('[UsageTracker] Failed to save offline events:', error);
    }
  }

  /**
   * Load offline events from localStorage
   */
  loadOfflineEvents() {
    try {
      const stored = localStorage.getItem(`usage-tracker-${this.moduleKey}`);
      if (stored) {
        this.offlineEvents = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('[UsageTracker] Failed to load offline events:', error);
      this.offlineEvents = [];
    }
  }

  /**
   * Sync offline events
   */
  async syncOfflineEvents() {
    if (this.offlineEvents.length === 0) return;

    const eventsToSync = [...this.offlineEvents];
    this.offlineEvents = [];

    for (const event of eventsToSync) {
      try {
        await this.sendEvent(event);
        console.log(`[UsageTracker] Synced offline event: ${event.event_type}`);
      } catch (error) {
        console.warn(`[UsageTracker] Failed to sync event, keeping offline:`, error);
        this.offlineEvents.push(event);
      }
    }

    this.saveOfflineEvents();
  }

  /**
   * Set up periodic sync for offline events
   */
  setupOfflineSync() {
    // Load existing offline events
    this.loadOfflineEvents();

    // Sync every 5 minutes
    setInterval(() => {
      if (this.consentGranted && this.offlineEvents.length > 0) {
        this.syncOfflineEvents();
      }
    }, 5 * 60 * 1000);

    // Sync on page unload
    window.addEventListener('beforeunload', () => {
      if (this.consentGranted && this.offlineEvents.length > 0) {
        this.syncOfflineEventsOnUnload();
      }
    });
  }

  /**
   * Sync offline events on page unload using sendBeacon
   */
  syncOfflineEventsOnUnload() {
    if (this.offlineEvents.length === 0) return;

    const eventsToSync = [...this.offlineEvents];
    
    for (const event of eventsToSync) {
      try {
        const blob = new Blob([JSON.stringify(event)], { type: 'application/json' });
        navigator.sendBeacon(`${this.apiUrl}/usage/track`, blob);
      } catch (error) {
        console.warn('[UsageTracker] Failed to send beacon:', error);
      }
    }
  }



  /**
   * Track module loaded event
   */
  trackModuleLoaded() {
    this.trackEvent('module_loaded', {
      foundry_version: game.version,
      system_id: game.system.id,
      system_version: game.system.version,
      user_role: game.user.role,
      is_gm: game.user.isGM,
      user_type: this.getUserType()
    });
  }

  /**
   * Track session start
   */
  trackSessionStart() {
    this.trackEvent('session_start', {
      foundry_version: game.version,
      system_id: game.system.id,
      system_version: game.system.version,
      user_role: game.user.role,
      is_gm: game.user.isGM,
      user_type: this.getUserType(),
      world_name: game.world.name,
      world_id: game.world.id
    });
  }

  /**
   * Track session end
   */
  trackSessionEnd() {
    this.trackEvent('session_end');
  }

  /**
   * Track feature usage
   */
  trackFeatureUsed(featureName, additionalData = {}) {
    this.trackEvent('feature_used', {
      feature: featureName,
      ...additionalData
    });
  }

  /**
   * Track error
   */
  trackError(errorType, errorMessage, additionalData = {}) {
    this.trackEvent('error', {
      error_type: errorType,
      error_message: errorMessage,
      ...additionalData
    });
  }

  /**
   * Track actor creation
   */
  trackActorCreation(actorType, additionalData = {}) {
    this.trackFeatureUsed('actor_creation', {
      actor_type: actorType,
      ...additionalData
    });
  }

  /**
   * Track actor studio opened
   */
  trackActorStudioOpened(actorName, folderName, actorType) {
    this.trackFeatureUsed('actor_studio_opened', {
      actor_name: actorName,
      folder_name: folderName,
      actor_type: actorType,
      user_role: game.user.role,
      is_gm: game.user.isGM,
      user_type: this.getUserType(),
      foundry_version: game.version,
      system_id: game.system.id
    });
  }

  /**
   * Track advancement capture
   */
  trackAdvancementCapture(initial = false) {
    this.trackFeatureUsed('advancement_capture', {
      initial: initial
    });
  }

  /**
   * Track compendium interaction
   */
  trackCompendiumInteraction(compendiumName, action) {
    this.trackFeatureUsed('compendium_interaction', {
      compendium: compendiumName,
      action: action
    });
  }

  /**
   * Get descriptive user type based on FoundryVTT user role
   */
  getUserType() {
    const role = game.user.role;
    const isGM = game.user.isGM;
    
    // Map FoundryVTT roles to more descriptive types
    const userTypeMap = {
      'none': 'none',
      'player': 'player',
      'trusted': 'trusted_player',
      'assistant': 'assistant',
      'gamemaster': 'gamemaster'
    };
    
    let userType = userTypeMap[role] || 'unknown';
    
    // Add additional context for GMs
    if (isGM) {
      userType = 'gamemaster';
    }
    
    return userType;
  }
}

// Create global instance
window.GASUsageTracker = new UsageTracker();

// Export for use in other modules
export default window.GASUsageTracker; 