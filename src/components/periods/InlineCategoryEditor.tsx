
import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CategoryType } from '@/types';
import { updateCategoryName } from '@/integrations/supabase/services/categoryPriceService';
import { toast } from 'sonner';

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
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (editValue && editValue !== category) {
      setIsLoading(true);
      try {
        const success = await updateCategoryName(category, editValue as CategoryType);
        if (success) {
          onSave(category, editValue as CategoryType);
          toast.success(`Categoria alterada de "${category}" para "${editValue}"`);
        } else {
          toast.error('Erro ao alterar categoria');
          setEditValue(category);
        }
      } catch (error) {
        console.error('Error updating category:', error);
        toast.error('Erro ao alterar categoria');
        setEditValue(category);
      } finally {
        setIsLoading(false);
      }
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
        return 'bg-secondary text-secondary-foreground';
      case 'Luxo':
        return 'bg-primary/10 text-primary';
      case 'Super Luxo':
        return 'bg-accent/10 text-accent';
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
          disabled={isLoading}
          autoFocus
        />
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={handleSave} 
          className="h-8 w-8 p-0"
          disabled={isLoading}
        >
          <Check className="h-3 w-3 text-green-600" />
        </Button>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={handleCancel} 
          className="h-8 w-8 p-0"
          disabled={isLoading}
        >
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
          disabled={isLoading}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

export default InlineCategoryEditor;
