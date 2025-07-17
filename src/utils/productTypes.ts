export const getProductTypeLabel = (type: string): string => {
  const labels: { [key: string]: string } = {
    'tomate': 'Tomate',
    'alface': 'Alface',
    'pepino': 'Pepino',
    'pimentao': 'Pimentão',
    'abacate_hass': 'Abacate Hass',
    'abacate_geada': 'Abacate Geada',
    'abacate_brede': 'Abacate Brede',
    'abacate_margarida': 'Abacate Margarida',
    'manga_tommy': 'Manga Tommy',
    'manga_maca': 'Manga Maçã',
    'manga_palmer': 'Manga Palmer',
    'mel': 'Mel',
    'limao_tahiti': 'Limão Tahiti',
    'outros': 'Outros'
  };
  return labels[type] || type;
};

export const getProductTypeOptions = () => [
  { value: 'tomate', label: 'Tomate' },
  { value: 'alface', label: 'Alface' },
  { value: 'pepino', label: 'Pepino' },
  { value: 'pimentao', label: 'Pimentão' },
  { value: 'abacate_hass', label: 'Abacate Hass' },
  { value: 'abacate_geada', label: 'Abacate Geada' },
  { value: 'abacate_brede', label: 'Abacate Brede' },
  { value: 'abacate_margarida', label: 'Abacate Margarida' },
  { value: 'manga_tommy', label: 'Manga Tommy' },
  { value: 'manga_maca', label: 'Manga Maçã' },
  { value: 'manga_palmer', label: 'Manga Palmer' },
  { value: 'mel', label: 'Mel' },
  { value: 'limao_tahiti', label: 'Limão Tahiti' },
  { value: 'outros', label: 'Outros' },
];