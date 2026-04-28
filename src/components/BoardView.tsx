'use client';

import { CSS } from '@dnd-kit/utilities';
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { ArrowLeft, ArrowRight, GripVertical, Plus, Trash2 } from 'lucide-react'; 
import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import CardModal from '@/components/CardModal';
import { getBetweenPosition, POSITION_STEP, byPosition } from '@/lib/order';
import { supabase } from '@/lib/supabase';
import type { Board, KanbanCard, KanbanColumn } from '@/lib/types';

const cardDndId = (id: string) => `card:${id}`;
const columnDndId = (id: string) => `column:${id}`;
const dropDndId = (id: string) => `drop:${id}`;
const parseDndId = (id: string | number) => String(id).split(':') as [string, string];

type CardsByColumn = Record<string, KanbanCard[]>;

export default function BoardView({ boardId }: { boardId: string }) {
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);
  const [activeColumn, setActiveColumn] = useState<KanbanColumn | null>(null);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [error, setError] = useState('');

  // SÜTUN DÜZENLEME STATE'LERİ
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [tempColumnTitle, setTempColumnTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 180, tolerance: 6 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  useEffect(() => {
    void loadBoard();
  }, [boardId]);

  const sortedColumns = useMemo(() => byPosition(columns), [columns]);

  const cardsByColumn = useMemo<CardsByColumn>(() => {
    const grouped: CardsByColumn = {};
    for (const column of sortedColumns) grouped[column.id] = [];
    for (const card of byPosition(cards)) {
      if (!grouped[card.column_id]) grouped[card.column_id] = [];
      grouped[card.column_id].push(card);
    }
    return grouped;
  }, [cards, sortedColumns]);

  async function loadBoard() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      window.location.href = '/login';
      return;
    }

    const [{ data: boardData, error: boardError }, { data: columnData }, { data: cardData }] = await Promise.all([
      supabase.from('boards').select('*').eq('id', boardId).single(),
      supabase.from('columns').select('*').eq('board_id', boardId).order('position'),
      supabase.from('cards').select('*').eq('board_id', boardId).order('position')
    ]);

    if (boardError) {
      setError('Board bulunamadı veya yetkin yok.');
      return;
    }

    setBoard(boardData);
    setColumns(columnData ?? []);
    setCards(cardData ?? []);
  }

  // SÜTUN BAŞLIĞI GÜNCELLEME FONKSİYONU
  async function updateColumnTitle(columnId: string, newTitle: string) {
    if (!newTitle.trim()) {
      setEditingColumnId(null);
      return;
    }

    // Arayüzü hemen güncelle (Optimistic)
    setColumns((current) =>
      current.map((col) => (col.id === columnId ? { ...col, title: newTitle.trim() } : col))
    );
    setEditingColumnId(null);

    const { error: updateError } = await supabase
      .from('columns')
      .update({ title: newTitle.trim() })
      .eq('id', columnId);

    if (updateError) {
      setError("Başlık güncellenirken hata oluştu.");
      await loadBoard();
    }
  }

  function onDragStart(event: DragStartEvent) {
    const [kind, id] = parseDndId(event.active.id);
    if (kind === 'card') setActiveCard(cards.find((card) => card.id === id) ?? null);
    if (kind === 'column') setActiveColumn(columns.find((column) => column.id === id) ?? null);
  }

  async function onDragEnd(event: DragEndEvent) {
    setActiveCard(null);
    setActiveColumn(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const [activeKind, activeId] = parseDndId(active.id);
    const [overKind, overId] = parseDndId(over.id);

    if (activeKind === 'column') {
      await moveColumn(activeId, overKind === 'column' ? overId : overId);
      return;
    }

    if (activeKind === 'card') {
      await moveCard(activeId, overKind, overId);
    }
  }

  async function moveColumn(activeId: string, overId: string) {
    const ordered = sortedColumns;
    const oldIndex = ordered.findIndex((column) => column.id === activeId);
    const newIndex = ordered.findIndex((column) => column.id === overId);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = arrayMove(ordered, oldIndex, newIndex);
    const previous = reordered[newIndex - 1]?.position;
    const next = reordered[newIndex + 1]?.position;
    const position = getBetweenPosition(previous, next);

    setColumns((current) => current.map((column) => (column.id === activeId ? { ...column, position } : column)));
    await supabase.from('columns').update({ position }).eq('id', activeId);
  }

  async function moveCard(activeId: string, overKind: string, overId: string) {
    const movingCard = cards.find((card) => card.id === activeId);
    if (!movingCard) return;

    const targetColumnId =
      overKind === 'card'
        ? cards.find((card) => card.id === overId)?.column_id
        : overKind === 'drop'
          ? overId
          : undefined;

    if (!targetColumnId) return;

    const targetCards = byPosition(cards.filter((card) => card.column_id === targetColumnId && card.id !== activeId));
    const overIndex = overKind === 'card' ? targetCards.findIndex((card) => card.id === overId) : targetCards.length;
    const insertIndex = overIndex >= 0 ? overIndex : targetCards.length;
    const previous = targetCards[insertIndex - 1]?.position;
    const next = targetCards[insertIndex]?.position;
    const position = getBetweenPosition(previous, next);
    const fromColumnId = movingCard.column_id;

    setCards((current) =>
      current.map((card) =>
        card.id === activeId ? { ...card, column_id: targetColumnId, position } : card
      )
    );

    const { error: updateError } = await supabase
      .from('cards')
      .update({ column_id: targetColumnId, position })
      .eq('id', activeId);

    if (updateError) {
      setError(updateError.message);
      await loadBoard();
      return;
    }

    if (fromColumnId !== targetColumnId) {
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from('activity').insert({
        board_id: boardId,
        card_id: activeId,
        actor_id: userData.user?.id,
        from_column_id: fromColumnId,
        to_column_id: targetColumnId
      });
    }
  }

  async function createColumn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newColumnTitle.trim()) return;
    const position = (sortedColumns.at(-1)?.position ?? 0) + POSITION_STEP;
    const { data, error: insertError } = await supabase
      .from('columns')
      .insert({ board_id: boardId, title: newColumnTitle.trim(), position })
      .select('*')
      .single();
    if (insertError) return setError(insertError.message);
    setColumns((current) => [...current, data]);
    setNewColumnTitle('');
  }

  async function deleteColumn(columnId: string) {
    const confirmed = window.confirm("Bu sütunu ve içindeki tüm kartları silmek istediğinize emin misiniz?");
    if (!confirmed) return;

    setColumns((current) => current.filter((col) => col.id !== columnId));
    setCards((current) => current.filter((card) => card.column_id !== columnId));

    const { error: deleteError } = await supabase.from('columns').delete().eq('id', columnId);
    if (deleteError) {
      setError("Sütun silinirken hata oluştu.");
      await loadBoard(); 
    }
  }

  async function createCard(columnId: string, title: string) {
    const position = ((cardsByColumn[columnId] ?? []).at(-1)?.position ?? 0) + POSITION_STEP;
    const { data, error: insertError } = await supabase
      .from('cards')
      .insert({ board_id: boardId, column_id: columnId, title, description: '', position })
      .select('*')
      .single();
    if (insertError) return setError(insertError.message);
    setCards((current) => [...current, data]);
  }

  async function updateCard(cardId: string, values: { title: string; description: string }) {
    const { error: updateError } = await supabase
      .from('cards')
      .update({ title: values.title, description: values.description })
      .eq('id', cardId);
    if (updateError) return setError(updateError.message);
    setCards((current) => current.map((card) => (card.id === cardId ? { ...card, ...values } : card)));
  }

  async function deleteCard(cardId: string) {
    const { error: deleteError } = await supabase.from('cards').delete().eq('id', cardId);
    if (deleteError) return setError(deleteError.message);
    setCards((current) => current.filter((card) => card.id !== cardId));
    setSelectedCard(null);
  }

  async function moveCardWithButton(card: KanbanCard, direction: -1 | 1) {
    const columnIndex = sortedColumns.findIndex((column) => column.id === card.column_id);
    const targetColumn = sortedColumns[columnIndex + direction];
    if (!targetColumn) return;
    const targetCards = cardsByColumn[targetColumn.id] ?? [];
    const position = getBetweenPosition(targetCards.at(-1)?.position, undefined);
    setCards((current) => current.map((item) => (item.id === card.id ? { ...item, column_id: targetColumn.id, position } : item)));
    await supabase.from('cards').update({ column_id: targetColumn.id, position }).eq('id', card.id);
  }

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/boards" className="font-semibold text-indigo-600">← Boardlara dön</Link>
        <p className="mt-6 rounded-2xl bg-red-50 p-4 text-red-700">{error}</p>
      </main>
    );
  }

  if (!board) return <main className="p-8 text-slate-600">Yükleniyor...</main>;

  return (
    <main className="min-h-screen px-4 py-6 md:px-8">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Link href="/boards" className="text-sm font-semibold text-indigo-600">← Boardlar</Link>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">{board.title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Kartları sürükleyip bırakarak taşı. Mobilde uzun basarak sürükleyebilir veya kart altındaki hızlı taşıma butonlarını kullanabilirsin.
          </p>
        </div>
        <form onSubmit={createColumn} className="flex gap-2 rounded-[1.5rem] bg-white/80 p-2 shadow-soft ring-1 ring-slate-200">
          <input className="min-w-0 rounded-2xl px-4 py-3 outline-none" value={newColumnTitle} onChange={(event) => setNewColumnTitle(event.target.value)} placeholder="Yeni sütun" />
          <button className="rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white"><Plus size={18} /></button>
        </form>
      </header>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <SortableContext items={sortedColumns.map((column) => columnDndId(column.id))} strategy={horizontalListSortingStrategy}>
          <section className="kanban-scroll mt-8 flex min-h-[70vh] gap-4 overflow-x-auto pb-6">
            {sortedColumns.map((column) => (
              <SortableColumn
                key={column.id}
                column={column}
                cards={cardsByColumn[column.id] ?? []}
                onCreateCard={createCard}
                onSelectCard={setSelectedCard}
                onMoveCardButton={moveCardWithButton}
                onDeleteColumn={deleteColumn}
                // DÜZENLEME PROP'LARI EKLENDİ
                editingColumnId={editingColumnId}
                setEditingColumnId={setEditingColumnId}
                tempColumnTitle={tempColumnTitle}
                setTempColumnTitle={setTempColumnTitle}
                onUpdateColumnTitle={updateColumnTitle}
                canMoveLeft={sortedColumns[0]?.id !== column.id}
                canMoveRight={sortedColumns.at(-1)?.id !== column.id}
              />
            ))}
          </section>
        </SortableContext>
        <DragOverlay>
          {activeCard ? <CardSurface card={activeCard} isOverlay /> : null}
          {activeColumn ? <div className="w-80 rounded-[1.5rem] bg-white p-4 shadow-2xl ring-1 ring-indigo-200">{activeColumn.title}</div> : null}
        </DragOverlay>
      </DndContext>

      <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} onSave={updateCard} onDelete={deleteCard} />
    </main>
  );
}

