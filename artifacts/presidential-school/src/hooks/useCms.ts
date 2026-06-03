import { useQuery } from "@tanstack/react-query";
import {
  fetchContent,
  type CmsSettings,
  type CmsContact,
  type CmsAdmin,
  type CmsTeacher,
  type CmsNews,
  type CmsGalleryItem,
  type CmsStudent,
  type CmsCertificate,
  type CmsAdmissionStage,
} from "@/lib/cms";

export function useCmsSettings() {
  return useQuery({
    queryKey: ["cms", "settings"],
    queryFn: () => fetchContent<CmsSettings>("settings"),
    staleTime: 0,
  });
}

export function useCmsContact() {
  return useQuery({
    queryKey: ["cms", "contact"],
    queryFn: () => fetchContent<CmsContact>("contact"),
    staleTime: 0,
  });
}

export function useCmsAdministration() {
  return useQuery({
    queryKey: ["cms", "administration"],
    queryFn: () => fetchContent<CmsAdmin[]>("administration"),
    staleTime: 0,
  });
}

export function useCmsTeachers() {
  return useQuery({
    queryKey: ["cms", "teachers"],
    queryFn: () => fetchContent<CmsTeacher[]>("teachers"),
    staleTime: 0,
  });
}

export function useCmsNews(featured?: boolean) {
  const q = featured ? "news?featured=true" : "news";
  return useQuery({
    queryKey: ["cms", "news", featured ?? false],
    queryFn: () => fetchContent<CmsNews[]>(q),
    staleTime: 0,
  });
}

export function useCmsGallery() {
  return useQuery({
    queryKey: ["cms", "gallery"],
    queryFn: () => fetchContent<CmsGalleryItem[]>("gallery"),
    staleTime: 0,
  });
}

export function useCmsStudents() {
  return useQuery({
    queryKey: ["cms", "students"],
    queryFn: () => fetchContent<CmsStudent[]>("students"),
    staleTime: 0,
  });
}

export function useCmsCertificates() {
  return useQuery({
    queryKey: ["cms", "certificates"],
    queryFn: () => fetchContent<CmsCertificate[]>("certificates"),
    staleTime: 0,
  });
}

export function useCmsAdmissions() {
  return useQuery({
    queryKey: ["cms", "admissions"],
    queryFn: () => fetchContent<CmsAdmissionStage[]>("admissions"),
    staleTime: 0,
  });
}
