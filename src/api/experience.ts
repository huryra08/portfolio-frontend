import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { request } from "@/lib/http";
import { experienceSchema } from "@/schemas";

export type ExperiencePayload = {
  company: string;
  position: string;
  description: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  order: number;
};

export const useExperience = () =>
  useQuery({ queryKey: ["experience"], queryFn: () => request(z.array(experienceSchema), "/experience") });

const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["experience"] });
};

export const useCreateExperience = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: ExperiencePayload) =>
      request(experienceSchema, "/experience", { method: "POST", body: payload }),
    onSuccess: invalidate,
  });
};

export const useUpdateExperience = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ExperiencePayload }) =>
      request(experienceSchema, `/experience/${id}`, { method: "PUT", body: payload }),
    onSuccess: invalidate,
  });
};

export const useDeleteExperience = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => request(z.unknown(), `/experience/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
};
