"use client"; 
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';

if (!process.env.NEXT_PUBLIC_urlPostPrefix) {
  throw new Error("Required environment variables are not set");
}


const urlPostPrefix: string = process.env.NEXT_PUBLIC_urlPostPrefix;

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function UploadForm() {
  // We will store each field as state:
  const [formData, setFormData] = useState({
    id: "",
    imageSrc: "",
    title: "",
    timeAgo: "",
    groupAtags: "",
    groupBtags: "",
    filepath: "",
    likes: 0,
  });

  // Handle input changes by updating state
  interface FormInputEvent extends React.ChangeEvent<HTMLInputElement> {}

  const handleChange = (e: FormInputEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // On form submission, parse the tags and convert numeric fields
  interface FormData {
    id: string;
    imageSrc: string;
    title: string;
    timeAgo: string;
    groupAtags: string;
    groupBtags: string;
    filepath: string;
    likes: number;
  }

  interface BlogEntry {
    id: string;
    imageSrc: string;
    title: string;
    timeAgo: string;
    tags: string[];
    filepath: string;
    likes: number;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let docId = "";

    if (formData.id !== "") {
      docId = formData.id;
    } else {
      try {
        docId = crypto.randomUUID();
      } catch (e) {
        docId = uuidv4();
      }
    }

    const groupAtagsArray = formData.groupAtags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "")
      .map((tag) => `0-${tag.toUpperCase()}`);

    const groupBtagsArray = formData.groupBtags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== "")
      .map((tag) => `1-${tag.toUpperCase()}`);

    const tagsArray = [...groupAtagsArray, ...groupBtagsArray];
    const normalizedSlug = slugify(formData.title);
    const markdownPath = `/markdowns/blog/${normalizedSlug || "post"}.md`;

    const newBlogEntry: BlogEntry = {
      id: docId,
      imageSrc: `/images/blog/${normalizedSlug || "post"}/${formData.imageSrc}`,
      title: formData.title,
      timeAgo: new Date().toISOString(), // current date-time in ISO string format
      tags: tagsArray,
      filepath: markdownPath,
      likes: formData.likes || 1, // convert to number or default to 0
    };

    // TODO: send `newBlogEntry` to your API or Firebase, etc.
    const submitData = async (data: BlogEntry) => {
      const response = await fetch(`${urlPostPrefix}/${docId}.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('Submission successful!');
      } else {
        alert('Submission failed. Please try again.');
      }
    };

    submitData(newBlogEntry);
  };

  return (
    <div className="bg-white p-6">
      <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl text-[#333333] font-bold mb-4">Create a Blog Entry</h1>
      <form onSubmit={handleSubmit} className="flex flex-col text-[#333333]">

        {/* imageSrc */}
        <label className="flex flex-col">
          <h2 className="whitespace-nowrap">Id:</h2>
          <input
            type="text"
            name="id"
            value={formData.id}
            onChange={handleChange}
            className="mb-4 py-2 rounded border w-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#DE5B6F] focus:border-transparent"
          />
        </label>
        <label className="flex flex-col">
          <h2 className="whitespace-nowrap">Header image:</h2>
          <input
            type="text"
            name="imageSrc"
            value={formData.imageSrc}
            onChange={handleChange}
            className="mb-4 py-2 rounded border w-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#DE5B6F] focus:border-transparent"
            required
          />
        </label>

        {/* title */}
        <label className="mb-2 flex flex-col">
        <h2 className="whitespace-nowrap">Title:</h2>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mb-4 py-2 rounded border w-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#DE5B6F] focus:border-transparent"
            required
          />
        </label>

        {/* tags */}
        <label className="mb-2 flex flex-col">
        <h2 className="whitespace-nowrap">Group A tags:</h2>
          <input
            type="text"
            name="groupAtags"
            value={formData.groupAtags}
            onChange={handleChange}
            className="mb-4 py-2 rounded border w-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#DE5B6F] focus:border-transparent"
            required
          />
        </label>

        <label className="mb-2 flex flex-col">
        <h2 className="whitespace-nowrap">Group B tags:</h2>
          <input
            type="text"
            name="groupBtags"
            value={formData.groupBtags}
            onChange={handleChange}
            className="mb-4 py-2 rounded border w-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#DE5B6F] focus:border-transparent"
            
          />
        </label>

        {/* filepath */}
        <label className="mb-2 flex flex-col">
        <h2 className="whitespace-nowrap">Blog filepath:</h2> 
          <input
            type="text"
            name="filepath"
            value={formData.filepath}
            onChange={handleChange}
            className="mb-4 py-2 rounded border w-full border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#DE5B6F] focus:border-transparent"
            required
          />
        </label>



        <button type="submit" className="py-2 px-4 bg-[#DE5B6F] text-white rounded hover:bg-[#c44a5e] focus:outline-none focus:ring-2 focus:ring-[#DE5B6F] focus:ring-opacity-50">
          Submit
        </button>
      </form>
      </div>
    </div>
  );
}
