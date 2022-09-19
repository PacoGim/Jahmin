function set(key, value) {
	let headStyleElement: any = document.querySelector('head style')

	let headStyle = headStyleElement.innerHTML

	headStyle = headStyle.replace(':root{', '').replace('}', '').replace(/\s+/g, ' ').trim()
	headStyle = headStyle
		.split(';')
		.map(foo => foo.split(':'))
		.filter(style => style.length === 2)

	let styleIndex = headStyle.findIndex(style => style[0].includes(key))

	if (styleIndex !== -1) {
		headStyle[styleIndex] = [`--${key}`, value]
	} else {
		headStyle.push([`--${key}`, value])
	}
	headStyleElement.innerHTML = `
    :root{
      ${headStyle.map(foo => foo.join(':')).join(';')};
    }
  `
}

function get(key) {
	return getComputedStyle(document.head).getPropertyValue(`--${key}`)
}

export default {
	set,
	get
}
