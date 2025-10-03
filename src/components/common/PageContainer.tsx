import React from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  headerAction?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  description,
  headerAction,
  className,
  contentClassName,
}) => {
  return (
    <div className={cn("h-screen flex flex-col", className)}>
      {(title || description || headerAction) && (
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 sm:py-6 border-b bg-background">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {title && (
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-1 text-sm sm:text-base text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            {headerAction && (
              <div className="flex-shrink-0">
                {headerAction}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className={cn(
        "flex-1 min-h-0 overflow-auto px-4 sm:px-6 py-4 sm:py-6",
        contentClassName
      )}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
