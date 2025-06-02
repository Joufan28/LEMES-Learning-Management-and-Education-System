"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserMetadata = exports.updateUser = void 0;
const index_1 = require("../index");
const courseControllers_1 = require("./courseControllers"); // Import the new helper function
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const userData = req.body;
    try {
        const user = yield index_1.clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                userType: userData.publicMetadata.userType,
                settings: userData.publicMetadata.settings,
            },
        });
        res.json({ message: "User updated successfully", data: user });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating user", error });
    }
});
exports.updateUser = updateUser;
const updateUserMetadata = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { userId } = req.params;
        const { bio, job } = req.body;
        // Log relevant properties of req inside the controller
        console.log(`[Backend Controller - Clerk] req.params.userId:`, req.params.userId);
        console.log(`[Backend Controller - Clerk] req.auth:`, req.auth);
        console.log(`[Backend Controller - Clerk] req.user:`, req.user); // Check for a potential req.user added by middleware
        let authResultFromCall = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.call(req); // Explicitly call req.auth() and store result
        console.log(`[Backend Controller - Clerk] Result of explicit req.auth() call:`, authResultFromCall);
        const authenticatedUserId = authResultFromCall === null || authResultFromCall === void 0 ? void 0 : authResultFromCall.userId; // Access userId from the stored result
        // Log authenticatedUserId before the check
        console.log(`[Backend Controller - Clerk] authenticatedUserId before check:`, authenticatedUserId);
        // Pastikan user yang login berhak mengupdate user ini
        if (userId !== authenticatedUserId) {
            res.status(403).json({ message: "Not authorized to update this user." });
            return;
        }
        const existingUser = yield index_1.clerkClient.users.getUser(userId);
        const user = yield index_1.clerkClient.users.updateUser(userId, {
            publicMetadata: Object.assign(Object.assign({}, existingUser.publicMetadata), { bio: bio, job: job }),
        });
        // After successfully updating user metadata in Clerk, update the courses
        yield (0, courseControllers_1.updateTeacherInfoInCourses)(authenticatedUserId, bio, job); // Call the helper function
        res.json({ message: "User metadata updated successfully", data: user.publicMetadata });
    }
    catch (error) {
        console.error("Error updating user metadata:", error);
        res.status(500).json({ message: "Failed to update user metadata", error });
    }
});
exports.updateUserMetadata = updateUserMetadata;
