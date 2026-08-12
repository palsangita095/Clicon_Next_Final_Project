"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import "highlight.js/styles/github-dark.css";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = ({
  content,
}: MarkdownRendererProps) => {
  return (
    <div className="prose prose-invert max-w-none prose-pre:rounded-xl prose-pre:border prose-pre:border-white/10 prose-pre:bg-zinc-950 prose-code:before:hidden prose-code:after:hidden">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;