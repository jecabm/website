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
  /**
   * If set, this row opens the Presentation ("Preview") tool at this frontend
   * path instead of the plain form-only document editor — used for the
   * marketing pages so clicking them lands straight in the split-pane preview.
   */
  previewPath?: string
  /**
   * Colombia variant of `previewPath` (the frontend serves it at a
   * `/co`-prefixed route — see src/proxy.ts). Only set for the singleton
   * marketing pages, which have separate AU/CO documents to edit.
   */
  previewPathCo?: string
}

export interface ContentGroupDef {
  title: string
  rows: ContentRowDef[]
}

export const CONTENT_GROUPS: ContentGroupDef[] = [
  {
    title: 'Marketing Pages',
    rows: [
      {toolName: 'homePage', types: ['homePage'], previewPath: '/', previewPathCo: '/co'},
      {toolName: 'featuresPage', types: ['featuresPage'], previewPath: '/features', previewPathCo: '/co/features'},
      {toolName: 'pricingPage', types: ['pricingPage'], previewPath: '/pricing', previewPathCo: '/co/pricing'},
      {toolName: 'aboutPage', types: ['aboutPage'], previewPath: '/about', previewPathCo: '/co/about'},
      {toolName: 'contactPage', types: ['contactPage'], previewPath: '/contact', previewPathCo: '/co/contact'},
    ],
  },
  {
    title: 'Content',
    rows: [
      {toolName: 'blogResources', types: ['post'], previewPath: '/resources/blog'},
      {toolName: 'learningCentre', types: ['learningItem', 'videoTutorial'], previewPath: '/resources/learning'},
    ],
  },
  {
    title: 'Commerce',
    rows: [{toolName: 'shopProducts', types: ['product'], previewPath: '/shop'}],
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
