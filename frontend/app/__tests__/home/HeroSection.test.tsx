import { render, screen } from "@testing-library/react";
import HeroSection from "../../components/home/HeroSection";

describe("HeroSection", () => {
  it("introduces the senior data engineer positioning", () => {
    render(<HeroSection />);
    expect(screen.getByText(/senior data engineer/i)).toBeInTheDocument();
  });

  it("lists the outcome bullets", () => {
    render(<HeroSection />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText(/pipelines that scale/i)).toBeInTheDocument();
    expect(screen.getByText(/teams can actually trust/i)).toBeInTheDocument();
    expect(
      screen.getByText(/operations automated end to end/i)
    ).toBeInTheDocument();
  });

  it("mentions the stack focus areas", () => {
    render(<HeroSection />);
    expect(screen.getByText(/agentic workflows/i)).toBeInTheDocument();
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
