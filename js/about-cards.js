/**
 * Renders Figma-style About profile cards from home.json `about.cards`.
 */
(function () {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function nl2br(value) {
    return escapeHtml(value).replace(/\n/g, '<br>');
  }

  window.buildAboutCardsHtml = function buildAboutCardsHtml(cards) {
    if (!cards) return '';

    const major = cards.major;
    const certifications = cards.certifications ?? [];
    const awards = cards.awards ?? [];
    const education = cards.education ?? [];

    const majorHtml = major
      ? `<article class="about-card about-card--major">
          <img class="about-card__bg" src="${escapeHtml(major.image)}" alt="" loading="lazy" decoding="async">
          <p class="about-card__major-text">${nl2br(major.text)}</p>
        </article>`
      : '';

    const certsHtml = certifications.length
      ? `<article class="about-card about-card--certs">
          <h3 class="about-card__title">자격증</h3>
          <div class="about-card__cert-logos">
            ${certifications.map((cert) =>
              `<img src="${escapeHtml(cert.image)}" alt="${escapeHtml(cert.name)}" loading="lazy" decoding="async">`,
            ).join('')}
          </div>
        </article>`
      : '';

    const awardsHtml = awards.length
      ? `<article class="about-card about-card--awards">
          <h3 class="about-card__title">수상 및 경력</h3>
          <ul class="about-card__timeline">
            ${awards.map((item) => `
              <li class="about-card__timeline-item">
                <span class="about-card__year">${escapeHtml(item.year)}</span>
                <div class="about-card__item-body">
                  <strong>${escapeHtml(item.title)}</strong>
                  <span>${escapeHtml(item.org)}</span>
                </div>
                ${item.image
                  ? `<img class="about-card__item-logo" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.org)}" loading="lazy" decoding="async">`
                  : ''}
              </li>`).join('')}
          </ul>
        </article>`
      : '';

    const educationHtml = education.length
      ? `<article class="about-card about-card--education">
          <h3 class="about-card__title">학력 및 교육</h3>
          <ul class="about-card__schools">
            ${education.map((item) => `
              <li class="about-card__school-item">
                ${item.image
                  ? `<img class="about-card__school-logo" src="${escapeHtml(item.image)}" alt="" loading="lazy" decoding="async">`
                  : ''}
                <div class="about-card__school-copy">
                  <strong>${nl2br(item.title)}</strong>
                  ${item.detail ? `<span>${nl2br(item.detail)}</span>` : ''}
                </div>
              </li>`).join('')}
          </ul>
        </article>`
      : '';

    return `<div class="about-cards">${majorHtml}${certsHtml}${awardsHtml}${educationHtml}</div>`;
  };
})();
