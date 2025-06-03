import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText } from "lucide-react";

interface Chapter {
  chapterId: string;
  title: string;
  // Add other chapter properties if needed
}

interface Section {
  sectionId: string;
  sectionTitle: string;
  sectionDescription?: string; // Keep if used elsewhere, though not in the provided snippet structure for display
  chapters: Chapter[];
}

interface AccordionSectionsProps {
  sections: Section[];
}

const AccordionSections = ({ sections }: AccordionSectionsProps) => {
  if (!sections || sections.length === 0) {
    return <div className="text-sm text-customgreys-dirtyGrey">No sections available for this course.</div>;
  }

  return (
    <Accordion type="multiple" className="w-full">
      {sections.map((section) => (
        <AccordionItem key={section.sectionId} value={section.sectionId} className="accordion-section">
          <AccordionTrigger className="accordion-section__trigger">
            <h5 className="accordion-section__title">Section {sections.indexOf(section) + 1}: {section.sectionTitle}</h5>
          </AccordionTrigger>
          <AccordionContent className="accordion-section__content">
            <ul>
              {section.chapters?.map((chapter) => (
                <li key={chapter.chapterId} className="accordion-section__chapter">
                  <FileText className="mr-2 w-4 h-4" />
                  <span className="text-sm">{chapter.title}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default AccordionSections;
