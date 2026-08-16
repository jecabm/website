// Single source of truth for how the flattened content rows in `ToolRail.tsx`
// are grouped and labeled, and which schema type(s) each row's live count
// badge should be computed from. Keeps `sanity.config.ts` (which registers
// the underlying tools), `structure.ts` (which defines what each tool opens),
// and `ToolRail.tsx` (which renders the rows) all pointing at the same ids.

export const STATUS_TYPES = [
  'homePage',
  'featuresPage',
  'pricingPage',
  'aboutPage',
  'contactPage',
  'post',
  'learningItem',
  'videoTutorial',
  'product',
  'testimonial',
  'teamMember',
] as const

export type StatusType = (typeof STATUS_TYPES)[number]

export interface ContentRowDef {
  /** Matches the `name` given to the corresponding `structureTool(...)` in sanity.config.ts */
  toolName: string
  /** Schema type(s) whose count/draft-status feed this row's badge */
  types: StatusType[]
}

export interface ContentGroupDef {
  title: string
  rows: ContentRowDef[]
}

export const CONTENT_GROUPS: ContentGroupDef[] = [
  {
    title: 'Marketing Pages',
    rows: [
      {toolName: 'homePage', types: ['homePage']},
      {toolName: 'featuresPage', types: ['featuresPage']},
      {toolName: 'pricingPage', types: ['pricingPage']},
      {toolName: 'aboutPage', types: ['aboutPage']},
      {toolName: 'contactPage', types: ['contactPage']},
    ],
  },
  {
    title: 'Content',
    rows: [
      {toolName: 'blogResources', types: ['post']},
      {toolName: 'learningCentre', types: ['learningItem', 'videoTutorial']},
    ],
  },
  {
    title: 'Commerce',
    rows: [{toolName: 'shopProducts', types: ['product']}],
  },
  {
    title: 'Social Proof',
    rows: [
      {toolName: 'testimonials', types: ['testimonial']},
      {toolName: 'teamMembers', types: ['teamMember']},
    ],
  },
]

export const GROUPED_TOOL_NAMES = new Set(CONTENT_GROUPS.flatMap((g) => g.rows.map((r) => r.toolName)))
