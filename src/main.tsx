import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import App from "./App";
import { ApiError, getErrorMessage } from "./lib/http";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      // don't retry client errors (404, 401...), they won't fix themselves
      retry: (count, error) => !(error instanceof ApiError && error.status < 500 && error.status !== 0) && count < 2,
    },
  },
  // one place for mutation errors, so every failed save shows the same kind of message
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.options.meta?.silent) return;
      toast.error(getErrorMessage(error));
    },
  }),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster position="bottom-right" toastOptions={{ classNames: { toast: "!font-sans" } }} />
    </QueryClientProvider>
  </StrictMode>,
);
