import { TemplateProps, TemplateName } from './types'
import DeveloperTemplate from '@/components/templates/DeveloperTemplate'
import TradesmanTemplate from '@/components/templates/TradesmanTemplate'
import ShowcaseTemplate from '@/components/templates/ShowcaseTemplate'
import LocalTemplate from '@/components/templates/LocalTemplate'
import BoldTemplate from '@/components/templates/BoldTemplate'
import CorporateTemplate from '@/components/templates/CorporateTemplate'
import CraftsmanTemplate from '@/components/templates/CraftsmanTemplate'
import EmergencyTemplate from '@/components/templates/EmergencyTemplate'
import DaxaTemplate from '@/components/templates/DaxaTemplate'

const TEMPLATES: Record<TemplateName, React.ComponentType<TemplateProps>> = {
  developer: DeveloperTemplate,
  tradesman: TradesmanTemplate,
  showcase: ShowcaseTemplate,
  local: LocalTemplate,
  bold: BoldTemplate,
  corporate: CorporateTemplate,
  craftsman: CraftsmanTemplate,
  emergency: EmergencyTemplate,
  daxa: DaxaTemplate,
}

export function renderTemplate(props: TemplateProps) {
  const Template = TEMPLATES[props.company.template] || DeveloperTemplate
  return <Template {...props} />
}

export function getTemplateComponent(templateName: TemplateName) {
  return TEMPLATES[templateName] || DeveloperTemplate
}
