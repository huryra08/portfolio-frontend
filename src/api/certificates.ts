import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { request } from "@/lib/http";
import { certificateSchema } from "@/schemas";

export type CertificatePayload = {
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  credentialId: string | null;
  credentialUrl: string | null;
  imageUrl: string | null;
  description: string | null;
  order: number;
};

export const useCertificates = () =>
  useQuery({ queryKey: ["certificates"], queryFn: () => request(z.array(certificateSchema), "/certificates") });

const useInvalidate = () => {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["certificates"] });
};

export const useCreateCertificate = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: CertificatePayload) => request(certificateSchema, "/certificates", { method: "POST", body: payload }),
    onSuccess: invalidate,
  });
};

export const useUpdateCertificate = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CertificatePayload }) =>
      request(certificateSchema, `/certificates/${id}`, { method: "PUT", body: payload }),
    onSuccess: invalidate,
  });
};

export const useDeleteCertificate = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => request(z.unknown(), `/certificates/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });
};
