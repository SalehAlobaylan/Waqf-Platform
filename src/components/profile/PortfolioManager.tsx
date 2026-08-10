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
import { GripVertical, Plus, Trash2, SquareArrowOutUpRight, Code } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { PortfolioItem } from "@prisma/client";
import { apiFetch } from "@/lib/api/client";
import { toast } from "@/lib/toast";
import { translateApiError } from "@/lib/i18n/client-errors";

// -- Sortable Item Component --
function SortableItem({ id, item, onDelete }: { id: string; item: PortfolioItem; onDelete: (id: string) => void }) {
    const t = useTranslations("profile.edit");
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
                aria-label={t("dragHandle")}
                className="mt-1 text-secondary-400 hover:text-secondary-700 cursor-grab active:cursor-grabbing"
                {...attributes}
                {...listeners}
            >
                <GripVertical size={20} />
            </button>
            <div className="flex-1">
                <h4 className="font-bold text-secondary-900 flex items-center gap-2">
                    {item.title}
                    <a href={item.url} target="_blank" rel="noopener noreferrer" aria-label={item.title} className="text-secondary-400 hover:text-primary-600">
                        <SquareArrowOutUpRight size={14} />
                    </a>
                </h4>
                {item.description && <p className="text-sm text-secondary-500 mt-1">{item.description}</p>}
                <p className="text-xs text-secondary-400 mt-2 truncate w-64">{item.url}</p>
            </div>
            <button
                type="button"
                onClick={() => onDelete(id)}
                aria-label={t("deleteItem")}
                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
}

// -- Main Manager Component --
export function PortfolioManager({ initialItems, locale, contributorId }: { initialItems: PortfolioItem[]; locale: string; contributorId: string }) {
    const t = useTranslations("profile.edit");
    const tGlobal = useTranslations();
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
            await apiFetch("/api/contributors/portfolio/reorder", {
                method: "PUT",
                body: { items: newItems.map((item, index) => ({ id: item.id, order: index })) }
            });
        } catch (err) {
            setItems(items);
            toast.error(translateApiError(tGlobal, err));
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const added = await apiFetch<PortfolioItem>("/api/contributors/portfolio", {
                method: "POST",
                body: { ...newItem, order: items.length, contributorId }
            });
            setItems([...items, added]);
            setIsAdding(false);
            setNewItem({ title: "", description: "", url: "" });
            router.refresh();
        } catch (err) {
            toast.error(translateApiError(tGlobal, err));
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await apiFetch(`/api/contributors/portfolio`, {
                method: "DELETE",
                query: { id },
            });
            setItems(items.filter(i => i.id !== id));
            router.refresh();
        } catch (err) {
            toast.error(translateApiError(tGlobal, err));
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-secondary-900">{t("portfolio")}</h3>
                    <p className="text-sm text-secondary-500 mt-1">{t("portfolioDescription")}</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 font-medium rounded-xl hover:bg-primary-100 transition"
                    >
                        <Plus size={18} />
                        {t("addItem")}
                    </button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="p-4 mb-6 bg-secondary-50 border border-secondary-200 rounded-xl space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">{t("itemTitle")}</label>
                        <input type="text" required value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder={t("itemTitlePlaceholder")} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">{t("itemUrl")}</label>
                        <input type="url" required value={newItem.url} onChange={e => setNewItem({ ...newItem, url: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder={t("itemUrlPlaceholder")} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">{t("itemDescription")}</label>
                        <input type="text" value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-secondary-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" placeholder={t("itemDescriptionPlaceholder")} />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-secondary-600 hover:bg-secondary-100 rounded-lg">{t("cancel")}</button>
                        <button type="submit" className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">{t("addItem")}</button>
                    </div>
                </form>
            )}

            {items.length === 0 && !isAdding ? (
                <div className="text-center py-10 bg-secondary-50 rounded-xl border border-dashed border-secondary-200">
                    <Code className="mx-auto h-10 w-10 text-secondary-300 mb-3" />
                    <p className="text-secondary-500">{t("noSkills")}</p>
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
