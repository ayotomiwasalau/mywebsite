"use client"
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PostsSchema } from '../utils/interface';
import Image from 'next/image';

interface PostContentProps {
  postSelected: PostsSchema;
}

function normalizeContentPath(filepath: string): string {
  const trimmed = filepath.trim();
  if (trimmed === "") return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  return trimmed.startsWith("/")
    ? trimmed
    : `/${trimmed}`;
}

const PostContent = ({ postSelected }: PostContentProps) => {
  const [markdown, setMarkdown] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!postSelected.filepath_md) {
      setMarkdown("Content is not available for this item yet.");
      return;
    }

    const fetchReadMe = async () => {
      try {
        const normalizedPath = normalizeContentPath(postSelected.filepath_md);
        const response = await fetch(normalizedPath);
        if (!response.ok) {
          throw new Error(`Failed to load content: ${response.status}`);
        }
        const text = await response.text();
        setMarkdown(text);
      } catch (error) {
        console.error('Error fetching content:', error);
        setMarkdown("Unable to load content for this item right now.");
      }
    };

    fetchReadMe();
  }, [postSelected.filepath_md]);

  const handleImageClick = (src: string) => {
    setSelectedImage(src);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className=' bg-white'>
      <div className="sm:px-8 px-4 py-8 rounded-lg max-w-5xl mx-auto text-[#333333] bg-white text-left">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({ src, alt, ...props }) => {
              const { height, width, ...restProps } = props;
              return (
                <Image
                  src={src || ''}
                  alt={alt || ''}
                  width={800}
                  height={600}
                  className="max-w-full h-auto rounded-lg flex mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(src || '')}
                  {...restProps}
                />
              );
            },
            h1: ({ ...props }) => (
              <h1 className="text-4xl font-bold mb-4 mt-8" {...props} />
            ),
            h2: ({ ...props }) => (
              <h2 className="text-3xl font-bold mb-3 mt-6" {...props} />
            ),
            h3: ({ ...props }) => (
              <h3 className="text-2xl font-bold mb-3 mt-6" {...props} />
            ),
            h4: ({ ...props }) => (
              <h4 className="text-xl font-bold mb-2 mt-4" {...props} />
            ),
            h5: ({ ...props }) => (
              <h5 className="text-lg font-bold mb-2 mt-4" {...props} />
            ),
            h6: ({ ...props }) => (
              <h6 className="text-base font-bold mb-1 mt-2" {...props} />
            ),
            p: ({ ...props }) => (
              <p className="mb-6 text-lg leading-relaxed" {...props} />
            ),
            a: ({ ...props }) => (
              <a className="text-lg underline" {...props} />
            ),
            code: ({ inline, className, children, ...props }: { inline?: boolean, className?: string, children?: React.ReactNode }) => {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <code className="block text-md p-4 my-4 rounded bg-gray-100 overflow-auto" {...props}>
                  {children}
                </code>
              ) : (
                <code className="inline p-1 text-md rounded bg-gray-100 overflow-x-auto break-words" {...props}>
                  {children}
                </code>
              );
            },
            blockquote: ({ ...props }) => (
              <blockquote
                className="border-l-4 pl-4 italic text-gray-600 py-4 my-4 -10 "
                {...props}
              />
            ),
            ul: ({ ...props }) => (
              <ul className="list-disc text-lg pl-5 mb-4" {...props} />
            ),
            ol: ({ ...props }) => (
              <ol className="list-decimal text-lg pl-5 mb-4" {...props} />
            ),
            li: ({ ...props }) => (
              <li className="mb-2" {...props} />
            ),
            table: ({ className, ...props }) => (
              <div className="my-4 overflow-x-auto">
                <table
                  className={`min-w-full divide-y text-[#333333] ${className ?? ''}`}
                  {...props}
                />
              </div>
            ),
            thead: ({ ...props }) => (
              <thead className="bg-gray-50" {...props} />
            ),
            tbody: ({ ...props }) => (
              <tbody className="divide-y text-[#333333]" {...props} />
            ),
            tr: ({ ...props }) => (
              <tr {...props} />
            ),
            th: ({ ...props }) => (
              <th className="px-6 py-3 text-left text-md font-medium text-[#333333] uppercase tracking-wider" {...props} />
            ),
            td: ({ ...props }) => (
              <td className="px-6 py-4 whitespace-nowrap text-md text-[#333333]" {...props} />
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-full max-h-full">
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white text-2xl font-bold hover:text-gray-300 transition-colors"
            >
              ×
            </button>
            <Image
              src={selectedImage}
              alt="Full size image"
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PostContent;