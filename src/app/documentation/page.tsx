/* eslint-disable */
// @ts-nocheck

import { Metadata } from "next"
import { readFileSync } from 'fs'
import { join } from 'path'
import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { materialDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

export const metadata: Metadata = {
  title: "Technical Documentation - Hotel Database System",
  description: "Technical documentation for the hotel database system",
}

export default function Documentation() {
  // Read the markdown file
  const markdownPath = join(process.cwd(), 'Technical_Documentation.md')
  const markdownContent = readFileSync(markdownPath, 'utf-8')

  return (
    <div className="container mx-auto py-8 px-4">
      <article className="prose prose-slate dark:prose-invert max-w-none">
        <Markdown
          components={{
            // Custom rendering for code blocks
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <SyntaxHighlighter
                  style={materialDark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            },
            // Custom rendering for headings to add IDs for navigation
            h1: ({ children }) => <h1 className="text-4xl font-bold mb-4">{children}</h1>,
            h2: ({ children }) => {
              const id = children?.toString().toLowerCase().replace(/\s+/g, '-')
              return <h2 id={id} className="text-3xl font-bold mt-8 mb-4">{children}</h2>
            },
            h3: ({ children }) => {
              const id = children?.toString().toLowerCase().replace(/\s+/g, '-')
              return <h3 id={id} className="text-2xl font-bold mt-6 mb-3">{children}</h3>
            },
            // Custom rendering for code blocks in pre tags
            pre: ({ children }) => (
              <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto">
                {children}
              </pre>
            ),
            // Custom rendering for tables
            table: ({ children }) => (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  {children}
                </table>
              </div>
            ),
          }}
        >
          {markdownContent}
        </Markdown>
      </article>
    </div>
  )
} 