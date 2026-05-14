import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Games",
  description:
    "Small experimental games built for fun, creativity, and exploring ideas beyond production systems.",
};

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
