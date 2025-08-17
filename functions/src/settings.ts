import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import mongoose from "mongoose";
import {
  connectToMongo,
  requireRole,
  verifyAuth,
  AuthenticatedRequest,
  logAccess,
} from "./middleware";

// Settings Schema
const settingsSchema = new mongoose.Schema({
  siteTitle: {
    type: String,
    default: "MOZ Portal",
  },
  siteDescription: {
    type: String,
    default: "Ministry of Works and Transport - Infrastructure Transparency Portal",
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  maintenanceMessage: {
    type: String,
    default: "Site is under maintenance. Please check back later.",
  },
  enableRegistration: {
    type: Boolean,
    default: true,
  },
  enablePublicProjects: {
    type: Boolean,
    default: true,
  },
  contactEmail: {
    type: String,
    default: "info@moz.gov",
  },
  contactPhone: {
    type: String,
    default: "",
  },
  contactAddress: {
    type: String,
    default: "",
  },
  socialLinks: {
    facebook: String,
    twitter: String,
    linkedin: String,
    youtube: String,
  },
  analyticsId: {
    type: String,
    default: "",
  },
  mapboxToken: {
    type: String,
    default: "",
  },
  defaultLanguage: {
    type: String,
    enum: ["en", "pt"],
    default: "en",
  },
  supportedLanguages: {
    type: [String],
    default: ["en", "pt"],
  },
  projectSettings: {
    requireApproval: {
      type: Boolean,
      default: true,
    },
    allowAttachments: {
      type: Boolean,
      default: true,
    },
    maxAttachmentSize: {
      type: Number,
      default: 10485760, // 10MB
    },
    allowedFileTypes: {
      type: [String],
      default: ["pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png"],
    },
  },
  emailSettings: {
    enableNotifications: {
      type: Boolean,
      default: true,
    },
    notifyOnRegistration: {
      type: Boolean,
      default: true,
    },
    notifyOnProjectCreate: {
      type: Boolean,
      default: true,
    },
    notifyOnProjectUpdate: {
      type: Boolean,
      default: true,
    },
    adminEmails: {
      type: [String],
      default: [],
    },
  },
  apiSettings: {
    enableApi: {
      type: Boolean,
      default: true,
    },
    rateLimit: {
      type: Number,
      default: 100, // requests per minute
    },
    requireApiKey: {
      type: Boolean,
      default: false,
    },
  },
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastModifiedBy: {
    type: String,
    default: "system",
  },
});

// Create or get Settings model
const getSettingsModel = () => {
  if (mongoose.models.Settings) {
    return mongoose.models.Settings;
  }
  return mongoose.model("Settings", settingsSchema);
};

/**
 * Get site settings
 * Public endpoint - no authentication required
 */
export const getSettings = onRequest(
  {
    cors: true,
    region: "us-central1",
    maxInstances: 10,
  },
  async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.status(204).send('');
      return;
    }
    try {
      // Connect to MongoDB
      await connectToMongo();

      const Settings = getSettingsModel();

      // Get settings (create default if not exists)
      let settings = await Settings.findOne({});
      
      if (!settings) {
        settings = await Settings.create({});
        logger.info("Created default settings");
      }

      // Remove sensitive data for public access
      const publicSettings = {
        siteTitle: settings.siteTitle,
        siteDescription: settings.siteDescription,
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage,
        enableRegistration: settings.enableRegistration,
        enablePublicProjects: settings.enablePublicProjects,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        contactAddress: settings.contactAddress,
        socialLinks: settings.socialLinks,
        defaultLanguage: settings.defaultLanguage,
        supportedLanguages: settings.supportedLanguages,
        projectSettings: {
          allowAttachments: settings.projectSettings?.allowAttachments,
          maxAttachmentSize: settings.projectSettings?.maxAttachmentSize,
          allowedFileTypes: settings.projectSettings?.allowedFileTypes,
        },
      };

      res.status(200).json({
        success: true,
        data: publicSettings,
      });
    } catch (error: any) {
      logger.error("Error getting settings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get settings",
        error: error.message,
      });
    }
  }
);

