"use client";

import { useEffect } from "react";
import ErrorPage from "./components/shared/ErrorPage";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorPage
      title="Something went wrong"
      message="An unexpected error occurred. You can try again or head back to a safe page."
      onRetry={reset}
    />
  );
}
