import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { request } from "@/lib/http";
import { skillSchema } from "@/schemas";

export type SkillPayload = { name: string; category: string; level: number; order: number };

export const useSkills = () =>
  useQuery({ queryKey: ["skills"], queryFn: () => request(z.array(skillSchema), "/skills") });

const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["skills"] });
    void queryClient.invalidateQueries({ queryKey: ["projects"] });
  };
};

export const useCreateSkill = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: SkillPayload) => request(skillSchema, "/skills", { method: "POST", body: payload }),
    onSuccess: invalidate,
  });
};

export const useUpdateSkill = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SkillPayload> }) =>
      request(skillSchema, `/skills/${id}`, { method: "PUT", body: payload }),
    onSuccess: invalidate,
  });
};

export const useDeleteSkill = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => request(z.unknown(), `/skills/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
};
