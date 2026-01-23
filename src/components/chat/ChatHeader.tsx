interface ChatHeaderProps {
  title: string;
  subtitle?: string;
}

export function ChatHeader({ title, subtitle }: ChatHeaderProps) {
  return (
    <header className="h-14 border-b border-border bg-background flex items-center px-6">
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">{subtitle}</span>
          </>
        )}
      </div>
    </header>
  );
}
