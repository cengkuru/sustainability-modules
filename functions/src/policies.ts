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

// Policy Schema
const policySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["procurement", "transparency", "standards", "guidelines", "other"],
    default: "other",
  },
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "draft",
  },
  effectiveDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
  },
  version: {
    type: String,
    default: "1.0",
  },
  tags: {
    type: [String],
    default: [],
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: Date,
  }],
  relatedPolicies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Policy",
  }],
  isPublic: {
    type: Boolean,
    default: true,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  metadata: {
    language: {
      type: String,
      enum: ["en", "pt"],
      default: "en",
    },
    author: String,
    approvedBy: String,
    approvalDate: Date,
    department: String,
  },
  createdBy: {
    type: String,
    required: true,
  },
  lastModifiedBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add text index for search
policySchema.index({ title: "text", description: "text", content: "text", tags: "text" });

// Create or get Policy model
const getPolicyModel = () => {
  if (mongoose.models.Policy) {
    return mongoose.models.Policy;
  }
  return mongoose.model("Policy", policySchema);
};

/**
 * Get all policies (public endpoint with filtering)
 */
export const getPolicies = onRequest(
  {
    cors: true,
    region: "us-central1",
    maxInstances: 10,
  },
  async (req, res) => {
    try {
      // Connect to MongoDB
      await connectToMongo();

      const Policy = getPolicyModel();

      // Build query
      const query: any = {};

      // Public users only see published policies
      let isAuthenticated = false;
      try {
        const authResult = await verifyAuth(req as AuthenticatedRequest);
        isAuthenticated = authResult.success;
      } catch {
        // Not authenticated, continue as public user
      }

      if (!isAuthenticated) {
        query.status = "published";
        query.isPublic = true;
      }

      // Apply filters from query params
      const { category, status, search, tags, language } = req.query;

      if (category) query.category = category;
      if (status && isAuthenticated) query.status = status;
      if (tags) query.tags = { $in: (tags as string).split(",") };
      if (language) query["metadata.language"] = language;

      // Text search
      if (search) {
        query.$text = { $search: search as string };
      }

      // Pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      // Execute query
      const [policies, total] = await Promise.all([
        Policy.find(query)
          .sort({ effectiveDate: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select("-content") // Exclude full content in list view
          .populate("relatedPolicies", "title category"),
        Policy.countDocuments(query),
      ]);

      res.status(200).json({
        success: true,
        data: policies,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      logger.error("Error getting policies:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get policies",
        error: error.message,
      });
    }
  }
);

/**
 * Get single policy by ID
 */
export const getPolicy = onRequest(
  {
    cors: true,
    region: "us-central1",
    maxInstances: 10,
  },
  async (req, res) => {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Policy ID is required",
        });
      }

      // Connect to MongoDB
      await connectToMongo();

      const Policy = getPolicyModel();

      // Get policy
      const policy = await Policy.findById(id)
        .populate("relatedPolicies", "title category status");

      if (!policy) {
        return res.status(404).json({
          success: false,
          message: "Policy not found",
        });
      }

      // Check if public user can access
      let isAuthenticated = false;
      try {
        const authResult = await verifyAuth(req as AuthenticatedRequest);
        isAuthenticated = authResult.success;
      } catch {
        // Not authenticated
      }

      if (!isAuthenticated && (policy.status !== "published" || !policy.isPublic)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Increment view count
      policy.viewCount = (policy.viewCount || 0) + 1;
      await policy.save();

      res.status(200).json({
        success: true,
        data: policy,
      });
    } catch (error: any) {
      logger.error("Error getting policy:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get policy",
        error: error.message,
      });
    }
  }
);

/**
 * Create new policy (admin only)
 */