function SortableColumn({
  column,
  cards,
  onCreateCard,
  onSelectCard,
  onMoveCardButton,
  onDeleteColumn,
  editingColumnId,
  setEditingColumnId,
  tempColumnTitle,
  setTempColumnTitle,
  onUpdateColumnTitle,
  canMoveLeft,
  canMoveRight
}: {
  column: KanbanColumn;
  cards: KanbanCard[];
  onCreateCard: (columnId: string, title: string) => Promise<void>;
  onSelectCard: (card: KanbanCard) => void;
  onMoveCardButton: (card: KanbanCard, direction: -1 | 1) => Promise<void>;
  onDeleteColumn: (columnId: string) => void;
  editingColumnId: string | null;
  setEditingColumnId: (id: string | null) => void;
  tempColumnTitle: string;
  setTempColumnTitle: (title: string) => void;
  onUpdateColumnTitle: (id: string, title: string) => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
}) {
  const [newCardTitle, setNewCardTitle] = useState('');
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: dropDndId(column.id) });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: columnDndId(column.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  async function submitCard(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newCardTitle.trim()) return;
    await onCreateCard(column.id, newCardTitle.trim());
    setNewCardTitle('');
  }

  const isEditing = editingColumnId === column.id;

  return (
    <article ref={setNodeRef} style={style} className={`flex w-[21rem] shrink-0 flex-col rounded-[1.75rem] bg-white/85 p-3 shadow-soft ring-1 ring-slate-200 backdrop-blur ${isDragging ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-between gap-2 px-2 py-2">
        
        {/* SÜTUN BAŞLIĞI DÜZENLEME MANTIĞI */}
        {isEditing ? (
          <input
            autoFocus
            className="min-w-0 flex-1 rounded-lg border-2 border-indigo-500 bg-white px-2 py-1 text-lg font-black outline-none"
            value={tempColumnTitle}
            onChange={(e) => setTempColumnTitle(e.target.value)}
            onBlur={() => onUpdateColumnTitle(column.id, tempColumnTitle)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onUpdateColumnTitle(column.id, tempColumnTitle);
              if (e.key === 'Escape') setEditingColumnId(null);
            }}
          />
        ) : (
          <h2 
            onClick={() => {
              setEditingColumnId(column.id);
              setTempColumnTitle(column.title);
            }}
            className="cursor-pointer font-black text-slate-900 hover:text-indigo-600 transition-colors"
          >
            {column.title}
          </h2>
        )}

        <div className="flex items-center gap-1">
          <button onClick={() => onDeleteColumn(column.id)} className="rounded-xl p-2 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors" aria-label="Sütunu sil">
            <Trash2 size={16} />
          </button>
          <button className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" {...attributes} {...listeners} aria-label="Sütunu sürükle">
            <GripVertical size={18} />
          </button>
        </div>
      </div>

      <SortableContext items={cards.map((card) => cardDndId(card.id))} strategy={verticalListSortingStrategy}>
        <div ref={setDropRef} className={`kanban-scroll mt-2 flex-1 space-y-3 overflow-y-auto rounded-[1.25rem] p-2 transition ${isOver ? 'bg-indigo-50 ring-2 ring-indigo-200' : 'bg-slate-100/70'}`}>
          {cards.map((card) => (
            <SortableCard
              key={card.id}
              card={card}
              onSelect={() => onSelectCard(card)}
              onMoveLeft={() => onMoveCardButton(card, -1)}
              onMoveRight={() => onMoveCardButton(card, 1)}
              canMoveLeft={canMoveLeft}
              canMoveRight={canMoveRight}
            />
          ))}
          {cards.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">Kartı buraya bırak</p>}
        </div>
      </SortableContext>

      <form onSubmit={submitCard} className="mt-3 flex gap-2">
        <input className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" value={newCardTitle} onChange={(event) => setNewCardTitle(event.target.value)} placeholder="Yeni kart" />
        <button className="rounded-2xl bg-indigo-600 px-3 py-2 font-semibold text-white"><Plus size={16} /></button>
      </form>
    </article>
  );
}

function SortableCard({
  card,
  onSelect,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight
}: {
  card: KanbanCard;
  onSelect: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cardDndId(card.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-40' : ''}>
      <CardSurface card={card} onSelect={onSelect} dragHandleProps={{ ...attributes, ...listeners }} />
      <div className="mt-2 flex gap-2 px-1 sm:hidden">
        <button disabled={!canMoveLeft} onClick={onMoveLeft} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 disabled:opacity-40">
          <ArrowLeft size={14} /> Geri
        </button>
        <button disabled={!canMoveRight} onClick={onMoveRight} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 disabled:opacity-40">
          İleri <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

function CardSurface({
  card,
  onSelect,
  dragHandleProps,
  isOverlay = false
}: {
  card: KanbanCard;
  onSelect?: () => void;
  dragHandleProps?: any;
  isOverlay?: boolean;
}) {
  return (
    <article className={`card-touch-target rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition ${isOverlay ? 'rotate-2 shadow-2xl ring-indigo-200' : 'hover:-translate-y-0.5 hover:shadow-md'}`}>
      <div className="flex items-start gap-3">
        <button className="mt-0.5 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" {...dragHandleProps} aria-label="Kartı sürükle">
          <GripVertical size={16} />
        </button>
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          <h3 className="font-bold leading-5 text-slate-900">{card.title}</h3>
          {card.description ? <p className="mt-2 line-clamp-3 text-sm leading-5 text-slate-500">{card.description}</p> : null}
        </button>
      </div>
    </article>
  );
}