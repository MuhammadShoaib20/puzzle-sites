'use client';

import LoginForm from '@/components/LoginForm';
import AccessKeyScreen, { useAccessKey } from '@/components/AccessKeyScreen';

const ADMIN_ACCESS_KEY = process.env.ADMIN_ACCESS_KEY || '84729153';

type Props = {
  siteName: string;
  siteLogo: string | null;
  adminPath: string;
  message?: string;
};

export default function LoginWithAccessKey({ siteName, siteLogo, adminPath, message }: Props) {
  const hasAccess = useAccessKey();

  if (!hasAccess) {
    return <AccessKeyScreen correctKey={ADMIN_ACCESS_KEY} onSuccess={() => window.location.reload()} />;
  }

  return <LoginForm siteName={siteName} siteLogo={siteLogo} adminPath={adminPath} message={message} />;
}
