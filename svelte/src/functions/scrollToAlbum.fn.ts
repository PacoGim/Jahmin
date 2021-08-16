export default (albumID:string) => {
  let albumEl = document.querySelector(`#${CSS.escape(albumID)}`)
  if (albumEl) {
    albumEl.scrollIntoView({ block: 'center' })
  }
}
