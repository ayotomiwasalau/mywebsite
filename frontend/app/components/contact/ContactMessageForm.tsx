"use client";

import React, { FormEvent, useState } from "react";
import { getFastApiRouteBaseUrl } from "@lib/fastapiRoutes";

const FASTAPI_ROUTE_BASE = getFastApiRouteBaseUrl();

const inputClass =
  "w-full rounded-xl border-0 bg-white px-4 py-3 text-[#333333] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/60";

const ContactMessageForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitState("idle");
    setFeedbackMessage("");

    try {
      const response = await fetch(`${FASTAPI_ROUTE_BASE}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      setSubmitState("success");
      setFeedbackMessage(data.details ?? "Message sent successfully.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error) {
      setSubmitState("error");
      setFeedbackMessage(
        "Unable to send your message right now. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="message-form"
      className="bg-white px-4 py-10 sm:px-8 md:py-12"
      aria-labelledby="message-form-heading"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          id="message-form-heading"
          className="mb-6 text-xl font-bold text-black sm:text-2xl md:mb-8"
        >
          Message form
        </h2>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-[#BDD4D8] p-8 shadow-sm sm:p-10"
        >
          <div className="flex flex-col gap-4 sm:gap-5">
            <input
              type="text"
              name="name"
              autoComplete="name"
              required
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
            <input
              type="text"
              name="subject"
              required
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={inputClass}
            />
            <textarea
              name="message"
              required
              rows={8}
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`${inputClass} min-h-[10rem] resize-y`}
            />
          </div>

          <div className="mt-6 flex justify-end sm:mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#E06676] px-8 py-3 text-sm font-semibold text-gray-900 transition hover:opacity-90 sm:text-base"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </div>
          {submitState !== "idle" && (
            <p
              className={`mt-4 text-sm ${
                submitState === "success" ? "text-[#21643A]" : "text-[#7A1C2F]"
              }`}
              role="status"
            >
              {feedbackMessage}
            </p>
          )}
        </form>
      </div>
    </section>
  );
};

export default ContactMessageForm;
