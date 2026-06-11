import { render, screen, waitFor } from "@testing-library/react";
import FeaturedProjects from "../../components/home/FeaturedProjects";

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
      created_on: "2024-03-01T00:00:00Z",
      description: `${title} description`,
      tags: ["kafka"],
    },
  };
}

const API_RESPONSE = {
  items: [
    buildItem("project", "p1", "project-one", "Project One"),
    buildItem("blog", "b1", "blog-one", "Blog One"),
    buildItem("project", "p2", "project-two", "Project Two"),
    buildItem("project", "p3", "project-three", "Project Three"),
  ],
};

function mockFetch(payload: unknown) {
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve(payload) })
  ) as unknown as typeof fetch;
}

describe("FeaturedProjects", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows a loading spinner while fetching", async () => {
    mockFetch(API_RESPONSE);
    render(<FeaturedProjects />);
    expect(
      document.querySelector('[aria-label="loading featured content"]')
    ).toBeInTheDocument();
    // Let the fetch settle so state updates stay inside act().
    await screen.findByText("Project One");
  });

  it("renders the section heading", async () => {
    mockFetch(API_RESPONSE);
    render(<FeaturedProjects />);
    expect(
      screen.getByRole("heading", { name: "Featured Post" })
    ).toBeInTheDocument();
    await screen.findByText("Project One");
  });

  it("renders at most three featured cards from the API", async () => {
    mockFetch(API_RESPONSE);
    render(<FeaturedProjects />);

    await screen.findByText("Project One");
    expect(screen.getByText("Blog One")).toBeInTheDocument();
    expect(screen.getByText("Project Two")).toBeInTheDocument();
    // The fourth item is sliced off.
    expect(screen.queryByText("Project Three")).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /view post/i })).toHaveLength(3);
  });

  it("links blogs and projects to their detail pages", async () => {
    mockFetch(API_RESPONSE);
    render(<FeaturedProjects />);

    await screen.findByText("Project One");
    const links = screen.getAllByRole("link", { name: /view post/i });
    const hrefs = links.map((link) => link.getAttribute("href"));
    expect(hrefs).toContain("/work/projects/project-one");
    expect(hrefs).toContain("/work/blogs/blog-one");
  });

  it("renders no cards when the API fails", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    global.fetch = jest.fn(() =>
      Promise.reject(new Error("network down"))
    ) as unknown as typeof fetch;

    render(<FeaturedProjects />);

    await waitFor(() =>
      expect(
        document.querySelector('[aria-label="loading featured content"]')
      ).not.toBeInTheDocument()
    );
    expect(
      screen.queryByRole("link", { name: /view post/i })
    ).not.toBeInTheDocument();
  });
});
