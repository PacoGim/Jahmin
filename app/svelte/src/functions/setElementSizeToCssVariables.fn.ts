import cssVariablesService from "../services/cssVariables.service"

export default function () {
  let navigationElement = document.querySelector('navigation-svlt')?.getClientRects()[0]?.width

	if (navigationElement) cssVariablesService.set('navigation-element-width', `${navigationElement}px`)
}