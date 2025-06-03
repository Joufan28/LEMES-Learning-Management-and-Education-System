"use client";

import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Bell, BookOpen, Search, Bookmark, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { useGetUserEnrolledCoursesQuery, useGetCoursesQuery } from "@/state/api";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import debounce from "lodash/debounce";

const NonDashboardNavbar = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const userId = user?.id;
  const userRole = user?.publicMetadata?.userType as "student" | "teacher";
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLearningOpen, setIsLearningOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Menggunakan API untuk mendapatkan kursus yang diikuti
  const { data: enrolledCoursesData, isLoading: isLoadingEnrolledCourses } = useGetUserEnrolledCoursesQuery(userId as string, { skip: !userId || !isLoaded });

  // Get all courses for search suggestions
  const { data: coursesData } = useGetCoursesQuery({});

  const courses = useMemo(() => enrolledCoursesData?.data || [], [enrolledCoursesData?.data]);

  // Filter untuk menampilkan hanya 5 kursus terbaru
  const latestCourses = useMemo(() => {
    return courses.slice(0, 5);
  }, [courses]);

  // Debounced search function
  const debouncedSearch = useCallback(
    (query: string) => {
      if (query.trim()) {
        setIsLoadingSuggestions(true);
        // Filter courses based on search query
        const filtered = coursesData?.data?.filter((course) =>
          course.title.toLowerCase().includes(query.toLowerCase())
        ) || [];
        setSearchSuggestions(filtered);
        setShowSuggestions(true);
        setIsLoadingSuggestions(false);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    },
    [coursesData?.data]
  );

  // Create a memoized debounced version of the search function
  const debouncedSearchMemo = useMemo(
    () => debounce(debouncedSearch, 300),
    [debouncedSearch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearchMemo(value);
  };

  const handleSuggestionClick = (course: any) => {
    setSearchQuery(course.title);
    setShowSuggestions(false);
    router.push(`/search?id=${encodeURIComponent(course.courseId)}`);
    setIsSearchOpen(false);
  };

  const handleGoToCourse = (course: any) => {
    setIsLearningOpen(false);
    if (course.sections && course.sections.length > 0 && course.sections[0].chapters.length > 0) {
      const firstChapter = course.sections[0].chapters[0];
      router.push(`/user/courses/${course.courseId}/chapters/${firstChapter.chapterId}`);
    } else {
      router.push(`/user/courses/${course.courseId}`);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const pathname = usePathname();
  const isSearchPage = pathname === '/search';

  return (
    <>
      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-lg z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-3xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">Search Courses</h2>
              <button onClick={() => setIsSearchOpen(false)} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for courses, topics, or instructors..."
                className="w-full py-4 pl-16 pr-6 bg-gray-800 text-white rounded-xl text-lg border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                autoFocus
              />
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors">
                Search
              </button>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute w-full mt-2 bg-gray-800 rounded-xl border border-gray-700 shadow-xl max-h-96 overflow-y-auto">
                  {isLoadingSuggestions ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    </div>
                  ) : searchSuggestions.length > 0 ? (
                    searchSuggestions.map((course) => (
                      <button
                        key={course.courseId}
                        onClick={() => handleSuggestionClick(course)}
                        className="w-full px-6 py-3 text-left text-white hover:bg-gray-700 transition-colors flex items-center space-x-3"
                      >
                        <div className="relative w-10 h-10 flex-shrink-0">
                          <Image
                            src={course.image || "/placeholder.png"}
                            alt={course.title}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{course.title}</div>
                          <div className="text-sm text-gray-400">By {course.teacherName}</div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-6 py-4 text-gray-400 text-center">
                      No courses found
                    </div>
                  )}
                </div>
              )}
            </form>

            <div className="mt-8">
              <h3 className="text-gray-400 text-sm font-medium uppercase mb-4">Popular Searches</h3>
              <div className="flex flex-wrap gap-3">
                {["Web Development", "Data Science", "Machine Learning", "React", "Python", "Business", "Design", "Marketing"].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => {
                      setSearchQuery(topic);
                      setIsSearchOpen(false);
                      router.push(`/search?q=${encodeURIComponent(topic)}&source=tag`);
                    }}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 
        ${scrolled ? "bg-gray-950/90 backdrop-blur-lg py-3 shadow-xl border-b border-gray-800" : "bg-gradient-to-r from-gray-950/70 via-gray-900 to-gray-800 py-5 border-b border-gray-900"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-10">
              <Link href="/" className="flex items-center group" scroll={false}>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent group-hover:from-blue-400 group-hover:to-indigo-400 transition-colors">LEMES</span>
              </Link>

              {!isSearchPage && (
                <div className="hidden md:flex">
                  <button onClick={() => setIsSearchOpen(true)} className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white px-4 py-2.5 rounded-xl transition-colors duration-300 border border-gray-800">
                    <Search size={18} />
                    <span>Search Courses</span>
                  </button>
                </div>
              )}

            </div>

            <div className="flex items-center space-x-4">
              {/* Mobile Search Button */}
              <button onClick={() => setIsSearchOpen(true)} className="md:hidden bg-gray-900 p-2.5 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition-colors border border-gray-800">
                <Search size={20} />
              </button>

              {/* My Learning Dropdown */}
              <SignedIn>
                {userRole === "student" && (
                  <div className="relative group" onMouseEnter={() => setIsLearningOpen(true)} onMouseLeave={() => setIsLearningOpen(false)}>
                    <button
                      onClick={() => setIsLearningOpen(!isLearningOpen)}
                      className="flex items-center space-x-1 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white px-3 py-2 rounded-xl transition-colors duration-300 border border-gray-800"
                    >
                      <Bookmark size={18} />
                      <span className="hidden md:inline">My Learning</span>
                    </button>

                    {isLearningOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50">
                        <div className="p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-white">Continue Learning</h3>
                            <span className="text-xs text-blue-400 font-medium">
                              {latestCourses.length} of {courses.length} courses
                            </span>
                          </div>

                          {isLoadingEnrolledCourses ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                              <p className="text-gray-400 mt-2">Loading courses...</p>
                            </div>
                          ) : latestCourses.length === 0 ? (
                            <div className="text-center py-4">
                              <p className="text-gray-400">No enrolled courses</p>
                              <button
                                onClick={() => {
                                  setIsLearningOpen(false);
                                  router.push("/search");
                                }}
                                className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                              >
                                Browse courses
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="space-y-3 max-h-80 overflow-y-auto">
                                {latestCourses.map((course) => (
                                  <div key={course.courseId} onClick={() => handleGoToCourse(course)} className="flex gap-3 p-3 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                                    <div className="relative w-16 h-16 flex-shrink-0">
                                      <Image src={course.image || "/placeholder.png"} alt={course.title} fill className="object-cover rounded-md" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-white text-sm line-clamp-2">{course.title}</h4>
                                      <p className="text-xs text-gray-400 mt-1">By {course.teacherName}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="mt-4 pt-3 border-t border-gray-700">
                                <button
                                  onClick={() => {
                                    setIsLearningOpen(false);
                                    router.push("/user/courses");
                                  }}
                                  className="flex items-center justify-between w-full p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                  <span className="text-white font-medium">Go to My Learning</span>
                                  <ChevronRight size={18} className="text-gray-400" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </SignedIn>

              {!isSearchPage &&
              <div className="hidden md:flex">
                <Link href="/search" scroll={false} className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white px-4 py-2.5 rounded-xl transition-colors duration-300 border border-gray-800">
                  <BookOpen size={18} />
                  <span>Browse All Courses</span>
                </Link>
              </div>
}

              {/* Notification Button */}
              <button className="relative p-2 rounded-full hover:bg-gray-800 transition-colors">
                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                <Bell className="text-gray-400 w-5 h-5" />
              </button>

              <SignedIn>
                <span className={`hidden sm:inline-block px-3 py-1 text-sm font-medium rounded-full ${userRole === "teacher" ? "bg-indigo-900/80 text-indigo-200" : "bg-blue-900/80 text-blue-200"}`}>{userRole}</span>

                <div className="flex items-center">
                  <UserButton
                    appearance={{
                      baseTheme: dark,
                      elements: {
                        userButtonAvatarBox: "w-9 h-9",
                        userButtonOuterIdentifier: "text-gray-200 font-medium text-sm",
                        userButtonBox: "flex-row-reverse space-x-reverse space-x-2",
                      },
                    }}
                    showName={true}
                    userProfileMode="navigation"
                    userProfileUrl={userRole === "teacher" ? "/teacher/profile" : "/user/profile"}
                  />
                </div>
              </SignedIn>

              <SignedOut>
                <div className="flex space-x-3">
                  <Link href="/signin" className="px-4 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800 transition-colors border border-gray-800">
                    Log in
                  </Link>
                  <Link href="/signup" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg border border-blue-500/30">
                    Sign up
                  </Link>
                </div>
              </SignedOut>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NonDashboardNavbar;
