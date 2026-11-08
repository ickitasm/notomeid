/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface NoteContentRendererProps {
  content: string;
  className?: string;
  clamp?: boolean;
  emptyPlaceholder?: string;
}

/**
 * Parses inline formatting:
 * - <u>text</u> -> underline
 * - **text** -> bold
 * - ~~text~~ -> strikethrough
 * - *text* -> italic
 * - `text` -> inline code
 */
function parseInline(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match formatted tags
  const regex = /(<u>[\s\S]*?<\/u>|\*\*[\s\S]*?\*\*|~~[\s\S]*?~~|\*[^\s*][\s\S]*?[^\s*]\*|`[\s\S]*?`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('<u>') && part.endsWith('</u>')) {
      const inner = part.slice(3, -4);
      return (
        <u
          key={index}
          className="underline underline-offset-3 decoration-[#D97706]/70 decoration-2 font-medium"
        >
          {parseInline(inner)}
        </u>
      );
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return (
        <strong
          key={index}
          className="font-bold text-[#2B241E] dark:text-[#F3ECE4]"
        >
          {parseInline(inner)}
        </strong>
      );
    }

    if (part.startsWith('~~') && part.endsWith('~~')) {
      const inner = part.slice(2, -2);
      return (
        <del
          key={index}
          className="line-through text-[#8F8275] dark:text-[#7E7367] opacity-80"
        >
          {parseInline(inner)}
        </del>
      );
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      const inner = part.slice(1, -1);
      return (
        <em
          key={index}
          className="italic text-[#433A31] dark:text-[#DDD1C3]"
        >
          {parseInline(inner)}
        </em>
      );
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded-md bg-[#EFE8DF] dark:bg-[#2A231E] text-[#D97706] font-mono text-xs"
        >
          {inner}
        </code>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

export const NoteContentRenderer: React.FC<NoteContentRendererProps> = ({
  content,
  className = '',
  clamp = false,
  emptyPlaceholder,
}) => {
  if (!content || !content.trim()) {
    if (emptyPlaceholder) {
      return (
        <p className="text-xs text-[#8F8275] italic py-3 select-none">
          {emptyPlaceholder}
        </p>
      );
    }
    return null;
  }

  // Parse lines into blocks (headings, quotes, lists, paragraphs)
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Empty line / paragraph gap
    if (trimmed === '') {
      blocks.push(
        <div key={`gap-${i}`} className="h-2" aria-hidden="true" />
      );
      i++;
      continue;
    }

    // Headings: ## or ###
    if (trimmed.startsWith('### ')) {
      blocks.push(
        <h4
          key={`h4-${i}`}
          className="font-serif font-bold text-sm sm:text-base text-[#2B241E] dark:text-[#EFE9E2] mt-3 mb-1"
        >
          {parseInline(trimmed.slice(4))}
        </h4>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      blocks.push(
        <h3
          key={`h3-${i}`}
          className="font-serif font-bold text-base sm:text-lg text-[#2B241E] dark:text-[#EFE9E2] border-b border-[#EAE2D8] dark:border-[#2E2822] pb-1 mt-3 mb-1.5"
        >
          {parseInline(trimmed.slice(3))}
        </h3>
      );
      i++;
      continue;
    }

    // Blockquote: >
    if (trimmed.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-3 border-[#D97706] pl-3.5 py-1.5 my-2.5 bg-[#FAF7F2] dark:bg-[#14110F] rounded-r-xl italic text-xs sm:text-sm text-[#594E44] dark:text-[#C5B8AA]"
        >
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx} className={qIdx > 0 ? 'mt-1' : ''}>
              {parseInline(ql)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Bullet List: - or *
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listItems: string[] = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))
      ) {
        listItems.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push(
        <ul
          key={`ul-${i}`}
          className="list-disc pl-5 my-2 space-y-1 text-xs sm:text-sm text-[#3E352D] dark:text-[#D5C9BC]"
        >
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="leading-relaxed">
              {parseInline(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered List: 1. 2. 3.
    if (/^\d+\.\s/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        listItems.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push(
        <ol
          key={`ol-${i}`}
          className="list-decimal pl-5 my-2 space-y-1 text-xs sm:text-sm text-[#3E352D] dark:text-[#D5C9BC]"
        >
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="leading-relaxed">
              {parseInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Standard paragraph
    blocks.push(
      <p
        key={`p-${i}`}
        className="text-xs sm:text-sm text-[#3E352D] dark:text-[#D5C9BC] leading-relaxed font-sans"
      >
        {parseInline(rawLine)}
      </p>
    );
    i++;
  }

  return (
    <div
      className={`note-rendered-content space-y-1 ${
        clamp ? 'line-clamp-6' : ''
      } ${className}`}
    >
      {blocks}
    </div>
  );
};
