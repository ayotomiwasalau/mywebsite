import { render, screen } from "@testing-library/react";
import Specializations from "../../components/home/Specializations";

describe("Specializations", () => {
  it("renders the section heading", () => {
    render(<Specializations />);
    expect(
      screen.getByRole("heading", { name: /specialization/i })
    ).toBeInTheDocument();
  });

  it("lists all four specialization areas", () => {
    render(<Specializations />);
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);

    expect(screen.getByText(/data platforms/i)).toBeInTheDocument();
    expect(screen.getByText(/cloud architecture/i)).toBeInTheDocument();
    expect(screen.getByText(/ai systems/i)).toBeInTheDocument();
    expect(screen.getByText(/performance engineering/i)).toBeInTheDocument();
  });
});
