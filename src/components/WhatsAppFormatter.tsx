
import React from 'react';

interface WhatsAppFormatterProps {
  text: string;
}

const WhatsAppFormatter: React.FC<WhatsAppFormatterProps> = ({ text }) => {
  if (!text) return null;

  // Aplicar formatação do WhatsApp
  let formattedText = text
    // Negrito: *texto* -> <strong>texto</strong>
    .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
    // Itálico: _texto_ -> <em>texto</em>
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Tachado: ~texto~ -> <del>texto</del>
    .replace(/~(.*?)~/g, '<del>$1</del>')
    // Monospace: ```texto``` -> <code>texto</code>
    .replace(/```(.*?)```/g, '<code>$1</code>')
    // Quebras de linha
    .replace(/\n/g, '<br />');

  return (
    <div 
      className="whatsapp-formatted" 
      dangerouslySetInnerHTML={{ __html: formattedText }} 
    />
  );
};

export default WhatsAppFormatter;
