import { Request, Response } from "express";
import { clerkClient } from "../index";
import { updateTeacherInfoInCourses } from "./courseControllers"; // Import the new helper function

interface AuthenticatedRequest extends Request {
  auth?: () => any; // Simplify type to function returning any
}

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;
  const userData = req.body;
  try {
    const user = await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        userType: userData.publicMetadata.userType,
        settings: userData.publicMetadata.settings,
      },
    });

    res.json({ message: "User updated successfully", data: user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

export const updateUserMetadata = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { bio, job } = req.body;

    // Log relevant properties of req inside the controller
    console.log(`[Backend Controller - Clerk] req.params.userId:`, req.params.userId);
    console.log(`[Backend Controller - Clerk] req.auth:`, req.auth);
    console.log(`[Backend Controller - Clerk] req.user:`, (req as any).user); // Check for a potential req.user added by middleware
    
    let authResultFromCall = (req.auth as any)?.(); // Explicitly call req.auth() and store result
    console.log(`[Backend Controller - Clerk] Result of explicit req.auth() call:`, authResultFromCall);

    const authenticatedUserId = authResultFromCall?.userId; // Access userId from the stored result

    // Log authenticatedUserId before the check
    console.log(`[Backend Controller - Clerk] authenticatedUserId before check:`, authenticatedUserId);

    // Pastikan user yang login berhak mengupdate user ini
    if (userId !== authenticatedUserId) {
      res.status(403).json({ message: "Not authorized to update this user." });
      return;
    }

    const existingUser = await clerkClient.users.getUser(userId);

    const user = await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        ...(existingUser.publicMetadata as object), // Cast to object to spread existing publicMetadata
        bio: bio, // Tambahkan bio
        job: job, // Tambahkan job
      },
    });

    // After successfully updating user metadata in Clerk, update the courses
    await updateTeacherInfoInCourses(authenticatedUserId!, bio, job); // Call the helper function

    res.json({ message: "User metadata updated successfully", data: user.publicMetadata });
  } catch (error) {
    console.error("Error updating user metadata:", error);
    res.status(500).json({ message: "Failed to update user metadata", error });
  }
};
