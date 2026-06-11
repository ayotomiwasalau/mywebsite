import { render, screen, waitFor } from "@testing-library/react";
import WorkAndInsight from "../../components/home/WorkAndInsight";

function buildItem(
  type: "blog" | "project",
  id: string,
  slug: string,
  title: string
) {
  return {
    type,
    item: {
      id,
      slug,
      title,
      header_img_url: `/images/${type}/${slug}/cover.jpg`,
      header_img_alt: `${title} cover`,
      created_on: "2024-02-01T00:00:00Z",
      description: `${title} summary`,
      tags: ["spark"],
      href: "",
    },
  };
}

const API_RESPONSE = {
  items: [
    buildItem("project", "w1", "entry-one", "Entry One"),
    buildItem("blog", "w2", "entry-two", "Entry Two"),
    buildItem("project", "w3", "entry-three", "Entry Three"),
    buildItem("blog", "w4", "entry-four", "Entry Four"),
    buildItem("project", "w5", "entry-five", "Entry Five"),
  ],
};

function mockFetch(payload: unknown) {
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve(payload) })
  ) as unknown as typeof fetch;
}

describe("WorkAndInsight", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows a loading spinner while fetching", async () => {
    mockFetch(API_RESPONSE);
    render(<WorkAndInsight />);
    expect(
      document.querySelector('[aria-label="loading work and insight entries"]')
    ).toBeInTheDocument();
    // Let the fetch settle so state updates stay inside act().
    await screen.findAllByText("Entry One");
  });

  it("renders the section heading", async () => {
    mockFetch(API_RESPONSE);
    render(<WorkAndInsight />);
    expect(
      screen.getByRole("heading", { name: /latest work and insights/i })
    ).toBeInTheDocument();
    await screen.findAllByText("Entry One");
  });

  it("renders at most four entries from the API", async () => {
    mockFetch(API_RESPONSE);
    render(<WorkAndInsight />);

    // Entries render twice (mobile + desktop layouts).
    await screen.findAllByText("Entry One");
    expect(screen.getAllByText("Entry Four").length).toBeGreaterThanOrEqual(1);
    // The fifth item is sliced off.
    expect(screen.queryByText("Entry Five")).not.toBeInTheDocument();
  });

  it("links to the full work page", async () => {
    mockFetch(API_RESPONSE);
    render(<WorkAndInsight />);

    const viewAll = await screen.findByRole("link", { name: /view all/i });
    expect(viewAll).toHaveAttribute("href", "/work");
  });

  it("renders no entries when the API fails", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    global.fetch = jest.fn(() =>
      Promise.reject(new Error("network down"))
    ) as unknown as typeof fetch;

    render(<WorkAndInsight />);

    await waitFor(() =>
      expect(
        document.querySelector(
          '[aria-label="loading work and insight entries"]'
        )
      ).not.toBeInTheDocument()
    );
    expect(screen.queryByText("Entry One")).not.toBeInTheDocument();
  });
});
