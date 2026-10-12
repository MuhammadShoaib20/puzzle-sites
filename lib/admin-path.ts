export function getAdminPath(): string {
  return process.env.ADMIN_SECRET_PATH || 'ms-control-9x7k2p';
}

export function getAdminUrl(path: string = ''): string {
  const adminPath = getAdminPath();
  return `/${adminPath}${path}`;
}