export const createPolicy = onRequest(
  {
    cors: true,
    region: "us-central1",
    maxInstances: 10,
  },
  async (req, res) => {
    try {
      // Verify authentication
      const authResult = await verifyAuth(req as AuthenticatedRequest);
      if (!authResult.success) {
        return res.status(401).json(authResult);
      }

      // Check admin role
      const roleCheck = await requireRole(req as AuthenticatedRequest, ["admin"]);
      if (!roleCheck.success) {
        return res.status(403).json(roleCheck);
      }

      // Connect to MongoDB
      await connectToMongo();

      const Policy = getPolicyModel();

      // Create policy data
      const policyData = {
        ...req.body,
        createdBy: (req as AuthenticatedRequest).user.uid,
        lastModifiedBy: (req as AuthenticatedRequest).user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create policy
      const policy = await Policy.create(policyData);

      // Log access
      await logAccess({
        userId: (req as AuthenticatedRequest).user.uid,
        action: "CREATE_POLICY",
        resourceType: "policy",
        resourceId: policy._id.toString(),
        metadata: {
          userEmail: (req as AuthenticatedRequest).user.email,
          role: (req as AuthenticatedRequest).userProfile?.role,
          policyTitle: policy.title,
        },
      });

      logger.info("Policy created by:", (req as AuthenticatedRequest).user.email);

      res.status(201).json({
        success: true,
        message: "Policy created successfully",
        data: policy,
      });
    } catch (error: any) {
      logger.error("Error creating policy:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create policy",
        error: error.message,
      });
    }
  }
);

/**
 * Update policy (admin only)
 */
export const updatePolicy = onRequest(
  {
    cors: true,
    region: "us-central1",
    maxInstances: 10,
  },
  async (req, res) => {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Policy ID is required",
        });
      }

      // Verify authentication
      const authResult = await verifyAuth(req as AuthenticatedRequest);
      if (!authResult.success) {
        return res.status(401).json(authResult);
      }

      // Check admin role
      const roleCheck = await requireRole(req as AuthenticatedRequest, ["admin"]);
      if (!roleCheck.success) {
        return res.status(403).json(roleCheck);
      }

      // Connect to MongoDB
      await connectToMongo();

      const Policy = getPolicyModel();

      // Get policy
      const policy = await Policy.findById(id);

      if (!policy) {
        return res.status(404).json({
          success: false,
          message: "Policy not found",
        });
      }

      // Update policy
      const updates = req.body;
      updates.lastModifiedBy = (req as AuthenticatedRequest).user.uid;
      updates.updatedAt = new Date();

      // Remove fields that shouldn't be updated
      delete updates._id;
      delete updates.createdBy;
      delete updates.createdAt;

      Object.assign(policy, updates);
      await policy.save();

      // Log access
      await logAccess({
        userId: (req as AuthenticatedRequest).user.uid,
        action: "UPDATE_POLICY",
        resourceType: "policy",
        resourceId: policy._id.toString(),
        metadata: {
          userEmail: (req as AuthenticatedRequest).user.email,
          role: (req as AuthenticatedRequest).userProfile?.role,
          policyTitle: policy.title,
          updates: Object.keys(updates),
        },
      });

      logger.info(`Policy ${policy.title} updated by:`, (req as AuthenticatedRequest).user.email);

      res.status(200).json({
        success: true,
        message: "Policy updated successfully",
        data: policy,
      });
    } catch (error: any) {
      logger.error("Error updating policy:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update policy",
        error: error.message,
      });
    }
  }
);

/**
 * Delete policy (admin only)
 */
export const deletePolicy = onRequest(
  {
    cors: true,
    region: "us-central1",
    maxInstances: 10,
  },
  async (req, res) => {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Policy ID is required",
        });
      }

      // Verify authentication
      const authResult = await verifyAuth(req as AuthenticatedRequest);
      if (!authResult.success) {
        return res.status(401).json(authResult);
      }

      // Check admin role
      const roleCheck = await requireRole(req as AuthenticatedRequest, ["admin"]);
      if (!roleCheck.success) {
        return res.status(403).json(roleCheck);
      }

      // Connect to MongoDB
      await connectToMongo();

      const Policy = getPolicyModel();

      // Get policy
      const policy = await Policy.findById(id);

      if (!policy) {
        return res.status(404).json({
          success: false,
          message: "Policy not found",
        });
      }

      const policyTitle = policy.title;

      // Delete policy
      await policy.deleteOne();

      // Log access
      await logAccess({
        userId: (req as AuthenticatedRequest).user.uid,
        action: "DELETE_POLICY",
        resourceType: "policy",
        resourceId: id as string,
        metadata: {
          userEmail: (req as AuthenticatedRequest).user.email,
          role: (req as AuthenticatedRequest).userProfile?.role,
          policyTitle,
        },
      });

      logger.info(`Policy ${policyTitle} deleted by:`, (req as AuthenticatedRequest).user.email);

      res.status(200).json({
        success: true,
        message: "Policy deleted successfully",
      });
    } catch (error: any) {
      logger.error("Error deleting policy:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete policy",
        error: error.message,
      });
    }
  }
);

