
import React from "react";

export interface CustomAction {
  label: string;
  key: string;
  icon?: React.ReactNode;
}

export interface ActionHandlers {
  onEdit?: (ids: string[]) => void;
  onDelete?: (ids: string[]) => void;
  onBlock?: (ids: string[]) => void;
  onActivate?: (ids: string[]) => void;
  onCustomAction?: (ids: string[], action: string) => void;
}
