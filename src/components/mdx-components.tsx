import type { MDXComponents } from 'mdx/types'
import { PageHeader } from './content/PageHeader'
import { PageContent } from './content/PageContent'
import { TopSection } from './content/TopSection'
import { QuickSummary } from './content/QuickSummary'
import { ActNowBox } from './content/ActNowBox'
import { ActNowBottom } from './content/ActNowBottom'
import { LearnMoreBox } from './content/LearnMoreBox'
import { LearnMoreBottom } from './content/LearnMoreBottom'
import { FactsSection } from './content/FactsSection'
import { AnalysisSection } from './content/AnalysisSection'
import { SourceLink } from './content/SourceLink'
import { ContentLayout } from './content/ContentLayout'
import { MainContentLayout } from './content/MainContentLayout'
import { ContentSidebar } from './content/ContentSidebar'
import { CallScript } from './content/CallScript'
import { DefinitionList } from './content/DefinitionList'
import { DefRow } from './content/DefRow'
import { StatsGrid } from './content/StatsGrid'
import { StatBox } from './content/StatBox'
import { CardGrid } from './content/CardGrid'
import { Card } from './content/Card'
import { Badge } from './content/Badge'
import { Button } from './content/Button'
import { Callout } from './content/Callout'
import { PageMeta } from './content/PageMeta'
import { SectionIntro } from './content/SectionIntro'
import { RelatedActions } from './content/RelatedActions'
import { RelatedLinks } from './content/RelatedLinks'
import { Collapsible } from './mdx/Collapsible'
import TrackableLink from './analytics/TrackableLink'

export const mdxComponents: MDXComponents = {
  PageHeader,
  PageContent,
  TopSection,
  QuickSummary,
  ActNowBox,
  ActNowBottom,
  LearnMoreBox,
  LearnMoreBottom,
  FactsSection,
  AnalysisSection,
  SourceLink,
  ContentLayout,
  MainContentLayout,
  ContentSidebar,
  CallScript,
  DefinitionList,
  DefRow,
  StatsGrid,
  StatBox,
  CardGrid,
  Card,
  Badge,
  Button,
  Callout,
  PageMeta,
  SectionIntro,
  RelatedActions,
  RelatedLinks,
  Collapsible,
  TrackableLink,
  // Default HTML elements with custom styling
  h1: ({ children, ...props }) => (
    <h1
      className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 mt-2 leading-tight"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6 outdent"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="text-xl font-bold text-gray-900 mt-8 mb-4 pt-4 border-t-2 border-gray-300 outdent"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-base font-semibold text-gray-800 mt-6 mb-2" {...props}>
      {children}
    </h4>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-4 text-gray-800 leading-relaxed" {...props}>
      {children}
    </p>
  ),
  a: ({ children, href, ...props }) => {
    // Check if link is external (starts with http:// or https://)
    const isExternal = href && (href.startsWith('http://') || href.startsWith('https://'))

    // For external links, use TrackableLink to track clicks
    if (isExternal) {
      return (
        <TrackableLink
          href={href}
          category="" // Auto-detected from URL
          label={typeof children === 'string' ? children : undefined}
          className="text-link hover:text-link-hover underline font-medium"
        >
          {children}
        </TrackableLink>
      )
    }

    // For internal links, use regular anchor
    return (
      <a
        href={href}
        className="text-link hover:text-link-hover underline font-medium"
        {...props}
      >
        {children}
      </a>
    )
  },
  ul: ({ children, ...props }) => (
    <ul className="list-disc pl-6 mb-4 space-y-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="text-gray-800" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="relative bg-teal text-white italic py-6 px-12 my-6 before:content-['\201c'] before:absolute before:top-2 before:left-3 before:text-5xl before:text-white/40 before:font-serif after:content-['\201d'] after:absolute after:bottom-0 after:right-3 after:text-5xl after:text-white/40 after:font-serif"
      {...props}
    >
      <div className="relative z-10 text-white [&_*]:!text-white">{children}</div>
    </blockquote>
  ),
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead className="bg-gray-200" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th className="text-left p-3 font-semibold text-gray-800 border-b-2 border-gray-300" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="p-3 border-b border-gray-200 align-top" {...props}>
      {children}
    </td>
  ),
  hr: ({ ...props }) => <hr className="border-0 border-t border-gray-300 my-8" {...props} />,
  pre: ({ children, ...props }) => (
    <pre
      className="bg-gray-100 border border-gray-200 rounded-lg p-4 my-4 overflow-x-auto whitespace-pre text-sm leading-relaxed"
      {...props}
    >
      {children}
    </pre>
  ),
  code: ({ children, ...props }) => {
    // Check if this is an inline code (not wrapped in pre)
    const isInline = typeof children === 'string' && !children.includes('\n')
    if (isInline) {
      return (
        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      )
    }
    return (
      <code className="block whitespace-pre-wrap font-mono text-sm" {...props}>
        {children}
      </code>
    )
  },
}
