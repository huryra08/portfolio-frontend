import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTitle } from "@/lib/utils";
import { useProfile } from "@/api/profile";
import Hero from "./home/Hero";
import ProjectsSection from "./home/ProjectsSection";
import SkillsSection from "./home/SkillsSection";
import ExperienceSection from "./home/ExperienceSection";
import EducationSection from "./home/EducationSection";
import CertificatesSection from "./home/CertificatesSection";
import ContactSection from "./home/ContactSection";

export default function Home() {
  const { hash } = useLocation();
  const { data: profile } = useProfile();
  useTitle(profile ? `${profile.fullName} | ${profile.headline}` : "Portfulio");

  // the router doesn't scroll to #anchors by itself
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <>
      <Hero />
      <ProjectsSection />
      <SkillsSection />
      <ExperienceSection />
      <EducationSection />
      <CertificatesSection />
      <ContactSection />
    </>
  );
}
