import { render, screen } from "@testing-library/react";
import MediaSection from "../../components/work/MediaSection";
import mediaData from "../../data/media.json";

describe("MediaSection", () => {
  it("renders the section heading and intro", () => {
    render(<MediaSection />);
    expect(screen.getByRole("heading", { name: "Media" })).toBeInTheDocument();
    expect(
      screen.getByText(/coding walkthroughs, demos, and project deep-dives/i)
    ).toBeInTheDocument();
  });

  it("renders one card per media entry", () => {
    render(<MediaSection />);
    for (const entry of mediaData) {
      expect(screen.getByText(entry.title)).toBeInTheDocument();
      expect(
        screen.getByRole("link", {
          name: `Watch on YouTube: ${entry.title}`,
        })
      ).toHaveAttribute("href", entry.videoUrl);
    }
  });

  it("links to the YouTube channel", () => {
    render(<MediaSection />);
    const seeMore = screen.getByRole("link", { name: /see more/i });
    expect(seeMore).toHaveAttribute(
      "href",
      "https://www.youtube.com/@ayotomiwasalau"
    );
    expect(seeMore).toHaveAttribute("target", "_blank");
  });
});
