'use client'

/**
 * This configuration is used to for the Sanity Studio that's mounted on the `\src\app\studio\[[...tool]]\page.tsx` route
 */

import {dashboardTool} from '@sanity/dashboard'
import {
  BarChartIcon,
  BookIcon,
  CogIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  EyeOpenIcon,
  HomeIcon,
  RocketIcon,
  StarIcon,
  TagIcon,
  UsersIcon,
} from '@sanity/icons'
import {visionTool} from '@sanity/vision'
import {buildLegacyTheme, defineConfig} from 'sanity'
import {presentationTool} from 'sanity/presentation'
import {structureTool} from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './src/sanity/env'
import {AnalyticsDashboard} from './src/sanity/plugins/analytics/AnalyticsDashboard'
import {TopPagesWidget} from './src/sanity/plugins/analytics/TopPagesWidget'
import {ClarityDashboard} from './src/sanity/plugins/clarity/ClarityDashboard'
import {StudioHome} from './src/sanity/plugins/home/StudioHome'
import {resolveLocations, resolveMainDocuments} from './src/sanity/plugins/presentation/resolve'
import {HiddenToolMenu} from './src/sanity/plugins/shell/HiddenToolMenu'
import {StudioIcon} from './src/sanity/plugins/shell/StudioIcon'
import {StudioLayout} from './src/sanity/plugins/shell/StudioLayout'
import {schema} from './src/sanity/schemaTypes'
import {
  aboutPageStructure,
  blogResourcesStructure,
  contactPageStructure,
  featuresPageStructure,
  homePageStructure,
  learningCentreStructure,
  pricingPageStructure,
  shopProductsStructure,
  siteSettingsStructure,
  teamMembersStructure,
  testimonialsStructure,
} from './src/sanity/structure'

// Brand orange (#F28500) in place of Sanity's default blue, applied via the
// legacy CSS custom-property theme API — see https://www.sanity.io/docs/theming-studio
const theme = buildLegacyTheme({
  '--brand-primary': '#F28500',
  '--default-button-primary-color': '#F28500',
  '--focus-color': '#F28500',
  '--state-info-color': '#F28500',
})

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  title: 'Regatta Registers',
  icon: StudioIcon,
  theme,
  auth: {
    providers: (prev) =>
      prev.filter((provider) => provider.name === 'google' || provider.name === 'github' || provider.name === 'sanity'),
  },
  schema,
  studio: {
    components: {
      layout: StudioLayout,
      toolMenu: HiddenToolMenu,
    },
  },
  tools: (prev) => [
    {
      name: 'home',
      title: 'Home',
      icon: HomeIcon,
      component: StudioHome,
    },
    ...prev,
    {
      name: 'user-behavior',
      title: 'User Behavior',
      icon: EyeOpenIcon,
      component: ClarityDashboard,
    },
  ],
  plugins: [
    presentationTool({
      name: 'presentation',
      title: 'Preview',
      previewUrl: {
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
      resolve: {
        mainDocuments: resolveMainDocuments,
        locations: resolveLocations,
      },
    }),
    dashboardTool({
      name: 'analytics',
      title: 'Analytics',
      icon: BarChartIcon,
      widgets: [
        {
          name: 'analytics',
          component: AnalyticsDashboard,
          layout: {width: 'full'},
        },
        {
          name: 'top-pages',
          component: TopPagesWidget,
          layout: {width: 'full'},
        },
      ],
    }),
    // Settings
    structureTool({name: 'siteSettings', title: 'Site SEO Settings', icon: CogIcon, structure: siteSettingsStructure}),
    // Marketing Pages
    structureTool({name: 'homePage', title: 'Homepage', icon: HomeIcon, structure: homePageStructure}),
    structureTool({name: 'featuresPage', title: 'Features', icon: RocketIcon, structure: featuresPageStructure}),
    structureTool({name: 'pricingPage', title: 'Pricing', icon: TagIcon, structure: pricingPageStructure}),
    structureTool({name: 'aboutPage', title: 'About', icon: UsersIcon, structure: aboutPageStructure}),
    structureTool({name: 'contactPage', title: 'Contact', icon: EnvelopeIcon, structure: contactPageStructure}),
    // Content
    structureTool({name: 'blogResources', title: 'Blog / Resources', icon: DocumentTextIcon, structure: blogResourcesStructure}),
    structureTool({name: 'learningCentre', title: 'Learning Centre', icon: BookIcon, structure: learningCentreStructure}),
    // Commerce
    structureTool({name: 'shopProducts', title: 'Shop — Products', icon: TagIcon, structure: shopProductsStructure}),
    // Social Proof
    structureTool({name: 'testimonials', title: 'Testimonials', icon: StarIcon, structure: testimonialsStructure}),
    structureTool({name: 'teamMembers', title: 'Team Members', icon: UsersIcon, structure: teamMembersStructure}),
    visionTool({defaultApiVersion: apiVersion}),
  ],
})
