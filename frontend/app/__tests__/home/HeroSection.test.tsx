import { render, screen } from "@testing-library/react";
import HeroSection from "../../components/home/HeroSection";

describe("HeroSection", () => {
  it("introduces the platform positioning", () => {
    render(<HeroSection />);
    expect(screen.getByText(/I architect and build/i)).toBeInTheDocument();
    expect(screen.getByText(/data and AI platforms/i)).toBeInTheDocument();
  });

  it("lists the outcome bullets", () => {
    render(<HeroSection />);
    const bullets = screen.getByRole("list");
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(bullets).toHaveTextContent(/pipelines.*scale.*without breaking/i);
    expect(bullets).toHaveTextContent(/dashboards & reports.*trust/i);
    expect(bullets).toHaveTextContent(/operations.*automated.*AI/i);
  });

  it("mentions the stack focus areas", () => {
    render(<HeroSection />);
    expect(screen.getByText(/agentic workflows/i)).toBeInTheDocument();
    expect(screen.getByText(/applied AI/i)).toBeInTheDocument();
  });

  it("renders the call-to-action links", () => {
    render(<HeroSection />);
    expect(screen.getByRole("link", { name: /contact me/i })).toHaveAttribute(
      "href",
      "/contact"
    );
    expect(
      screen.getByRole("link", { name: /more about me/i })
    ).toHaveAttribute("href", "/about");
    expect(
      screen.getByRole("link", { name: /subscribe to my newsletter/i })
    ).toHaveAttribute("href", "#subscription-form");

    const proposal = screen.getByRole("link", {
      name: /request for proposal/i,
    });
    expect(proposal).toHaveAttribute("href", "https://tiptier.co");
    expect(proposal).toHaveAttribute("target", "_blank");
    expect(proposal).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the hero image", () => {
    render(<HeroSection />);
    expect(screen.getByAltText("Hero Image")).toBeInTheDocument();
  });
});
