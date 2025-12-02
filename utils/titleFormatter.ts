export const getDisplayTitle = (name: string = ''): string => {
  const withoutDatePrefix = name.replace(/^[0-9]{4}-[0-9]{2}-[0-9]{2}-/, '');
  const withoutExtension = withoutDatePrefix.replace(/\.(md|markdown)$/i, '');
  return withoutExtension;
};
