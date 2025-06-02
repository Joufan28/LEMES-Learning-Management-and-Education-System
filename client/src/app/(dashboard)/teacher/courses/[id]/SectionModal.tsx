import { CustomFormField } from "@/components/CustomFormField";
import CustomModal from "@/components/CustomModal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { SectionFormData, sectionSchema } from "@/lib/schemas";
import { addSection, closeSectionModal, editSection } from "@/state";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const SectionModal = () => {
  const dispatch = useAppDispatch();
  const { isSectionModalOpen, selectedSectionIndex, sections } = useAppSelector((state) => state.global.courseEditor);

  const section = selectedSectionIndex !== null ? sections[selectedSectionIndex] : null;

  const form = useForm<SectionFormData>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      sectionId: uuidv4(),
      sectionTitle: "",
      sectionDescription: "",
      chapters: [],
    },
  });

  useEffect(() => {
    if (section) {
      form.reset({
        sectionId: section.sectionId,
        sectionTitle: section.sectionTitle,
        sectionDescription: section.sectionDescription || "",
        chapters: section.chapters || [],
      });
    } else {
      form.reset({
        sectionId: uuidv4(),
        sectionTitle: "",
        sectionDescription: "",
        chapters: [],
      });
    }
  }, [section, form]);

  const onClose = () => {
    dispatch(closeSectionModal());
  };

  const onSubmit = (data: SectionFormData) => {
    if (selectedSectionIndex === null) {
      dispatch(addSection(data));
    } else {
      dispatch(
        editSection({
          index: selectedSectionIndex,
          section: data,
        })
      );
    }

    toast.success(`Section ${selectedSectionIndex === null ? 'added' : 'updated'} successfully. Remember to save the course to apply changes.`);
    onClose();
  };

  return (
    <CustomModal isOpen={isSectionModalOpen} onClose={onClose}>
      <div className="section-modal">
        <div className="section-modal__header">
          <h2 className="section-modal__title">{selectedSectionIndex === null ? 'Add Section' : 'Edit Section'}</h2>
          <button onClick={onClose} className="section-modal__close">
            <X className="w-6 h-6" />
          </button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="section-modal__form">
            <CustomFormField 
              name="sectionTitle" 
              label="Section Title" 
              placeholder="Write section title here" 
            />

            <CustomFormField 
              name="sectionDescription" 
              label="Section Description" 
              type="textarea" 
              placeholder="Write section description here" 
            />

            <div className="section-modal__actions">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary-700">
                {selectedSectionIndex === null ? 'Add Section' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </CustomModal>
  );
};

export default SectionModal;
