import { render, screen } from "@testing-library/react";
import TechStackSection from "../../components/home/TechStackSection";

const STACK_NAMES = [
  "Python",
  "Java",
  "SQL",
  "C++",
  "Kafka",
  "Spark",
  "AWS",
  "GCP",
  "dbt",
  "OpenAI",
  "VectorDB",
  "Airflow",
  "Terraform",
];

describe("TechStackSection", () => {
  it("renders the section heading", () => {
    render(<TechStackSection />);
    expect(
      screen.getByRole("heading", { name: "Tech Stack" })
    ).toBeInTheDocument();
  });

  it("renders every stack item (mobile grid and desktop rows)", () => {
    render(<TechStackSection />);
    for (const name of STACK_NAMES) {
      // Each item renders twice: once in the mobile grid, once in a desktop row.
      expect(screen.getAllByText(name).length).toBeGreaterThanOrEqual(2);
    }
  });
});
