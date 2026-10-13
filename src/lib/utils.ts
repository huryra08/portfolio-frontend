import { useEffect } from "react";

export const cn = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

export const formatMonth = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

export const toDateInput = (iso: string) => iso.slice(0, 10);

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const emptyToNull = (value: string) => (value.trim() === "" ? null : value.trim());

export function useTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
