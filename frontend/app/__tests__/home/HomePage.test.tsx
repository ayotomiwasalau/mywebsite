import { render, screen } from "@testing-library/react";
import Home from "../../page";

const mockSearchParams = new URLSearchParams("");

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  usePathname: () => "/",
  useSearchParams: () => mockSearchParams,
}));

beforeEach(() => {
  // FeaturedProjects and WorkAndInsight both fetch lists on mount.
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve({ items: [] }) })
  ) as unknown as typeof fetch;
});

describe("Home page", () => {
  it("renders the nav, every home section, and the footer CTA", async () => {
    render(<Home />);

    // Wait for the async sections to settle.
    await screen.findByRole("link", { name: /view all/i });

    // NavBar (the name also appears in the footer)
    expect(screen.getAllByText(/ayotomiwa salau/i).length).toBeGreaterThan(0);
    const homeLinks = screen.getAllByRole("link", { name: "HOME" });
    expect(homeLinks[0]).toHaveAttribute("href", "/");
    const workLinks = screen.getAllByRole("link", { name: "WORK" });
    expect(workLinks[0]).toHaveAttribute("href", "/work");

    // Sections
    expect(screen.getByText(/senior data engineer/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Featured Post" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /latest work and insights/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /specialization/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Impact" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Tech Stack" })
    ).toBeInTheDocument();

    // Footer CTA
    expect(
      screen.getByText(/let's build something scalable/i)
    ).toBeInTheDocument();
    // "Contact me" appears in both the hero and the footer CTA.
    const contactLinks = screen.getAllByRole("link", { name: /contact me/i });
    expect(contactLinks.length).toBeGreaterThan(0);
    for (const link of contactLinks) {
      expect(link).toHaveAttribute("href", "/contact");
    }
  });
});
