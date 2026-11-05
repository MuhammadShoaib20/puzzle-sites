import NavbarClient from './NavbarClient';
import type { Settings } from '@/types';

type Props = {
  settings: Pick<Settings, 'site_name' | 'site_logo'> | null;
};

export default function Navbar({ settings }: Props) {
  return (
    <NavbarClient
      siteName={settings?.site_name || 'PuzzleWalkthroughs'}
      siteLogo={settings?.site_logo || null}
    />
  );
}
