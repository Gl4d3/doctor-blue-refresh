
import React from 'react';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  // Simple markdown parsing function
  const parseMarkdown = (text: string) => {
    // Process code blocks
    text = text.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
    
    // Process inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Process headings
    text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Process bold text
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Process italic text
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Process links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Process unordered lists
    text = text.replace(/^\s*-\s*(.*?)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*?<\/li>\n)+/g, '<ul>$&</ul>');
    
    // Process ordered lists
    text = text.replace(/^\s*\d+\.\s*(.*?)$/gm, '<li>$1</li>');
    text = text.replace(/(<li>.*?<\/li>\n)+/g, '<ol>$&</ol>');
    
    // Process paragraphs, ensuring headings and lists aren't affected
    text = text.replace(/^(?!<h[1-6]|<ul|<ol|<li|<pre)(.+)$/gm, '<p>$1</p>');
    
    // Process line breaks
    text = text.replace(/\n\n/g, '<br />');
    
    // Process blockquotes
    text = text.replace(/^>\s*(.*$)/gm, '<blockquote>$1</blockquote>');
    
    return text;
  };

  const html = parseMarkdown(content);

  return (
    <div 
      className={cn("markdown text-balance", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