/**
 * Get full settings (admin only)
 * Returns all settings including sensitive data
 */
export const getFullSettings = onRequest(
  {
    cors: true,
    region: "us-central1",
    maxInstances: 10,
  },
  async (req, res) => {
    try {
      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.status(204).send('');
        return;
      }

      // Verify authentication
      if (!await verifyAuth(req as AuthenticatedRequest, res)) {
        return; // verifyAuth already handled the response
      }

      // Check admin role
      if (!await requireRole(["admin"])(req as AuthenticatedRequest, res)) {
        return; // requireRole already handled the response
      }

      // Connect to MongoDB
      await connectToMongo();

      const Settings = getSettingsModel();

      // Get settings
      let settings = await Settings.findOne({});
      
      if (!settings) {
        settings = await Settings.create({});
        logger.info("Created default settings");
      }

      // Log access
      logAccess(
        (req as AuthenticatedRequest).user,
        'READ',
        'settings',
        settings._id.toString(),
        true
      );

      res.status(200).json({
        success: true,
        data: settings,
      });
    } catch (error: any) {
      logger.error("Error getting full settings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get settings",
        error: error.message,
      });
    }
  }
);

/**
 * Update settings (admin only)
 */
export const updateSettings = onRequest(
  {
    cors: true,
    region: "us-central1",
    maxInstances: 10,
  },
  async (req, res) => {
    try {
      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.status(204).send('');
        return;
      }

      // Verify authentication
      if (!await verifyAuth(req as AuthenticatedRequest, res)) {
        return;
      }

      // Check admin role
      if (!await requireRole(["admin"])(req as AuthenticatedRequest, res)) {
        return;
      }

      // Connect to MongoDB
      await connectToMongo();

      const Settings = getSettingsModel();

      // Get current settings
      let settings = await Settings.findOne({});
      
      if (!settings) {
        settings = await Settings.create({});
      }

      // Update settings
      const updates = req.body;
      updates.updatedAt = new Date();
      updates.lastModifiedBy = (req as AuthenticatedRequest).user.uid;

      // Remove fields that shouldn't be updated directly
      delete updates._id;
      delete updates.createdAt;

      // Update settings
      Object.assign(settings, updates);
      await settings.save();

      // Log access
      logAccess(
        (req as AuthenticatedRequest).user,
        'UPDATE',
        'settings',
        settings._id.toString(),
        true
      );

      logger.info("Settings updated by:", (req as AuthenticatedRequest).user.email);

      res.status(200).json({
        success: true,
        message: "Settings updated successfully",
        data: settings,
      });
    } catch (error: any) {
      logger.error("Error updating settings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update settings",
        error: error.message,
      });
    }
  }
);

/**
 * Reset settings to default (admin only)
 */
export const resetSettings = onRequest(
  {
    cors: true,
    region: "us-central1",
    maxInstances: 10,
  },
  async (req, res) => {
    try {
      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.status(204).send('');
        return;
      }

      // Verify authentication
      if (!await verifyAuth(req as AuthenticatedRequest, res)) {
        return;
      }

      // Check admin role
      if (!await requireRole(["admin"])(req as AuthenticatedRequest, res)) {
        return;
      }

      // Connect to MongoDB
      await connectToMongo();

      const Settings = getSettingsModel();

      // Delete current settings
      await Settings.deleteMany({});

      // Create default settings
      const defaultSettings = await Settings.create({
        lastModifiedBy: (req as AuthenticatedRequest).user.uid,
      });

      // Log access
      logAccess(
        (req as AuthenticatedRequest).user,
        'DELETE',
        'settings',
        defaultSettings._id.toString(),
        true
      );

      logger.info("Settings reset by:", (req as AuthenticatedRequest).user.email);

      res.status(200).json({
        success: true,
        message: "Settings reset to default",
        data: defaultSettings,
      });
    } catch (error: any) {
      logger.error("Error resetting settings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reset settings",
        error: error.message,
      });
    }
  }
);