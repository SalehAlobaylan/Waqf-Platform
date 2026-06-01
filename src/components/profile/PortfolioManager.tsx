"use client";

import { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, ExternalLink, Code } from "lucide-react";
import { useRouter } from "next/navigation";
import type { PortfolioItem } from "@prisma/client";

// -- Sortable Item Component --
function SortableItem({ id, item, onDelete }: { id: string, item: PortfolioItem, onDelete: (id: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={`flex items-start gap-4 p-4 mb-3 bg-white rounded-xl border ${isDragging ? "border-primary-500 shadow-md" : "border-secondary-200"}`}>
            <button
                type="button"
                className="mt-1 text-secondary-400 hover:text-secondary-700 cursor-grab active:cursor-grabbing"
                {...attributes}
                {...listeners}
            >
                <GripVertical size={20} />
            </button>
            <div className="flex-1">
                <h4 className="font-bold text-secondary-900 flex items-center gap-2">
                    {item.title}
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-secondary-400 hover:text-primary-600">
                        <ExternalLink size={14} />
                    </a>
                </h4>
                {item.description && <p className="text-sm text-secondary-500 mt-1">{item.description}</p>}
                <p className="text-xs text-secondary-400 mt-2 truncate w-64">{item.url}</p>
            </div>
            <button
                type="button"
                onClick={() => onDelete(id)}
                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
}

// -- Main Manager Component --
export function PortfolioManager({ initialItems, locale, contributorId }: { initialItems: PortfolioItem[], locale: string, contributorId: string }) {
    const [items, setItems] = useState(initialItems);
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState({ title: "", description: "", url: "" });
    const router = useRouter();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        setItems(newItems);

        // API Call to reorder
        try {
            await fetch("/api/contributors/portfolio/reorder", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: newItems.map((item, index) => ({ id: item.id, order: index })) })
            });
        } catch (err) {
            console.error(err);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/contributors/portfolio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newItem, order: items.length, contributorId })
            });

            if (res.ok) {
                const added = await res.json();
                setItems([...items, added]);
                setIsAdding(false);
                setNewItem({ title: "", description: "", url: "" });
                router.refresh();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/contributors/portfolio?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setItems(items.filter(i => i.id !== id));
                router.refresh();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-secondary-900">{locale === "ar" ? "معرض الأعمال (Portfolio)" : "Portfolio items"}</h3>
                    <p className="text-sm text-secondary-500 mt-1">{locale === "ar" ? "أضف روابط لمشاريعك السابقة، حساب GitHub، أو أعمالك المميزة." : "Add links to past projects, GitHub repos, or specific contributions."}</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 font-medium rounded-xl hover:bg-primary-100 transition"
                    >
                        <Plus size={18} />
                        {locale === "ar" ? "إضافة عمل" : "Add Item"}
                    </button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="p-4 mb-6 bg-secondary-50 border border-secondary-200 rounded-xl space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">{locale === "ar" ? "عنوان العمل" : "Title"}</label>
                        <input type="text" required value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder="E.g., Quran API wrapper" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">{locale === "ar" ? "الرابط" : "URL"}</label>
                        <input type="url" required value={newItem.url} onChange={e => setNewItem({ ...newItem, url: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder="https://github.com/..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">{locale === "ar" ? "وصف مختصر" : "Short Description"}</label>
                        <input type="text" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-secondary-600 hover:bg-secondary-100 rounded-lg">{locale === "ar" ? "إلغاء" : "Cancel"}</button>
                        <button type="submit" className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">{locale === "ar" ? "إضافة" : "Add"}</button>
                    </div>
                </form>
            )}

            {items.length === 0 && !isAdding ? (
                <div className="text-center py-10 bg-secondary-50 rounded-xl border border-dashed border-secondary-200">
                    <Code className="mx-auto h-10 w-10 text-secondary-300 mb-3" />
                    <p className="text-secondary-500">{locale === "ar" ? "لا يوجد أعمال مضافة حتى الآن" : "No portfolio items added yet"}</p>
                </div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                        {items.map(item => (
                            <SortableItem key={item.id} id={item.id} item={item} onDelete={handleDelete} />
                        ))}
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}
