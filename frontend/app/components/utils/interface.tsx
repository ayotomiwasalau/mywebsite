export interface PostsSchema { 
    id: string;
    slug?: string;
    title: string;
    imageSrc: string;
    timeAgo: string;
    tags: string[];
    filepath_md: string;
    likes: number;
    href?: string;
    /** Work listing: project vs blog write-up (sample data / filters). */
    kind?: "project" | "blog";
    /** Short summary shown on cards (monospace in UI). */
    description?: string;
}

export interface ProjDetailsSchema {
    id: string;
    imageSrc: string;
    title: string;
    timeAgo: string;
    projUrl: string;
    blogUrl: string;
    category: string;
    description: string;
}