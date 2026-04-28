import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { notes, type Note } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Pencil, Check, X } from "lucide-react"

export const Route = createFileRoute("/")({ component: NotesPage })

function NotesPage() {
  const [list, setList] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [newTitle, setNewTitle] = useState("")
  const [newBody, setNewBody] = useState("")
  const [creating, setCreating] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editBody, setEditBody] = useState("")

  async function load() {
    try {
      setList(await notes.list())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const note = await notes.create(newTitle.trim(), newBody.trim())
      setList([note, ...list])
      setNewTitle("")
      setNewBody("")
      toast.success("Note created")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create")
    } finally {
      setCreating(false)
    }
  }

  function startEdit(note: Note) {
    setEditingId(note.id)
    setEditTitle(note.title)
    setEditBody(note.body)
  }

  async function saveEdit(id: number) {
    try {
      const updated = await notes.update(id, { title: editTitle.trim(), body: editBody.trim() })
      setList(list.map((n) => (n.id === id ? updated : n)))
      setEditingId(null)
      toast.success("Note updated")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update")
    }
  }

  async function handleDelete(id: number) {
    try {
      await notes.delete(id)
      setList(list.filter((n) => n.id !== id))
      toast.success("Note deleted")
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete")
    }
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Page header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
        <div>
          <h1 className="text-xl font-semibold text-[#1a1a1a]">Notes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {list.length} note{list.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-8 max-w-2xl w-full mx-auto">
        {/* Create form */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base text-[#1a1a1a]">New Note</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <Input
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <Textarea
                placeholder="Body (optional)"
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                rows={3}
              />
              <Button
                type="submit"
                disabled={creating || !newTitle.trim()}
                className="self-end bg-[#1a1a1a] hover:bg-[#333] text-white rounded-xl px-4"
              >
                <Plus size={16} />
                {creating ? "Creating..." : "Add Note"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {loading && <p className="text-sm text-muted-foreground">Loading notes...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && list.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No notes yet. Create one above.</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {list.map((note) =>
            editingId === note.id ? (
              <Card key={note.id}>
                <CardContent className="flex flex-col gap-3 pt-4">
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  <Textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={3} />
                  <div className="flex gap-2 self-end">
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      <X size={14} />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#1a1a1a] hover:bg-[#333] text-white"
                      onClick={() => saveEdit(note.id)}
                    >
                      <Check size={14} />
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card key={note.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-medium text-[#1a1a1a]">{note.title}</CardTitle>
                    <div className="flex shrink-0 gap-1">
                      <Button size="icon-sm" variant="ghost" onClick={() => startEdit(note)}>
                        <Pencil size={14} />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(note.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {note.body && (
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">{note.body}</p>
                  </CardContent>
                )}
              </Card>
            ),
          )}
        </div>
      </div>
    </div>
  )
}
