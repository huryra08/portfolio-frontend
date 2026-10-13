import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { request } from "@/lib/http";
import { loginResponseSchema, userSchema, type LoginValues } from "@/schemas";

export const useMe = () =>
  useQuery({
    queryKey: ["me"],
    queryFn: () => request(userSchema, "/auth/me"),
    retry: false,
    staleTime: 5 * 60_000,
  });

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: LoginValues) => request(loginResponseSchema, "/auth/login", { method: "POST", body: values }),
    onSuccess: (data) => queryClient.setQueryData(["me"], data.user),
    meta: { silent: true }, // the login page shows its own inline error
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => request(z.unknown(), "/auth/logout", { method: "POST" }),
    onSuccess: () => queryClient.clear(),
  });
};
