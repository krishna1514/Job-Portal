import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

export const postJob = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      location,
      jobType,
      experience,
      position,
      companyId,
    } = req.body;
    const userId = req.id;

    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !location ||
      !jobType ||
      !experience ||
      !position ||
      !companyId
    ) {
      return res.status(400).json({
        message: "Something is Missing.",
        success: false,
      });
    }
    const job = await Job.create({
      title,
      description,
      requirements: requirements.split(","),
      salary: Number(salary),
      location,
      jobType,
      experienceLevel: experience,
      position,
      company: companyId,
      created_by: userId,
    });
    return res.status(201).json({
      message: "New Job Created Successfully.",
      job,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    };
    const jobs = await Job.find(query)
      .populate({
        path: "company",
      })
      .sort({ createdAt: -1 });
    if (!jobs) {
      return res.status(404).json({
        message: "Jobs not Found.",
        success: false,
      });
    }
    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getJobById = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate({
      path: "applications",
    });
    if (!job) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }
    return res.status(200).json({ job, success: true });
  } catch (error) {
    console.log(error);
  }
};

export const getAdminJobs = async (req, res) => {
  try {
    const adminId = req.id;
    const jobs = await Job.find({ created_by: adminId }).populate({
      path: "company",
      createdAt: -1,
    });
    if (!jobs) {
      return res.status(404).json({
        message: "Jobs not found.",
        success: false,
      });
    }
    return res.status(200).json({
      jobs,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const checkEligibility = async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const { userId } = req.body;

    // console.log('Backend received:', { jobId, userId });
    // console.log("Destructured jobId:", jobId);

    if (!jobId || !userId) {
      return res.status(400).json({
        success: false,
        error: "Both jobId and userId are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(jobId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid jobId or userId format",
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const jobSkills = job.requirements || [];
    const userSkills = user.profile?.skills || [];

    console.log("Raw Job Skills (requirements):", jobSkills);
    console.log("Raw User Skills (profile.skills):", userSkills);

    const normalizeSkills = (skills) =>
      skills.map((skill) => skill.trim().toLowerCase());

    const normalizedJobSkills = normalizeSkills(jobSkills);
    const normalizedUserSkills = normalizeSkills(userSkills);

    console.log("Normalized Job Skills:", normalizedJobSkills);
    console.log("Normalized User Skills:", normalizedUserSkills);

    const matchingSkills = normalizedJobSkills.filter((skill) =>
      normalizedUserSkills.includes(skill)
    );

    const missingSkills = normalizedJobSkills.filter(
      (skill) => !normalizedUserSkills.includes(skill)
    );

    const matchPercentage =
      normalizedJobSkills.length > 0
        ? Math.round((matchingSkills.length / normalizedJobSkills.length) * 100)
        : 0;

    return res.status(200).json({
      success: true,
      eligibilityScore: matchPercentage,
      matchingSkills,
      missingSkills,
    });
  } catch (error) {
    console.error("Backend error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message,
    });
  }
};
