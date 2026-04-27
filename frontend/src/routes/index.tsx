import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { notes, type Note } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RiAddLine, RiDeleteBinLine, RiEditLine, RiCheckLine, RiCloseLine } from "@remixicon/react"

export const Route = createFileRoute("/")({ component: NotesPage })

function NotesPage() {
  const [list, setList] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Create form
  const [newTitle, setNewTitle] = useState("")
  const [newBody, setNewBody] = useState("")
  const [creating, setCreating] = useState(false)

  // Inline edit state
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
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium">Notes</h1>
        <span className="text-xs text-muted-foreground">{list.length} note{list.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Create form */}
      <Card>
        <CardHeader>
          <CardTitle>New Note</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col gap-2">
            <Input
              placeholder="Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Textarea
              placeholder="Body (optional)"
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              rows={2}
            />
            <Button type="submit" disabled={creating || !newTitle.trim()} className="self-end">
              <RiAddLine />
              {creating ? "Creating..." : "Add"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading && <p className="text-sm text-muted-foreground">Loading notes...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && list.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">No notes yet. Create one above.</p>
      )}

      <div className="flex flex-col gap-3">
        {list.map((note) =>
          editingId === note.id ? (
            <Card key={note.id}>
              <CardContent className="flex flex-col gap-2 pt-4">
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                <Textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={3} />
                <div className="flex gap-2 self-end">
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                    <RiCloseLine />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => saveEdit(note.id)}>
                    <RiCheckLine />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card key={note.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>{note.title}</CardTitle>
                  <div className="flex shrink-0 gap-1">
                    <Button size="icon-sm" variant="ghost" onClick={() => startEdit(note)}>
                      <RiEditLine />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleDelete(note.id)}
                    >
                      <RiDeleteBinLine />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {note.body && (
                <CardContent>
                  <p className="whitespace-pre-wrap text-xs text-muted-foreground">{note.body}</p>
                </CardContent>
              )}
            </Card>
          ),
        )}
      </div>
    </div>
  )
}
