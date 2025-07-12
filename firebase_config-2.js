// firebase-config.js
// Firebase configuration for MARC AI Assistant

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Your Firebase config object
const firebaseConfig = {
  apiKey: "AIzaSyAl6obOlOzpeR8-8EV-Tjq7rfN4vx_EqUU",
  authDomain: "marc-9d570.firebaseapp.com",
  projectId: "marc-9d570",
  storageBucket: "marc-9d570.firebasestorage.app",
  messagingSenderId: "924997385177",
  appId: "1:924997385177:web:70ca4796bd0252b9b577c8",
  measurementId: "G-TRHCLPVSRF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Connect to emulators in development (optional)
if (process.env.NODE_ENV === 'development') {
  // Uncomment these lines if you want to use Firebase emulators for local development
  // connectAuthEmulator(auth, "http://localhost:9099");
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectStorageEmulator(storage, "localhost", 9199);
  // connectFunctionsEmulator(functions, "localhost", 5001);
}

// Firestore collections structure
export const collections = {
  users: 'users',
  businesses: 'businesses', 
  campaigns: 'campaigns',
  socialPosts: 'social_posts',
  leads: 'leads',
  analytics: 'analytics',
  integrations: 'integrations',
  voiceCommands: 'voice_commands',
  tasks: 'tasks'
};

// User data structure
export const createUserDocument = async (user, additionalData = {}) => {
  if (!user) return;
  
  const userRef = doc(db, collections.users, user.uid);
  const snapshot = await getDoc(userRef);
  
  if (!snapshot.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = new Date();
    
    try {
      await setDoc(userRef, {
        displayName,
        email,
        photoURL,
        createdAt,
        plan: 'free',
        onboardingComplete: false,
        settings: {
          voiceEnabled: false,
          notifications: true,
          autoPost: false,
          timezone: 'America/New_York'
        },
        usage: {
          voiceCommands: 0,
          emailsSent: 0,
          postsCreated: 0,
          leadsGenerated: 0
        },
        limits: {
          voiceCommands: 100,
          emailsSent: 1000,
          postsCreated: 50,
          leadsGenerated: 100
        },
        ...additionalData
      });
    } catch (error) {
      console.error('Error creating user document:', error);
    }
  }
  
  return userRef;
};

// Business profile structure
export const createBusinessDocument = async (userId, businessData) => {
  const businessRef = doc(db, collections.businesses, userId);
  
  try {
    await setDoc(businessRef, {
      ...businessData,
      createdAt: new Date(),
      updatedAt: new Date(),
      integrations: [],
      socialAccounts: {},
      analytics: {
        totalLeads: 0,
        totalPosts: 0,
        totalEmailsSent: 0,
        conversionRate: 0
      }
    });
    return businessRef;
  } catch (error) {
    console.error('Error creating business document:', error);
  }
};

// Campaign structure
export const createCampaign = async (userId, campaignData) => {
  const campaignRef = doc(collection(db, collections.campaigns));
  
  try {
    await setDoc(campaignRef, {
      userId,
      ...campaignData,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cost: 0
      }
    });
    return campaignRef;
  } catch (error) {
    console.error('Error creating campaign:', error);
  }
};

// Social post structure
export const createSocialPost = async (userId, postData) => {
  const postRef = doc(collection(db, collections.socialPosts));
  
  try {
    await setDoc(postRef, {
      userId,
      ...postData,
      status: 'draft',
      createdAt: new Date(),
      scheduledFor: postData.scheduledFor || null,
      platforms: postData.platforms || [],
      metrics: {
        likes: 0,
        shares: 0,
        comments: 0,
        clicks: 0,
        reach: 0
      }
    });
    return postRef;
  } catch (error) {
    console.error('Error creating social post:', error);
  }
};

// Lead structure  
export const createLead = async (userId, leadData) => {
  const leadRef = doc(collection(db, collections.leads));
  
  try {
    await setDoc(leadRef, {
      userId,
      ...leadData,
      status: 'new',
      score: 0,
      createdAt: new Date(),
      lastContact: null,
      source: leadData.source || 'unknown',
      tags: leadData.tags || [],
      notes: []
    });
    return leadRef;
  } catch (error) {
    console.error('Error creating lead:', error);
  }
};

// Voice command logging
export const logVoiceCommand = async (userId, commandData) => {
  const commandRef = doc(collection(db, collections.voiceCommands));
  
  try {
    await setDoc(commandRef, {
      userId,
      ...commandData,
      timestamp: new Date(),
      processed: false,
      result: null
    });
    return commandRef;
  } catch (error) {
    console.error('Error logging voice command:', error);
  }
};

// Task structure
export const createTask = async (userId, taskData) => {
  const taskRef = doc(collection(db, collections.tasks));
  
  try {
    await setDoc(taskRef, {
      userId,
      ...taskData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      priority: taskData.priority || 'medium',
      estimatedDuration: taskData.estimatedDuration || null,
      actualDuration: null,
      result: null
    });
    return taskRef;
  } catch (error) {
    console.error('Error creating task:', error);
  }
};

// Analytics helper functions
export const updateUserUsage = async (userId, usageType, increment = 1) => {
  const userRef = doc(db, collections.users, userId);
  
  try {
    await updateDoc(userRef, {
      [`usage.${usageType}`]: increment(increment)
    });
  } catch (error) {
    console.error('Error updating user usage:', error);
  }
};

export const getUserAnalytics = async (userId, timeframe = '30d') => {
  // This would typically be handled by Cloud Functions
  // For now, we'll return a simple aggregation
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  try {
    const [postsQuery, leadsQuery, campaignsQuery] = await Promise.all([
      getDocs(query(
        collection(db, collections.socialPosts),
        where('userId', '==', userId),
        where('createdAt', '>=', thirtyDaysAgo)
      )),
      getDocs(query(
        collection(db, collections.leads),
        where('userId', '==', userId),
        where('createdAt', '>=', thirtyDaysAgo)
      )),
      getDocs(query(
        collection(db, collections.campaigns),
        where('userId', '==', userId),
        where('createdAt', '>=', thirtyDaysAgo)
      ))
    ]);
    
    return {
      postsCreated: postsQuery.size,
      leadsGenerated: leadsQuery.size,
      campaignsLaunched: campaignsQuery.size,
      timeframe
    };
  } catch (error) {
    console.error('Error getting user analytics:', error);
    return null;
  }
};

// Subscription management
export const updateUserPlan = async (userId, plan, features = {}) => {
  const userRef = doc(db, collections.users, userId);
  
  const planLimits = {
    free: {
      voiceCommands: 100,
      emailsSent: 1000,
      postsCreated: 50,
      leadsGenerated: 100
    },
    pro: {
      voiceCommands: 2000,
      emailsSent: 10000,
      postsCreated: 500,
      leadsGenerated: 1000
    },
    enterprise: {
      voiceCommands: -1, // unlimited
      emailsSent: -1,
      postsCreated: -1,
      leadsGenerated: -1
    }
  };
  
  try {
    await updateDoc(userRef, {
      plan,
      limits: planLimits[plan],
      planUpdatedAt: new Date(),
      features
    });
  } catch (error) {
    console.error('Error updating user plan:', error);
  }
};

// Export Firebase services
export { auth, db, storage, functions };
export default app;