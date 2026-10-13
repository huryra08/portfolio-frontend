import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError, request } from "@/lib/http";
import { profileSchema } from "@/schemas";

export type ProfilePayload = {
  fullName: string;
  headline: string;
  bio: string;
  location: string | null;
  contactEmail: string | null;
  avatarUrl: string | null;
  resumeUrl: string | null;
  socialLinks: { platform: string; url: string; order: number }[];
};

// A 404 just means the profile hasn't been created yet, so it resolves to null
export const useProfile = () =>
  useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        return await request(profileSchema, "/profile");
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      }
    },
  });

export const useSaveProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProfilePayload) => request(profileSchema, "/profile", { method: "PUT", body: payload }),
    onSuccess: (data) => queryClient.setQueryData(["profile"], data),
  });
};
