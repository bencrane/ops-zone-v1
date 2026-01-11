'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, List, Plus, Users, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWorkspaceNav } from '@/hooks/use-workspace-nav';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LeadList {
  id: string;
  name: string;
  description: string | null;
  workspace_id: string;
  created_at: string;
  member_count?: number;
}

export default function LeadListsPage() {
  const { workspace, href } = useWorkspaceNav();
  const [lists, setLists] = useState<LeadList[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchLists();
  }, [workspace]);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lead-lists?workspace_id=${workspace}`);
      const json = await res.json();
      if (json.data) {
        setLists(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch lead lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newListName.trim()) return;
    
    setCreating(true);
    try {
      const res = await fetch('/api/lead-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspace_id: workspace,
          name: newListName.trim(),
          description: newListDescription.trim() || null,
        }),
      });
      
      if (res.ok) {
        setCreateOpen(false);
        setNewListName('');
        setNewListDescription('');
        fetchLists();
      }
    } catch (error) {
      console.error('Failed to create list:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/lead-lists/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setDeleteId(null);
        fetchLists();
      }
    } catch (error) {
      console.error('Failed to delete list:', error);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Lead Lists</h1>
            <p className="text-zinc-400 mt-1">Manage saved lead lists for campaigns</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setCreateOpen(true)}
              className="bg-white text-black hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create List
            </Button>
            <Link href={href('/')}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="h-8 w-8 text-zinc-400 animate-spin mb-4" />
            <p className="text-zinc-400">Loading lists...</p>
          </div>
        ) : lists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="p-4 rounded-full bg-zinc-900 mb-4">
              <List className="h-12 w-12 text-zinc-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No Lists Yet</h2>
            <p className="text-zinc-400 max-w-md mb-6">
              Create your first lead list to start organizing your outreach.
            </p>
            <Button 
              onClick={() => setCreateOpen(true)}
              className="bg-white text-black hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First List
            </Button>
          </div>
        ) : (
          <div className="border border-zinc-800 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">Name</TableHead>
                  <TableHead className="text-zinc-400">Description</TableHead>
                  <TableHead className="text-zinc-400 text-center">Leads</TableHead>
                  <TableHead className="text-zinc-400">Created</TableHead>
                  <TableHead className="text-zinc-400 w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lists.map((list) => (
                  <TableRow key={list.id} className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableCell className="font-medium text-white">
                      {list.name}
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {list.description || '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1.5 text-zinc-300">
                        <Users className="h-3.5 w-3.5" />
                        {list.member_count ?? 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-zinc-400">
                      {formatDate(list.created_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(list.id)}
                        className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Create List Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Create Lead List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">List name *</label>
              <Input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="e.g., Q1 Outreach Targets"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Description (optional)</label>
              <Input
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="e.g., SaaS founders in healthcare vertical"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setCreateOpen(false)}
              className="text-zinc-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newListName.trim() || creating}
              className="bg-white text-black hover:bg-zinc-200"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create List'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Delete List?</DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400 text-sm">
            This will permanently delete this lead list and remove all leads from it. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleteId(null)}
              className="text-zinc-400"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={deleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete List'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