/**
 * Publish policy (admin only)
 */
export const publishPolicy = onRequest(
  {
    cors: true,
    region: "us-central1",
    maxInstances: 10,
  },
  async (req, res) => {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Policy ID is required",
        });
      }

      // Verify authentication
      const authResult = await verifyAuth(req as AuthenticatedRequest);
      if (!authResult.success) {
        return res.status(401).json(authResult);
      }

      // Check admin role
      const roleCheck = await requireRole(req as AuthenticatedRequest, ["admin"]);
      if (!roleCheck.success) {
        return res.status(403).json(roleCheck);
      }

      // Connect to MongoDB
      await connectToMongo();

      const Policy = getPolicyModel();

      // Get policy
      const policy = await Policy.findById(id);

      if (!policy) {
        return res.status(404).json({
          success: false,
          message: "Policy not found",
        });
      }

      // Update status
      policy.status = "published";
      policy.lastModifiedBy = (req as AuthenticatedRequest).user.uid;
      policy.updatedAt = new Date();
      
      if (!policy.metadata) {
        policy.metadata = {} as any;
      }
      policy.metadata.approvedBy = (req as AuthenticatedRequest).user.uid;
      policy.metadata.approvalDate = new Date();

      await policy.save();

      // Log access
      await logAccess({
        userId: (req as AuthenticatedRequest).user.uid,
        action: "PUBLISH_POLICY",
        resourceType: "policy",
        resourceId: policy._id.toString(),
        metadata: {
          userEmail: (req as AuthenticatedRequest).user.email,
          role: (req as AuthenticatedRequest).userProfile?.role,
          policyTitle: policy.title,
        },
      });

      logger.info(`Policy ${policy.title} published by:`, (req as AuthenticatedRequest).user.email);

      res.status(200).json({
        success: true,
        message: "Policy published successfully",
        data: policy,
      });
    } catch (error: any) {
      logger.error("Error publishing policy:", error);
      res.status(500).json({
        success: false,
        message: "Failed to publish policy",
        error: error.message,
      });
    }
  }
);

/**
 * Archive policy (admin only)
 */
export const archivePolicy = onRequest(
  {
    cors: true,
    region: "us-central1",
    maxInstances: 10,
  },
  async (req, res) => {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Policy ID is required",
        });
      }

      // Verify authentication
      const authResult = await verifyAuth(req as AuthenticatedRequest);
      if (!authResult.success) {
        return res.status(401).json(authResult);
      }

      // Check admin role
      const roleCheck = await requireRole(req as AuthenticatedRequest, ["admin"]);
      if (!roleCheck.success) {
        return res.status(403).json(roleCheck);
      }

      // Connect to MongoDB
      await connectToMongo();

      const Policy = getPolicyModel();

      // Get policy
      const policy = await Policy.findById(id);

      if (!policy) {
        return res.status(404).json({
          success: false,
          message: "Policy not found",
        });
      }

      // Update status
      policy.status = "archived";
      policy.lastModifiedBy = (req as AuthenticatedRequest).user.uid;
      policy.updatedAt = new Date();

      await policy.save();

      // Log access
      await logAccess({
        userId: (req as AuthenticatedRequest).user.uid,
        action: "ARCHIVE_POLICY",
        resourceType: "policy",
        resourceId: policy._id.toString(),
        metadata: {
          userEmail: (req as AuthenticatedRequest).user.email,
          role: (req as AuthenticatedRequest).userProfile?.role,
          policyTitle: policy.title,
        },
      });

      logger.info(`Policy ${policy.title} archived by:`, (req as AuthenticatedRequest).user.email);

      res.status(200).json({
        success: true,
        message: "Policy archived successfully",
        data: policy,
      });
    } catch (error: any) {
      logger.error("Error archiving policy:", error);
      res.status(500).json({
        success: false,
        message: "Failed to archive policy",
        error: error.message,
      });
    }
  }
);