import { render, screen } from "@testing-library/react";
import Work from "../../work/page";

const mockSearchParams = new URLSearchParams("");

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  usePathname: () => "/work",
  useSearchParams: () => mockSearchParams,
}));

beforeEach(() => {
  // ContentPosts fetches projects and blogs on mount.
  global.fetch = jest.fn((input: RequestInfo | URL) => {
    const url = String(input);
    const payload = url.includes("/projects")
      ? { projects: [] }
      : { blogs: [] };
    return Promise.resolve({ json: () => Promise.resolve(payload) });
  }) as unknown as typeof fetch;
});

describe("Work page", () => {
  it("renders the nav, content posts, media section, and footer CTA", async () => {
    render(<Work />);

    // ContentPosts heading appears once loading resolves.
    expect(
      await screen.findByRole("heading", { name: "Work" })
    ).toBeInTheDocument();

    // NavBar (the name also appears in the footer)
    expect(screen.getAllByText(/ayotomiwa salau/i).length).toBeGreaterThan(0);

    // Media section
    expect(screen.getByRole("heading", { name: "Media" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /see more/i })).toBeInTheDocument();

    // Footer CTA — on /work the secondary action points to /about.
    expect(
      screen.getByText(/let's build something scalable/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /more about me/i })
    ).toHaveAttribute("href", "/about");
  });
});
