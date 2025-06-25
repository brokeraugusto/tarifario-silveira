
import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CategoryType } from '@/types';

interface InlineCategoryEditorProps {
  category: CategoryType;
  onSave: (oldCategory: CategoryType, newCategory: CategoryType) => void;
  disabled?: boolean;
}

const InlineCategoryEditor: React.FC<InlineCategoryEditorProps> = ({
  category,
  onSave,
  disabled = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(category);

  const handleSave = () => {
    if (editValue && editValue !== category) {
      onSave(category, editValue as CategoryType);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(category);
    setIsEditing(false);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Standard':
        return 'bg-blue-100 text-blue-800';
      case 'Luxo':
        return 'bg-purple-100 text-purple-800';
      case 'Super Luxo':
        return 'bg-amber-100 text-amber-800';
      case 'Master':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value as CategoryType)}
          className="h-8 w-32"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          autoFocus
        />
        <Button size="sm" variant="ghost" onClick={handleSave} className="h-8 w-8 p-0">
          <Check className="h-3 w-3 text-green-600" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel} className="h-8 w-8 p-0">
          <X className="h-3 w-3 text-red-600" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge className={getCategoryColor(category)}>{category}</Badge>
      {!disabled && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          className="h-6 w-6 p-0"
        >
          <Pencil className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default InlineCategoryEditor;
