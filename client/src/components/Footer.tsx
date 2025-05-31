import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  const footerSections = [
    {
      title: "In-demand Careers",
      links: ["Data Scientist", "Full Stack Web Developer", "Cloud Engineer", "Project Manager", "Game Developer", "Career Accelerators"],
    },
    {
      title: "Web Development",
      links: ["Web Development", "JavaScript", "React.js", "Angular", "Java"],
    },
    {
      title: "IT Certifications",
      links: ["Amazon AWS", "AWS Certified Cloud Practitioner", "Microsoft Azure Fundamentals", "AWS Certified Solutions Architect - Associate", "Kubernetes"],
    },
    {
      title: "Leadership",
      links: ["Leadership", "Management Skills", "Project Management", "Personal Productivity", "Emotional Intelligence"],
    },
    {
      title: "Certifications by Skill",
      links: ["Operational Certification", "Project Management Certification", "Cloud Certification", "Data Analytics Certification", "HR Management Certification", "Professional Certification"],
    },
    {
      title: "Data Science",
      links: ["Data Science", "Python", "Machine Learning", "ChatGPT", "Deep Learning"],
    },
    {
      title: "Communication",
      links: ["Communication Skills", "Presentation Skills", "Public Speaking", "Writing", "PowerPoint"],
    },
    {
      title: "Business Analytics & Intelligence",
      links: ["Microsoft Excel", "SQL", "Microsoft Power BI", "Data Analysis", "Business Analysis"],
    },
    {
      title: "About",
      links: ["About us", "Careers", "Contact us", "Blog", "Investors"],
    },
    {
      title: "Discover LEMES",
      links: ["Get the app", "Teach on LEMES", "Plans and Pricing", "Affiliate", "Help and Support"],
    },
    {
      title: "LEMES for Business",
      links: ["LEMES Business"],
    },
    {
      title: "Legal & Accessibility",
      links: ["Accessibility statement", "Privacy policy", "Sitemap", "Terms"],
    },
  ];

  return (
    <footer className="bg-slate-900/80 w-full mt-20">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Top section with multiple columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-10">
          {footerSections.map((section, index) => (
            <div key={index} className="mb-6">
              <h3 className="font-bold text-gray-100 mb-4 text-sm">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <Link href="#" className="text-gray-600 hover:text-primary-700 text-sm">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom section with copyright and legal links */}
        <div className="border-t border-gray-300 pt-8 pb-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Image src="/logo.svg" alt="logo" width={25} height={20} className="app-sidebar__logo mr-2" />
              <span className="text-slate-200 text-sm">&copy; 2024 LEMES. All Rights Reserved</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {["About", "Privacy Policy", "Licensing", "Contact"].map((item) => (
                <Link key={item} href={`/${item.toLowerCase().replace(/\s+/g, "-")}`} className="text-slate-200 hover:text-primary-600 text-sm">
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
