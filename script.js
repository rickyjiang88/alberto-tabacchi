const nav = document.querySelector('header nav');
const toggle = document.querySelector('.toggle');
if (nav && toggle) {
  nav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}
