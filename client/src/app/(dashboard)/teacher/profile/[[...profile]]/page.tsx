"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Header from "@/components/Header";
import { FiEdit2, FiSave, FiUser, FiBriefcase, FiBook, FiX, FiCheck } from "react-icons/fi";

interface TeacherMetadata {
  bio?: string;
  job?: string;
}

export default function TeacherProfilePage() {
  const { user } = useUser();
  const router = useRouter();
  const metadata = user?.publicMetadata as TeacherMetadata;
  
  const [bio, setBio] = useState(metadata?.bio || "");
  const [job, setJob] = useState(metadata?.job || "");
  const [isEditingJob, setIsEditingJob] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const jobInputRef = useRef<HTMLInputElement>(null);
  const bioInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditingJob && jobInputRef.current) jobInputRef.current.focus();
  }, [isEditingJob]);

  useEffect(() => {
    if (isEditingBio && bioInputRef.current) bioInputRef.current.focus();
  }, [isEditingBio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      const backendApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!backendApiUrl) throw new Error("Backend API URL is not configured.");

      const response = await fetch(`${backendApiUrl}/users/clerk/${user.id}/metadata`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, job }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => response.text());
        const errorMessage = typeof errorData === 'string' ? errorData : errorData.message || JSON.stringify(errorData);
        throw new Error(errorMessage);
      }

      setIsEditingJob(false);
      setIsEditingBio(false);
      router.refresh();

    } catch (error) {
      console.error("Error updating profile:", error);
      alert(`Failed to update profile: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <Header title="Profile Settings" subtitle="Manage your profile information" />
        
        {/* Profile Details Section */}
        <div className="bg-[#262626]/60 rounded-xl p-6 shadow-lg border border-gray-700 mb-8 backdrop-blur-md">
          <div className="flex items-center mb-6">
            <FiUser className="text-blue-500 mr-2 text-xl" />
            <h2 className="text-xl font-semibold text-white">Profile Details</h2>
          </div>

          <div className="clerk-profile-container max-h-[600px]">
            <UserProfile
              path="/teacher/profile"
              routing="path"
              appearance={{
                baseTheme: dark,
                variables: {
                  colorPrimary: '#3b82f6',
                  colorBackground: '#262626',
                },
                elements: {
                  card: "bg-[#262626] shadow-none border border-gray-700 rounded-xl",
                  navbar: "bg-[#262626] border-b border-gray-700",
                  navbarButton: "text-white hover:text-blue-400",
                  headerTitle: "text-white",
                  headerSubtitle: "text-gray-400",
                  profileSectionTitleText: "text-white",
                  profileSectionTitle: "border-b border-gray-700",
                  formFieldLabel: "text-gray-300",
                  formFieldInput: "bg-[#1f1f1f] border border-gray-600 text-white focus:border-blue-500",
                  badge: "bg-blue-900 text-blue-300",
                  footer: "hidden",
                  scrollBox: "bg-[#262626] p-0",
                  avatarBox: "bg-[#1f1f1f]",
                  formFieldInputGroup: "bg-[#1f1f1f]",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                  formButtonSecondary: "bg-gray-700 hover:bg-gray-600 text-white",
                },
              }}
            />
          </div>
        </div>

        {/* Teacher Information Section */}
        <div className="bg-[#262626]/60 rounded-xl p-6 shadow-lg border border-gray-700 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FiBook className="text-blue-500 mr-2 text-xl" />
              <h2 className="text-xl font-semibold text-white">Teacher Information</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} id="teacher-info-form" className="space-y-6">
            {/* Job Title */}
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <FiBriefcase className="text-blue-500 mr-2" />
                  <h3 className="text-lg font-medium text-white">Job Title</h3>
                </div>
                {!isEditingJob ? (
                  <button type="button" onClick={() => setIsEditingJob(true)} className="flex items-center text-blue-500 hover:text-blue-400 transition px-3 py-1 bg-blue-900/30 rounded-lg">
                    <FiEdit2 className="mr-1" /> Edit
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => setIsEditingJob(false)} className="p-1 text-gray-400 hover:text-white transition">
                      <FiX size={18} />
                    </button>
                    <button type="button" onClick={() => document.getElementById('teacher-info-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))} className="p-1 text-green-500 hover:text-green-400 transition">
                      <FiCheck size={18} />
                    </button>
                  </div>
                )}
              </div>
              {isEditingJob ? (
                <input
                  ref={jobInputRef}
                  type="text"
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                  className="w-1/2 p-3 rounded-lg bg-gray-700 border border-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-white placeholder-gray-500"
                  placeholder="Enter your job title"
                />
              ) : (
                <div className="bg-gray-950/10 backdrop-blur-md rounded-lg p-4 border border-gray-600">
                  <p className="text-white text-sm">{job || "No job title entered"}</p>
                </div>
              )}
            </div>

            {/* Biography */}
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <FiBook className="text-blue-500 mr-2" />
                  <h3 className="text-lg font-medium text-white">Biography</h3>
                </div>
                {!isEditingBio ? (
                  <button type="button" onClick={() => setIsEditingBio(true)} className="flex items-center text-blue-500 hover:text-blue-400 transition px-3 py-1 bg-blue-900/30 rounded-lg">
                    <FiEdit2 className="mr-1" /> Edit
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => setIsEditingBio(false)} className="p-1 text-gray-400 hover:text-white transition">
                      <FiX size={18} />
                    </button>
                    <button type="button" onClick={() => document.getElementById('teacher-info-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))} className="p-1 text-green-500 hover:text-green-400 transition">
                      <FiCheck size={18} />
                    </button>
                  </div>
                )}
              </div>
              {isEditingBio ? (
                <>
                  <textarea
                    ref={bioInputRef}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3 rounded-lg h-48 bg-gray-700 border border-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none text-white placeholder-gray-500 "
                    placeholder="Tell us about yourself, your experience, and teaching philosophy..."
                  />
                  <p className="text-xs text-gray-500 mt-2">This will be visible on your public profile</p>
                </>
              ) : (
                <div className="bg-gray-950/10 backdrop-blur-md rounded-lg p-4 border border-gray-600 min-h-[180px]">
                  <p className="text-white whitespace-pre-line leading-relaxed">{bio || "No biography entered"}</p>
                </div>
              )}
            </div>

            {/* Save Button */}
            {(isEditingJob || isEditingBio) && (
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
