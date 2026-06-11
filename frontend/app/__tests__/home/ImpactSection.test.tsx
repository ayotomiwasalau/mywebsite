import { render, screen } from "@testing-library/react";
import ImpactSection from "../../components/home/ImpactSection";

const IMPACT_TEXTS = [
  "5B+ rows processed daily",
  "50% faster data processing",
  "5 days → 13 min ML retraining",
  "98% NLP insight accuracy",
  "70% better data accessibility",
  "85% fewer pipeline breakages",
];

describe("ImpactSection", () => {
  it("renders the section heading", () => {
    render(<ImpactSection />);
    expect(screen.getByRole("heading", { name: "Impact" })).toBeInTheDocument();
  });

  it("renders every impact metric", () => {
    render(<ImpactSection />);
    for (const text of IMPACT_TEXTS) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
  });
});
