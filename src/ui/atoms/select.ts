// Select nativo con la forma de .aa-input: mismo alto, fondo y borde. Nativo y no custom para
// conservar teclado, lector de pantalla y el picker del sistema en móvil sin JS extra.

export interface SelectOptions {
  name: string;
  label: string;
  options: string[];
  placeholder: string;
  required?: boolean;
}

export interface SelectParts {
  field: HTMLElement;
  select: HTMLSelectElement;
  error: HTMLElement;
}

export function renderSelect(opts: SelectOptions): SelectParts {
  const id = `aa-${opts.name}`;

  const field = document.createElement('div');
  field.className = 'aa-field';

  const label = document.createElement('label');
  label.className = 'aa-label';
  label.htmlFor = id;
  label.textContent = opts.label;

  // El chevron vive en el wrapper (::after): un <select> no admite pseudo-elementos.
  const wrap = document.createElement('div');
  wrap.className = 'aa-select';

  const select = document.createElement('select');
  select.className = 'aa-input aa-select__control';
  select.id = id;
  select.name = opts.name;
  if (opts.required) select.required = true;

  // Opción vacía como placeholder: con required deja el select en :invalid hasta elegir.
  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = opts.placeholder;
  empty.disabled = true;
  empty.selected = true;
  select.appendChild(empty);

  opts.options.forEach((text) => {
    const option = document.createElement('option');
    option.value = text;
    option.textContent = text;
    select.appendChild(option);
  });

  wrap.appendChild(select);

  const error = document.createElement('span');
  error.className = 'aa-error';

  field.append(label, wrap, error);
  return { field, select, error };
}
