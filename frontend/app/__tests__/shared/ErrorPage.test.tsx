import { render, screen } from "@testing-library/react";
import ErrorPage from "../../components/shared/ErrorPage";

describe("ErrorPage", () => {
  it("shows the default not-found message and navigation buttons", () => {
    render(<ErrorPage />);

    expect(
      screen.getByRole("heading", { name: /this page does not exist/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to homepage/i })).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByRole("link", { name: /view my work/i })).toHaveAttribute(
      "href",
      "/work"
    );
  });

  it("renders a retry action when provided", () => {
    const onRetry = jest.fn();
    render(
      <ErrorPage title="Something went wrong" message="Please try again." onRetry={onRetry} />
    );

    screen.getByRole("button", { name: /try again/i }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
