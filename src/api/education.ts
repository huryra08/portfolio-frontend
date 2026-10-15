import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { request } from "@/lib/http";
import { educationSchema } from "@/schemas";

export type EducationPayload = {
  institution: string;
  degree: string;
  field: string | null;
  grade: string | null;
  location: string | null;
  description: string | null;
  startDate: string;
  endDate: string | null;
  order: number;
};

export const useEducation = () =>
  useQuery({ queryKey: ["education"], queryFn: () => request(z.array(educationSchema), "/education") });

const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["education"] });
};

export const useCreateEducation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: EducationPayload) => request(educationSchema, "/education", { method: "POST", body: payload }),
    onSuccess: invalidate,
  });
};

export const useUpdateEducation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EducationPayload }) =>
      request(educationSchema, `/education/${id}`, { method: "PUT", body: payload }),
    onSuccess: invalidate,
  });
};

export const useDeleteEducation = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => request(z.unknown(), `/education/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
};
