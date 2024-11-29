import React, { useState, useEffect } from 'react';
import { Tag as TagIcon, X } from 'lucide-react';
import { supabase } from '../../services/supabase/client';

interface TagInputProps {
  onTagsChange: (tags: string[]) => void;
}

export function TagInput({ onTagsChange }: TagInputProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    const { data } = await supabase
      .from('tags')
      .select('name')
      .order('name');
    
    if (data) {
      setSuggestions(data.map(tag => tag.name));
    }
  };

  const addTag = async (tagName: string) => {
    const normalizedTag = tagName.toLowerCase().trim();
    if (normalizedTag && !tags.includes(normalizedTag)) {
      const newTags = [...tags, normalizedTag];
      setTags(newTags);
      onTagsChange(newTags);
      setInput('');
    }
  };

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    setTags(newTags);
    onTagsChange(newTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    }
  };

  const filteredSuggestions = suggestions
    .filter(tag => tag.toLowerCase().includes(input.toLowerCase()))
    .filter(tag => !tags.includes(tag));

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Tags
      </label>
      <div className="flex flex-wrap gap-2 p-2 border rounded-md">
        {tags.map((tag, index) => (
          <span
            key={tag}
            className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
          >
            <TagIcon className="h-4 w-4 mr-1" />
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 hover:text-indigo-500"
            >
              <X className="h-4 w-4" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-[200px] outline-none"
          placeholder="Add tags..."
        />
      </div>
      {input && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
          <ul className="max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
            {filteredSuggestions.map((suggestion) => (
              <li
                key={suggestion}
                onClick={() => addTag(suggestion)}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}