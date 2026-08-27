"use client";

import { useState } from "react";
import { useHrms } from "@/contexts/hrms-context";
import { Asset, AssetCategory } from "@/types/hrms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Upload,
  Package,
  Tag,
} from "lucide-react";
import { formatCurrency, formatDate, generateId } from "@/lib/utils";

const assetStatusColors: Record<string, string> = {
  available: "bg-green-100 text-green-800 border-green-200",
  assigned: "bg-blue-100 text-blue-800 border-blue-200",
  maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
  retired: "bg-gray-100 text-gray-800 border-gray-200",
};

const defaultAssetForm: Omit<Asset, "id" | "createdAt"> = {
  name: "",
  description: "",
  categoryId: "",
  categoryName: "",
  serialNumber: "",
  purchaseDate: "",
  purchasePrice: 0,
  currentValue: 0,
  status: "available",
  assignedToId: "",
  assignedToName: "",
  location: "",
};

const defaultCategoryForm: Omit<AssetCategory, "id" | "createdAt" | "assetCount"> = {
  name: "",
  description: "",
  depreciationRate: 0,
  isActive: true,
};

export default function AssetManagement() {
  const {
    assets,
    addAsset,
    updateAsset,
    deleteAsset,
    assetCategories,
    addAssetCategory,
    updateAssetCategory,
    deleteAssetCategory,
    employees,
  } = useHrms();

  const [activeTab, setActiveTab] = useState("assets");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Asset dialog state
  const [assetForm, setAssetForm] = useState(defaultAssetForm);
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [deleteAssetId, setDeleteAssetId] = useState<string | null>(null);
  const [bulkAssetOpen, setBulkAssetOpen] = useState(false);
  const [bulkAssetCsv, setBulkAssetCsv] = useState("");

  // Category dialog state
  const [categoryForm, setCategoryForm] = useState(defaultCategoryForm);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [bulkCategoryOpen, setBulkCategoryOpen] = useState(false);
  const [bulkCategoryCsv, setBulkCategoryCsv] = useState("");

  const filteredAssets = assets.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      a.location.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredCategories = assetCategories.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
  );

  const openCreateAsset = () => {
    setEditingAssetId(null);
    setAssetForm(defaultAssetForm);
    setAssetDialogOpen(true);
  };

  const openEditAsset = (asset: Asset) => {
    setEditingAssetId(asset.id);
    setAssetForm({
      name: asset.name,
      description: asset.description,
      categoryId: asset.categoryId,
      categoryName: asset.categoryName,
      serialNumber: asset.serialNumber,
      purchaseDate: asset.purchaseDate,
      purchasePrice: asset.purchasePrice,
      currentValue: asset.currentValue,
      status: asset.status,
      assignedToId: asset.assignedToId || "",
      assignedToName: asset.assignedToName || "",
      location: asset.location,
    });
    setAssetDialogOpen(true);
  };

  const saveAsset = () => {
    const catName = assetCategories.find((c) => c.id === assetForm.categoryId)?.name || "";
    const empName = employees.find((e) => e.id === assetForm.assignedToId);
    const data = { ...assetForm, categoryName: catName, assignedToName: empName ? `${empName.firstName} ${empName.lastName}` : "" };
    if (editingAssetId) {
      updateAsset(editingAssetId, data);
    } else {
      addAsset({ ...data, createdAt: new Date().toISOString() });
    }
    setAssetDialogOpen(false);
  };

  const handleBulkAssets = () => {
    const lines = bulkAssetCsv.trim().split("\n");
    lines.forEach((line) => {
      const [name, description, serialNumber, purchaseDate, purchasePrice, currentValue, status, location] = line.split(",").map((s) => s.trim());
      if (name) {
        addAsset({
          name,
          description: description || "",
          categoryId: "",
          categoryName: "",
          serialNumber: serialNumber || "",
          purchaseDate: purchaseDate || "",
          purchasePrice: Number(purchasePrice) || 0,
          currentValue: Number(currentValue) || 0,
          status: (status as Asset["status"]) || "available",
          location: location || "",
          createdAt: new Date().toISOString(),
        });
      }
    });
    setBulkAssetCsv("");
    setBulkAssetOpen(false);
  };

  const openCreateCategory = () => {
    setEditingCategoryId(null);
    setCategoryForm(defaultCategoryForm);
    setCategoryDialogOpen(true);
  };

  const openEditCategory = (cat: AssetCategory) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({ name: cat.name, description: cat.description, depreciationRate: cat.depreciationRate, isActive: cat.isActive });
    setCategoryDialogOpen(true);
  };

  const saveCategory = () => {
    if (editingCategoryId) {
      updateAssetCategory(editingCategoryId, categoryForm);
    } else {
      addAssetCategory({ ...categoryForm, createdAt: new Date().toISOString(), assetCount: 0 });
    }
    setCategoryDialogOpen(false);
  };

  const handleBulkCategories = () => {
    const lines = bulkCategoryCsv.trim().split("\n");
    lines.forEach((line) => {
      const [name, description, depreciationRate] = line.split(",").map((s) => s.trim());
      if (name) {
        addAssetCategory({ name, description: description || "", depreciationRate: Number(depreciationRate) || 0, isActive: true, createdAt: new Date().toISOString(), assetCount: 0 });
      }
    });
    setBulkCategoryCsv("");
    setBulkCategoryOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Asset Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="categories">Asset Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="space-y-4 mt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search assets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setBulkAssetOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Bulk Upload
                </Button>
                <Button size="sm" onClick={openCreateAsset}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Asset
                </Button>
              </div>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Serial #</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Current Value</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                        No assets found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.name}</TableCell>
                        <TableCell>{asset.categoryName || "—"}</TableCell>
                        <TableCell className="font-mono text-sm">{asset.serialNumber}</TableCell>
                        <TableCell>{formatDate(asset.purchaseDate)}</TableCell>
                        <TableCell>{formatCurrency(asset.purchasePrice)}</TableCell>
                        <TableCell>{formatCurrency(asset.currentValue)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={assetStatusColors[asset.status]}>
                            {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{asset.assignedToName || "—"}</TableCell>
                        <TableCell>{asset.location}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditAsset(asset)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteAssetId(asset.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4 mt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search categories..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setBulkCategoryOpen(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Bulk Upload
                </Button>
                <Button size="sm" onClick={openCreateCategory}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Depreciation Rate (%)</TableHead>
                    <TableHead>Asset Count</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No categories found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((cat) => (
                      <TableRow key={cat.id}>
                        <TableCell className="font-medium">{cat.name}</TableCell>
                        <TableCell>{cat.description}</TableCell>
                        <TableCell>{cat.depreciationRate}%</TableCell>
                        <TableCell>{cat.assetCount}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cat.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}>
                            {cat.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditCategory(cat)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteCategoryId(cat.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Asset Create/Edit Dialog */}
        <Dialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAssetId ? "Edit Asset" : "Create Asset"}</DialogTitle>
              <DialogDescription>{editingAssetId ? "Update asset details." : "Add a new asset to the system."}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Name</Label>
                <Input value={assetForm.name} onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })} placeholder="Asset name" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea value={assetForm.description} onChange={(e) => setAssetForm({ ...assetForm, description: e.target.value })} placeholder="Description" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={assetForm.categoryId} onValueChange={(v) => setAssetForm({ ...assetForm, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {assetCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Serial Number</Label>
                <Input value={assetForm.serialNumber} onChange={(e) => setAssetForm({ ...assetForm, serialNumber: e.target.value })} placeholder="Serial number" />
              </div>
              <div className="space-y-2">
                <Label>Purchase Date</Label>
                <Input type="date" value={assetForm.purchaseDate} onChange={(e) => setAssetForm({ ...assetForm, purchaseDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Purchase Price</Label>
                <Input type="number" value={assetForm.purchasePrice || ""} onChange={(e) => setAssetForm({ ...assetForm, purchasePrice: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Current Value</Label>
                <Input type="number" value={assetForm.currentValue || ""} onChange={(e) => setAssetForm({ ...assetForm, currentValue: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={assetForm.status} onValueChange={(v) => setAssetForm({ ...assetForm, status: v as Asset["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assigned To</Label>
                <Select value={assetForm.assignedToId} onValueChange={(v) => setAssetForm({ ...assetForm, assignedToId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Location</Label>
                <Input value={assetForm.location} onChange={(e) => setAssetForm({ ...assetForm, location: e.target.value })} placeholder="Physical location" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssetDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveAsset}>{editingAssetId ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Asset Delete Confirmation */}
        <Dialog open={!!deleteAssetId} onOpenChange={(open) => !open && setDeleteAssetId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Asset</DialogTitle>
              <DialogDescription>Are you sure you want to delete this asset? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteAssetId(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (deleteAssetId) deleteAsset(deleteAssetId);
                  setDeleteAssetId(null);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Asset Bulk Upload */}
        <Dialog open={bulkAssetOpen} onOpenChange={setBulkAssetOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Bulk Upload Assets</DialogTitle>
              <DialogDescription>Paste CSV data (columns: name, description, serialNumber, purchaseDate, purchasePrice, currentValue, status, location).</DialogDescription>
            </DialogHeader>
            <Textarea rows={8} value={bulkAssetCsv} onChange={(e) => setBulkAssetCsv(e.target.value)} placeholder="name, description, serial, date, price, value, status, location" />
            <DialogFooter>
              <Button variant="outline" onClick={() => setBulkAssetOpen(false)}>Cancel</Button>
              <Button onClick={handleBulkAssets}>Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Category Create/Edit Dialog */}
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategoryId ? "Edit Category" : "Create Category"}</DialogTitle>
              <DialogDescription>{editingCategoryId ? "Update category details." : "Add a new asset category."}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="Category name" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} placeholder="Description" />
              </div>
              <div className="space-y-2">
                <Label>Depreciation Rate (%)</Label>
                <Input type="number" value={categoryForm.depreciationRate || ""} onChange={(e) => setCategoryForm({ ...categoryForm, depreciationRate: Number(e.target.value) })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch checked={categoryForm.isActive} onCheckedChange={(v) => setCategoryForm({ ...categoryForm, isActive: v })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>Cancel</Button>
              <Button onClick={saveCategory}>{editingCategoryId ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Category Delete Confirmation */}
        <Dialog open={!!deleteCategoryId} onOpenChange={(open) => !open && setDeleteCategoryId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription>Are you sure you want to delete this category? This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteCategoryId(null)}>Cancel</Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (deleteCategoryId) deleteAssetCategory(deleteCategoryId);
                  setDeleteCategoryId(null);
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Category Bulk Upload */}
        <Dialog open={bulkCategoryOpen} onOpenChange={setBulkCategoryOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Bulk Upload Categories</DialogTitle>
              <DialogDescription>Paste CSV data (columns: name, description, depreciationRate).</DialogDescription>
            </DialogHeader>
            <Textarea rows={8} value={bulkCategoryCsv} onChange={(e) => setBulkCategoryCsv(e.target.value)} placeholder="name, description, depreciationRate" />
            <DialogFooter>
              <Button variant="outline" onClick={() => setBulkCategoryOpen(false)}>Cancel</Button>
              <Button onClick={handleBulkCategories}>Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
