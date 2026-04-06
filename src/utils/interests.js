export function getComplexLabel(listing) {
  return listing.mapLabel || listing.neighborhood || listing.title;
}

export function getComplexKey(listing) {
  return `${listing.district}::${getComplexLabel(listing)}`;
}
