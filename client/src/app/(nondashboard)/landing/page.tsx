"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useCarousel } from "@/hooks/useCarousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCoursesQuery } from "@/state/api";
import CourseCardSearch from "@/components/CourseCardSearch";
import { useRouter } from "next/navigation";
import { Target, ChartColumn, PencilRuler } from "lucide-react";

interface Course {
  courseId: string;
  title: string;
  description: string;
}

interface SearchCourseCardProps {
  course: Course;
  onClick: () => void;
}

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section Skeleton */}
      <div className="flex flex-col md:flex-row items-center justify-between px-4 py-20 max-w-7xl mx-auto">
        <div className="w-full md:w-1/2 mb-10 md:mb-0">
          <Skeleton className="h-16 md:h-20 w-3/4 bg-gray-800 mb-6 rounded" />
          <Skeleton className="h-6 md:h-7 w-4/5 bg-gray-800 mb-8 rounded" />
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-12 w-40 bg-blue-600 rounded-lg" />
            <Skeleton className="h-12 w-40 bg-transparent border-2 border-gray-700 rounded-lg" />
          </div>
        </div>
        <div className="w-full md:w-1/2 flex justify-center">
          <Skeleton className="aspect-video w-full max-w-lg rounded-xl bg-gray-800" />
        </div>
      </div>

      {/* Featured Courses Section Skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Skeleton className="h-10 md:h-12 w-64 md:w-80 mx-auto bg-gray-800 mb-4 rounded" />
          <Skeleton className="h-6 md:h-7 w-2/3 md:w-3/4 mx-auto bg-gray-800 rounded" />
        </div>

        <div className="flex justify-center flex-wrap gap-3 mb-12">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-32 rounded-full bg-gray-800" />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
              <Skeleton className="h-48 w-full" />
              <div className="p-4">
                <Skeleton className="h-6 w-4/5 mb-3 rounded" />
                <Skeleton className="h-4 w-full mb-2 rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Skeleton className="h-12 w-40 mx-auto bg-gray-800 rounded-lg" />
        </div>
      </div>

      {/* Learning Goals Section Skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Skeleton className="h-12 w-96 mx-auto bg-gray-800 mb-4 rounded" />
          <Skeleton className="h-6 w-1/2 mx-auto bg-gray-800 rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-xl p-6 border border-gray-700">
              <Skeleton className="w-10 h-10 bg-blue-900 mb-4 rounded-full" />
              <Skeleton className="h-7 w-4/5 bg-gray-200 mb-4 rounded" />
              <Skeleton className="h-4 w-full mb-6 rounded" />
              {index === 0 && (
                <div className="bg-blue-900/30 p-4 rounded-lg mb-4 border border-blue-700/50">
                  <Skeleton className="h-5 w-2/5 mb-2 bg-blue-800 rounded" />
                  <Skeleton className="h-4 w-full rounded" />
                </div>
              )}
              <Skeleton className="h-4 w-32 bg-blue-500 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* AI Section Skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <Skeleton className="h-12 w-80 bg-gray-200 mb-6 rounded" />
            <Skeleton className="h-6 w-full mb-8 rounded" />
            <div className="flex flex-wrap gap-4 mb-8">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <Skeleton className="h-7 w-16 mb-2 bg-gray-200 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
              ))}
            </div>
            <Skeleton className="h-12 w-40 bg-blue-600 rounded-lg" />
          </div>
          <div className="relative">
            <Skeleton className="aspect-video w-full rounded-xl bg-gray-800" />
            <div className="absolute -bottom-6 -right-6 bg-gray-800 p-6 rounded-xl shadow-lg w-3/4 border border-gray-700">
              <Skeleton className="h-6 w-3/5 mb-4 bg-gray-200 rounded" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="flex items-center">
                    <Skeleton className="w-4 h-4 mr-2 bg-green-400 rounded-full" />
                    <Skeleton className="h-4 w-40 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Landing = () => {
  const router = useRouter();
  const currentImage = useCarousel({ totalImages: 3 });
  const { data, isLoading, isError } = useGetCoursesQuery({});
  const courses = data?.data ?? [];
  const [activeTab, setActiveTab] = useState("beginner");

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <div className="text-white min-h-screen flex items-center justify-center">Failed to fetch courses</div>;

  const handleCourseClick = (courseId: string) => {
    router.push(`/search?id=${courseId}`);
  };

  // Data untuk section "Learning focused on your goals"
  const learningGoals = [
    {
      title: "Hands-on training",
      description: "Use the following tools to guide and evaluate your goals.",
      subTitle: "Certification prep",
      subDescription: "Prep for industry-recognized certifications by solving real-world challenges and earn badges along the way.",
      cta: "Explore courses",
      icon: <Target color="#18a5ec" />,
    },
    {
      title: "Insights and analytics (Enterprise Plans)",
      description: "Fast-track goals with advanced insights plus a dedicated customer success team to help drive effective learning.",
      cta: "Find out more",
      icon: <ChartColumn color="#18a5ec" />,
    },
    {
      title: "Customizable content (Enterprise Plans)",
      description: "Create tailored learning paths for team and organization goals and even upload your own content and resources.",
      cta: "Find out more",
      icon: <PencilRuler color="#18a5ec" />,
    },
  ];

  const courseLevels = [
    {
      id: "beginner",
      title: "Beginner Level",
      description: "Perfect for those starting their journey. Build a solid foundation with our introductory courses.",
      duration: "2-4 weeks per course",
      projects: "1-2 practical projects",
      highlights: ["Step-by-step guided projects", "Interactive coding exercises", "Foundational concepts explained", "Basic portfolio building", "Community support forum"],
    },
    {
      id: "intermediate",
      title: "Intermediate Level",
      description: "Expand your skills with more complex concepts and practical applications.",
      duration: "4-6 weeks per course",
      projects: "2-3 practical projects",
      highlights: ["Real-world case studies", "Advanced project challenges", "Code review sessions", "Specialized skill workshops", "Portfolio refinement"],
    },
    {
      id: "advanced",
      title: "Advanced Level",
      description: "Master specialized topics and prepare for professional certifications.",
      duration: "6-10 weeks per course",
      projects: "3-5 practical projects",
      highlights: ["Industry expert mentorship", "Complex problem-solving tasks", "Professional portfolio development", "Career coaching sessions", "Certification preparation"],
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="landing landing-page text-gray-100">
      {/* Hero Section */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="landing__hero relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 mb-10 md:mb-0">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-4xl md:text-5xl font-bold text-white mb-6">
              Transform Your Career with Expert-Led Courses
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-xl text-blue-200 mb-8">
              Master in-demand skills through hands-on projects and industry-recognized certifications
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-4">
              <Link href="/search" scroll={false}>
                <button className="bg-blue-600 text-white hover:bg-blue-700 font-bold py-3 px-8 rounded-lg transition-all transform hover:-translate-y-1 shadow-lg">Explore Courses</button>
              </Link>
              <button className="bg-transparent border-2 border-blue-500 text-blue-300 hover:bg-blue-900/50 font-bold py-3 px-8 rounded-lg transition-all">Free Trial</button>
            </motion.div>
          </div>

          <div className="w-full md:w-1/2 flex justify-center">
            <div className="relative w-full max-w-lg aspect-video rounded-xl overflow-hidden shadow-2xl">
              {["/hero1.jpg", "/hero2.jpg", "/hero3.jpg"].map((src, index) => (
                <Image
                  key={src}
                  src={src}
                  alt={`Hero Banner ${index + 1}`}
                  fill
                  priority={index === currentImage}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={`object-cover transition-opacity duration-1000 ${index === currentImage ? "opacity-100" : "opacity-0 absolute"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Featured Courses Section */}
      <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="landing__featured py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Featured Courses</h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">From beginner to advanced, in all industries, we have the right courses just for you and preparing your entire journey for learning and making the most.</p>
          </div>

          <div className="landing__tags flex justify-center flex-wrap gap-3 mb-12">
            {["web development", "enterprise IT", "react nextjs", "javascript", "backend development", "data science", "cloud computing", "AI & ML"].map((tag, index) => (
              <span key={index} className="border border-gray-600 text-gray-300 px-4 py-2 rounded-full text-sm font-medium hover:border-blue-700 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {courses.slice(0, 8).map((course: Course, index: number) => (
              <motion.div key={course.courseId} initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ amount: 0.4, once: true }}>
                <CourseCardSearch course={course} onClick={() => handleCourseClick(course.courseId)} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/search" scroll={false}>
              <button className="border border-gray-600 text-white hover:border-gray-500 font-medium py-3 px-8 rounded-lg transition-colors shadow-sm">View All Courses</button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Learning Goals Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-3xl md:text-4xl font-bold text-white mb-4">
              Learning focused on your goals
            </motion.h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">Our platform is designed to help you achieve your career objectives with precision and efficiency</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {learningGoals.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-600"
              >
                <div className="text-4xl mb-4 pl-[5%]">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-300 mb-4">{item.description}</p>

                {item.subTitle && (
                  <div className="bg-blue-900/30 p-4 rounded-lg mb-4 border border-blue-700/50">
                    <h4 className="font-bold text-blue-300 mb-2">{item.subTitle}</h4>
                    <p className="text-gray-200">{item.subDescription}</p>
                  </div>
                )}

                <Link href="#" className="text-blue-400 font-medium hover:text-blue-300 inline-flex items-center">
                  {item.cta}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI for Business Section */}
      <section className="py-20 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">AI for Business Leaders</h2>
              <p className="text-xl mb-8 text-gray-300">Build an AI-habit for you and your team that builds hands-on skills to help you lead effectively in the age of artificial intelligence.</p>
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <div className="text-2xl font-bold">92%</div>
                  <div className="text-gray-300">Completion Rate</div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <div className="text-2xl font-bold">4.8/5</div>
                  <div className="text-gray-300">Learner Rating</div>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <div className="text-2xl font-bold">10k+</div>
                  <div className="text-gray-300">Professionals Trained</div>
                </div>
              </div>
              <button className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-lg">Start Learning</button>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative">
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
                <Image src="/pexels-papaz-16416872.jpg" alt="AI for Business Leaders" fill className="object-cover" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-gray-800 text-white p-6 rounded-xl shadow-lg w-3/4 border border-gray-700">
                <h3 className="font-bold text-lg mb-2">Included in this program:</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>AI Strategy Development</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Ethical AI Implementation</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Team Upskilling Framework</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Success Story Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="rounded-2xl shadow-xl overflow-hidden border border-gray-600">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 md:p-12">
                <h3 className="text-2xl font-bold text-white mb-4">Unlock Team Potential Through Smart, Scalable Learning</h3>
                <p className="text-gray-300 mb-8">Our digital learning solutions help businesses boost employee skills, improve retention, and drive measurable productivity gains.</p>

                <div className="flex flex-wrap gap-8 mb-8">
                  <div className="bg-blue-900/30 p-6 rounded-lg border border-blue-700/50">
                    <div className="text-5xl font-bold text-blue-300 mb-2">93%</div>
                    <div className="text-gray-200 font-medium">retention rate among participating employees</div>
                  </div>
                  <div className="bg-green-900/30 p-6 rounded-lg border border-green-700/50">
                    <div className="text-5xl font-bold text-green-300 mb-2">65%</div>
                    <div className="text-gray-200 font-medium">of learners noted a positive impact on their productivity</div>
                  </div>
                </div>

                <Link href="#" className="text-blue-400 font-medium hover:text-blue-300 inline-flex items-center">
                  Read full story
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              </div>

              <div className="bg-gray-600 relative min-h-[400px]">
                <Image src="/SUKSES.jpg" alt="Success Story" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Levels Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Structured Learning Paths</h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">Progress through our carefully designed curriculum that builds your skills step-by-step</p>
          </div>

          {/* Tabs for course levels */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex p-1 rounded-lg">
              {courseLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setActiveTab(level.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === level.id ? "text-blue-400 bg-gray-800/40 shadow" : "text-gray-400 hover:text-white"}`}
                >
                  {level.title}
                </button>
              ))}
            </div>
          </div>

          {/* Course level content */}
          <div className="rounded-xl shadow-lg p-8 border border-gray-700">
            {courseLevels.map(
              (level) =>
                activeTab === level.id && (
                  <motion.div key={level.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <h3 className="text-2xl font-bold text-white mb-4">{level.title}</h3>
                      <p className="text-gray-300 mb-6">{level.description}</p>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
                          <div className="text-sm font-semibold text-blue-300 mb-1">DURATION</div>
                          <div className="text-gray-200">{level.duration}</div>
                        </div>
                        <div className="bg-green-900/30 p-4 rounded-lg border border-green-700/50">
                          <div className="text-sm font-semibold text-green-300 mb-1">PROJECTS</div>
                          <div className="text-gray-200">{level.projects}</div>
                        </div>
                      </div>

                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">View Courses</button>
                    </div>

                    <div className="bg-gray-900/30 rounded-lg p-6 border border-gray-600 shadow">
                      <h4 className="font-bold text-white mb-4">Curriculum Highlights</h4>
                      <ul className="space-y-4">
                        {level.highlights.map((item, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-green-400 mr-2 mt-1">✓</span>
                            <span className="text-gray-200">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Career?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-gray-300">Join over 100,000 professionals who have accelerated their careers with our industry-leading courses</p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-blue-600 text-white hover:bg-blue-700 font-bold py-3 px-8 rounded-lg transition-colors duration-300 shadow-lg">Get Started Now</button>
            <button className="bg-transparent border-2 border-blue-500 text-blue-300 hover:bg-blue-900/40 font-bold py-3 px-8 rounded-lg transition-colors">Schedule a Demo</button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8">
            <div className="flex items-center">
              <div className="text-3xl font-bold mr-3">4.9/5</div>
              <div className="text-left text-gray-300">
                <div>Average Rating</div>
                <div className="flex text-yellow-400">★★★★★</div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="text-3xl font-bold mr-3">95%</div>
              <div className="text-left text-gray-300">
                <div>Completion Rate</div>
                <div>Across all courses</div>
              </div>
            </div>

            <div className="flex items-center">
              <div className="text-3xl font-bold mr-3">24/7</div>
              <div className="text-left text-gray-300">
                <div>Support</div>
                <div>Expert assistance</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Landing;
