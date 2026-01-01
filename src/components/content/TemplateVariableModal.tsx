import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, BookTemplate } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import type { ContentTemplate, TemplateVariable } from '@/types';

interface TemplateVariableModalProps {
  template: ContentTemplate;
  isOpen: boolean;
  onClose: () => void;
  onApply: (content: string, hashtags: string[]) => void;
}

// Extract variables from template content ({{variableName}} format)
function extractVariables(content: string): TemplateVariable[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variables: TemplateVariable[] = [];
  const seen = new Set<string>();

  let match;
  while ((match = regex.exec(content)) !== null) {
    const name = match[1];
    if (!seen.has(name)) {
      seen.add(name);
      variables.push({ name });
    }
  }

  return variables;
}

// Replace variables in content with values
function substituteVariables(content: string, values: Record<string, string>): string {
  let result = content;
  for (const [name, value] of Object.entries(values)) {
    const regex = new RegExp(`\\{\\{${name}\\}\\}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

export function TemplateVariableModal({
  template,
  isOpen,
  onClose,
  onApply,
}: TemplateVariableModalProps) {
  // Extract variables from template content
  const variables = useMemo(() => extractVariables(template.content), [template.content]);

  // Initialize variable values with defaults from template
  const [values, setValues] = useState<Record<string, string>>({});

  // Reset values when template changes
  useEffect(() => {
    const initialValues: Record<string, string> = {};
    variables.forEach((v) => {
      // Check if template has a default for this variable
      const templateVar = template.variables.find((tv) => tv.name === v.name);
      initialValues[v.name] = templateVar?.defaultValue || '';
    });
    setValues(initialValues);
  }, [template, variables]);

  // Preview with current values
  const preview = useMemo(() => {
    return substituteVariables(template.content, values);
  }, [template.content, values]);

  // Check if all required fields are filled
  const allFilled = useMemo(() => {
    return variables.every((v) => values[v.name]?.trim());
  }, [variables, values]);

  const handleApply = () => {
    const finalContent = substituteVariables(template.content, values);
    onApply(finalContent, [...template.hashtags]);
    onClose();
  };

  // If no variables, apply directly
  useEffect(() => {
    if (isOpen && variables.length === 0) {
      onApply(template.content, [...template.hashtags]);
      onClose();
    }
  }, [isOpen, variables.length, template, onApply, onClose]);

  if (!isOpen || variables.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl max-h-[85vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <GlassCard className="p-0 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-glass-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <BookTemplate size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{template.name}</h3>
                  <p className="text-xs text-gray-500">
                    Fill in {variables.length} variable{variables.length !== 1 ? 's' : ''} to customize
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Variable Inputs */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Sparkles size={14} className="text-primary" />
                  Template Variables
                </h4>
                <div className="grid gap-3">
                  {variables.map((variable) => {
                    const templateVar = template.variables.find((tv) => tv.name === variable.name);
                    return (
                      <div key={variable.name}>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 capitalize">
                          {variable.name.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                        </label>
                        <input
                          type="text"
                          value={values[variable.name] || ''}
                          onChange={(e) =>
                            setValues((prev) => ({ ...prev, [variable.name]: e.target.value }))
                          }
                          placeholder={templateVar?.defaultValue || `Enter ${variable.name}...`}
                          className="w-full bg-white/5 border border-glass-border rounded-lg py-2.5 px-3 text-white text-sm placeholder-gray-500 focus:border-primary transition-colors"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Preview */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Preview</h4>
                <div className="bg-white/5 border border-glass-border rounded-xl p-4">
                  <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {preview || (
                      <span className="text-gray-500 italic">Fill in the variables to see preview...</span>
                    )}
                  </p>
                  {template.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-glass-border">
                      {template.hashtags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-glass-border bg-white/2">
              <p className="text-xs text-gray-500">
                {allFilled ? (
                  <span className="text-success">All variables filled</span>
                ) : (
                  `${variables.filter((v) => values[v.name]?.trim()).length}/${variables.length} filled`
                )}
              </p>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleApply}
                  disabled={!allFilled}
                  className="gap-2"
                >
                  Apply Template
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
