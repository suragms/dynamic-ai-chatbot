import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Parse markdown into structured blocks
  const parseBlocks = (text: string) => {
    const lines = text.split('\n');
    const blocks: Array<{
      type: 'code' | 'h1' | 'h2' | 'h3' | 'h4' | 'ul' | 'ol' | 'blockquote' | 'hr' | 'p';
      content?: string;
      items?: string[];
      lang?: string;
    }> = [];

    let inCode = false;
    let codeLang = '';
    let codeBuffer: string[] = [];
    let listBuffer: string[] = [];
    let listType: 'ul' | 'ol' = 'ul';

    const flushList = () => {
      if (listBuffer.length > 0) {
        blocks.push({ type: listType, items: [...listBuffer] });
        listBuffer = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block toggle
      if (line.trim().startsWith('```')) {
        flushList();
        if (inCode) {
          blocks.push({
            type: 'code',
            content: codeBuffer.join('\n'),
            lang: codeLang || 'text',
          });
          codeBuffer = [];
          codeLang = '';
          inCode = false;
        } else {
          inCode = true;
          codeLang = line.trim().slice(3).trim();
        }
        continue;
      }

      if (inCode) {
        codeBuffer.push(line);
        continue;
      }

      const trimmed = line.trim();

      // Horizontal rule
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        flushList();
        blocks.push({ type: 'hr' });
        continue;
      }

      // Headings
      if (trimmed.startsWith('#### ')) {
        flushList();
        blocks.push({ type: 'h4', content: trimmed.slice(5) });
        continue;
      }
      if (trimmed.startsWith('### ')) {
        flushList();
        blocks.push({ type: 'h3', content: trimmed.slice(4) });
        continue;
      }
      if (trimmed.startsWith('## ')) {
        flushList();
        blocks.push({ type: 'h2', content: trimmed.slice(3) });
        continue;
      }
      if (trimmed.startsWith('# ')) {
        flushList();
        blocks.push({ type: 'h1', content: trimmed.slice(2) });
        continue;
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        flushList();
        blocks.push({ type: 'blockquote', content: trimmed.slice(2) });
        continue;
      }

      // Bullet lists
      const ulMatch = line.match(/^(\s*)[*+-]\s+(.+)/);
      if (ulMatch) {
        if (listBuffer.length > 0 && listType !== 'ul') flushList();
        listType = 'ul';
        listBuffer.push(ulMatch[2]);
        continue;
      }

      // Numbered lists
      const olMatch = line.match(/^(\s*)\d+\.\s+(.+)/);
      if (olMatch) {
        if (listBuffer.length > 0 && listType !== 'ol') flushList();
        listType = 'ol';
        listBuffer.push(olMatch[2]);
        continue;
      }

      // Empty line
      if (!trimmed) {
        flushList();
        continue;
      }

      // Regular paragraph line
      flushList();
      blocks.push({ type: 'p', content: line });
    }

    if (inCode && codeBuffer.length > 0) {
      blocks.push({ type: 'code', content: codeBuffer.join('\n'), lang: codeLang || 'text' });
    }
    flushList();

    return blocks;
  };

  // Render inline formatting: bold, italic, inline code
  const renderInline = (str: string): React.ReactNode[] => {
    if (!str) return [];

    // Tokenize for bold, inline code, italics
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }

      if (match[2]) {
        // **bold**
        parts.push(<strong key={match.index} className="gemini-strong">{renderInline(match[2])}</strong>);
      } else if (match[3]) {
        // *italic*
        parts.push(<em key={match.index} className="gemini-em">{match[3]}</em>);
      } else if (match[4]) {
        // `inline code`
        parts.push(<code key={match.index} className="gemini-inline-code">{match[4]}</code>);
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }

    return parts;
  };

  const blocks = parseBlocks(content);

  return (
    <div className="gemini-markdown-body">
      {blocks.map((b, idx) => {
        if (b.type === 'h1') {
          return <h1 key={idx} className="gemini-h1">{renderInline(b.content || '')}</h1>;
        }
        if (b.type === 'h2') {
          return <h2 key={idx} className="gemini-h2">{renderInline(b.content || '')}</h2>;
        }
        if (b.type === 'h3') {
          return <h3 key={idx} className="gemini-h3">{renderInline(b.content || '')}</h3>;
        }
        if (b.type === 'h4') {
          return <h4 key={idx} className="gemini-h4">{renderInline(b.content || '')}</h4>;
        }
        if (b.type === 'hr') {
          return <hr key={idx} className="gemini-divider" />;
        }
        if (b.type === 'blockquote') {
          return <blockquote key={idx} className="gemini-blockquote">{renderInline(b.content || '')}</blockquote>;
        }
        if (b.type === 'ul') {
          return (
            <ul key={idx} className="gemini-ul">
              {b.items?.map((item, itemIdx) => (
                <li key={itemIdx}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        if (b.type === 'ol') {
          return (
            <ol key={idx} className="gemini-ol">
              {b.items?.map((item, itemIdx) => (
                <li key={itemIdx}>{renderInline(item)}</li>
              ))}
            </ol>
          );
        }
        if (b.type === 'code') {
          return <CodeBlock key={idx} code={b.content || ''} lang={b.lang || 'code'} />;
        }
        return <p key={idx} className="gemini-p">{renderInline(b.content || '')}</p>;
      })}
    </div>
  );
};

const CodeBlock: React.FC<{ code: string; lang: string }> = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="gemini-code-block">
      <div className="gemini-code-header">
        <span className="gemini-code-lang">{lang.toUpperCase()}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="gemini-copy-code-btn"
          aria-label="Copy code"
        >
          {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="gemini-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
};
