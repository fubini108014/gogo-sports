import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Menu, Pencil, ChevronRight } from 'lucide-react';
import ExploreTagCard from '../ui/ExploreTagCard';
import {
  DndContext, closestCenter,
  PointerSensor, TouchSensor, useSensor, useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ExploreTag, ExploreColorKey, EXPLORE_COLOR_MAP, ExploreTagFilters, Level,
} from '../../types';
import { SPORTS_HIERARCHY, TAIWAN_CITIES } from '../../constants';

// ── Constants ─────────────────────────────────────────────────────

const EMOJI_OPTIONS = [
  '🏃', '🏋️', '🤸', '🧘', '🏊', '🚴', '⚽', '🏀',
  '🏐', '🎾', '🏸', '🏓', '🎿', '🧗', '🥊', '🏄',
  '🔥', '💪', '⚡', '✨', '🎯', '🌟', '💥', '🏆',
  '🥇', '💰', '🆓', '🌙', '📅', '🔰', '🎉', '🕐',
];

const COLOR_KEYS: ExploreColorKey[] = ['orange', 'green', 'blue', 'indigo', 'rose', 'purple', 'teal', 'yellow'];

const CITY_LIST = TAIWAN_CITIES.filter(c => c !== '全台灣');
const SPORT_CATEGORIES = SPORTS_HIERARCHY.filter(c => c.name !== '所有運動');

// ── Form State ────────────────────────────────────────────────────

interface FormState {
  label: string;
  icon: string;
  colorKey: ExploreColorKey;
  searchTerm: string;
  cities: string[];
  mainCategories: string[];
  subCategories: string[];
  isNearlyFull: boolean;
  levels: string[];
  minPrice: string;
  maxPrice: string;
}

const EMPTY_FORM: FormState = {
  label: '', 
  icon: '🎯', 
  colorKey: 'orange', 
  searchTerm: '', 
  cities: [], 
  mainCategories: [], 
  subCategories: [],
  isNearlyFull: false,
  levels: [],
  minPrice: '',
  maxPrice: '',
};

function tagToForm(tag: ExploreTag): FormState {
  return {
    label: tag.label, icon: tag.icon, colorKey: tag.colorKey,
    searchTerm: tag.filters.searchTerm ?? '',
    cities: tag.filters.cities ?? [],
    mainCategories: tag.filters.mainCategories ?? [],
    subCategories: tag.filters.subCategories ?? [],
    isNearlyFull: tag.filters.isNearlyFull ?? false,
    levels: tag.filters.levels ?? [],
    minPrice: tag.filters.minPrice !== undefined ? String(tag.filters.minPrice) : '',
    maxPrice: tag.filters.maxPrice !== undefined ? String(tag.filters.maxPrice) : '',
  };
}

function formToFilters(form: FormState): ExploreTagFilters {
  const filters: ExploreTagFilters = {};
  if (form.searchTerm.trim()) filters.searchTerm = form.searchTerm.trim();
  if (form.cities.length > 0) filters.cities = form.cities;
  if (form.mainCategories.length > 0) filters.mainCategories = form.mainCategories;
  if (form.subCategories.length > 0) filters.subCategories = form.subCategories;
  if (form.isNearlyFull) filters.isNearlyFull = true;
  if (form.levels.length > 0) filters.levels = form.levels;
  if (form.minPrice !== '') filters.minPrice = Number(form.minPrice);
  if (form.maxPrice !== '') filters.maxPrice = Number(form.maxPrice);
  return filters;
}

// ── Toggle Switch ─────────────────────────────────────────────────

const Toggle: React.FC<{ on: boolean; onChange: () => void }> = ({ on, onChange }) => (
  <button
    type="button"
    onClick={(e) => { e.stopPropagation(); onChange(); }}
    className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
  >
    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
  </button>
);

// ── Filter Summary ────────────────────────────────────────────────

function filterSummary(form: FormState): string {
  const parts: string[] = [];
  if (form.isNearlyFull) parts.push('🔥 快滿');
  if (form.cities.length > 0)
    parts.push(form.cities.length === 1 ? form.cities[0] : `${form.cities[0]} +${form.cities.length - 1}`);
  if (form.subCategories.length > 0)
    parts.push(form.subCategories.length === 1 ? form.subCategories[0] : `${form.subCategories[0]} +${form.subCategories.length - 1}`);
  else if (form.mainCategories.length > 0)
    parts.push(form.mainCategories.length === 1 ? form.mainCategories[0] : `${form.mainCategories[0]} +${form.mainCategories.length - 1}`);
  
  if (form.levels.length > 0) parts.push(form.levels.join(','));
  if (form.minPrice || form.maxPrice) parts.push(`$${form.minPrice || 0}-${form.maxPrice || '∞'}`);
  if (form.searchTerm.trim()) parts.push(`"${form.searchTerm.trim()}"`);
  
  return parts.length > 0 ? parts.join(' · ') : '全部活動';
}

