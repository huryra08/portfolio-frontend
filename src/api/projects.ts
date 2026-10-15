import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { request } from "@/lib/http";
import { projectSchema } from "@/schemas";

export type ProjectPayload = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  thumbnail: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
  featured: boolean;
  published: boolean;
  order: number;
  images: { url: string; order: number }[];
  skillIds: string[];
  challenges: { problem: string; solution: string; order: number }[];
};

const projectsSchema = z.array(projectSchema);

export const useProjects = () =>
  useQuery({ queryKey: ["projects", "public"], queryFn: () => request(projectsSchema, "/projects") });

export const useProject = (slug: string) =>
  useQuery({ queryKey: ["project", slug], queryFn: () => request(projectSchema, `/projects/${slug}`) });

export const useAdminProjects = () =>
  useQuery({ queryKey: ["projects", "admin"], queryFn: () => request(projectsSchema, "/projects/admin/all") });

const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["projects"] });
    void queryClient.invalidateQueries({ queryKey: ["project"] });
  };
};

export const useCreateProject = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: ProjectPayload) => request(projectSchema, "/projects", { method: "POST", body: payload }),
    onSuccess: invalidate,
  });
};

export const useUpdateProject = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ProjectPayload> }) =>
      request(projectSchema, `/projects/${id}`, { method: "PUT", body: payload }),
    onSuccess: invalidate,
  });
};

export const useDeleteProject = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => request(z.unknown(), `/projects/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
};
