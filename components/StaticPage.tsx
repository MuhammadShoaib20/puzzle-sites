type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function StaticPage({ title, subtitle, children }: Props) {
  return (
    <div className="container-narrow py-10 md:py-16 animate-fade-in-up">
      <header className="mb-8 md:mb-10 text-center">
        <h1 className="page-title">{title}</h1>
        {subtitle && (
          <p className="page-sub" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
            {subtitle}
          </p>
        )}
      </header>
      <div className="card p-6 md:p-10">
        <div className="prose max-w-none">{children}</div>
      </div>
    </div>
  );
}