// ── Sortable Tag Row ──────────────────────────────────────────────

interface TagRowProps {
  tag: ExploreTag;
  onEdit: (tag: ExploreTag) => void;
  onToggle: (id: string) => void;
}

const SortableTagRow: React.FC<TagRowProps> = ({ tag, onEdit, onToggle }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tag.id });
  const c = EXPLORE_COLOR_MAP[tag.colorKey];
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border transition-all ${
        isDragging
          ? 'bg-white dark:bg-slate-800 border-primary/40 shadow-md shadow-black/10 dark:shadow-black/30 scale-[1.02] z-10 relative'
          : tag.enabled
          ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50'
          : 'bg-white dark:bg-slate-800/20 border-slate-100 dark:border-slate-700/30 opacity-40'
      }`}
    >
      <span
        {...listeners}
        className={`cursor-grab active:cursor-grabbing touch-none flex-shrink-0 p-1 -ml-1 transition-colors ${
          isDragging
            ? 'text-primary animate-drag-shake'
            : 'text-slate-300 hover:text-slate-500 dark:hover:text-slate-400'
        }`}
      >
        <Menu size={16} />
      </span>
      <span className="text-lg w-7 text-center flex-shrink-0">{tag.icon}</span>
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
      <span className="flex-1 text-sm font-bold text-slate-700 dark:text-slate-200 truncate min-w-0">{tag.label}</span>
      {!tag.isSystem && (
        <button
          onClick={() => onEdit(tag)}
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
        >
          <Pencil size={12} />
        </button>
      )}
      <Toggle on={tag.enabled} onChange={() => onToggle(tag.id)} />
    </div>
  );
};

// ── Main Modal ────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exploreTags: ExploreTag[];
  onSave: (tags: ExploreTag[]) => void;
}

const ExploreTagManagerModal: React.FC<Props> = ({ isOpen, onClose, exploreTags, onSave }) => {
  const [localTags, setLocalTags] = useState<ExploreTag[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [expandedSportCat, setExpandedSportCat] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showHidden, setShowHidden] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  useEffect(() => {
    if (isOpen) {
      setLocalTags([...exploreTags]);
      setView('list');
      setExpandedSportCat(null);
      setConfirmDelete(false);
      setShowHidden(false);
    }
  }, [isOpen, exploreTags]);

  if (!isOpen) return null;

  // ── Drag handlers ─────────────────────────────────────────────────

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLocalTags(prev => {
        const oldIndex = prev.findIndex(t => t.id === active.id);
        const newIndex = prev.findIndex(t => t.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  // ── List handlers ─────────────────────────────────────────────────

  const toggleEnabled = (id: string) => {
    setLocalTags(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  const deleteTag = (id: string) => {
    setLocalTags(prev => prev.filter(t => t.id !== id));
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setExpandedSportCat(null);
    setView('create');
  };

  const openEdit = (tag: ExploreTag) => {
    setForm(tagToForm(tag));
    setEditingId(tag.id);
    setExpandedSportCat(null);
    setView('edit');
  };

  const submitForm = () => {
    if (!form.label.trim()) return;
    const filters = formToFilters(form);
    if (view === 'create') {
      const newTag: ExploreTag = {
        id: `custom_${Date.now()}`,
        label: form.label.trim(),
        icon: form.icon,
        colorKey: form.colorKey,
        filters,
        isSystem: false,
        enabled: true,
      };
      setLocalTags(prev => [...prev, newTag]);
    } else if (view === 'edit' && editingId) {
      setLocalTags(prev => prev.map(t =>
        t.id === editingId
          ? { ...t, label: form.label.trim(), icon: form.icon, colorKey: form.colorKey, filters }
          : t
      ));
    }
    setView('list');
  };

  const handleSave = () => { onSave(localTags); onClose(); };

  // ── Form helpers ──────────────────────────────────────────────────

  const toggleCity = (city: string) => {
    setForm(f => ({
      ...f,
      cities: f.cities.includes(city) ? f.cities.filter(c => c !== city) : [...f.cities, city],
    }));
  };

  const toggleMainCat = (name: string) => {
    setForm(f => {
      const next = f.mainCategories.includes(name)
        ? f.mainCategories.filter(c => c !== name)
        : [...f.mainCategories, name];
      const validSubs = next.flatMap(m => SPORT_CATEGORIES.find(c => c.name === m)?.items ?? []);
      return { ...f, mainCategories: next, subCategories: f.subCategories.filter(s => validSubs.includes(s)) };
    });
    setExpandedSportCat(prev => prev === name ? null : name);
  };

  const toggleSubCat = (item: string, mainName: string) => {
    setForm(f => {
      const newSubs = f.subCategories.includes(item)
        ? f.subCategories.filter(s => s !== item)
        : [...f.subCategories, item];
      const newMains = f.mainCategories.includes(mainName) ? f.mainCategories : [...f.mainCategories, mainName];
      return { ...f, mainCategories: newMains, subCategories: newSubs };
    });
  };

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-slide-up">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          {view === 'list' ? (
            <div>
              <h2 className="font-black text-lg text-slate-900 dark:text-white">管理探索標籤</h2>
              <p className="text-xs text-slate-400 mt-0.5">拖拉排序、開關或新增自訂標籤</p>
            </div>
          ) : (
            <button onClick={() => setView('list')} className="flex items-center gap-1.5 text-sm font-bold text-primary">
              ← 返回列表
            </button>
          )}
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>


        {/* ── Scrollable Content ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── List View ── */}
          {view === 'list' && (
            <div className="p-5 space-y-2">
              <button
                onClick={openCreate}
                className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-400 hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={15} /> 新增自訂標籤
              </button>

              {localTags.some(t => !t.enabled) && (
                <div className="flex items-center justify-between px-1 py-1">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500">顯示已隱藏標籤</span>
                  <Toggle on={showHidden} onChange={() => setShowHidden(v => !v)} />
                </div>
              )}

              {localTags.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                  <p className="text-3xl mb-2">🏷️</p>
                  <p className="text-sm font-bold">尚無任何標籤</p>
                </div>
              )}

              {(() => {
                const displayTags = showHidden ? localTags : localTags.filter(t => t.enabled);
                return (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    autoScroll={false}
                  >
                    <SortableContext items={displayTags.map(t => t.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {displayTags.map(tag => (
                          <SortableTagRow key={tag.id} tag={tag} onEdit={openEdit} onToggle={toggleEnabled} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                );
              })()}
            </div>
          )}

          {/* ── Create / Edit Form ── */}
          {(view === 'create' || view === 'edit') && (
            <div className="p-5 space-y-6">

              {/* Icon */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">圖示</label>
                <div className="grid grid-cols-8 gap-1.5">
                  {EMOJI_OPTIONS.map(e => (
                    <button
                      key={e}
                      onClick={() => setForm(f => ({ ...f, icon: e }))}
                      className={`text-xl py-1.5 rounded-xl transition-all ${
                        form.icon === e ? 'bg-primary/10 ring-2 ring-primary scale-110' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview + Label + Color — 左右並排 */}
              <div className="flex gap-4 items-start">
                {/* 預覽卡片 */}
                <ExploreTagCard
                  icon={form.icon}
                  label={form.label || '標籤名稱'}
                  colorKey={form.colorKey}
                  subtitle={filterSummary(form) !== '全部活動' ? filterSummary(form) : undefined}
                />

                {/* 名稱 + 顏色（上下排列） */}
                <div className="flex-1 flex flex-col gap-3 justify-center">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">標籤名稱</label>
                    <input
                      type="text"
                      value={form.label}
                      onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                      placeholder="例如：台北早晨羽球"
                      maxLength={10}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">顏色</label>
                    <div className="flex gap-2 flex-wrap">
                      {COLOR_KEYS.map(key => (
                        <button
                          key={key}
                          onClick={() => setForm(f => ({ ...f, colorKey: key }))}
                          className={`w-7 h-7 rounded-full ${EXPLORE_COLOR_MAP[key].dot} transition-transform hover:scale-110 ${
                            form.colorKey === key ? 'ring-2 ring-offset-2 dark:ring-offset-slate-900 ring-slate-500 scale-110' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Conditions */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-3">篩選條件</label>
                <div className="space-y-4">

                  {/* 地區 */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black text-slate-600 dark:text-slate-300">📍 地區</span>
                      {form.cities.length > 0 && (
                        <button onClick={() => setForm(f => ({ ...f, cities: [] }))} className="text-[10px] text-slate-400 hover:text-red-500 font-bold">清除</button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {CITY_LIST.map(city => (
                        <button
                          key={city}
                          onClick={() => toggleCity(city)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors border ${
                            form.cities.includes(city)
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                          }`}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                    {form.cities.length === 0 && <p className="text-[10px] text-slate-400 mt-2">未選擇 = 全台灣</p>}
                  </div>

                  {/* 即將額滿 */}
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex items-center justify-between">
                    <div>
                        <p className="font-bold text-orange-700 dark:text-orange-400 text-sm">🔥 即將額滿</p>
                        <p className="text-[10px] text-orange-600/70 dark:text-orange-400/70">僅顯示報名人數 80% 以上的活動</p>
                    </div>
                    <Toggle on={form.isNearlyFull} onChange={() => setForm(f => ({ ...f, isNearlyFull: !f.isNearlyFull }))} />
                  </div>

                  {/* 運動項目 */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black text-slate-600 dark:text-slate-300">🏅 運動項目</span>
                      {(form.mainCategories.length > 0 || form.subCategories.length > 0) && (
                        <button onClick={() => setForm(f => ({ ...f, mainCategories: [], subCategories: [] }))} className="text-[10px] text-slate-400 hover:text-red-500 font-bold">清除</button>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      {SPORT_CATEGORIES.map(cat => {
                        const isMainSelected = form.mainCategories.includes(cat.name);
                        const isExpanded = expandedSportCat === cat.name;
                        const selectedSubCount = cat.items.filter(i => form.subCategories.includes(i)).length;
                        return (
                          <div key={cat.name}>
                            <button
                              onClick={() => toggleMainCat(cat.name)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors border ${
                                isMainSelected
                                  ? 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20'
                                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/40'
                              }`}
                            >
                              <span>{cat.name}{selectedSubCount > 0 ? ` (${selectedSubCount})` : ''}</span>
                              <ChevronRight size={13} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </button>
                            {isExpanded && (
                              <div className="flex flex-wrap gap-1.5 mt-2 ml-2 animate-fade-in">
                                {cat.items.map(item => (
                                  <button
                                    key={item}
                                    onClick={() => toggleSubCat(item, cat.name)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors border ${
                                      form.subCategories.includes(item)
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                    }`}
                                  >
                                    {item}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {form.mainCategories.length === 0 && <p className="text-[10px] text-slate-400 mt-2">未選擇 = 所有運動</p>}
                  </div>

                  {/* 活動程度 */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black text-slate-600 dark:text-slate-300">📊 活動程度</span>
                      {form.levels.length > 0 && (
                        <button onClick={() => setForm(f => ({ ...f, levels: [] }))} className="text-[10px] text-slate-400 hover:text-red-500 font-bold">清除</button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.values(Level).map(level => (
                        <button
                          key={level}
                          onClick={() => setForm(f => ({
                            ...f,
                            levels: f.levels.includes(level) ? f.levels.filter(l => l !== level) : [...f.levels, level]
                          }))}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors border ${
                            form.levels.includes(level)
                              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100'
                              : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 費用範圍 */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                    <span className="text-xs font-black text-slate-600 dark:text-slate-300 block mb-3">💰 費用範圍 (TWD)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="最低"
                        value={form.minPrice}
                        onChange={e => setForm(f => ({ ...f, minPrice: e.target.value }))}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-slate-300">—</span>
                      <input
                        type="number"
                        placeholder="最高"
                        value={form.maxPrice}
                        onChange={e => setForm(f => ({ ...f, maxPrice: e.target.value }))}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* 關鍵字 */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                    <span className="text-xs font-black text-slate-600 dark:text-slate-300 block mb-3">🔍 關鍵字</span>
                    <input
                      type="text"
                      value={form.searchTerm}
                      onChange={e => setForm(f => ({ ...f, searchTerm: e.target.value }))}
                      placeholder="例如：下班、假日、室內"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                </div>
              </div>

              {view === 'edit' && editingId && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  {confirmDelete ? (
                    <div className="border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 rounded-2xl p-4">
                      <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                        <Trash2 size={15} /> 確定要刪除這個標籤嗎？
                      </p>
                      <p className="text-xs text-red-400 dark:text-red-500 mb-4">此操作無法復原，標籤將會永久刪除。</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="flex-1 py-2 rounded-xl text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => { deleteTag(editingId); setView('list'); setConfirmDelete(false); }}
                          className="flex-1 py-2 rounded-xl text-sm font-bold bg-red-500 hover:bg-red-600 text-white transition-colors"
                        >
                          確定刪除
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold text-red-500 border-2 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-400 dark:hover:border-red-700 transition-colors"
                    >
                      <Trash2 size={15} /> 刪除此標籤
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          {view === 'list' ? (
            <button
              onClick={handleSave}
              className="w-full py-3.5 bg-primary hover:bg-orange-600 text-white font-black text-sm rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-orange-200 dark:shadow-none"
            >
              儲存設定
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setView('list')}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm rounded-2xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                取消
              </button>
              <button
                onClick={submitForm}
                disabled={!form.label.trim()}
                className="flex-[2] py-3 bg-primary hover:bg-orange-600 disabled:opacity-40 text-white font-black text-sm rounded-2xl transition-all active:scale-[0.98]"
              >
                {view === 'create' ? '新增標籤' : '儲存修改'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ExploreTagManagerModal;
