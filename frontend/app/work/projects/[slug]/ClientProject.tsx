"use client";

import NavBar from "../../../components/layout/NavBar";
import Footer from "../../../components/layout/Footer";
import PostContent from "../../../components/posts/PostContent";
import PostLanding from "../../../components/posts/PostLanding";
import Share from "../../../components/posts/Share";
import { PostsSchema } from "../../../components/utils/interface";

type ClientProjectProps = {
  project: PostsSchema;
};

export default function ClientProject({ project }: ClientProjectProps) {
  return (
    <div className="font-[family-name:var(--font-geist-mono)]">
      <NavBar />
      <div>
        <PostLanding postSelected={project} />
        <PostContent postSelected={project} />
        <div className="bg-white text-[#333333]">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex justify-start sm:justify-end">
            <Share postSelected={project} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
