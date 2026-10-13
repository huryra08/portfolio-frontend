import { Link } from "react-router-dom";
import { useTitle } from "@/lib/utils";

export default function NotFound() {
  useTitle("Page not found | Portfulio");
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="max-w-md">
        <h1 className="text-6xl font-extrabold">404</h1>
        <p className="mt-3 text-xl font-semibold">This page doesn't exist.</p>
        <p className="mt-2 text-mute">The link may be broken, or the page may have moved.</p>
        <Link to="/" className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-ink/85">
          Go to the home page
        </Link>
      </div>
    </main>
  );
}
