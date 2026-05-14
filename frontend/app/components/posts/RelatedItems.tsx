 "use client";
import React, {useEffect, useState } from 'react';
import { getFastApiRouteBaseUrl } from "@lib/fastapiRoutes";
import ContentCard from '../work/ContentCard';
import {PostsSchema} from '../utils/interface'; 
import { urlCleaner } from '../utils/tools';

const FASTAPI_ROUTE_BASE = getFastApiRouteBaseUrl();

interface RelatedItemsProps {
    postSelected: PostsSchema;
}


const RelatedItems = ({ postSelected }: RelatedItemsProps) => {

    const [posts, setPosts] = useState<PostsSchema[]>([]);
    
      useEffect(() => {
        const fetchPosts = async () => {
          try {
            const response = await fetch(`${FASTAPI_ROUTE_BASE}/blogs?per_page=100`);
            const data = await response.json();
            const transformedData: PostsSchema[] = (data.blogs ?? []).map(
              (blog: any) => ({
                id: blog.id,
                slug: blog.slug,
                title: blog.title,
                imageSrc: blog.header_img_url,
                timeAgo: blog.created_on,
                tags: blog.tags ?? [],
                filepath_md: blog.filepath_md ?? "",
                likes: blog.shares ?? 0,
                kind: "blog",
                description: blog.description,
                href: `/work/blogs/${blog.slug ?? urlCleaner(blog.title)}`,
              })
            );
            setPosts(transformedData);
          } catch (error) {
            console.error('Error fetching posts:', error);
          }
        };
    
        fetchPosts();
      }, []);

    const selectedTags = Array.isArray(postSelected.tags) ? postSelected.tags : [];
    const currentCards = posts
      .filter((post) => {
        if (post.id === postSelected.id) return false;
        const postTags = Array.isArray(post.tags) ? post.tags : [];
        return postTags.some((tag) => selectedTags.includes(tag));
      })
      .slice(0, 6);
    const currentCardsSorted = currentCards.sort((a, b) => new Date(b.timeAgo).getTime() - new Date(a.timeAgo).getTime())
    return (
        <div className=' bg-white py-8'>
            <h2 className="text-xl text-[#333333] font-bold mb-3 max-w-5xl mx-auto px-6">
                Related posts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 max-w-5xl mx-auto">
                {currentCardsSorted.map((card, index) => (
                    <ContentCard
                    key={index}
                    imageSrc={card.imageSrc}
                    title={card.title}
                    timeAgo={card.timeAgo}
                    tags={card.tags}
                    index={index}
                    id={card.id}
                    slug={card.slug ?? urlCleaner(card.title)}
                    kind="blog"
                    description={card.description}
                    />
                ))}
            </div>
        </div>
        
    )
}

export default RelatedItems