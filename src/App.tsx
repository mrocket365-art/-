import React, { useState, useEffect } from 'react';
import { Item, Category, SubCategory, ActiveTab } from './types';
import {
  loadCategories,
  saveCategories,
  loadSubCategories,
  saveSubCategories,
  loadItems,
  loadItemsAsync,
  saveItems,
  loadItemsFromIDB,
} from './utils/storage';
import { auth, downloadAllFromCloud, uploadAllToCloud } from './utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { CloudSyncModal } from './components/CloudSyncModal';

import { DashboardView } from './views/DashboardView';
import { ItemsListView } from './views/ItemsListView';
import { AddItemForm } from './views/AddItemForm';
import { ItemDetailsModal } from './views/ItemDetailsModal';
import { CategoriesManagerView } from './views/CategoriesManagerView';
import { HiddenItemsView } from './views/HiddenItemsView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  // Search state across screens
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCloudSyncOpen, setIsCloudSyncOpen] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<Item | null>(null);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  // Reload data from storage
  const reloadData = async () => {
    setCategories(loadCategories());
    setSubCategories(loadSubCategories());
    const loadedItems = await loadItemsAsync();
    setItems(loadedItems);
  };

  useEffect(() => {
    reloadData();

    // Background sync when internet connection is restored or available
    const handleSyncOnConnect = async () => {
      if (!navigator.onLine) return;

      const user = auth.currentUser;
      if (!user) return;

      try {
        console.log('Online status active. Starting background auto-sync between IndexedDB and Firestore...');
        const cloudData = await downloadAllFromCloud(user.uid, true);
        if (cloudData && cloudData.items && cloudData.items.length > 0) {
          if (cloudData.categories && cloudData.categories.length > 0) {
            saveCategories(cloudData.categories);
          }
          if (cloudData.subCategories && cloudData.subCategories.length > 0) {
            saveSubCategories(cloudData.subCategories);
          }
          await saveItems(cloudData.items);
          await reloadData();
          console.log('IndexedDB automatically synchronized with Firestore.');
        } else {
          // Push local IndexedDB data to Firestore if cloud is empty
          const categories = loadCategories();
          const subCategories = loadSubCategories();
          const items = await loadItemsAsync();
          if (items && items.length > 0) {
            await uploadAllToCloud(user.uid, items, categories, subCategories, true);
            console.log('Local IndexedDB data uploaded to Firestore.');
          }
        }
      } catch (err) {
        console.warn('Background auto-sync warning:', err);
      }
    };

    const handleOnline = () => {
      handleSyncOnConnect();
    };

    window.addEventListener('online', handleOnline);

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user && navigator.onLine) {
        handleSyncOnConnect();
      }
    });

    if (navigator.onLine) {
      handleSyncOnConnect();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      unsubscribeAuth();
    };
  }, []);

  // Save changes to categories
  const handleAddCategory = (name: string): Category => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      isHidden: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    saveCategories(updated);
    return newCat;
  };

  const handleEditCategory = (id: string, name: string) => {
    const updated = categories.map((c) => (c.id === id ? { ...c, name } : c));
    setCategories(updated);
    saveCategories(updated);
  };

  const handleToggleHideCategory = (id: string) => {
    const updated = categories.map((c) => (c.id === id ? { ...c, isHidden: !c.isHidden } : c));
    setCategories(updated);
    saveCategories(updated);
  };

  const handleDeleteCategory = (id: string) => {
    const updatedCats = categories.filter((c) => c.id !== id);
    const updatedSubCats = subCategories.filter((sc) => sc.categoryId !== id);
    setCategories(updatedCats);
    saveCategories(updatedCats);
    setSubCategories(updatedSubCats);
    saveSubCategories(updatedSubCats);
  };

  // SubCategories
  const handleAddSubCategory = (categoryId: string, name: string): SubCategory => {
    const newSubCat: SubCategory = {
      id: `sub-${Date.now()}`,
      categoryId,
      name,
      isHidden: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [...subCategories, newSubCat];
    setSubCategories(updated);
    saveSubCategories(updated);
    return newSubCat;
  };

  const handleEditSubCategory = (id: string, name: string) => {
    const updated = subCategories.map((sc) => (sc.id === id ? { ...sc, name } : sc));
    setSubCategories(updated);
    saveSubCategories(updated);
  };

  const handleToggleHideSubCategory = (id: string) => {
    const updated = subCategories.map((sc) =>
      sc.id === id ? { ...sc, isHidden: !sc.isHidden } : sc
    );
    setSubCategories(updated);
    saveSubCategories(updated);
  };

  const handleDeleteSubCategory = (id: string) => {
    const updated = subCategories.filter((sc) => sc.id !== id);
    setSubCategories(updated);
    saveSubCategories(updated);
  };

  // Items CRUD & State
  const handleSaveItem = (itemData: Omit<Item, 'id' | 'createdAt'> & { id?: string }) => {
    let updatedItems: Item[];

    if (itemData.id) {
      // Edit mode
      updatedItems = items.map((i) =>
        i.id === itemData.id
          ? {
              ...i,
              ...itemData,
              updatedAt: new Date().toISOString(),
            }
          : i
      );
    } else {
      // Create mode
      const newItem: Item = {
        ...itemData,
        id: `item-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      updatedItems = [newItem, ...items];
    }

    setItems(updatedItems);
    saveItems(updatedItems);

    setItemToEdit(null);
    setActiveTab('items');
  };

  const handleToggleHideItem = (itemId: string) => {
    const updatedItems = items.map((i) => (i.id === itemId ? { ...i, isHidden: !i.isHidden } : i));
    setItems(updatedItems);
    saveItems(updatedItems);

    // Update details modal if open
    if (selectedItemForDetails && selectedItemForDetails.id === itemId) {
      setSelectedItemForDetails({
        ...selectedItemForDetails,
        isHidden: !selectedItemForDetails.isHidden,
      });
    }
  };

  const handleConfirmDeleteItem = () => {
    if (!itemToDelete) return;
    const updated = items.filter((i) => i.id !== itemToDelete.id);
    setItems(updated);
    saveItems(updated);
    setItemToDelete(null);

    if (selectedItemForDetails?.id === itemToDelete.id) {
      setSelectedItemForDetails(null);
    }
  };

  // Handle scanned barcode from camera or manual entry
  const handleScannedBarcode = (scannedCode: string) => {
    setSearchTerm(scannedCode);
    setActiveTab('items');

    // Check if exact match exists
    const exactMatch = items.find(
      (i) => i.barcode.trim().toLowerCase() === scannedCode.trim().toLowerCase()
    );
    if (exactMatch) {
      setSelectedItemForDetails(exactMatch);
    }
  };

  const activeItemsCount = items.filter((i) => !i.isHidden).length;
  const hiddenItemsCount = items.filter((i) => i.isHidden).length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-cairo antialiased flex flex-col md:flex-row dir-rtl transition-colors duration-200">
      {/* Navigation (Sidebar on Desktop, Bottom Bar on Mobile) */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'add-item') setItemToEdit(null);
        }}
        totalItems={activeItemsCount}
        hiddenCount={hiddenItemsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 md:mr-64 flex flex-col min-w-0 min-h-screen">
        {/* Header Bar with Settings Icon shortcut */}
        <Header
          onOpenScanner={() => setIsScannerOpen(true)}
          onAddItem={() => {
            setItemToEdit(null);
            setActiveTab('add-item');
          }}
          onOpenSettings={() => setActiveTab('settings')}
          onOpenCloudSync={() => setIsCloudSyncOpen(true)}
          activeTab={activeTab}
          title={
            activeTab === 'dashboard'
              ? 'الرئيسية'
              : activeTab === 'items'
              ? 'قائمة القطع والبحث'
              : activeTab === 'add-item'
              ? itemToEdit
                ? 'تعديل قطعة'
                : 'إضافة قطعة جديدة'
              : activeTab === 'categories'
              ? 'إدارة الأقسام والفئات'
              : activeTab === 'hidden-items'
              ? 'القطع المخفية'
              : 'الإعدادات والنسخ الاحتياطي'
          }
        />

        {/* Dynamic Views Viewport */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              items={items}
              categories={categories}
              subCategories={subCategories}
              setActiveTab={setActiveTab}
              onSelectItem={(item) => setSelectedItemForDetails(item)}
            />
          )}

          {activeTab === 'items' && (
            <ItemsListView
              items={items}
              categories={categories}
              subCategories={subCategories}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onOpenScanner={() => setIsScannerOpen(true)}
              onSelectItem={(item) => setSelectedItemForDetails(item)}
              onEditItem={(item) => {
                setItemToEdit(item);
                setActiveTab('add-item');
              }}
              onToggleHideItem={handleToggleHideItem}
              onDeleteItem={(item) => setItemToDelete(item)}
              onAddNewItem={() => {
                setItemToEdit(null);
                setActiveTab('add-item');
              }}
            />
          )}

          {activeTab === 'add-item' && (
            <AddItemForm
              categories={categories}
              subCategories={subCategories}
              editingItem={itemToEdit}
              onSave={handleSaveItem}
              onCancel={() => {
                setItemToEdit(null);
                setActiveTab('items');
              }}
              onAddCategory={handleAddCategory}
              onAddSubCategory={handleAddSubCategory}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesManagerView
              categories={categories}
              subCategories={subCategories}
              items={items}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onToggleHideCategory={handleToggleHideCategory}
              onDeleteCategory={handleDeleteCategory}
              onAddSubCategory={handleAddSubCategory}
              onEditSubCategory={handleEditSubCategory}
              onToggleHideSubCategory={handleToggleHideSubCategory}
              onDeleteSubCategory={handleDeleteSubCategory}
            />
          )}

          {activeTab === 'hidden-items' && (
            <HiddenItemsView
              items={items}
              categories={categories}
              subCategories={subCategories}
              onSelectItem={(item) => setSelectedItemForDetails(item)}
              onToggleHideItem={handleToggleHideItem}
              onDeleteItem={(item) => setItemToDelete(item)}
              onBackToItems={() => setActiveTab('items')}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              onReloadData={reloadData}
              onOpenCloudSync={() => setIsCloudSyncOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Cloud Sync Modal */}
      <CloudSyncModal
        isOpen={isCloudSyncOpen}
        onClose={() => setIsCloudSyncOpen(false)}
        onSyncComplete={reloadData}
      />

      {/* Camera Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScannedBarcode}
      />

      {/* Item Details View Modal */}
      <ItemDetailsModal
        item={selectedItemForDetails}
        categories={categories}
        subCategories={subCategories}
        onClose={() => setSelectedItemForDetails(null)}
        onEdit={(item) => {
          setItemToEdit(item);
          setActiveTab('add-item');
        }}
        onToggleHide={handleToggleHideItem}
        onDelete={(item) => setItemToDelete(item)}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!itemToDelete}
        title="تأكيد حذف القطعة"
        message={`هل أنت متأكد من حذف القطعة "${itemToDelete?.name}"؟ لن يمكنك استرجاع بياناتها بعد الحذف.`}
        onConfirm={handleConfirmDeleteItem}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
