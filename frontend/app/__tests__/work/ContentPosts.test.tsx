import { fireEvent, render, screen } from "@testing-library/react";
import ContentPosts from "../../components/work/ContentPosts";

const mockReplace = jest.fn();
// Stable instance: ContentPosts syncs the active tab from searchParams in an
// effect, so a new object per render would keep resetting the tab.
const mockSearchParams = new URLSearchParams("");

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/work",
  useSearchParams: () => mockSearchParams,
}));

function buildPost(id: string, slug: string, title: string, tag: string) {
  return {
    id,
    slug,
    title,
    header_img_url: `/images/${slug}/cover.jpg`,
    created_on: "2024-01-15T00:00:00Z",
    tags: [tag],
    href: "",
    description: `${title} description`,
  };
}

const PROJECTS = [
  buildPost("p1", "alpha-pipeline", "Alpha Pipeline", "kafka"),
  buildPost("p2", "beta-warehouse", "Beta Warehouse", "snowflake"),
];

const BLOGS = [buildPost("b1", "gamma-notes", "Gamma Notes", "spark")];

function mockListFetch() {
  global.fetch = jest.fn((input: RequestInfo | URL) => {
    const url = String(input);
    const payload = url.includes("/projects")
      ? { projects: PROJECTS }
      : { blogs: BLOGS };
    return Promise.resolve({ json: () => Promise.resolve(payload) });
  }) as unknown as typeof fetch;
}

describe("ContentPosts", () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockListFetch();
  });

  it("renders the work heading and search box after loading", async () => {
    render(<ContentPosts />);
    expect(
      await screen.findByRole("heading", { name: "Work" })
    ).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: /search posts/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /sort posts/i })).toBeInTheDocument();
  });

  it("shows project cards by default", async () => {
    render(<ContentPosts />);
    expect(await screen.findByText("Alpha Pipeline")).toBeInTheDocument();
    expect(screen.getByText("Beta Warehouse")).toBeInTheDocument();
    expect(screen.queryByText("Gamma Notes")).not.toBeInTheDocument();
  });

  it("switches to blogs when the Blogs tab is clicked", async () => {
    render(<ContentPosts />);
    await screen.findByText("Alpha Pipeline");

    fireEvent.click(screen.getByRole("tab", { name: "Blogs" }));

    expect(screen.getByText("Gamma Notes")).toBeInTheDocument();
    expect(screen.queryByText("Alpha Pipeline")).not.toBeInTheDocument();
    expect(mockReplace).toHaveBeenCalledWith("/work?type=blog", {
      scroll: false,
    });
  });

  it("filters cards by search term", async () => {
    render(<ContentPosts />);
    await screen.findByText("Alpha Pipeline");

    fireEvent.change(screen.getByRole("searchbox", { name: /search posts/i }), {
      target: { value: "Beta" },
    });

    expect(screen.getByText("Beta Warehouse")).toBeInTheDocument();
    expect(screen.queryByText("Alpha Pipeline")).not.toBeInTheDocument();
  });

  it("shows an empty state when no posts match", async () => {
    render(<ContentPosts />);
    await screen.findByText("Alpha Pipeline");

    fireEvent.change(screen.getByRole("searchbox", { name: /search posts/i }), {
      target: { value: "zzz-no-match" },
    });

    expect(
      screen.getByText(/no posts match your filters/i)
    ).toBeInTheDocument();
  });

  it("offers topic tag filters built from post tags", async () => {
    render(<ContentPosts />);
    await screen.findByText("Alpha Pipeline");

    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /kafka/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /snowflake/i })
    ).toBeInTheDocument();
  });
});
