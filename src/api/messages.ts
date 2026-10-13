import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { request } from "@/lib/http";
import { messageSchema, type ContactValues } from "@/schemas";

export const useMessages = (enabled = true) =>
  useQuery({
    queryKey: ["messages"],
    queryFn: () => request(z.array(messageSchema), "/messages"),
    enabled,
  });

// public contact form
export const useSendMessage = () =>
  useMutation({
    mutationFn: (values: ContactValues) =>
      request(z.unknown(), "/messages", {
        method: "POST",
        body: { ...values, subject: values.subject || undefined },
      }),
  });

const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["messages"] });
};

export const useMarkMessageRead = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => request(z.unknown(), `/messages/${id}/read`, { method: "PATCH" }),
    onSuccess: invalidate,
    meta: { silent: true },
  });
};

export const useDeleteMessage = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => request(z.unknown(), `/messages/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
};
