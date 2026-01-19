import { TemplateProps } from './types'
import DeveloperTemplate from '@/components/templates/DeveloperTemplate'
import TradesmanTemplate from '@/components/templates/TradesmanTemplate'
import ShowcaseTemplate from '@/components/templates/ShowcaseTemplate'
import LocalTemplate from '@/components/templates/LocalTemplate'

const TEMPLATES: Record<string, React.ComponentType<TemplateProps>> = {
  developer: DeveloperTemplate,
  tradesman: TradesmanTemplate,
  showcase: ShowcaseTemplate,
  local: LocalTemplate,
  // ZIP-05 will add: bold, corporate, craftsman, emergency
}

export function renderTemplate(props: TemplateProps) {
  const Template = TEMPLATES[props.company.template] || DeveloperTemplate
  return <Template {...props} />
}
