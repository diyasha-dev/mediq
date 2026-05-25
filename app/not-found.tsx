import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="text-9xl font-heading font-bold text-ash mb-4">404</div>
      <h1 className="text-3xl md:text-4xl font-heading text-charcoal mb-4">
        Page Not Found
      </h1>
      <p className="text-slate mb-8 max-w-md mx-auto">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-8 py-3 bg-teal text-white font-semibold rounded-xl hover:bg-teal-hover active:bg-teal-active transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
