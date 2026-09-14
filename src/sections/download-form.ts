// Formulario de descarga del estudio (gated), en la columna derecha del hero. Aún sin conectar:
// valida con la API nativa del navegador y no envía nada. F4 lo conecta a /api/download.

import { renderHeading, renderParagraph } from '../ui/text';
import { renderButton } from '../ui/atoms/button';
import { renderField } from '../ui/atoms/input';
import { renderSelect } from '../ui/atoms/select';

const INDUSTRIES = ['Automotriz', 'HED', 'Finance', 'Otros'];

function row(...fields: HTMLElement[]): HTMLElement {
  const el = document.createElement('div');
  el.className = 'aa-form__row';
  el.append(...fields);
  return el;
}

export function renderDownloadForm(): HTMLElement {
  const card = document.createElement('div');
  card.className = 'aa-download';
  card.id = 'aa-descarga'; // ancla para los CTA de la página host
  card.setAttribute('data-aa-fade', '');
  card.setAttribute('data-aa-delay', '0.3');

  const head = document.createElement('div');
  head.className = 'aa-download__head';
  head.appendChild(renderHeading({ size: 'ml', text: 'Descarga el estudio completo', tag: 'h2' }));
  head.appendChild(
    renderParagraph({
      size: 'm',
      text: 'Déjanos tus datos y accede al PDF con los resultados por país e industria.',
      className: 'aa-download__lead',
    }),
  );

  const form = document.createElement('form');
  form.className = 'aa-form aa-download__form';
  form.setAttribute('data-aa-download-form', '');

  const firstName = renderField({ name: 'first_name', label: 'Primer nombre', required: true, autocomplete: 'given-name' });
  const middleName = renderField({ name: 'middle_name', label: 'Segundo nombre (opcional)', autocomplete: 'additional-name' });
  const company = renderField({ name: 'company', label: 'Empresa', required: true, autocomplete: 'organization' });
  const domain = renderField({ name: 'domain', label: 'Dominio', placeholder: 'empresa.com', required: true, autocomplete: 'url' });
  const email = renderField({
    name: 'email',
    label: 'Correo corporativo',
    type: 'email',
    placeholder: 'nombre@empresa.com',
    required: true,
    autocomplete: 'email',
  });
  const phone = renderField({
    name: 'phone',
    label: 'Teléfono',
    type: 'tel',
    placeholder: '+ código de país',
    required: true,
    autocomplete: 'tel',
  });
  const industry = renderSelect({
    name: 'industry',
    label: 'Industria',
    options: INDUSTRIES,
    placeholder: 'Selecciona',
    required: true,
  });

  const submit = document.createElement('div');
  submit.className = 'aa-form__submit';
  submit.appendChild(renderButton({ label: 'Descargar el estudio', variant: 'primary' }));

  form.append(
    row(firstName.field, middleName.field),
    row(company.field, domain.field),
    email.field,
    row(phone.field, industry.field),
    submit,
  );

  // Sin endpoint todavía: se muestran los avisos nativos y se corta el envío para no recargar.
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    form.reportValidity();
  });

  card.append(head, form);
  return card;
}
