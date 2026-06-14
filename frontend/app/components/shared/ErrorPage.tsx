import Link from "next/link";
import NavBar from "../layout/NavBar";
import Footer from "../layout/Footer";

const buttonClass =
  "rounded-xl bg-[#d95673] px-6 py-2.5 text-base text-white shadow-sm transition hover:scale-[1.03] hover:opacity-90 active:scale-[0.98]";

type ErrorPageProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

const ErrorPage = ({
  title = "This page does not exist",
  message = "The page you are looking for may have moved or never existed.",
  onRetry,
}: ErrorPageProps) => {
  return (
    <div className="bg-white">
      <NavBar />
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-[#333333]">{title}</h1>
        <p className="max-w-md text-lg text-[#555555]">{message}</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/" className={buttonClass}>
            Go to homepage
          </Link>
          <Link href="/work" className={buttonClass}>
            View my work
          </Link>
          {onRetry ? (
            <button type="button" onClick={onRetry} className={buttonClass}>
              Try again
            </button>
          ) : null}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ErrorPage;
