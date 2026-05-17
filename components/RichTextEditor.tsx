"use client";

import { useEffect, useRef, useCallback } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

type ExecCommand =
  | "bold"
  | "italic"
  | "underline"
  | "strikeThrough"
  | "insertUnorderedList"
  | "insertOrderedList"
  | "formatBlock"
  | "justifyLeft"
  | "justifyCenter"
  | "justifyRight"
  | "removeFormat";

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write description here...",
  minHeight = 180,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Normalize editor HTML: wrap bare text nodes and convert <div> to <p>
  const normalizeHtml = (el: HTMLDivElement): string => {
    const children = Array.from(el.childNodes);
    children.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const p = document.createElement("p");
        p.textContent = node.textContent || "";
        el.replaceChild(p, node);
      } else if (node.nodeName === "DIV") {
        const p = document.createElement("p");
        p.innerHTML = (node as HTMLElement).innerHTML;
        el.replaceChild(p, node);
      }
    });
    return el.innerHTML;
  };

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    // Set paragraph separator so Enter creates <p> not <div>
    document.execCommand("defaultParagraphSeparator", false, "p");
    if (!isInternalChange.current && el.innerHTML !== (value || "")) {
      el.innerHTML = value || "";
    }
    isInternalChange.current = false;
  }, [value]);

  const exec = useCallback((command: ExecCommand, val?: string) => {
    document.execCommand(command, false, val);
    editorRef.current?.focus();
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(normalizeHtml(editorRef.current));
    }
  }, [onChange]);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(normalizeHtml(editorRef.current));
    }
  };

  const btnClass =
    "px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 active:bg-gray-200 transition-colors font-medium";

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-300">
        <button type="button" className={`${btnClass} font-bold`} title="Bold" onMouseDown={(e) => { e.preventDefault(); exec("bold"); }}>
          B
        </button>
        <button type="button" className={`${btnClass} italic`} title="Italic" onMouseDown={(e) => { e.preventDefault(); exec("italic"); }}>
          I
        </button>
        <button type="button" className={`${btnClass} underline`} title="Underline" onMouseDown={(e) => { e.preventDefault(); exec("underline"); }}>
          U
        </button>
        <button type="button" className={`${btnClass} line-through`} title="Strikethrough" onMouseDown={(e) => { e.preventDefault(); exec("strikeThrough"); }}>
          S
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        <button type="button" className={btnClass} title="Heading 2" onMouseDown={(e) => { e.preventDefault(); exec("formatBlock", "h2"); }}>
          H2
        </button>
        <button type="button" className={btnClass} title="Heading 3" onMouseDown={(e) => { e.preventDefault(); exec("formatBlock", "h3"); }}>
          H3
        </button>
        <button type="button" className={btnClass} title="Paragraph" onMouseDown={(e) => { e.preventDefault(); exec("formatBlock", "p"); }}>
          P
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        <button type="button" className={btnClass} title="Bullet list" onMouseDown={(e) => { e.preventDefault(); exec("insertUnorderedList"); }}>
          • List
        </button>
        <button type="button" className={btnClass} title="Numbered list" onMouseDown={(e) => { e.preventDefault(); exec("insertOrderedList"); }}>
          1. List
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        <button type="button" className={btnClass} title="Align left" onMouseDown={(e) => { e.preventDefault(); exec("justifyLeft"); }}>
          ≡L
        </button>
        <button type="button" className={btnClass} title="Align center" onMouseDown={(e) => { e.preventDefault(); exec("justifyCenter"); }}>
          ≡C
        </button>
        <button type="button" className={btnClass} title="Align right" onMouseDown={(e) => { e.preventDefault(); exec("justifyRight"); }}>
          ≡R
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        <button type="button" className={btnClass} title="Clear formatting" onMouseDown={(e) => { e.preventDefault(); exec("removeFormat"); }}>
          ✕
        </button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        style={{ minHeight }}
        className="px-3 py-2 outline-none prose prose-sm max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
      />
    </div>
  );
}
